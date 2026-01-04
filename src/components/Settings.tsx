import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Moon, Sun, Download, Trash2, Save } from 'lucide-react';
import { useAppStore } from '../store';

const Settings: React.FC = () => {
  const { user, theme, setTheme, setUser } = useAppStore();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currency: user?.currency || 'KES',
  });

  const handleSave = () => {
    if (user) {
      setUser({
        ...user,
        name: formData.name,
        currency: formData.currency,
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const exportAllData = () => {
    const { accounts, transactions, categories, projects, recurringTransactions } = useAppStore.getState();
    const data = {
      user,
      accounts,
      transactions,
      categories,
      projects,
      recurringTransactions,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moneytracker-complete-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        const { accounts, transactions, categories, projects, recurringTransactions } = useAppStore.getState();
        
        // Merge data with duplicate prevention
        const mergedAccounts = [...accounts];
        const mergedTransactions = [...transactions];
        const mergedCategories = [...categories];
        const mergedProjects = [...projects];
        const mergedRecurring = [...recurringTransactions];
        
        // Add imported accounts (skip duplicates by name)
        if (importedData.accounts) {
          importedData.accounts.forEach((importedAccount: any) => {
            if (!mergedAccounts.find(acc => acc.name === importedAccount.name)) {
              mergedAccounts.push({ ...importedAccount, id: Date.now().toString() + Math.random() });
            }
          });
        }
        
        // Add imported transactions (skip duplicates by date + amount + notes)
        if (importedData.transactions) {
          importedData.transactions.forEach((importedTx: any) => {
            const isDuplicate = mergedTransactions.find(tx => 
              tx.date === importedTx.date && 
              tx.amount === importedTx.amount && 
              tx.notes === importedTx.notes
            );
            if (!isDuplicate) {
              mergedTransactions.push({ ...importedTx, id: Date.now().toString() + Math.random() });
            }
          });
        }
        
        // Add imported categories (skip duplicates by name)
        if (importedData.categories) {
          importedData.categories.forEach((importedCat: any) => {
            if (!mergedCategories.find(cat => cat.name === importedCat.name)) {
              mergedCategories.push({ ...importedCat, id: Date.now().toString() + Math.random() });
            }
          });
        }
        
        // Add imported projects (skip duplicates by name)
        if (importedData.projects) {
          importedData.projects.forEach((importedProj: any) => {
            if (!mergedProjects.find(proj => proj.name === importedProj.name)) {
              mergedProjects.push({ ...importedProj, id: Date.now().toString() + Math.random() });
            }
          });
        }
        
        // Add imported recurring transactions (skip duplicates by name)
        if (importedData.recurringTransactions) {
          importedData.recurringTransactions.forEach((importedRec: any) => {
            if (!mergedRecurring.find(rec => rec.name === importedRec.name)) {
              mergedRecurring.push({ ...importedRec, id: Date.now().toString() + Math.random() });
            }
          });
        }
        
        // Update store with merged data
        useAppStore.setState({
          accounts: mergedAccounts,
          transactions: mergedTransactions,
          categories: mergedCategories,
          projects: mergedProjects,
          recurringTransactions: mergedRecurring
        });
        
        alert(`Data imported successfully! Added ${importedData.transactions?.length || 0} transactions, ${importedData.accounts?.length || 0} accounts, and more.`);
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and application preferences</p>
      </div>

      {/* Profile Settings */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Settings</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              disabled
              placeholder="Your email"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Default Currency</label>
            <select
              className="input"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            >
              <option value="KES">KES - Kenyan Shilling</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          <button
            onClick={handleSave}
            className="btn-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          {theme === 'dark' ? (
            <Moon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          ) : (
            <Sun className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          )}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Theme</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Sun className="h-4 w-4" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Moon className="h-4 w-4" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <SettingsIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Management</h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Export Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Download a complete backup of all your financial data
            </p>
            <button
              onClick={exportAllData}
              className="btn-secondary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Complete Backup
            </button>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Import Data</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Upload a backup file to restore your data (duplicates will be skipped)
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-300"
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Clear all data from the application. This action cannot be undone.
            </p>
            <button
              onClick={clearAllData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-2 inline" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <User className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Account</h2>
        </div>

        <button
          onClick={handleLogout}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Settings;