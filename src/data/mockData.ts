import type { User, ToolCode, ToolListMaster } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    code: 'EMP001',
    nameEn: 'Admin User',
    nameTh: 'ผู้ดูแลระบบ',
    gender: 'M',
    position: 'Manager',
    section: 'Administration',
    department: 'Engineering',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    code: 'EMP002',
    nameEn: 'John Smith',
    nameTh: 'จอห์น สมิธ',
    gender: 'M',
    position: 'Engineer',
    section: 'Production',
    department: 'Manufacturing',
    role: 'STAFF',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    code: 'EMP003',
    nameEn: 'Jane Doe',
    nameTh: 'เจน โด',
    gender: 'F',
    position: 'Technician',
    section: 'Quality Control',
    department: 'Quality Assurance',
    role: 'PENDING',
    status: 'PENDING_APPROVAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockToolCodes: ToolCode[] = [];

export const mockToolListMasters: ToolListMaster[] = [];

// LocalStorage keys
export const STORAGE_KEYS = {
  USERS: 'tooling_users',
  TOOL_CODES: 'tooling_toolcodes',
  TOOL_LISTS: 'tooling_toollists',
  CURRENT_USER: 'tooling_current_user',
  AUTH_TOKEN: 'tooling_auth_token'
};

// Initialize local storage with mock data
export const initializeMockData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TOOL_CODES)) {
    localStorage.setItem(STORAGE_KEYS.TOOL_CODES, JSON.stringify(mockToolCodes));
  }
  if (!localStorage.getItem(STORAGE_KEYS.TOOL_LISTS)) {
    localStorage.setItem(STORAGE_KEYS.TOOL_LISTS, JSON.stringify(mockToolListMasters));
  }
};
