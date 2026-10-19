import React from 'react';
import { formatStatus } from '../../utils/formatters';

export const StatusBadge = ({ status, size = 'md', className = '' }) => {
  const configs = {
    // Orders
    PENDING: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
    CONFIRMED: { bg: 'bg-blue-50 text-blue-700 border-blue-200/80', dot: 'bg-blue-500' },
    PREPARING: { bg: 'bg-purple-50 text-purple-700 border-purple-200/80', dot: 'bg-purple-500' },
    READY_FOR_PICKUP: { bg: 'bg-teal-50 text-teal-700 border-teal-200/80', dot: 'bg-teal-500' },
    PICKED_UP: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80', dot: 'bg-indigo-500' },
    ON_THE_WAY: { bg: 'bg-orange-50 text-orange-700 border-orange-200/80', dot: 'bg-orange-500' },
    DELIVERED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
    CANCELLED: { bg: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500' },

    // Deliveries
    ASSIGNED: { bg: 'bg-sky-50 text-sky-700 border-sky-200/80', dot: 'bg-sky-500' },
    PICKUP_PENDING: { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200/80', dot: 'bg-cyan-500' },
    FAILED: { bg: 'bg-red-50 text-red-700 border-red-200/80', dot: 'bg-red-500' },

    // Restaurant & Account
    OPEN: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
    CLOSED: { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
    ACTIVE: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
    INACTIVE: { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  };

  const current = configs[status] || {
    bg: 'bg-slate-50 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-xs transition-colors ${
        current.bg
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{formatStatus(status)}</span>
    </span>
  );
};
