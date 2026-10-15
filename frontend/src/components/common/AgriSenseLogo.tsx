import React from 'react';

interface AgriSenseLogoProps {
  className?: string;
  iconSize?: string;
  textSize?: string;
  showSubtitle?: boolean;
  subtitleText?: string;
  proBadge?: boolean;
  proBadgeText?: string;
  isMarathi?: boolean;
}

export const AgriSenseLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-10.5 h-10.5' }) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-[0_2px_10px_rgba(52,211,153,0.45)] transition-transform duration-300 group-hover:scale-110`}
    >
      {/* Small Left Leaflet */}
      <path
        d="M6.2 21.8C5.2 18.2 6.6 15 9.8 14.2C10.5 17.2 9.6 20.4 6.2 21.8Z"
        fill="#6ee7b7"
      />
      {/* Main Upward-Right Leaf */}
      <path
        d="M9.8 23.8C8.8 17.2 12.2 10.2 25.2 6.8C25.8 14.8 20.8 23.8 9.8 23.8Z"
        fill="#a7f3d0"
      />
      {/* Central Curved Vein */}
      <path
        d="M10.8 22.8C13.8 18.2 17.4 13.8 23.4 9.2"
        stroke="#065f46"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const AgriSenseLogo: React.FC<AgriSenseLogoProps> = ({
  className = '',
  iconSize = 'w-7 h-7',
  textSize = 'text-xl',
  showSubtitle = false,
  subtitleText,
  proBadge = false,
  proBadgeText = 'PRO',
  isMarathi = false,
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Exact Duo-Leaf Motif without container box */}
      <AgriSenseLogoIcon className={iconSize} />

      {/* Brand Wordmark: "Agri" in pure white/slate, "Sense" in vibrant emerald */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-black ${textSize} tracking-tight leading-none`}>
            <span className="text-white">Agri</span>
            <span className="text-emerald-400 font-black drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]">
              Sense
            </span>
          </span>

          {proBadge && (
            <span className="inline-flex items-center text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/35 shadow-xs">
              {proBadgeText}
            </span>
          )}
        </div>

        {showSubtitle && (
          <div className="flex items-center gap-1.5 mt-1 text-[11px] font-semibold text-emerald-300/80 tracking-wide truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            <span className="truncate">
              {subtitleText || (isMarathi ? 'डिजिटल कृषी AI' : 'Vernacular AI Advisor')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
