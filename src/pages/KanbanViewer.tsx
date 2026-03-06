import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode, Search, ArrowLeft, MoreHorizontal, Pencil, ExternalLink, Download, Eye,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, X, LayoutList
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Layout } from '@/components/layout/Layout';
import { useToolStore } from '@/stores/toolStore';
import { useAuthStore } from '@/stores/authStore';
import type { ToolListMaster } from '@/types';
import { cn } from '@/lib/utils';

// Column definitions for the kanban table
const COLUMNS = [
  { key: 'kanban', label: 'Kanban No.', width: 'w-44' },
  { key: 'toolCode', label: 'Tool Code', width: 'w-36' },
  { key: 'toolType', label: 'Tool Type', width: 'w-28' },
  { key: 'lineNo', label: 'Line No.', width: 'w-24' },
  { key: 'machineNo', label: 'Machine', width: 'w-28' },
  { key: 'set', label: 'Set', width: 'w-16' },
  { key: 'model', label: 'Model', width: 'w-28' },
  { key: 'toolLife', label: 'Tool Life', width: 'w-24' },
  { key: 'qtyToolNew', label: 'Qty New', width: 'w-20' },
  { key: 'makerToolNew', label: 'Maker', width: 'w-28' },
  { key: 'status', label: 'Status', width: 'w-24' },
  { key: 'createdAt', label: 'วันที่สร้าง', width: 'w-28' },
] as const;

type ColumnKey = typeof COLUMNS[number]['key'];

const PAGE_SIZE_OPTIONS = [25, 50, 100, 250, 500];
const ROW_HEIGHT = 40;
const VISIBLE_ROWS = 20; // rows visible in viewport

export function KanbanViewer() {
  const navigate = useNavigate();
  const { toolLists } = useToolStore();
  const { user } = useAuthStore();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'STAFF';

  // Filters - one per column
  const [filters, setFilters] = useState<Partial<Record<ColumnKey, string>>>({});
  const [showFilters, setShowFilters] = useState(true);

  // Pagination
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Virtual scroll
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [useVirtualScroll, setUseVirtualScroll] = useState(false);

  // Action menu
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);

  // Filter data - optimized with useMemo
  const filteredData = useMemo(() => {
    let data = toolLists;
    const activeFilters = Object.entries(filters).filter(([_, v]) => v && v.trim());

    if (activeFilters.length === 0) return data;

    return data.filter(item => {
      return activeFilters.every(([key, value]) => {
        const fieldValue = getFieldValue(item, key as ColumnKey);
        return fieldValue.toLowerCase().includes(value!.toLowerCase());
      });
    });
  }, [toolLists, filters]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (useVirtualScroll) return filteredData; // virtual scroll uses all data
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, useVirtualScroll]);

  // Virtual scroll calculations
  const totalHeight = useVirtualScroll ? filteredData.length * ROW_HEIGHT : 0;
  const startIndex = useVirtualScroll ? Math.floor(scrollTop / ROW_HEIGHT) : 0;
  const visibleData = useVirtualScroll
    ? filteredData.slice(startIndex, startIndex + VISIBLE_ROWS + 5)
    : paginatedData;
  const offsetY = useVirtualScroll ? startIndex * ROW_HEIGHT : 0;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (useVirtualScroll) {
      setScrollTop(e.currentTarget.scrollTop);
    }
  }, [useVirtualScroll]);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [filters, pageSize]);

  function getFieldValue(item: ToolListMaster, key: ColumnKey): string {
    switch (key) {
      case 'kanban': return item.kanban || item.qrCodeNew || '';
      case 'createdAt': return item.createdAt ? new Date(item.createdAt).toLocaleDateString('th-TH') : '';
      case 'qtyToolNew': return String(item.qtyToolNew || 0);
      default: return String((item as any)[key] || '');
    }
  }

  const updateFilter = (key: ColumnKey, value: string) => {
    setFilters(prev => {
      const next = { ...prev };
      if (value) next[key] = value;
      else delete next[key];
      return next;
    });
  };

  const clearAllFilters = () => setFilters({});
  const activeFilterCount = Object.values(filters).filter(v => v && v.trim()).length;

  // Group by creation date for stats
  const groupByDate = useMemo(() => {
    const groups: Record<string, number> = {};
    filteredData.forEach(item => {
      const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString('th-TH') : 'ไม่ระบุ';
      groups[date] = (groups[date] || 0) + 1;
    });
    return groups;
  }, [filteredData]);

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => navigate('/tool-list')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Kanban Viewer</h1>
              <p className="text-slate-500">เรียกดู Kanban ทั้งหมด ({filteredData.length.toLocaleString()} รายการ)</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant={useVirtualScroll ? "default" : "outline"} size="sm" onClick={() => setUseVirtualScroll(!useVirtualScroll)}>
              <LayoutList className="mr-2 h-4 w-4" />
              {useVirtualScroll ? 'Virtual Scroll' : 'Pagination'}
            </Button>
            <Button variant={showFilters ? "default" : "outline"} size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="mr-1 h-3 w-3" />ล้าง
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-3"><p className="text-xs text-slate-500">ทั้งหมด</p><p className="text-xl font-bold">{toolLists.length.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-xs text-slate-500">ผลลัพธ์</p><p className="text-xl font-bold text-blue-600">{filteredData.length.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-xs text-slate-500">มี Kanban No.</p><p className="text-xl font-bold text-green-600">{toolLists.filter(t => t.kanban || t.qrCodeNew).length.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-3"><p className="text-xs text-slate-500">วันที่สร้าง</p><p className="text-xl font-bold">{Object.keys(groupByDate).length}</p></CardContent></Card>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {/* Header + Filter Row */}
              <table className="w-full text-sm">
                <thead className="bg-slate-100 sticky top-0 z-10">
                  <tr>
                    {COLUMNS.map(col => (
                      <th key={col.key} className={cn("p-2 text-left font-medium text-slate-700", col.width)}>
                        {col.label}
                      </th>
                    ))}
                    <th className="p-2 text-center w-16">Action</th>
                  </tr>
                  {showFilters && (
                    <tr className="bg-slate-50">
                      {COLUMNS.map(col => (
                        <td key={col.key} className="p-1">
                          <Input
                            placeholder={`ค้นหา...`}
                            value={filters[col.key] || ''}
                            onChange={(e) => updateFilter(col.key, e.target.value)}
                            className="h-7 text-xs border-slate-200"
                          />
                        </td>
                      ))}
                      <td className="p-1"></td>
                    </tr>
                  )}
                </thead>
              </table>

              {/* Body - virtualized or paginated */}
              <div
                ref={scrollRef}
                className="overflow-y-auto"
                style={{ height: useVirtualScroll ? VISIBLE_ROWS * ROW_HEIGHT : 'auto', maxHeight: '600px' }}
                onScroll={handleScroll}
              >
                {useVirtualScroll && <div style={{ height: totalHeight, position: 'relative' }}>
                  <div style={{ transform: `translateY(${offsetY}px)` }}>
                    <table className="w-full text-sm">
                      <tbody>
                        {visibleData.map((item) => (
                          <KanbanRow
                            key={item.id}
                            item={item}
                            canEdit={canEdit}
                            isOpen={actionMenuId === item.id}
                            onToggleMenu={() => setActionMenuId(actionMenuId === item.id ? null : item.id)}
                            onNavigate={navigate}
                            getFieldValue={getFieldValue}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>}

                {!useVirtualScroll && (
                  <table className="w-full text-sm">
                    <tbody>
                      {visibleData.map((item) => (
                        <KanbanRow
                          key={item.id}
                          item={item}
                          canEdit={canEdit}
                          isOpen={actionMenuId === item.id}
                          onToggleMenu={() => setActionMenuId(actionMenuId === item.id ? null : item.id)}
                          onNavigate={navigate}
                          getFieldValue={getFieldValue}
                        />
                      ))}
                      {visibleData.length === 0 && (
                        <tr><td colSpan={COLUMNS.length + 1} className="text-center py-12 text-slate-400">
                          <QrCode className="mx-auto h-12 w-12 mb-4" />
                          ไม่พบข้อมูล
                        </td></tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Pagination bar */}
            {!useVirtualScroll && totalPages > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">แสดง</span>
                  <Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
                    <SelectTrigger className="w-20 h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>{PAGE_SIZE_OPTIONS.map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}</SelectContent>
                  </Select>
                  <span className="text-sm text-slate-500">
                    จาก {filteredData.length.toLocaleString()} รายการ (หน้า {currentPage}/{totalPages})
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) page = i + 1;
                    else if (currentPage <= 3) page = i + 1;
                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                    else page = currentPage - 2 + i;
                    return (
                      <Button key={page} variant={page === currentPage ? "default" : "outline"} size="sm" className="h-8 w-8 text-xs" onClick={() => setCurrentPage(page)}>
                        {page}
                      </Button>
                    );
                  })}
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {useVirtualScroll && (
              <div className="px-4 py-2 border-t bg-slate-50 text-sm text-slate-500">
                Virtual Scroll: แสดง {filteredData.length.toLocaleString()} รายการ (เลื่อนเพื่อดูเพิ่มเติม)
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

// ── Memoized Row Component ──
interface KanbanRowProps {
  item: ToolListMaster;
  canEdit: boolean;
  isOpen: boolean;
  onToggleMenu: () => void;
  onNavigate: (path: string) => void;
  getFieldValue: (item: ToolListMaster, key: ColumnKey) => string;
}

function KanbanRow({ item, canEdit, isOpen, onToggleMenu, onNavigate, getFieldValue }: KanbanRowProps) {
  const kanbanNo = item.kanban || item.qrCodeNew || '';

  return (
    <tr className="border-b hover:bg-slate-50 h-10">
      {COLUMNS.map(col => (
        <td key={col.key} className={cn("px-2 py-1 truncate", col.width)}>
          {col.key === 'kanban' ? (
            kanbanNo ? (
              <span className="font-mono text-xs text-blue-600 cursor-pointer hover:underline"
                onClick={() => onNavigate('/qr-generator')}>
                {kanbanNo}
              </span>
            ) : (
              <span className="text-xs text-slate-300">-</span>
            )
          ) : col.key === 'status' ? (
            <Badge variant={item.status === 'APPROVED' ? 'default' : 'secondary'} className="text-xs">
              {item.status}
            </Badge>
          ) : (
            <span className="text-xs">{getFieldValue(item, col.key)}</span>
          )}
        </td>
      ))}
      <td className="px-2 py-1 text-center relative">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggleMenu}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        {isOpen && (
          <div className="absolute right-2 top-8 z-50 bg-white border rounded-lg shadow-lg py-1 min-w-[140px]">
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-50 text-left"
              onClick={() => { onNavigate('/qr-generator'); }}>
              <QrCode className="h-3 w-3" /> ดู QR Code
            </button>
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-50 text-left"
              onClick={() => { onNavigate(`/tool-list/revise`); }}>
              <Eye className="h-3 w-3" /> ดูรายละเอียด
            </button>
            {canEdit && (
              <button className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-50 text-left"
                onClick={() => { onNavigate(`/tool-list/revise`); }}>
                <Pencil className="h-3 w-3" /> แก้ไข
              </button>
            )}
          </div>
        )}
      </td>
    </tr>
  );
}
