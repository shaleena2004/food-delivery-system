import React from 'react';

export const Panel = ({
  title,
  subtitle,
  badge,
  actions,
  children,
  footer,
  className = '',
  bodyClassName = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden ${className}`}>
      {/* Header Slot */}
      {(title || actions || badge) && (
        <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              {title && <h3 className="text-lg font-bold text-slate-800">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
            {badge && <div>{badge}</div>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      {/* Main Body Content Slot */}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>

      {/* Footer Slot */}
      {footer && (
        <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
          {footer}
        </div>
      )}
    </div>
  );
};
