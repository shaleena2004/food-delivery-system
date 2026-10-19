import React, { useState } from 'react';
import { restaurantService } from '../../services/restaurant.service';
import { useFetch } from '../../hooks/useFetch';
import { useForm } from '../../hooks/useForm';
import { validators } from '../../utils/validators';
import { Panel } from '../../components/common/Panel';
import { Button } from '../../components/common/Button';
import { FormField } from '../../components/common/FormField';
import { Modal } from '../../components/common/Modal';
import { DataState } from '../../components/common/DataState';
import { formatCurrency } from '../../utils/formatters';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Image,
  DollarSign,
  Tag,
  AlertCircle,
} from 'lucide-react';

const CATEGORIES = ['Starters', 'Mains', 'Desserts', 'Beverages', 'Sides'];

export const MenuManagement = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // 1. Fetch Owner's Restaurant
  const { data: restaurant, loading: loadingRest, error: errorRest } = useFetch((signal) =>
    restaurantService.getMyRestaurant(signal)
  );

  const restaurantId = restaurant ? restaurant._id || restaurant.id : null;

  // 2. Fetch Menu Items
  const {
    data: menuItems,
    loading: loadingMenu,
    error: errorMenu,
    refetch: refetchMenu,
  } = useFetch(
    (signal) => (restaurantId ? restaurantService.getMenu(restaurantId, signal) : Promise.resolve([])),
    [restaurantId]
  );

  const form = useForm(
    {
      name: '',
      description: '',
      category: 'Mains',
      price: '',
      imageUrl: '',
      isAvailable: true,
    },
    {
      name: (v) => validators.required(v, 'Dish name'),
      category: (v) => validators.required(v, 'Category'),
      price: (v) => validators.positiveNumber(v, 'Price'),
    }
  );

  const handleOpenAdd = () => {
    setEditingItemId(null);
    form.resetForm();
    form.setFieldValue('isAvailable', true);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItemId(item._id || item.id);
    form.setValues({
      name: item.name,
      description: item.description || '',
      category: item.category || 'Mains',
      price: item.price,
      imageUrl: item.imageUrl || '',
      isAvailable: Boolean(item.isAvailable),
    });
    setModalOpen(true);
  };

  const onSubmit = async (values) => {
    if (editingItemId) {
      await restaurantService.updateMenuItem(editingItemId, values);
    } else {
      await restaurantService.addMenuItem(restaurantId, values);
    }
    setModalOpen(false);
    refetchMenu();
  };

  const handleToggleAvailability = async (item) => {
    const itemId = item._id || item.id;
    await restaurantService.updateMenuItem(itemId, { isAvailable: !item.isAvailable });
    refetchMenu();
  };

  const handleDelete = async (item) => {
    const itemId = item._id || item.id;
    if (window.confirm(`Delete '${item.name}' from your menu?`)) {
      await restaurantService.deleteMenuItem(itemId);
      refetchMenu();
    }
  };

  const loading = loadingRest || loadingMenu;
  const error = errorRest || errorMenu;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Menu Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, update dishes, modify prices, and toggle live availability
          </p>
        </div>

        {restaurantId && (
          <Button variant="primary" size="md" icon={Plus} onClick={handleOpenAdd}>
            Add New Dish
          </Button>
        )}
      </div>

      <DataState
        loading={loading}
        error={error}
        empty={!restaurantId}
        emptyMessage="No restaurant found"
        emptySubtext="Please set up your restaurant profile first."
        onRetry={refetchMenu}
      >
        {() => (
          <Panel
            title="Menu Items"
            subtitle={`${menuItems?.length || 0} items configured`}
            badge={<UtensilsCrossed className="w-4 h-4 text-orange-500" />}
          >
            {!menuItems || menuItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-sm font-semibold text-slate-700">Your menu is currently empty</p>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Add signature appetizers, entrees, desserts, or drinks.
                </p>
                <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenAdd}>
                  Add Your First Dish
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {menuItems.map((item) => {
                  const itemId = item._id || item.id;

                  return (
                    <div
                      key={itemId}
                      className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800 truncate">
                              {item.name}
                            </h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                              {item.category}
                            </span>
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-1 font-black text-sm text-orange-600">
                            {formatCurrency(item.price)}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            item.isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {item.isAvailable ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Available</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-slate-400" />
                              <span>Sold Out</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          title="Edit Dish"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        )}
      </DataState>

      {/* Add / Edit Dish Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItemId ? 'Edit Menu Dish' : 'Add New Menu Dish'}
        subtitle="Configure dish details, category, pricing and photo"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={form.isSubmitting}
              onClick={form.handleSubmit(onSubmit)}
            >
              {editingItemId ? 'Save Changes' : 'Add to Menu'}
            </Button>
          </>
        }
      >
        <form className="space-y-3.5">
          <FormField
            label="Dish Name"
            name="name"
            placeholder="e.g. Truffle Tagliatelle Pasta"
            value={form.values.name}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            error={form.errors.name}
            touched={form.touched.name}
            required
            icon={UtensilsCrossed}
          />

          <div className="grid grid-cols-2 gap-3">
            <FormField
              label="Category"
              name="category"
              as="select"
              value={form.values.category}
              onChange={form.handleChange}
              options={CATEGORIES}
              required
              icon={Tag}
            />

            <FormField
              label="Price ($ USD)"
              name="price"
              type="number"
              step="0.01"
              placeholder="14.99"
              value={form.values.price}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              error={form.errors.price}
              touched={form.touched.price}
              required
              icon={DollarSign}
            />
          </div>

          <FormField
            label="Dish Description"
            name="description"
            as="textarea"
            rows={2}
            placeholder="Describe ingredients, cooking method, flavors..."
            value={form.values.description}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
          />

          <FormField
            label="Image URL"
            name="imageUrl"
            placeholder="https://images.unsplash.com/..."
            value={form.values.imageUrl}
            onChange={form.handleChange}
            icon={Image}
          />

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-2">
            <input
              type="checkbox"
              name="isAvailable"
              checked={form.values.isAvailable}
              onChange={form.handleChange}
              className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-slate-300"
            />
            <span>Dish is available for ordering immediately</span>
          </label>
        </form>
      </Modal>
    </div>
  );
};
