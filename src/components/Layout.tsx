import React from 'react';
import { 
  Home, 
  CreditCard, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Settings,
  Menu,
  Sun,
  Moon,
  DollarSign
} from 'lucide-react';
import { useAppStore } from '../store';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, setTheme, sidebarOpen, toggleSidebar } = useAppStore();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Transactions', href: '/transactions', icon: CreditCard },
    { name: 'Accounts', href: '/accounts', icon: DollarSign },
    { name: 'Projects', href: '/projects', icon: Target },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">MoneyTracker</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-accent hover:text-accent-foreground transition-colors group"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </a>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-200 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}`}>
        {/* Top bar */}
        <header className="bg-card border-b h-16 flex items-center justify-between px-6">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-accent"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-md hover:bg-accent transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">F</span>
              </div>
              <span className="text-sm font-medium">friezekw@gmail.com</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default Layout;