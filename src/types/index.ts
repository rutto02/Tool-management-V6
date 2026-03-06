// User Types
export interface User {
  id: string;
  code: string;
  nameEn: string;
  nameTh: string;
  gender: 'M' | 'F';
  position: string;
  section: string;
  department: string;
  role: 'ADMIN' | 'STAFF' | 'VISITOR' | 'PENDING';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL';
  createdAt: string;
  updatedAt: string;
}

export interface UserRegistration {
  code: string;
  nameEn: string;
  nameTh: string;
  gender: 'M' | 'F';
  position: string;
  section: string;
  department: string;
}

// Tool Code Types
export interface ToolCode {
  id: string;
  toolType: string;
  toolCode: string;
  lineNo: string;
  machineNo: string;
  sopModel: string;
  processName: string;
  dwgNo: string;
  maker: string;
  supplier: string;
  orderCode: string;
  type: string;
  requestBy: string;
  remark: string;
  status: 'ACTIVE' | 'INACTIVE';
  stockControl: string;
  location: string;
  codeType: 'ORIGINAL' | 'TRIAL';
  createdAt: string;
  updatedAt: string;
}

// Tool List Master Types
export interface ToolListMaster {
  id: string;
  lineNo: string;
  caliperType: string;
  model: string;
  processNo: string;
  type: string;
  spindle: string;
  machinePoint: string;
  toolType: string;
  toolCode: string;
  qtyToolNew: number;
  makerToolNew: string;
  supplierToolNew: string;
  dwgNoToolNew: string;
  qtyRegrind: number;
  dwgNoRegrind: string;
  toolLife: string;
  kanban: string;
  qrCodeNew: string;
  qrCodeNewImage?: string;
  qrCodeRegrind: string;
  qrCodeRegrindImage?: string;
  set: string;
  kanbanOn: string;
  toolConner: string;
  machineMaker: string;
  machineNo: string;
  preSetLength: string;
  preSetWidth: string;
  status: 'DRAFT' | 'APPROVED';
  createdAt: string;
  updatedAt: string;
}

// Dropdown Data Types
export interface DropdownData {
  sections: string[];
  departments: string[];
  positions: string[];
  toolTypes: string[];
  makers: string[];
  suppliers: string[];
  machineNos: string[];
  sopModels: string[];
  processNames: string[];
  caliperTypes: string[];
  models: string[];
  types: string[];
  spindles: string[];
  machinePoints: string[];
  toolConners: string[];
  machineMakers: string[];
  stockControls: string[];
  locations: string[];
  preSetImages: { id: string; name: string; url: string }[];
}

// Auth Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (code: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
}

// Menu Types
export interface MenuItem {
  id: string;
  label: string;
  labelTh: string;
  icon: string;
  path: string;
  adminOnly?: boolean;
}

// Table Column Types
export interface TableColumn {
  id: string;
  header: string;
  headerTh?: string;
  type: 'text' | 'number' | 'dropdown' | 'image-dropdown' | 'readonly';
  dropdownKey?: keyof DropdownData;
  width?: string;
}

// QR Code Types
export interface QRCodeData {
  value: string;
  imageUrl: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Kanban Assembly - groups multiple component QRs under one assembly QR
export interface KanbanAssembly {
  id: string;
  assemblyQRCode: string; // QR code for the assembly
  componentIds: string[]; // IDs of ToolListMaster items
  lineNo: string;
  machineNo: string;
  set: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// Tool Transaction - tracks tool issue/return (เบิก-จ่าย)
export interface ToolTransaction {
  id: string;
  kanbanNo: string; // same as QR No.
  toolCode: string;
  toolType: string;
  lineNo: string;
  machineNo: string;
  set: string;
  transactionType: 'ISSUE' | 'RETURN'; // เบิก / จ่ายคืน
  quantity: number;
  scannedBy: string;
  scannedByName: string;
  note: string;
  createdAt: string;
}

// Tool Category Rule - prefix matching rules
export interface ToolCategoryRule {
  code: string;
  name: string;
  nameTh: string;
  prefixes: string[]; // e.g. ['P50', 'P40', 'P30']
}
