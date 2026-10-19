import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { FormField } from '../common/FormField';
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  UtensilsCrossed,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Star,
  Sparkles,
} from 'lucide-react';

const CUISINES = [
  'Italian',
  'Burgers & Fast Food',
  'Asian & Sushi',
  'Mexican',
  'Indian & Curry',
  'Desserts & Cafe',
  'Healthy & Bowls',
  'American',
  'Mediterranean',
];

const SAMPLE_RESTAURANT_IMAGES = [
  {
    name: 'Italian',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Burger',
    url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Sushi',
    url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Cafe',
    url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80',
  },
];

export const RestaurantEditModal = ({
  isOpen,
  onClose,
  restaurant,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    cuisineType: 'Italian',
    description: '',
    address: '',
    contactNumber: '',
    email: '',
    openingTime: '11:00 AM',
    closingTime: '10:30 PM',
    status: 'OPEN',
    deliveryTimeEstimate: '20-30 min',
    imageUrl: '',
    rating: 4.8,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        cuisineType: restaurant.cuisineType || 'Italian',
        description: restaurant.description || '',
        address: restaurant.address || '',
        contactNumber: restaurant.contactNumber || '',
        email: restaurant.email || '',
        openingTime: restaurant.openingTime || '11:00 AM',
        closingTime: restaurant.closingTime || '10:30 PM',
        status: restaurant.status || 'OPEN',
        deliveryTimeEstimate: restaurant.deliveryTimeEstimate || '25-35 min',
        imageUrl: restaurant.imageUrl || '',
        rating: restaurant.rating || 4.8,
      });
    } else {
      setFormData({
        name: '',
        cuisineType: 'Italian',
        description: '',
        address: '',
        contactNumber: '',
        email: '',
        openingTime: '11:00 AM',
        closingTime: '10:30 PM',
        status: 'OPEN',
        deliveryTimeEstimate: '20-30 min',
        imageUrl: SAMPLE_RESTAURANT_IMAGES[0].url,
        rating: 4.8,
      });
    }
    setError('');
  }, [restaurant, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Restaurant name is required');
      return;
    }
    if (!formData.address.trim()) {
      setError('Physical address is required');
      return;
    }
    if (!formData.contactNumber.trim()) {
      setError('Contact phone number is required');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData, restaurant?._id || restaurant?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save restaurant details');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={restaurant ? `Edit: ${restaurant.name}` : 'Add New Restaurant'}
      subtitle={
        restaurant
          ? 'Update restaurant information, operating hours, and status'
          : 'Create a new partner restaurant in BiteFlow'
      }
      maxWidth="max-w-2xl"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={saving}
            onClick={handleSubmit}
            icon={CheckCircle}
          >
            {restaurant ? 'Save Changes' : 'Create Restaurant'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Row 1: Name & Cuisine */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Restaurant Name"
            name="name"
            placeholder="e.g. Bella Napoli Trattoria"
            value={formData.name}
            onChange={handleChange}
            required
            icon={Store}
          />

          <FormField
            label="Cuisine Type"
            name="cuisineType"
            as="select"
            value={formData.cuisineType}
            onChange={handleChange}
            options={CUISINES}
            required
            icon={UtensilsCrossed}
          />
        </div>

        {/* Description */}
        <FormField
          label="Description"
          name="description"
          as="textarea"
          rows={2}
          placeholder="Authentic dishes, signature specials, and culinary story..."
          value={formData.description}
          onChange={handleChange}
        />

        {/* Row 2: Address & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Address"
            name="address"
            placeholder="e.g. 142 Via Roma, Culinary Quarter"
            value={formData.address}
            onChange={handleChange}
            required
            icon={MapPin}
          />

          <FormField
            label="Contact Phone"
            name="contactNumber"
            placeholder="+1 (555) 234-5678"
            value={formData.contactNumber}
            onChange={handleChange}
            required
            icon={Phone}
          />
        </div>

        {/* Row 3: Operating Hours & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            label="Opening Time"
            name="openingTime"
            placeholder="11:00 AM"
            value={formData.openingTime}
            onChange={handleChange}
            icon={Clock}
          />

          <FormField
            label="Closing Time"
            name="closingTime"
            placeholder="10:30 PM"
            value={formData.closingTime}
            onChange={handleChange}
            icon={Clock}
          />

          <FormField
            label="Current Status"
            name="status"
            as="select"
            value={formData.status}
            onChange={handleChange}
            options={['OPEN', 'CLOSED']}
          />
        </div>

        {/* Row 4: Delivery estimate & Rating */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Delivery Time Estimate"
            name="deliveryTimeEstimate"
            placeholder="20-30 min"
            value={formData.deliveryTimeEstimate}
            onChange={handleChange}
            icon={Clock}
          />

          <FormField
            label="Rating (1.0 - 5.0)"
            name="rating"
            type="number"
            step="0.1"
            min="1"
            max="5"
            value={formData.rating}
            onChange={handleChange}
            icon={Star}
          />
        </div>

        {/* Cover Image URL with quick presets and preview */}
        <div className="space-y-2">
          <FormField
            label="Cover Image URL"
            name="imageUrl"
            placeholder="https://images.unsplash.com/..."
            value={formData.imageUrl}
            onChange={handleChange}
            icon={ImageIcon}
          />

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-400">Sample photos:</span>
            {SAMPLE_RESTAURANT_IMAGES.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, imageUrl: preset.url }))}
                className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-700 text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer"
              >
                + {preset.name}
              </button>
            ))}
          </div>

          {formData.imageUrl && (
            <div className="h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mt-2">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.style.display = 'none')}
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
