import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { restaurantService } from '../../services/restaurant.service';
import { useFetch } from '../../hooks/useFetch';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataState } from '../../components/common/DataState';
import { RestaurantEditModal } from '../../components/restaurant/RestaurantEditModal';
import {
  Store,
  Clock,
  MapPin,
  Phone,
  Mail,
  UtensilsCrossed,
  Power,
  Edit3,
  CheckCircle,
  Star,
  ChefHat,
  Sparkles,
  ShieldCheck,
  Plus,
  AlertCircle,
} from 'lucide-react';

export const MyRestaurant = () => {
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');

  const {
    data: restaurant,
    loading,
    error,
    refetch,
  } = useFetch((signal) => restaurantService.getMyRestaurant(signal));

  const showNotification = (msg, type = 'success') => {
    setFeedbackMsg(msg);
    setFeedbackType(type);
    setTimeout(() => setFeedbackMsg(''), 4000);
  };

  // Toggle store open/closed status
  const handleToggleStatus = async () => {
    if (!restaurant) return;
    const restId = restaurant._id || restaurant.id;
    setTogglingStatus(true);
    try {
      const res = await restaurantService.toggleStatus(restId);
      const newStatus = res.data?.status || (restaurant.status === 'OPEN' ? 'CLOSED' : 'OPEN');
      showNotification(
        `Store status updated! Your restaurant is now ${newStatus === 'OPEN' ? 'OPEN for orders' : 'CLOSED'}.`
      );
      refetch();
    } catch (err) {
      showNotification(err.message || 'Failed to toggle restaurant status', 'error');
    } finally {
      setTogglingStatus(false);
    }
  };

  // Save changes from Edit Modal
  const handleSaveRestaurant = async (formData, restId) => {
    if (restId) {
      await restaurantService.updateRestaurant(restId, formData);
      showNotification('Restaurant details updated successfully!');
    } else {
      await restaurantService.createRestaurant(formData);
      showNotification('Restaurant created successfully!');
    }
    refetch();
  };

  const isOpen = restaurant?.status === 'OPEN';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Page Title & Main Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <Store className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Restaurant Owner Dashboard
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            My Restaurant
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your live storefront, operating hours, and ordering availability
          </p>
        </div>

        {restaurant && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Live Close / Open Feature Toggle Button */}
            <Button
              variant={isOpen ? 'danger' : 'success'}
              size="md"
              icon={Power}
              loading={togglingStatus}
              onClick={handleToggleStatus}
              className="shadow-sm font-bold"
            >
              {isOpen ? 'Close Restaurant' : 'Open Restaurant'}
            </Button>

            {/* Edit Restaurant Details Button */}
            <Button
              variant="primary"
              size="md"
              icon={Edit3}
              onClick={() => setEditModalOpen(true)}
              className="shadow-sm font-bold"
            >
              Edit Details
            </Button>
          </div>
        )}
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-center gap-2.5 shadow-xs border transition-all ${
            feedbackType === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-200'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200'
          }`}
        >
          {feedbackType === 'error' ? (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          ) : (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          )}
          <span>{feedbackMsg}</span>
        </div>
      )}

      <DataState loading={loading} error={error} onRetry={refetch}>
        {() =>
          restaurant ? (
            <div className="space-y-6">
              {/* Hero Presentation Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                {/* Cover Image with gradient overlay */}
                <div className="relative h-64 sm:h-72 w-full bg-slate-800">
                  <img
                    src={
                      restaurant.imageUrl ||
                      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80'
                    }
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-black/30" />

                  {/* Badges on Cover Photo */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={restaurant.status} size="md" />
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 backdrop-blur-md shadow-xs flex items-center gap-1.5">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-orange-500" />
                        {restaurant.cuisineType || 'Cuisine'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-white backdrop-blur-md shadow-xs flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{restaurant.rating !== undefined && restaurant.rating !== null ? Number(restaurant.rating).toFixed(1) : '5.0'}</span>
                        <span className="text-[11px] opacity-80 font-medium">({restaurant.totalRatings || 0} reviews)</span>
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/50 text-white backdrop-blur-md shadow-xs flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-orange-400" />
                        {restaurant.deliveryTimeEstimate || '25-35 min'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Info on Cover Banner */}
                  <div className="absolute bottom-5 left-5 right-5 text-white">
                    <div className="flex items-center gap-2 mb-1.5">
                      <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0" />
                      <span className="text-xs font-bold tracking-wide uppercase text-orange-300">
                        Verified Storefront
                      </span>
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                      {restaurant.name}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl line-clamp-2 drop-shadow-xs">
                      {restaurant.description || 'Welcome to our authentic culinary experience.'}
                    </p>
                  </div>
                </div>

                {/* Status Bar Below Banner */}
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {isOpen ? 'Store is OPEN & accepting orders' : 'Store is CLOSED for new orders'}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Operating Hours: {restaurant.openingTime || '10:00 AM'} – {restaurant.closingTime || '10:00 PM'}
                      </p>
                    </div>
                  </div>

                  {/* Fast Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isOpen ? 'secondary' : 'success'}
                      size="sm"
                      icon={Power}
                      loading={togglingStatus}
                      onClick={handleToggleStatus}
                    >
                      {isOpen ? 'Turn Off / Close' : 'Turn On / Open'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Edit3}
                      onClick={() => setEditModalOpen(true)}
                    >
                      Edit Store Details
                    </Button>
                  </div>
                </div>
              </div>

              {/* Information Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Operating Hours Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-orange-200 dark:hover:border-slate-700">
                  <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Operating Hours
                  </h3>
                  <div className="mt-2.5 space-y-1">
                    <p className="text-base font-extrabold text-slate-900 dark:text-white">
                      {restaurant.openingTime || '10:00 AM'} – {restaurant.closingTime || '10:00 PM'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Standard operating schedule 7 days a week
                    </p>
                  </div>
                </div>

                {/* Location & Address Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-orange-200 dark:hover:border-slate-700">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Physical Address
                  </h3>
                  <div className="mt-2.5 space-y-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {restaurant.address || 'No physical address provided'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Food pickup point for delivery drivers
                    </p>
                  </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-orange-200 dark:hover:border-slate-700">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    Contact & Orders
                  </h3>
                  <div className="mt-2.5 space-y-1">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {restaurant.contactNumber || 'No phone number'}
                    </p>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {restaurant.email || 'No email registered'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description Panel */}
              {restaurant.description && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-2">
                    <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                    About Our Restaurant & Menu
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {restaurant.description}
                  </p>
                </div>
              )}

              {/* Customer Reviews & Live Ratings Section for Restaurant Owner */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                      <Star className="w-4 h-4 fill-amber-500" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        Customer Reviews & Real-Time Ratings
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Live Score: <strong className="text-amber-600">{restaurant.rating !== undefined && restaurant.rating !== null ? Number(restaurant.rating).toFixed(1) : '5.0'}★</strong> ({restaurant.totalRatings || 0} verified customer reviews)
                      </p>
                    </div>
                  </div>
                </div>

                {!restaurant.ratingsList || restaurant.ratingsList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    No customer reviews recorded yet. Real reviews submitted by customers upon delivery will automatically appear here.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    {restaurant.ratingsList.map((rev, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-100">
                            {rev.userName || 'Verified Customer'}
                          </span>
                          <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-md text-[11px]">
                            <Star className="w-3 h-3 fill-amber-500" />
                            {rev.rating || 5}★
                          </span>
                        </div>
                        {rev.comment && (
                          <p className="text-slate-600 dark:text-slate-300 italic">
                            "{rev.comment}"
                          </p>
                        )}
                        <span className="text-[10px] text-slate-400 block">
                          {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Management Shortcuts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent rounded-3xl p-6 border border-orange-200/80 dark:border-orange-900/40 flex flex-col justify-between">
                  <div>
                    <span className="p-2 rounded-xl bg-orange-500 text-white inline-flex mb-3 shadow-md shadow-orange-500/20">
                      <UtensilsCrossed className="w-5 h-5" />
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Menu & Dishes Management
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Create appetizing dishes, manage categories, update prices, and set availability.
                    </p>
                  </div>
                  <div className="mt-5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/menu')}
                    >
                      Manage Food Items →
                    </Button>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent rounded-3xl p-6 border border-blue-200/80 dark:border-blue-900/40 flex flex-col justify-between">
                  <div>
                    <span className="p-2 rounded-xl bg-blue-600 text-white inline-flex mb-3 shadow-md shadow-blue-500/20">
                      <ChefHat className="w-5 h-5" />
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Incoming Orders & Kitchen
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Monitor incoming customer food orders, accept preparations, and dispatch for delivery.
                    </p>
                  </div>
                  <div className="mt-5">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate('/incoming-orders')}
                    >
                      View Live Orders →
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Setup Empty State (If owner has not created a restaurant yet) */
            <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 max-w-lg mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center mx-auto mb-4">
                <Store className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-1">
                Welcome to BiteFlow Partner Portal
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                You haven't set up your restaurant profile yet. Register your restaurant details to start accepting orders from customers.
              </p>
              <Button
                variant="primary"
                size="md"
                icon={Plus}
                onClick={() => setEditModalOpen(true)}
              >
                Create Restaurant Profile
              </Button>
            </div>
          )
        }
      </DataState>

      {/* Edit / Create Restaurant Modal */}
      <RestaurantEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        restaurant={restaurant}
        onSave={handleSaveRestaurant}
      />
    </div>
  );
};
