import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode, Plus, Copy, Trash2, Save, Search, RotateCcw, Image as ImageIcon, Check, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout } from '@/components/layout/Layout';
import { useToolStore } from '@/stores/toolStore';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ToolListRow {
  id: string;
  lineNo: string;
  caliperType: string;
  model: string;
  processNo: string;
  type: string;
  spindle: string;
  machinePoint: string;
  toolType: string;
  toolCode: string;
  qtyToolNew: number;
  makerToolNew: string;
  supplierToolNew: string;
  dwgNoToolNew: string;
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
  qrCodeNew: string;
  qrCodeRegrind: string;
}

const createEmptyRow = (): ToolListRow => ({
  id: Math.random().toString(36).substr(2, 9),
  lineNo: '', caliperType: '', model: '', processNo: '', type: '', spindle: '',
  machinePoint: '', toolType: '', toolCode: '', qtyToolNew: 0, makerToolNew: '',
  supplierToolNew: '', dwgNoToolNew: '', qtyRegrind: 0, dwgNoRegrind: '',
  toolLife: '', kanban: '', set: 'A', kanbanOn: 'OFF', toolConner: '',
  machineMaker: '', machineNo: '', preSetLength: '', preSetWidth: '',
  qrCodeNew: '', qrCodeRegrind: ''
});

const STORAGE_KEY = 'tooling-register-qr-rows';

const defaultColumns = [
  { key: 'lineNo', label: 'Line No.', type: 'text', minW: 80 },
  { key: 'caliperType', label: 'Caliper Type', type: 'dropdown', minW: 110 },
  { key: 'model', label: 'Model', type: 'dropdown', minW: 110 },
  { key: 'processNo', label: 'Process No.', type: 'dropdown', minW: 100 },
  { key: 'type', label: 'Type', type: 'dropdown', minW: 70 },
  { key: 'spindle', label: 'Spindle', type: 'dropdown', minW: 80 },
  { key: 'machinePoint', label: 'Machine Point', type: 'text', minW: 130 },
  { key: 'toolType', label: 'Tool Type', type: 'readonly', minW: 100 },
  { key: 'toolCode', label: 'Tool Code', type: 'toolCodeSelect', minW: 150 },
  { key: 'qtyToolNew', label: "Q'TY New", type: 'number', minW: 65 },
  { key: 'makerToolNew', label: 'Maker', type: 'readonly', minW: 100 },
  { key: 'supplierToolNew', label: 'Supplier', type: 'readonly', minW: 100 },
  { key: 'dwgNoToolNew', label: 'DWG No.', type: 'readonly', minW: 120 },
  { key: 'qtyRegrind', label: "Q'TY Regrind", type: 'number', minW: 75 },
  { key: 'dwgNoRegrind', label: 'DWG Regrind', type: 'text', minW: 110 },
  { key: 'toolLife', label: 'Tool Life', type: 'text', minW: 80 },
  { key: 'kanban', label: 'Kanban', type: 'text', minW: 80 },
  { key: 'set', label: 'Set', type: 'setToggle', minW: 60 },
  { key: 'kanbanOn', label: 'Kanban On', type: 'kanbanToggle', minW: 85 },
  { key: 'toolConner', label: 'Tool Conner', type: 'dropdown', minW: 90 },
  { key: 'machineMaker', label: 'Machine Maker', type: 'dropdown', minW: 110 },
  { key: 'machineNo', label: 'M/C No.', type: 'dropdown', minW: 90 },
  { key: 'preSetLength', label: 'Pre-Set L', type: 'presetInput', minW: 90 },
  { key: 'preSetWidth', label: 'Pre-Set D', type: 'presetInput', minW: 90 },
];

const SET_OPTIONS = ['A', 'B', 'C', 'D', 'E'];

export function RegisterToolCodeQR() {
  const navigate = useNavigate();
  const { toolCodes, addToolList, generateQRCodes, toolLists } = useToolStore();
  const { categories } = useMasterDataStore();
  const { user } = useAuthStore();

  // Load saved rows from localStorage
  const [rows, setRows] = useState<ToolListRow[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [createEmptyRow()];
  });

  const [isSaving, setIsSaving] = useState(false);
  const [toolCodeSearch, setToolCodeSearch] = useState('');
  const [showToolCodeDialog, setShowToolCodeDialog] = useState(false);
  const [currentRowIndex, setCurrentRowIndex] = useState<number | null>(null);

  // Auto-save rows to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  }, [rows]);

  const getDropdownItems = (key: string): string[] => {
    const map: Record<string, string> = {
      caliperType: 'caliperTypes', model: 'models', type: 'types', spindle: 'spindles',
      machinePoint: 'machinePoints', toolType: 'toolTypes', makerToolNew: 'makers',
      supplierToolNew: 'suppliers', toolConner: 'toolConners', machineMaker: 'machineMakers',
      machineNo: 'machineNos', processNo: 'processNames',
    };
    const cat = categories.find(c => c.name === map[key]);
    return cat?.items || [];
  };

  const filteredToolCodes = toolCodes.filter(t =>
    t.codeType === 'ORIGINAL' &&
    (t.toolCode.toLowerCase().includes(toolCodeSearch.toLowerCase()) ||
      t.toolType.toLowerCase().includes(toolCodeSearch.toLowerCase()) ||
      t.maker.toLowerCase().includes(toolCodeSearch.toLowerCase()))
  );

  // #7: Auto-fill ALL fields when selecting tool code
  const handleToolCodeSelect = (rowIndex: number, toolCode: string) => {
    const tool = toolCodes.find(t => t.toolCode === toolCode);
    if (tool) {
      const newRows = [...rows];
      newRows[rowIndex] = {
        ...newRows[rowIndex],
        toolCode: tool.toolCode,
        toolType: tool.toolType,
        makerToolNew: tool.maker,
        supplierToolNew: tool.supplier,
        dwgNoToolNew: tool.dwgNo,
        machineNo: tool.machineNo,
        lineNo: tool.lineNo || newRows[rowIndex].lineNo,
      };
      setRows(newRows);
    }
    setShowToolCodeDialog(false);
  };

  const addRow = () => { setRows([...rows, createEmptyRow()]); };
  const deleteRow = (i: number) => {
    if (rows.length <= 1) { toast.warning('ต้องมีอย่างน้อย 1 แถว'); return; }
    setRows(rows.filter((_, idx) => idx !== i));
  };
  const copyRow = (i: number) => {
    const copy = { ...rows[i], id: Math.random().toString(36).substr(2, 9) };
    const nr = [...rows]; nr.splice(i + 1, 0, copy); setRows(nr);
  };
  const updateRow = (i: number, field: keyof ToolListRow, value: any) => {
    const nr = [...rows]; nr[i] = { ...nr[i], [field]: value }; setRows(nr);
  };

  // #9: Fix save - save to toolStore with real persistence
  const handleSave = async (): Promise<string[]> => {
    const hasData = rows.some(r => r.toolCode || r.processNo || r.lineNo);
    if (!hasData) {
      toast.error('กรุณากรอกข้อมูลอย่างน้อย 1 แถว');
      return [];
    }
    setIsSaving(true);
    const savedIds: string[] = [];
    let skipped = 0;

    for (const row of rows) {
      if (!row.toolCode) continue;

      // ── Full-row duplicate detection (ทุก column เหมือนกัน 100%) ──
      const existingDup = toolLists.find(tl =>
        tl.toolCode === row.toolCode && tl.lineNo === row.lineNo &&
        tl.set === row.set && tl.machineNo === row.machineNo &&
        tl.model === row.model && tl.toolLife === row.toolLife &&
        tl.processNo === row.processNo && tl.toolType === row.toolType &&
        tl.qtyToolNew === row.qtyToolNew && tl.makerToolNew === row.makerToolNew
      );
      if (existingDup && (existingDup.kanban || existingDup.qrCodeNew)) {
        toast.error(`ข้อมูลซ้ำ 100%: ${row.toolCode} (${row.set}) มี QR อยู่แล้ว กรุณาลบรายการซ้ำก่อน`);
        skipped++;
        continue;
      }

      const newItem = addToolList({
        lineNo: row.lineNo, caliperType: row.caliperType, model: row.model,
        processNo: row.processNo, type: row.type, spindle: row.spindle,
        machinePoint: row.machinePoint, toolType: row.toolType, toolCode: row.toolCode,
        qtyToolNew: row.qtyToolNew, makerToolNew: row.makerToolNew,
        supplierToolNew: row.supplierToolNew, dwgNoToolNew: row.dwgNoToolNew,
        qtyRegrind: row.qtyRegrind, dwgNoRegrind: row.dwgNoRegrind,
        toolLife: row.toolLife, kanban: row.kanban,
        qrCodeNew: '', qrCodeNewImage: '', qrCodeRegrind: '', qrCodeRegrindImage: '',
        set: row.set, kanbanOn: row.kanbanOn, toolConner: row.toolConner,
        machineMaker: row.machineMaker, machineNo: row.machineNo,
        preSetLength: row.preSetLength, preSetWidth: row.preSetWidth,
        status: 'DRAFT',
      });
      savedIds.push(newItem.id);
    }
    if (savedIds.length > 0) toast.success(`บันทึก ${savedIds.length} รายการสำเร็จ${skipped > 0 ? ` (ข้าม ${skipped} ซ้ำ)` : ''}`);
    setIsSaving(false);
    return savedIds;
  };

  // ── Generate QR ทันที (ไม่ต้องกด Generate All อีก) ──
  const handleGenerateQR = async () => {
    const savedIds = await handleSave();
    if (savedIds.length === 0) return;

    // Generate QR for each saved item immediately
    let generated = 0;
    for (const id of savedIds) {
      const result = generateQRCodes(id);
      if (result) generated++;
    }
    if (generated > 0) {
      toast.success(`สร้าง QR Code สำเร็จ ${generated} รายการ`);
    }
    navigate('/qr-generator');
  };

  const handleReset = () => {
    setRows([createEmptyRow()]);
    localStorage.removeItem(STORAGE_KEY);
    toast.info('รีเซ็ตฟอร์มเรียบร้อย');
  };

  // Render cell by type
  const renderCell = (row: ToolListRow, index: number, col: typeof defaultColumns[0]) => {
    const { key, type } = col;
    const val = row[key as keyof ToolListRow];

    // #6: Set toggle
    if (type === 'setToggle') {
      return (
        <Select value={val as string || 'A'} onValueChange={(v) => updateRow(index, key as keyof ToolListRow, v)}>
          <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SET_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      );
    }

    // #6: Kanban On toggle
    if (type === 'kanbanToggle') {
      const isOn = val === 'ON';
      return (
        <Button
          variant={isOn ? 'default' : 'outline'}
          size="sm"
          className={cn("h-8 w-full text-xs", isOn ? 'bg-green-600 hover:bg-green-700' : '')}
          onClick={() => updateRow(index, key as keyof ToolListRow, isOn ? 'OFF' : 'ON')}
        >
          {isOn ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
          {isOn ? 'ON' : 'OFF'}
        </Button>
      );
    }

    // #8: Pre-set input (value input, not image select)
    if (type === 'presetInput') {
      return (
        <Input
          type="text"
          value={val as string}
          onChange={(e) => updateRow(index, key as keyof ToolListRow, e.target.value)}
          className="w-full h-8 text-xs"
          placeholder="ค่า Pre-set"
        />
      );
    }

    if (type === 'toolCodeSelect') {
      return (
        <div className="flex gap-1">
          <Input
            value={val as string}
            onChange={(e) => updateRow(index, key as keyof ToolListRow, e.target.value)}
            className="w-full h-8 text-xs" placeholder="เลือก"
          />
          <Button variant="outline" size="icon" className="h-8 w-8 shrink-0"
            onClick={() => { setCurrentRowIndex(index); setToolCodeSearch(''); setShowToolCodeDialog(true); }}>
            <Search className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    // #7: readonly fields auto-filled from toolCode
    if (type === 'readonly') {
      return (
        <div className="h-8 flex items-center px-2 bg-slate-50 rounded text-xs text-slate-700 border border-slate-200 whitespace-normal break-words">
          {val || <span className="text-slate-400">-</span>}
        </div>
      );
    }

    if (type === 'dropdown') {
      const items = getDropdownItems(key);
      return (
        <Select value={val as string} onValueChange={(v) => updateRow(index, key as keyof ToolListRow, v)}>
          <SelectTrigger className="w-full h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{items.map(i => <SelectItem key={i} value={i} className="text-xs">{i}</SelectItem>)}</SelectContent>
        </Select>
      );
    }

    if (type === 'number') {
      return (
        <Input type="number" value={val as number}
          onChange={(e) => updateRow(index, key as keyof ToolListRow, parseInt(e.target.value) || 0)}
          className="w-full h-8 text-xs" />
      );
    }

    return (
      <Input type="text" value={val as string}
        onChange={(e) => updateRow(index, key as keyof ToolListRow, e.target.value)}
        className="w-full h-8 text-xs" />
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Register tool code QR</h1>
            <p className="text-slate-500">ลงทะเบียนรายการเครื่องมือพร้อม QR Code</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4" />รีเซ็ต</Button>
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
            <Button onClick={handleGenerateQR}><QrCode className="mr-2 h-4 w-4" />Generate QR</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center"><QrCode className="mr-2 h-5 w-5 text-blue-500" />Register tool code QR</span>
              <span className="text-sm font-normal text-slate-500">{rows.length} แถว</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* #5: Auto column width with whitespace-normal */}
            <ScrollArea className="w-full rounded-md border">
              <div style={{ minWidth: defaultColumns.reduce((s, c) => s + c.minW + 16, 60) }}>
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-2 py-2 text-left font-medium text-slate-700 w-10">#</th>
                      {defaultColumns.map(c => (
                        <th key={c.key} className="px-2 py-2 text-left font-medium text-slate-700 whitespace-normal" style={{ minWidth: c.minW }}>
                          {c.label}
                        </th>
                      ))}
                      <th className="px-2 py-2 text-center font-medium text-slate-700 w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={row.id} className="border-t hover:bg-slate-50">
                        <td className="px-2 py-1 text-slate-500">{index + 1}</td>
                        {defaultColumns.map(col => (
                          <td key={col.key} className="px-1 py-1" style={{ minWidth: col.minW }}>
                            {renderCell(row, index, col)}
                          </td>
                        ))}
                        <td className="px-2 py-1">
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyRow(index)}><Copy className="h-3 w-3" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => deleteRow(index)}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={addRow} className="w-full max-w-xs"><Plus className="mr-2 h-4 w-4" />เพิ่มแถว</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tool Code Selector Dialog */}
        <Dialog open={showToolCodeDialog} onOpenChange={setShowToolCodeDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>เลือก Tool Code</DialogTitle></DialogHeader>
            <Input placeholder="ค้นหา Tool Code, Type, Maker..." value={toolCodeSearch} onChange={(e) => setToolCodeSearch(e.target.value)} />
            <ScrollArea className="h-80">
              <div className="space-y-2">
                {filteredToolCodes.map(tool => (
                  <div key={tool.id} className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                    onClick={() => currentRowIndex !== null && handleToolCodeSelect(currentRowIndex, tool.toolCode)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{tool.toolCode}</p>
                        <p className="text-sm text-slate-500">{tool.toolType} · {tool.supplier}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{tool.maker}</Badge>
                        <Badge variant="secondary">{tool.lineNo || '-'}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredToolCodes.length === 0 && <p className="text-center text-slate-400 py-4">ไม่พบข้อมูล</p>}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
