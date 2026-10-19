import React from 'react';
import { Spinner } from './Spinner';
import { Button } from './Button';
import { AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export const DataState = ({
  loading = false,
  error = null,
  empty = false,
  emptyMessage = 'No items found',
  emptySubtext = 'Try adjusting your filters or check back later.',
  emptyAction = null,
  onRetry = null,
  loadingMessage = 'Loading delicious options...',
  children,
}) => {
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">{loadingMessage}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 px-6 max-w-md mx-auto text-center bg-red-50/80 rounded-2xl border border-red-100 my-6">
        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-red-900 mb-1">Failed to load data</h4>
        <p className="text-xs text-red-600 mb-5 leading-relaxed">{error}</p>
        {onRetry && (
          <Button variant="danger" size="sm" onClick={onRetry} icon={RefreshCw}>
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="py-20 px-6 max-w-md mx-auto text-center">
        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <Inbox className="w-8 h-8" />
        </div>
        <h4 className="text-lg font-bold text-slate-800 mb-1">{emptyMessage}</h4>
        <p className="text-sm text-slate-500 mb-6">{emptySubtext}</p>
        {emptyAction}
      </div>
    );
  }

  // Children-as-a-function pattern supported
  return typeof children === 'function' ? children() : children;
};
