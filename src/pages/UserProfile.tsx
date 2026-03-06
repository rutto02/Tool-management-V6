import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Save, ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout } from '@/components/layout/Layout';
import { useAuthStore } from '@/stores/authStore';
import { dropdownData } from '@/data/dropdownData';
import { formatDateThai } from '@/lib/utils';
import { toast } from 'sonner';

export function UserProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nameEn: user?.nameEn || '',
    nameTh: user?.nameTh || '',
    position: user?.position || '',
    section: user?.section || '',
    department: user?.department || '',
  });

  if (!user) return null;

  const handleSave = () => {
    updateUser(user.id, formData);
    toast.success('อัพเดทข้อมูลส่วนตัวสำเร็จ');
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      nameEn: user.nameEn,
      nameTh: user.nameTh,
      position: user.position,
      section: user.section,
      department: user.department,
    });
    setIsEditing(false);
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ข้อมูลส่วนตัว</h1>
            <p className="text-slate-500">User Profile</p>
          </div>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-500" />
                ข้อมูลผู้ใช้
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'default'}>{user.role}</Badge>
                <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>{user.status}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Read-only info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-500">รหัสพนักงาน</p>
                <p className="font-semibold text-lg">{user.code}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">เพศ</p>
                <p className="font-medium">{user.gender === 'M' ? 'ชาย' : 'หญิง'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">สมัครเมื่อ</p>
                <p className="text-sm">{formatDateThai(user.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">อัพเดทล่าสุด</p>
                <p className="text-sm">{formatDateThai(user.updatedAt)}</p>
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ชื่อ (ภาษาอังกฤษ)</Label>
                <Input
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>ชื่อ (ภาษาไทย)</Label>
                <Input
                  value={formData.nameTh}
                  onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label>ตำแหน่ง</Label>
                {isEditing ? (
                  <Select value={formData.position} onValueChange={(v) => setFormData({ ...formData, position: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{dropdownData.positions.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <Input value={formData.position} disabled />
                )}
              </div>
              <div className="space-y-2">
                <Label>แผนก</Label>
                {isEditing ? (
                  <Select value={formData.section} onValueChange={(v) => setFormData({ ...formData, section: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{dropdownData.sections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <Input value={formData.section} disabled />
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>ฝ่าย</Label>
                {isEditing ? (
                  <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{dropdownData.departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <Input value={formData.department} disabled />
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>ยกเลิก</Button>
                  <Button onClick={handleSave}><Save className="mr-2 h-4 w-4" />บันทึก</Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline">แก้ไขข้อมูล</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Role info */}
        {user.role === 'ADMIN' && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800">ผู้ดูแลระบบ (Admin)</p>
                  <p className="text-sm text-red-600">คุณมีสิทธิ์เข้าถึง Master Data และอนุมัติผู้ใช้</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
