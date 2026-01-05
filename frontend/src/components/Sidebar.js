import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Map, 
  Users, 
  Route, 
  AlertTriangle, 
  Bell, 
  BarChart3, 
  Ticket, 
  Bus 
} from 'lucide-react';

const Sidebar = ({ user }) => {
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', path: '/' },
    { id: 'live-map', icon: Map, label: 'Live Map', path: '/live-map' },
    { id: 'fleet', icon: Bus, label: 'Fleet Management', path: '/fleet' },
    { id: 'routes', icon: Route, label: 'Route Management', path: '/routes' },
    { id: 'incidents', icon: AlertTriangle, label: 'Incidents', path: '/incidents' },
    { id: 'alerts', icon: Bell, label: 'Alerts', path: '/alerts' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { id: 'tickets', icon: Ticket, label: 'Ticketing', path: '/tickets' },
    { id: 'users', icon: Users, label: 'User Management', path: '/users' },
  ];

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="flex items-center space-x-2 px-6 py-7 border-b border-gray-700">
        <Bus className="w-8 h-8 text-blue-400" />
        <span className="text-2xl font-extrabold">PTC Control</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-2 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center space-x-3 py-3 px-4 rounded-lg transition duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="px-4 py-6 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user?.name || 'Admin User'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {user?.role || 'Administrator'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;