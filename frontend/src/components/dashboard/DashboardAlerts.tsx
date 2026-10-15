import React from 'react';
import { Bell, CloudRain, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '../common/Card';

interface DashboardAlertsProps {
  rainExpected: boolean;
  isMarathi: boolean;
  topCropName?: string;
  topCropPrice?: number;
}

export const DashboardAlerts: React.FC<DashboardAlertsProps> = ({
  rainExpected,
  isMarathi,
  topCropName = 'कांदा (Onion)',
  topCropPrice = 1980
}) => {
  return (
    <Card
      title={isMarathi ? 'महत्त्वाच्या सूचना व सूचनापट (Alerts)' : 'Alerts & Notifications'}
      headerAction={
        <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
          <Bell className="w-3 h-3 text-amber-600" />
          Live
        </span>
      }
    >
      <div className="space-y-2.5">
        {rainExpected && (
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-2.5">
            <CloudRain className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-sky-900 block">
                {isMarathi ? 'पावसाचा इशारा' : 'Rainfall Advisory Alert'}
              </span>
              <p className="text-sky-800">
                {isMarathi
                  ? 'पुढील २४ तासांत पाऊस पडण्याची शक्यता आहे. फवारणी नियोजनात बदल करा.'
                  : 'Rain is expected in the next 24 hours. Consider rescheduling chemical spraying.'}
              </p>
            </div>
          </div>
        )}

        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
          <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-emerald-900 block">
              {isMarathi ? 'बाजार भाव अपडेट' : 'Mandi Price Alert'}
            </span>
            <p className="text-emerald-800">
              {isMarathi
                ? `${topCropName} चे लासलगाव बाजारातील भाव ₹${topCropPrice}/क्विंटल नोंदवले गेले आहेत.`
                : `${topCropName} modal rate in Lasalgaon registered at ₹${topCropPrice}/qtl today.`}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
