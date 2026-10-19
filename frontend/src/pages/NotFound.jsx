import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { UtensilsCrossed, Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="py-24 max-w-md mx-auto text-center space-y-5">
      <div className="w-20 h-20 rounded-3xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto shadow-sm">
        <UtensilsCrossed className="w-10 h-10" />
      </div>
      <div>
        <span className="text-4xl font-black text-orange-500">404</span>
        <h1 className="text-2xl font-black text-slate-800 mt-1">Page Not Found</h1>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The page you are looking for does not exist or has been moved to another table.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} icon={ArrowLeft}>
          Go Back
        </Button>
        <Button variant="primary" size="sm" onClick={() => navigate('/')} icon={Home}>
          Back to Home
        </Button>
      </div>
    </div>
  );
};
