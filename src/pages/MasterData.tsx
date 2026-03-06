import { useState } from 'react';
import { 
  Database, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  ChevronDown, 
  ChevronUp,
  LayoutTemplate,
  Image as ImageIcon,
  List,
  GripVertical,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout } from '@/components/layout/Layout';
import { useMasterDataStore, type FormField } from '@/stores/masterDataStore';
import { toast } from 'sonner';

// Dropdown Categories Management
function CategoriesManagement() {
  const { categories, addCategory, deleteCategory, addCategoryItem, removeCategoryItem } = useMasterDataStore();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryNameTh, setNewCategoryNameTh] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !newCategoryNameTh.trim()) {
      toast.error('กรุณากรอกชื่อหมวดหมู่ทั้งภาษาอังกฤษและภาษาไทย');
      return;
    }
    addCategory({
      name: newCategoryName,
      nameTh: newCategoryNameTh,
      items: []
    });
    setNewCategoryName('');
    setNewCategoryNameTh('');
    toast.success('เพิ่มหมวดหมู่สำเร็จ');
  };

  const handleAddItem = (categoryId: string) => {
    if (!newItemValue.trim()) return;
    // #18: Support comma-separated bulk input
    const items = newItemValue.split(',').map(s => s.trim()).filter(s => s.length > 0);
    let added = 0;
    items.forEach(item => {
      addCategoryItem(categoryId, item);
      added++;
    });
    setNewItemValue('');
    toast.success(`เพิ่ม ${added} รายการสำเร็จ`);
  };

  const toggleExpand = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="space-y-4">
      {/* Add New Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">เพิ่มหมวดหมู่ใหม่</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ชื่อหมวดหมู่ (ภาษาอังกฤษ)</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="เช่น toolTypes"
              />
            </div>
            <div className="space-y-2">
              <Label>ชื่อหมวดหมู่ (ภาษาไทย)</Label>
              <Input
                value={newCategoryNameTh}
                onChange={(e) => setNewCategoryNameTh(e.target.value)}
                placeholder="เช่น ประเภทเครื่องมือ"
              />
            </div>
          </div>
          <Button onClick={handleAddCategory} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มหมวดหมู่
          </Button>
        </CardContent>
      </Card>

      {/* Categories List */}
      <div className="grid gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleExpand(category.id)}
                  >
                    {expandedCategories.has(category.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                  <div>
                    <CardTitle className="text-base">{category.nameTh}</CardTitle>
                    <p className="text-xs text-slate-500">{category.name}</p>
                  </div>
                  <Badge variant="secondary">{category.items.length} รายการ</Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500"
                  onClick={() => {
                    if (confirm('ต้องการลบหมวดหมู่นี้?')) {
                      deleteCategory(category.id);
                      toast.success('ลบหมวดหมู่สำเร็จ');
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            {expandedCategories.has(category.id) && (
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newItemValue}
                      onChange={(e) => setNewItemValue(e.target.value)}
                      placeholder="เพิ่มรายการ (ใช้ , คั่นเพื่อเพิ่มหลายรายการ)"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddItem(category.id);
                      }}
                    />
                    <Button onClick={() => handleAddItem(category.id)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.items.map((item, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="flex items-center gap-1 px-2 py-1"
                      >
                        {item}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1"
                          onClick={() => {
                            removeCategoryItem(category.id, item);
                            toast.success('ลบรายการสำเร็จ');
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// Form Template Builder
function FormTemplateBuilder() {
  const { templates, addTemplate, deleteTemplate, addTemplateField, deleteTemplateField } = useMasterDataStore();
  const { categories } = useMasterDataStore();
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateNameTh, setNewTemplateNameTh] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [newField, setNewField] = useState<Partial<FormField>>({
    name: '',
    nameTh: '',
    type: 'text',
    required: false
  });

  const handleAddTemplate = () => {
    if (!newTemplateName.trim() || !newTemplateNameTh.trim()) return;
    addTemplate({
      name: newTemplateName,
      nameTh: newTemplateNameTh,
      fields: []
    });
    setNewTemplateName('');
    setNewTemplateNameTh('');
    toast.success('เพิ่มเทมเพลตสำเร็จ');
  };

  const handleAddField = (templateId: string) => {
    if (!newField.name || !newField.nameTh) return;
    addTemplateField(templateId, {
      name: newField.name,
      nameTh: newField.nameTh,
      type: newField.type || 'text',
      required: newField.required || false,
      dropdownCategory: newField.dropdownCategory,
      order: 0
    });
    setNewField({ name: '', nameTh: '', type: 'text', required: false });
    toast.success('เพิ่มฟิลด์สำเร็จ');
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-4">
      {/* Add New Template */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">เพิ่มเทมเพลตฟอร์มใหม่</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>ชื่อเทมเพลต (ภาษาอังกฤษ)</Label>
              <Input
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="เช่น toolCodeForm"
              />
            </div>
            <div className="space-y-2">
              <Label>ชื่อเทมเพลต (ภาษาไทย)</Label>
              <Input
                value={newTemplateNameTh}
                onChange={(e) => setNewTemplateNameTh(e.target.value)}
                placeholder="เช่น ฟอร์มรหัสเครื่องมือ"
              />
            </div>
          </div>
          <Button onClick={handleAddTemplate} className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            เพิ่มเทมเพลต
          </Button>
        </CardContent>
      </Card>

      {/* Templates List */}
      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">{template.nameTh}</CardTitle>
                  <p className="text-xs text-slate-500">{template.name}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    แก้ไข
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500"
                    onClick={() => {
                      if (confirm('ต้องการลบเทมเพลตนี้?')) {
                        deleteTemplate(template.id);
                        toast.success('ลบเทมเพลตสำเร็จ');
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">
                {template.fields.length} ฟิลด์
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Template Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไขเทมเพลต: {currentTemplate?.nameTh}</DialogTitle>
          </DialogHeader>
          {currentTemplate && (
            <div className="space-y-4">
              {/* Add New Field */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">เพิ่มฟิลด์ใหม่</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ชื่อฟิลด์ (ภาษาอังกฤษ)</Label>
                      <Input
                        value={newField.name}
                        onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ชื่อฟิลด์ (ภาษาไทย)</Label>
                      <Input
                        value={newField.nameTh}
                        onChange={(e) => setNewField({ ...newField, nameTh: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>ประเภท</Label>
                      <Select
                        value={newField.type}
                        onValueChange={(v: any) => setNewField({ ...newField, type: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="dropdown">Dropdown</SelectItem>
                          <SelectItem value="textarea">Textarea</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newField.type === 'dropdown' && (
                      <div className="space-y-2">
                        <Label>หมวดหมู่ Dropdown</Label>
                        <Select
                          value={newField.dropdownCategory}
                          onValueChange={(v) => setNewField({ ...newField, dropdownCategory: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>{cat.nameTh}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newField.required}
                      onCheckedChange={(v) => setNewField({ ...newField, required: v })}
                    />
                    <Label>บังคับกรอก</Label>
                  </div>
                  <Button onClick={() => handleAddField(currentTemplate.id)} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    เพิ่มฟิลด์
                  </Button>
                </CardContent>
              </Card>

              {/* Fields List */}
              <div className="space-y-2">
                <h4 className="font-medium">ฟิลด์ทั้งหมด</h4>
                {currentTemplate.fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="font-medium">{field.nameTh}</p>
                        <p className="text-xs text-slate-500">{field.name} ({field.type})</p>
                      </div>
                      {field.required && <Badge>บังคับ</Badge>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => {
                        deleteTemplateField(currentTemplate.id, field.id);
                        toast.success('ลบฟิลด์สำเร็จ');
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Pre-set Images Management
function PreSetImagesManagement() {
  const { preSetImages, addPreSetImage, deletePreSetImage } = useMasterDataStore();
  const [newImageName, setNewImageName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAddImage = () => {
    if (!newImageName.trim() || !previewUrl) {
      toast.error('กรุณากรอกชื่อและเลือกรูปภาพ');
      return;
    }
    addPreSetImage({
      name: newImageName,
      url: previewUrl
    });
    setNewImageName('');
    setPreviewUrl(null);
    toast.success('เพิ่มรูปภาพสำเร็จ');
  };

  return (
    <div className="space-y-4">
      {/* Add New Image */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">เพิ่มรูปภาพ Pre-set ใหม่</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>ชื่อรูปภาพ</Label>
            <Input
              value={newImageName}
              onChange={(e) => setNewImageName(e.target.value)}
              placeholder="เช่น 10x20mm"
            />
          </div>
          <div className="space-y-2">
            <Label>เลือกรูปภาพ</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          {previewUrl && (
            <div className="flex justify-center">
              <img src={previewUrl} alt="Preview" className="max-h-40 rounded-lg border" />
            </div>
          )}
          <Button onClick={handleAddImage} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            เพิ่มรูปภาพ
          </Button>
        </CardContent>
      </Card>

      {/* Images Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {preSetImages.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-square bg-slate-100 flex items-center justify-center">
              <img
                src={image.url}
                alt={image.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{image.name}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-red-500"
                  onClick={() => {
                    deletePreSetImage(image.id);
                    toast.success('ลบรูปภาพสำเร็จ');
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Tool Categories Management
function ToolCategoriesManagement() {
  const { originalToolCategories, trialToolCategories, addToolCategory, updateToolCategory, deleteToolCategory } = useMasterDataStore();
  const [editType, setEditType] = useState<'original' | 'trial'>('original');
  const [showAdd, setShowAdd] = useState(false);
  const [editCode, setEditCode] = useState<string | null>(null);

  // Add form state
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newNameTh, setNewNameTh] = useState('');
  const [newPrefixes, setNewPrefixes] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editNameTh, setEditNameTh] = useState('');
  const [editPrefixes, setEditPrefixes] = useState('');

  const handleAdd = () => {
    if (!newCode.trim() || !newName.trim()) {
      toast.error('กรุณากรอก Code และ Name');
      return;
    }
    const cats = editType === 'original' ? originalToolCategories : trialToolCategories;
    if (cats.some(c => c.code === newCode)) {
      toast.error('Code ซ้ำ');
      return;
    }
    const prefixes = newPrefixes.split(',').map(p => p.trim()).filter(Boolean);
    addToolCategory(editType, { code: newCode, name: newName, nameTh: newNameTh || newName, prefixes });
    toast.success(`เพิ่มหมวดหมู่ ${newCode} สำเร็จ`);
    setNewCode(''); setNewName(''); setNewNameTh(''); setNewPrefixes(''); setShowAdd(false);
  };

  const startEdit = (cat: { code: string; name: string; nameTh: string; prefixes?: string[] }) => {
    setEditCode(cat.code);
    setEditName(cat.name);
    setEditNameTh(cat.nameTh);
    setEditPrefixes((cat.prefixes || []).join(', '));
  };

  const handleUpdate = () => {
    if (!editCode) return;
    const prefixes = editPrefixes.split(',').map(p => p.trim()).filter(Boolean);
    updateToolCategory(editType, editCode, { name: editName, nameTh: editNameTh, prefixes });
    toast.success(`อัพเดท ${editCode} สำเร็จ`);
    setEditCode(null);
  };

  const handleDelete = (code: string) => {
    if (!confirm(`ต้องการลบหมวดหมู่ ${code} หรือไม่?`)) return;
    deleteToolCategory(editType, code);
    toast.success(`ลบ ${code} สำเร็จ`);
  };

  const renderCategories = (cats: { code: string; name: string; nameTh: string; prefixes?: string[] }[], color: string) => (
    <div className="space-y-2">
      {cats.map((cat) => (
        <div key={cat.code} className="p-3 bg-slate-50 rounded-lg border">
          {editCode === cat.code ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><Label className="text-xs">Code (ไม่สามารถแก้ไข)</Label><Input value={cat.code} disabled className="bg-slate-100" /></div>
                <div><Label className="text-xs">Name (EN)</Label><Input value={editName} onChange={e => setEditName(e.target.value)} /></div>
                <div><Label className="text-xs">Name (TH)</Label><Input value={editNameTh} onChange={e => setEditNameTh(e.target.value)} /></div>
                <div><Label className="text-xs">Prefix เงื่อนไข (คั่นด้วย ,)</Label><Input value={editPrefixes} onChange={e => setEditPrefixes(e.target.value)} placeholder="P50, P40, P30" /></div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleUpdate}>บันทึก</Button>
                <Button size="sm" variant="outline" onClick={() => setEditCode(null)}>ยกเลิก</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium text-${color}-600`}>{cat.code}</p>
                <p className="text-sm">{cat.name} <span className="text-slate-500">({cat.nameTh})</span></p>
                {cat.prefixes && cat.prefixes.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    <span className="text-xs text-slate-400">Prefix:</span>
                    {cat.prefixes.map(p => (
                      <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(cat)}>
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-400 hover:text-red-600" onClick={() => handleDelete(cat.code)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
      {cats.length === 0 && <p className="text-center text-slate-400 py-4">ไม่มีหมวดหมู่</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant={editType === 'original' ? 'default' : 'outline'} size="sm" onClick={() => setEditType('original')}>
            Original ({originalToolCategories.length})
          </Button>
          <Button variant={editType === 'trial' ? 'default' : 'outline'} size="sm" onClick={() => setEditType('trial')}>
            Trial ({trialToolCategories.length})
          </Button>
        </div>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus className="mr-2 h-4 w-4" />{showAdd ? 'ยกเลิก' : 'เพิ่มหมวดหมู่'}
        </Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader><CardTitle className="text-base">เพิ่มหมวดหมู่ใหม่ ({editType})</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Code</Label><Input value={newCode} onChange={e => setNewCode(e.target.value)} placeholder="เช่น PS" /></div>
              <div><Label className="text-xs">Name (EN)</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="เช่น Pull stud" /></div>
              <div><Label className="text-xs">Name (TH)</Label><Input value={newNameTh} onChange={e => setNewNameTh(e.target.value)} placeholder="เช่น พูลสตั๊ด" /></div>
              <div><Label className="text-xs">Prefix เงื่อนไข (คั่นด้วย ,)</Label><Input value={newPrefixes} onChange={e => setNewPrefixes(e.target.value)} placeholder="P50, P40, P30" /></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Prefix เงื่อนไข: Tool code ที่ขึ้นต้นด้วยค่าที่กำหนด จะจัดอยู่ในหมวดหมู่นี้โดยอัตโนมัติ</p>
            <Button className="mt-3" onClick={handleAdd}>เพิ่มหมวดหมู่</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            หมวดหมู่ {editType === 'original' ? 'Original' : 'Trial'} Code
            ({editType === 'original' ? originalToolCategories.length : trialToolCategories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderCategories(
            editType === 'original' ? originalToolCategories : trialToolCategories,
            editType === 'original' ? 'blue' : 'green'
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function MasterData() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">จัดการ Master Data</h1>
          <p className="text-slate-500">Master Data Management</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="categories">
              <List className="mr-2 h-4 w-4" />
              Dropdown Categories
            </TabsTrigger>
            <TabsTrigger value="templates">
              <LayoutTemplate className="mr-2 h-4 w-4" />
              Form Templates
            </TabsTrigger>
            <TabsTrigger value="preset-images">
              <ImageIcon className="mr-2 h-4 w-4" />
              Pre-set Images
            </TabsTrigger>
            <TabsTrigger value="tool-categories">
              <Database className="mr-2 h-4 w-4" />
              Tool Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <CategoriesManagement />
          </TabsContent>

          <TabsContent value="templates">
            <FormTemplateBuilder />
          </TabsContent>

          <TabsContent value="preset-images">
            <PreSetImagesManagement />
          </TabsContent>

          <TabsContent value="tool-categories">
            <ToolCategoriesManagement />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
