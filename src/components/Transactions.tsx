import React, { useState } from 'react';
import { Plus, Edit, Trash2, Filter } from 'lucide-react';
import { useAppStore } from '../store';
import type { Transaction } from '../types';
import { format } from 'date-fns';

const Transactions: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction, accounts, categories } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    type: 'expense' as Transaction['type'],
    categoryId: '',
    fromAccountId: '',
    toAccountId: '',
    notes: '',
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
    
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, formData);
    } else {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        ...formData,
        tags: [],
        createdAt: new Date().toISOString(),
      };
      addTransaction(newTransaction);
    }

    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: 0,
      type: 'expense',
      categoryId: '',
      fromAccountId: '',
      toAccountId: '',
      notes: '',
    });
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      date: transaction.date.split('T')[0],
      amount: transaction.amount,
      type: transaction.type,
      categoryId: transaction.categoryId,
      fromAccountId: transaction.fromAccountId || '',
      toAccountId: transaction.toAccountId || '',
      notes: transaction.notes || '',
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your income and expenses</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </button>
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Transaction['type'] })}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
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
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Notes</label>
                <input
                  type="text"
                  className="input"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Optional notes"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingTransaction(null);
                    setFormData({
                      date: new Date().toISOString().split('T')[0],
                      amount: 0,
                      type: 'expense',
                      categoryId: '',
                      fromAccountId: '',
                      toAccountId: '',
                      notes: '',
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

      {/* Transactions List */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <button className="btn-ghost">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </button>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 mb-4">
                <Plus className="h-16 w-16 mx-auto mb-4 opacity-50" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">No transactions yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Add your first transaction to start tracking your finances
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Transaction
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Category</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice().reverse().map((transaction) => {
                    const category = categories.find(c => c.id === transaction.categoryId);
                    return (
                      <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {format(new Date(transaction.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {transaction.notes || 'Transaction'}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {category?.name || 'Unknown'}
                        </td>
                        <td className={`py-3 px-4 font-semibold ${
                          transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button
                              onClick={() => deleteTransaction(transaction.id)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;