import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Plus,
  Trash2,
  FileSpreadsheet,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { useToolStore } from '@/stores/toolStore';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { cn } from '@/lib/utils';

interface ToolListGroup {
  id: string;
  lineNo: string;
  model: string;
  modelType: string;
  partNo: string;
  tools: ToolInGroup[];
}

interface ToolInGroup {
  id: string;
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
  qrCodeNew: string;
  qrCodeRegrind: string;
  set: string;
  kanbanOn: string;
  toolConner: string;
  machineMaker: string;
  machineNo: string;
  preSetLength: string;
  preSetWidth: string;
}

export function CreateToolListMaster() {
  const navigate = useNavigate();
  const { categories } = useMasterDataStore();
  const { toolCodes } = useToolStore();
  const [groups, setGroups] = useState<ToolListGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const processItems = categories.find(c => c.name === 'processNames')?.items || [];
  const registeredToolCodes = toolCodes.filter(t => t.codeType === 'ORIGINAL');

  // #11: Auto-fill fields from registered tool code
  const handleToolCodeChange = (groupId: string, toolId: string, code: string) => {
    const found = toolCodes.find(t => t.toolCode === code);
    if (found) {
      updateTool(groupId, toolId, {
        toolCode: code, toolType: found.toolType, maker: found.maker,
        supplier: found.supplier, dwgNo: found.dwgNo, qty: 1,
      });
    } else {
      updateTool(groupId, toolId, { toolCode: code });
    }
  };

  const addGroup = () => {
    const newGroup: ToolListGroup = {
      id: Date.now().toString(),
      lineNo: '',
      model: '',
      modelType: '',
      partNo: '',
      tools: []
    };
    setGroups([...groups, newGroup]);
    setSelectedGroup(newGroup.id);
    toast.success('เพิ่มกลุ่มใหม่');
  };

  const updateGroup = (groupId: string, updates: Partial<ToolListGroup>) => {
    setGroups(groups.map(g => g.id === groupId ? { ...g, ...updates } : g));
  };

  const deleteGroup = (groupId: string) => {
    setGroups(groups.filter(g => g.id !== groupId));
    if (selectedGroup === groupId) setSelectedGroup(null);
    toast.info('ลบกลุ่มเรียบร้อย');
  };

  const addToolToGroup = (groupId: string) => {
    const newTool: ToolInGroup = {
      id: Date.now().toString(),
      processNo: '',
      machinePoint: '',
      item: 1,
      toolType: '',
      toolCode: '',
      qty: 1,
      maker: '',
      supplier: '',
      dwgNo: '',
      qtyRegrind: 0,
      dwgNoRegrind: '',
      toolLife: '',
      kanban: '',
      qrCodeNew: '',
      qrCodeRegrind: '',
      set: '',
      kanbanOn: '',
      toolConner: '',
      machineMaker: '',
      machineNo: '',
      preSetLength: '',
      preSetWidth: ''
    };
    setGroups(groups.map(g => 
      g.id === groupId 
        ? { ...g, tools: [...g.tools, newTool] }
        : g
    ));
  };

  const updateTool = (groupId: string, toolId: string, updates: Partial<ToolInGroup>) => {
    setGroups(groups.map(g => 
      g.id === groupId 
        ? { 
            ...g, 
            tools: g.tools.map(t => t.id === toolId ? { ...t, ...updates } : t)
          }
        : g
    ));
  };

  const deleteTool = (groupId: string, toolId: string) => {
    setGroups(groups.map(g => 
      g.id === groupId 
        ? { ...g, tools: g.tools.filter(t => t.id !== toolId) }
        : g
    ));
  };

  const handleSave = async () => {
    if (groups.length === 0) {
      toast.error('กรุณาสร้างอย่างน้อย 1 กลุ่ม');
      return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast.success('บันทึกข้อมูลสำเร็จ');
    setIsSaving(false);
  };

  const handleExportExcel = () => {
    const data = groups.flatMap(group => 
      group.tools.map(tool => ({
        'LINE NO': group.lineNo,
        'MODEL': group.model,
        'MODEL TYPE': group.modelType,
        'PART NO': group.partNo,
        'PROCESS NO': tool.processNo,
        'MACHINE POINT': tool.machinePoint,
        'ITEM': tool.item,
        'TOOL TYPE': tool.toolType,
        'TOOL CODE': tool.toolCode,
        "Q'TY": tool.qty,
        'MAKER': tool.maker,
        'SUPPLIER': tool.supplier,
        'DWG NO': tool.dwgNo,
        "Q'TY REGRIND": tool.qtyRegrind,
        'DWG NO REGRIND': tool.dwgNoRegrind,
        'TOOL LIFE': tool.toolLife,
        'KANBAN': tool.kanban,
        'SET': tool.set,
        'KANBAN ON': tool.kanbanOn,
        'TOOL CONNER': tool.toolConner,
        'MACHINE MAKER': tool.machineMaker,
        'M/C NO': tool.machineNo,
        'PRE-SET L': tool.preSetLength,
        'PRE-SET D': tool.preSetWidth,
      }))
    );

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tool List Master');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Tool_List_Master_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('ส่งออก Excel สำเร็จ');
  };

  const handleExportPDF = () => {
    toast.info('ฟีเจอร์ Export PDF จะเปิดให้ใช้งานในเวอร์ชันถัดไป');
  };

  const currentGroup = groups.find(g => g.id === selectedGroup);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/tool-list')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Create New Tool List Master</h1>
              <p className="text-slate-500">สร้างรายการเครื่องมือใหม่</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Groups List - 1/4 width */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>รายการกลุ่ม</span>
                <Badge>{groups.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={addGroup} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                เพิ่มกลุ่มใหม่
              </Button>
              
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedGroup === group.id 
                          ? "bg-blue-50 border-blue-300" 
                          : "bg-white hover:bg-slate-50"
                      )}
                      onClick={() => setSelectedGroup(group.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{group.lineNo || 'ไม่ระบุ Line No.'}</p>
                          <p className="text-sm text-slate-500">{group.model}</p>
                          <p className="text-xs text-slate-400">{group.tools.length} tools</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGroup(group.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {groups.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <Plus className="mx-auto h-8 w-8 mb-2" />
                      <p className="text-sm">ยังไม่มีกลุ่ม</p>
                      <p className="text-xs">คลิก "เพิ่มกลุ่มใหม่" เพื่อเริ่มต้น</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Group Details - 3/4 width */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>รายละเอียดกลุ่ม</CardTitle>
            </CardHeader>
            <CardContent>
              {currentGroup ? (
                <div className="space-y-6">
                  {/* Group Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Line No.</Label>
                      <Input
                        value={currentGroup.lineNo}
                        onChange={(e) => updateGroup(currentGroup.id, { lineNo: e.target.value })}
                        placeholder="เช่น MA-062"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Input
                        value={currentGroup.model}
                        onChange={(e) => updateGroup(currentGroup.id, { model: e.target.value })}
                        placeholder="เช่น D03B"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Model Type</Label>
                      <Input
                        value={currentGroup.modelType}
                        onChange={(e) => updateGroup(currentGroup.id, { modelType: e.target.value })}
                        placeholder="เช่น FLOATING"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Part No.</Label>
                      <Input
                        value={currentGroup.partNo}
                        onChange={(e) => updateGroup(currentGroup.id, { partNo: e.target.value })}
                        placeholder="เช่น 141117/27-12720"
                      />
                    </div>
                  </div>

                  {/* Tools Table */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">รายการเครื่องมือ</h4>
                      <Button size="sm" onClick={() => addToolToGroup(currentGroup.id)}>
                        <Plus className="mr-2 h-4 w-4" />
                        เพิ่มเครื่องมือ
                      </Button>
                    </div>

                    <ScrollArea className="h-[400px]">
                      <div style={{ minWidth: '1400px' }}>
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 sticky top-0">
                          <tr>
                            <th className="px-2 py-2 text-left w-10">#</th>
                            <th className="px-2 py-2 text-left">Line No.</th>
                            <th className="px-2 py-2 text-left">Process</th>
                            <th className="px-2 py-2 text-left">Tool Code</th>
                            <th className="px-2 py-2 text-left">Tool Type</th>
                            <th className="px-2 py-2 text-left">QTY</th>
                            <th className="px-2 py-2 text-left">Maker</th>
                            <th className="px-2 py-2 text-left">M/C No.</th>
                            <th className="px-2 py-2 text-left">Tool Life</th>
                            <th className="px-2 py-2 text-left">Set</th>
                            <th className="px-2 py-2 text-left">Supplier</th>
                            <th className="px-2 py-2 text-left">DWG No.</th>
                            <th className="px-2 py-2 text-center w-16">ลบ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentGroup.tools.map((tool, idx) => (
                            <tr key={tool.id} className="border-t">
                              <td className="px-2 py-1 text-slate-400">{idx + 1}</td>
                              <td className="px-2 py-1"><Input value={currentGroup.lineNo} readOnly className="h-8 text-xs bg-slate-50 w-20" /></td>
                              <td className="px-2 py-1">
                                <Select value={tool.processNo} onValueChange={(v) => updateTool(currentGroup.id, tool.id, { processNo: v })}>
                                  <SelectTrigger className="h-8 text-xs w-28"><SelectValue placeholder="เลือก" /></SelectTrigger>
                                  <SelectContent>{processItems.map(p => <SelectItem key={p} value={p} className="text-xs">{p}</SelectItem>)}</SelectContent>
                                </Select>
                              </td>
                              <td className="px-2 py-1">
                                <Select value={tool.toolCode} onValueChange={(v) => handleToolCodeChange(currentGroup.id, tool.id, v)}>
                                  <SelectTrigger className="h-8 text-xs w-32"><SelectValue placeholder="เลือก" /></SelectTrigger>
                                  <SelectContent>{registeredToolCodes.map(tc => (<SelectItem key={tc.id} value={tc.toolCode} className="text-xs">{tc.toolCode} ({tc.toolType})</SelectItem>))}</SelectContent>
                                </Select>
                              </td>
                              <td className="px-2 py-1"><Input value={tool.toolType} onChange={(e) => updateTool(currentGroup.id, tool.id, { toolType: e.target.value })} className="h-8 text-xs w-24" /></td>
                              <td className="px-2 py-1"><Input type="number" value={tool.qty} onChange={(e) => updateTool(currentGroup.id, tool.id, { qty: parseInt(e.target.value) || 0 })} className="h-8 text-xs w-16" /></td>
                              <td className="px-2 py-1"><Input value={tool.maker} onChange={(e) => updateTool(currentGroup.id, tool.id, { maker: e.target.value })} className="h-8 text-xs w-24" /></td>
                              <td className="px-2 py-1"><Input value={tool.machineNo} onChange={(e) => updateTool(currentGroup.id, tool.id, { machineNo: e.target.value })} className="h-8 text-xs w-24" /></td>
                              <td className="px-2 py-1"><Input value={tool.toolLife} onChange={(e) => updateTool(currentGroup.id, tool.id, { toolLife: e.target.value })} className="h-8 text-xs w-20" /></td>
                              <td className="px-2 py-1"><Input value={tool.set} onChange={(e) => updateTool(currentGroup.id, tool.id, { set: e.target.value })} className="h-8 text-xs w-14" /></td>
                              <td className="px-2 py-1"><Input value={tool.supplier} onChange={(e) => updateTool(currentGroup.id, tool.id, { supplier: e.target.value })} className="h-8 text-xs w-24" /></td>
                              <td className="px-2 py-1"><Input value={tool.dwgNo} onChange={(e) => updateTool(currentGroup.id, tool.id, { dwgNo: e.target.value })} className="h-8 text-xs w-24" /></td>
                              <td className="px-2 py-1 text-center">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => deleteTool(currentGroup.id, tool.id)}><Trash2 className="h-3 w-3" /></Button>
                              </td>
                            </tr>
                          ))}
                          {currentGroup.tools.length === 0 && (
                            <tr><td colSpan={13} className="text-center py-8 text-slate-400">ยังไม่มีรายการเครื่องมือ</td></tr>
                          )}
                        </tbody>
                      </table>
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <Plus className="mx-auto h-12 w-12 mb-4" />
                  <p>เลือกกลุ่มเพื่อดูรายละเอียด</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
