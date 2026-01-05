import React, { useState, useEffect } from 'react';
import { LogOut, Menu, Bell } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button className="md:hidden text-gray-600 hover:text-gray-800">
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Punjab Transport Company
          </h2>
          <p className="text-sm text-gray-500">
            {formatDate(currentTime)} • {formatTime(currentTime)}
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button 
          className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Info */}
        <div className="hidden md:flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              {user?.name || 'Admin User'}
            </p>
            <p className="text-xs text-gray-500">
              {user?.role || 'Administrator'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:inline font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;