import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, ArrowLeft, CheckCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QRScanner } from '@/components/qr/QRScanner';
import { parseQRCodeData, generateId } from '@/lib/utils';
import { dropdownData } from '@/data/dropdownData';
import { STORAGE_KEYS, mockUsers } from '@/data/mockData';
import type { User, UserRegistration } from '@/types';

export function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'scan' | 'form' | 'success'>('scan');
  const [formData, setFormData] = useState<UserRegistration>({
    code: '',
    nameEn: '',
    nameTh: '',
    gender: 'M',
    position: '',
    section: '',
    department: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQRScan = (data: string) => {
    setError(null);
    
    // Parse QR code data
    const parsedData = parseQRCodeData(data);
    
    if (parsedData) {
      // Map QR data to form fields
      setFormData({
        code: parsedData.code || parsedData.empCode || '',
        nameEn: parsedData.nameEn || parsedData.name || '',
        nameTh: parsedData.nameTh || parsedData.nameTH || '',
        gender: (parsedData.gender === 'F' ? 'F' : 'M') as 'M' | 'F',
        position: '',
        section: '',
        department: ''
      });
      setStep('form');
    } else {
      setError('ไม่สามารถอ่านข้อมูลจาก QR Code ได้ กรุณาลองใหม่');
    }
  };

  const handleInputChange = (field: keyof UserRegistration, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.code || !formData.nameEn || !formData.nameTh || 
        !formData.position || !formData.section || !formData.department) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create new user
    const newUser: User = {
      id: generateId(),
      ...formData,
      role: 'PENDING',
      status: 'PENDING_APPROVAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : mockUsers;
    
    // Check if code already exists
    if (users.some(u => u.code === formData.code)) {
      setError('รหัสพนักงานนี้มีในระบบแล้ว');
      setIsSubmitting(false);
      return;
    }

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    setStep('success');
    setIsSubmitting(false);
  };

  const renderScanStep = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-2">
          <UserPlus className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-semibold">สแกน QR Code</h3>
        <p className="text-sm text-slate-500">
          สแกน QR Code บนบัตรพนักงานเพื่อดึงข้อมูล
        </p>
      </div>

      <QRScanner 
        onScan={handleQRScan}
        width={280}
        height={220}
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => setStep('form')}
        >
          กรอกข้อมูลด้วยตนเอง
        </Button>
      </div>
    </div>
  );

  const renderFormStep = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold">ตรวจสอบและแก้ไขข้อมูล</h3>
        <p className="text-sm text-slate-500">
          ตรวจสอบข้อมูลและเลือกตำแหน่ง แผนก และฝ่าย
        </p>
      </div>

      {/* Personal Info (Read-only from QR) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">รหัสพนักงาน</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value)}
            placeholder="EMP001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">เพศ</Label>
          <Select 
            value={formData.gender} 
            onValueChange={(value: 'M' | 'F') => handleInputChange('gender', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">ชาย</SelectItem>
              <SelectItem value="F">หญิง</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nameEn">ชื่อ-นามสกุล (ภาษาอังกฤษ)</Label>
        <Input
          id="nameEn"
          value={formData.nameEn}
          onChange={(e) => handleInputChange('nameEn', e.target.value)}
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nameTh">ชื่อ-นามสกุล (ภาษาไทย)</Label>
        <Input
          id="nameTh"
          value={formData.nameTh}
          onChange={(e) => handleInputChange('nameTh', e.target.value)}
          placeholder="จอห์น โด"
        />
      </div>

      {/* Dropdown Selections */}
      <div className="space-y-2">
        <Label htmlFor="position">ตำแหน่ง</Label>
        <Select 
          value={formData.position} 
          onValueChange={(value) => handleInputChange('position', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกตำแหน่ง" />
          </SelectTrigger>
          <SelectContent>
            {dropdownData.positions.map((pos) => (
              <SelectItem key={pos} value={pos}>{pos}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="section">แผนก (Section)</Label>
        <Select 
          value={formData.section} 
          onValueChange={(value) => handleInputChange('section', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกแผนก" />
          </SelectTrigger>
          <SelectContent>
            {dropdownData.sections.map((section) => (
              <SelectItem key={section} value={section}>{section}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="department">ฝ่าย (Department)</Label>
        <Select 
          value={formData.department} 
          onValueChange={(value) => handleInputChange('department', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="เลือกฝ่าย" />
          </SelectTrigger>
          <SelectContent>
            {dropdownData.departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => setStep('scan')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          ย้อนกลับ
        </Button>
        <Button 
          type="submit" 
          className="flex-1"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'กำลังส่ง...' : 'ส่งคำขอ'}
        </Button>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600">
        <CheckCircle className="h-10 w-10" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-green-600">ส่งคำขอสำเร็จ</h3>
        <p className="text-slate-600">
          คำขอลงทะเบียนของคุณถูกส่งไปยังผู้ดูแลระบบแล้ว
        </p>
        <p className="text-sm text-slate-500">
          กรุณารอการอนุมัติจากผู้ดูแลระบบ
        </p>
      </div>

      <Button 
        onClick={() => navigate('/login')}
        className="w-full"
      >
        กลับไปหน้าเข้าสู่ระบบ
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4">
            <Wrench className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">TOOLING MANAGEMENT</h1>
          <p className="text-slate-500">ลงทะเบียนผู้ใช้ใหม่</p>
        </div>

        {/* Registration Card */}
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>ลงทะเบียน</CardTitle>
            <CardDescription>
              {step === 'scan' && 'สแกน QR Code เพื่อดึงข้อมูล'}
              {step === 'form' && 'ตรวจสอบและกรอกข้อมูลเพิ่มเติม'}
              {step === 'success' && 'รอการอนุมัติจากผู้ดูแลระบบ'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === 'scan' && renderScanStep()}
            {step === 'form' && renderFormStep()}
            {step === 'success' && renderSuccessStep()}
          </CardContent>
        </Card>

        {/* Back to Login */}
        {step !== 'success' && (
          <div className="text-center">
            <Button 
              variant="link" 
              className="text-slate-500"
              onClick={() => navigate('/login')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              กลับไปหน้าเข้าสู่ระบบ
            </Button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-slate-400">
          © 2025 TOOLING MANAGEMENT SYSTEM. All rights reserved.
        </p>
      </div>
    </div>
  );
}
