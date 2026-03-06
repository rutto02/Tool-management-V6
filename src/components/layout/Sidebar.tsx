import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  List, 
  FileText, 
  Settings, 
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Database,
  ChevronDown,
  Eye,
  QrCode,
  FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';


interface SubMenuItem {
  id: string;
  label: string;
  labelTh: string;
  path: string;
}

interface MenuItemWithSub {
  id: string;
  label: string;
  labelTh: string;
  icon: string;
  path: string;
  adminOnly?: boolean;
  subItems?: SubMenuItem[];
}

const menuItems: MenuItemWithSub[] = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    labelTh: 'หน้าหลัก',
    icon: 'LayoutDashboard', 
    path: '/dashboard' 
  },
  { 
    id: 'tool-code', 
    label: 'Register Tool Code', 
    labelTh: 'ลงทะเบียนรหัสเครื่องมือ',
    icon: 'Wrench', 
    path: '/tool-code',
    subItems: [
      { id: 'tool-code-register', label: 'Register', labelTh: 'ลงทะเบียน', path: '/tool-code' },
      { id: 'tool-code-list', label: 'View All Tools', labelTh: 'ดูรายการ tool ทั้งหมด', path: '/tool-code/list' },
    ]
  },
  { 
    id: 'tool-list', 
    label: 'Register Tool List', 
    labelTh: 'ลงทะเบียนรายการเครื่องมือ',
    icon: 'List', 
    path: '/tool-list',
    subItems: [
      { id: 'tool-list-register', label: 'Register Tool Code QR', labelTh: 'Register tool code QR', path: '/tool-list' },
      { id: 'tool-list-create', label: 'Create New Master', labelTh: 'Create New tool list master', path: '/tool-list/create' },
      { id: 'tool-list-revise', label: 'Revise Master', labelTh: 'Revise current tool list master', path: '/tool-list/revise' },
      { id: 'kanban-viewer', label: 'Kanban Viewer', labelTh: 'เรียกดู Kanban ทั้งหมด', path: '/kanban-viewer' },
      { id: 'qr-generator', label: 'QR Generator', labelTh: 'สร้าง QR Code', path: '/qr-generator' },
      { id: 'tool-transaction', label: 'Tool Transaction', labelTh: 'เบิก-จ่าย Tools', path: '/tool-transaction' },
    ]
  },
  { 
    id: 'tool-drawing', 
    label: 'Register Tool Drawing', 
    labelTh: 'ลงทะเบียนแบบเครื่องมือ',
    icon: 'FileText', 
    path: '/tool-drawing',
    subItems: [
      { id: 'tool-drawing-upload', label: 'Upload', labelTh: 'อัพโหลด', path: '/tool-drawing' },
      { id: 'tool-drawing-view', label: 'View Drawings', labelTh: 'เรียกดูแบบเครื่องมือ', path: '/tool-drawing/view' },
    ]
  },
  { 
    id: 'tool-presetting', 
    label: 'Register Tool Pre-setting', 
    labelTh: 'ลงทะเบียนการตั้งค่าเครื่องมือ',
    icon: 'Settings', 
    path: '/tool-presetting',
    subItems: [
      { id: 'tool-presetting-register', label: 'Register', labelTh: 'ลงทะเบียน', path: '/tool-presetting' },
      { id: 'tool-presetting-view', label: 'View Settings', labelTh: 'เรียกดูการตั้งค่า', path: '/tool-presetting/view' },
    ]
  },
  { 
    id: 'master-data', 
    label: 'Master Data', 
    labelTh: 'จัดการ Master data',
    icon: 'Database', 
    path: '/master-data',
    adminOnly: true
  },
  { 
    id: 'admin-approval', 
    label: 'User Approval', 
    labelTh: 'อนุมัติผู้ใช้',
    icon: 'Users', 
    path: '/admin/approval',
    adminOnly: true
  },
  { 
    id: 'database-viewer', 
    label: 'Database Viewer', 
    labelTh: 'ดูฐานข้อมูล',
    icon: 'Database', 
    path: '/database',
    adminOnly: true
  }
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Wrench,
  List,
  FileText,
  Settings,
  Users,
  Database,
  Eye,
  QrCode,
  FolderOpen
};

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // Auto-expand menu containing active route
  const getInitialExpanded = (): Set<string> => {
    const expanded = new Set<string>();
    menuItems.forEach(item => {
      if (item.subItems?.some(sub => location.pathname === sub.path) || location.pathname.startsWith(item.path)) {
        expanded.add(item.id);
      }
    });
    return expanded;
  };
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(getInitialExpanded);

  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const toggleSubMenu = (itemId: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedMenus(newExpanded);
  };

  const filteredMenuItems = menuItems.filter(item => 
    !item.adminOnly || (item.adminOnly && isAdmin)
  );

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-slate-800 text-white transition-all duration-300",
          isOpen ? "w-64" : "w-16",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
          {isOpen ? (
            <div className="flex items-center space-x-2">
              <Wrench className="h-6 w-6 text-blue-400" />
              <span className="font-semibold text-sm">TOOLING MGT</span>
            </div>
          ) : (
            <Wrench className="h-6 w-6 text-blue-400 mx-auto" />
          )}
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={onToggle}
          >
            {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {filteredMenuItems.map((item) => {
              const Icon = iconMap[item.icon];
              const active = isActive(item.path);
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedMenus.has(item.id);

              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      if (hasSubItems) {
                        toggleSubMenu(item.id);
                      } else {
                        handleNavigation(item.path);
                      }
                    }}
                    className={cn(
                      "flex w-full items-center rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                      active 
                        ? "bg-blue-600 text-white" 
                        : "text-slate-300 hover:bg-slate-700 hover:text-white",
                      !isOpen && "justify-center"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", isOpen && "mr-3")} />
                    {isOpen && (
                      <>
                        <span className="truncate flex-1 text-left">{item.labelTh}</span>
                        {hasSubItems && (
                          <ChevronDown className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-180"
                          )} />
                        )}
                      </>
                    )}
                  </button>
                  
                  {/* Sub Menu Items */}
                  {hasSubItems && isExpanded && isOpen && item.subItems && (
                    <ul className="ml-6 mt-1 space-y-1">
                      {item.subItems.map((subItem) => {
                        const subActive = location.pathname === subItem.path;
                        return (
                          <li key={subItem.id}>
                            <button
                              onClick={() => handleNavigation(subItem.path)}
                              className={cn(
                                "flex w-full items-center rounded-lg px-3 py-2 text-sm transition-all duration-200",
                                subActive
                                  ? "bg-blue-500/50 text-white" 
                                  : "text-slate-400 hover:bg-slate-700 hover:text-white"
                              )}
                            >
                              <span className="truncate">{subItem.labelTh}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 p-4">
          {isOpen && user && (
            <div className="mb-4 px-2 cursor-pointer hover:bg-slate-700 rounded-lg p-2 transition-colors" onClick={() => handleNavigation('/profile')}>
              <p className="text-xs text-slate-400">ผู้ใช้งาน</p>
              <p className="text-sm font-medium truncate">{user.nameTh}</p>
              <p className="text-xs text-slate-500">{user.code}</p>
            </div>
          )}
          <Button
            variant="ghost"
            className={cn(
              "w-full text-slate-300 hover:bg-red-600 hover:text-white",
              !isOpen && "justify-center px-2"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {isOpen && <span className="ml-2">ออกจากระบบ</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
