import React from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ShieldCheck, Database, Server, RefreshCw } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();

  const handleResetDemoData = () => {
    localStorage.clear();
    showToast({
      type: 'success',
      title: 'Demo Storage Reset',
      message: 'Platform state has been restored to default seeds. Reloading...'
    });
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  return (
    <DashboardLayout
      title="Platform System Settings & Architecture"
      subtitle="Phase 1 prototype controls and Phase 2 backend connection readiness"
    >
      <div className="max-w-3xl space-y-6">
        <Card title="Prototype State & Demo Reset" subtitle="Local storage cache controls for presentations">
          <div className="text-xs text-slate-600 space-y-3">
            <p>
              In Phase 1, platform data operates via in-memory local state simulation. You can wipe and re-seed the test database at any time.
            </p>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={handleResetDemoData}
            >
              Reset Demo Storage to Initial State
            </Button>
          </div>
        </Card>

        <Card title="Phase 2 Backend Integration Readiness" subtitle="Target Node.js + Express REST API structure">
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border font-mono text-[11px] leading-relaxed">
              <div>Frontend Service Layer: <span className="text-emerald-700">Isolated in client/src/services/</span></div>
              <div>Backend Target: <span className="text-slate-900 font-bold">Node.js + Express + Mongoose (REST APIs)</span></div>
              <div>Database Target: <span className="text-slate-900 font-bold">MongoDB Atlas / Local MongoDB</span></div>
              <div>Authentication Scheme: <span className="text-slate-900 font-bold">Bearer JWT (JSON Web Tokens)</span></div>
            </div>

            <p className="text-[11px] text-slate-500">
              Per project safety requirements, real MongoDB connection credentials will only be requested in Phase 3 after Phase 1 evaluation is approved.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};
