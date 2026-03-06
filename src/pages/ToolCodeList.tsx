import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench, Plus, Search, Download, Upload, Pencil, Trash2, ArrowUpDown, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Layout } from '@/components/layout/Layout';
import { useToolStore } from '@/stores/toolStore';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { useAuthStore } from '@/stores/authStore';
import type { ToolCode } from '@/types';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ToolCategory {
  code: string;
  name: string;
  nameTh: string;
  count: number;
  tools: ToolCode[];
}

// Sheet data for multi-sheet import
interface SheetData {
  name: string;
  rows: Record<string, string>[];
  selected: boolean;
}

export function ToolCodeList() {
  const navigate = useNavigate();
  const { toolCodes, updateToolCode, deleteToolCode, addToolCode } = useToolStore();
  const { originalToolCategories, trialToolCategories, categories } = useMasterDataStore();
  const { user } = useAuthStore();
  const getItems = (key: string): string[] => categories.find(c => c.name === key)?.items || [];

  // Permission check
  const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';
  const isAdmin = user?.role === 'ADMIN';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState<ToolCode | null>(null);
  const [editTool, setEditTool] = useState<ToolCode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ToolCode | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Multi-sheet import state
  const [importSheets, setImportSheets] = useState<SheetData[] | null>(null);
  const [importCodeType, setImportCodeType] = useState<'ORIGINAL' | 'TRIAL'>('ORIGINAL');
  const [importPreview, setImportPreview] = useState<Record<string, string>[] | null>(null);

  // Group tools by category - use both cat.code AND cat.prefixes
  const matchesCategory = (toolCode: string, cat: { code: string; prefixes?: string[] }) => {
    if (toolCode.startsWith(cat.code)) return true;
    if (cat.prefixes && cat.prefixes.length > 0) {
      return cat.prefixes.some(p => toolCode.startsWith(p));
    }
    return false;
  };

  const originalCategories: ToolCategory[] = useMemo(() => {
    const cats = originalToolCategories.map((cat) => {
      const tools = toolCodes.filter(
        (t) => t.codeType === 'ORIGINAL' && matchesCategory(t.toolCode, cat)
      );
      return { ...cat, count: tools.length, tools };
    });
    // Add "Uncategorized" for tools that don't match any category
    const categorizedIds = new Set(cats.flatMap(c => c.tools.map(t => t.id)));
    const uncategorized = toolCodes.filter(t => t.codeType === 'ORIGINAL' && !categorizedIds.has(t.id));
    if (uncategorized.length > 0) {
      cats.push({ code: 'OTHER', name: 'Uncategorized', nameTh: 'ไม่จัดหมวดหมู่', count: uncategorized.length, tools: uncategorized });
    }
    return cats;
  }, [toolCodes, originalToolCategories]);

  const trialCategories: ToolCategory[] = useMemo(() => {
    const cats = trialToolCategories.map((cat) => {
      const tools = toolCodes.filter(
        (t) => t.codeType === 'TRIAL' && matchesCategory(t.toolCode, cat)
      );
      return { ...cat, count: tools.length, tools };
    });
    const categorizedIds = new Set(cats.flatMap(c => c.tools.map(t => t.id)));
    const uncategorized = toolCodes.filter(t => t.codeType === 'TRIAL' && !categorizedIds.has(t.id));
    if (uncategorized.length > 0) {
      cats.push({ code: 'OTHER', name: 'Uncategorized', nameTh: 'ไม่จัดหมวดหมู่', count: uncategorized.length, tools: uncategorized });
    }
    return cats;
  }, [toolCodes, trialToolCategories]);

  const filterTools = (tools: ToolCode[]) => {
    let result = tools;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.toolCode.toLowerCase().includes(q) ||
          t.toolType.toLowerCase().includes(q) ||
          t.maker.toLowerCase().includes(q) ||
          t.supplier.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      const cmp = a.toolCode.localeCompare(b.toolCode);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return result;
  };

  // ── Export ──
  const handleExport = (codeType: 'ORIGINAL' | 'TRIAL') => {
    const tools = toolCodes.filter((t) => t.codeType === codeType);
    if (tools.length === 0) { toast.error('ไม่มีข้อมูลสำหรับส่งออก'); return; }
    const wb = XLSX.utils.book_new();
    const cats = codeType === 'ORIGINAL' ? originalCategories : trialCategories;
    cats.forEach(cat => {
      if (cat.tools.length === 0) return;
      const data = cat.tools.map((t) => ({
        'TOOL TYPE': t.toolType, 'TOOL CODE': t.toolCode, 'LINE NO': t.lineNo,
        'M/C No.': t.machineNo, 'SOP Model': t.sopModel, 'Process name': t.processName,
        'DWG No.': t.dwgNo, 'Maker': t.maker, 'Supplier': t.supplier,
        'Order code': t.orderCode, 'Type': t.type, 'Request by': t.requestBy,
        'Remark': t.remark, 'Status': t.status, 'Stock control': t.stockControl,
        'Location': t.location,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const sheetName = `${cat.code}-${cat.name}`.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });
    if (wb.SheetNames.length === 0) {
      const data = tools.map(t => ({ 'TOOL CODE': t.toolCode, 'TOOL TYPE': t.toolType }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'All');
    }
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Tool_Code_${codeType}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(`ส่งออก ${tools.length} รายการ (${wb.SheetNames.length} sheets) สำเร็จ`);
  };

  // ── Import: Step 1 - Read file and show sheet selector ──
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>, codeType: 'ORIGINAL' | 'TRIAL') => {
    if (!canEdit) { toast.error('คุณไม่มีสิทธิ์ import ข้อมูล'); return; }
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        if (wb.SheetNames.length === 0) { toast.error('ไม่พบ Sheet ในไฟล์'); return; }

        // Build sheet data for selection
        const sheets: SheetData[] = wb.SheetNames.map(name => {
          const rows = XLSX.utils.sheet_to_json<Record<string, string>>(wb.Sheets[name]);
          return { name, rows, selected: true }; // default: select all sheets
        }).filter(s => s.rows.length > 0); // skip empty sheets

        if (sheets.length === 0) { toast.error('ไม่พบข้อมูลในไฟล์'); return; }

        setImportSheets(sheets);
        setImportCodeType(codeType);
        setImportPreview(null);
      } catch { toast.error('อ่านไฟล์ไม่สำเร็จ'); }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // ── Import: Step 2 - Toggle sheet selection ──
  const toggleSheet = (index: number) => {
    if (!importSheets) return;
    const updated = [...importSheets];
    updated[index] = { ...updated[index], selected: !updated[index].selected };
    setImportSheets(updated);
  };

  const selectAllSheets = (selected: boolean) => {
    if (!importSheets) return;
    setImportSheets(importSheets.map(s => ({ ...s, selected })));
  };

  // ── Import: Step 3 - Merge selected sheets and show preview ──
  const proceedToPreview = () => {
    if (!importSheets) return;
    const selectedSheets = importSheets.filter(s => s.selected);
    if (selectedSheets.length === 0) { toast.error('กรุณาเลือกอย่างน้อย 1 Sheet'); return; }
    const merged = selectedSheets.flatMap(s => s.rows);
    setImportPreview(merged);
  };

  // ── Import: Step 4 - Confirm import ──
  const confirmImport = () => {
    if (!importPreview) return;
    let imported = 0;
    for (const row of importPreview) {
      const toolCode = row['TOOL CODE'] || row['toolCode'] || '';
      if (!toolCode) continue;
      if (toolCodes.some(t => t.toolCode === toolCode)) continue;
      addToolCode({
        toolType: row['TOOL TYPE'] || '', toolCode,
        lineNo: row['LINE NO'] || '', machineNo: row['M/C No.'] || '',
        sopModel: row['SOP Model'] || '', processName: row['Process name'] || '',
        dwgNo: row['DWG No.'] || '', maker: row['Maker'] || '',
        supplier: row['Supplier'] || '', orderCode: row['Order code'] || '',
        type: row['Type'] || '', requestBy: row['Request by'] || '',
        remark: row['Remark'] || '',
        status: (row['Status'] === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
        stockControl: row['Stock control'] || '', location: row['Location'] || '',
        codeType: importCodeType,
      });
      imported++;
    }
    toast.success(`นำเข้าสำเร็จ ${imported} รายการ (ข้าม ${importPreview.length - imported} ซ้ำ) จาก ${importSheets?.filter(s => s.selected).length || 0} sheets`);
    setImportPreview(null);
    setImportSheets(null);
  };

  // ── Edit ──
  const handleEditSave = () => {
    if (!editTool) return;
    updateToolCode(editTool.id, editTool);
    toast.success(`อัพเดท ${editTool.toolCode} สำเร็จ`);
    setEditTool(null);
  };

  // ── Delete ──
  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteToolCode(deleteTarget.id);
    toast.success(`ลบ ${deleteTarget.toolCode} สำเร็จ`);
    setDeleteTarget(null);
  };

  // ── Category Card ──
  const renderCategoryCard = (category: ToolCategory) => (
    <Card key={category.code} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg text-blue-600">{category.code}</CardTitle>
            <p className="text-sm text-slate-600">{category.name}</p>
            <p className="text-xs text-slate-500">{category.nameTh}</p>
          </div>
          <Badge variant={category.count > 0 ? 'default' : 'secondary'} className="text-lg">
            {category.count}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {category.tools.length > 0 ? (
          <ScrollArea className="h-32">
            <div className="space-y-1">
              {filterTools(category.tools).slice(0, 5).map((tool) => (
                <div key={tool.id} className="flex items-center justify-between p-2 bg-slate-50 rounded hover:bg-slate-100">
                  <span className="text-sm font-medium cursor-pointer" onClick={() => setSelectedTool(tool)}>{tool.toolCode}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500 mr-1">{tool.maker}</span>
                    {canEdit ? (
                      <>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditTool({ ...tool })}><Pencil className="h-3 w-3" /></Button>
                        {isAdmin && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-600" onClick={() => setDeleteTarget(tool)}><Trash2 className="h-3 w-3" /></Button>
                        )}
                      </>
                    ) : (
                      <Lock className="h-3 w-3 text-slate-300" />
                    )}
                  </div>
                </div>
              ))}
              {filterTools(category.tools).length > 5 && (
                <p className="text-xs text-slate-400 text-center">+{filterTools(category.tools).length - 5} เพิ่มเติม</p>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="h-32 flex items-center justify-center text-slate-400"><p className="text-sm">ไม่มีข้อมูล</p></div>
        )}
      </CardContent>
    </Card>
  );

  // ── Tab Content ──
  const renderTab = (codeType: 'ORIGINAL' | 'TRIAL', cats: ToolCategory[], color: string) => (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        {canEdit && (
          <label>
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => handleImportFile(e, codeType)} />
            <Button variant="outline" asChild><span><Upload className="mr-2 h-4 w-4" />Import Excel</span></Button>
          </label>
        )}
        <Button variant="outline" onClick={() => handleExport(codeType)}><Download className="mr-2 h-4 w-4" />Export Excel</Button>
      </div>

      {!canEdit && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <Lock className="h-4 w-4 text-amber-500" />
          <span className="text-sm text-amber-700">คุณเป็น Visitor — สามารถดูข้อมูลได้เท่านั้น ไม่สามารถแก้ไข</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">ทั้งหมด</p><p className={`text-2xl font-bold text-${color}-600`}>{toolCodes.filter(t => t.codeType === codeType).length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Active</p><p className="text-2xl font-bold text-green-600">{toolCodes.filter(t => t.codeType === codeType && t.status === 'ACTIVE').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Inactive</p><p className="text-2xl font-bold text-red-600">{toolCodes.filter(t => t.codeType === codeType && t.status === 'INACTIVE').length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-slate-500">หมวดหมู่</p><p className="text-2xl font-bold">{cats.length}</p></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {cats.map(renderCategoryCard)}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ดูรายการ tool ทั้งหมด</h1>
            <p className="text-slate-500">View All Tools - แยกตามหมวดหมู่</p>
          </div>
          {canEdit && (
            <Button onClick={() => navigate('/tool-code')}><Plus className="mr-2 h-4 w-4" />ลงทะเบียนใหม่</Button>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="ค้นหา Tool Code, Type, Maker, Supplier..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Button variant="outline" onClick={() => setSortOrder(s => s === 'asc' ? 'desc' : 'asc')}>
            <ArrowUpDown className="mr-2 h-4 w-4" />
            {sortOrder === 'asc' ? 'A→Z' : 'Z→A'}
          </Button>
        </div>

        <Tabs defaultValue="original" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="original"><Wrench className="mr-2 h-4 w-4" />Original Code</TabsTrigger>
            <TabsTrigger value="trial"><Wrench className="mr-2 h-4 w-4" />Trial Code</TabsTrigger>
          </TabsList>
          <TabsContent value="original">{renderTab('ORIGINAL', originalCategories, 'blue')}</TabsContent>
          <TabsContent value="trial">{renderTab('TRIAL', trialCategories, 'green')}</TabsContent>
        </Tabs>

        {/* ── View Detail ── */}
        <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader><DialogTitle>รายละเอียด Tool Code</DialogTitle></DialogHeader>
            {selectedTool && (
              <div className="grid grid-cols-2 gap-4">
                {([
                  ['Tool Code', selectedTool.toolCode], ['Tool Type', selectedTool.toolType],
                  ['Code Type', selectedTool.codeType], ['Status', selectedTool.status],
                  ['Maker', selectedTool.maker], ['Supplier', selectedTool.supplier],
                  ['M/C No.', selectedTool.machineNo], ['SOP Model', selectedTool.sopModel],
                  ['Process', selectedTool.processName], ['DWG No.', selectedTool.dwgNo],
                  ['Order Code', selectedTool.orderCode], ['Line No.', selectedTool.lineNo],
                  ['Location', selectedTool.location], ['Stock Control', selectedTool.stockControl],
                  ['Request By', selectedTool.requestBy],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}><p className="text-xs text-slate-500">{label}</p><p className="font-medium">{value || '-'}</p></div>
                ))}
                <div className="col-span-2"><p className="text-xs text-slate-500">Remark</p><p className="font-medium">{selectedTool.remark || '-'}</p></div>
              </div>
            )}
            <DialogFooter>
              {canEdit && (
                <Button variant="outline" onClick={() => { setEditTool({ ...selectedTool! }); setSelectedTool(null); }}><Pencil className="mr-2 h-4 w-4" />แก้ไข</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Edit Dialog ── */}
        {canEdit && (
          <Dialog open={!!editTool} onOpenChange={() => setEditTool(null)}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>แก้ไข: {editTool?.toolCode}</DialogTitle></DialogHeader>
              {editTool && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Tool Type</Label>
                    <Select value={editTool.toolType} onValueChange={(v) => setEditTool({ ...editTool, toolType: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{getItems("toolTypes").map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Tool Code</Label><Input value={editTool.toolCode} onChange={(e) => setEditTool({ ...editTool, toolCode: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Maker</Label>
                    <Select value={editTool.maker} onValueChange={(v) => setEditTool({ ...editTool, maker: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{getItems("makers").map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Supplier</Label>
                    <Select value={editTool.supplier} onValueChange={(v) => setEditTool({ ...editTool, supplier: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{getItems("suppliers").map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>M/C No.</Label>
                    <Select value={editTool.machineNo} onValueChange={(v) => setEditTool({ ...editTool, machineNo: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{getItems("machineNos").map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Status</Label>
                    <Select value={editTool.status} onValueChange={(v: 'ACTIVE' | 'INACTIVE') => setEditTool({ ...editTool, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="ACTIVE">ACTIVE</SelectItem><SelectItem value="INACTIVE">INACTIVE</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>DWG No.</Label><Input value={editTool.dwgNo} onChange={(e) => setEditTool({ ...editTool, dwgNo: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Order Code</Label><Input value={editTool.orderCode} onChange={(e) => setEditTool({ ...editTool, orderCode: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Line No.</Label><Input value={editTool.lineNo} onChange={(e) => setEditTool({ ...editTool, lineNo: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Location</Label>
                    <Select value={editTool.location} onValueChange={(v) => setEditTool({ ...editTool, location: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{getItems("locations").map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2 space-y-2"><Label>Remark</Label><Textarea value={editTool.remark} onChange={(e) => setEditTool({ ...editTool, remark: e.target.value })} rows={3} /></div>
                </div>
              )}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setEditTool(null)}>ยกเลิก</Button>
                <Button onClick={handleEditSave}>บันทึก</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* ── Delete Confirm ── */}
        {isAdmin && (
          <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                <AlertDialogDescription>
                  ต้องการลบ <strong>{deleteTarget?.toolCode}</strong> ({deleteTarget?.toolType}) หรือไม่?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">ลบ</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* ── Multi-Sheet Selector Dialog ── */}
        <Dialog open={!!importSheets && !importPreview} onOpenChange={() => { setImportSheets(null); setImportPreview(null); }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>เลือก Sheet ที่ต้องการนำเข้า ({importCodeType})</DialogTitle>
            </DialogHeader>
            {importSheets && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">พบ {importSheets.length} sheets ในไฟล์</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => selectAllSheets(true)}>เลือกทั้งหมด</Button>
                    <Button variant="outline" size="sm" onClick={() => selectAllSheets(false)}>ยกเลิกทั้งหมด</Button>
                  </div>
                </div>
                <ScrollArea className="h-[300px] border rounded-lg p-4">
                  <div className="space-y-3">
                    {importSheets.map((sheet, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50">
                        <div className="flex items-center gap-3">
                          <Checkbox checked={sheet.selected} onCheckedChange={() => toggleSheet(i)} />
                          <div>
                            <p className="font-medium">{sheet.name}</p>
                            <p className="text-xs text-slate-500">{sheet.rows.length} รายการ</p>
                          </div>
                        </div>
                        <Badge variant={sheet.selected ? 'default' : 'secondary'}>
                          {sheet.selected ? 'เลือกแล้ว' : 'ไม่เลือก'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    เลือก {importSheets.filter(s => s.selected).length} / {importSheets.length} sheets
                    ({importSheets.filter(s => s.selected).reduce((sum, s) => sum + s.rows.length, 0)} รายการรวม)
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setImportSheets(null)}>ยกเลิก</Button>
                    <Button onClick={proceedToPreview} disabled={importSheets.filter(s => s.selected).length === 0}>ถัดไป</Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Import Preview ── */}
        <Dialog open={!!importPreview} onOpenChange={() => { setImportPreview(null); setImportSheets(null); }}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                ตรวจสอบข้อมูล Import ({importPreview?.length || 0} รายการ จาก {importSheets?.filter(s => s.selected).length || 0} sheets) - {importCodeType}
              </DialogTitle>
            </DialogHeader>
            {importPreview && (
              <div className="space-y-4">
                <ScrollArea className="h-[400px] border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 sticky top-0">
                      <tr>
                        <th className="p-2 text-left">#</th>
                        <th className="p-2 text-left">Tool Code</th>
                        <th className="p-2 text-left">Tool Type</th>
                        <th className="p-2 text-left">Maker</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-left">สถานะ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((row, i) => {
                        const code = row['TOOL CODE'] || row['toolCode'] || '';
                        const exists = toolCodes.some(t => t.toolCode === code);
                        return (
                          <tr key={i} className={exists ? 'bg-yellow-50' : ''}>
                            <td className="p-2">{i + 1}</td>
                            <td className="p-2 font-medium">{code || '-'}</td>
                            <td className="p-2">{row['TOOL TYPE'] || row['toolType'] || '-'}</td>
                            <td className="p-2">{row['Maker'] || '-'}</td>
                            <td className="p-2">{row['Status'] || 'ACTIVE'}</td>
                            <td className="p-2">
                              {!code ? (<Badge variant="destructive">ไม่มี Code</Badge>)
                                : exists ? (<Badge variant="secondary">ซ้ำ (ข้าม)</Badge>)
                                : (<Badge variant="default">นำเข้า</Badge>)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </ScrollArea>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    จะนำเข้า {importPreview.filter(r => {
                      const code = r['TOOL CODE'] || r['toolCode'] || '';
                      return code && !toolCodes.some(t => t.toolCode === code);
                    }).length} จาก {importPreview.length} รายการ
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setImportPreview(null)}>ย้อนกลับ</Button>
                    <Button onClick={confirmImport}>ยืนยันนำเข้า</Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
