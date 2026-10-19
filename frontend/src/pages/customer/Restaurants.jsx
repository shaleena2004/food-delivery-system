import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { restaurantService } from '../../services/restaurant.service';
import { useFetch } from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { DataState } from '../../components/common/DataState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { RestaurantEditModal } from '../../components/restaurant/RestaurantEditModal';
import { RestaurantDeleteModal } from '../../components/restaurant/RestaurantDeleteModal';
import {
  Search,
  Star,
  Clock,
  MapPin,
  UtensilsCrossed,
  ArrowRight,
  Sparkles,
  Edit,
  Trash2,
  Plus,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

const CUISINES = ['All', 'Italian', 'Burgers & Fast Food', 'Asian & Sushi', 'Desserts & Cafe'];

export const Restaurants = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Restaurant Owners manage their own storefront and should not see the customer all-restaurants catalog
  if (user && user.role === 'RESTAURANT_ADMIN') {
    return <Navigate to="/my-restaurant" replace />;
  }

  const isAdmin = user && user.role === 'ADMIN';
  const isRestaurantOwner = user && user.role === 'RESTAURANT_ADMIN';
  const canAddRestaurant = isAdmin || isRestaurantOwner;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  // Modals state for admin
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const { data: restaurants, loading, error, refetch } = useFetch(
    (signal) =>
      restaurantService.getRestaurants(
        { search: searchTerm, cuisine: selectedCuisine },
        signal
      ),
    [searchTerm, selectedCuisine]
  );

  const handleEdit = (e, restaurant) => {
    e.stopPropagation();
    setSelectedRestaurant(restaurant);
    setEditModalOpen(true);
  };

  const handleDelete = (e, restaurant) => {
    e.stopPropagation();
    setSelectedRestaurant(restaurant);
    setDeleteModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedRestaurant(null);
    setEditModalOpen(true);
  };

  const handleSaveRestaurant = async (formData, id) => {
    if (id) {
      await restaurantService.updateRestaurant(id, formData);
      setToastMsg(`Restaurant "${formData.name}" updated successfully!`);
    } else {
      await restaurantService.createRestaurant(formData);
      setToastMsg(`Restaurant "${formData.name}" added successfully!`);
    }
    setTimeout(() => setToastMsg(''), 4000);
    refetch();
  };

  const handleConfirmDelete = async (id) => {
    await restaurantService.deleteRestaurant(id);
    setToastMsg('Restaurant removed successfully!');
    setTimeout(() => setToastMsg(''), 4000);
    refetch();
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 p-4 bg-emerald-600 text-white rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-bounce">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white p-8 sm:p-12 shadow-xl shadow-orange-500/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold text-white tracking-wide">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fast, Hot & Fresh Food Delivered To Your Door</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Craving something delicious?
          </h1>
          <p className="text-orange-50 text-sm sm:text-base max-w-lg leading-relaxed">
            Explore local chefs, artisan pizza joints, sizzling burgers, and authentic sushi rolls.
          </p>
        </div>

        {/* Search Bar Floating Overlay */}
        <div className="relative z-10 mt-6 max-w-lg">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by restaurant name, cuisine, or food..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white text-slate-800 rounded-2xl shadow-lg border-0 text-sm focus:outline-none focus:ring-4 focus:ring-orange-300 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* Cuisine Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CUISINES.map((cuisine) => (
          <button
            key={cuisine}
            type="button"
            onClick={() => setSelectedCuisine(cuisine)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCuisine === cuisine
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cuisine}
          </button>
        ))}
      </div>

      {/* Restaurant Cards Grid with DataState */}
      <DataState
        loading={loading}
        error={error}
        empty={!restaurants || restaurants.length === 0}
        emptyMessage="No restaurants match your search"
        emptySubtext="Try clearing your search keyword or selecting a different cuisine filter."
        onRetry={refetch}
        emptyAction={
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedCuisine('All');
            }}
          >
            Clear Filters
          </Button>
        }
      >
        {() => (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-black text-slate-800">
                  {selectedCuisine === 'All' ? 'Available Restaurants' : `${selectedCuisine} Restaurants`}
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  Showing {restaurants.length} places
                </span>
              </div>

              {/* Restaurant Actions Bar for Admin & Restaurant Owners */}
              {canAddRestaurant && (
                <div className="flex items-center gap-2.5">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                      Admin Controls
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-orange-50 text-orange-700 border border-orange-200">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" />
                      Owner Portal
                    </span>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={handleAddNew}
                  >
                    {isRestaurantOwner ? 'Add Restaurant to Catalog' : 'Add Restaurant'}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => {
                const restId = restaurant._id || restaurant.id;
                const isOwnerOfThis =
                  isRestaurantOwner &&
                  (restaurant.ownerId === user?.id ||
                    restaurant.ownerId === user?.userId ||
                    restaurant.email === user?.email);
                const canEditThis = isAdmin || isOwnerOfThis;

                return (
                  <Card
                    key={restId}
                    hover
                    onClick={() => navigate(`/restaurants/${restId}`)}
                    className="flex flex-col group cursor-pointer relative"
                  >
                    {/* Compound Card: Image Header */}
                    <div className="relative h-48 overflow-hidden bg-slate-100">
                      <img
                        src={restaurant.imageUrl}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Top-Right: Status Badge */}
                      <div className="absolute top-3 right-3 z-10">
                        <StatusBadge status={restaurant.status} size="sm" />
                      </div>

                      {/* Top-Left: Admin / Owner Quick Actions */}
                      {canEditThis && (
                        <div
                          className="absolute top-3 left-3 z-20 flex items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={(e) => handleEdit(e, restaurant)}
                            className="px-2.5 py-1 rounded-lg bg-white/95 hover:bg-white text-slate-800 hover:text-orange-600 text-xs font-bold shadow-md backdrop-blur-xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
                            title="Edit Restaurant"
                          >
                            <Edit className="w-3.5 h-3.5 text-orange-600" />
                            <span>Edit</span>
                          </button>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => handleDelete(e, restaurant)}
                              className="px-2.5 py-1 rounded-lg bg-rose-600/95 hover:bg-rose-700 text-white text-xs font-bold shadow-md backdrop-blur-xs flex items-center gap-1 transition-all cursor-pointer hover:scale-105"
                              title="Remove Restaurant"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Bottom Info on Image */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                        <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md">
                          {restaurant.cuisineType}
                        </span>
                        <div className="flex items-center gap-1 text-xs font-bold bg-amber-500/90 backdrop-blur-md px-2 py-0.5 rounded-md">
                          <Star className="w-3.5 h-3.5 fill-white" />
                          <span>{restaurant.rating || '4.8'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Compound Card: Body */}
                    <Card.Body className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-black text-slate-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                          {restaurant.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {restaurant.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{restaurant.deliveryTimeEstimate || '25-35 min'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{restaurant.address}</span>
                        </div>
                      </div>
                    </Card.Body>

                    {/* Compound Card: Footer */}
                    <Card.Footer className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-orange-600">
                        {restaurant.openingTime} - {restaurant.closingTime}
                      </span>

                      <div className="flex items-center gap-2">
                        {canEditThis && (
                          <div
                            className="flex items-center gap-1.5 mr-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={(e) => handleEdit(e, restaurant)}
                              className="text-xs font-bold text-slate-600 hover:text-orange-600 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-orange-50 transition-colors"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={(e) => handleDelete(e, restaurant)}
                                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-rose-50 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-xs font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                          <span>View Menu</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Card.Footer>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </DataState>

      {/* Edit / Create Restaurant Modal */}
      <RestaurantEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        restaurant={selectedRestaurant}
        onSave={handleSaveRestaurant}
      />

      {/* Delete Restaurant Confirmation Modal */}
      <RestaurantDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        restaurant={selectedRestaurant}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
