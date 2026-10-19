import React, { useEffect, useState } from 'react';
import { restaurantService } from '../../services/restaurant.service';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { validators } from '../../utils/validators';
import { Panel } from '../../components/common/Panel';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataState } from '../../components/common/DataState';
import {
  Store,
  Clock,
  MapPin,
  Phone,
  Mail,
  UtensilsCrossed,
  Image,
  Power,
  CheckCircle,
} from 'lucide-react';

const CUISINES = [
  'Italian',
  'Burgers & Fast Food',
  'Asian & Sushi',
  'Mexican',
  'Indian & Curry',
  'Desserts & Cafe',
  'Healthy & Bowls',
];

export const MyRestaurant = () => {
  const [successMsg, setSuccessMsg] = useState('');

  const {
    data: restaurant,
    loading,
    error,
    refetch,
  } = useFetch((signal) => restaurantService.getMyRestaurant(signal));

  const form = useForm(
    {
      name: '',
      description: '',
      address: '',
      contactNumber: '',
      email: '',
      cuisineType: 'Italian',
      openingTime: '10:00 AM',
      closingTime: '10:00 PM',
      imageUrl: '',
    },
    {
      name: (v) => validators.required(v, 'Restaurant name'),
      address: (v) => validators.required(v, 'Address'),
      contactNumber: (v) => validators.required(v, 'Contact number'),
      cuisineType: (v) => validators.required(v, 'Cuisine type'),
    }
  );

  useEffect(() => {
    if (restaurant) {
      form.setValues({
        name: restaurant.name || '',
        description: restaurant.description || '',
        address: restaurant.address || '',
        contactNumber: restaurant.contactNumber || '',
        email: restaurant.email || '',
        cuisineType: restaurant.cuisineType || 'Italian',
        openingTime: restaurant.openingTime || '10:00 AM',
        closingTime: restaurant.closingTime || '10:00 PM',
        imageUrl: restaurant.imageUrl || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant]);

  const onSubmit = async (values) => {
    setSuccessMsg('');
    if (restaurant) {
      const restId = restaurant._id || restaurant.id;
      await restaurantService.updateRestaurant(restId, values);
      setSuccessMsg('Restaurant details updated successfully!');
    } else {
      await restaurantService.createRestaurant(values);
      setSuccessMsg('Restaurant created successfully!');
    }
    setTimeout(() => setSuccessMsg(''), 3000);
    refetch();
  };

  const handleToggleStatus = async () => {
    if (!restaurant) return;
    const restId = restaurant._id || restaurant.id;
    await restaurantService.toggleStatus(restId);
    refetch();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            My Restaurant
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your restaurant profile, contact details, operating hours, and store status
          </p>
        </div>

        {restaurant && (
          <div className="flex items-center gap-3">
            <StatusBadge status={restaurant.status} size="lg" />
            <Button
              variant={restaurant.status === 'OPEN' ? 'secondary' : 'success'}
              size="sm"
              icon={Power}
              onClick={handleToggleStatus}
            >
              {restaurant.status === 'OPEN' ? 'Close Restaurant' : 'Open Restaurant'}
            </Button>
          </div>
        )}
      </div>

      <DataState loading={loading} error={error} onRetry={refetch}>
        {() => (
          <Panel
            title={restaurant ? 'Restaurant Profile' : 'Register Your Restaurant'}
            subtitle="Details visible to customers on BiteFlow"
            badge={<Store className="w-4 h-4 text-orange-500" />}
          >
            {successMsg && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Restaurant Name"
                  name="name"
                  placeholder="e.g. Bella Napoli Trattoria"
                  value={form.values.name}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  error={form.errors.name}
                  touched={form.touched.name}
                  required
                  icon={Store}
                />

                <FormField
                  label="Cuisine Type"
                  name="cuisineType"
                  as="select"
                  value={form.values.cuisineType}
                  onChange={form.handleChange}
                  options={CUISINES}
                  required
                  icon={UtensilsCrossed}
                />
              </div>

              <FormField
                label="Restaurant Description"
                name="description"
                as="textarea"
                rows={3}
                placeholder="Share your story, signature dishes, and cuisine style..."
                value={form.values.description}
                onChange={form.handleChange}
                onBlur={form.handleBlur}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Physical Address"
                  name="address"
                  placeholder="142 Via Roma, Culinary Quarter"
                  value={form.values.address}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  error={form.errors.address}
                  touched={form.touched.address}
                  required
                  icon={MapPin}
                />

                <FormField
                  label="Contact Phone"
                  name="contactNumber"
                  placeholder="+1 (555) 234-5678"
                  value={form.values.contactNumber}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  error={form.errors.contactNumber}
                  touched={form.touched.contactNumber}
                  required
                  icon={Phone}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Opening Time"
                  name="openingTime"
                  placeholder="10:00 AM"
                  value={form.values.openingTime}
                  onChange={form.handleChange}
                  icon={Clock}
                />

                <FormField
                  label="Closing Time"
                  name="closingTime"
                  placeholder="10:00 PM"
                  value={form.values.closingTime}
                  onChange={form.handleChange}
                  icon={Clock}
                />
              </div>

              <FormField
                label="Cover Image URL"
                name="imageUrl"
                placeholder="https://images.unsplash.com/..."
                value={form.values.imageUrl}
                onChange={form.handleChange}
                icon={Image}
                helperText="Paste a high-resolution Unsplash photo URL"
              />

              {form.values.imageUrl && (
                <div className="h-40 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={form.values.imageUrl}
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-4"
                loading={form.isSubmitting}
              >
                {restaurant ? 'Update Restaurant Details' : 'Create My Restaurant'}
              </Button>
            </form>
          </Panel>
        )}
      </DataState>
    </div>
  );
};
