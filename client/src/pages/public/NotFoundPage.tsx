import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { HeartHandshake, AlertCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-2xl border border-slate-200 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-slate-900">404</h1>
        <h2 className="text-base font-bold text-slate-800 mt-1">Page Not Found</h2>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          The emergency portal page you requested does not exist or has been relocated.
        </p>
        <Link to="/" className="mt-6 inline-block">
          <Button size="md" variant="primary">
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};
