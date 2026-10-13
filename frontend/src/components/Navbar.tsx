import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  BarChart3,
  AlertTriangle,
  GitBranch,
  Shield,
  Bell,
  User as UserIcon,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReportModal: () => void;
  onOpenLoginModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onOpenLoginModal,
}) => {
  const { user, logout, quickLogin } = useAuth();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const navItems = [
    { id: 'landing', label: 'Overview', icon: Compass },
    { id: 'map', label: 'Traffic Map', icon: MapPin },
    { id: 'dashboard', label: 'Monitoring', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'routes', label: 'Route Compare', icon: GitBranch },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  if (user?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Hub', icon: Shield });
  }

  return (
    <header className="sticky top-0 z-40 bg-panel/90 backdrop-blur-md border-b border-panel-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-secondary via-accent-primary to-sky-400 p-[2px] shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-panel rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-accent-primary animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  Route<span className="text-accent-primary">X</span>
                  <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-accent-primary/20 text-accent-primary font-mono font-medium">AI</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                By Anil Biradar
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30 shadow-sm shadow-accent-primary/10'
                      : 'text-slate-300 hover:text-white hover:bg-panel-subtle'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-accent-primary' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Area: Report, Notifications, User */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Report Button */}
            <button
              onClick={onOpenReportModal}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span>Report Hazard</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-panel-subtle transition-all"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-panel animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <NotificationDropdown
                  onClose={() => setShowNotifications(false)}
                  onSelectIncident={(id) => {
                    setShowNotifications(false);
                    setActiveTab('incidents');
                  }}
                />
              )}
            </div>

            {/* User Profile or Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-panel-subtle border border-panel-border hover:border-slate-600 transition-all text-xs font-medium text-slate-200"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-accent-primary to-accent-secondary flex items-center justify-center text-[10px] font-bold text-black uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline-block max-w-[90px] truncate">{user.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-400 border border-sky-800 uppercase">
                    {user.role}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-panel border border-panel-border shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-panel-border mb-1">
                      <p className="text-xs font-semibold text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <p className="text-[10px] mt-1 text-accent-primary font-mono uppercase">
                        Role: {user.role}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowRoleSwitcher(true);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-panel-subtle rounded-lg text-left"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Switch Demo Persona</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg text-left mt-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenLoginModal}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent-primary hover:bg-accent-hover text-black transition-all shadow-sm shadow-accent-primary/30"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Persona Switcher Modal for seamless project demonstrations */}
      {showRoleSwitcher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="bg-panel border border-panel-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-accent-primary" />
              <span>Project Demo: Switch User Persona</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Quickly test the platform through different stakeholder perspectives with pre-configured roles.
            </p>

            <div className="grid grid-cols-1 gap-2.5 mt-4">
              <button
                onClick={async () => {
                  await quickLogin('admin');
                  setShowRoleSwitcher(false);
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-panel-subtle hover:bg-sky-950/40 border border-panel-border hover:border-accent-primary/50 text-left transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-white">Administrator</div>
                  <div className="text-[11px] text-slate-400">Full system oversight, audit logs, reset demo datasets</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">admin@routex.ai</span>
              </button>

              <button
                onClick={async () => {
                  await quickLogin('moderator');
                  setShowRoleSwitcher(false);
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-panel-subtle hover:bg-sky-950/40 border border-panel-border hover:border-accent-primary/50 text-left transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-white">Traffic Ops Moderator</div>
                  <div className="text-[11px] text-slate-400">Review, verify, resolve incidents, update road statuses</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">moderator@routex.ai</span>
              </button>

              <button
                onClick={async () => {
                  await quickLogin('commuter');
                  setShowRoleSwitcher(false);
                }}
                className="flex items-center justify-between p-3 rounded-xl bg-panel-subtle hover:bg-sky-950/40 border border-panel-border hover:border-accent-primary/50 text-left transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-white">Daily Commuter (Registered)</div>
                  <div className="text-[11px] text-slate-400">Save routes, save favorites, submit community reports</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">commuter@routex.ai</span>
              </button>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowRoleSwitcher(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-panel-subtle border border-panel-border"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
