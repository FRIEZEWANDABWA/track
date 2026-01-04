import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppStore } from './store';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import RecurringTransactions from './components/RecurringTransactions';
import Accounts from './components/Accounts';
import Categories from './components/Categories';
import Projects from './components/Projects';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Login from './components/Login';

function App() {
  const { user, theme, setTheme, setUser, processRecurringTransactions } = useAppStore();

  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark'; // Default to dark
    
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, [setTheme]);

  // Process recurring transactions on app load and every hour
  useEffect(() => {
    processRecurringTransactions();
    
    // Set up interval to process recurring transactions every hour
    const interval = setInterval(() => {
      processRecurringTransactions();
    }, 60 * 60 * 1000); // 1 hour
    
    return () => clearInterval(interval);
  }, [processRecurringTransactions]);

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Persist user login
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, [setUser]);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Auto-backup data every 10 minutes
  useEffect(() => {
    const backupData = () => {
      const state = useAppStore.getState();
      const backup = {
        accounts: state.accounts,
        transactions: state.transactions,
        categories: state.categories,
        projects: state.projects,
        recurringTransactions: state.recurringTransactions,
        timestamp: new Date().toISOString()
      };
      
      const backupKey = `backup_${Date.now()}`;
      localStorage.setItem(backupKey, JSON.stringify(backup));
      
      // Keep only last 3 backups
      const allKeys = Object.keys(localStorage);
      const backupKeys = allKeys.filter(key => key.startsWith('backup_')).sort();
      if (backupKeys.length > 3) {
        backupKeys.slice(0, backupKeys.length - 3).forEach(key => {
          localStorage.removeItem(key);
        });
      }
    };
    
    backupData();
    const interval = setInterval(backupData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-backup data every 5 minutes
  useEffect(() => {
    const backupData = () => {
      const data = {
        accounts: JSON.parse(localStorage.getItem('accounts') || '[]'),
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
        categories: JSON.parse(localStorage.getItem('categories') || '[]'),
        projects: JSON.parse(localStorage.getItem('projects') || '[]'),
        recurringTransactions: JSON.parse(localStorage.getItem('recurringTransactions') || '[]'),
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('backup_' + Date.now(), JSON.stringify(data));
    };
    
    const interval = setInterval(backupData, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  // If user is not logged in, show login page
  if (!user) {
    return <Login />;
  }

  // Main app with layout
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/recurring" element={<RecurringTransactions />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;