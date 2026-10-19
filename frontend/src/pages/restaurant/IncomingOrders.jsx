import React, { useState } from 'react';
import { restaurantService } from '../../services/restaurant.service';
import { orderService } from '../../services/order.service';
import { useFetch } from '../../hooks/useFetch';
import { Panel } from '../../components/common/Panel';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataState } from '../../components/common/DataState';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  ChefHat,
  CheckCircle,
  Clock,
  MapPin,
  RefreshCw,
  PackageCheck,
  XCircle,
  Truck,
  AlertCircle,
} from 'lucide-react';

export const IncomingOrders = () => {
  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState('');

  // 1. Fetch Owner's Restaurant
  const { data: restaurant, loading: loadingRest, error: errorRest } = useFetch((signal) =>
    restaurantService.getMyRestaurant(signal)
  );

  const restaurantId = restaurant ? restaurant._id || restaurant.id : null;

  // 2. Fetch Restaurant Orders
  const {
    data: orders,
    loading: loadingOrders,
    error: errorOrders,
    refetch: refetchOrders,
  } = useFetch(
    (signal) => (restaurantId ? orderService.getRestaurantOrders(restaurantId, signal) : Promise.resolve([])),
    [restaurantId]
  );

  const handleUpdateStatus = async (orderId, newStatus, reason = '') => {
    setActionError('');
    setUpdatingId(orderId);
    try {
      await orderService.updateOrderStatus(orderId, newStatus, reason);
      refetchOrders();
    } catch (err) {
      setActionError(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const loading = loadingRest || loadingOrders;
  const error = errorRest || errorOrders;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Incoming Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accept orders, notify chefs, and dispatch food packages to delivery couriers
          </p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={refetchOrders}>
          Refresh Queue
        </Button>
      </div>

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{actionError}</span>
        </div>
      )}

      <DataState
        loading={loading}
        error={error}
        empty={!orders || orders.length === 0}
        emptyMessage="No incoming orders at the moment"
        emptySubtext="When hungry customers place orders at your restaurant, they will appear here in real time."
        onRetry={refetchOrders}
      >
        {() => (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderId = order._id || order.id;
              const isUpdating = updatingId === orderId;

              return (
                <div
                  key={orderId}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-black text-slate-900">
                          Order #{orderId.slice(-6).toUpperCase()}
                        </span>
                        <StatusBadge status={order.status} size="md" />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Placed on {formatDate(order.createdAt)}</span>
                        <span>• Customer: <strong className="text-slate-700">{order.customerName || 'Customer'}</strong></span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400">Total Order Value</span>
                      <div className="text-lg font-black text-slate-900">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </div>
                  </div>

                  {/* Items and Address Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-4">
                    {/* Items */}
                    <div className="md:col-span-7 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Items Ordered
                      </p>
                      <div className="space-y-1.5 text-xs text-slate-700">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span>
                              <strong className="text-orange-600">{item.quantity}x</strong>{' '}
                              {item.itemName}
                            </span>
                            <span className="text-slate-500 font-semibold">
                              {formatCurrency(item.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.orderNotes && (
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-100 text-xs mt-2">
                          <strong>Note:</strong> {order.orderNotes}
                        </div>
                      )}
                    </div>

                    {/* Delivery Destination */}
                    <div className="md:col-span-5 space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 text-xs text-slate-600">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Delivery Destination
                      </p>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-slate-800">
                            {order.deliveryAddress?.addressName || 'Address'}
                          </p>
                          <p>{order.deliveryAddress?.addressLines}</p>
                          <p>
                            {order.deliveryAddress?.city}, {order.deliveryAddress?.postalCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Controls for Restaurant Owner */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-slate-400">
                      {order.status === 'READY_FOR_PICKUP' && (
                        <span className="text-teal-600 font-bold flex items-center gap-1.5">
                          <PackageCheck className="w-4 h-4" />
                          <span>Delivery record dispatched! Waiting for rider to accept.</span>
                        </span>
                      )}
                      {['PICKED_UP', 'ON_THE_WAY'].includes(order.status) && (
                        <span className="text-indigo-600 font-bold flex items-center gap-1.5">
                          <Truck className="w-4 h-4" />
                          <span>Rider is currently delivering this order.</span>
                        </span>
                      )}
                      {order.status === 'DELIVERED' && (
                        <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" />
                          <span>Order delivered to customer successfully.</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'PENDING' && (
                        <>
                          <Button
                            variant="danger"
                            size="sm"
                            loading={isUpdating}
                            onClick={() => handleUpdateStatus(orderId, 'CANCELLED', 'Restaurant cannot fulfill order')}
                          >
                            Decline
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            loading={isUpdating}
                            icon={CheckCircle}
                            onClick={() => handleUpdateStatus(orderId, 'CONFIRMED')}
                          >
                            Confirm Order
                          </Button>
                        </>
                      )}

                      {order.status === 'CONFIRMED' && (
                        <Button
                          variant="primary"
                          size="sm"
                          loading={isUpdating}
                          icon={ChefHat}
                          onClick={() => handleUpdateStatus(orderId, 'PREPARING')}
                        >
                          Start Cooking (Preparing)
                        </Button>
                      )}

                      {order.status === 'PREPARING' && (
                        <Button
                          variant="success"
                          size="sm"
                          loading={isUpdating}
                          icon={PackageCheck}
                          onClick={() => handleUpdateStatus(orderId, 'READY_FOR_PICKUP')}
                        >
                          Ready for Courier Pickup
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DataState>
    </div>
  );
};
