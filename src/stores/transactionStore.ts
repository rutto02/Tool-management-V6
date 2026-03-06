import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ToolTransaction, KanbanAssembly } from '@/types';

interface TransactionState {
  transactions: ToolTransaction[];
  assemblies: KanbanAssembly[];

  // Transaction actions
  addTransaction: (tx: Omit<ToolTransaction, 'id' | 'createdAt'>) => ToolTransaction;
  getTransactionsByToolCode: (toolCode: string) => ToolTransaction[];
  getTransactionsByKanban: (kanbanNo: string) => ToolTransaction[];
  getRecentTransactions: (limit?: number) => ToolTransaction[];

  // Assembly actions
  addAssembly: (assembly: Omit<KanbanAssembly, 'id' | 'createdAt' | 'updatedAt'>) => KanbanAssembly;
  updateAssembly: (id: string, updates: Partial<KanbanAssembly>) => void;
  deleteAssembly: (id: string) => void;
  getAssemblyByQR: (qrCode: string) => KanbanAssembly | undefined;
  getAssemblyComponents: (assemblyId: string) => string[];
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      assemblies: [],

      addTransaction: (tx) => {
        const newTx: ToolTransaction = {
          ...tx,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          transactions: [newTx, ...state.transactions],
        }));
        return newTx;
      },

      getTransactionsByToolCode: (toolCode) => {
        return get().transactions.filter(t => t.toolCode === toolCode);
      },

      getTransactionsByKanban: (kanbanNo) => {
        return get().transactions.filter(t => t.kanbanNo === kanbanNo);
      },

      getRecentTransactions: (limit = 50) => {
        return get().transactions.slice(0, limit);
      },

      addAssembly: (assembly) => {
        const newAssembly: KanbanAssembly = {
          ...assembly,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          assemblies: [newAssembly, ...state.assemblies],
        }));
        return newAssembly;
      },

      updateAssembly: (id, updates) => {
        set((state) => ({
          assemblies: state.assemblies.map(a =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        }));
      },

      deleteAssembly: (id) => {
        set((state) => ({
          assemblies: state.assemblies.filter(a => a.id !== id),
        }));
      },

      getAssemblyByQR: (qrCode) => {
        return get().assemblies.find(a => a.assemblyQRCode === qrCode);
      },

      getAssemblyComponents: (assemblyId) => {
        const assembly = get().assemblies.find(a => a.id === assemblyId);
        return assembly?.componentIds || [];
      },
    }),
    {
      name: 'tooling-transactions-storage',
    }
  )
);
