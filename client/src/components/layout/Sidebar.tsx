import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  User, 
  Power, 
  AlertCircle, 
  CheckSquare, 
  History, 
  Bell, 
  Settings, 
  LogOut, 
  PlusCircle, 
  Users, 
  Building2, 
  Activity, 
  ShieldCheck,
  Building
} from 'lucide-react';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { currentUser, logout, donorProfile } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    if (onCloseMobile) onCloseMobile();
  };

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-rose-50 text-rose-800 font-bold border-l-4 border-rose-700 shadow-sm'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 select-none">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Role Pill Banner */}
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Active Portal
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800">
              {currentUser.role}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 mt-1 truncate">{currentUser.name}</p>
          {currentUser.role === 'donor' && donorProfile && (
            <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-200/60">
              <span className="text-[11px] text-slate-500 font-medium">Blood Group:</span>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-rose-600 text-white">
                {donorProfile.bloodGroup}
              </span>
            </div>
          )}
        </div>

        {/* Hospital Primary CTA */}
        {currentUser.role === 'hospital' && (
          <NavLink
            to="/hospital/create-request"
            onClick={onCloseMobile}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-md shadow-rose-900/10 transition-all hover:scale-[1.01]"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>+ Create Emergency Request</span>
          </NavLink>
        )}

        {/* Role-specific Navigation Groups */}
        <nav className="space-y-1">
          {currentUser.role === 'donor' && (
            <>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Donor Navigation
              </div>
              <NavLink to="/donor/dashboard" onClick={onCloseMobile} className={navItemClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/donor/profile" onClick={onCloseMobile} className={navItemClass}>
                <User className="w-4 h-4" />
                <span>My Profile</span>
              </NavLink>
              <NavLink to="/donor/availability" onClick={onCloseMobile} className={navItemClass}>
                <Power className="w-4 h-4" />
                <span>Availability Status</span>
              </NavLink>
              <NavLink to="/donor/requests" onClick={onCloseMobile} className={navItemClass}>
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Emergency Requests</span>
              </NavLink>
              <NavLink to="/donor/responses" onClick={onCloseMobile} className={navItemClass}>
                <CheckSquare className="w-4 h-4" />
                <span>My Responses</span>
              </NavLink>
              <NavLink to="/donor/history" onClick={onCloseMobile} className={navItemClass}>
                <History className="w-4 h-4" />
                <span>Donation History</span>
              </NavLink>
              <NavLink to="/donor/notifications" onClick={onCloseMobile} className={navItemClass}>
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </NavLink>
              <NavLink to="/donor/settings" onClick={onCloseMobile} className={navItemClass}>
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </NavLink>
            </>
          )}

          {currentUser.role === 'hospital' && (
            <>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Hospital Operations
              </div>
              <NavLink to="/hospital/dashboard" onClick={onCloseMobile} className={navItemClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/hospital/active-requests" onClick={onCloseMobile} className={navItemClass}>
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Active Requests</span>
              </NavLink>
              <NavLink to="/hospital/responses" onClick={onCloseMobile} className={navItemClass}>
                <CheckSquare className="w-4 h-4" />
                <span>Donor Responses</span>
              </NavLink>
              <NavLink to="/hospital/history" onClick={onCloseMobile} className={navItemClass}>
                <History className="w-4 h-4" />
                <span>Request History</span>
              </NavLink>
              <NavLink to="/hospital/profile" onClick={onCloseMobile} className={navItemClass}>
                <Building2 className="w-4 h-4" />
                <span>Hospital Profile</span>
              </NavLink>
              <NavLink to="/hospital/notifications" onClick={onCloseMobile} className={navItemClass}>
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </NavLink>
              <NavLink to="/hospital/settings" onClick={onCloseMobile} className={navItemClass}>
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </NavLink>
            </>
          )}

          {currentUser.role === 'admin' && (
            <>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                Admin Oversight
              </div>
              <NavLink to="/admin/dashboard" onClick={onCloseMobile} className={navItemClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </NavLink>
              <NavLink to="/admin/donors" onClick={onCloseMobile} className={navItemClass}>
                <Users className="w-4 h-4" />
                <span>Donor Management</span>
              </NavLink>
              <NavLink to="/admin/hospitals" onClick={onCloseMobile} className={navItemClass}>
                <Building className="w-4 h-4" />
                <span>Hospital Management</span>
              </NavLink>
              <NavLink to="/admin/monitoring" onClick={onCloseMobile} className={navItemClass}>
                <Activity className="w-4 h-4 text-rose-600" />
                <span>Emergency Monitoring</span>
              </NavLink>
              <NavLink to="/admin/settings" onClick={onCloseMobile} className={navItemClass}>
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* Sidebar Footer Logout */}
      <div className="p-4 border-t border-slate-200/80">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
