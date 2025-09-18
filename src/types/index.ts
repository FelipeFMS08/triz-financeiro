// Category Types
export interface Category {
  id: number;
  name: string;
  threshold?: number | null;
  createdAt: Date;
}

// Transaction Types
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: number;
  type: TransactionType;
  description: string;
  amount: number;
  categoryId?: number | null;
  userId: string;
  date: Date;
  createdAt: Date;
}

// Common Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Financial Summary Types
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  categorySummary: CategorySummary[];
}

export interface CategorySummary {
  categoryId: number;
  categoryName: string;
  total: number;
  percentage: number;
  threshold?: number;
  isOverThreshold?: boolean;
}
