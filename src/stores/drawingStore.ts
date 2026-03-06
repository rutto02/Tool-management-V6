import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ToolDrawingFile {
  id: string;
  toolCode: string;
  toolType: string;
  maker: string;
  fileName: string;
  fileData: string; // base64 encoded PDF
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByName: string;
}

interface DrawingState {
  drawings: ToolDrawingFile[];
  isLoading: boolean;

  addDrawing: (drawing: Omit<ToolDrawingFile, 'id' | 'uploadedAt'>) => ToolDrawingFile;
  deleteDrawing: (id: string) => void;
  getDrawingsByToolCode: (toolCode: string) => ToolDrawingFile[];
  getDrawingById: (id: string) => ToolDrawingFile | undefined;
  searchDrawings: (query: string) => ToolDrawingFile[];
}

export const useDrawingStore = create<DrawingState>()(
  persist(
    (set, get) => ({
      drawings: [],
      isLoading: false,

      addDrawing: (drawing) => {
        const newDrawing: ToolDrawingFile = {
          ...drawing,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
          uploadedAt: new Date().toISOString(),
        };

        set((state) => ({
          drawings: [newDrawing, ...state.drawings],
        }));

        return newDrawing;
      },

      deleteDrawing: (id) => {
        set((state) => ({
          drawings: state.drawings.filter((d) => d.id !== id),
        }));
      },

      getDrawingsByToolCode: (toolCode) => {
        return get().drawings.filter((d) => d.toolCode === toolCode);
      },

      getDrawingById: (id) => {
        return get().drawings.find((d) => d.id === id);
      },

      searchDrawings: (query) => {
        const q = query.toLowerCase();
        return get().drawings.filter(
          (d) =>
            d.toolCode.toLowerCase().includes(q) ||
            d.fileName.toLowerCase().includes(q) ||
            d.toolType.toLowerCase().includes(q) ||
            d.maker.toLowerCase().includes(q)
        );
      },
    }),
    {
      name: 'tooling-drawings-storage',
    }
  )
);
