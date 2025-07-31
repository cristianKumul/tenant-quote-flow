export type QuoteStatus = 'DRAFT' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type UserRole = 'USER' | 'SUPERADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

export interface Product {
  id: string;
  userId: string;
  name: string;
  description: string;
  basePrice: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  userId: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  address?: string;
  createdAt: Date;
}

export interface QuoteItem {
  id: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Collect {
  id: string;
  quoteId: string;
  userId: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  collectedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Quote {
  id: string;
  userId: string;
  quoteNumber: string;
  status: QuoteStatus;
  customerId?: string;
  customerName?: string;
  items: QuoteItem[];
  subtotal: number;
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  currentUser: User;
  users: User[];
  products: Product[];
  customers: Customer[];
  quotes: Quote[];
  collects: Collect[];
}