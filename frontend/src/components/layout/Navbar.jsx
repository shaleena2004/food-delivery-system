import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ShoppingBag,
  LogOut,
  User,
  UtensilsCrossed,
  Menu as MenuIcon,
  X,
  Shield,
  Truck,
  Store,
  Sun,
  Moon,
} from 'lucide-react';
import { Button } from '../common/Button';
import { BiteFlowLogo } from '../common/BiteFlowLogo';

export const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItemCount } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin', icon: Shield, bg: 'bg-purple-100 text-purple-800' };
      case 'RESTAURANT_ADMIN':
        return { label: 'Restaurant Owner', icon: Store, bg: 'bg-amber-100 text-amber-800' };
      case 'DELIVERY_PERSON':
        return { label: 'Rider', icon: Truck, bg: 'bg-blue-100 text-blue-800' };
      default:
        return { label: 'Customer', icon: User, bg: 'bg-orange-100 text-orange-800' };
    }
  };

  const roleInfo = user ? getRoleBadge(user.role) : null;
  const RoleIcon = roleInfo?.icon;

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          )}

          <Link to="/" className="group">
            <BiteFlowLogo size="md" />
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Mode Toggle (ThemeContext) */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50/60 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Dark Mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400 hover:rotate-90 transition-transform duration-300" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600 dark:text-slate-300 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Cart Icon (Customer or Guest) */}
          {(!user || user.role === 'CUSTOMER') && (
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-orange-600 hover:bg-orange-50/60 dark:hover:bg-slate-800 transition-colors"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-scaleIn">
                  {totalItemCount}
                </span>
              )}
            </Link>
          )}

          {/* User Info & Actions */}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-800 leading-tight">
                  {user?.name || user?.email}
                </span>
                {roleInfo && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 mt-0.5 ${roleInfo.bg}`}>
                    <RoleIcon className="w-3 h-3" />
                    {roleInfo.label}
                  </span>
                )}
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Log In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
