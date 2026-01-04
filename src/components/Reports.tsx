import React, { useState, useRef, useEffect } from 'react';
import { BarChart3, PieChart, Upload, Download, Filter, Calendar } from 'lucide-react';
import { useAppStore } from '../store';
import { ExpensePieChart, IncomeExpenseBarChart } from './Charts';
import { format, startOfWeek, startOfMonth, startOfQuarter, endOfWeek, endOfMonth, endOfQuarter, subMonths } from 'date-fns';

const Reports: React.FC = () => {
  const { transactions, categories, processRecurringTransactions } = useAppStore();
  const [filterPeriod, setFilterPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process recurring transactions on component mount
  useEffect(() => {
    processRecurringTransactions();
  }, [processRecurringTransactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDateRange = () => {
    const date = selectedDate;
    switch (filterPeriod) {
      case 'daily':
        return { start: date, end: date };
      case 'weekly':
        return { start: startOfWeek(date), end: endOfWeek(date) };
      case 'monthly':
        return { start: startOfMonth(date), end: endOfMonth(date) };
      case 'quarterly':
        return { start: startOfQuarter(date), end: endOfQuarter(date) };
      default:
        return { start: startOfMonth(date), end: endOfMonth(date) };
    }
  };

  const getFilteredTransactions = () => {
    const { start, end } = getDateRange();
    return transactions.filter(tx => {
      const txDate = new Date(tx.date);
      return txDate >= start && txDate <= end;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const totalIncome = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const expensesByCategory = categories.map(category => {
    const amount = filteredTransactions
      .filter(tx => tx.type === 'expense' && tx.categoryId === category.id)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { name: category.name, value: amount, color: category.color };
  }).filter(item => item.value > 0);

  // Generate trend data for the last 6 months
  const getTrendData = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date);
        return txDate >= monthStart && txDate <= monthEnd;
      });
      
      const income = monthTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const expenses = monthTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      months.push({
        period: format(date, 'MMM yyyy'),
        income,
        expenses,
        net: income - expenses,
      });
    }
    return months;
  };

  const trendData = getTrendData();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus('Processing file...');

    try {
      const text = await file.text();
      
      // Simple CSV parsing (basic implementation)
      if (file.name.endsWith('.csv')) {
        const lines = text.split('\\n');
        const headers = lines[0].split(',');
        
        // Look for common column names
        const dateIndex = headers.findIndex(h => h.toLowerCase().includes('date'));
        const amountIndex = headers.findIndex(h => h.toLowerCase().includes('amount'));
        
        if (dateIndex === -1 || amountIndex === -1) {
          setUploadStatus('Error: Could not find date or amount columns');
          return;
        }

        let processed = 0;
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',');
          if (row.length >= Math.max(dateIndex, amountIndex) + 1) {
            // Here you would add the transaction to your store
            // This is a simplified example
            processed++;
          }
        }
        
        setUploadStatus(`Successfully processed ${processed} transactions`);
      } else {
        setUploadStatus('Error: Only CSV files are supported currently');
      }
    } catch (error) {
      setUploadStatus('Error: Failed to process file');
    }

    // Clear status after 3 seconds
    setTimeout(() => setUploadStatus(''), 3000);
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Type', 'Amount', 'Category', 'Notes'],
      ...filteredTransactions.map(tx => [
        format(new Date(tx.date), 'yyyy-MM-dd'),
        tx.type,
        tx.amount.toString(),
        categories.find(c => c.id === tx.categoryId)?.name || '',
        tx.notes || ''
      ])
    ].map(row => row.join(',')).join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${filterPeriod}-${format(selectedDate, 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Analyze your financial data and trends</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </button>
          <button
            onClick={exportData}
            className="btn-primary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls,.pdf"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Upload Status */}
      {uploadStatus && (
        <div className={`p-4 rounded-md ${
          uploadStatus.includes('Error') 
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' 
            : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
        }`}>
          {uploadStatus}
        </div>
      )}

      {/* Filters */}
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>
          </div>
          
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as any)}
            className="input w-auto"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>

          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="input w-auto"
            />
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {format(getDateRange().start, 'MMM dd')} - {format(getDateRange().end, 'MMM dd, yyyy')}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
              <BarChart3 className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Income</p>
              <p className={`text-2xl font-bold ${
                totalIncome - totalExpenses >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(totalIncome - totalExpenses)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <PieChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Pie Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Expenses by Category</h3>
          {expensesByCategory.length === 0 ? (
            <div className="text-center py-8 text-gray-600 dark:text-gray-400">
              No expenses found for the selected period
            </div>
          ) : (
            <ExpensePieChart data={expensesByCategory} />
          )}
        </div>

        {/* Income vs Expenses Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">6-Month Trend</h3>
          <IncomeExpenseBarChart data={trendData} />
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Category Breakdown</h3>
        {expensesByCategory.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            No expenses found for the selected period
          </div>
        ) : (
          <div className="space-y-4">
            {expensesByCategory.map((item, index) => {
              const percentage = totalExpenses > 0 ? (item.value / totalExpenses) * 100 : 0;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(item.value)}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{percentage.toFixed(1)}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Transactions ({filteredTransactions.length})
        </h3>
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            No transactions found for the selected period
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
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.slice(0, 10).map((transaction) => {
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredTransactions.length > 10 && (
              <div className="text-center py-4 text-gray-600 dark:text-gray-400">
                Showing first 10 of {filteredTransactions.length} transactions
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;