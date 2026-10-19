import React, { useState } from 'react';
import { deliveryService } from '../../services/delivery.service';
import { useFetch } from '../../hooks/useFetch';
import { Panel } from '../../components/common/Panel';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataState } from '../../components/common/DataState';
import { formatDate } from '../../utils/formatters';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  Navigation,
  RefreshCw,
  AlertCircle,
  Store,
  Home,
  CheckCircle2,
} from 'lucide-react';

export const MyDeliveries = () => {
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'my-deliveries'
  const [updatingId, setUpdatingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Available Deliveries (Pending pickup, unassigned)
  const {
    data: availableDeliveries,
    loading: loadingAvailable,
    error: errorAvailable,
    refetch: refetchAvailable,
  } = useFetch((signal) => deliveryService.getAvailableDeliveries(signal));

  // 2. Rider's Own Deliveries
  const {
    data: myDeliveries,
    loading: loadingMy,
    error: errorMy,
    refetch: refetchMy,
  } = useFetch((signal) => deliveryService.getMyDeliveries(signal));

  const handleAcceptDelivery = async (deliveryId) => {
    setErrorMessage('');
    setUpdatingId(deliveryId);
    try {
      await deliveryService.acceptDelivery(deliveryId);
      refetchAvailable();
      refetchMy();
      setActiveTab('my-deliveries'); // Switch to active tab to see accepted delivery
    } catch (err) {
      setErrorMessage(err.message || 'Failed to accept delivery');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateStatus = async (deliveryId, newStatus, notes = '') => {
    setErrorMessage('');
    setUpdatingId(deliveryId);
    try {
      await deliveryService.updateDeliveryStatus(deliveryId, newStatus, notes);
      refetchMy();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update delivery progress');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefreshAll = () => {
    refetchAvailable();
    refetchMy();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Delivery Rider Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accept food delivery requests and track your delivery route in real time
          </p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={handleRefreshAll}>
          Refresh Feeds
        </Button>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('available')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'available'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Available Orders</span>
          {availableDeliveries?.length > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
              {availableDeliveries.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my-deliveries')}
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'my-deliveries'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>My Deliveries</span>
          {myDeliveries?.length > 0 && (
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {myDeliveries.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Available Deliveries */}
      {activeTab === 'available' && (
        <DataState
          loading={loadingAvailable}
          error={errorAvailable}
          empty={!availableDeliveries || availableDeliveries.length === 0}
          emptyMessage="No available delivery requests right now"
          emptySubtext="Orders will appear here as soon as restaurant kitchens mark them ready for pickup."
          onRetry={refetchAvailable}
        >
          {() => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableDeliveries.map((delivery) => {
                const deliveryId = delivery._id || delivery.id;
                const isAccepting = updatingId === deliveryId;

                return (
                  <div
                    key={deliveryId}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="text-xs font-black uppercase tracking-wider text-orange-600">
                          Order #{delivery.orderId.slice(-6).toUpperCase()}
                        </span>
                        <StatusBadge status={delivery.status} size="sm" />
                      </div>

                      <div className="mt-4 space-y-3.5 text-xs text-slate-600">
                        {/* Pickup Address */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Store className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              Pick Up From
                            </span>
                            <strong className="text-slate-800 text-sm block">
                              {delivery.restaurantName || 'Restaurant'}
                            </strong>
                            <span>{delivery.pickupAddress}</span>
                          </div>
                        </div>

                        {/* Drop-off Address */}
                        <div className="flex items-start gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                            <Home className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              Deliver To
                            </span>
                            <strong className="text-slate-800 block">
                              {delivery.deliveryAddress?.addressName || 'Customer'}
                            </strong>
                            <span>
                              {delivery.deliveryAddress?.addressLines}, {delivery.deliveryAddress?.city}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Ready for pickup: {formatDate(delivery.createdAt)}
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        loading={isAccepting}
                        icon={CheckCircle}
                        onClick={() => handleAcceptDelivery(deliveryId)}
                      >
                        Accept Delivery
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DataState>
      )}

      {/* Tab 2: My Deliveries */}
      {activeTab === 'my-deliveries' && (
        <DataState
          loading={loadingMy}
          error={errorMy}
          empty={!myDeliveries || myDeliveries.length === 0}
          emptyMessage="No assigned deliveries"
          emptySubtext="You haven't accepted any deliveries yet. Check the Available Orders tab!"
          onRetry={refetchMy}
        >
          {() => (
            <div className="space-y-4">
              {myDeliveries.map((delivery) => {
                const deliveryId = delivery._id || delivery.id;
                const isUpdating = updatingId === deliveryId;

                return (
                  <div
                    key={deliveryId}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-black text-slate-900">
                            Delivery #{deliveryId.slice(-6).toUpperCase()}
                          </span>
                          <StatusBadge status={delivery.status} size="md" />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Assigned: {formatDate(delivery.assignedTime || delivery.updatedAt)}
                        </p>
                      </div>

                      <div className="text-xs text-slate-500">
                        Target: <strong className="text-slate-800">{delivery.restaurantName}</strong>
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-xs text-slate-600">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="font-bold text-slate-700 block mb-1">Pickup Address:</span>
                        <p>{delivery.pickupAddress}</p>
                      </div>

                      <div className="p-3 rounded-xl bg-orange-50/40 border border-orange-100">
                        <span className="font-bold text-orange-950 block mb-1">Customer Delivery Address:</span>
                        <p className="font-semibold text-slate-800">
                          {delivery.deliveryAddress?.addressLines}
                        </p>
                        <p className="text-slate-500">
                          {delivery.deliveryAddress?.city}, {delivery.deliveryAddress?.postalCode}
                        </p>
                      </div>
                    </div>

                    {/* Progress Action Controls */}
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-slate-500">
                        {delivery.pickupTime && (
                          <span className="mr-3">Picked up: {formatDate(delivery.pickupTime)}</span>
                        )}
                        {delivery.deliveredTime && (
                          <span className="text-emerald-600 font-bold">
                            Delivered: {formatDate(delivery.deliveredTime)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {['ASSIGNED', 'PICKUP_PENDING'].includes(delivery.status) && (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={isUpdating}
                            icon={Package}
                            onClick={() => handleUpdateStatus(deliveryId, 'PICKED_UP', 'Courier picked up package')}
                          >
                            Mark Picked Up from Kitchen
                          </Button>
                        )}

                        {delivery.status === 'PICKED_UP' && (
                          <Button
                            variant="primary"
                            size="sm"
                            loading={isUpdating}
                            icon={Navigation}
                            onClick={() => handleUpdateStatus(deliveryId, 'ON_THE_WAY', 'Rider is driving to destination')}
                          >
                            Start Journey (On The Way)
                          </Button>
                        )}

                        {delivery.status === 'ON_THE_WAY' && (
                          <>
                            <Button
                              variant="danger"
                              size="sm"
                              loading={isUpdating}
                              onClick={() => handleUpdateStatus(deliveryId, 'FAILED', 'Customer unreachable')}
                            >
                              Report Failed
                            </Button>
                            <Button
                              variant="success"
                              size="sm"
                              loading={isUpdating}
                              icon={CheckCircle2}
                              onClick={() => handleUpdateStatus(deliveryId, 'DELIVERED', 'Delivered at customer door')}
                            >
                              Mark Delivered
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DataState>
      )}
    </div>
  );
};
