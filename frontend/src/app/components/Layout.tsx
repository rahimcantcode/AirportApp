import React, { useEffect, useMemo, useState } from 'react';
import { useApp, UserRole } from '@/app/context/AppContext';
import { 
  Home, 
  Plane, 
  Users, 
  UserCog, 
  Luggage, 
  MessageSquare, 
  LogOut,
  MapPin,
  Search
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const roleNavItems: Record<Exclude<UserRole, null>, NavItem[]> = {
  admin: [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: 'admin-dashboard' },
    { label: 'Manage Flights', icon: <Plane className="w-5 h-5" />, path: 'admin-flights' },
    { label: 'Manage Passengers', icon: <Users className="w-5 h-5" />, path: 'admin-passengers' },
    { label: 'Manage Staff', icon: <UserCog className="w-5 h-5" />, path: 'admin-staff' },
    { label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: 'admin-messages' },
  ],
  'airline-staff': [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: 'airline-dashboard' },
    { label: 'Check-In', icon: <Luggage className="w-5 h-5" />, path: 'airline-checkin' },
        { label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: 'airline-messages' },
  ],
  'gate-staff': [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: 'gate-dashboard' },
    { label: 'Board Passenger', icon: <Users className="w-5 h-5" />, path: 'gate-boarding' },
    { label: 'Flight Departure', icon: <Plane className="w-5 h-5" />, path: 'gate-departure' },
    { label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: 'gate-messages' },
  ],
  'ground-staff': [
    { label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: 'ground-dashboard' },
    { label: 'Update Bags', icon: <Luggage className="w-5 h-5" />, path: 'ground-bags' },
    { label: 'Load Bags', icon: <MapPin className="w-5 h-5" />, path: 'ground-load' },
    { label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, path: 'ground-messages' },
  ],
  passenger: [
    { label: 'Track Bags', icon: <Luggage className="w-5 h-5" />, path: 'passenger-track' },
    { label: 'Gate Info', icon: <Plane className="w-5 h-5" />, path: 'passenger-gate' },
  ],
};

export function Layout({ children }: LayoutProps) {
  const { currentUser, setCurrentUser } = useApp();
  const [active, setActive] = useState<string>(() => (window.location.hash || '').replace('#', ''));
  const [q, setQ] = useState<string>('');

  useEffect(() => {
    const onHash = () => setActive((window.location.hash || '').replace('#', ''));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (!currentUser || !currentUser.role) {
    return <>{children}</>;
  }

  const navItems = roleNavItems[currentUser.role] || [];

  const roleLabel = useMemo(() => {
    const words = currentUser.role.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1));
    return words.join(' ');
  }, [currentUser.role]);

  const handleLogout = () => {
    setCurrentUser(null);
    window.location.hash = '';
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-72 bg-white/70 backdrop-blur-xl border-r border-black/5 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-black/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-sm">
              <Plane className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-gray-900 truncate">Airport Luggage System</h1>
              <p className="text-sm text-gray-500 mt-0.5 truncate">{roleLabel}</p>
            </div>
          </div>
          {currentUser.airline && (
            <p className="text-xs text-gray-400 mt-2">
              Airline: <span className="font-mono-ui">{currentUser.airline}</span>
            </p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <a
                  href={`#${item.path}`}
                  className={
                    "flex items-center gap-3 px-4 py-2 rounded-xl transition-colors " +
                    (active === item.path
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100")
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-black/5">
          <div className="mb-3 px-4 py-2">
            <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
          </div>
          <a
            href="#password-reset"
            className="mb-2 w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <span>Change Password</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top command bar */}
        <div className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur-xl">
          <div className="px-6 py-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search ticket, bag ID, flight, gate"
                  className="w-full rounded-xl bg-white border border-black/10 pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400/40"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 border border-black/5">
                Ops Console
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
