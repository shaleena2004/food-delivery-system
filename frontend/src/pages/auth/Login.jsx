import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useForm } from '../../hooks/useForm';
import { validators } from '../../utils/validators';
import { FormField } from '../../components/common/FormField';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { BiteFlowLogo } from '../../components/common/BiteFlowLogo';
import { authService } from '../../services/auth.service';
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired') === 'true';

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const form = useForm(
    { email: '', password: '' },
    {
      email: (v) => validators.email(v),
      password: (v) => validators.required(v, 'Password'),
    }
  );

  const handleRoleRedirect = (role) => {
    switch (role) {
      case 'RESTAURANT_ADMIN':
        navigate('/my-restaurant');
        break;
      case 'DELIVERY_PERSON':
        navigate('/my-deliveries');
        break;
      case 'ADMIN':
        navigate('/restaurants');
        break;
      default:
        navigate('/restaurants');
        break;
    }
  };

  const onSubmit = async (values) => {
    const user = await login(values);
    handleRoleRedirect(user.role);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    if (!resetEmail.trim()) {
      setResetError('Please enter your account email address');
      return;
    }
    if (!resetNewPassword || resetNewPassword.length < 6) {
      setResetError('New password must be at least 6 characters long');
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setResetError('New passwords do not match');
      return;
    }

    setResetSubmitting(true);
    try {
      const res = await authService.resetPassword({
        email: resetEmail.trim(),
        newPassword: resetNewPassword,
      });

      setResetSuccess(res.message || 'Password reset successfully!');
      form.setFieldValue('email', resetEmail.trim());
      form.setFieldValue('password', resetNewPassword);

      setTimeout(() => {
        setForgotModalOpen(false);
        setResetSuccess('');
      }, 2000);
    } catch (err) {
      setResetError(err.message || 'Failed to reset password');
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-orange-500/5 p-8 sm:p-10">
        <div className="text-center mb-8">
          <BiteFlowLogo size="lg" showText={false} className="justify-center mb-4" />
          <h1 className="text-2xl font-black text-slate-800">Welcome Back</h1>
          <p className="text-xs text-slate-500 mt-1">Sign in to your BiteFlow account</p>
        </div>

        {isExpired && (
          <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>Your session has expired. Please log in again to continue.</span>
          </div>
        )}

        {form.serverError && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{form.serverError}</span>
          </div>
        )}

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Email Address"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.values.email}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.email}
            touched={form.touched.email}
            required
            icon={Mail}
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(form.values.email || '');
                  setResetError('');
                  setResetSuccess('');
                  setForgotModalOpen(true);
                }}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.values.password}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
                className={`w-full rounded-xl border bg-white px-3.5 py-2.5 pl-10 text-xs transition-colors focus:outline-none focus:ring-2 ${
                  form.errors.password && form.touched.password
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-200 focus:border-orange-500 focus:ring-orange-100'
                }`}
              />
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            {form.errors.password && form.touched.password && (
              <p className="mt-1 text-[11px] text-red-500 font-medium">{form.errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            size="lg"
            loading={form.isSubmitting}
            icon={LogIn}
          >
            Sign In
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700">
            Sign up as Customer
          </Link>
        </p>
      </div>

      {/* Forgot / Reset Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Your Password"
        subtitle="Drivers, restaurant owners, and customers can set a new password."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setForgotModalOpen(false)}
              disabled={resetSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={resetSubmitting}
              onClick={handleResetPassword}
              icon={KeyRound}
            >
              Update Password
            </Button>
          </>
        }
      >
        <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
          {resetError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{resetError}</span>
            </div>
          )}

          {resetSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{resetSuccess}</span>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Account Email Address</label>
            <input
              type="email"
              placeholder="e.g. owner@biteflow.com or driver@biteflow.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">New Password (min 6 characters)</label>
            <input
              type="password"
              placeholder="••••••••"
              value={resetNewPassword}
              onChange={(e) => setResetNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={resetConfirmPassword}
              onChange={(e) => setResetConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
