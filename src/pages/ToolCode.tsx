import { useState } from 'react';
import { Save, Wrench, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { Layout } from '@/components/layout/Layout';
import { useMasterDataStore } from '@/stores/masterDataStore';
import { useAuthStore } from '@/stores/authStore';
import { useToolStore } from '@/stores/toolStore';
import { toast } from 'sonner';

interface ToolCodeFormData {
  toolType: string;
  toolCode: string;
  lineNo: string;
  machineNo: string;
  sopModel: string;
  processName: string;
  dwgNo: string;
  maker: string;
  supplier: string;
  orderCode: string;
  type: string;
  remark: string;
  status: 'ACTIVE' | 'INACTIVE';
  stockControl: string;
  location: string;
}

const initialFormData: ToolCodeFormData = {
  toolType: '',
  toolCode: '',
  lineNo: '',
  machineNo: '',
  sopModel: '',
  processName: '',
  dwgNo: '',
  maker: '',
  supplier: '',
  orderCode: '',
  type: '',
  remark: '',
  status: 'ACTIVE',
  stockControl: '',
  location: ''
};

export function ToolCode() {
  const { user } = useAuthStore();
  const { addToolCode } = useToolStore();
  const { categories } = useMasterDataStore();
  const [originalForm, setOriginalForm] = useState<ToolCodeFormData>(initialFormData);
  const [trialForm, setTrialForm] = useState<ToolCodeFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // #2: Use masterDataStore for dynamic dropdown (admin-editable)
  const getItems = (key: string): string[] => {
    const cat = categories.find(c => c.name === key);
    return cat?.items || [];
  };

  const handleInputChange = (
    formType: 'original' | 'trial',
    field: keyof ToolCodeFormData,
    value: string
  ) => {
    if (formType === 'original') {
      setOriginalForm(prev => ({ ...prev, [field]: value }));
    } else {
      setTrialForm(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (formType: 'original' | 'trial') => {
    const formData = formType === 'original' ? originalForm : trialForm;
    
    // Validate required fields
    if (!formData.toolType || !formData.toolCode) {
      toast.error('กรุณากรอกข้อมูลที่จำเป็น (Tool Type, Tool Code)');
      return;
    }

    setIsSubmitting(true);

    try {
      addToolCode({
        ...formData,
        requestBy: user?.code || '',
        codeType: formType === 'original' ? 'ORIGINAL' : 'TRIAL'
      });

      toast.success(`บันทึกรหัสเครื่องมือ ${formType === 'original' ? 'Original' : 'Trial'} สำเร็จ`);
      
      // Reset form
      if (formType === 'original') {
        setOriginalForm(initialFormData);
      } else {
        setTrialForm(initialFormData);
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = (formType: 'original' | 'trial') => {
    if (formType === 'original') {
      setOriginalForm(initialFormData);
    } else {
      setTrialForm(initialFormData);
    }
    toast.info('รีเซ็ตฟอร์มเรียบร้อย');
  };

  const renderForm = (formType: 'original' | 'trial') => {
    const formData = formType === 'original' ? originalForm : trialForm;


    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* TOOL TYPE */}
          <div className="space-y-2">
            <Label htmlFor={`${formType}-toolType`}>
              TOOL TYPE <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.toolType}
              onValueChange={(value) => handleInputChange(formType, 'toolType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก Tool Type" />
              </SelectTrigger>
              <SelectContent>
                {getItems("toolTypes").map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* TOOL CODE */}
          <div className="space-y-2">
            <Label htmlFor={`${formType}-toolCode`}>
              TOOL CODE <span className="text-red-500">*</span>
            </Label>
            <Input
              id={`${formType}-toolCode`}
              value={formData.toolCode}
              onChange={(e) => handleInputChange(formType, 'toolCode', e.target.value)}
              placeholder="เช่น EM-001"
            />
          </div>

          {/* LINE NO */}
          <div className="space-y-2">
            <Label htmlFor={`${formType}-lineNo`}>LINE NO</Label>
            <Input
              id={`${formType}-lineNo`}
              value={formData.lineNo}
              onChange={(e) => handleInputChange(formType, 'lineNo', e.target.value)}
              placeholder="เช่น Line 1"
            />
          </div>

          {/* M/C No. */}
          <div className="space-y-2">
            <Label htmlFor={`${formType}-machineNo`}>M/C No.</Label>
            <Select
              value={formData.machineNo}
              onValueChange={(value) => handleInputChange(formType, 'machineNo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก M/C No." />
              </SelectTrigger>
              <SelectContent>
                {getItems("machineNos").map((mc) => (
                  <SelectItem key={mc} value={mc}>{mc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* SOP Model */}
          <div className="space-y-2">
            <Label htmlFor={`${formType}-sopModel`}>SOP Model</Label>
            <Select
              value={formData.sopModel}
              onValueChange={(value) => handleInputChange(formType, 'sopModel', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก SOP Model" />
              </SelectTrigger>
              <SelectContent>
                {getItems("sopModels").map((sop) => (
                  <SelectItem key={sop} value={sop}>{sop}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Process Name */}
          <div className="space-y-2">
            <Label htmlFor={`${formType}-processName`}>Process name</Label>
            <Select
              value={formData.processName}
              onValueChange={(value) => handleInputChange(formType, 'processName', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก Process" />
              </SelectTrigger>
              <SelectContent>
                {getItems("processNames").map((proc) => (
                  <SelectItem key={proc} value={proc}>{proc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* DWG No. */}
          <div className="space-y-2">
            <Label htmlFor={`${formType}-dwgNo`}>DWG No.</Label>
            <Input
              id={`${formType}-dwgNo`}
              value={formData.dwgNo}
              onChange={(e) => handleInputChange(formType, 'dwgNo', e.target.value)}
              placeholder="เช่น DWG-001"
            />
          </div>

          {/* Maker */}
          <div className="space-y-2">
            <Label htmlFor={`${formType}-maker`}>Maker</Label>
            <Select
              value={formData.maker}
              onValueChange={(value) => handleInputChange(formType, 'maker', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก Maker" />
              </SelectTrigger>
              <SelectContent>
                {getItems("makers").map((maker) => (
                  <SelectItem key={maker} value={maker}>{maker}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Supplier */}
          <div className="space-y-2">
            <Label htmlFor={`${formType}-supplier`}>Supplier</Label>
            <Select
              value={formData.supplier}
              onValueChange={(value) => handleInputChange(formType, 'supplier', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก Supplier" />
              </SelectTrigger>
              <SelectContent>
                {getItems("suppliers").map((sup) => (
                  <SelectItem key={sup} value={sup}>{sup}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Order code */}
          <div className="space-y-2">
            <Label htmlFor={`${formType}-orderCode`}>Order code</Label>
            <Input
              id={`${formType}-orderCode`}
              value={formData.orderCode}
              onChange={(e) => handleInputChange(formType, 'orderCode', e.target.value)}
              placeholder="เช่น ORD-001"
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor={`${formType}-type`}>Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange(formType, 'type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก Type" />
              </SelectTrigger>
              <SelectContent>
                {getItems("types").map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor={`${formType}-status`}>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'ACTIVE' | 'INACTIVE') => handleInputChange(formType, 'status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stock control */}
          <div className="space-y-2">
            <Label htmlFor={`${formType}-stockControl`}>Stock control</Label>
            <Select
              value={formData.stockControl}
              onValueChange={(value) => handleInputChange(formType, 'stockControl', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก Stock Control" />
              </SelectTrigger>
              <SelectContent>
                {getItems("stockControls").map((sc) => (
                  <SelectItem key={sc} value={sc}>{sc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor={`${formType}-location`}>Location</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => handleInputChange(formType, 'location', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือก Location" />
              </SelectTrigger>
              <SelectContent>
                {getItems("locations").map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Request by (Read-only) */}
        <div className="space-y-2">
          <Label>Request by</Label>
          <Input
            value={`${user?.nameTh} (${user?.code})`}
            disabled
            className="bg-slate-100"
          />
        </div>

        {/* Remark */}
        <div className="space-y-2">
          <Label htmlFor={`${formType}-remark`}>Remark</Label>
          <Textarea
            id={`${formType}-remark`}
            value={formData.remark}
            onChange={(e) => handleInputChange(formType, 'remark', e.target.value)}
            placeholder="หมายเหตุ..."
            rows={3}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleReset(formType)}
            disabled={isSubmitting}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            รีเซ็ต
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit(formType)}
            disabled={isSubmitting}
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ลงทะเบียนรหัสเครื่องมือ</h1>
          <p className="text-slate-500">Register Tool Code - Original และ Trial</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="original" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="original">Original Code</TabsTrigger>
            <TabsTrigger value="trial">Trial Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="original">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="mr-2 h-5 w-5 text-blue-500" />
                  Original Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderForm('original')}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trial">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="mr-2 h-5 w-5 text-green-500" />
                  Trial Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderForm('trial')}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
