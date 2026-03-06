import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Search,
  Download,
  ArrowLeft,
  Wrench,
  Trash2,
  Maximize2,
  ExternalLink,
  X,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout } from '@/components/layout/Layout';
import { usePreSettingStore } from '@/stores/preSettingStore';
import type { ToolPreSettingFile } from '@/stores/preSettingStore';
import { formatDateThai } from '@/lib/utils';
import { toast } from 'sonner';

export function ViewToolPresettings() {
  const navigate = useNavigate();
  const { preSettings, deletePreSetting, getUniqueMachines } = usePreSettingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedPreSetting, setSelectedPreSetting] = useState<ToolPreSettingFile | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const machines = getUniqueMachines();

  const filteredPreSettings = preSettings.filter(p => {
    const matchesSearch = !searchQuery ||
      p.toolCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lineNo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMachine = !selectedMachine || selectedMachine === '__all__' || p.machineNo === selectedMachine;
    return matchesSearch && matchesMachine;
  });

  const uniqueToolCodes = new Set(preSettings.map(p => p.toolCode)).size;
  const totalSize = preSettings.reduce((sum, p) => sum + p.fileSize, 0);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = (preSetting: ToolPreSettingFile) => {
    try {
      const link = document.createElement('a');
      link.href = preSetting.fileData;
      link.download = preSetting.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`ดาวน์โหลด ${preSetting.fileName} สำเร็จ`);
    } catch {
      toast.error('เกิดข้อผิดพลาดในการดาวน์โหลด');
    }
  };

  const handleDelete = (id: string, fileName: string) => {
    if (confirm(`ต้องการลบ ${fileName} หรือไม่?`)) {
      deletePreSetting(id);
      toast.success('ลบการตั้งค่าเรียบร้อย');
    }
  };

  // Open in fullscreen modal
  const handleViewFullscreen = (preSetting: ToolPreSettingFile) => {
    setSelectedPreSetting(preSetting);
    setIsFullscreen(true);
  };

  // Open in new tab
  const handleViewNewTab = (preSetting: ToolPreSettingFile) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${preSetting.toolCode} - ${preSetting.fileName}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { background: #1a1a2e; font-family: Arial, sans-serif; }
              .toolbar {
                position: fixed; top: 0; left: 0; right: 0; z-index: 10;
                background: #16213e; color: #fff; padding: 8px 16px;
                display: flex; align-items: center; justify-content: space-between;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              }
              .toolbar-title { font-size: 14px; font-weight: bold; }
              .toolbar-info { font-size: 12px; color: #94a3b8; }
              .toolbar-actions { display: flex; gap: 8px; }
              .toolbar-actions button {
                background: #2563eb; color: #fff; border: none;
                padding: 6px 16px; border-radius: 6px; cursor: pointer;
                font-size: 13px;
              }
              .toolbar-actions button:hover { background: #1d4ed8; }
              .pdf-container { position: fixed; top: 48px; left: 0; right: 0; bottom: 0; }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <div class="toolbar">
              <div>
                <div class="toolbar-title">${preSetting.toolCode} - ${preSetting.machineNo} - ${preSetting.fileName}</div>
                <div class="toolbar-info">${preSetting.toolType} · ${preSetting.machineNo} · ${formatFileSize(preSetting.fileSize)}</div>
              </div>
              <div class="toolbar-actions">
                <button onclick="downloadFile()">⬇ ดาวน์โหลด</button>
              </div>
            </div>
            <div class="pdf-container">
              <iframe src="${preSetting.fileData}" title="${preSetting.fileName}"></iframe>
            </div>
            <script>
              function downloadFile() {
                const a = document.createElement('a');
                a.href = '${preSetting.fileData}';
                a.download = '${preSetting.fileName}';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    } else {
      toast.error('ไม่สามารถเปิดหน้าใหม่ได้ กรุณาอนุญาต popup');
    }
  };

  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
    setSelectedPreSetting(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/tool-presetting')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">เรียกดูการตั้งค่าเครื่องมือ</h1>
              <p className="text-slate-500">View Tool Pre-settings</p>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="ค้นหาจาก Tool Code, Line No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedMachine} onValueChange={setSelectedMachine}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="เลือกเครื่องจักร" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">ทั้งหมด</SelectItem>
              {machines.map((machine) => (
                <SelectItem key={machine} value={machine}>{machine}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">การตั้งค่าทั้งหมด</p>
              <p className="text-2xl font-bold text-orange-600">{preSettings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Tool Code</p>
              <p className="text-2xl font-bold">{uniqueToolCodes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">เครื่องจักร</p>
              <p className="text-2xl font-bold">{machines.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">ขนาดรวม</p>
              <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Pre-settings List */}
        <Card>
          <CardHeader>
            <CardTitle>รายการการตั้งค่า</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredPreSettings.map((preSetting) => (
                  <div
                    key={preSetting.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Settings className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{preSetting.toolCode}</p>
                          <Badge variant="outline">{preSetting.toolType}</Badge>
                          <Badge variant="secondary">{preSetting.machineNo}</Badge>
                          {preSetting.lineNo && <Badge variant="outline" className="text-xs">{preSetting.lineNo}</Badge>}
                        </div>
                        <p className="text-sm text-slate-500">{preSetting.fileName} · {formatFileSize(preSetting.fileSize)}</p>
                        <p className="text-xs text-slate-400">
                          อัพโหลดเมื่อ {formatDateThai(preSetting.uploadedAt)} โดย {preSetting.uploadedByName}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewFullscreen(preSetting)} title="เปิดเต็มจอ">
                        <Maximize2 className="mr-2 h-4 w-4" />
                        เต็มจอ
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewNewTab(preSetting)} title="เปิดในหน้าใหม่">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        หน้าใหม่
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(preSetting)}>
                        <Download className="mr-2 h-4 w-4" />
                        ดาวน์โหลด
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(preSetting.id, preSetting.fileName)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredPreSettings.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <Wrench className="mx-auto h-12 w-12 mb-4" />
                    <p className="font-medium">
                      {preSettings.length === 0 ? 'ยังไม่มีการตั้งค่าในระบบ' : 'ไม่พบการตั้งค่า'}
                    </p>
                    <p className="text-sm mt-1">
                      {preSettings.length === 0 ? (
                        <Button variant="link" onClick={() => navigate('/tool-presetting')}>
                          ไปที่หน้าอัปโหลด
                        </Button>
                      ) : (
                        'ลองค้นหาด้วย Tool Code หรือเครื่องจักรอื่น'
                      )}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Fullscreen PDF Viewer Modal */}
        {isFullscreen && selectedPreSetting && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 flex flex-col"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-700">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-orange-400" />
                <div>
                  <p className="font-medium text-sm">
                    {selectedPreSetting.toolCode} - {selectedPreSetting.machineNo} - {selectedPreSetting.fileName}
                  </p>
                  <div className="flex gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">{selectedPreSetting.toolType}</Badge>
                    <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">{selectedPreSetting.machineNo}</Badge>
                    {selectedPreSetting.lineNo && (
                      <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">{selectedPreSetting.lineNo}</Badge>
                    )}
                    <span className="text-xs text-slate-400">{formatFileSize(selectedPreSetting.fileSize)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-slate-700"
                  onClick={() => handleViewNewTab(selectedPreSetting)}
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  เปิดในหน้าใหม่
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-slate-700"
                  onClick={() => handleDownload(selectedPreSetting)}
                >
                  <Download className="mr-1 h-4 w-4" />
                  ดาวน์โหลด
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-red-600 ml-2"
                  onClick={handleCloseFullscreen}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* PDF iframe */}
            <div className="flex-1 bg-slate-800">
              <iframe
                src={selectedPreSetting.fileData}
                className="w-full h-full border-none"
                title={selectedPreSetting.fileName}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
