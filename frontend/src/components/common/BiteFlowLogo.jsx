import React from 'react';

export const BiteFlowLogo = ({
  size = 'md',
  showText = true,
  className = '',
  useImage = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-4xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Logo Emblem */}
      {useImage ? (
        <img
          src="/logo.png"
          alt="BiteFlow Logo"
          className={`${iconSizes[size] || iconSizes.md} rounded-2xl object-cover shadow-md shadow-orange-500/25 shrink-0`}
        />
      ) : (
        <div
          className={`${
            iconSizes[size] || iconSizes.md
          } relative shrink-0 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 p-[1.5px] shadow-md shadow-orange-500/30 group-hover:shadow-orange-500/50 group-hover:scale-105 transition-all duration-300`}
        >
          <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full rounded-2xl overflow-hidden"
          >
            <defs>
              <linearGradient id="bgGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="50%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#FBBF24" />
              </linearGradient>
              <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.15" />
              </filter>
            </defs>

            {/* Background rounded squircle */}
            <rect width="100" height="100" rx="26" fill="url(#bgGrad)" />
            {/* Soft inner highlight */}
            <rect x="2" y="2" width="96" height="48" rx="24" fill="url(#glowGrad)" />

            {/* Stylized Modern 'B' with Fork & Flow Wings */}
            <g filter="url(#shadow)" fill="#FFFFFF">
              {/* Back stem of B */}
              <path
                d="M26 24C26 21.7909 27.7909 20 30 20H46C56 20 63 26 63 34C63 39.5 59.5 44 54 46C61 48 66 53.5 66 61C66 70.5 58 77 47 77H30C27.7909 77 26 75.2091 26 73V24Z"
                fill="#FFFFFF"
              />
              {/* Cutout / negative space inside top counter */}
              <path
                d="M34 27H45C51 27 55 30 55 34.5C55 39 51 42 45 42H34V27Z"
                fill="#F97316"
              />
              {/* Cutout / negative space inside bottom counter with aerodynamic wing curve */}
              <path
                d="M34 49H46C52.5 49 57.5 53 57.5 59C57.5 65 52.5 70 46 70H34V49Z"
                fill="#F97316"
              />

              {/* Fork Cutout Silhouette inside the top loop */}
              <rect x="42.5" y="29" width="2" height="10" rx="1" fill="#FFFFFF" />
              <rect x="39" y="29" width="1.5" height="6.5" rx="0.75" fill="#FFFFFF" />
              <rect x="46" y="29" width="1.5" height="6.5" rx="0.75" fill="#FFFFFF" />

              {/* Flow Speed Wing Plumes extending forward to the right */}
              <path
                d="M58 48C67 48 76 43 82 36C78 45 68 51 58 52V48Z"
                fill="#FFFFFF"
              />
              <path
                d="M62 55C70 55 77 52 82 46C78 53 71 58 62 59V55Z"
                fill="#FFFFFF"
              />
              <path
                d="M59 63C66 63 72 61 77 56C73 61 67 65 59 66V63Z"
                fill="#FFFFFF"
              />
            </g>
          </svg>
        </div>
      )}

      {/* Typography Label */}
      {showText && (
        <div className="flex items-baseline">
          <span
            className={`${
              textSizes[size] || textSizes.md
            } font-black tracking-tight bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent`}
          >
            BiteFlow
          </span>
          <span className="ml-1.5 text-[10px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-orange-700 border border-orange-200/50 hidden sm:inline-block">
            Delivery
          </span>
        </div>
      )}
    </div>
  );
};
