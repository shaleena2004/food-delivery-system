import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle } from 'lucide-react';

export const AppShell = () => {
  const { isAuthenticated } = useAuth();
  const { conflictModal, confirmReplaceCart, cancelReplaceCart } = useCart();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] dark:bg-[#0b0f19] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex">
        {/* Sidebar (when authenticated) */}
        {isAuthenticated && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 flex flex-col transition-all duration-300 ${
            isAuthenticated ? 'lg:pl-64' : ''
          }`}
        >
          <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>

      {/* Restaurant Cart Conflict Modal */}
      <Modal
        isOpen={conflictModal.isOpen}
        onClose={cancelReplaceCart}
        title="Start a new basket?"
        subtitle="Your cart contains items from a different restaurant"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={cancelReplaceCart}>
              Keep Current Cart
            </Button>
            <Button variant="primary" size="sm" onClick={confirmReplaceCart}>
              Start New Cart
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            You can only order items from one restaurant at a time. Adding an item from{' '}
            <strong className="text-slate-800">{conflictModal.newRestaurant?.name}</strong> will
            clear your current cart.
          </p>
        </div>
      </Modal>
    </div>
  );
};
