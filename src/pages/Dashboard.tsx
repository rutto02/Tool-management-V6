import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrench, List, FileText, Settings, Users, ChevronRight,
  TrendingUp, Database, QrCode, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Layout } from '@/components/layout/Layout';
import { useAuthStore } from '@/stores/authStore';
import { useToolStore } from '@/stores/toolStore';
import { useDrawingStore } from '@/stores/drawingStore';
import { usePreSettingStore } from '@/stores/preSettingStore';
import { cn, formatDateThai } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

interface MenuItem {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  color: string;
}

const menuItems: MenuItem[] = [
  { id: 'tool-code', title: 'ลงทะเบียนรหัสเครื่องมือ', titleEn: 'Register Tool Code', description: 'ลงทะเบียนรหัสเครื่องมือ Original และ Trial', icon: Wrench, path: '/tool-code', color: 'bg-blue-500' },
  { id: 'tool-list', title: 'ลงทะเบียนรายการเครื่องมือ', titleEn: 'Register Tool List', description: 'สร้างและแก้ไข Tool List Master', icon: List, path: '/tool-list', color: 'bg-green-500' },
  { id: 'tool-drawing', title: 'ลงทะเบียนแบบเครื่องมือ', titleEn: 'Register Tool Drawing', description: 'จัดการแบบวาดและเอกสารเครื่องมือ', icon: FileText, path: '/tool-drawing', color: 'bg-purple-500' },
  { id: 'tool-presetting', title: 'ลงทะเบียนการตั้งค่าเครื่องมือ', titleEn: 'Register Tool Pre-setting', description: 'ตั้งค่า Pre-setting สำหรับเครื่องมือ', icon: Settings, path: '/tool-presetting', color: 'bg-orange-500' },
];

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { toolCodes, toolLists } = useToolStore();
  const { drawings } = useDrawingStore();
  const { preSettings } = usePreSettingStore();
  const isAdmin = user?.role === 'ADMIN';

  // ── Stats ──
  const originalCount = toolCodes.filter(t => t.codeType === 'ORIGINAL').length;
  const trialCount = toolCodes.filter(t => t.codeType === 'TRIAL').length;

  // ── Chart Data: Tool by Type ──
  const toolByType = useMemo(() => {
    const map: Record<string, number> = {};
    toolCodes.forEach(t => { map[t.toolType] = (map[t.toolType] || 0) + 1; });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [toolCodes]);

  // ── Chart Data: Tool by Maker ──
  const toolByMaker = useMemo(() => {
    const map: Record<string, number> = {};
    toolCodes.forEach(t => { if (t.maker) map[t.maker] = (map[t.maker] || 0) + 1; });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [toolCodes]);

  // ── Recent Activity ──
  const recentActivity = useMemo(() => {
    const items: { id: string; type: string; title: string; desc: string; time: string; color: string }[] = [];

    toolCodes.slice(0, 5).forEach(t => {
      items.push({
        id: 'tc-' + t.id, type: 'Tool Code', title: t.toolCode,
        desc: `${t.toolType} - ${t.maker}`, time: t.createdAt, color: 'text-blue-600'
      });
    });
    drawings.slice(0, 5).forEach(d => {
      items.push({
        id: 'dr-' + d.id, type: 'Drawing', title: d.toolCode,
        desc: d.fileName, time: d.uploadedAt, color: 'text-purple-600'
      });
    });
    preSettings.slice(0, 5).forEach(p => {
      items.push({
        id: 'ps-' + p.id, type: 'Pre-setting', title: `${p.toolCode} - ${p.machineNo}`,
        desc: p.fileName, time: p.uploadedAt, color: 'text-orange-600'
      });
    });
    toolLists.slice(0, 3).forEach(tl => {
      items.push({
        id: 'tl-' + tl.id, type: 'Tool List', title: `${tl.toolCode} (${tl.lineNo})`,
        desc: `${tl.model} - ${tl.machineNo}`, time: tl.createdAt, color: 'text-green-600'
      });
    });

    return items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);
  }, [toolCodes, drawings, preSettings, toolLists]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              สวัสดี, {user?.nameTh || 'ผู้ใช้'}
            </h1>
            <p className="text-slate-500">ยินดีต้อนรับสู่ระบบจัดการเครื่องมือ</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">{user?.code}</Badge>
            {isAdmin && <Badge className="bg-red-500 text-white text-sm">ADMIN</Badge>}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 border-blue-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/tool-code/list')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">รหัสเครื่องมือ</p>
                  <p className="text-2xl font-bold text-blue-800">{toolCodes.length}</p>
                  <p className="text-xs text-blue-500 mt-1">Original {originalCount} · Trial {trialCount}</p>
                </div>
                <Wrench className="h-8 w-8 text-blue-300" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/tool-list')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">รายการเครื่องมือ</p>
                  <p className="text-2xl font-bold text-green-800">{toolLists.length}</p>
                  <p className="text-xs text-green-500 mt-1">Tool List Master</p>
                </div>
                <List className="h-8 w-8 text-green-300" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/tool-drawing/view')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">แบบเครื่องมือ</p>
                  <p className="text-2xl font-bold text-purple-800">{drawings.length}</p>
                  <p className="text-xs text-purple-500 mt-1">PDF Drawings</p>
                </div>
                <FileText className="h-8 w-8 text-purple-300" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/tool-presetting/view')}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600">Pre-setting</p>
                  <p className="text-2xl font-bold text-orange-800">{preSettings.length}</p>
                  <p className="text-xs text-orange-500 mt-1">เครื่องจักร {new Set(preSettings.map(p => p.machineNo)).size} เครื่อง</p>
                </div>
                <Settings className="h-8 w-8 text-orange-300" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {toolCodes.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tool by Type - Bar Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  เครื่องมือแยกตามประเภท
                </CardTitle>
              </CardHeader>
              <CardContent>
                {toolByType.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={toolByType} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" fontSize={12} tick={{ fill: '#64748b' }} />
                      <YAxis fontSize={12} tick={{ fill: '#64748b' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                      <Bar dataKey="value" name="จำนวน" radius={[4, 4, 0, 0]}>
                        {toolByType.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-slate-400">ไม่มีข้อมูล</div>
                )}
              </CardContent>
            </Card>

            {/* Tool by Maker - Pie Chart */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  เครื่องมือแยกตามผู้ผลิต
                </CardTitle>
              </CardHeader>
              <CardContent>
                {toolByMaker.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={toolByMaker} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {toolByMaker.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-slate-400">ไม่มีข้อมูล</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Menu Grid */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">เมนูหลัก</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.id} className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group overflow-hidden" onClick={() => navigate(item.path)}>
                  <CardContent className="p-0">
                    <div className="flex items-stretch">
                      <div className={cn("flex items-center justify-center w-20 md:w-24", item.color)}>
                        <Icon className="h-8 w-8 md:h-10 md:w-10 text-white" />
                      </div>
                      <div className="flex-1 p-4 md:p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                            <p className="text-xs text-slate-400 mb-1">{item.titleEn}</p>
                            <p className="text-sm text-slate-500">{item.description}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">ผู้ดูแลระบบ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group" onClick={() => navigate('/admin/approval')}>
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className="flex items-center justify-center w-20 md:w-24 bg-red-500"><Users className="h-8 w-8 md:h-10 md:w-10 text-white" /></div>
                    <div className="flex-1 p-4 md:p-6">
                      <h3 className="font-semibold text-slate-900 group-hover:text-red-600 transition-colors">อนุมัติผู้ใช้</h3>
                      <p className="text-xs text-slate-400 mb-1">User Approval</p>
                      <p className="text-sm text-slate-500">จัดการคำขอลงทะเบียนผู้ใช้ใหม่</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 group" onClick={() => navigate('/master-data')}>
                <CardContent className="p-0">
                  <div className="flex items-stretch">
                    <div className="flex items-center justify-center w-20 md:w-24 bg-slate-700"><Database className="h-8 w-8 md:h-10 md:w-10 text-white" /></div>
                    <div className="flex-1 p-4 md:p-6">
                      <h3 className="font-semibold text-slate-900 group-hover:text-slate-600 transition-colors">Master Data</h3>
                      <p className="text-xs text-slate-400 mb-1">จัดการ Master Data</p>
                      <p className="text-sm text-slate-500">Dropdown, หมวดหมู่, รูปภาพ Pre-set</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">กิจกรรมล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                    <Badge variant="outline" className={cn("text-xs shrink-0", item.color)}>{item.type}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-slate-500 truncate">{item.desc}</p>
                    </div>
                    <p className="text-xs text-slate-400 shrink-0">{formatDateThai(item.time)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <BarChart3 className="mx-auto h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">ยังไม่มีกิจกรรม เริ่มต้นลงทะเบียนเครื่องมือได้เลย</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
