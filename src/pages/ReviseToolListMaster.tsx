import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit3, Save, ArrowUpDown, FileSpreadsheet, FileText, ArrowLeft,
  GripVertical, Plus, Upload, Trash2, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Layout } from '@/components/layout/Layout';
import { useToolStore } from '@/stores/toolStore';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { cn } from '@/lib/utils';

interface RevisedTool {
  id: string;
  lineNo: string;
  model: string;
  modelType: string;
  partNo: string;
  processNo: string;
  machinePoint: string;
  item: number;
  toolType: string;
  toolCode: string;
  qty: number;
  maker: string;
  supplier: string;
  dwgNo: string;
  qtyRegrind: number;
  dwgNoRegrind: string;
  toolLife: string;
  kanban: string;
  set: string;
  kanbanOn: string;
  toolConner: string;
  machineMaker: string;
  machineNo: string;
  preSetLength: string;
  preSetWidth: string;
  order: number;
}

const STORAGE_KEY = 'tooling-revise-data';

export function ReviseToolListMaster() {
  const navigate = useNavigate();
  const { toolLists, updateToolList } = useToolStore();
  const [tools, setTools] = useState<RevisedTool[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [filterLineNo, setFilterLineNo] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTool, setNewTool] = useState<Partial<RevisedTool>>({});

  // #15: Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTools(parsed);
          return;
        }
      } catch { /* ignore */ }
    }
  }, []);

  // #15: Auto-save to localStorage
  useEffect(() => {
    if (tools.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
    }
  }, [tools]);

  // Available line numbers and models from existing data
  const lineNos = useMemo(() => [...new Set(toolLists.map(t => t.lineNo).filter(Boolean))], [toolLists]);
  const models = useMemo(() => [...new Set(toolLists.map(t => t.model).filter(Boolean))], [toolLists]);

  // #13: Load by Line No. + Model
  const loadByFilter = () => {
    let filtered = toolLists;
    if (filterLineNo) filtered = filtered.filter(t => t.lineNo === filterLineNo);
    if (filterModel) filtered = filtered.filter(t => t.model === filterModel);
    if (filtered.length === 0) {
      toast.error('ไม่พบข้อมูลตามเงื่อนไข');
      return;
    }
    const loaded: RevisedTool[] = filtered.map((list, i) => ({
      id: list.id,
      lineNo: list.lineNo,
      model: list.model || '',
      modelType: '',
      partNo: '',
      processNo: list.processNo || '',
      machinePoint: list.machinePoint || '',
      item: i + 1,
      toolType: list.toolType,
      toolCode: list.toolCode,
      qty: list.qtyToolNew,
      maker: list.makerToolNew,
      supplier: list.supplierToolNew,
      dwgNo: list.dwgNoToolNew,
      qtyRegrind: list.qtyRegrind,
      dwgNoRegrind: list.dwgNoRegrind,
      toolLife: list.toolLife,
      kanban: list.kanban,
      set: list.set,
      kanbanOn: list.kanbanOn,
      toolConner: list.toolConner,
      machineMaker: list.machineMaker,
      machineNo: list.machineNo,
      preSetLength: list.preSetLength,
      preSetWidth: list.preSetWidth,
      order: i,
    }));
    setTools(loaded);
    toast.success(`โหลด ${loaded.length} รายการ`);
  };

  // #15: Fix drag reorder - prevent ghost duplicates by using onDrop
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedItem || draggedItem === targetId) { setDraggedItem(null); return; }
    setTools(prev => {
      const arr = [...prev];
      const fromIdx = arr.findIndex(t => t.id === draggedItem);
      const toIdx = arr.findIndex(t => t.id === targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      const [moved] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, moved);
      return arr.map((t, i) => ({ ...t, order: i, item: i + 1 }));
    });
    setDraggedItem(null);
  };
  const handleDragEnd = () => setDraggedItem(null);

  // #14: Add new row
  const handleAddRow = () => {
    const tool: RevisedTool = {
      id: Date.now().toString(),
      lineNo: filterLineNo || '', model: filterModel || '',
      modelType: '', partNo: '',
      processNo: newTool.processNo || '', machinePoint: newTool.machinePoint || '',
      item: tools.length + 1,
      toolType: newTool.toolType || '', toolCode: newTool.toolCode || '',
      qty: newTool.qty || 1, maker: newTool.maker || '',
      supplier: newTool.supplier || '', dwgNo: newTool.dwgNo || '',
      qtyRegrind: 0, dwgNoRegrind: '', toolLife: newTool.toolLife || '',
      kanban: '', set: 'A', kanbanOn: 'OFF', toolConner: '',
      machineMaker: '', machineNo: newTool.machineNo || '',
      preSetLength: '', preSetWidth: '', order: tools.length,
    };
    setTools([...tools, tool]);
    setShowAddDialog(false);
    setNewTool({});
    toast.success('เพิ่มรายการใหม่');
  };

  const deleteRow = (id: string) => {
    setTools(prev => prev.filter(t => t.id !== id).map((t, i) => ({ ...t, order: i })));
  };

  // #13: Import from Excel
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const json = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[wb.SheetNames[0]]);
        const imported: RevisedTool[] = json.map((row, i) => ({
          id: `imp-${Date.now()}-${i}`,
          lineNo: row['LINE NO'] || row['lineNo'] || filterLineNo || '',
          model: row['MODEL'] || row['model'] || filterModel || '',
          modelType: row['MODEL TYPE'] || '', partNo: row['PART NO'] || '',
          processNo: row['PROCESS NO'] || row['PROCESS NO.'] || '',
          machinePoint: row['MACHINE POINT'] || '',
          item: row['ITEM'] || i + 1,
          toolType: row['TOOL TYPE'] || '',
          toolCode: row['TOOL CODE'] || '',
          qty: parseInt(row["Q'TY"] || row['QTY']) || 1,
          maker: row['MAKER'] || row['MAKER '] || '',
          supplier: row['SUPPLIER'] || row[' SUPPLIER'] || '',
          dwgNo: row['DWG NO'] || row['DWG NO.'] || '',
          qtyRegrind: parseInt(row["Q'TY REGRIND"]) || 0,
          dwgNoRegrind: row['DWG NO REGRIND'] || '',
          toolLife: String(row['TOOL (LIFE)'] || row['TOOL LIFE'] || ''),
          kanban: row['KANBAN'] || '', set: row['SET'] || 'A',
          kanbanOn: row['KANBAN ON'] || 'OFF',
          toolConner: String(row['TOOL (CONNER )'] || row['TOOL CONNER'] || ''),
          machineMaker: row['MACHINE MAKER'] || '',
          machineNo: row['M/C NO'] || row['M/C No.'] || '',
          preSetLength: String(row['PRE-SET L'] || row['PRE - SET L'] || ''),
          preSetWidth: String(row['PRE-SET D'] || row['PRE - SET D'] || ''),
          order: tools.length + i,
        }));
        setTools(prev => [...prev, ...imported]);
        toast.success(`นำเข้า ${imported.length} รายการ`);
      } catch { toast.error('อ่านไฟล์ไม่สำเร็จ'); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (tools.length === 0) { toast.error('ไม่มีข้อมูลที่จะบันทึก'); return; }
    setIsSaving(true);
    try {
      tools.forEach(tool => {
        if (tool.id.startsWith('imp-') || tool.id.startsWith(Date.now().toString().substring(0, 5))) return;
        updateToolList(tool.id, {
          lineNo: tool.lineNo, toolType: tool.toolType, toolCode: tool.toolCode,
          qtyToolNew: tool.qty, makerToolNew: tool.maker, supplierToolNew: tool.supplier,
          dwgNoToolNew: tool.dwgNo, qtyRegrind: tool.qtyRegrind, dwgNoRegrind: tool.dwgNoRegrind,
          toolLife: tool.toolLife, kanban: tool.kanban, set: tool.set, kanbanOn: tool.kanbanOn,
          toolConner: tool.toolConner, machineMaker: tool.machineMaker, machineNo: tool.machineNo,
          preSetLength: tool.preSetLength, preSetWidth: tool.preSetWidth,
        });
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
      toast.success(`บันทึก ${tools.length} รายการสำเร็จ`);
    } catch { toast.error('เกิดข้อผิดพลาด'); } finally { setIsSaving(false); }
  };

  const handleExportExcel = () => {
    if (tools.length === 0) { toast.error('ไม่มีข้อมูล'); return; }
    const data = tools.map(t => ({
      'LINE NO': t.lineNo, 'MODEL': t.model, 'PROCESS NO': t.processNo,
      'MACHINE POINT': t.machinePoint, 'ITEM': t.item, 'TOOL TYPE': t.toolType,
      'TOOL CODE': t.toolCode, "Q'TY": t.qty, 'MAKER': t.maker,
      'SUPPLIER': t.supplier, 'DWG NO': t.dwgNo, "Q'TY REGRIND": t.qtyRegrind,
      'DWG NO REGRIND': t.dwgNoRegrind, 'TOOL LIFE': t.toolLife,
      'SET': t.set, 'M/C NO': t.machineNo,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Revised Tool List');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf]), `Revised_Tool_List_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('ส่งออก Excel สำเร็จ');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/tool-list')}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Revise Current Tool List Master</h1>
              <p className="text-slate-500">แก้ไขและจัดเรียงรายการเครื่องมือ</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleExportExcel}><FileSpreadsheet className="mr-2 h-4 w-4" />Export Excel</Button>
            <Button onClick={handleSave} disabled={isSaving}><Save className="mr-2 h-4 w-4" />{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}</Button>
          </div>
        </div>

        {/* #13: Filter by Line No. + Model */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-end gap-4">
              <div className="space-y-1">
                <Label className="text-sm">Line No.</Label>
                <Select value={filterLineNo} onValueChange={setFilterLineNo}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="เลือก Line" /></SelectTrigger>
                  <SelectContent>{lineNos.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Model</Label>
                <Select value={filterModel} onValueChange={setFilterModel}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="เลือก Model" /></SelectTrigger>
                  <SelectContent>{models.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button onClick={loadByFilter}><Search className="mr-2 h-4 w-4" />โหลดข้อมูล</Button>
              <label>
                <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />
                <Button variant="outline" asChild><span><Upload className="mr-2 h-4 w-4" />Import Excel</span></Button>
              </label>
              <Button variant="outline" onClick={() => setShowAddDialog(true)}><Plus className="mr-2 h-4 w-4" />เพิ่มแถว</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>รายการเครื่องมือ</span>
              <Badge>{tools.length} รายการ</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 sticky top-0">
                  <tr>
                    <th className="px-2 py-2 w-10"></th>
                    <th className="px-2 py-2 text-left">#</th>
                    <th className="px-2 py-2 text-left">Line No.</th>
                    <th className="px-2 py-2 text-left">Process</th>
                    <th className="px-2 py-2 text-left">Tool Code</th>
                    <th className="px-2 py-2 text-left">Tool Type</th>
                    <th className="px-2 py-2 text-left">QTY</th>
                    <th className="px-2 py-2 text-left">Maker</th>
                    <th className="px-2 py-2 text-left">M/C No.</th>
                    <th className="px-2 py-2 text-left">Tool Life</th>
                    <th className="px-2 py-2 text-left">Set</th>
                    <th className="px-2 py-2 text-center w-16">ลบ</th>
                  </tr>
                </thead>
                <tbody>
                  {tools.map((tool, index) => (
                    <tr
                      key={tool.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, tool.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, tool.id)}
                      onDragEnd={handleDragEnd}
                      className={cn("border-t cursor-move hover:bg-slate-50", draggedItem === tool.id && "opacity-50 bg-blue-50")}
                    >
                      <td className="px-2 py-2"><GripVertical className="h-4 w-4 text-slate-400" /></td>
                      <td className="px-2 py-2 text-slate-500">{index + 1}</td>
                      <td className="px-2 py-2">{tool.lineNo}</td>
                      <td className="px-2 py-2">{tool.processNo}</td>
                      <td className="px-2 py-2 font-medium">{tool.toolCode}</td>
                      <td className="px-2 py-2">{tool.toolType}</td>
                      <td className="px-2 py-2">{tool.qty}</td>
                      <td className="px-2 py-2">{tool.maker}</td>
                      <td className="px-2 py-2">{tool.machineNo}</td>
                      <td className="px-2 py-2">{tool.toolLife}</td>
                      <td className="px-2 py-2">{tool.set}</td>
                      <td className="px-2 py-2 text-center">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => deleteRow(tool.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {tools.length === 0 && (
                    <tr><td colSpan={12} className="text-center py-12 text-slate-400">
                      <ArrowUpDown className="mx-auto h-12 w-12 mb-4" />
                      <p>ยังไม่มีข้อมูล</p>
                      <p className="text-sm">เลือก Line No. + Model แล้วกด "โหลดข้อมูล" หรือ "Import Excel"</p>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* #14: Add new row dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader><DialogTitle>เพิ่มรายการใหม่</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Process No.</Label><Input value={newTool.processNo || ''} onChange={e => setNewTool({ ...newTool, processNo: e.target.value })} placeholder="OP1" /></div>
              <div className="space-y-2"><Label>Tool Code</Label><Input value={newTool.toolCode || ''} onChange={e => setNewTool({ ...newTool, toolCode: e.target.value })} placeholder="SAD-001" /></div>
              <div className="space-y-2"><Label>Tool Type</Label><Input value={newTool.toolType || ''} onChange={e => setNewTool({ ...newTool, toolType: e.target.value })} placeholder="DRILL" /></div>
              <div className="space-y-2"><Label>QTY</Label><Input type="number" value={newTool.qty || 1} onChange={e => setNewTool({ ...newTool, qty: parseInt(e.target.value) || 1 })} /></div>
              <div className="space-y-2"><Label>Maker</Label><Input value={newTool.maker || ''} onChange={e => setNewTool({ ...newTool, maker: e.target.value })} /></div>
              <div className="space-y-2"><Label>M/C No.</Label><Input value={newTool.machineNo || ''} onChange={e => setNewTool({ ...newTool, machineNo: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>ยกเลิก</Button>
              <Button onClick={handleAddRow}>เพิ่ม</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
