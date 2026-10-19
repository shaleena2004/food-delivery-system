import React from 'react';
import { Heart } from 'lucide-react';
import { BiteFlowLogo } from '../common/BiteFlowLogo';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-100 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <BiteFlowLogo size="sm" />
          <span className="text-xs text-slate-400">© {new Date().getFullYear()} All rights reserved.</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-400">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          <span>for delicious food delivery</span>
        </div>
      </div>
    </footer>
  );
};
