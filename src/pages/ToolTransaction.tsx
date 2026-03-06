import { useState, useMemo } from 'react';
import {
  QrCode, Search, Package, ArrowUpRight, ArrowDownLeft, Clock, Camera, Keyboard,
  ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Layout } from '@/components/layout/Layout';
import { useToolStore } from '@/stores/toolStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useAuthStore } from '@/stores/authStore';
import { QRScanner } from '@/components/qr/QRScanner';
import { formatDateThai } from '@/lib/utils';
import { toast } from 'sonner';

export function ToolTransaction() {
  const { findByKanbanNo, toolLists } = useToolStore();
  const { transactions, addTransaction, getTransactionsByToolCode } = useTransactionStore();
  const { user } = useAuthStore();

  // Input mode
  const [inputMode, setInputMode] = useState<'scan' | 'type'>('type');
  const [kanbanInput, setKanbanInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Transaction form
  const [showForm, setShowForm] = useState(false);
  const [txType, setTxType] = useState<'ISSUE' | 'RETURN'>('ISSUE');
  const [txQty, setTxQty] = useState(1);
  const [txNote, setTxNote] = useState('');
  const [foundItem, setFoundItem] = useState<ReturnType<typeof findByKanbanNo>>(undefined);

  // Expanded tool code groups
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Look up kanban
  const handleLookup = (kanbanNo: string) => {
    const trimmed = kanbanNo.trim();
    if (!trimmed) { toast.error('กรุณากรอก Kanban No.'); return; }

    const item = findByKanbanNo(trimmed);
    if (item) {
      setFoundItem(item);
      setShowForm(true);
      toast.success(`พบข้อมูล: ${item.toolCode}`);
    } else {
      toast.error(`ไม่พบ Kanban No.: ${trimmed}`);
      setFoundItem(undefined);
    }
  };

  const handleScan = (data: string) => {
    setKanbanInput(data);
    handleLookup(data);
  };

  const handleSubmitTransaction = () => {
    if (!foundItem || !user) return;

    const kanbanNo = foundItem.kanban || foundItem.qrCodeNew || '';
    addTransaction({
      kanbanNo,
      toolCode: foundItem.toolCode,
      toolType: foundItem.toolType,
      lineNo: foundItem.lineNo,
      machineNo: foundItem.machineNo,
      set: foundItem.set,
      transactionType: txType,
      quantity: txQty,
      scannedBy: user.code,
      scannedByName: user.nameTh,
      note: txNote,
    });

    toast.success(`${txType === 'ISSUE' ? 'เบิก' : 'จ่ายคืน'} ${foundItem.toolCode} สำเร็จ`);
    setShowForm(false);
    setFoundItem(undefined);
    setKanbanInput('');
    setTxQty(1);
    setTxNote('');
  };

  // Group transactions by toolCode
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    const filtered = searchQuery
      ? transactions.filter(t =>
          t.toolCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.kanbanNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.lineNo.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : transactions;

    filtered.forEach(tx => {
      if (!groups[tx.toolCode]) groups[tx.toolCode] = [];
      groups[tx.toolCode].push(tx);
    });
    return groups;
  }, [transactions, searchQuery]);

  const toggleGroup = (toolCode: string) => {
    const next = new Set(expandedGroups);
    if (next.has(toolCode)) next.delete(toolCode);
    else next.add(toolCode);
    setExpandedGroups(next);
  };

  // Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayIssues = transactions.filter(t => t.transactionType === 'ISSUE' && t.createdAt.startsWith(todayStr)).length;
  const todayReturns = transactions.filter(t => t.transactionType === 'RETURN' && t.createdAt.startsWith(todayStr)).length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">เบิก-จ่าย Tools</h1>
          <p className="text-slate-500">สแกน QR Code หรือพิมพ์ Kanban No. เพื่อเบิก-จ่ายเครื่องมือ</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-xs text-slate-500">เบิกวันนี้</p><p className="text-2xl font-bold text-orange-600">{todayIssues}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-slate-500">จ่ายคืนวันนี้</p><p className="text-2xl font-bold text-green-600">{todayReturns}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-slate-500">รายการทั้งหมด</p><p className="text-2xl font-bold">{transactions.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-slate-500">Tool Codes</p><p className="text-2xl font-bold text-blue-600">{Object.keys(groupedTransactions).length}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="scan">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scan"><QrCode className="mr-2 h-4 w-4" />สแกน/เบิก-จ่าย</TabsTrigger>
            <TabsTrigger value="history"><Clock className="mr-2 h-4 w-4" />ประวัติการเบิก-จ่าย</TabsTrigger>
          </TabsList>

          {/* ── Scan / Issue Tab ── */}
          <TabsContent value="scan">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: Input */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">สแกน / พิมพ์ Kanban No.</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button variant={inputMode === 'scan' ? 'default' : 'outline'} size="sm" onClick={() => setInputMode('scan')}>
                      <Camera className="mr-2 h-4 w-4" />กล้อง
                    </Button>
                    <Button variant={inputMode === 'type' ? 'default' : 'outline'} size="sm" onClick={() => setInputMode('type')}>
                      <Keyboard className="mr-2 h-4 w-4" />พิมพ์
                    </Button>
                  </div>

                  {inputMode === 'scan' ? (
                    <QRScanner onScan={handleScan} width={280} height={220} />
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label>Kanban No. (QR No.)</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            placeholder="เช่น QR-L001-EM001-20260304-001"
                            value={kanbanInput}
                            onChange={(e) => setKanbanInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleLookup(kanbanInput); }}
                          />
                          <Button onClick={() => handleLookup(kanbanInput)}>
                            <Search className="mr-2 h-4 w-4" />ค้นหา
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">กด Enter หรือปุ่มค้นหาเพื่อเรียกดูข้อมูล</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right: Recent scans */}
              <Card>
                <CardHeader><CardTitle className="text-lg">รายการล่าสุดวันนี้</CardTitle></CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    {transactions.filter(t => t.createdAt.startsWith(todayStr)).length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <Package className="mx-auto h-10 w-10 mb-2" />
                        <p className="text-sm">ยังไม่มีรายการวันนี้</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {transactions.filter(t => t.createdAt.startsWith(todayStr)).slice(0, 20).map(tx => (
                          <div key={tx.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              {tx.transactionType === 'ISSUE' ? (
                                <ArrowUpRight className="h-4 w-4 text-orange-500" />
                              ) : (
                                <ArrowDownLeft className="h-4 w-4 text-green-500" />
                              )}
                              <div>
                                <p className="text-sm font-medium">{tx.toolCode}</p>
                                <p className="text-xs text-slate-500">{tx.kanbanNo}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={tx.transactionType === 'ISSUE' ? 'destructive' : 'default'} className="text-xs">
                                {tx.transactionType === 'ISSUE' ? 'เบิก' : 'คืน'} x{tx.quantity}
                              </Badge>
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(tx.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── History Tab ── */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">ประวัติการเบิก-จ่าย (จัดกลุ่มตาม Tool Code)</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="ค้นหา Tool Code, Kanban..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  {Object.keys(groupedTransactions).length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Clock className="mx-auto h-12 w-12 mb-4" />
                      <p>ไม่มีประวัติการเบิก-จ่าย</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(groupedTransactions).map(([toolCode, txs]) => {
                        const isExpanded = expandedGroups.has(toolCode);
                        const issues = txs.filter(t => t.transactionType === 'ISSUE').reduce((s, t) => s + t.quantity, 0);
                        const returns = txs.filter(t => t.transactionType === 'RETURN').reduce((s, t) => s + t.quantity, 0);
                        return (
                          <div key={toolCode} className="border rounded-lg overflow-hidden">
                            <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors" onClick={() => toggleGroup(toolCode)}>
                              <div className="flex items-center gap-3">
                                <Package className="h-5 w-5 text-blue-500" />
                                <div className="text-left">
                                  <p className="font-medium">{toolCode}</p>
                                  <p className="text-xs text-slate-500">{txs.length} รายการ</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="destructive" className="text-xs">เบิก {issues}</Badge>
                                <Badge className="text-xs">คืน {returns}</Badge>
                                <Badge variant="outline" className="text-xs">คงเหลือ {issues - returns}</Badge>
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </div>
                            </button>
                            {isExpanded && (
                              <div className="border-t bg-slate-50">
                                <table className="w-full text-sm">
                                  <thead><tr className="text-xs text-slate-500 bg-slate-100">
                                    <th className="p-2 text-left">เวลา</th>
                                    <th className="p-2 text-left">Kanban No.</th>
                                    <th className="p-2 text-left">ประเภท</th>
                                    <th className="p-2 text-left">จำนวน</th>
                                    <th className="p-2 text-left">Line</th>
                                    <th className="p-2 text-left">Machine</th>
                                    <th className="p-2 text-left">ผู้ทำรายการ</th>
                                    <th className="p-2 text-left">หมายเหตุ</th>
                                  </tr></thead>
                                  <tbody>
                                    {txs.map(tx => (
                                      <tr key={tx.id} className="border-t">
                                        <td className="p-2 text-xs">{formatDateThai(tx.createdAt)}</td>
                                        <td className="p-2 font-mono text-xs text-blue-600">{tx.kanbanNo}</td>
                                        <td className="p-2">
                                          <Badge variant={tx.transactionType === 'ISSUE' ? 'destructive' : 'default'} className="text-xs">
                                            {tx.transactionType === 'ISSUE' ? 'เบิก' : 'คืน'}
                                          </Badge>
                                        </td>
                                        <td className="p-2">{tx.quantity}</td>
                                        <td className="p-2">{tx.lineNo}</td>
                                        <td className="p-2">{tx.machineNo}</td>
                                        <td className="p-2 text-xs">{tx.scannedByName}</td>
                                        <td className="p-2 text-xs text-slate-500">{tx.note || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ── Transaction Form Dialog ── */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>เบิก-จ่าย Tool</DialogTitle></DialogHeader>
            {foundItem && (
              <div className="space-y-4">
                {/* Tool info */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
                  <div><p className="text-xs text-slate-500">Tool Code</p><p className="font-medium">{foundItem.toolCode}</p></div>
                  <div><p className="text-xs text-slate-500">Kanban No.</p><p className="font-mono text-sm text-blue-600">{foundItem.kanban || foundItem.qrCodeNew}</p></div>
                  <div><p className="text-xs text-slate-500">Line</p><p className="text-sm">{foundItem.lineNo}</p></div>
                  <div><p className="text-xs text-slate-500">Machine</p><p className="text-sm">{foundItem.machineNo}</p></div>
                  <div><p className="text-xs text-slate-500">Set</p><p className="text-sm">{foundItem.set}</p></div>
                  <div><p className="text-xs text-slate-500">Tool Life</p><p className="text-sm">{foundItem.toolLife}</p></div>
                </div>

                {/* Transaction type */}
                <div className="space-y-2">
                  <Label>ประเภทรายการ</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant={txType === 'ISSUE' ? 'default' : 'outline'}
                      className={txType === 'ISSUE' ? 'bg-orange-600 hover:bg-orange-700' : ''}
                      onClick={() => setTxType('ISSUE')}>
                      <ArrowUpRight className="mr-2 h-4 w-4" />เบิก (Issue)
                    </Button>
                    <Button variant={txType === 'RETURN' ? 'default' : 'outline'}
                      className={txType === 'RETURN' ? 'bg-green-600 hover:bg-green-700' : ''}
                      onClick={() => setTxType('RETURN')}>
                      <ArrowDownLeft className="mr-2 h-4 w-4" />จ่ายคืน (Return)
                    </Button>
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                  <Label>จำนวน</Label>
                  <Input type="number" min={1} value={txQty} onChange={e => setTxQty(Math.max(1, Number(e.target.value)))} />
                </div>

                {/* Note */}
                <div className="space-y-2">
                  <Label>หมายเหตุ (ไม่บังคับ)</Label>
                  <Textarea value={txNote} onChange={e => setTxNote(e.target.value)} rows={2} placeholder="เช่น เปลี่ยน tool เนื่องจากหมดอายุ" />
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>ยกเลิก</Button>
              <Button onClick={handleSubmitTransaction}
                className={txType === 'ISSUE' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}>
                {txType === 'ISSUE' ? 'ยืนยันเบิก' : 'ยืนยันจ่ายคืน'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
