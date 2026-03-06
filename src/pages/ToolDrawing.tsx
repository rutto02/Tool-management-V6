import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Upload, Search, ArrowLeft, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layout } from '@/components/layout/Layout';
import { useToolStore } from '@/stores/toolStore';
import { useDrawingStore } from '@/stores/drawingStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDateThai } from '@/lib/utils';
import { toast } from 'sonner';

export function ToolDrawing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toolCodes } = useToolStore();
  const { drawings, addDrawing, deleteDrawing } = useDrawingStore();
  const [selectedToolCode, setSelectedToolCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showToolSelector, setShowToolSelector] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const filteredToolCodes = toolCodes.filter(t =>
    t.toolCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.toolType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentDrawings = drawings.slice(0, 10);
  const selectedToolInfo = toolCodes.find(t => t.toolCode === selectedToolCode);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('กรุณาอัพโหลดไฟล์ PDF เท่านั้น');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('ไฟล์ต้องมีขนาดไม่เกิน 10MB');
        return;
      }
      setUploadedFile(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpload = async () => {
    if (!selectedToolCode) {
      toast.error('กรุณาเลือก Tool Code');
      return;
    }
    if (!uploadedFile) {
      toast.error('กรุณาเลือกไฟล์ PDF');
      return;
    }

    setIsUploading(true);
    try {
      const fileData = await fileToBase64(uploadedFile);
      addDrawing({
        toolCode: selectedToolCode,
        toolType: selectedToolInfo?.toolType || '',
        maker: selectedToolInfo?.maker || '',
        fileName: uploadedFile.name,
        fileData,
        fileSize: uploadedFile.size,
        uploadedBy: user?.code || '',
        uploadedByName: user?.nameTh || '',
      });
      toast.success(`อัพโหลดแบบเครื่องมือ ${selectedToolCode} สำเร็จ`);
      setSelectedToolCode('');
      setUploadedFile(null);
    } catch {
      toast.error('เกิดข้อผิดพลาดในการอัพโหลด');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string, fileName: string) => {
    if (confirm(`ต้องการลบ ${fileName} หรือไม่?`)) {
      deleteDrawing(id);
      toast.success('ลบแบบเครื่องมือเรียบร้อย');
    }
  };

  const selectToolCode = (toolCode: string) => {
    setSelectedToolCode(toolCode);
    setShowToolSelector(false);
    setSearchQuery('');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">ลงทะเบียนแบบเครื่องมือ</h1>
              <p className="text-slate-500">Register Tool Drawing</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/tool-drawing/view')}>
            <FileText className="mr-2 h-4 w-4" />
            เรียกดูแบบเครื่องมือ ({drawings.length})
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-purple-500" />
              อัปโหลดแบบเครื่องมือ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Tool Code <span className="text-red-500">*</span></Label>
              <div className="flex gap-2">
                <Input value={selectedToolCode} readOnly placeholder="เลือก Tool Code" className="flex-1" />
                <Button variant="outline" onClick={() => setShowToolSelector(true)}>
                  <Search className="mr-2 h-4 w-4" />
                  เลือก
                </Button>
              </div>
            </div>

            {selectedToolInfo && (
              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm text-slate-500 mb-1">Tool Code ที่เลือก</p>
                <p className="text-lg font-semibold">{selectedToolCode}</p>
                <div className="mt-2 flex gap-4 text-sm text-slate-600">
                  <span>Type: <strong>{selectedToolInfo.toolType}</strong></span>
                  <span>Maker: <strong>{selectedToolInfo.maker}</strong></span>
                  <span>DWG: <strong>{selectedToolInfo.dwgNo || '-'}</strong></span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>ไฟล์ PDF <span className="text-red-500">*</span></Label>
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-purple-400 hover:bg-purple-50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('pdf-upload')?.click()}
              >
                <input id="pdf-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-purple-100 rounded-full">
                    <Upload className="h-8 w-8 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-700">
                      {uploadedFile ? (
                        <span className="text-purple-600">{uploadedFile.name} ({formatFileSize(uploadedFile.size)})</span>
                      ) : (
                        'คลิกเพื่อเลือกไฟล์ PDF'
                      )}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">รองรับไฟล์ PDF (สูงสุด 10MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleUpload} disabled={isUploading || !selectedToolCode || !uploadedFile} className="w-full">
              {isUploading ? 'กำลังอัพโหลด...' : (<><Upload className="mr-2 h-4 w-4" />อัพโหลด</>)}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>แบบเครื่องมือล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDrawings.length > 0 ? (
              <div className="space-y-3">
                {recentDrawings.map((drawing) => (
                  <div key={drawing.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FileText className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{drawing.toolCode}</p>
                          <Badge variant="outline" className="text-xs">{drawing.toolType}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">{drawing.fileName} · {formatFileSize(drawing.fileSize)}</p>
                        <p className="text-xs text-slate-400">{formatDateThai(drawing.uploadedAt)} · {drawing.uploadedByName}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(drawing.id, drawing.fileName)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {drawings.length > 10 && (
                  <Button variant="link" className="w-full" onClick={() => navigate('/tool-drawing/view')}>
                    ดูทั้งหมด ({drawings.length} รายการ)
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p className="font-medium">ยังไม่มีแบบเครื่องมือในระบบ</p>
                <p className="text-sm mt-1">เลือก Tool Code และอัปโหลด PDF เพื่อเริ่มต้น</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showToolSelector} onOpenChange={setShowToolSelector}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>เลือก Tool Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="ค้นหา Tool Code..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} autoFocus />
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredToolCodes.map((tool) => (
                    <div key={tool.id} className="p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100" onClick={() => selectToolCode(tool.toolCode)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{tool.toolCode}</p>
                          <p className="text-sm text-slate-500">{tool.toolType}</p>
                        </div>
                        <Badge>{tool.maker}</Badge>
                      </div>
                    </div>
                  ))}
                  {filteredToolCodes.length === 0 && <p className="text-center text-slate-400 py-4">ไม่พบข้อมูล</p>}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
