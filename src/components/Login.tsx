import React, { useState } from 'react';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../store';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { setUser } = useAppStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple authentication check
    const demoEmail = import.meta.env.VITE_DEMO_EMAIL || 'friezekw@gmail.com';
    const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || 'Hakuna@123%';
    
    if (email === demoEmail && password === demoPassword) {
      setUser({
        id: '1',
        email: 'friezekw@gmail.com',
        name: 'Frieze',
        theme: 'light',
        currency: 'KES'
      });
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-primary rounded-full">
              <TrendingUp className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to MoneyTracker
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Your personal finance command center
          </p>
        </div>

        <div className="card p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="input pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Sign in
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Demo credentials available for testing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;