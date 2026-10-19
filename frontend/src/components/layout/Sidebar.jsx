import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Store,
  ShoppingBag,
  Clock,
  User,
  UtensilsCrossed,
  Layers,
  ChefHat,
  Truck,
  Users,
  Compass,
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const navLinks = [
    // Customer links
    ...(role === 'CUSTOMER'
      ? [
          { to: '/restaurants', label: 'Explore Food', icon: Compass },
          { to: '/cart', label: 'My Cart', icon: ShoppingBag },
          { to: '/orders', label: 'Order History', icon: Clock },
          { to: '/profile', label: 'My Profile & Addresses', icon: User },
        ]
      : []),

    // Restaurant Admin links
    ...(role === 'RESTAURANT_ADMIN'
      ? [
          { to: '/restaurants', label: 'All Restaurants Catalog', icon: Compass },
          { to: '/my-restaurant', label: 'My Restaurant', icon: Store },
          { to: '/menu', label: 'Menu Management', icon: UtensilsCrossed },
          { to: '/incoming-orders', label: 'Incoming Orders', icon: ChefHat },
        ]
      : []),

    // Delivery Person links
    ...(role === 'DELIVERY_PERSON'
      ? [{ to: '/my-deliveries', label: 'Deliveries & Tasks', icon: Truck }]
      : []),

    // Admin links
    ...(role === 'ADMIN'
      ? [
          { to: '/restaurants', label: 'All Restaurants', icon: Store },
          { to: '/admin/users', label: 'User Accounts', icon: Users },
        ]
      : []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar aside element */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col justify-between py-6 px-4 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Menu Navigation
              </p>
              <nav className="mt-3 space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 shadow-xs'
                            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Quick Help / Info box at bottom of sidebar */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50/50 dark:from-slate-800 dark:to-slate-800/80 border border-orange-100 dark:border-slate-700/80">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-orange-950 dark:text-orange-200">System Online</span>
            </div>
            <p className="text-[11px] text-orange-900/70 dark:text-slate-400 leading-relaxed">
              Connected to 5 BiteFlow microservices on ports 5001–5005.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
