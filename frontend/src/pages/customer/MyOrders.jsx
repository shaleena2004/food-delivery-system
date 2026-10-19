import React from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import { useFetch } from '../../hooks/useFetch';
import { Card } from '../../components/common/Card';
import { DataState } from '../../components/common/DataState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ShoppingBag, ArrowRight, Store, Clock, Star } from 'lucide-react';

export const MyOrders = () => {
  const navigate = useNavigate();
  const { data: orders, loading, error, refetch } = useFetch((signal) =>
    orderService.getMyOrders(signal)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Order History
          </h1>
          <p className="text-xs text-slate-500 mt-1">Track and review your past and active orders</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/restaurants')}>
          Explore More
        </Button>
      </div>

      <DataState
        loading={loading}
        error={error}
        empty={!orders || orders.length === 0}
        emptyMessage="No orders found"
        emptySubtext="You haven't placed any orders yet. Try out some delicious meals today!"
        onRetry={refetch}
        emptyAction={
          <Button variant="primary" size="sm" onClick={() => navigate('/restaurants')}>
            Order Food Now
          </Button>
        }
      >
        {() => (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderId = order._id || order.id;

              return (
                <Card
                  key={orderId}
                  hover
                  onClick={() => navigate(`/orders/${orderId}`)}
                  className="cursor-pointer"
                >
                  <Card.Header className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-800">
                          {order.restaurantName || 'BiteFlow Restaurant'}
                        </h3>
                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(order.createdAt)}</span>
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={order.status} size="md" />
                  </Card.Header>

                  <Card.Body>
                    <div className="space-y-1.5">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                          <span>
                            {item.quantity}x <strong className="text-slate-800">{item.itemName}</strong>
                          </span>
                          <span>{formatCurrency(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </Card.Body>

                  <Card.Footer className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="text-xs">
                        <span className="text-slate-500">Total: </span>
                        <strong className="text-sm font-black text-slate-900">
                          {formatCurrency(order.totalAmount)}
                        </strong>
                      </div>

                      {order.status === 'DELIVERED' && (
                        order.review?.foodRating ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            Reviewed ({order.review.foodRating}★ Food • {order.review.riderRating}★ Rider)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-200 animate-pulse">
                            <Star className="w-3 h-3 text-orange-500" />
                            Review Your Meal & Rider
                          </span>
                        )
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700">
                      <span>{order.status === 'DELIVERED' ? 'View Details & Review' : 'Live Tracker'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Card.Footer>
                </Card>
              );
            })}
          </div>
        )}
      </DataState>
    </div>
  );
};
