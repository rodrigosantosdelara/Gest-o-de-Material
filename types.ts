export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, never store plain text
  role: UserRole;
  active: boolean;
}

export interface Material {
  id: string;
  name: string;
}

export interface DailyRecord {
  id: string;
  date: string; // YYYY-MM-DD
  materialId: string;
  initial: number;
  stockIn: number; // Entrada/Estoque
  used: number; // Utilizado (calculated/integrated)
  // Balance and Final are calculated on the fly usually, but we can store them or compute them in components
}

export interface OSRecord {
  id: string;
  osNumber: string;
  date: string; // YYYY-MM-DD
  materialId: string;
  quantity: number;
  isRequired: boolean;
  createdAt: number;
}

export interface WeeklyReportData {
  materialName: string;
  totalStockIn: number;
  totalUsed: number;
  initialStock: number;
  finalStock: number;
}
