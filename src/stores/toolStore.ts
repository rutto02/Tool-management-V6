import { create } from 'zustand';
import type { ToolCode, ToolListMaster } from '@/types';
import { STORAGE_KEYS, mockToolCodes, mockToolListMasters } from '@/data/mockData';
import { generateToolQRCode } from '@/lib/utils';

interface ToolState {
  toolCodes: ToolCode[];
  toolLists: ToolListMaster[];
  isLoading: boolean;
  
  // Tool Code actions
  addToolCode: (toolCode: Omit<ToolCode, 'id' | 'createdAt' | 'updatedAt'>) => ToolCode;
  updateToolCode: (id: string, updates: Partial<ToolCode>) => void;
  deleteToolCode: (id: string) => void;
  getToolCodesByType: (type: 'ORIGINAL' | 'TRIAL') => ToolCode[];
  
  // Tool List actions
  addToolList: (toolList: Omit<ToolListMaster, 'id' | 'createdAt' | 'updatedAt'>) => ToolListMaster;
  updateToolList: (id: string, updates: Partial<ToolListMaster>) => void;
  deleteToolList: (id: string) => void;

  // QR / Kanban actions
  generateQRCodes: (toolListId: string) => { qrCodeNew: string; qrCodeRegrind: string } | null;
  checkDuplicateKanban: (toolListId: string) => { isDuplicate: boolean; existingKanban: string };
  findByKanbanNo: (kanbanNo: string) => ToolListMaster | undefined;
  updateKanbanNo: (toolListId: string, kanbanNo: string) => void;
  
  // Load data
  loadData: () => void;
}

export const useToolStore = create<ToolState>((set, get) => ({
  toolCodes: [],
  toolLists: [],
  isLoading: false,

  loadData: () => {
    const storedToolCodes = localStorage.getItem(STORAGE_KEYS.TOOL_CODES);
    const storedToolLists = localStorage.getItem(STORAGE_KEYS.TOOL_LISTS);
    
    set({
      toolCodes: storedToolCodes ? JSON.parse(storedToolCodes) : mockToolCodes,
      toolLists: storedToolLists ? JSON.parse(storedToolLists) : mockToolListMasters
    });
  },

  addToolCode: (toolCode) => {
    const newToolCode: ToolCode = {
      ...toolCode,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedToolCodes = [...get().toolCodes, newToolCode];
    set({ toolCodes: updatedToolCodes });
    localStorage.setItem(STORAGE_KEYS.TOOL_CODES, JSON.stringify(updatedToolCodes));
    
    return newToolCode;
  },

  updateToolCode: (id, updates) => {
    const updatedToolCodes = get().toolCodes.map(tc =>
      tc.id === id ? { ...tc, ...updates, updatedAt: new Date().toISOString() } : tc
    );
    set({ toolCodes: updatedToolCodes });
    localStorage.setItem(STORAGE_KEYS.TOOL_CODES, JSON.stringify(updatedToolCodes));
  },

  deleteToolCode: (id) => {
    const updatedToolCodes = get().toolCodes.filter(tc => tc.id !== id);
    set({ toolCodes: updatedToolCodes });
    localStorage.setItem(STORAGE_KEYS.TOOL_CODES, JSON.stringify(updatedToolCodes));
  },

  getToolCodesByType: (type) => {
    return get().toolCodes.filter(tc => tc.codeType === type);
  },

  addToolList: (toolList) => {
    const newToolList: ToolListMaster = {
      ...toolList,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedToolLists = [...get().toolLists, newToolList];
    set({ toolLists: updatedToolLists });
    localStorage.setItem(STORAGE_KEYS.TOOL_LISTS, JSON.stringify(updatedToolLists));
    
    return newToolList;
  },

  updateToolList: (id, updates) => {
    const updatedToolLists = get().toolLists.map(tl =>
      tl.id === id ? { ...tl, ...updates, updatedAt: new Date().toISOString() } : tl
    );
    set({ toolLists: updatedToolLists });
    localStorage.setItem(STORAGE_KEYS.TOOL_LISTS, JSON.stringify(updatedToolLists));
  },

  deleteToolList: (id) => {
    const updatedToolLists = get().toolLists.filter(tl => tl.id !== id);
    set({ toolLists: updatedToolLists });
    localStorage.setItem(STORAGE_KEYS.TOOL_LISTS, JSON.stringify(updatedToolLists));
  },

  // ── Duplicate Detection: check if toolList already has a kanban/QR generated ──
  checkDuplicateKanban: (toolListId) => {
    const toolList = get().toolLists.find(tl => tl.id === toolListId);
    if (!toolList) return { isDuplicate: false, existingKanban: '' };
    
    const existingKanban = toolList.kanban || toolList.qrCodeNew || '';
    if (existingKanban) {
      return { isDuplicate: true, existingKanban };
    }
    
    // Also check if same toolCode+lineNo+set already has a kanban in another record
    const duplicate = get().toolLists.find(tl =>
      tl.id !== toolListId &&
      tl.toolCode === toolList.toolCode &&
      tl.lineNo === toolList.lineNo &&
      tl.set === toolList.set &&
      (tl.kanban || tl.qrCodeNew)
    );
    
    if (duplicate) {
      return { isDuplicate: true, existingKanban: duplicate.kanban || duplicate.qrCodeNew };
    }
    
    return { isDuplicate: false, existingKanban: '' };
  },

  // ── Generate QR + save kanban back to toolList ──
  generateQRCodes: (toolListId) => {
    const toolList = get().toolLists.find(tl => tl.id === toolListId);
    if (!toolList) return null;

    const lineNo = toolList.lineNo || 'L000';
    const toolCode = toolList.toolCode || 'UNKNOWN';

    const qrCodeNew = generateToolQRCode(lineNo, toolCode);
    const qrCodeRegrind = toolList.qtyRegrind > 0 ? generateToolQRCode(lineNo, `${toolCode}-RG`) : '';

    // Save both qrCodeNew AND kanban (unified: Kanban No. = QR No.)
    const updates: Partial<ToolListMaster> = {
      qrCodeNew,
      qrCodeRegrind,
      kanban: qrCodeNew, // ← Save kanban back!
    };

    get().updateToolList(toolListId, updates);

    return { qrCodeNew, qrCodeRegrind };
  },

  // ── Find by Kanban No. (= QR No.) ──
  findByKanbanNo: (kanbanNo) => {
    return get().toolLists.find(tl =>
      tl.kanban === kanbanNo || tl.qrCodeNew === kanbanNo
    );
  },

  // ── Update Kanban No. on a toolList ──
  updateKanbanNo: (toolListId, kanbanNo) => {
    get().updateToolList(toolListId, { kanban: kanbanNo, qrCodeNew: kanbanNo });
  },
}));
