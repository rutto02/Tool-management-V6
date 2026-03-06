import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Upload, Search, ArrowLeft, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layout } from '@/components/layout/Layout';
import { useToolStore } from '@/stores/toolStore';
import { usePreSettingStore } from '@/stores/preSettingStore';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDateThai } from '@/lib/utils';
import { toast } from 'sonner';
import { Trash2, FileText } from 'lucide-react';

export function ToolPresetting() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toolCodes, toolLists } = useToolStore();
  const { preSettings, addPreSetting, deletePreSetting } = usePreSettingStore();
  const { preSetImages } = useMasterDataStore();
  const [selectedToolCode, setSelectedToolCode] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [lineNo, setLineNo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showToolSelector, setShowToolSelector] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Get unique machines from tool lists + dropdown
  const machines = Array.from(
    new Set([
      ...toolLists.map(t => t.machineNo).filter(Boolean),
      ...preSettings.map(p => p.machineNo).filter(Boolean),
    ])
  );

  const filteredToolCodes = toolCodes.filter(t =>
    t.toolCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.toolType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedToolInfo = toolCodes.find(t => t.toolCode === selectedToolCode);
  const recentPreSettings = preSettings.slice(0, 10);

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
    if (!selectedToolCode) { toast.error('กรุณาเลือก Tool Code'); return; }
    if (!selectedMachine) { toast.error('กรุณาเลือกเครื่องจักร'); return; }
    if (!uploadedFile) { toast.error('กรุณาเลือกไฟล์ PDF'); return; }

    setIsUploading(true);
    try {
      const fileData = await fileToBase64(uploadedFile);
      addPreSetting({
        toolCode: selectedToolCode,
        toolType: selectedToolInfo?.toolType || '',
        maker: selectedToolInfo?.maker || '',
        machineNo: selectedMachine,
        lineNo: lineNo || '',
        fileName: uploadedFile.name,
        fileData,
        fileSize: uploadedFile.size,
        uploadedBy: user?.code || '',
        uploadedByName: user?.nameTh || '',
      });
      toast.success(`อัพโหลดการตั้งค่า ${selectedToolCode} - ${selectedMachine} สำเร็จ`);
      setSelectedToolCode('');
      setSelectedMachine('');
      setLineNo('');
      setUploadedFile(null);
    } catch {
      toast.error('เกิดข้อผิดพลาดในการอัพโหลด');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id: string, fileName: string) => {
    if (confirm(`ต้องการลบ ${fileName} หรือไม่?`)) {
      deletePreSetting(id);
      toast.success('ลบการตั้งค่าเรียบร้อย');
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
              <h1 className="text-2xl font-bold text-slate-900">ลงทะเบียนการตั้งค่าเครื่องมือ</h1>
              <p className="text-slate-500">Register Tool Pre-setting</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/tool-presetting/view')}>
            <Settings className="mr-2 h-4 w-4" />
            เรียกดูการตั้งค่า ({preSettings.length})
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5 text-orange-500" />
              อัปโหลดการตั้งค่า Pre-setting
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>เครื่องจักร (M/C No.) <span className="text-red-500">*</span></Label>
                <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกเครื่องจักร" />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.map((machine) => (
                      <SelectItem key={machine} value={machine}>{machine}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Line No.</Label>
                <Input value={lineNo} onChange={(e) => setLineNo(e.target.value)} placeholder="เช่น MA002" />
              </div>
            </div>

            {(selectedToolInfo || selectedMachine) && (
              <div className="p-4 bg-slate-50 rounded-lg border">
                <p className="text-sm text-slate-500 mb-1">ข้อมูลที่เลือก</p>
                {selectedToolInfo && (
                  <div className="flex gap-4 text-sm">
                    <span>Tool: <strong>{selectedToolCode}</strong></span>
                    <span>Type: <strong>{selectedToolInfo.toolType}</strong></span>
                    <span>Maker: <strong>{selectedToolInfo.maker}</strong></span>
                  </div>
                )}
                {selectedMachine && <p className="text-sm mt-1">Machine: <strong>{selectedMachine}</strong></p>}
              </div>
            )}

            <div className="space-y-2">
              <Label>ไฟล์ PDF การตั้งค่า <span className="text-red-500">*</span></Label>
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-orange-400 hover:bg-orange-50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('preset-upload')?.click()}
              >
                <input id="preset-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-orange-100 rounded-full">
                    <Upload className="h-8 w-8 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-700">
                      {uploadedFile ? (
                        <span className="text-orange-600">{uploadedFile.name} ({formatFileSize(uploadedFile.size)})</span>
                      ) : (
                        'คลิกเพื่อเลือกไฟล์ PDF'
                      )}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">รองรับไฟล์ PDF (สูงสุด 10MB)</p>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleUpload} disabled={isUploading || !selectedToolCode || !selectedMachine || !uploadedFile} className="w-full">
              {isUploading ? 'กำลังอัพโหลด...' : (<><Upload className="mr-2 h-4 w-4" />อัพโหลด</>)}
            </Button>
          </CardContent>
        </Card>

        {/* Pre-set Images Reference */}
        <Card>
          <CardHeader>
            <CardTitle>รูปภาพ Pre-set อ้างอิง</CardTitle>
          </CardHeader>
          <CardContent>
            {preSetImages.length > 0 ? (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {preSetImages.map((img) => (
                  <div key={img.id} className="text-center">
                    <div className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                      <img src={img.url} alt={img.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <p className="text-xs">{img.name}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Wrench className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">ยังไม่มีรูปภาพ Pre-set</p>
                <p className="text-xs">เพิ่มรูปภาพได้ที่เมนู Master Data</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent PreSettings */}
        <Card>
          <CardHeader>
            <CardTitle>การตั้งค่าล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPreSettings.length > 0 ? (
              <div className="space-y-3">
                {recentPreSettings.map((ps) => (
                  <div key={ps.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <FileText className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{ps.toolCode}</p>
                          <Badge variant="secondary">{ps.machineNo}</Badge>
                          {ps.lineNo && <Badge variant="outline">{ps.lineNo}</Badge>}
                        </div>
                        <p className="text-sm text-slate-500">{ps.fileName} · {formatFileSize(ps.fileSize)}</p>
                        <p className="text-xs text-slate-400">{formatDateThai(ps.uploadedAt)} · {ps.uploadedByName}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(ps.id, ps.fileName)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Settings className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">ยังไม่มีการตั้งค่าในระบบ</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tool Code Selector Dialog */}
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
