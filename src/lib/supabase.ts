import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const dbService = {
  async getAccounts(userId: string) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);
    return { data: data || [], error };
  },

  async saveAccount(account: any, userId: string) {
    const { data, error } = await supabase
      .from('accounts')
      .upsert({ ...account, user_id: userId });
    return { data, error };
  },

  async getTransactions(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });
    return { data: data || [], error };
  },

  async saveTransaction(transaction: any, userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .upsert({ ...transaction, user_id: userId });
    return { data, error };
  },

  async getCategories(userId: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);
    return { data: data || [], error };
  },

  async saveCategory(category: any, userId: string) {
    const { data, error } = await supabase
      .from('categories')
      .upsert({ ...category, user_id: userId });
    return { data, error };
  },

  async loadAllData(userId: string) {
    const [accounts, transactions, categories] = await Promise.all([
      this.getAccounts(userId),
      this.getTransactions(userId),
      this.getCategories(userId)
    ]);

    return {
      accounts: accounts.data,
      transactions: transactions.data,
      categories: categories.data,
      errors: [accounts.error, transactions.error, categories.error].filter(Boolean)
    };
  }
};