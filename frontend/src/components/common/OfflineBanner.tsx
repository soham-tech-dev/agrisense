import React from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { useOnlineStatus, formatLastUpdated } from '../../hooks/useOnlineStatus';

interface OfflineBannerProps {
  lastUpdatedTimestamp?: string | null;
  onRefreshLive?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ lastUpdatedTimestamp, onRefreshLive }) => {
  const { isOnline, wasOffline } = useOnlineStatus();

  if (wasOffline && isOnline) {
    return (
      <div className="bg-emerald-600 text-white px-4 py-2 text-sm flex items-center justify-between shadow-md transition-all duration-300 animate-fade-in">
        <div className="flex items-center space-x-2">
          <Wifi className="w-4 h-4 text-emerald-200" />
          <span className="font-medium">इंटरनेट जोडणी पूर्ववत झाली! (Back online! Refreshed latest live data.)</span>
        </div>
        {onRefreshLive && (
          <button 
            onClick={onRefreshLive}
            className="flex items-center text-xs bg-emerald-700 hover:bg-emerald-800 px-2 py-1 rounded text-emerald-100 transition-colors"
          >
            <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> रिफ्रेश करा
          </button>
        )}
      </div>
    );
  }

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2.5 text-sm shadow-md transition-all duration-300">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <WifiOff className="w-5 h-5 text-amber-900 shrink-0" />
          <div>
            <span className="font-bold mr-2">तुमचे इंटरनेट कनेक्शन बंद आहे. (You are offline.)</span>
            <span className="text-amber-900 text-xs sm:text-sm">पूर्वी जतन केलेली माहिती दाखवत आहे. (Showing previously saved information.)</span>
          </div>
        </div>

        {lastUpdatedTimestamp && (
          <div className="text-xs bg-amber-600/30 text-amber-950 font-medium px-2.5 py-1 rounded border border-amber-600/40 shrink-0">
            शेवटचे अद्यतन: {formatLastUpdated(lastUpdatedTimestamp)}
          </div>
        )}
      </div>
    </div>
  );
};
