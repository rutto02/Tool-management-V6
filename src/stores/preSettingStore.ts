import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ToolPreSettingFile {
  id: string;
  toolCode: string;
  toolType: string;
  maker: string;
  machineNo: string;
  lineNo: string;
  fileName: string;
  fileData: string; // base64 encoded PDF
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
}

interface PreSettingState {
  preSettings: ToolPreSettingFile[];
  isLoading: boolean;

  addPreSetting: (preSetting: Omit<ToolPreSettingFile, 'id' | 'uploadedAt'>) => ToolPreSettingFile;
  deletePreSetting: (id: string) => void;
  getPreSettingsByToolCode: (toolCode: string) => ToolPreSettingFile[];
  getPreSettingsByMachine: (machineNo: string) => ToolPreSettingFile[];
  getPreSettingById: (id: string) => ToolPreSettingFile | undefined;
  searchPreSettings: (query: string, machineFilter?: string) => ToolPreSettingFile[];
  getUniqueMachines: () => string[];
}

export const usePreSettingStore = create<PreSettingState>()(
  persist(
    (set, get) => ({
      preSettings: [],
      isLoading: false,

      addPreSetting: (preSetting) => {
        const newPreSetting: ToolPreSettingFile = {
          ...preSetting,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
          uploadedAt: new Date().toISOString(),
        };

        set((state) => ({
          preSettings: [newPreSetting, ...state.preSettings],
        }));

        return newPreSetting;
      },

      deletePreSetting: (id) => {
        set((state) => ({
          preSettings: state.preSettings.filter((p) => p.id !== id),
        }));
      },

      getPreSettingsByToolCode: (toolCode) => {
        return get().preSettings.filter((p) => p.toolCode === toolCode);
      },

      getPreSettingsByMachine: (machineNo) => {
        return get().preSettings.filter((p) => p.machineNo === machineNo);
      },

      getPreSettingById: (id) => {
        return get().preSettings.find((p) => p.id === id);
      },

      searchPreSettings: (query, machineFilter) => {
        const q = query.toLowerCase();
        return get().preSettings.filter((p) => {
          const matchesQuery =
            !query ||
            p.toolCode.toLowerCase().includes(q) ||
            p.fileName.toLowerCase().includes(q) ||
            p.toolType.toLowerCase().includes(q);
          const matchesMachine = !machineFilter || p.machineNo === machineFilter;
          return matchesQuery && matchesMachine;
        });
      },

      getUniqueMachines: () => {
        return Array.from(new Set(get().preSettings.map((p) => p.machineNo).filter(Boolean)));
      },
    }),
    {
      name: 'tooling-presettings-storage',
    }
  )
);
