import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { restaurantService } from '../../services/restaurant.service';
import { useFetch } from '../../hooks/useFetch';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { DataState } from '../../components/common/DataState';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { RestaurantEditModal } from '../../components/restaurant/RestaurantEditModal';
import { RestaurantDeleteModal } from '../../components/restaurant/RestaurantDeleteModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Modal } from '../../components/common/Modal';
import {
  Star,
  Clock,
  MapPin,
  Phone,
  Plus,
  Check,
  ShoppingBag,
  ArrowLeft,
  Info,
  Edit,
  Trash2,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  CheckCircle,
  AlertCircle,
  User,
} from 'lucide-react';

export const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user && user.role === 'ADMIN';

  const { addItem, cart, totalItemCount, total } = useCart();
  const [addedItemIds, setAddedItemIds] = useState({});
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Review & Rating Modal State
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [rateToast, setRateToast] = useState('');

  // 1. Fetch Restaurant Details
  const {
    data: restaurant,
    loading: loadingRest,
    error: errorRest,
    refetch: refetchRest,
  } = useFetch((signal) => restaurantService.getRestaurantById(id, signal), [id]);

  // 2. Fetch Menu Items
  const {
    data: menuItems,
    loading: loadingMenu,
    error: errorMenu,
    refetch: refetchMenu,
  } = useFetch((signal) => restaurantService.getMenu(id, signal), [id]);

  // 3. Fetch Real-time Customer Reviews
  const {
    data: reviewsData,
    refetch: refetchReviews,
  } = useFetch((signal) => restaurantService.getReviews(id, signal), [id]);

  const handleRateSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRatingError('');
    setRatingSubmitting(true);
    try {
      await restaurantService.rateRestaurant(id, {
        rating: userRating,
        comment: userComment,
      });
      setRateToast('Thank you! Your rating and review were recorded in real-time!');
      setTimeout(() => setRateToast(''), 4500);
      setRateModalOpen(false);
      setUserComment('');
      refetchRest();
      refetchReviews();
    } catch (err) {
      setRatingError(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleAddToCart = (item) => {
    if (!restaurant) return;
    const success = addItem(item, restaurant);
    if (success) {
      const itemId = item._id || item.id;
      setAddedItemIds((prev) => ({ ...prev, [itemId]: true }));
      setTimeout(() => {
        setAddedItemIds((prev) => ({ ...prev, [itemId]: false }));
      }, 1200);
    }
  };

  // Group menu by category
  const categories = React.useMemo(() => {
    if (!menuItems || !Array.isArray(menuItems)) return {};
    return menuItems.reduce((acc, item) => {
      const cat = item.category || 'Specialties';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  }, [menuItems]);

  const loading = loadingRest || loadingMenu;
  const error = errorRest || errorMenu;

  const handleSaveRestaurant = async (formData) => {
    await restaurantService.updateRestaurant(id, formData);
    refetchRest();
  };

  const handleConfirmDelete = async () => {
    await restaurantService.deleteRestaurant(id);
    navigate('/restaurants');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Rate Toast Notification */}
      {rateToast && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{rateToast}</span>
        </div>
      )}

      {/* Top Bar & Back */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/restaurants"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all restaurants</span>
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Admin Mode
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={Edit}
              onClick={() => setEditModalOpen(true)}
            >
              Edit Restaurant
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Trash2}
              onClick={() => setDeleteModalOpen(true)}
            >
              Delete Restaurant
            </Button>
          </div>
        )}
      </div>

      <DataState
        loading={loading}
        error={error}
        empty={!restaurant}
        emptyMessage="Restaurant not found"
        onRetry={() => {
          refetchRest();
          refetchMenu();
          refetchReviews();
        }}
      >
        {() => (
          <>
            {/* Restaurant Hero Banner */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="relative h-64 sm:h-80 overflow-hidden bg-slate-100">
                <img
                  src={restaurant.imageUrl}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute top-4 right-4">
                  <StatusBadge status={restaurant.status} size="lg" />
                </div>
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-orange-600 text-white">
                    {restaurant.cuisineType}
                  </span>
                  <h1 className="text-2xl sm:text-4xl font-black mt-2 tracking-tight">
                    {restaurant.name}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl line-clamp-2">
                    {restaurant.description}
                  </p>
                </div>
              </div>

              {/* Quick Details Bar */}
              <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-slate-600">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>
                      {restaurant.rating !== undefined && restaurant.rating !== null ? Number(restaurant.rating).toFixed(1) : '5.0'}
                    </span>
                    <span className="text-slate-400 font-medium">
                      ({restaurant.totalRatings || 0} {restaurant.totalRatings === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{restaurant.deliveryTimeEstimate || '25-35 min'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{restaurant.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{restaurant.contactNumber}</span>
                  </div>
                </div>

                <div className="text-xs font-semibold text-slate-500">
                  Open Hours: <strong className="text-slate-700">{restaurant.openingTime} - {restaurant.closingTime}</strong>
                </div>
              </div>
            </div>

            {/* Menu Sections Grouped by Category */}
            {Object.keys(categories).length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 p-8">
                <Info className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-slate-700">No menu items available</h3>
                <p className="text-xs text-slate-400 mt-1">This restaurant hasn't added dishes yet.</p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(categories).map(([category, items]) => (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-black text-slate-800 tracking-tight">{category}</h2>
                      <span className="text-xs font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-100">
                        {items.length} items
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {items.map((item) => {
                        const itemId = item._id || item.id;
                        const isJustAdded = addedItemIds[itemId];

                        return (
                          <div
                            key={itemId}
                            className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs hover:shadow-md transition-all flex items-center justify-between gap-4"
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <h4 className="text-sm font-bold text-slate-800 leading-snug">
                                {item.name}
                              </h4>
                              {item.description && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                  {item.description}
                                </p>
                              )}
                              <div className="mt-2.5 flex items-center gap-3">
                                <span className="text-sm font-black text-orange-600">
                                  {formatCurrency(item.price)}
                                </span>
                              </div>
                            </div>

                            {/* Food Image & Add Button */}
                            <div className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-slate-100">
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <button
                                type="button"
                                onClick={() => handleAddToCart(item)}
                                className={`absolute bottom-1.5 right-1.5 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                                  isJustAdded
                                    ? 'bg-emerald-500 text-white scale-110'
                                    : 'bg-white text-orange-600 hover:bg-orange-500 hover:text-white hover:scale-105'
                                }`}
                                title="Add to Cart"
                              >
                                {isJustAdded ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Plus className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Customer Reviews & Live Ratings Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-md bg-amber-100 text-amber-600">
                      <Star className="w-4 h-4 fill-amber-500" />
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                      Customer Ratings & Feedback
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight mt-1">
                    Live Verified Reviews
                  </h3>
                  <p className="text-xs text-slate-400">
                    Real-time customer feedback updated dynamically with every rating & order
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-black text-slate-900 leading-none">
                      {restaurant.rating !== undefined && restaurant.rating !== null ? Number(restaurant.rating).toFixed(1) : '5.0'}
                      <span className="text-xs text-slate-400 font-normal"> / 5.0</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {restaurant.totalRatings || 0} verified ratings
                    </span>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={Sparkles}
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login');
                      } else {
                        setRateModalOpen(true);
                      }
                    }}
                  >
                    Rate Restaurant
                  </Button>
                </div>
              </div>

              {/* Reviews List */}
              {(!restaurant.ratingsList || restaurant.ratingsList.length === 0) &&
              (!reviewsData?.reviews || reviewsData.reviews.length === 0) ? (
                <div className="text-center py-10 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-6">
                  <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-700">No reviews yet</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Be the first verified customer to rate and review {restaurant.name}!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(reviewsData?.reviews || restaurant.ratingsList || []).map((rev, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-bold flex items-center justify-center text-xs">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">
                              {rev.userName || 'Verified Customer'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {rev.createdAt ? formatDate(rev.createdAt) : 'Recently'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{rev.rating || 5}★</span>
                        </div>
                      </div>

                      {rev.comment && (
                        <p className="text-xs text-slate-600 leading-relaxed italic bg-white p-2.5 rounded-xl border border-slate-100">
                          "{rev.comment}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Floating Cart Pill at Bottom */}
            {totalItemCount > 0 && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4 animate-slideUp">
                <Link
                  to="/cart"
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-2xl shadow-slate-900/40 hover:bg-slate-800 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-300">
                        {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in cart
                      </span>
                      <div className="text-sm font-bold text-white">
                        {formatCurrency(total)}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-orange-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Checkout Now &rarr;
                  </span>
                </Link>
              </div>
            )}
          </>
        )}
      </DataState>

      {/* Rate Restaurant Modal */}
      <Modal
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        title={`Rate & Review: ${restaurant?.name}`}
        subtitle="Your real-time review directly updates the restaurant's live score"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRateModalOpen(false)}
              disabled={ratingSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={ratingSubmitting}
              onClick={handleRateSubmit}
              icon={Sparkles}
            >
              Submit Rating
            </Button>
          </>
        }
      >
        <form onSubmit={handleRateSubmit} className="space-y-4">
          {ratingError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{ratingError}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Select Your Rating:
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setUserRating(star)}
                  className="p-2 rounded-xl transition-all hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= userRating
                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                        : 'text-slate-300 hover:text-amber-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-black text-amber-600 ml-2">
                {userRating} / 5 Stars
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 italic">
              {userRating === 5 && 'Outstanding — Absolutely loved it! ⭐'}
              {userRating === 4 && 'Very Good — Fresh and delicious!'}
              {userRating === 3 && 'Good — Met expectations.'}
              {userRating === 2 && 'Fair — Could be better.'}
              {userRating === 1 && 'Poor — Disappointing.'}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Your Review / Comments (Optional):
            </label>
            <textarea
              rows={3}
              placeholder="Tell others about the food quality, flavors, and packaging..."
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </form>
      </Modal>

      {/* Admin Modals */}
      <RestaurantEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        restaurant={restaurant}
        onSave={handleSaveRestaurant}
      />

      <RestaurantDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        restaurant={restaurant}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
