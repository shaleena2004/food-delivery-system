import React, { useState } from 'react';
import { orderService } from '../../services/order.service';
import {
  Star,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Trash2,
  Utensils,
  Truck,
  Image as ImageIcon,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const FOOD_RATING_LABELS = {
  1: 'Poor — Taste/temperature was disappointing',
  2: 'Fair — Acceptable but room for improvement',
  3: 'Good — Met expectations',
  4: 'Very Good — Fresh, hot, and tasty!',
  5: 'Outstanding — Delicious and perfectly prepared! ⭐',
};

const RIDER_RATING_LABELS = {
  1: 'Poor — Very late or careless delivery',
  2: 'Fair — Arrived with delays or issues',
  3: 'Good — Standard safe delivery',
  4: 'Fast & Friendly — Timely courier service',
  5: 'Exceptional — Super fast, polite, and handled with care! 🚀',
};

const SAMPLE_FOOD_PHOTOS = [
  {
    name: 'Artisan Pizza',
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Truffle Pasta',
    url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=700&auto=format&fit=crop&q=80',
  },
  {
    name: 'Gourmet Burger',
    url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&auto=format&fit=crop&q=80',
  },
];

// Interactive Star Rating Component
const StarRatingInput = ({ value, onChange, label, descriptorMap }) => {
  const [hoverRating, setHoverRating] = useState(0);
  const activeRating = hoverRating || value;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">{label}</span>
        <span className="text-[11px] font-semibold text-amber-600">
          {activeRating > 0 ? `${activeRating} / 5 Stars` : 'Tap to rate'}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1.5 rounded-lg transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label={`${star} star`}
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= activeRating
                  ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                  : 'text-slate-300 hover:text-amber-200'
              }`}
            />
          </button>
        ))}
      </div>

      {activeRating > 0 && descriptorMap && descriptorMap[activeRating] && (
        <p className="text-[11px] text-slate-500 italic mt-0.5">
          {descriptorMap[activeRating]}
        </p>
      )}
    </div>
  );
};

// Static Star Display Component
const StarRatingDisplay = ({ rating }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating
              ? 'fill-amber-400 text-amber-400'
              : 'text-slate-200'
          }`}
        />
      ))}
      <span className="text-xs font-bold text-slate-700 ml-1.5">{rating}/5</span>
    </div>
  );
};

export const OrderReviewSection = ({ order, onReviewSubmitted, isCustomer = true }) => {
  const [foodRating, setFoodRating] = useState(5);
  const [foodComment, setFoodComment] = useState('');
  const [riderRating, setRiderRating] = useState(5);
  const [riderComment, setRiderComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Only applicable when status is DELIVERED
  if (!order || order.status !== 'DELIVERED') {
    return null;
  }

  // Handle local image file upload & convert to Base64
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Selected image is too large. Max size is 5MB.');
      return;
    }

    setError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result);
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      setImageUrl(customUrl.trim());
      setShowUrlInput(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!foodRating || foodRating < 1 || foodRating > 5) {
      setError('Please provide a food rating between 1 and 5 stars');
      return;
    }

    if (!riderRating || riderRating < 1 || riderRating > 5) {
      setError('Please provide a rider rating between 1 and 5 stars');
      return;
    }

    setSubmitting(true);
    try {
      const orderId = order._id || order.id;
      const res = await orderService.submitReview(orderId, {
        foodRating,
        foodComment,
        riderRating,
        riderComment,
        imageUrl,
      });

      setSuccessMsg('Thank you! Your feedback has been published.');
      if (onReviewSubmitted) {
        onReviewSubmitted(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // If order is already reviewed, display the completed review card
  if (order.review && order.review.foodRating) {
    const review = order.review;

    return (
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Your Review & Ratings
              </h2>
              <p className="text-xs text-slate-400">
                Submitted on {formatDate(review.createdAt || order.updatedAt)}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Customer Feedback
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Food Review Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50/60 to-amber-50/30 border border-orange-100/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
                  Food & Restaurant
                </span>
              </div>
              <StarRatingDisplay rating={review.foodRating} />
            </div>

            <p className="text-xs text-slate-700 leading-relaxed italic bg-white/70 p-3 rounded-xl border border-orange-100/50">
              "{review.foodComment || 'No additional written comment provided.'}"
            </p>
          </div>

          {/* Rider Review Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 to-indigo-50/30 border border-blue-100/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Delivery Courier
                </span>
              </div>
              <StarRatingDisplay rating={review.riderRating} />
            </div>

            <p className="text-xs text-slate-700 leading-relaxed italic bg-white/70 p-3 rounded-xl border border-blue-100/50">
              "{review.riderComment || 'No additional written comment provided.'}"
            </p>
          </div>
        </div>

        {/* Optional Picture Display */}
        {review.imageUrl && (
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-600 block mb-2 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-slate-500" />
              Customer Photo of Delivered Meal
            </span>
            <div className="relative inline-block overflow-hidden rounded-2xl border border-slate-200 shadow-sm group">
              <img
                src={review.imageUrl}
                alt="Delivered food"
                className="max-h-64 object-cover rounded-2xl transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // If not reviewed yet and current user is not a customer
  if (!isCustomer) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center text-xs text-slate-500">
        This order has been delivered and is awaiting customer review.
      </div>
    );
  }

  // Interactive Review Form
  return (
    <div className="bg-white rounded-3xl border border-orange-200/80 shadow-md shadow-orange-500/5 p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700">
              Order Delivered!
            </span>
            <span className="text-xs font-bold text-slate-400">Share Your Experience</span>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mt-1">
            How was your meal & delivery?
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your honest ratings help {order.restaurantName || 'the restaurant'} and our courier improve!
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Sparkles className="w-6 h-6 animate-pulse" />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Two-Column Ratings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Food & Restaurant Review */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 text-orange-600">
              <Utensils className="w-4 h-4" />
              <h3 className="text-sm font-black text-slate-800">1. Rate Food & Restaurant</h3>
            </div>

            <StarRatingInput
              value={foodRating}
              onChange={setFoodRating}
              label="Food Quality & Taste"
              descriptorMap={FOOD_RATING_LABELS}
            />

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">
                Food Comments (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="How was the taste, temperature, packaging, and portion size?"
                value={foodComment}
                onChange={(e) => setFoodComment(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Section 2: Delivery Courier Review */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Truck className="w-4 h-4" />
              <h3 className="text-sm font-black text-slate-800">2. Rate Delivery Courier</h3>
            </div>

            <StarRatingInput
              value={riderRating}
              onChange={setRiderRating}
              label="Courier Speed & Courtesy"
              descriptorMap={RIDER_RATING_LABELS}
            />

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">
                Rider Comments (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Was the courier on time, friendly, and respectful with your order?"
                value={riderComment}
                onChange={(e) => setRiderComment(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-200 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Optional Food Picture */}
        <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-700">
              <Camera className="w-4 h-4" />
              <h3 className="text-sm font-black text-slate-800">
                3. Add a Photo of the Delivered Meal <span className="text-slate-400 font-normal">(Optional)</span>
              </h3>
            </div>

            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-bold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Photo
              </button>
            )}
          </div>

          {imageUrl ? (
            /* Selected Photo Preview */
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white p-3 rounded-xl border border-amber-200 shadow-sm">
              <img
                src={imageUrl}
                alt="Selected preview"
                className="w-24 h-24 object-cover rounded-xl border border-slate-100"
              />
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-800 block">Photo attached!</span>
                <p className="text-slate-400 text-[11px]">
                  This picture will be displayed alongside your review.
                </p>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-xs font-semibold text-rose-600 hover:underline inline-block mt-1"
                >
                  Change or remove picture
                </button>
              </div>
            </div>
          ) : (
            /* Upload Options & Quick Presets */
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-orange-500 hover:bg-orange-50/30 text-xs font-bold text-slate-700 transition-colors shadow-sm">
                  <Upload className="w-4 h-4 text-orange-500" />
                  <span>Upload from Computer / Phone</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Enter Image URL</span>
                </button>
              </div>

              {/* URL Input dropdown */}
              {showUrlInput && (
                <div className="flex items-center gap-2 pt-1 max-w-lg">
                  <input
                    type="url"
                    placeholder="https://example.com/meal-photo.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1 text-xs rounded-xl border border-slate-200 p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCustomUrl}
                    className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
                  >
                    Apply
                  </button>
                </div>
              )}

              {/* Quick Sample Photos */}
              <div className="pt-2 border-t border-amber-100 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400">Quick sample photo:</span>
                {SAMPLE_FOOD_PHOTOS.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => setImageUrl(sample.url)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-600 hover:border-orange-400 hover:text-orange-600 transition-colors"
                  >
                    + {sample.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-black shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-95 transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Publishing Review...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Submit Review & Ratings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
