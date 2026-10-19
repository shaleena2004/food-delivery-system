import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { useFetch } from '../../hooks/useFetch';
import { DataState } from '../../components/common/DataState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Panel } from '../../components/common/Panel';
import { Modal } from '../../components/common/Modal';
import { OrderReviewSection } from '../../components/order/OrderReviewSection';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RefreshCw,
  ChefHat,
  Package,
  Truck,
  Home,
  AlertTriangle,
  Receipt,
  Store,
} from 'lucide-react';

const TRACKER_STEPS = [
  { key: 'PENDING', label: 'Order Received', icon: Clock, desc: 'Awaiting restaurant confirmation' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle2, desc: 'Restaurant accepted your order' },
  { key: 'PREPARING', label: 'In the Kitchen', icon: ChefHat, desc: 'Chef is cooking your dishes' },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: Package, desc: 'Packed and waiting for rider' },
  { key: 'PICKED_UP', label: 'Rider Picked Up', icon: Truck, desc: 'Courier collected the food package' },
  { key: 'ON_THE_WAY', label: 'On The Way', icon: Truck, desc: 'Courier is speeding to your address' },
  { key: 'DELIVERED', label: 'Delivered', icon: Home, desc: 'Food delivered! Enjoy your meal!' },
];

export const OrderDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');

  const { data: order, loading, error, refetch } = useFetch(
    (signal) => orderService.getOrderById(id, signal),
    [id]
  );

  const isCustomer = !user || user.role === 'CUSTOMER' || user.id === order?.customerId;

  // Bonus requirement: Automatically refresh status every 10 seconds with proper cleanup!
  useEffect(() => {
    // Only auto-poll if order is not completed / cancelled
    if (order && (order.status === 'DELIVERED' || order.status === 'CANCELLED')) {
      return;
    }

    const intervalId = setInterval(() => {
      refetch();
    }, 10000); // 10 seconds

    return () => clearInterval(intervalId); // Cleanup timer when component unmounts
  }, [order, refetch]);

  const handleCancelOrder = async () => {
    setCancelError('');
    setCancelling(true);
    try {
      await orderService.cancelOrder(id, cancelReason || 'Cancelled by customer');
      setCancelModalOpen(false);
      refetch();
    } catch (err) {
      setCancelError(err.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  const getStepStatus = (stepKey, currentStatus) => {
    if (currentStatus === 'CANCELLED') return 'cancelled';
    const stepKeys = TRACKER_STEPS.map((s) => s.key);
    const currentIndex = stepKeys.indexOf(currentStatus);
    const stepIndex = stepKeys.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header & Back */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to order history</span>
        </Link>

        <div className="flex items-center gap-2">
          {order && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Tracker (Auto-refresh 10s)
            </span>
          )}
          <Button variant="outline" size="sm" onClick={refetch} icon={RefreshCw}>
            Refresh Status
          </Button>
          {order?.status === 'PENDING' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
              icon={XCircle}
            >
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      <DataState
        loading={loading}
        error={error}
        empty={!order}
        emptyMessage="Order not found"
        onRetry={refetch}
      >
        {() => (
          <>
            {/* Visual Status Tracker Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-orange-600">
                    Order Tracking #{(order._id || order.id).slice(-6).toUpperCase()}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight mt-1">
                    {order.restaurantName}
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
                </div>
                <StatusBadge status={order.status} size="lg" />
              </div>

              {/* Cancelled Banner if applicable */}
              {order.status === 'CANCELLED' ? (
                <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-4 text-rose-800">
                  <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-base text-rose-900">Order Was Cancelled</h3>
                    <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                      {order.cancellationReason || 'This order was cancelled.'}
                    </p>
                  </div>
                </div>
              ) : (
                /* Step-by-Step Visual Timeline */
                <div className="py-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                    {TRACKER_STEPS.map((step, idx) => {
                      const state = getStepStatus(step.key, order.status);
                      const StepIcon = step.icon;

                      return (
                        <div key={step.key} className="flex flex-col items-center text-center relative group">
                          {/* Circle Icon */}
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${state === 'completed'
                                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                : state === 'current'
                                  ? 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 scale-110 ring-4 ring-orange-100 animate-pulse'
                                  : 'bg-slate-100 text-slate-400 border border-slate-200'
                              }`}
                          >
                            <StepIcon className="w-5 h-5" />
                          </div>

                          {/* Label & Description */}
                          <div className="mt-3">
                            <span
                              className={`text-xs font-bold block ${state === 'current'
                                  ? 'text-orange-600'
                                  : state === 'completed'
                                    ? 'text-slate-800'
                                    : 'text-slate-400'
                                }`}
                            >
                              {step.label}
                            </span>
                            <span className="text-[10px] text-slate-400 hidden sm:block mt-0.5 line-clamp-2">
                              {step.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Auto-Refresh Timer Notice */}
                  <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Live tracker: automatically updates every 10 seconds</span>
                  </div>
                </div>
              )}
            </div>

            {/* Review Section - Enabled when food is DELIVERED */}
            {order.status === 'DELIVERED' && (
              <OrderReviewSection
                order={order}
                isCustomer={isCustomer}
                onReviewSubmitted={refetch}
              />
            )}

            {/* Order Details & Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Items List */}
              <div className="md:col-span-7">
                <Panel
                  title="Items in Order"
                  subtitle={`${order.items?.length || 0} items`}
                  badge={<Store className="w-4 h-4 text-orange-500" />}
                >
                  <div className="divide-y divide-slate-100 text-xs">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 font-bold flex items-center justify-center text-xs shrink-0">
                            {item.quantity}x
                          </span>
                          <div>
                            <span className="font-bold text-slate-800 text-sm block">
                              {item.itemName}
                            </span>
                            <span className="text-slate-400 text-xs">
                              {formatCurrency(item.unitPrice)} each
                            </span>
                          </div>
                        </div>

                        <span className="font-bold text-slate-800 text-sm">
                          {formatCurrency(item.totalPrice)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.orderNotes && (
                    <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
                      <strong>Special Instructions:</strong> {order.orderNotes}
                    </div>
                  )}
                </Panel>
              </div>

              {/* Delivery Address & Totals */}
              <div className="md:col-span-5 space-y-6">
                <Panel
                  title="Delivery Address"
                  badge={<MapPin className="w-4 h-4 text-orange-500" />}
                >
                  <div className="text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-slate-800 text-sm">
                      {order.deliveryAddress?.addressName || 'Customer Address'}
                    </p>
                    <p>{order.deliveryAddress?.addressLines}</p>
                    <p>
                      {order.deliveryAddress?.city}, {order.deliveryAddress?.postalCode}
                    </p>
                  </div>
                </Panel>

                <Panel
                  title="Payment Summary"
                  badge={<Receipt className="w-4 h-4 text-orange-500" />}
                >
                  <div className="space-y-3 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery Fee</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(order.deliveryFee)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Payment Method</span>
                      <span className="font-semibold text-slate-800">
                        {order.paymentMethod === 'CASH_ON_DELIVERY'
                          ? 'Cash on Delivery'
                          : order.paymentMethod === 'DIGITAL_WALLET'
                            ? `${order.paymentDetails?.walletType === 'GOOGLE_PAY' ? 'Google Pay' : 'Apple Pay'}`
                            : order.paymentMethod === 'ONLINE_BANKING'
                              ? `${order.paymentDetails?.bankName || 'Online Banking'}`
                              : `Card (•••• ${order.paymentDetails?.cardLast4 || '4242'})`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Payment Status</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${order.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                      >
                        {order.paymentStatus === 'PAID' ? '✓ Paid' : '⏳ Pay on Delivery'}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-base">
                      <span className="font-bold text-slate-800">
                        {order.paymentStatus === 'PAID' ? 'Total Paid' : 'Total Due'}
                      </span>
                      <span className="font-black text-xl text-orange-600">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </Panel>
              </div>
            </div>
          </>
        )}
      </DataState>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel This Order?"
        subtitle="You can cancel your order while it is in PENDING status."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Order
            </Button>
            <Button variant="danger" size="sm" loading={cancelling} onClick={handleCancelOrder}>
              Confirm Cancellation
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {cancelError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">
              {cancelError}
            </div>
          )}
          <p className="text-xs text-slate-600">
            Please let the restaurant know why you are cancelling:
          </p>
          <input
            type="text"
            placeholder="e.g. Changed my mind, placed by mistake"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full text-xs rounded-xl border border-slate-200 p-2.5 focus:outline-none focus:ring-2 focus:ring-red-400"
          />
        </div>
      </Modal>
    </div>
  );
};
