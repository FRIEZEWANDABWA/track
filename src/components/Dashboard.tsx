import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, Target, PiggyBank, AlertCircle } from 'lucide-react';
import { useAppStore } from '../store';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { getNetWorth, getMonthlyStats, projects, transactions } = useAppStore();
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const netWorth = getNetWorth();
  const monthlyStats = getMonthlyStats(currentYear, currentMonth);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    color = 'blue',
    trend 
  }: {
    title: string;
    value: string;
    change?: string;
    icon: any;
    color?: 'blue' | 'green' | 'red' | 'purple';
    trend?: 'up' | 'down';
  }) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
    };

    return (
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            {change && (
              <div className="flex items-center mt-1">
                {trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    );
  };

  const QuickActions = () => (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
      <div className="space-y-3">
        <Link to="/transactions" className="btn-primary w-full block text-center">
          Add Transaction
        </Link>
        <Link to="/accounts" className="btn-secondary w-full block text-center">
          Transfer Money
        </Link>
        <Link to="/reports" className="btn-ghost w-full block text-center">
          View Reports
        </Link>
      </div>
    </div>
  );

  const RecentTransactions = () => (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      {transactions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No transactions yet</p>
          <p className="text-sm">Add your first transaction to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.slice(-5).reverse().map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">{transaction.notes || 'Transaction'}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(transaction.date), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className={`font-semibold ${
                transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
              }`}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ProjectProgress = () => (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
      {projects.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No projects yet</p>
          <p className="text-sm">Create your first financial goal</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.slice(0, 3).map((project) => {
            const progress = (project.currentAmount / project.targetAmount) * 100;
            return (
              <div key={project.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(project.currentAmount)} / {formatCurrency(project.targetAmount)}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="text-right mt-1">
                  <span className="text-sm text-muted-foreground">{progress.toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's your financial overview for {format(currentDate, 'MMMM yyyy')}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Net Worth"
          value={formatCurrency(netWorth)}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(monthlyStats.income)}
          change="+12.5%"
          trend="up"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(monthlyStats.expenses)}
          change="-5.2%"
          trend="down"
          icon={TrendingDown}
          color="red"
        />
        <StatCard
          title="Savings Rate"
          value={`${(monthlyStats.savingsRate * 100).toFixed(1)}%`}
          change="+2.1%"
          trend="up"
          icon={PiggyBank}
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentTransactions />
          <ProjectProgress />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;