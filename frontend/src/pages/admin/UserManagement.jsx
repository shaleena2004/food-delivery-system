import React, { useState } from 'react';
import { authService } from '../../services/auth.service';
import { useFetch } from '../../hooks/useFetch';
import { Panel } from '../../components/common/Panel';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField } from '../../components/common/FormField';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataState } from '../../components/common/DataState';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  Shield,
  RefreshCw,
  Power,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Mail,
  Lock,
  User,
  Sparkles,
} from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'RESTAURANT_ADMIN', label: 'Restaurant Owner (Manage Store & Dishes)' },
  { value: 'DELIVERY_PERSON', label: 'Delivery Rider (Courier Deliveries)' },
  { value: 'CUSTOMER', label: 'Customer (Place Orders)' },
  { value: 'ADMIN', label: 'System Administrator' },
];

export const UserManagement = () => {
  const [updatingId, setUpdatingId] = useState(null);
  const [msg, setMsg] = useState('');

  // Create User Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RESTAURANT_ADMIN',
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const {
    data: users,
    loading,
    error,
    refetch,
  } = useFetch((signal) => authService.getAllUsers(signal));

  const handleToggleStatus = async (user) => {
    const userId = user._id || user.id;
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setUpdatingId(userId);
    setMsg('');
    try {
      await authService.updateUserStatus(userId, newStatus);
      setMsg(`User '${user.name}' status changed to ${newStatus}`);
      setTimeout(() => setMsg(''), 4000);
      refetch();
    } catch (err) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setCreateError('Name, email, and password are required');
      return;
    }

    if (formData.password.length < 6) {
      setCreateError('Password must be at least 6 characters long');
      return;
    }

    setCreating(true);
    try {
      const res = await authService.createUserByAdmin(formData);
      setMsg(res.message || `Account for ${formData.name} created successfully!`);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'RESTAURANT_ADMIN',
      });
      setCreateModalOpen(false);
      refetch();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setCreateError(err.message || 'Failed to create user account');
    } finally {
      setCreating(false);
    }
  };

  const handleGeneratePassword = () => {
    const rolePrefix = formData.role === 'RESTAURANT_ADMIN' ? 'Owner' : formData.role === 'DELIVERY_PERSON' ? 'Rider' : 'Pass';
    const randomDigits = Math.floor(100 + Math.random() * 900);
    setFormData((prev) => ({ ...prev, password: `${rolePrefix}${randomDigits}!` }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            User Accounts Administration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provision email and passwords for Restaurant Admins and Delivery Riders, and manage account statuses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={refetch}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => {
              setCreateError('');
              setCreateModalOpen(true);
            }}
          >
            Create Staff Account
          </Button>
        </div>
      </div>

      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      <DataState
        loading={loading}
        error={error}
        empty={!users || users.length === 0}
        emptyMessage="No users found"
        onRetry={refetch}
      >
        {() => (
          <Panel
            title="Registered Accounts"
            subtitle={`${users.length} registered system accounts`}
            badge={<Users className="w-4 h-4 text-orange-500" />}
          >
            <div className="divide-y divide-slate-100">
              {users.map((u) => {
                const uId = u._id || u.id;
                const isUpdating = updatingId === uId;

                return (
                  <div
                    key={uId}
                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">
                        {u.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-800">{u.name}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'RESTAURANT_ADMIN'
                                ? 'bg-amber-100 text-amber-800'
                                : u.role === 'DELIVERY_PERSON'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <StatusBadge status={u.status} size="sm" />
                      {u.role !== 'ADMIN' && (
                        <Button
                          variant={u.status === 'ACTIVE' ? 'secondary' : 'success'}
                          size="sm"
                          loading={isUpdating}
                          icon={Power}
                          onClick={() => handleToggleStatus(u)}
                        >
                          {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}
      </DataState>

      {/* Create User / Staff Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Provision User / Staff Account"
        subtitle="Create an email and password for Restaurant Admins or Delivery Riders."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={creating}
              onClick={handleCreateUser}
              icon={UserPlus}
            >
              Create Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
          {createError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{createError}</span>
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Marco Rossi or David Rider"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              placeholder="e.g. owner@restaurant.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Initial Password</label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate Password</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. Owner2026! or Rider2026!"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Account Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
};
