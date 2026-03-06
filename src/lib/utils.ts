import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Format date to Thai format
export function formatDateThai(date: string | Date): string {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return d.toLocaleDateString('th-TH', options);
}

// Format date to short format
export function formatDateShort(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Validate employee code format
export function validateEmployeeCode(code: string): boolean {
  // Format: EMP followed by 3-4 digits
  const regex = /^EMP\d{3,4}$/;
  return regex.test(code);
}

// Parse QR code data (assuming JSON format)
export function parseQRCodeData(data: string): Record<string, string> | null {
  try {
    // Try parsing as JSON first
    return JSON.parse(data);
  } catch {
    // If not JSON, try parsing as key=value pairs
    const result: Record<string, string> = {};
    const pairs = data.split(',');
    pairs.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key && value) {
        result[key.trim()] = value.trim();
      }
    });
    return Object.keys(result).length > 0 ? result : null;
  }
}

// Generate QR code value for tool - Format: QR-{Line}-{ToolCode}-{YYYYMMDD}-{SEQ}
export function generateToolQRCode(lineNo: string, toolCode: string): string {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0');
  
  // Get existing QR codes from localStorage to determine next sequence number
  const existingQRs = getExistingQRCodes();
  const prefix = `QR-${lineNo}-${toolCode}-${dateStr}`;
  
  // Find the highest sequence number for this prefix
  let maxSeq = 0;
  existingQRs.forEach(qr => {
    if (qr.startsWith(prefix + '-')) {
      const seqPart = qr.split('-').pop();
      const seq = parseInt(seqPart || '0', 10);
      if (seq > maxSeq) maxSeq = seq;
    }
  });
  
  const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
  return `${prefix}-${nextSeq}`;
}

// Get all existing QR codes from localStorage
function getExistingQRCodes(): string[] {
  try {
    const stored = localStorage.getItem('tooling_toollists');
    if (!stored) return [];
    const toolLists = JSON.parse(stored);
    const qrCodes: string[] = [];
    toolLists.forEach((tl: any) => {
      if (tl.qrCodeNew) qrCodes.push(tl.qrCodeNew);
      if (tl.qrCodeRegrind) qrCodes.push(tl.qrCodeRegrind);
    });
    return qrCodes;
  } catch {
    return [];
  }
}

// Validate QR code uniqueness
export function isQRCodeUnique(qrCode: string): boolean {
  const existing = getExistingQRCodes();
  return !existing.includes(qrCode);
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Check if object is empty
export function isEmptyObject(obj: Record<string, any>): boolean {
  return Object.keys(obj).length === 0;
}

// Get initial from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
