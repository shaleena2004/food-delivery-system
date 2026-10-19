import React, { useState } from 'react';
import {
  CreditCard,
  Banknote,
  Smartphone,
  Landmark,
  CheckCircle2,
  Lock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id: 'CREDIT_CARD',
    name: 'Credit / Debit Card',
    description: 'Pay securely with Visa, Mastercard, or Amex',
    icon: CreditCard,
    badge: 'Instant',
  },
  {
    id: 'CASH_ON_DELIVERY',
    name: 'Cash on Delivery',
    description: 'Pay with physical cash when the courier arrives',
    icon: Banknote,
    badge: 'No Prepayment',
  },
  {
    id: 'DIGITAL_WALLET',
    name: 'Apple Pay / Google Pay',
    description: 'Quick & secure 1-tap digital checkout',
    icon: Smartphone,
    badge: '1-Tap',
  },
  {
    id: 'ONLINE_BANKING',
    name: 'Online Banking',
    description: 'Direct payment from your bank account',
    icon: Landmark,
    badge: 'Zero Fee',
  },
];

const POPULAR_BANKS = [
  'Chase Bank',
  'Bank of America',
  'Wells Fargo',
  'Citibank',
  'Capital One',
  'PNC Bank',
  'TD Bank',
];

export const PaymentSelector = ({
  selectedMethod = 'CREDIT_CARD',
  onSelectMethod,
  cardDetails = {
    cardNumber: '4242 4242 4242 4242',
    cardholderName: 'Sarah Customer',
    expDate: '12/28',
    cvv: '888',
  },
  onCardDetailsChange,
  walletType = 'APPLE_PAY',
  onWalletTypeChange,
  selectedBank = 'Chase Bank',
  onBankChange,
}) => {
  // Format card number with space after every 4 digits
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    onCardDetailsChange({ ...cardDetails, cardNumber: formatted });
  };

  // Format expiration as MM/YY
  const handleExpChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    onCardDetailsChange({ ...cardDetails, expDate: raw });
  };

  const handleFillDemoCard = () => {
    onCardDetailsChange({
      cardNumber: '4242 4242 4242 4242',
      cardholderName: 'Sarah Customer',
      expDate: '08/29',
      cvv: '777',
    });
  };

  return (
    <div className="space-y-4">
      {/* Method Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PAYMENT_METHODS.map((method) => {
          const isSelected = selectedMethod === method.id;
          const Icon = method.icon;

          return (
            <div
              key={method.id}
              onClick={() => onSelectMethod(method.id)}
              className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-orange-500 bg-orange-50/40 shadow-sm ring-2 ring-orange-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">{method.name}</h4>
                    <span className="text-[10px] font-semibold text-slate-400 block mt-0.5">
                      {method.badge}
                    </span>
                  </div>
                </div>

                {/* Radio Indicator */}
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-500'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed">
                {method.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Conditional Details Sub-panel */}
      <div className="pt-2">
        {/* 1. Credit / Debit Card Sub-panel */}
        {selectedMethod === 'CREDIT_CARD' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-900/10 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  256-bit Encrypted Checkout
                </span>
              </div>

              <button
                type="button"
                onClick={handleFillDemoCard}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 hover:text-orange-300 text-[11px] font-bold border border-orange-500/30 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Fill Demo Card</span>
              </button>
            </div>

            {/* Visual Card Inputs */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength={19}
                    placeholder="4242 4242 4242 4242"
                    value={cardDetails.cardNumber}
                    onChange={handleCardNumberChange}
                    className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-600 text-white">
                      VISA
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-600 text-white">
                      MC
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Full name on card"
                    value={cardDetails.cardholderName}
                    onChange={(e) =>
                      onCardDetailsChange({
                        ...cardDetails,
                        cardholderName: e.target.value,
                      })
                    }
                    className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Expires
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="MM/YY"
                      value={cardDetails.expDate}
                      onChange={handleExpChange}
                      className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-2.5 py-2.5 text-xs font-mono text-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="•••"
                      value={cardDetails.cvv}
                      onChange={(e) =>
                        onCardDetailsChange({
                          ...cardDetails,
                          cvv: e.target.value.replace(/\D/g, '').slice(0, 4),
                        })
                      }
                      className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl px-2.5 py-2.5 text-xs font-mono text-center focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Cash on Delivery Sub-panel */}
        {selectedMethod === 'CASH_ON_DELIVERY' && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Banknote className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-amber-950">Pay Upon Food Arrival</h4>
              <p className="text-amber-800 text-[11px]">
                Please prepare exact cash for the rider when your food arrives at your address.
                No advance online card payment required today.
              </p>
            </div>
          </div>
        )}

        {/* 3. Digital Wallet Sub-panel */}
        {selectedMethod === 'DIGITAL_WALLET' && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <span className="font-bold text-slate-700 block">Select Preferred Digital Wallet:</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onWalletTypeChange('APPLE_PAY')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold cursor-pointer transition-all ${
                  walletType === 'APPLE_PAY'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span> Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={() => onWalletTypeChange('GOOGLE_PAY')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold cursor-pointer transition-all ${
                  walletType === 'GOOGLE_PAY'
                    ? 'border-slate-900 bg-slate-900 text-white shadow-md'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="text-blue-500 font-black">G</span>
                <span>Google Pay</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Biometric Touch ID / Face ID will be requested upon order placement.</span>
            </div>
          </div>
        )}

        {/* 4. Online Banking Sub-panel */}
        {selectedMethod === 'ONLINE_BANKING' && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <label className="font-bold text-slate-700 block">Select Your Financial Institution:</label>
            <select
              value={selectedBank}
              onChange={(e) => onBankChange(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-300 p-2.5 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400 cursor-pointer"
            >
              {POPULAR_BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              You will be authenticated through {selectedBank}'s encrypted direct payment gateway.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
