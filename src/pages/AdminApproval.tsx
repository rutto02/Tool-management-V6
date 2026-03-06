import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, UserCheck, Users, RefreshCw, Shield, Eye, Pencil, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layout } from '@/components/layout/Layout';
import type { User } from '@/types';
import { STORAGE_KEYS, mockUsers } from '@/data/mockData';
import { getInitials, formatDateThai } from '@/lib/utils';
import { toast } from 'sonner';

const ROLE_CONFIG = {
  ADMIN: { label: 'Admin', color: 'bg-red-100 text-red-700', desc: 'แก้ไขข้อมูลได้ทั้งหมด' },
  STAFF: { label: 'Staff', color: 'bg-blue-100 text-blue-700', desc: 'แก้ไขข้อมูลพื้นฐานได้' },
  VISITOR: { label: 'Visitor', color: 'bg-green-100 text-green-700', desc: 'ดูข้อมูลได้เท่านั้น' },
  PENDING: { label: 'Pending', color: 'bg-amber-100 text-amber-700', desc: 'รอการอนุมัติ' },
};

export function AdminApproval() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = () => {
    setIsLoading(true);
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    const users: User[] = storedUsers ? JSON.parse(storedUsers) : mockUsers;
    setPendingUsers(users.filter(u => u.status === 'PENDING_APPROVAL'));
    setAllUsers(users.filter(u => u.status === 'ACTIVE'));
    setIsLoading(false);
  };

  const handleApprove = (userId: string, role: 'ADMIN' | 'STAFF' | 'VISITOR' = 'STAFF') => {
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!storedUsers) return;
    const users: User[] = JSON.parse(storedUsers);
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, role, status: 'ACTIVE' as const, updatedAt: new Date().toISOString() } : u
    );
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    const user = users.find(u => u.id === userId);
    toast.success(`อนุมัติ ${user?.nameTh} เป็น ${ROLE_CONFIG[role].label} สำเร็จ`);
    loadUsers();
  };

  const handleReject = (userId: string) => {
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!storedUsers) return;
    const users: User[] = JSON.parse(storedUsers);
    const user = users.find(u => u.id === userId);
    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    toast.info(`ปฏิเสธ ${user?.nameTh}`);
    loadUsers();
  };

  const handleChangeRole = (userId: string, newRole: string) => {
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!storedUsers) return;
    const users: User[] = JSON.parse(storedUsers);
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, role: newRole as User['role'], updatedAt: new Date().toISOString() } : u
    );
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    const user = users.find(u => u.id === userId);
    toast.success(`เปลี่ยน Role ของ ${user?.nameTh} เป็น ${newRole} สำเร็จ`);
    loadUsers();
  };

  const handleDeactivate = (userId: string) => {
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!storedUsers) return;
    const users: User[] = JSON.parse(storedUsers);
    const user = users.find(u => u.id === userId);
    if (!confirm(`ต้องการปิดการใช้งาน ${user?.nameTh} หรือไม่?`)) return;
    const updatedUsers = users.map(u =>
      u.id === userId ? { ...u, status: 'INACTIVE' as const, updatedAt: new Date().toISOString() } : u
    );
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));
    toast.info(`ปิดการใช้งาน ${user?.nameTh}`);
    loadUsers();
  };

  const filteredUsers = allUsers.filter(u => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return u.nameTh.toLowerCase().includes(q) || u.nameEn.toLowerCase().includes(q) ||
      u.code.toLowerCase().includes(q) || u.section.toLowerCase().includes(q);
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">จัดการผู้ใช้งาน</h1>
            <p className="text-slate-500">อนุมัติผู้ใช้ใหม่ และจัดการสิทธิ์การเข้าถึง</p>
          </div>
          <Button variant="outline" onClick={loadUsers} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            รีเฟรช
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-slate-500">รออนุมัติ</p><p className="text-2xl font-bold text-amber-600">{pendingUsers.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Admin</p><p className="text-2xl font-bold text-red-600">{allUsers.filter(u => u.role === 'ADMIN').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Staff</p><p className="text-2xl font-bold text-blue-600">{allUsers.filter(u => u.role === 'STAFF').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-slate-500">Visitor</p><p className="text-2xl font-bold text-green-600">{allUsers.filter(u => u.role === 'VISITOR').length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-slate-500">ทั้งหมด</p><p className="text-2xl font-bold">{allUsers.length}</p></CardContent></Card>
        </div>

        {/* Role Legend */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              {Object.entries(ROLE_CONFIG).filter(([k]) => k !== 'PENDING').map(([key, cfg]) => (
                <div key={key} className="flex items-center gap-2">
                  <Badge className={cfg.color}>{cfg.label}</Badge>
                  <span className="text-sm text-slate-500">{cfg.desc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue={pendingUsers.length > 0 ? "pending" : "all"}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              รออนุมัติ {pendingUsers.length > 0 && <Badge variant="destructive" className="ml-2">{pendingUsers.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="all">ผู้ใช้ทั้งหมด ({allUsers.length})</TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending">
            {pendingUsers.length === 0 ? (
              <Alert><AlertDescription className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-600">ไม่มีคำขอรออนุมัติ</p>
              </AlertDescription></Alert>
            ) : (
              <div className="grid gap-4">
                {pendingUsers.map(user => (
                  <Card key={user.id}>
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-6">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-blue-100 text-blue-600">{getInitials(user.nameEn)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold text-lg">{user.nameTh}</h3>
                                <Badge variant="secondary">{user.nameEn}</Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-slate-500">
                                <div><span className="text-slate-400">รหัส:</span> <span className="font-medium">{user.code}</span></div>
                                <div><span className="text-slate-400">ตำแหน่ง:</span> <span className="font-medium">{user.position}</span></div>
                                <div><span className="text-slate-400">แผนก:</span> <span className="font-medium">{user.section}</span></div>
                                <div><span className="text-slate-400">ฝ่าย:</span> <span className="font-medium">{user.department}</span></div>
                              </div>
                              <p className="text-xs text-slate-400">สมัครเมื่อ: {formatDateThai(user.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex md:flex-col justify-end gap-2 p-4 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(user.id, 'STAFF')}>
                            <CheckCircle className="mr-2 h-4 w-4" />อนุมัติ (Staff)
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleApprove(user.id, 'VISITOR')}>
                            <Eye className="mr-2 h-4 w-4" />อนุมัติ (Visitor)
                          </Button>
                          <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => handleReject(user.id)}>
                            <XCircle className="mr-2 h-4 w-4" />ปฏิเสธ
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Users Tab */}
          <TabsContent value="all">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="ค้นหาชื่อ, รหัส, แผนก..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
              </div>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredUsers.map(user => {
                    const roleCfg = ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.STAFF;
                    return (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-slate-50">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-slate-100 text-slate-600 text-sm">{getInitials(user.nameEn)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{user.nameTh}</p>
                              <Badge className={roleCfg.color + ' text-xs'}>{roleCfg.label}</Badge>
                            </div>
                            <p className="text-sm text-slate-500">{user.code} · {user.section} · {user.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select value={user.role} onValueChange={(v) => handleChangeRole(user.id, v)}>
                            <SelectTrigger className="w-32 h-8 text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                              <SelectItem value="STAFF">Staff</SelectItem>
                              <SelectItem value="VISITOR">Visitor</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 text-xs" onClick={() => handleDeactivate(user.id)}>
                            ปิดใช้งาน
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
