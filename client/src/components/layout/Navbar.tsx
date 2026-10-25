import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { 
  HeartHandshake, 
  Bell, 
  LogOut, 
  Menu, 
  ShieldAlert, 
  Hospital, 
  User as UserIcon, 
  ArrowRightLeft,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { currentUser, switchRole, logout } = useAuth();
  const navigate = useNavigate();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleRoleSwitch = async (role: UserRole) => {
    setShowRoleDropdown(false);
    await switchRole(role);
    if (role === 'donor') navigate('/donor/dashboard');
    else if (role === 'hospital') navigate('/hospital/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  const handleLogout = async () => {
    setShowUserDropdown(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-sm backdrop-blur-md">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          {currentUser && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-700 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-900/10 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  Blood<span className="text-rose-700">Link</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 uppercase tracking-widest">
                  Emergency
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block">
                Real-Time Emergency Response Platform
              </p>
            </div>
          </Link>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              {/* Reviewer / Fast Role Switcher Widget */}
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
                  title="Switch Persona for Evaluation"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-rose-700" />
                  <span className="hidden sm:inline">Role:</span>
                  <span className="uppercase text-rose-700 font-bold">{currentUser.role}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Switch Role (Demo Mode)
                    </div>
                    <button
                      onClick={() => handleRoleSwitch('donor')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left hover:bg-rose-50 hover:text-rose-900 transition ${
                        currentUser.role === 'donor' ? 'bg-rose-50/70 text-rose-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <UserIcon className="w-4 h-4 text-rose-600" />
                      <span>Donor Persona</span>
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('hospital')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left hover:bg-rose-50 hover:text-rose-900 transition ${
                        currentUser.role === 'hospital' ? 'bg-rose-50/70 text-rose-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <Hospital className="w-4 h-4 text-rose-600" />
                      <span>Hospital Persona</span>
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-left hover:bg-rose-50 hover:text-rose-900 transition ${
                        currentUser.role === 'admin' ? 'bg-rose-50/70 text-rose-900 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Admin Persona</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Notification icon */}
              <Link
                to={currentUser.role === 'donor' ? '/donor/notifications' : currentUser.role === 'hospital' ? '/hospital/notifications' : '/admin/dashboard'}
                className="relative p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-50 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden md:block text-left text-xs">
                    <div className="font-bold text-slate-800 truncate max-w-[120px]">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 capitalize">{currentUser.role}</div>
                  </div>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <span className="mt-1 inline-block uppercase text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                        {currentUser.role} Account
                      </span>
                    </div>

                    <Link
                      to={
                        currentUser.role === 'donor'
                          ? '/donor/profile'
                          : currentUser.role === 'hospital'
                          ? '/hospital/profile'
                          : '/admin/settings'
                      }
                      onClick={() => setShowUserDropdown(false)}
                      className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition font-medium"
                    >
                      Profile & Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-700 hover:bg-rose-50 text-left transition font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register/donor"
                className="px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-sm transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
