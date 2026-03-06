import { useState, useEffect, useMemo } from 'react';
import {
  Database, Search, Pencil, Trash2, Plus, Save, X, RefreshCw, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Layout } from '@/components/layout/Layout';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const DB_TABLES = [
  { key: 'tooling_toolcodes', label: 'Tool Codes', color: 'blue' },
  { key: 'tooling_toollists', label: 'Tool Lists', color: 'green' },
  { key: 'tooling_users', label: 'Users', color: 'purple' },
  { key: 'tooling-transactions-storage', label: 'Transactions', color: 'orange' },
  { key: 'master-data-storage', label: 'Master Data', color: 'slate' },
  { key: 'tooling-drawings-storage', label: 'Drawings', color: 'pink' },
  { key: 'tooling-presettings-storage', label: 'Pre-Settings', color: 'teal' },
];

function parseStorageData(key: string): any[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Zustand persist stores wrap in { state: { ... } }
    if (parsed.state) {
      const stateObj = parsed.state;
      // Find the first array in state
      for (const k of Object.keys(stateObj)) {
        if (Array.isArray(stateObj[k])) return stateObj[k];
      }
      return [stateObj]; // return as single row if no array found
    }
    if (Array.isArray(parsed)) return parsed;
    return [parsed];
  } catch { return []; }
}

function saveStorageData(key: string, data: any[]) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) { localStorage.setItem(key, JSON.stringify(data)); return; }
    const parsed = JSON.parse(raw);
    if (parsed.state) {
      // Find array key in state
      for (const k of Object.keys(parsed.state)) {
        if (Array.isArray(parsed.state[k])) {
          parsed.state[k] = data;
          localStorage.setItem(key, JSON.stringify(parsed));
          return;
        }
      }
    }
    localStorage.setItem(key, JSON.stringify(data));
  } catch { localStorage.setItem(key, JSON.stringify(data)); }
}

export function DatabaseViewer() {
  const { user } = useAuthStore();
  const [activeTable, setActiveTable] = useState(DB_TABLES[0].key);
  const [tableData, setTableData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editRow, setEditRow] = useState<{ index: number; data: Record<string, any> } | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  // Load data when table changes
  useEffect(() => {
    const data = parseStorageData(activeTable);
    setTableData(data);
    setSearchQuery('');
  }, [activeTable]);

  const reload = () => {
    setTableData(parseStorageData(activeTable));
    toast.info('รีโหลดข้อมูลแล้ว');
  };

  // Get column headers from data
  const columns = useMemo(() => {
    if (tableData.length === 0) return [];
    const allKeys = new Set<string>();
    tableData.forEach(row => {
      if (typeof row === 'object' && row !== null) {
        Object.keys(row).forEach(k => allKeys.add(k));
      }
    });
    return Array.from(allKeys);
  }, [tableData]);

  // Filter
  const filtered = useMemo(() => {
    if (!searchQuery) return tableData;
    const q = searchQuery.toLowerCase();
    return tableData.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(q))
    );
  }, [tableData, searchQuery]);

  // Edit
  const handleSaveEdit = () => {
    if (editRow === null) return;
    const updated = [...tableData];
    updated[editRow.index] = editRow.data;
    setTableData(updated);
    saveStorageData(activeTable, updated);
    toast.success('บันทึกแล้ว');
    setEditRow(null);
  };

  // Delete
  const handleDelete = () => {
    if (deleteIndex === null) return;
    const updated = tableData.filter((_, i) => i !== deleteIndex);
    setTableData(updated);
    saveStorageData(activeTable, updated);
    toast.success('ลบแล้ว');
    setDeleteIndex(null);
  };

  // Add new row
  const handleAddRow = () => {
    const newRow: Record<string, any> = {};
    columns.forEach(c => { newRow[c] = ''; });
    newRow.id = Date.now().toString();
    newRow.createdAt = new Date().toISOString();
    setEditRow({ index: tableData.length, data: newRow });
  };

  // Export
  const handleExport = () => {
    if (tableData.length === 0) { toast.error('ไม่มีข้อมูล'); return; }
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const label = DB_TABLES.find(t => t.key === activeTable)?.label || 'data';
    saveAs(new Blob([buf]), `${label}_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Export สำเร็จ');
  };

  if (user?.role !== 'ADMIN') {
    return (
      <Layout><div className="text-center py-20">
        <Database className="mx-auto h-16 w-16 text-red-300 mb-4" />
        <h2 className="text-xl font-bold text-red-600">ไม่มีสิทธิ์เข้าถึง</h2>
        <p className="text-slate-500">เฉพาะ Admin เท่านั้น</p>
      </div></Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Database Viewer</h1>
            <p className="text-slate-500">ตรวจสอบ แก้ไข ลบ เพิ่ม ข้อมูลทั้งหมดใน WebApp (Admin Only)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={reload}><RefreshCw className="mr-2 h-4 w-4" />Reload</Button>
            <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export</Button>
            <Button size="sm" onClick={handleAddRow}><Plus className="mr-2 h-4 w-4" />เพิ่มแถว</Button>
          </div>
        </div>

        {/* Table selector */}
        <div className="flex flex-wrap gap-2">
          {DB_TABLES.map(t => {
            const count = parseStorageData(t.key).length;
            return (
              <Button key={t.key} variant={activeTable === t.key ? 'default' : 'outline'} size="sm" onClick={() => setActiveTable(t.key)}>
                {t.label} <Badge variant="secondary" className="ml-2">{count}</Badge>
              </Button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input placeholder="ค้นหาข้อมูลทุก column..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>{DB_TABLES.find(t => t.key === activeTable)?.label} ({filtered.length} rows, {columns.length} columns)</span>
              <span className="text-xs text-slate-400 font-normal">Key: {activeTable}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
              <div style={{ minWidth: Math.max(columns.length * 150, 800) }}>
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 sticky top-0 z-10">
                    <tr>
                      <th className="px-2 py-2 text-left w-12">#</th>
                      {columns.map(col => (
                        <th key={col} className="px-2 py-2 text-left font-medium min-w-[120px]" title={col}>
                          {col.length > 15 ? col.substring(0, 15) + '...' : col}
                        </th>
                      ))}
                      <th className="px-2 py-2 text-center w-20 sticky right-0 bg-slate-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <tr key={i} className="border-t hover:bg-slate-50">
                        <td className="px-2 py-1 text-slate-400">{i + 1}</td>
                        {columns.map(col => {
                          const val = row[col];
                          const display = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
                          return (
                            <td key={col} className="px-2 py-1 max-w-[200px] truncate" title={display}>
                              {display.length > 50 ? display.substring(0, 50) + '...' : display}
                            </td>
                          );
                        })}
                        <td className="px-2 py-1 text-center sticky right-0 bg-white">
                          <div className="flex gap-1 justify-center">
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditRow({ index: tableData.indexOf(row), data: { ...row } })}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => setDeleteIndex(tableData.indexOf(row))}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={columns.length + 2} className="text-center py-12 text-slate-400">ไม่มีข้อมูล</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editRow} onOpenChange={() => setEditRow(null)}>
          <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editRow && editRow.index >= tableData.length ? 'เพิ่มแถวใหม่' : 'แก้ไขข้อมูล'}</DialogTitle></DialogHeader>
            {editRow && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(editRow.data).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs text-slate-500">{key}</Label>
                    <Input value={typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                      onChange={e => {
                        const newData = { ...editRow.data };
                        // Try to preserve type
                        const origType = typeof editRow.data[key];
                        if (origType === 'number') newData[key] = Number(e.target.value) || 0;
                        else newData[key] = e.target.value;
                        setEditRow({ ...editRow, data: newData });
                      }}
                      className="text-sm" />
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditRow(null)}>ยกเลิก</Button>
              <Button onClick={handleSaveEdit}><Save className="mr-2 h-4 w-4" />บันทึก</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm */}
        <AlertDialog open={deleteIndex !== null} onOpenChange={() => setDeleteIndex(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
              <AlertDialogDescription>ต้องการลบแถวนี้หรือไม่? การลบจะถาวรไม่สามารถกู้คืนได้</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">ลบ</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
