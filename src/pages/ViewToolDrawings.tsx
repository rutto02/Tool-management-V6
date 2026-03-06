import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Eye,
  Download,
  ArrowLeft,
  FileImage,
  Trash2,
  Maximize2,
  ExternalLink,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layout } from '@/components/layout/Layout';
import { useDrawingStore } from '@/stores/drawingStore';
import type { ToolDrawingFile } from '@/stores/drawingStore';
import { formatDateThai } from '@/lib/utils';
import { toast } from 'sonner';

export function ViewToolDrawings() {
  const navigate = useNavigate();
  const { drawings, deleteDrawing } = useDrawingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrawing, setSelectedDrawing] = useState<ToolDrawingFile | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const filteredDrawings = drawings.filter(d =>
    d.toolCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.toolType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.maker.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const uniqueToolCodes = new Set(drawings.map(d => d.toolCode)).size;
  const totalSize = drawings.reduce((sum, d) => sum + d.fileSize, 0);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDownload = (drawing: ToolDrawingFile) => {
    try {
      const link = document.createElement('a');
      link.href = drawing.fileData;
      link.download = drawing.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`ดาวน์โหลด ${drawing.fileName} สำเร็จ`);
    } catch {
      toast.error('เกิดข้อผิดพลาดในการดาวน์โหลด');
    }
  };

  const handleDelete = (id: string, fileName: string) => {
    if (confirm(`ต้องการลบ ${fileName} หรือไม่?`)) {
      deleteDrawing(id);
      toast.success('ลบแบบเครื่องมือเรียบร้อย');
    }
  };

  // Open in fullscreen modal
  const handleViewFullscreen = (drawing: ToolDrawingFile) => {
    setSelectedDrawing(drawing);
    setIsFullscreen(true);
  };

  // Open in new tab
  const handleViewNewTab = (drawing: ToolDrawingFile) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${drawing.toolCode} - ${drawing.fileName}</title>
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
                font-size: 13px; display: flex; align-items: center; gap: 4px;
              }
              .toolbar-actions button:hover { background: #1d4ed8; }
              .pdf-container {
                position: fixed; top: 48px; left: 0; right: 0; bottom: 0;
              }
              iframe { width: 100%; height: 100%; border: none; }
            </style>
          </head>
          <body>
            <div class="toolbar">
              <div>
                <div class="toolbar-title">${drawing.toolCode} - ${drawing.fileName}</div>
                <div class="toolbar-info">${drawing.toolType} · ${drawing.maker} · ${formatFileSize(drawing.fileSize)}</div>
              </div>
              <div class="toolbar-actions">
                <button onclick="downloadFile()">⬇ ดาวน์โหลด</button>
              </div>
            </div>
            <div class="pdf-container">
              <iframe src="${drawing.fileData}" title="${drawing.fileName}"></iframe>
            </div>
            <script>
              function downloadFile() {
                const a = document.createElement('a');
                a.href = '${drawing.fileData}';
                a.download = '${drawing.fileName}';
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

  // Close fullscreen
  const handleCloseFullscreen = () => {
    setIsFullscreen(false);
    setSelectedDrawing(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/tool-drawing')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">เรียกดูแบบเครื่องมือ</h1>
              <p className="text-slate-500">View Tool Drawings</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="ค้นหาจาก Tool Code, ชื่อไฟล์, Type, Maker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">แบบเครื่องมือทั้งหมด</p>
              <p className="text-2xl font-bold text-purple-600">{drawings.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">Tool Code ที่มีแบบ</p>
              <p className="text-2xl font-bold">{uniqueToolCodes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">ขนาดรวม</p>
              <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-500">ผลการค้นหา</p>
              <p className="text-2xl font-bold">{filteredDrawings.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Drawings List */}
        <Card>
          <CardHeader>
            <CardTitle>รายการแบบเครื่องมือ</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredDrawings.map((drawing) => (
                  <div
                    key={drawing.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <FileText className="h-6 w-6 text-red-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{drawing.toolCode}</p>
                          <Badge variant="outline">{drawing.toolType}</Badge>
                          <Badge variant="secondary">{drawing.maker}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">{drawing.fileName} · {formatFileSize(drawing.fileSize)}</p>
                        <p className="text-xs text-slate-400">
                          อัพโหลดเมื่อ {formatDateThai(drawing.uploadedAt)} โดย {drawing.uploadedByName}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewFullscreen(drawing)} title="เปิดเต็มจอ">
                        <Maximize2 className="mr-2 h-4 w-4" />
                        เต็มจอ
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleViewNewTab(drawing)} title="เปิดในหน้าใหม่">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        หน้าใหม่
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(drawing)}>
                        <Download className="mr-2 h-4 w-4" />
                        ดาวน์โหลด
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(drawing.id, drawing.fileName)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {filteredDrawings.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <FileImage className="mx-auto h-12 w-12 mb-4" />
                    <p className="font-medium">
                      {drawings.length === 0 ? 'ยังไม่มีแบบเครื่องมือในระบบ' : 'ไม่พบแบบเครื่องมือ'}
                    </p>
                    <p className="text-sm mt-1">
                      {drawings.length === 0 ? (
                        <Button variant="link" onClick={() => navigate('/tool-drawing')}>
                          ไปที่หน้าอัปโหลด
                        </Button>
                      ) : (
                        'ลองค้นหาด้วย Tool Code อื่น'
                      )}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Fullscreen PDF Viewer Modal */}
        {isFullscreen && selectedDrawing && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 flex flex-col"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white border-b border-slate-700">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-red-400" />
                <div>
                  <p className="font-medium text-sm">{selectedDrawing.toolCode} - {selectedDrawing.fileName}</p>
                  <div className="flex gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">{selectedDrawing.toolType}</Badge>
                    <Badge variant="outline" className="text-xs border-slate-500 text-slate-300">{selectedDrawing.maker}</Badge>
                    <span className="text-xs text-slate-400">{formatFileSize(selectedDrawing.fileSize)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-slate-700"
                  onClick={() => handleViewNewTab(selectedDrawing)}
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  เปิดในหน้าใหม่
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-slate-700"
                  onClick={() => handleDownload(selectedDrawing)}
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

            {/* PDF iframe - takes up remaining space */}
            <div className="flex-1 bg-slate-800">
              <iframe
                src={selectedDrawing.fileData}
                className="w-full h-full border-none"
                title={selectedDrawing.fileName}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
