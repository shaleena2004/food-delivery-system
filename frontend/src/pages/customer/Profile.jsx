import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customer.service';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { validators } from '../../utils/validators';
import { Panel } from '../../components/common/Panel';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { Modal } from '../../components/common/Modal';
import { DataState } from '../../components/common/DataState';
import {
  User,
  Phone,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Home,
  Check,
} from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState('');

  // Fetch Customer Profile
  const {
    data: profile,
    loading: loadingProfile,
    error: errorProfile,
    refetch: refetchProfile,
  } = useFetch((signal) => customerService.getProfile(signal));

  // Fetch Delivery Addresses
  const {
    data: addresses,
    loading: loadingAddresses,
    error: errorAddresses,
    refetch: refetchAddresses,
  } = useFetch((signal) => customerService.getAddresses(signal));

  // Profile Form
  const profileForm = useForm(
    {
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
    {
      firstName: (v) => validators.required(v, 'First name'),
      phoneNumber: (v) => validators.phone(v),
    }
  );

  // Update profile form values when profile data is loaded
  useEffect(() => {
    if (profile) {
      profileForm.setValues({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phoneNumber: profile.phoneNumber || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Address Form
  const addressForm = useForm(
    {
      addressName: 'Home',
      addressLines: '',
      city: '',
      postalCode: '',
      isDefault: false,
    },
    {
      addressName: (v) => validators.required(v, 'Address label'),
      addressLines: (v) => validators.required(v, 'Street address'),
      city: (v) => validators.required(v, 'City'),
      postalCode: (v) => validators.required(v, 'Postal code'),
    }
  );

  const onUpdateProfile = async (values) => {
    setProfileSuccess('');
    await customerService.updateProfile(values);
    setProfileSuccess('Profile details saved successfully!');
    setTimeout(() => setProfileSuccess(''), 3000);
    refetchProfile();
  };

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    addressForm.resetForm();
    setAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr) => {
    setEditingAddressId(addr._id || addr.id);
    addressForm.setValues({
      addressName: addr.addressName,
      addressLines: addr.addressLines,
      city: addr.city,
      postalCode: addr.postalCode,
      isDefault: Boolean(addr.isDefault),
    });
    setAddressModalOpen(true);
  };

  const onSubmitAddress = async (values) => {
    if (editingAddressId) {
      await customerService.updateAddress(editingAddressId, values);
    } else {
      await customerService.addAddress(values);
    }
    setAddressModalOpen(false);
    refetchAddresses();
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      await customerService.deleteAddress(id);
      refetchAddresses();
    }
  };

  const handleSetDefault = async (id) => {
    await customerService.setDefaultAddress(id);
    refetchAddresses();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
          Customer Profile & Addresses
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details and delivery drop-off locations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left: Personal Profile Form */}
        <div className="md:col-span-5">
          <Panel
            title="Personal Details"
            subtitle="Your contact information for deliveries"
            badge={<User className="w-4 h-4 text-orange-500" />}
          >
            <DataState loading={loadingProfile} error={errorProfile} onRetry={refetchProfile}>
              {() => (
                <form onSubmit={profileForm.handleSubmit(onUpdateProfile)} className="space-y-4">
                  {profileSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500">
                    <span className="block font-bold text-slate-700">Account Email:</span>
                    <span>{user?.email}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      label="First Name"
                      name="firstName"
                      placeholder="Jane"
                      value={profileForm.values.firstName}
                      onChange={profileForm.handleChange}
                      onBlur={profileForm.handleBlur}
                      error={profileForm.errors.firstName}
                      touched={profileForm.touched.firstName}
                      required
                    />

                    <FormField
                      label="Last Name"
                      name="lastName"
                      placeholder="Doe"
                      value={profileForm.values.lastName}
                      onChange={profileForm.handleChange}
                      onBlur={profileForm.handleBlur}
                    />
                  </div>

                  <FormField
                    label="Contact Phone"
                    name="phoneNumber"
                    placeholder="+1 (555) 123-4567"
                    value={profileForm.values.phoneNumber}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    error={profileForm.errors.phoneNumber}
                    touched={profileForm.touched.phoneNumber}
                    icon={Phone}
                    helperText="Used by delivery drivers to contact you."
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full mt-2"
                    loading={profileForm.isSubmitting}
                  >
                    Save Profile
                  </Button>
                </form>
              )}
            </DataState>
          </Panel>
        </div>

        {/* Right: Delivery Addresses */}
        <div className="md:col-span-7">
          <Panel
            title="Saved Delivery Addresses"
            subtitle="Manage your home, office, and frequent drop-offs"
            badge={<MapPin className="w-4 h-4 text-orange-500" />}
            actions={
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAddAddress}
                icon={Plus}
              >
                Add Address
              </Button>
            }
          >
            <DataState
              loading={loadingAddresses}
              error={errorAddresses}
              empty={!addresses || addresses.length === 0}
              emptyMessage="No addresses saved yet"
              emptySubtext="Add your first address to enjoy 1-click checkout!"
              onRetry={refetchAddresses}
              emptyAction={
                <Button variant="primary" size="sm" onClick={handleOpenAddAddress} icon={Plus}>
                  Add Address Now
                </Button>
              }
            >
              {() => (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const addrId = addr._id || addr.id;

                    return (
                      <div
                        key={addrId}
                        className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                          addr.isDefault
                            ? 'border-orange-300 bg-orange-50/30 shadow-xs'
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              addr.isDefault
                                ? 'bg-orange-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <Home className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-800">
                                {addr.addressName}
                              </h4>
                              {addr.isDefault && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {addr.addressLines}
                            </p>
                            <p className="text-xs text-slate-400">
                              {addr.city}, {addr.postalCode}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefault(addrId)}
                              className="text-[11px] font-semibold text-slate-500 hover:text-orange-600 px-2 py-1 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
                              title="Set as Default"
                            >
                              Make Default
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleOpenEditAddress(addr)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addrId)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </DataState>
          </Panel>
        </div>
      </div>

      {/* Add / Edit Address Modal */}
      <Modal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        title={editingAddressId ? 'Edit Address' : 'Add New Address'}
        subtitle="Saved to your BiteFlow customer profile"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setAddressModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={addressForm.isSubmitting}
              onClick={addressForm.handleSubmit(onSubmitAddress)}
            >
              {editingAddressId ? 'Save Changes' : 'Add Address'}
            </Button>
          </>
        }
      >
        <form className="space-y-3.5">
          <FormField
            label="Label (e.g. Home, Office, Beach House)"
            name="addressName"
            placeholder="Home"
            value={addressForm.values.addressName}
            onChange={addressForm.handleChange}
            onBlur={addressForm.handleBlur}
            error={addressForm.errors.addressName}
            touched={addressForm.touched.addressName}
            required
          />

          <FormField
            label="Street Address / Building"
            name="addressLines"
            placeholder="123 Main St, Suite 400"
            value={addressForm.values.addressLines}
            onChange={addressForm.handleChange}
            onBlur={addressForm.handleBlur}
            error={addressForm.errors.addressLines}
            touched={addressForm.touched.addressLines}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="City"
              name="city"
              placeholder="San Francisco"
              value={addressForm.values.city}
              onChange={addressForm.handleChange}
              onBlur={addressForm.handleBlur}
              error={addressForm.errors.city}
              touched={addressForm.touched.city}
              required
            />

            <FormField
              label="Postal Code"
              name="postalCode"
              placeholder="94105"
              value={addressForm.values.postalCode}
              onChange={addressForm.handleChange}
              onBlur={addressForm.handleBlur}
              error={addressForm.errors.postalCode}
              touched={addressForm.touched.postalCode}
              required
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-2">
            <input
              type="checkbox"
              name="isDefault"
              checked={addressForm.values.isDefault}
              onChange={addressForm.handleChange}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
            />
            <span>Set as default delivery address</span>
          </label>
        </form>
      </Modal>
    </div>
  );
};
