import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { dropdownData as initialDropdownData } from '@/data/dropdownData';

export interface MasterDataCategory {
  id: string;
  name: string;
  nameTh: string;
  items: string[];
}

export interface FormField {
  id: string;
  name: string;
  nameTh: string;
  type: 'text' | 'number' | 'dropdown' | 'textarea';
  required: boolean;
  dropdownCategory?: string;
  order: number;
}

export interface FormTemplate {
  id: string;
  name: string;
  nameTh: string;
  fields: FormField[];
}

export interface PreSetImage {
  id: string;
  name: string;
  url: string;
  file?: File;
}

interface MasterDataState {
  // Dropdown categories
  categories: MasterDataCategory[];
  
  // Form templates
  templates: FormTemplate[];
  
  // Pre-set images
  preSetImages: PreSetImage[];
  
  // Tool categories
  originalToolCategories: { code: string; name: string; nameTh: string; prefixes?: string[] }[];
  trialToolCategories: { code: string; name: string; nameTh: string; prefixes?: string[] }[];
  
  // Actions
  addCategory: (category: Omit<MasterDataCategory, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<MasterDataCategory>) => void;
  deleteCategory: (id: string) => void;
  addCategoryItem: (categoryId: string, item: string) => void;
  removeCategoryItem: (categoryId: string, item: string) => void;
  
  addTemplate: (template: Omit<FormTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<FormTemplate>) => void;
  deleteTemplate: (id: string) => void;
  addTemplateField: (templateId: string, field: Omit<FormField, 'id'>) => void;
  updateTemplateField: (templateId: string, fieldId: string, updates: Partial<FormField>) => void;
  deleteTemplateField: (templateId: string, fieldId: string) => void;
  reorderTemplateFields: (templateId: string, fieldIds: string[]) => void;
  
  addPreSetImage: (image: Omit<PreSetImage, 'id'>) => void;
  deletePreSetImage: (id: string) => void;
  
  getCategoryItems: (categoryName: string) => string[];
  initializeDefaultData: () => void;

  // Tool category CRUD
  addToolCategory: (type: 'original' | 'trial', cat: { code: string; name: string; nameTh: string; prefixes?: string[] }) => void;
  updateToolCategory: (type: 'original' | 'trial', code: string, updates: { name?: string; nameTh?: string; prefixes?: string[] }) => void;
  deleteToolCategory: (type: 'original' | 'trial', code: string) => void;
}

// Default tool categories
const defaultOriginalCategories = [
  { code: 'SAD', name: 'Drill', nameTh: 'ดอกสว่าน' },
  { code: 'SAR', name: 'Reammer', nameTh: 'รีมเมอร์' },
  { code: 'SAT', name: 'Tapping', nameTh: 'ต๊าป' },
  { code: 'SAB', name: 'Accessories', nameTh: 'อุปกรณ์เสริม' },
  { code: 'SAC', name: 'Enmill', nameTh: 'เอ็นมิลล์' },
  { code: 'SABC', name: 'Insert', nameTh: 'อินเสิร์ต' },
  { code: 'SACH', name: 'Holder', nameTh: 'โฮลเดอร์' },
  { code: 'SBHA', name: 'Assetoury', nameTh: 'แอคเซสเซอรี่' },
  { code: 'SABH', name: 'Body Holder', nameTh: 'บอดี้โฮลเดอร์' },
  { code: 'SOAC', name: 'Adapter Holder', nameTh: 'อะแดปเตอร์โฮลเดอร์' },
  { code: 'SWB', name: 'Brushing', nameTh: 'แปรง' },
  { code: 'SQW', name: 'Grinding', nameTh: 'เจียร' },
  { code: 'SELT', name: 'Electrode', nameTh: 'อิเล็กโทรด' },
  { code: 'SAN', name: 'Nozzle', nameTh: 'หัวฉีด' },
];

const defaultTrialCategories = [
  { code: 'TMSAD', name: 'Drill', nameTh: 'ดอกสว่าน' },
  { code: 'TMSAR', name: 'Reammer', nameTh: 'รีมเมอร์' },
  { code: 'TMSAT', name: 'Tapping', nameTh: 'ต๊าป' },
  { code: 'TMSAB', name: 'Accessories', nameTh: 'อุปกรณ์เสริม' },
  { code: 'TMSAC', name: 'Enmill', nameTh: 'เอ็นมิลล์' },
  { code: 'TMSABC', name: 'Insert', nameTh: 'อินเสิร์ต' },
  { code: 'TMSACH', name: 'Holder', nameTh: 'โฮลเดอร์' },
  { code: 'TMSBHA', name: 'Assetoury', nameTh: 'แอคเซสเซอรี่' },
  { code: 'TMSABH', name: 'Body Holder', nameTh: 'บอดี้โฮลเดอร์' },
  { code: 'TMSOAC', name: 'Adapter Holder', nameTh: 'อะแดปเตอร์โฮลเดอร์' },
  { code: 'TMSWB', name: 'Brushing', nameTh: 'แปรง' },
  { code: 'TMSQW', name: 'Grinding', nameTh: 'เจียร' },
  { code: 'TMSELT', name: 'Electrode', nameTh: 'อิเล็กโทรด' },
  { code: 'TMSAN', name: 'Nozzle', nameTh: 'หัวฉีด' },
];

// Convert dropdownData to categories
const convertDropdownToCategories = (): MasterDataCategory[] => {
  const categories: MasterDataCategory[] = [];
  
  Object.entries(initialDropdownData).forEach(([key, value]) => {
    if (Array.isArray(value) && typeof value[0] === 'string') {
      categories.push({
        id: key,
        name: key,
        nameTh: getThaiCategoryName(key),
        items: value as string[]
      });
    }
  });
  
  return categories;
};

const getThaiCategoryName = (key: string): string => {
  const nameMap: Record<string, string> = {
    sections: 'แผนก',
    departments: 'ฝ่าย',
    positions: 'ตำแหน่ง',
    toolTypes: 'ประเภทเครื่องมือ',
    makers: 'ผู้ผลิต',
    suppliers: 'ผู้จำหน่าย',
    machineNos: 'หมายเลขเครื่อง',
    sopModels: 'รุ่น SOP',
    processNames: 'ชื่อกระบวนการ',
    stockControls: 'การควบคุมสต็อก',
    locations: 'สถานที่จัดเก็บ',
    caliperTypes: 'ประเภทคาลิปเปอร์',
    models: 'รุ่น',
    types: 'ประเภท',
    spindles: 'สปินเดิล',
    machinePoints: 'จุดเครื่องจักร',
    toolConners: 'มุมเครื่องมือ',
    machineMakers: 'ผู้ผลิตเครื่องจักร',
  };
  return nameMap[key] || key;
};

export const useMasterDataStore = create<MasterDataState>()(
  persist(
    (set, get) => ({
      categories: convertDropdownToCategories(),
      templates: [],
      preSetImages: [],
      originalToolCategories: defaultOriginalCategories,
      trialToolCategories: defaultTrialCategories,

      addCategory: (category) => {
        const newCategory = { ...category, id: Date.now().toString() };
        set((state) => ({
          categories: [...state.categories, newCategory]
        }));
      },

      updateCategory: (id, updates) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          )
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id)
        }));
      },

      addCategoryItem: (categoryId, item) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === categoryId && !c.items.includes(item)
              ? { ...c, items: [...c.items, item] }
              : c
          )
        }));
      },

      removeCategoryItem: (categoryId, item) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === categoryId
              ? { ...c, items: c.items.filter((i) => i !== item) }
              : c
          )
        }));
      },

      addTemplate: (template) => {
        const newTemplate = { ...template, id: Date.now().toString() };
        set((state) => ({
          templates: [...state.templates, newTemplate]
        }));
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          )
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id)
        }));
      },

      addTemplateField: (templateId, field) => {
        const newField = { ...field, id: Date.now().toString() };
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? { ...t, fields: [...t.fields, newField] }
              : t
          )
        }));
      },

      updateTemplateField: (templateId, fieldId, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  fields: t.fields.map((f) =>
                    f.id === fieldId ? { ...f, ...updates } : f
                  )
                }
              : t
          )
        }));
      },

      deleteTemplateField: (templateId, fieldId) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? { ...t, fields: t.fields.filter((f) => f.id !== fieldId) }
              : t
          )
        }));
      },

      reorderTemplateFields: (templateId, fieldIds) => {
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.id !== templateId) return t;
            const fieldMap = new Map(t.fields.map((f) => [f.id, f]));
            return {
              ...t,
              fields: fieldIds
                .map((id) => fieldMap.get(id))
                .filter((f): f is FormField => f !== undefined)
                .map((f, index) => ({ ...f, order: index }))
            };
          })
        }));
      },

      addPreSetImage: (image) => {
        const newImage = { ...image, id: Date.now().toString() };
        set((state) => ({
          preSetImages: [...state.preSetImages, newImage]
        }));
      },

      deletePreSetImage: (id) => {
        set((state) => ({
          preSetImages: state.preSetImages.filter((img) => img.id !== id)
        }));
      },

      getCategoryItems: (categoryName) => {
        const category = get().categories.find((c) => c.name === categoryName);
        return category?.items || [];
      },

      initializeDefaultData: () => {
        // Initialize with default data if empty
        const { categories } = get();
        if (categories.length === 0) {
          set({ categories: convertDropdownToCategories() });
        }
      },

      // Tool category CRUD
      addToolCategory: (type, cat) => {
        if (type === 'original') {
          set((state) => ({
            originalToolCategories: [...state.originalToolCategories, cat]
          }));
        } else {
          set((state) => ({
            trialToolCategories: [...state.trialToolCategories, cat]
          }));
        }
      },

      updateToolCategory: (type, code, updates) => {
        if (type === 'original') {
          set((state) => ({
            originalToolCategories: state.originalToolCategories.map(c =>
              c.code === code ? { ...c, ...updates } : c
            )
          }));
        } else {
          set((state) => ({
            trialToolCategories: state.trialToolCategories.map(c =>
              c.code === code ? { ...c, ...updates } : c
            )
          }));
        }
      },

      deleteToolCategory: (type, code) => {
        if (type === 'original') {
          set((state) => ({
            originalToolCategories: state.originalToolCategories.filter(c => c.code !== code)
          }));
        } else {
          set((state) => ({
            trialToolCategories: state.trialToolCategories.filter(c => c.code !== code)
          }));
        }
      }
    }),
    {
      name: 'master-data-storage'
    }
  )
);
