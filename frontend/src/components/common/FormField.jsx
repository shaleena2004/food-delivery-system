import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export const FormField = forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      value,
      onChange,
      onBlur,
      error,
      touched,
      placeholder = '',
      required = false,
      disabled = false,
      helperText = '',
      rows = 3,
      options = [],
      className = '',
      as = 'input', // 'input', 'textarea', 'select'
      icon: Icon,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(error && (touched !== false));

    const baseInputClasses = `w-full rounded-xl border transition-all duration-200 text-sm focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 ${
      hasError
        ? 'border-red-300 dark:border-red-500/80 bg-red-50/20 dark:bg-red-950/20 text-red-900 dark:text-red-200 focus:border-red-500 focus:ring-red-400'
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 focus:border-orange-500 focus:ring-orange-400'
    } ${Icon ? 'pl-10' : 'px-4'} py-2.5`;

    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <label htmlFor={name} className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Icon className="w-4 h-4" />
            </div>
          )}

          {as === 'textarea' ? (
            <textarea
              id={name}
              name={name}
              ref={ref}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              placeholder={placeholder}
              rows={rows}
              className={`${baseInputClasses} resize-none`}
              {...props}
            />
          ) : as === 'select' ? (
            <select
              id={name}
              name={name}
              ref={ref}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              className={`${baseInputClasses} pr-8 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:9px_9px] bg-[right_1rem_center] bg-no-repeat`}
              {...props}
            >
              {options.map((opt) => (
                <option key={opt.value ?? opt} value={opt.value ?? opt} className="dark:bg-slate-900 dark:text-slate-100">
                  {opt.label ?? opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={name}
              name={name}
              ref={ref}
              type={type}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              placeholder={placeholder}
              className={baseInputClasses}
              {...props}
            />
          )}
        </div>

        {hasError ? (
          <p className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-400 dark:text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
