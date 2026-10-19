import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'biteflow_cart_v1';
const DELIVERY_FEE = 3.99;

export const CartProvider = ({ children }) => {
  // cart state: { restaurant: { id, name }, items: [] }
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : { restaurant: null, items: [] };
    } catch {
      return { restaurant: null, items: [] };
    }
  });

  // State to hold pending item when restaurant conflict occurs
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    newItem: null,
    newRestaurant: null,
  });

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart]);

  // Subtotal & Totals calculations
  const subtotal = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }, [cart.items]);

  const deliveryFee = cart.items.length > 0 ? DELIVERY_FEE : 0;
  const total = Number((subtotal + deliveryFee).toFixed(2));
  const totalItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  const addItem = useCallback((item, restaurant) => {
    const restaurantId = restaurant.id || restaurant._id;

    // Check if cart already has items from a different restaurant
    if (cart.restaurant && cart.restaurant.id !== restaurantId && cart.items.length > 0) {
      setConflictModal({
        isOpen: true,
        newItem: item,
        newRestaurant: { id: restaurantId, name: restaurant.name },
      });
      return false;
    }

    setCart((prev) => {
      const itemId = item._id || item.id;
      const existingIndex = prev.items.findIndex(
        (i) => (i._id || i.id || i.menuItemId) === itemId
      );

      let newItems;
      if (existingIndex > -1) {
        newItems = [...prev.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1,
        };
      } else {
        newItems = [
          ...prev.items,
          {
            menuItemId: itemId,
            id: itemId,
            name: item.name,
            price: Number(item.price),
            imageUrl: item.imageUrl,
            category: item.category,
            quantity: 1,
          },
        ];
      }

      return {
        restaurant: { id: restaurantId, name: restaurant.name },
        items: newItems,
      };
    });

    return true;
  }, [cart]);

  const confirmReplaceCart = useCallback(() => {
    if (!conflictModal.newItem || !conflictModal.newRestaurant) return;

    const item = conflictModal.newItem;
    const itemId = item._id || item.id;

    setCart({
      restaurant: conflictModal.newRestaurant,
      items: [
        {
          menuItemId: itemId,
          id: itemId,
          name: item.name,
          price: Number(item.price),
          imageUrl: item.imageUrl,
          category: item.category,
          quantity: 1,
        },
      ],
    });

    setConflictModal({ isOpen: false, newItem: null, newRestaurant: null });
  }, [conflictModal]);

  const cancelReplaceCart = useCallback(() => {
    setConflictModal({ isOpen: false, newItem: null, newRestaurant: null });
  }, []);

  const updateQuantity = useCallback((itemId, newQuantity) => {
    setCart((prev) => {
      if (newQuantity <= 0) {
        const remaining = prev.items.filter(
          (i) => (i._id || i.id || i.menuItemId) !== itemId
        );
        return {
          restaurant: remaining.length === 0 ? null : prev.restaurant,
          items: remaining,
        };
      }

      const updated = prev.items.map((i) => {
        if ((i._id || i.id || i.menuItemId) === itemId) {
          return { ...i, quantity: newQuantity };
        }
        return i;
      });

      return { ...prev, items: updated };
    });
  }, []);

  const removeItem = useCallback((itemId) => {
    updateQuantity(itemId, 0);
  }, [updateQuantity]);

  const clearCart = useCallback(() => {
    setCart({ restaurant: null, items: [] });
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch {}
  }, []);

  const value = {
    cart,
    restaurant: cart.restaurant,
    items: cart.items,
    subtotal: Number(subtotal.toFixed(2)),
    deliveryFee,
    total,
    totalItemCount,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    conflictModal,
    confirmReplaceCart,
    cancelReplaceCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
