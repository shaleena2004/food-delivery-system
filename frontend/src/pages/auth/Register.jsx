import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext';
import { FormField } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { BiteFlowLogo } from '../../components/common/BiteFlowLogo';
import { User, Mail, Lock, AlertCircle, Info, ShieldCheck } from 'lucide-react';

// Zod Schema Definition for Customer Registration
const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Full name must be at least 2 characters long' })
    .max(60, { message: 'Full name cannot exceed 60 characters' }),
  email: z
    .string()
    .trim()
    .min(1, { message: 'Email address is required' })
    .email({ message: 'Please enter a valid email address (e.g. user@example.com)' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, {
      message: 'Password must contain at least one letter and one number',
    }),
});

export const Register = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  // React Hook Form with Zod validation resolver
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await registerAuth({ ...values, role: 'CUSTOMER' });
      navigate('/restaurants');
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-orange-500/5 p-8 sm:p-10 transition-colors">
        <div className="text-center mb-8">
          <BiteFlowLogo size="lg" showText={false} className="justify-center mb-4" />
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Customer Registration</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create an account to order fresh food from local restaurants
          </p>
        </div>

        {serverError && (
          <div className="mb-6 p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField
            label="Full Name"
            placeholder="Sarah Jenkins"
            error={errors.name?.message}
            touched={Boolean(errors.name)}
            required
            icon={User}
            {...register('name')}
          />

          <FormField
            label="Email Address"
            type="email"
            placeholder="sarah@example.com"
            error={errors.email?.message}
            touched={Boolean(errors.email)}
            required
            icon={Mail}
            {...register('email')}
          />

          <FormField
            label="Password"
            type="password"
            placeholder="••••••••"
            helperText="At least 6 characters with letters and numbers"
            error={errors.password?.message}
            touched={Boolean(errors.password)}
            required
            icon={Lock}
            {...register('password')}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-3"
            size="lg"
            loading={isSubmitting}
          >
            Create Customer Account
          </Button>
        </form>

        {/* Administrator Provisioning Notice */}
        <div className="mt-6 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-amber-950 dark:text-amber-100 font-bold mb-0.5">
              Restaurant Partner or Delivery Rider?
            </strong>
            <span>
              Restaurant Admin and Driver accounts are provisioned exclusively by BiteFlow System Administration. Please contact your manager or administrator to receive your login credentials.
            </span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-orange-600 dark:text-orange-400 hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};
