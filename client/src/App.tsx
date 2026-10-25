import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { DonorRegisterPage } from './pages/public/DonorRegisterPage';
import { HospitalRegisterPage } from './pages/public/HospitalRegisterPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Donor Pages
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { DonorProfilePage } from './pages/donor/DonorProfilePage';
import { DonorEmergencyRequestsPage } from './pages/donor/DonorEmergencyRequestsPage';
import { DonorRequestDetailPage } from './pages/donor/DonorRequestDetailPage';
import { DonorResponsesPage } from './pages/donor/DonorResponsesPage';
import { DonorHistoryPage } from './pages/donor/DonorHistoryPage';
import { DonorNotificationsPage, DonorSettingsPage } from './pages/donor/DonorNotificationsPage';

// Hospital Pages
import { HospitalDashboard } from './pages/hospital/HospitalDashboard';
import { CreateEmergencyRequestPage } from './pages/hospital/CreateEmergencyRequestPage';
import { HospitalActiveRequestsPage } from './pages/hospital/HospitalActiveRequestsPage';
import { HospitalRequestDetailPage } from './pages/hospital/HospitalRequestDetailPage';
import { MatchedDonorsPage } from './pages/hospital/MatchedDonorsPage';
import { HospitalDonorResponsesPage } from './pages/hospital/HospitalDonorResponsesPage';
import { HospitalProfilePage } from './pages/hospital/HospitalProfilePage';
import { HospitalHistoryPage } from './pages/hospital/HospitalHistoryPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminDonorsPage } from './pages/admin/AdminDonorsPage';
import { AdminHospitalsPage } from './pages/admin/AdminHospitalsPage';
import { AdminEmergencyMonitoringPage } from './pages/admin/AdminEmergencyMonitoringPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/donor" element={<DonorRegisterPage />} />
      <Route path="/register/hospital" element={<HospitalRegisterPage />} />

      {/* Donor Role Routes */}
      <Route path="/donor" element={<Navigate to="/donor/dashboard" replace />} />
      <Route path="/donor/dashboard" element={<DonorDashboard />} />
      <Route path="/donor/profile" element={<DonorProfilePage />} />
      <Route path="/donor/availability" element={<DonorDashboard />} />
      <Route path="/donor/requests" element={<DonorEmergencyRequestsPage />} />
      <Route path="/donor/requests/:id" element={<DonorRequestDetailPage />} />
      <Route path="/donor/responses" element={<DonorResponsesPage />} />
      <Route path="/donor/history" element={<DonorHistoryPage />} />
      <Route path="/donor/notifications" element={<DonorNotificationsPage />} />
      <Route path="/donor/settings" element={<DonorSettingsPage />} />

      {/* Hospital Role Routes */}
      <Route path="/hospital" element={<Navigate to="/hospital/dashboard" replace />} />
      <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
      <Route path="/hospital/create-request" element={<CreateEmergencyRequestPage />} />
      <Route path="/hospital/active-requests" element={<HospitalActiveRequestsPage />} />
      <Route path="/hospital/requests/:id" element={<HospitalRequestDetailPage />} />
      <Route path="/hospital/matched-donors" element={<MatchedDonorsPage />} />
      <Route path="/hospital/responses" element={<HospitalDonorResponsesPage />} />
      <Route path="/hospital/profile" element={<HospitalProfilePage />} />
      <Route path="/hospital/history" element={<HospitalHistoryPage />} />
      <Route path="/hospital/notifications" element={<DonorNotificationsPage />} />
      <Route path="/hospital/settings" element={<AdminSettingsPage />} />

      {/* Admin Role Routes */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/donors" element={<AdminDonorsPage />} />
      <Route path="/admin/hospitals" element={<AdminHospitalsPage />} />
      <Route path="/admin/monitoring" element={<AdminEmergencyMonitoringPage />} />
      <Route path="/admin/settings" element={<AdminSettingsPage />} />

      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
