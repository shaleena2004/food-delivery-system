import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './routes/ProtectedRoute';

// Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Restaurants } from './pages/customer/Restaurants';
import { RestaurantDetail } from './pages/customer/RestaurantDetail';
import { Cart } from './pages/customer/Cart';
import { MyOrders } from './pages/customer/MyOrders';
import { OrderDetail } from './pages/customer/OrderDetail';
import { Profile } from './pages/customer/Profile';
import { MyRestaurant } from './pages/restaurant/MyRestaurant';
import { MenuManagement } from './pages/restaurant/MenuManagement';
import { IncomingOrders } from './pages/restaurant/IncomingOrders';
import { MyDeliveries } from './pages/delivery/MyDeliveries';
import { UserManagement } from './pages/admin/UserManagement';
import { NotFound } from './pages/NotFound';

export const App = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
          <Routes>
            <Route path="/" element={<AppShell />}>
              {/* Home redirect */}
              <Route index element={<Navigate to="/restaurants" replace />} />

              {/* Public & Customer Routes */}
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="restaurants" element={<Restaurants />} />
              <Route path="restaurants/:id" element={<RestaurantDetail />} />
              <Route path="cart" element={<Cart />} />

              {/* Customer Protected Routes */}
              <Route
                path="orders"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                    <MyOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders/:id"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'RESTAURANT_ADMIN', 'DELIVERY_PERSON', 'ADMIN']}>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Restaurant Owner Protected Routes */}
              <Route
                path="my-restaurant"
                element={
                  <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN', 'ADMIN']}>
                    <MyRestaurant />
                  </ProtectedRoute>
                }
              />
              <Route
                path="menu"
                element={
                  <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN', 'ADMIN']}>
                    <MenuManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="incoming-orders"
                element={
                  <ProtectedRoute allowedRoles={['RESTAURANT_ADMIN', 'ADMIN']}>
                    <IncomingOrders />
                  </ProtectedRoute>
                }
              />

              {/* Delivery Person Protected Routes */}
              <Route
                path="my-deliveries"
                element={
                  <ProtectedRoute allowedRoles={['DELIVERY_PERSON', 'ADMIN']}>
                    <MyDeliveries />
                  </ProtectedRoute>
                }
              />

              {/* Admin Management (Bonus) */}
              <Route
                path="admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
