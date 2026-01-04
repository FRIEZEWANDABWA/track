export interface Account {
  id: string;
  name: string;
  type: 'kcb_bank' | 'absa_bank' | 'mpesa' | 'ziidi' | 'crypto' | 'money_market' | 'cash' | 'sacco';
  balance: number;
  currency: 'KES' | 'USD' | 'BTC' | 'ETH';
  isActive: boolean;
  createdAt: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  type: 'salary' | 'business' | 'side_hustle' | 'smart_spark' | 'crypto' | 'county_gov';
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'transfer' | 'savings';
  group: 'need' | 'want' | 'wealth' | 'obligation';
  color: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  categoryId: string;
  sourceId?: string; // for income
  fromAccountId?: string;
  toAccountId?: string;
  projectId?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  type: 'car_purchase' | 'land_buy' | 'farming' | 'custom';
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  priority: 'low' | 'medium' | 'high';
  linkedAccountId?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  theme: 'light' | 'dark' | 'system';
  currency: string;
}

export interface DashboardStats {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRate: number;
}

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  fromAccountId?: string;
  toAccountId?: string;
  frequency: 'monthly' | 'weekly' | 'daily';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  lastProcessed?: string;
  createdAt: string;
}