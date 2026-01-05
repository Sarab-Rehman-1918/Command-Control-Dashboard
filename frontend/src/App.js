import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import FleetManagement from './components/FleetManagement';
import LiveMap from './components/LiveMap';
import UserManagement from './components/UserManagement';
import RouteManagement from './components/RouteManagement';
import IncidentManagement from './components/IncidentManagement';
import AlertSystem from './components/AlertSystem';
import Analytics from './components/Analytics';
import TicketingSystem from './components/TicketingSystem';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { auth } from './api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        await auth.verify();
        setIsAuthenticated(true);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }
    }
    setLoading(false);
  };

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      {!isAuthenticated ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        <div className="flex h-screen bg-gray-100">
          <Sidebar user={user} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header user={user} onLogout={handleLogout} />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
              <Routes>
                <Route path="/" element={<Dashboard user={user} />} />
                <Route path="/fleet" element={<FleetManagement user={user} />} />
                <Route path="/live-map" element={<LiveMap />} />
                <Route path="/users" element={<UserManagement user={user} />} />
                <Route path="/routes" element={<RouteManagement user={user} />} />
                <Route path="/incidents" element={<IncidentManagement user={user} />} />
                <Route path="/alerts" element={<AlertSystem user={user} />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/tickets" element={<TicketingSystem user={user} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </div>
      )}
    </Router>
  );
}

export default App;