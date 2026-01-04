import React, { useState } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Calendar, DollarSign } from 'lucide-react';
import { useAppStore } from '../store';
import type { RecurringTransaction } from '../types';
import { format } from 'date-fns';

const RecurringTransactions: React.FC = () => {
  const { recurringTransactions, addRecurringTransaction, updateRecurringTransaction, deleteRecurringTransaction, categories, accounts } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: 0,
    type: 'expense' as RecurringTransaction['type'],
    categoryId: '',
    fromAccountId: '',
    toAccountId: '',
    frequency: 'monthly' as RecurringTransaction['frequency'],
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingRecurring) {
      updateRecurringTransaction(editingRecurring.id, formData);
    } else {
      const newRecurring: RecurringTransaction = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      addRecurringTransaction(newRecurring);
    }

    setFormData({
      name: '',
      amount: 0,
      type: 'expense',
      categoryId: '',
      fromAccountId: '',
      toAccountId: '',
      frequency: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isActive: true,
    });
    setShowForm(false);
    setEditingRecurring(null);
  };

  const handleEdit = (recurring: RecurringTransaction) => {
    setEditingRecurring(recurring);
    setFormData({
      name: recurring.name,
      amount: recurring.amount,
      type: recurring.type,
      categoryId: recurring.categoryId,
      fromAccountId: recurring.fromAccountId || '',
      toAccountId: recurring.toAccountId || '',
      frequency: recurring.frequency,
      startDate: recurring.startDate.split('T')[0],
      endDate: recurring.endDate?.split('T')[0] || '',
      isActive: recurring.isActive,
    });
    setShowForm(true);
  };

  const toggleActive = (id: string, isActive: boolean) => {
    updateRecurringTransaction(id, { isActive: !isActive });
  };

  const frequencyLabels = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Recurring Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400">Automate your regular income and expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Recurring Transaction
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {editingRecurring ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Monthly Salary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as RecurringTransaction['type'] })}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Amount</label>
                <input
                  type="number"
                  className="input"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Category</label>
                <select
                  className="input"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Frequency</label>
                <select
                  className="input"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as RecurringTransaction['frequency'] })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              {formData.type !== 'income' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">From Account</label>
                  <select
                    className="input"
                    value={formData.fromAccountId}
                    onChange={(e) => setFormData({ ...formData, fromAccountId: e.target.value })}
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.type !== 'expense' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">To Account</label>
                  <select
                    className="input"
                    value={formData.toAccountId}
                    onChange={(e) => setFormData({ ...formData, toAccountId: e.target.value })}
                  >
                    <option value="">Select account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Start Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">End Date (Optional)</label>
                <input
                  type="date"
                  className="input"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Leave empty for indefinite recurring</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingRecurring ? 'Update' : 'Add'} Recurring Transaction
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingRecurring(null);
                    setFormData({
                      name: '',
                      amount: 0,
                      type: 'expense',
                      categoryId: '',
                      fromAccountId: '',
                      toAccountId: '',
                      frequency: 'monthly',
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: '',
                      isActive: true,
                    });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recurring Transactions List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recurringTransactions.map((recurring) => {
          const category = categories.find(c => c.id === recurring.categoryId);
          const nextProcessDate = recurring.lastProcessed 
            ? new Date(recurring.lastProcessed) 
            : new Date(recurring.startDate);
          
          if (recurring.frequency === 'monthly') {
            nextProcessDate.setMonth(nextProcessDate.getMonth() + 1);
          } else if (recurring.frequency === 'weekly') {
            nextProcessDate.setDate(nextProcessDate.getDate() + 7);
          } else if (recurring.frequency === 'daily') {
            nextProcessDate.setDate(nextProcessDate.getDate() + 1);
          }

          return (
            <div key={recurring.id} className={`card p-6 ${!recurring.isActive ? 'opacity-60' : ''}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    recurring.type === 'income' 
                      ? 'bg-green-100 dark:bg-green-900' 
                      : 'bg-red-100 dark:bg-red-900'
                  }`}>
                    {recurring.type === 'income' ? (
                      <DollarSign className={`h-5 w-5 ${
                        recurring.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`} />
                    ) : (
                      <RefreshCw className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{recurring.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category?.name || 'Unknown Category'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => toggleActive(recurring.id, recurring.isActive)}
                    className={`p-2 rounded-md ${
                      recurring.isActive 
                        ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900' 
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={recurring.isActive ? 'Pause' : 'Resume'}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(recurring)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={() => deleteRecurringTransaction(recurring.id)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
                  <span className={`font-semibold ${
                    recurring.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {recurring.type === 'income' ? '+' : '-'}{formatCurrency(recurring.amount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Frequency</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {frequencyLabels[recurring.frequency]}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Next Process</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {format(nextProcessDate, 'MMM dd, yyyy')}
                  </span>
                </div>

                {recurring.endDate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Ends</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {format(new Date(recurring.endDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    recurring.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {recurring.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {recurringTransactions.length === 0 && (
        <div className="text-center py-12">
          <RefreshCw className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No recurring transactions yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Set up automatic transactions for salary, rent, and other regular payments
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Recurring Transaction
          </button>
        </div>
      )}
    </div>
  );
};

export default RecurringTransactions;