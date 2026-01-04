import { create } from 'zustand';
import type { Account, Transaction, Category, Project, IncomeSource, User, RecurringTransaction } from './types';

interface AppState {
  // Data
  user: User | null;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  projects: Project[];
  incomeSources: IncomeSource[];
  recurringTransactions: RecurringTransaction[];
  
  // UI State
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  
  // Data actions
  addAccount: (account: Account) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Recurring transactions
  addRecurringTransaction: (recurring: RecurringTransaction) => void;
  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) => void;
  deleteRecurringTransaction: (id: string) => void;
  processRecurringTransactions: () => void;
  
  // Category actions
  addCategory: (category: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Computed values
  getAccountBalance: (accountId: string) => number;
  getNetWorth: () => number;
  getMonthlyStats: (year: number, month: number) => {
    income: number;
    expenses: number;
    savings: number;
    savingsRate: number;
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  accounts: [],
  transactions: [],
  categories: [
    // Default categories
    { id: '1', name: 'Salary', type: 'income', group: 'need', color: '#10b981' },
    { id: '2', name: 'Business', type: 'income', group: 'need', color: '#3b82f6' },
    { id: '3', name: 'Rent', type: 'expense', group: 'need', color: '#ef4444' },
    { id: '4', name: 'Food', type: 'expense', group: 'need', color: '#f59e0b' },
    { id: '5', name: 'Transport', type: 'expense', group: 'need', color: '#8b5cf6' },
    { id: '6', name: 'Weed', type: 'expense', group: 'want', color: '#06b6d4' },
    { id: '7', name: 'Alcohol', type: 'expense', group: 'want', color: '#ec4899' },
    { id: '8', name: 'Shopping', type: 'expense', group: 'want', color: '#84cc16' },
    { id: '9', name: 'Savings', type: 'savings', group: 'wealth', color: '#10b981' },
    { id: '10', name: 'Black Tax', type: 'expense', group: 'obligation', color: '#6b7280' },
    { id: '11', name: 'OPEX - Petty Cash', type: 'expense', group: 'need', color: '#f97316' },
    { id: '12', name: 'OPEX - Daily Operations', type: 'expense', group: 'need', color: '#eab308' },
    { id: '13', name: 'Internet', type: 'expense', group: 'need', color: '#06b6d4' },
    { id: '14', name: 'Bundles', type: 'expense', group: 'need', color: '#8b5cf6' },
  ],
  projects: [],
  recurringTransactions: [],
  incomeSources: [
    { id: '1', name: 'Salary', type: 'salary', isActive: true },
    { id: '2', name: 'Business', type: 'business', isActive: true },
    { id: '3', name: 'Smart Spark Services', type: 'smart_spark', isActive: true },
    { id: '4', name: 'Crypto', type: 'crypto', isActive: true },
  ],
  
  theme: 'dark',
  sidebarOpen: false,
  
  // Actions
  setUser: (user) => {
    set({ user });
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },
  setTheme: (theme) => {
    set({ theme });
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  // Data actions
  addAccount: (account) => set((state) => ({ 
    accounts: [...state.accounts, account] 
  })),
  
  updateAccount: (id, updates) => set((state) => ({
    accounts: state.accounts.map(acc => 
      acc.id === id ? { ...acc, ...updates } : acc
    )
  })),
  
  deleteAccount: (id) => set((state) => ({
    accounts: state.accounts.filter(acc => acc.id !== id)
  })),
  
  addTransaction: (transaction) => set((state) => ({ 
    transactions: [...state.transactions, transaction] 
  })),
  
  updateTransaction: (id, updates) => set((state) => ({
    transactions: state.transactions.map(tx => 
      tx.id === id ? { ...tx, ...updates } : tx
    )
  })),
  
  deleteTransaction: (id) => set((state) => ({
    transactions: state.transactions.filter(tx => tx.id !== id)
  })),
  
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(proj => 
      proj.id === id ? { ...proj, ...updates } : proj
    )
  })),
  
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(proj => proj.id !== id)
  })),
  
  // Recurring transactions
  addRecurringTransaction: (recurring) => set((state) => ({ 
    recurringTransactions: [...state.recurringTransactions, recurring] 
  })),
  
  updateRecurringTransaction: (id, updates) => set((state) => ({
    recurringTransactions: state.recurringTransactions.map(rt => 
      rt.id === id ? { ...rt, ...updates } : rt
    )
  })),
  
  deleteRecurringTransaction: (id) => set((state) => ({
    recurringTransactions: state.recurringTransactions.filter(rt => rt.id !== id)
  })),
  
  processRecurringTransactions: () => {
    const state = get();
    const today = new Date();
    
    state.recurringTransactions.forEach(rt => {
      if (!rt.isActive) return;
      
      // Check if end date has passed
      if (rt.endDate && new Date(rt.endDate) < today) {
        state.updateRecurringTransaction(rt.id, { isActive: false });
        return;
      }
      
      const lastProcessed = rt.lastProcessed ? new Date(rt.lastProcessed) : new Date(rt.startDate);
      let shouldProcess = false;
      
      if (rt.frequency === 'monthly') {
        const nextMonth = new Date(lastProcessed);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        shouldProcess = today >= nextMonth;
      } else if (rt.frequency === 'weekly') {
        const nextWeek = new Date(lastProcessed);
        nextWeek.setDate(nextWeek.getDate() + 7);
        shouldProcess = today >= nextWeek;
      } else if (rt.frequency === 'daily') {
        const nextDay = new Date(lastProcessed);
        nextDay.setDate(nextDay.getDate() + 1);
        shouldProcess = today >= nextDay;
      }
      
      if (shouldProcess) {
        const newTransaction: Transaction = {
          id: Date.now().toString() + Math.random(),
          date: today.toISOString(),
          amount: rt.amount,
          type: rt.type,
          categoryId: rt.categoryId,
          fromAccountId: rt.fromAccountId,
          toAccountId: rt.toAccountId,
          notes: `Auto: ${rt.name}`,
          tags: ['recurring'],
          createdAt: today.toISOString(),
        };
        
        state.addTransaction(newTransaction);
        state.updateRecurringTransaction(rt.id, { lastProcessed: today.toISOString() });
      }
    });
  },
  
  // Category actions
  addCategory: (category) => set((state) => ({ 
    categories: [...state.categories, category] 
  })),
  
  updateCategory: (id, updates) => set((state) => ({
    categories: state.categories.map(cat => 
      cat.id === id ? { ...cat, ...updates } : cat
    )
  })),
  
  deleteCategory: (id) => set((state) => ({
    categories: state.categories.filter(cat => cat.id !== id)
  })),
  
  // Computed values
  getAccountBalance: (accountId) => {
    const state = get();
    const account = state.accounts.find(acc => acc.id === accountId);
    if (!account) return 0;
    
    let balance = account.balance;
    
    state.transactions.forEach(tx => {
      if (tx.type === 'income' && tx.toAccountId === accountId) {
        balance += tx.amount;
      } else if (tx.type === 'expense' && tx.fromAccountId === accountId) {
        balance -= tx.amount;
      } else if (tx.type === 'transfer') {
        if (tx.fromAccountId === accountId) balance -= tx.amount;
        if (tx.toAccountId === accountId) balance += tx.amount;
      }
    });
    
    return balance;
  },
  
  getNetWorth: () => {
    const state = get();
    return state.accounts.reduce((total, account) => {
      return total + state.getAccountBalance(account.id);
    }, 0);
  },
  
  getMonthlyStats: (year, month) => {
    const state = get();
    let income = 0;
    let expenses = 0;
    let savings = 0;
    
    state.transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (txDate.getFullYear() !== year || txDate.getMonth() !== month) return;
      
      if (tx.type === 'income') income += tx.amount;
      if (tx.type === 'expense') expenses += tx.amount;
      
      const category = state.categories.find(cat => cat.id === tx.categoryId);
      if (category?.type === 'savings') savings += tx.amount;
    });
    
    const savingsRate = income > 0 ? savings / income : 0;
    
    return { income, expenses, savings, savingsRate };
  },
}));