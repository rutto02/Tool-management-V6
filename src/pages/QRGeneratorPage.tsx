import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  QrCode, Printer, RefreshCw, ArrowLeft, Download, Pencil, Search, Layers,
  Box, Save, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import QRCodeLib from 'qrcode';
import { useToolStore } from '@/stores/toolStore';
import { useTransactionStore } from '@/stores/transactionStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface QRLabelData {
  id: string;
  toolCode: string;
  lineNo: string;
  model: string;
  machineNo: string;
  operation: string;
  set: string;
  toolLife: string;
  customer: string;
  qrValue: string;
  qrImageUrl: string;
  pcs: number;
  createdAt: string; // ← QR creation date
}

// ============================================================
// QR Label Component - uses QR CREATION date (not today)
// ============================================================
function QRLabel({ data }: { data: QRLabelData }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (data.qrValue) {
      QRCodeLib.toDataURL(data.qrValue, {
        width: 120, margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M'
      }).then(setQrDataUrl).catch(console.error);
    }
  }, [data.qrValue]);

  // ── Rule #6: Use QR creation date, NOT current date ──
  const displayDate = data.createdAt
    ? new Date(data.createdAt).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB');

  return (
    <div style={{ display: 'inline-block' }}>
      <div style={{
        width: '340px', height: '220px',
        fontFamily: 'Arial, Helvetica, sans-serif',
        border: '3px solid #000', boxSizing: 'border-box',
        position: 'relative', overflow: 'hidden', background: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', padding: '4px 8px', height: '28px', boxSizing: 'border-box' }}>
          <span style={{ fontSize: '13px', fontWeight: 'bold', letterSpacing: '1px' }}>SUPPLEMENT KANBAN</span>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{displayDate}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000', padding: '2px 8px', height: '24px', boxSizing: 'border-box' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px' }}>ADVICS MANUFACTURING</span>
          <span style={{ fontSize: '11px' }}>1/1</span>
        </div>
        <div style={{ display: 'flex', height: 'calc(100% - 52px)' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '2px solid #000' }}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid #000', height: '40px', boxSizing: 'border-box' }}>
              <div style={{ width: '50px', padding: '2px 6px', borderRight: '1px solid #000', height: '100%', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>TOOL</span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <span style={{ fontSize: '16px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.toolCode}</span>
              </div>
              <div style={{ width: '50px', borderLeft: '1px solid #000', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '9px', color: '#555' }}>Pcs</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{data.pcs || 1}</span>
              </div>
            </div>
            <div style={{ display: 'flex', borderBottom: '1px solid #000', height: '28px', boxSizing: 'border-box' }}>
              <div style={{ width: '50px', borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Set</span>
              </div>
              <div style={{ flex: 1, borderRight: '1px solid #000', display: 'flex', alignItems: 'center', padding: '0 4px', overflow: 'hidden' }}>
                <span style={{ fontSize: '9px', color: '#555', marginRight: '3px' }}>Line</span>
                <span style={{ fontSize: '10px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.lineNo}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 4px', overflow: 'hidden' }}>
                <span style={{ fontSize: '9px', color: '#555', marginRight: '3px' }}>MC</span>
                <span style={{ fontSize: '10px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.machineNo}</span>
              </div>
            </div>
            <div style={{ display: 'flex', borderBottom: '2px solid #000', height: '28px', boxSizing: 'border-box' }}>
              <div style={{ width: '50px', borderRight: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{data.set || 'A'}</span>
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 8px', overflow: 'hidden' }}>
                <span style={{ fontSize: '9px', color: '#555', marginRight: '4px' }}>OP</span>
                <span style={{ fontSize: '11px', fontWeight: 'bold' }}>{data.operation}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '2px 8px', flex: 1, overflow: 'hidden' }}>
              <span style={{ fontSize: '9px', color: '#555', marginRight: '6px' }}>Model</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{data.model}</span>
            </div>
          </div>
          <div style={{ width: '110px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '4px' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR" style={{ width: '90px', height: '90px' }} />
              ) : (
                <div style={{ width: '90px', height: '90px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#999', border: '1px dashed #ccc' }}>No QR</div>
              )}
            </div>
            {/* ── Tool Life: full visible with word-wrap ── */}
            <div style={{ borderTop: '1px solid #000', width: '100%', textAlign: 'center', padding: '2px 2px' }}>
              <span style={{ fontSize: '8px', color: '#555' }}>Tool life</span>
              <div style={{ fontSize: '13px', fontWeight: 'bold', lineHeight: '1.1', wordBreak: 'break-all' }}>{data.toolLife || '7000'}</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '4px' }}>
        <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#666' }}>{data.qrValue}</span>
      </div>
    </div>
  );
}

// ============================================================
// Main QR Generator Page
// ============================================================
export function QRGeneratorPage() {
  const navigate = useNavigate();
  const { toolLists, generateQRCodes, checkDuplicateKanban, updateToolList, findByKanbanNo, deleteToolList } = useToolStore();
  const { assemblies, addAssembly } = useTransactionStore();
  const { transactions } = useTransactionStore();
  const { user } = useAuthStore();

  const canDelete = user?.role === 'ADMIN' || user?.role === 'STAFF';

  const [labels, setLabels] = useState<QRLabelData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchKanban, setSearchKanban] = useState('');
  const [editItem, setEditItem] = useState<QRLabelData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QRLabelData | null>(null);

  // Assembly
  const [showAssembly, setShowAssembly] = useState(false);
  const [assemblyDesc, setAssemblyDesc] = useState('');
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set());

  // Build labels from tool lists (include createdAt for date rule)
  useEffect(() => {
    const items = toolLists.filter(tl => tl.status === 'DRAFT' || tl.status === 'APPROVED');
    const newLabels: QRLabelData[] = items.map((item) => ({
      id: item.id,
      toolCode: item.toolCode,
      lineNo: item.lineNo || 'L000',
      model: item.model || 'N/A',
      machineNo: item.machineNo || 'MC#00',
      operation: 'OP1',
      set: item.set || 'A',
      toolLife: item.toolLife || '7000',
      customer: '9850',
      qrValue: item.kanban || item.qrCodeNew || '',
      qrImageUrl: '',
      pcs: item.qtyToolNew || 1,
      createdAt: item.createdAt, // ← QR creation date
    }));
    setLabels(newLabels);
  }, [toolLists]);

  // Group by creation date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, QRLabelData[]> = {};
    labels.forEach(label => {
      const date = label.createdAt ? new Date(label.createdAt).toLocaleDateString('th-TH') : 'ไม่ระบุ';
      if (!groups[date]) groups[date] = [];
      groups[date].push(label);
    });
    return groups;
  }, [labels]);

  const totalLabels = labels.length;
  const generatedLabels = labels.filter(l => l.qrValue).length;
  const pendingLabels = totalLabels - generatedLabels;

  // ── Generate All (for remaining pending only) ──
  const handleGenerateAll = async () => {
    setIsGenerating(true);
    let generated = 0;
    for (const item of toolLists) {
      if (item.status !== 'DRAFT' && item.status !== 'APPROVED') continue;
      if (item.qrCodeNew || item.kanban) continue;
      const result = generateQRCodes(item.id);
      if (result) generated++;
    }
    if (generated > 0) toast.success(`สร้าง QR Code สำเร็จ ${generated} รายการ`);
    else toast.info('QR Code ทั้งหมดถูกสร้างไว้แล้ว');
    setIsGenerating(false);
  };

  // ── Search ──
  const handleSearchKanban = () => {
    if (!searchKanban.trim()) return;
    const item = findByKanbanNo(searchKanban.trim());
    if (item) {
      const label = labels.find(l => l.id === item.id);
      if (label) { setEditItem(label); toast.success(`พบ: ${item.toolCode}`); }
    } else { toast.error(`ไม่พบ Kanban No.: ${searchKanban}`); }
  };

  // ── Save edit ──
  const handleSaveEdit = () => {
    if (!editItem) return;
    updateToolList(editItem.id, {
      toolCode: editItem.toolCode, lineNo: editItem.lineNo, model: editItem.model,
      machineNo: editItem.machineNo, set: editItem.set, toolLife: editItem.toolLife,
      kanban: editItem.qrValue, qrCodeNew: editItem.qrValue,
    });
    toast.success(`บันทึก ${editItem.toolCode} สำเร็จ`);
    setEditItem(null);
  };

  // ── Rule #7, #8, #9: Delete QR with role check + safety ──
  const handleDeleteQR = () => {
    if (!deleteTarget) return;
    // Check if QR is used in transactions
    const usedInTx = transactions.filter(t => t.kanbanNo === deleteTarget.qrValue);
    if (usedInTx.length > 0) {
      toast.error(`ไม่สามารถลบได้: QR นี้ถูกใช้ในประวัติเบิก-จ่ายแล้ว ${usedInTx.length} รายการ`);
      setDeleteTarget(null);
      return;
    }
    deleteToolList(deleteTarget.id);
    toast.success(`ลบ QR: ${deleteTarget.toolCode} สำเร็จ`);
    setDeleteTarget(null);
  };

  // ── Print Individual QR (Rule #5) ──
  const handlePrintSingle = useCallback(async (label: QRLabelData) => {
    if (!label.qrValue) { toast.error('ยังไม่มี QR Code'); return; }
    const qrUrl = await QRCodeLib.toDataURL(label.qrValue, { width: 200, margin: 1 });
    const displayDate = label.createdAt ? new Date(label.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
    const pw = window.open('', '_blank');
    if (!pw) { toast.error('Popup ถูกบล็อก'); return; }
    pw.document.write(`<html><head><title>Print QR - ${label.toolCode}</title>
      <style>@page{size:100mm 60mm;margin:2mm;}body{margin:0;font-family:Arial;}</style></head><body>
      <div style="width:90mm;height:55mm;border:2.5px solid #000;box-sizing:border-box;font-family:Arial;overflow:hidden;">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding:0.5mm 2mm;height:6mm;"><span style="font-size:8pt;font-weight:bold;">SUPPLEMENT KANBAN</span><span style="font-size:7pt;font-weight:bold;">${displayDate}</span></div>
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding:0.3mm 2mm;height:5mm;"><span style="font-size:7pt;font-weight:bold;">ADVICS MANUFACTURING</span><span style="font-size:6pt;">1/1</span></div>
        <div style="display:flex;height:calc(100% - 11mm);">
          <div style="flex:1;display:flex;flex-direction:column;border-right:2px solid #000;overflow:hidden;">
            <div style="display:flex;align-items:center;border-bottom:2px solid #000;height:10mm;"><div style="width:10mm;padding:0 1mm;border-right:1px solid #000;height:100%;display:flex;align-items:center;"><span style="font-size:7pt;font-weight:bold;">TOOL</span></div><div style="flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:0 1mm;"><span style="font-size:11pt;font-weight:bold;">${label.toolCode}</span></div><div style="width:10mm;border-left:1px solid #000;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;"><span style="font-size:5pt;">Pcs</span><span style="font-size:8pt;font-weight:bold;">${label.pcs||1}</span></div></div>
            <div style="display:flex;border-bottom:1px solid #000;height:7mm;"><div style="width:10mm;border-right:1px solid #000;display:flex;align-items:center;justify-content:center;"><span style="font-size:6pt;font-weight:bold;">Set</span></div><div style="flex:1;border-right:1px solid #000;display:flex;align-items:center;padding:0 1mm;overflow:hidden;"><span style="font-size:5pt;">Line</span><span style="font-size:7pt;font-weight:bold;margin-left:0.5mm;">${label.lineNo}</span></div><div style="flex:1;display:flex;align-items:center;padding:0 1mm;overflow:hidden;"><span style="font-size:5pt;">MC</span><span style="font-size:7pt;font-weight:bold;margin-left:0.5mm;">${label.machineNo}</span></div></div>
            <div style="display:flex;border-bottom:2px solid #000;height:7mm;"><div style="width:10mm;border-right:1px solid #000;display:flex;align-items:center;justify-content:center;"><span style="font-size:11pt;font-weight:bold;">${label.set||'A'}</span></div><div style="flex:1;display:flex;align-items:center;padding:0 1.5mm;"><span style="font-size:7pt;font-weight:bold;">${label.operation}</span></div></div>
            <div style="display:flex;align-items:center;padding:0.5mm 1.5mm;flex:1;overflow:hidden;"><span style="font-size:5pt;margin-right:1mm;">Model</span><span style="font-size:8pt;font-weight:bold;">${label.model}</span></div>
          </div>
          <div style="width:24mm;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:0.5mm;">
            <div style="flex:1;display:flex;align-items:center;"><img src="${qrUrl}" style="width:20mm;height:20mm;"/></div>
            <div style="border-top:1px solid #000;width:100%;text-align:center;padding:0.3mm 0;"><span style="font-size:5pt;">Tool life</span><div style="font-size:9pt;font-weight:bold;word-break:break-all;line-height:1.1;">${label.toolLife||'7000'}</div></div>
          </div>
        </div>
      </div>
      <script>window.onload=function(){window.print();}</script></body></html>`);
    pw.document.close();
  }, []);

  // ── Print All ──
  const handlePrintAll = useCallback(async () => {
    const withQR = labels.filter(l => l.qrValue);
    if (withQR.length === 0) { toast.error('ไม่มี QR Code สำหรับพิมพ์'); return; }
    const qrUrls: Record<string, string> = {};
    for (const l of withQR) {
      try { qrUrls[l.id] = await QRCodeLib.toDataURL(l.qrValue, { width: 200, margin: 1 }); } catch {}
    }
    const pw = window.open('', '_blank');
    if (!pw) { toast.error('Popup ถูกบล็อก'); return; }
    pw.document.write(`<html><head><title>Print All</title>
      <style>@page{size:A4 landscape;margin:5mm;}body{margin:0;font-family:Arial;}
      .grid{display:flex;flex-wrap:wrap;gap:3mm;}.lbl{page-break-inside:avoid;}
      .lbl *{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}</style></head><body><div class="grid">`);
    for (const l of withQR) {
      const d = l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
      pw.document.write(`<div class="lbl" style="width:90mm;height:55mm;border:2.5px solid #000;box-sizing:border-box;font-family:Arial;overflow:hidden;margin:2mm;">
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding:0.5mm 2mm;height:6mm;"><span style="font-size:8pt;font-weight:bold;">SUPPLEMENT KANBAN</span><span style="font-size:7pt;font-weight:bold;">${d}</span></div>
        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding:0.3mm 2mm;height:5mm;"><span style="font-size:7pt;font-weight:bold;">ADVICS MANUFACTURING</span><span style="font-size:6pt;">1/1</span></div>
        <div style="display:flex;height:calc(100% - 11mm);">
          <div style="flex:1;display:flex;flex-direction:column;border-right:2px solid #000;overflow:hidden;">
            <div style="display:flex;align-items:center;border-bottom:2px solid #000;height:10mm;"><div style="width:10mm;padding:0 1mm;border-right:1px solid #000;height:100%;display:flex;align-items:center;"><span style="font-size:7pt;font-weight:bold;">TOOL</span></div><div style="flex:1;display:flex;align-items:center;justify-content:center;overflow:hidden;padding:0 1mm;"><span style="font-size:11pt;font-weight:bold;">${l.toolCode}</span></div><div style="width:10mm;border-left:1px solid #000;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;"><span style="font-size:5pt;">Pcs</span><span style="font-size:8pt;font-weight:bold;">${l.pcs||1}</span></div></div>
            <div style="display:flex;border-bottom:1px solid #000;height:7mm;"><div style="width:10mm;border-right:1px solid #000;display:flex;align-items:center;justify-content:center;"><span style="font-size:6pt;font-weight:bold;">Set</span></div><div style="flex:1;border-right:1px solid #000;display:flex;align-items:center;padding:0 1mm;overflow:hidden;"><span style="font-size:5pt;">Line</span><span style="font-size:7pt;font-weight:bold;margin-left:0.5mm;">${l.lineNo}</span></div><div style="flex:1;display:flex;align-items:center;padding:0 1mm;overflow:hidden;"><span style="font-size:5pt;">MC</span><span style="font-size:7pt;font-weight:bold;margin-left:0.5mm;">${l.machineNo}</span></div></div>
            <div style="display:flex;border-bottom:2px solid #000;height:7mm;"><div style="width:10mm;border-right:1px solid #000;display:flex;align-items:center;justify-content:center;"><span style="font-size:11pt;font-weight:bold;">${l.set||'A'}</span></div><div style="flex:1;display:flex;align-items:center;padding:0 1.5mm;overflow:hidden;"><span style="font-size:7pt;font-weight:bold;">${l.operation}</span></div></div>
            <div style="display:flex;align-items:center;padding:0.5mm 1.5mm;flex:1;overflow:hidden;"><span style="font-size:5pt;margin-right:1mm;">Model</span><span style="font-size:8pt;font-weight:bold;">${l.model}</span></div>
          </div>
          <div style="width:24mm;display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:0.5mm;">
            <div style="flex:1;display:flex;align-items:center;">${qrUrls[l.id]?`<img src="${qrUrls[l.id]}" style="width:20mm;height:20mm;"/>`:'<div style="width:20mm;height:20mm;background:#eee;"></div>'}</div>
            <div style="border-top:1px solid #000;width:100%;text-align:center;padding:0.3mm 0;"><span style="font-size:5pt;">Tool life</span><div style="font-size:9pt;font-weight:bold;word-break:break-all;line-height:1.1;">${l.toolLife||'7000'}</div></div>
          </div>
        </div>
      </div>`);
    }
    pw.document.write('</div><script>window.onload=function(){window.print();}</script></body></html>');
    pw.document.close();
  }, [labels]);

  // ── Download PNG ──
  const handleDownloadLabel = useCallback(async (label: QRLabelData) => {
    if (!label.qrValue) return;
    try {
      const canvas = document.createElement('canvas');
      const s = 3;
      canvas.width = 340 * s; canvas.height = 240 * s;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(s, s);
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 340, 240);
      ctx.fillStyle = '#000'; ctx.strokeStyle = '#000';
      ctx.lineWidth = 3; ctx.strokeRect(1.5, 1.5, 337, 217);
      const d = label.createdAt ? new Date(label.createdAt).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
      ctx.font = 'bold 13px Arial'; ctx.fillText('SUPPLEMENT KANBAN', 10, 20);
      ctx.font = 'bold 12px Arial'; ctx.fillText(d, 260, 20);
      ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 28); ctx.lineTo(340, 28); ctx.stroke();
      ctx.font = 'bold 12px Arial'; ctx.fillText('ADVICS MANUFACTURING', 10, 44);
      ctx.beginPath(); ctx.moveTo(0, 52); ctx.lineTo(340, 52); ctx.stroke();
      ctx.font = 'bold 16px Arial'; ctx.fillText(label.toolCode, 80, 82);
      ctx.font = 'bold 11px Arial'; ctx.fillText('TOOL', 8, 78);
      ctx.font = '9px Arial'; ctx.fillText(`Line: ${label.lineNo}  MC: ${label.machineNo}`, 8, 108);
      ctx.font = 'bold 18px Arial'; ctx.fillText(label.set || 'A', 18, 138);
      ctx.font = '11px Arial'; ctx.fillText(`Model: ${label.model}`, 8, 165);
      const qrUrl = await QRCodeLib.toDataURL(label.qrValue, { width: 180, margin: 1 });
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 240, 58, 90, 90);
        ctx.font = 'bold 13px Arial'; ctx.fillText(label.toolLife || '7000', 255, 178);
        ctx.font = '9px Arial'; ctx.fillText('Tool life', 260, 160);
        ctx.font = '10px monospace'; ctx.fillStyle = '#666'; ctx.fillText(label.qrValue, 10, 232);
        const link = document.createElement('a');
        link.download = `kanban-${label.toolCode}-${label.set}.png`;
        link.href = canvas.toDataURL('image/png'); link.click();
      };
      img.src = qrUrl;
    } catch { toast.error('ดาวน์โหลดล้มเหลว'); }
  }, []);

  // Assembly
  const handleCreateAssembly = () => {
    if (selectedComponents.size === 0) { toast.error('กรุณาเลือก component อย่างน้อย 1 รายการ'); return; }
    const firstComp = toolLists.find(tl => selectedComponents.has(tl.id));
    const assemblyQR = `ASM-${firstComp?.lineNo || 'L000'}-${Date.now().toString(36).toUpperCase()}`;
    addAssembly({
      assemblyQRCode: assemblyQR,
      componentIds: Array.from(selectedComponents),
      lineNo: firstComp?.lineNo || '', machineNo: firstComp?.machineNo || '',
      set: firstComp?.set || '',
      description: assemblyDesc || `Assembly ${selectedComponents.size} components`,
    });
    toast.success(`สร้าง Assembly QR: ${assemblyQR}`);
    setShowAssembly(false); setSelectedComponents(new Set()); setAssemblyDesc('');
  };

  const toggleComponent = (id: string) => {
    const next = new Set(selectedComponents);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedComponents(next);
  };

  // ── Render QR Card with [Edit] [Print QR] [Delete] ──
  const renderQRCard = (label: QRLabelData, borderColor: string) => (
    <Card key={label.id} className={cn("overflow-hidden", label.qrValue && borderColor)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{label.toolCode}</CardTitle>
          <div className="flex items-center gap-1">
            {label.qrValue ? <Badge className="text-xs bg-green-100 text-green-700">Generated</Badge> : <Badge variant="secondary" className="text-xs">Pending</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center bg-slate-50 p-3 rounded-lg border">
          <QRLabel data={label} />
        </div>
        <div className="mt-2 text-sm text-slate-500 space-y-0.5">
          <p>Line: {label.lineNo} | MC: {label.machineNo} | Set: {label.set}</p>
          {label.qrValue && <p className="font-mono text-xs text-blue-600">{label.qrValue}</p>}
        </div>
        {/* ── Rule #5, #7, #8: Action buttons ── */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditItem({ ...label })}>
            <Pencil className="mr-1 h-3 w-3" />Edit
          </Button>
          {label.qrValue && (
            <>
              <Button variant="outline" size="sm" onClick={() => handlePrintSingle(label)}>
                <Printer className="mr-1 h-3 w-3" />Print QR
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDownloadLabel(label)}>
                <Download className="mr-1 h-3 w-3" />PNG
              </Button>
            </>
          )}
          {canDelete && (
            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget(label)}>
              <Trash2 className="mr-1 h-3 w-3" />Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/tool-list')}><ArrowLeft className="h-4 w-4" /></Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">QR Code Generator</h1>
              <p className="text-slate-500">Supplement Kanban - Component & Assembly QR</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleGenerateAll} disabled={isGenerating || pendingLabels === 0}>
              <RefreshCw className={cn("mr-2 h-4 w-4", isGenerating && "animate-spin")} />Generate All ({pendingLabels})
            </Button>
            <Button variant="outline" onClick={handlePrintAll} disabled={generatedLabels === 0}>
              <Printer className="mr-2 h-4 w-4" />Print All ({generatedLabels})
            </Button>
            <Button variant="outline" onClick={() => setShowAssembly(true)} disabled={generatedLabels < 2}>
              <Layers className="mr-2 h-4 w-4" />สร้าง Assembly QR
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card><CardContent className="p-4"><div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="ค้นหา Kanban No. เพื่อแก้ไข/ลบ..." value={searchKanban} onChange={e => setSearchKanban(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSearchKanban(); }} className="pl-10" />
          </div>
          <Button onClick={handleSearchKanban}>ค้นหา</Button>
        </div></CardContent></Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-slate-500">ทั้งหมด</p><p className="text-2xl font-bold">{totalLabels}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Generated</p><p className="text-2xl font-bold text-green-600">{generatedLabels}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Pending</p><p className="text-2xl font-bold text-amber-600">{pendingLabels}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Assembly QR</p><p className="text-2xl font-bold text-purple-600">{assemblies.length}</p></CardContent></Card>
        </div>

        <Tabs defaultValue="component">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="component"><Box className="mr-2 h-4 w-4" />Component QR</TabsTrigger>
            <TabsTrigger value="assembly"><Layers className="mr-2 h-4 w-4" />Assembly QR</TabsTrigger>
          </TabsList>

          {/* Component QR */}
          <TabsContent value="component">
            <Card><CardHeader><CardTitle className="flex items-center"><QrCode className="mr-2 h-5 w-5 text-blue-500" />Component QR - จัดกลุ่มตามวันที่สร้าง</CardTitle></CardHeader>
              <CardContent>
                {totalLabels === 0 ? (
                  <div className="text-center py-12"><QrCode className="mx-auto h-12 w-12 text-slate-300 mb-4" /><p className="text-slate-500">ไม่มีรายการ</p></div>
                ) : (
                  <ScrollArea className="h-[700px]"><div className="space-y-6">
                    {Object.entries(groupedByDate).map(([date, dateLabels]) => (
                      <div key={date}>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="text-sm">{date}</Badge>
                          <span className="text-xs text-slate-500">{dateLabels.length} รายการ</span>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {dateLabels.map(label => renderQRCard(label, "border-green-200"))}
                        </div>
                      </div>
                    ))}
                  </div></ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assembly QR */}
          <TabsContent value="assembly">
            <Card><CardHeader><CardTitle className="flex items-center"><Layers className="mr-2 h-5 w-5 text-purple-500" />Assembly QR - SAC, SAD, SAR, SAT, SAB, SABC, SACH</CardTitle></CardHeader>
              <CardContent>
                {(() => {
                  const PREFIXES = ['SABC', 'SACH', 'SAC', 'SAD', 'SAR', 'SAT', 'SAB'];
                  const asmLabels = labels.filter(l => PREFIXES.some(p => l.toolCode.startsWith(p)));
                  if (asmLabels.length === 0) return <div className="text-center py-12"><Layers className="mx-auto h-12 w-12 text-slate-300 mb-4" /><p className="text-slate-500">ไม่พบ Tool Code ที่ขึ้นต้นด้วย SAC/SAD/SAR/SAT/SAB/SABC/SACH</p></div>;
                  const grouped: Record<string, typeof asmLabels> = {};
                  asmLabels.forEach(l => { const p = PREFIXES.find(px => l.toolCode.startsWith(px)) || 'OTHER'; if (!grouped[p]) grouped[p] = []; grouped[p].push(l); });
                  return (
                    <ScrollArea className="h-[700px]"><div className="space-y-6">
                      {Object.entries(grouped).map(([prefix, grpLabels]) => (
                        <div key={prefix}>
                          <div className="flex items-center gap-2 mb-3"><Badge className="bg-purple-100 text-purple-700 text-sm">{prefix}</Badge><span className="text-xs text-slate-500">{grpLabels.length} รายการ</span></div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{grpLabels.map(l => renderQRCard(l, "border-purple-200"))}</div>
                        </div>
                      ))}
                    </div></ScrollArea>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>แก้ไข QR Code</DialogTitle></DialogHeader>
            {editItem && (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">Kanban No. (QR No.)</p>
                  <p className="font-mono text-lg font-bold text-blue-800">{editItem.qrValue || 'ยังไม่มี'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Tool Code</Label><Input value={editItem.toolCode} onChange={e => setEditItem({ ...editItem, toolCode: e.target.value })} /></div>
                  <div><Label className="text-xs">Line No.</Label><Input value={editItem.lineNo} onChange={e => setEditItem({ ...editItem, lineNo: e.target.value })} /></div>
                  <div><Label className="text-xs">Machine No.</Label><Input value={editItem.machineNo} onChange={e => setEditItem({ ...editItem, machineNo: e.target.value })} /></div>
                  <div><Label className="text-xs">Set</Label><Input value={editItem.set} onChange={e => setEditItem({ ...editItem, set: e.target.value })} /></div>
                  <div><Label className="text-xs">Model</Label><Input value={editItem.model} onChange={e => setEditItem({ ...editItem, model: e.target.value })} /></div>
                  <div><Label className="text-xs">Tool Life</Label><Input value={editItem.toolLife} onChange={e => setEditItem({ ...editItem, toolLife: e.target.value })} /></div>
                </div>
                <div className="flex justify-center bg-slate-50 p-3 rounded-lg"><QRLabel data={editItem} /></div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditItem(null)}>ยกเลิก</Button>
              <Button onClick={handleSaveEdit}><Save className="mr-2 h-4 w-4" />บันทึก</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Rule #9: Delete Confirmation ── */}
        <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>ยืนยันการลบ QR Code</AlertDialogTitle>
              <AlertDialogDescription>
                ต้องการลบ QR Code ของ <strong>{deleteTarget?.toolCode}</strong> ({deleteTarget?.qrValue}) หรือไม่?
                <br />การลบจะถาวรไม่สามารถกู้คืนได้
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteQR} className="bg-red-600 hover:bg-red-700">ลบ QR Code</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Assembly Dialog */}
        <Dialog open={showAssembly} onOpenChange={setShowAssembly}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>สร้าง Assembly QR Code</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>คำอธิบาย</Label><Input value={assemblyDesc} onChange={e => setAssemblyDesc(e.target.value)} placeholder="เช่น ชุด Tool สำหรับ MC-001 Set A" className="mt-1" /></div>
              <div>
                <p className="text-sm font-medium mb-2">เลือก Components ({selectedComponents.size})</p>
                <ScrollArea className="h-[300px] border rounded-lg">
                  <div className="space-y-1 p-2">
                    {labels.filter(l => l.qrValue).map(label => {
                      const selected = selectedComponents.has(label.id);
                      return (
                        <div key={label.id} className={cn("flex items-center justify-between p-2 rounded cursor-pointer transition-colors", selected ? "bg-purple-50 border border-purple-200" : "hover:bg-slate-50")} onClick={() => toggleComponent(label.id)}>
                          <div className="flex items-center gap-3">
                            <div className={cn("w-5 h-5 rounded border-2 flex items-center justify-center", selected ? "bg-purple-600 border-purple-600" : "border-slate-300")}>{selected && <span className="text-white text-xs">✓</span>}</div>
                            <div><p className="text-sm font-medium">{label.toolCode}</p><p className="text-xs text-slate-500">Line: {label.lineNo} | Set: {label.set}</p></div>
                          </div>
                          <span className="font-mono text-xs text-blue-600">{label.qrValue}</span>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowAssembly(false)}>ยกเลิก</Button>
              <Button onClick={handleCreateAssembly} disabled={selectedComponents.size === 0} className="bg-purple-600 hover:bg-purple-700"><Layers className="mr-2 h-4 w-4" />สร้าง Assembly ({selectedComponents.size})</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
