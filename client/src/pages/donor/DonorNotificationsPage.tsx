import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Bell, Flame, CheckCircle2, ShieldAlert } from 'lucide-react';

export const DonorNotificationsPage: React.FC = () => {
  const notifications = [
    {
      id: 'notif_1',
      title: 'Critical Emergency Dispatched in Anna Nagar',
      desc: 'Apollo Speciality Hospitals broadcasted an urgent request for O+ blood.',
      time: '45 mins ago',
      type: 'critical'
    },
    {
      id: 'notif_2',
      title: 'Emergency Response Accepted',
      desc: 'Your acceptance for Request #req_001 was acknowledged by trauma desk.',
      time: '2 hours ago',
      type: 'success'
    },
    {
      id: 'notif_3',
      title: 'Platform System Alert',
      desc: 'Quarterly donor eligibility check completed. Status: Eligible.',
      time: '1 day ago',
      type: 'info'
    }
  ];

  return (
    <DashboardLayout
      title="Platform Notifications"
      subtitle="Real-time alerts, hospital acknowledgments, and platform announcements"
    >
      <div className="max-w-3xl space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 rounded-xl border bg-white shadow-sm flex items-start gap-3.5 ${
              n.type === 'critical' ? 'border-l-4 border-l-red-600' : 'border-slate-200'
            }`}
          >
            <div
              className={`p-2 rounded-lg flex-shrink-0 ${
                n.type === 'critical'
                  ? 'bg-rose-100 text-rose-700'
                  : n.type === 'success'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {n.type === 'critical' ? (
                <Flame className="w-4 h-4" />
              ) : n.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                <span className="text-[11px] text-slate-400">{n.time}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export const DonorSettingsPage: React.FC = () => {
  return (
    <DashboardLayout
      title="Donor Account & Notification Preferences"
      subtitle="Manage alert settings and communication preferences"
    >
      <div className="max-w-2xl space-y-6">
        <Card title="Alert Channels" subtitle="How you wish to receive emergency dispatches">
          <div className="space-y-4 text-xs">
            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <div>
                <div className="font-bold text-slate-800">Direct SMS & Telephone Dispatch</div>
                <div className="text-slate-500 text-[11px]">Hospitals can call your registered emergency number</div>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-rose-600 focus:ring-rose-500" />
            </label>

            <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
              <div>
                <div className="font-bold text-slate-800">Critical Trauma Push Notifications</div>
                <div className="text-slate-500 text-[11px]">Immediate web notifications for Level 1 trauma cases</div>
              </div>
              <input type="checkbox" defaultChecked className="rounded text-rose-600 focus:ring-rose-500" />
            </label>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
