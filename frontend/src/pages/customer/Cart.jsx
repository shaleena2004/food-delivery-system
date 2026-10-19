import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/order.service';
import { customerService } from '../../services/customer.service';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/common/Button';
import { Panel } from '../../components/common/Panel';
import { FormField } from '../../components/common/FormField';
import { PaymentSelector } from '../../components/cart/PaymentSelector';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  MapPin,
  ArrowRight,
  Store,
  Receipt,
  AlertCircle,
  PlusCircle,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const Cart = () => {
  const navigate = useNavigate();
  const { cart, restaurant, items, subtotal, deliveryFee, total, updateQuantity, removeItem, clearCart } =
    useCart();
  const { user, isAuthenticated } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [customAddress, setCustomAddress] = useState({
    addressName: 'Current Location',
    addressLines: '',
    city: 'Metropolis',
    postalCode: '10001',
  });
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');

  // Payment Options State
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 4242 4242 4242',
    cardholderName: 'Sarah Customer',
    expDate: '12/28',
    cvv: '888',
  });
  const [walletType, setWalletType] = useState('APPLE_PAY');
  const [selectedBank, setSelectedBank] = useState('Chase Bank');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch customer saved addresses
  useEffect(() => {
    if (isAuthenticated) {
      customerService
        .getAddresses()
        .then((res) => {
          const list = res.data || [];
          setAddresses(list);
          const def = list.find((a) => a.isDefault);
          if (def) {
            setSelectedAddressId(def._id || def.id);
          } else if (list.length > 0) {
            setSelectedAddressId(list[0]._id || list[0].id);
          } else {
            setUseNewAddress(true);
          }
        })
        .catch(() => {
          setUseNewAddress(true);
        });
    } else {
      setUseNewAddress(true);
    }
  }, [isAuthenticated]);

  if (items.length === 0) {
    return (
      <div className="py-24 max-w-md mx-auto text-center space-y-4">
        <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-800">Your basket is empty</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
          Looks like you haven't added any dishes yet. Explore our top-rated restaurants to get started!
        </p>
        <div className="pt-2">
          <Button variant="primary" onClick={() => navigate('/restaurants')} icon={Store}>
            Browse Restaurants
          </Button>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    setErrorMessage('');

    if (!isAuthenticated) {
      navigate('/login?redirect=/cart');
      return;
    }

    let finalAddress;
    if (useNewAddress || addresses.length === 0) {
      if (!customAddress.addressLines.trim()) {
        setErrorMessage('Please enter your delivery street address');
        return;
      }
      finalAddress = customAddress;
    } else {
      const chosen = addresses.find((a) => (a._id || a.id) === selectedAddressId);
      if (!chosen) {
        setErrorMessage('Please select a delivery address');
        return;
      }
      finalAddress = {
        addressName: chosen.addressName,
        addressLines: chosen.addressLines,
        city: chosen.city,
        postalCode: chosen.postalCode,
        latitude: chosen.latitude,
        longitude: chosen.longitude,
      };
    }

    setSubmitting(true);
    try {
      let paymentDetails = {};
      if (paymentMethod === 'CREDIT_CARD') {
        if (!cardDetails.cardNumber.trim()) {
          setErrorMessage('Please enter your credit or debit card number');
          setSubmitting(false);
          return;
        }
        if (!cardDetails.cardholderName.trim()) {
          setErrorMessage('Please enter the cardholder name');
          setSubmitting(false);
          return;
        }
        paymentDetails = {
          cardLast4: cardDetails.cardNumber.replace(/\s/g, '').slice(-4) || '4242',
          cardBrand: 'Visa',
        };
      } else if (paymentMethod === 'DIGITAL_WALLET') {
        paymentDetails = {
          walletType,
        };
      } else if (paymentMethod === 'ONLINE_BANKING') {
        paymentDetails = {
          bankName: selectedBank,
        };
      } else if (paymentMethod === 'CASH_ON_DELIVERY') {
        paymentDetails = {
          instructions: 'Pay cash to courier on arrival',
        };
      }

      const orderPayload = {
        restaurantId: restaurant.id,
        items: items.map((i) => ({
          menuItemId: i.menuItemId || i.id,
          quantity: i.quantity,
        })),
        deliveryAddress: finalAddress,
        orderNotes,
        paymentMethod,
        paymentDetails,
      };

      const res = await orderService.createOrder(orderPayload);
      const newOrder = res.data;
      const orderId = newOrder._id || newOrder.id;

      // Clear cart upon successful order creation
      clearCart();

      // Navigate directly to the live Order Details page with tracker!
      navigate(`/orders/${orderId}`);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">Your Cart</h1>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
          <span>Ordering from:</span>
          <strong className="text-orange-600 font-bold">{restaurant?.name}</strong>
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Items list & Delivery Address */}
        <div className="lg:col-span-7 space-y-6">
          {/* Cart Items Panel with named slots */}
          <Panel
            title="Selected Dishes"
            subtitle={`${items.length} unique dish(es)`}
            actions={
              <button
                type="button"
                onClick={clearCart}
                className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            }
          >
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const itemId = item._id || item.id || item.menuItemId;
                const lineTotal = item.price * item.quantity;

                return (
                  <div key={itemId} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{item.name}</h4>
                        <p className="text-xs text-slate-500">{formatCurrency(item.price)} each</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemId, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-slate-600 shadow-xs hover:bg-slate-50 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(itemId, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-slate-600 shadow-xs hover:bg-slate-50 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line total */}
                      <span className="text-sm font-black text-slate-800 w-16 text-right">
                        {formatCurrency(lineTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Delivery Address Panel */}
          <Panel
            title="Delivery Address"
            subtitle="Where should our courier drop off your meal?"
            badge={<MapPin className="w-4 h-4 text-orange-500" />}
          >
            {addresses.length > 0 && !useNewAddress ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-2.5">
                  {addresses.map((addr) => {
                    const addrId = addr._id || addr.id;
                    const isSelected = selectedAddressId === addrId;

                    return (
                      <div
                        key={addrId}
                        onClick={() => setSelectedAddressId(addrId)}
                        className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50/40 text-slate-900 shadow-xs ring-1 ring-orange-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{addr.addressName}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-slate-600">{addr.addressLines}, {addr.city} {addr.postalCode}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setUseNewAddress(true)}
                  className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 pt-2 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Enter a different address</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <FormField
                  label="Street Address / Unit"
                  name="addressLines"
                  placeholder="e.g. 742 Evergreen Terrace, Apt 4B"
                  value={customAddress.addressLines}
                  onChange={(e) =>
                    setCustomAddress((prev) => ({ ...prev, addressLines: e.target.value }))
                  }
                  required
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    label="City"
                    name="city"
                    placeholder="Springfield"
                    value={customAddress.city}
                    onChange={(e) =>
                      setCustomAddress((prev) => ({ ...prev, city: e.target.value }))
                    }
                    required
                  />
                  <FormField
                    label="Postal Code"
                    name="postalCode"
                    placeholder="97477"
                    value={customAddress.postalCode}
                    onChange={(e) =>
                      setCustomAddress((prev) => ({ ...prev, postalCode: e.target.value }))
                    }
                    required
                  />
                </div>

                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setUseNewAddress(false)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 pt-1 cursor-pointer"
                  >
                    &larr; Choose from saved addresses
                  </button>
                )}
              </div>
            )}

            {/* Special Instructions */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <FormField
                label="Kitchen or Delivery Notes (Optional)"
                name="orderNotes"
                placeholder="e.g. Extra napkins, please leave at door, no onions"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>
          </Panel>

          {/* Payment Method Panel */}
          <Panel
            title="Payment Options"
            subtitle="Choose your preferred payment method"
            badge={<CreditCard className="w-4 h-4 text-orange-500" />}
          >
            <PaymentSelector
              selectedMethod={paymentMethod}
              onSelectMethod={setPaymentMethod}
              cardDetails={cardDetails}
              onCardDetailsChange={setCardDetails}
              walletType={walletType}
              onWalletTypeChange={setWalletType}
              selectedBank={selectedBank}
              onBankChange={setSelectedBank}
            />
          </Panel>
        </div>

        {/* Right: Order Summary Breakdown */}
        <div className="lg:col-span-5 sticky top-24">
          <Panel
            title="Order Breakdown"
            subtitle="Verified authoritatively with Restaurant Service"
            badge={<Receipt className="w-4 h-4 text-orange-500" />}
          >
            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Standard Delivery Fee</span>
                <span className="font-semibold text-slate-800">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Estimated Taxes</span>
                <span className="font-semibold text-emerald-600">Included</span>
              </div>

              {/* Selected Payment Method row */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-600">
                <span>Payment</span>
                <span className="font-bold text-slate-800">
                  {paymentMethod === 'CREDIT_CARD' && '💳 Card (•••• 4242)'}
                  {paymentMethod === 'CASH_ON_DELIVERY' && '💵 Cash on Delivery'}
                  {paymentMethod === 'DIGITAL_WALLET' &&
                    (walletType === 'APPLE_PAY' ? ' Apple Pay' : 'Google Pay')}
                  {paymentMethod === 'ONLINE_BANKING' && `🏦 ${selectedBank}`}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-base">
                <span className="font-bold text-slate-800">Total Amount</span>
                <span className="font-black text-xl text-orange-600">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full mt-6 shadow-lg shadow-orange-500/25"
              loading={submitting}
              onClick={handleCheckout}
              icon={ArrowRight}
            >
              {!isAuthenticated
                ? 'Log In to Place Order'
                : paymentMethod === 'CASH_ON_DELIVERY'
                ? 'Confirm Order (Pay on Delivery)'
                : paymentMethod === 'DIGITAL_WALLET'
                ? `Pay ${formatCurrency(total)} with ${walletType === 'APPLE_PAY' ? 'Apple Pay' : 'Google Pay'}`
                : paymentMethod === 'ONLINE_BANKING'
                ? `Proceed to ${selectedBank} (${formatCurrency(total)})`
                : `Pay ${formatCurrency(total)} & Order`}
            </Button>

            <p className="mt-3 text-[11px] text-center text-slate-400">
              Prices will be verified authoritatively before order placement.
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
};
