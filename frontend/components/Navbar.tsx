import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutList, User, Zap, Store as StoreIcon, Flame, Coins, Home, LogOut, LogIn } from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { progress, streak } = useProgress();
  const { isAuthenticated, logout, user } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const isActive = (path: string) => {
    return location.pathname === path ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100";
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left Side */}
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2 mr-6">
                <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-lg sm:text-xl text-gray-800">
                  Aptitude<span className="text-blue-600">Master</span>
                </span>
              </Link>
              <div className="hidden sm:flex sm:space-x-4">
                <Link
                  to="/"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')}`}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
                <Link
                  to="/problems"
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/problems')}`}
                >
                  <LayoutList className="h-4 w-4 mr-2" />
                  Problems
                </Link>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center space-x-2 sm:space-x-6">

              {isAuthenticated ? (
                <>
                  {/* Currency */}
                  <div className="hidden sm:flex items-center px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                    <Coins className="h-4 w-4 text-yellow-600 mr-2" />
                    <span className="font-bold text-yellow-700 text-sm">{progress.points} Paisa</span>
                  </div>

                  {/* Store */}
                  <Link
                    to="/store"
                    className={`relative inline-flex items-center p-2 rounded-full transition-colors ${isActive('/store')}`}
                    title="Store"
                  >
                    <StoreIcon className="h-5 w-5" />
                    <span className="hidden sm:block ml-2 text-sm font-medium">Store</span>
                  </Link>

                  {/* Streak */}
                  <div className="flex items-center" title="Current Streak">
                    <div className={`p-2 rounded-full ${streak > 0 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                      <Flame className={`h-5 w-5 ${streak > 0 ? 'text-orange-500 fill-orange-500' : 'text-gray-400'}`} />
                    </div>
                    <span className="hidden sm:block ml-1 font-bold text-sm text-gray-600">
                      {streak}
                    </span>
                  </div>

                  {/* Profile */}
                  <Link
                    to="/profile"
                    className={`p-2 rounded-full hover:bg-gray-100 ${isActive('/profile')}`}
                    title="Profile"
                  >
                    <User className="h-5 w-5" />
                  </Link>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="hidden lg:inline text-sm font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAuth('login')}
                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => openAuth('signup')}
                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Navbar;
