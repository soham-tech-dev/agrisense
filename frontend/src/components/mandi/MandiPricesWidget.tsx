import React from 'react';
import { TrendingUp, MapPin, Calendar, Layers, RefreshCw } from 'lucide-react';
import { MandiPrice } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';

interface MandiPricesWidgetProps {
  prices: MandiPrice[];
  isMarathi: boolean;
  onOpenCompare?: () => void;
  onRefresh?: () => void;
}

export const MandiPricesWidget: React.FC<MandiPricesWidgetProps> = ({
  prices,
  isMarathi,
  onOpenCompare,
  onRefresh
}) => {
  return (
    <Card
      title={isMarathi ? 'आजचे बाजार भाव (Mandi Prices)' : "Today's Mandi Prices"}
      headerAction={
        <div className="flex items-center gap-2">
          {onOpenCompare && (
            <button
              onClick={onOpenCompare}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200"
            >
              {isMarathi ? 'बाजार तुलना' : 'Compare Markets'}
            </button>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-1 text-slate-400 hover:text-emerald-700"
              title={isMarathi ? 'ताजे भाव आणा' : 'Refresh prices'}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-3">
        {Array.isArray(prices) && prices.length > 0 ? (
          prices.map((item, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                    <span>{isMarathi ? item.crop_mr || item.crop : item.crop}</span>
                    {item.cached && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-300">
                        {isMarathi ? 'कॅश' : 'Cached'}
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {isMarathi ? item.market_mr || item.market : item.market} ({item.district})
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium block">
                    {isMarathi ? 'सर्वसाधारण भाव' : 'Modal Price'}
                  </span>
                  <span className="text-lg font-black text-emerald-700">
                    ₹{item.modal_price.toLocaleString('en-IN')}
                    <span className="text-xs text-slate-500 font-normal"> / {isMarathi ? 'क्विंटल' : 'qtl'}</span>
                  </span>
                </div>
              </div>

              {/* Price range bar */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span className="text-slate-500">{isMarathi ? 'किमान:' : 'Min:'}</span>
                  <span className="font-bold text-slate-700">₹{item.min_price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-l border-slate-200 pl-2">
                  <span className="text-slate-500">{isMarathi ? 'कमाल:' : 'Max:'}</span>
                  <span className="font-bold text-slate-700">₹{item.max_price.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Source & Date info */}
              <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 pt-1 border-t border-slate-100">
                <span>{isMarathi ? 'स्रोत:' : 'Source:'} {item.source}</span>
                <span>{isMarathi ? 'तारीख:' : 'Date:'} {item.date} ({item.last_updated})</span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 text-center py-4">
            {isMarathi ? 'बाजार भाव उपलब्ध नाहीत.' : 'No mandi prices available.'}
          </p>
        )}
      </div>
    </Card>
  );
};
