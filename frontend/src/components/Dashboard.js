import React, { useState, useEffect } from 'react';
import { Bus, Activity, AlertTriangle, TrendingUp, Bell } from 'lucide-react';
import { analytics, incidents, alerts } from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, incidentsRes, alertsRes] = await Promise.all([
        analytics.getDashboardSummary(),
        incidents.getAll(),
        alerts.getRecent()
      ]);

      setStats(statsRes.data);
      setRecentIncidents(incidentsRes.data.slice(0, 5));
      setRecentAlerts(alertsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl font-semibold text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Command & Control Dashboard</h1>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Buses"
          value={stats?.fleet?.total_buses || 0}
          icon={Bus}
          color="blue"
          subtitle="In fleet"
        />
        <StatCard
          title="Active Buses"
          value={stats?.fleet?.active_buses || 0}
          icon={Activity}
          color="green"
          subtitle="Currently running"
        />
        <StatCard
          title="Open Incidents"
          value={stats?.incidents?.open_incidents || 0}
          icon={AlertTriangle}
          color="red"
          subtitle="Needs attention"
        />
        <StatCard
          title="Total Revenue"
          value={`Rs ${stats?.revenue?.total_revenue || 0}`}
          icon={TrendingUp}
          color="purple"
          subtitle="Today's collection"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Incidents */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Active Incidents
            </h3>
            <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
              {recentIncidents.filter(i => i.status !== 'Resolved').length} Active
            </span>
          </div>
          <div className="space-y-3">
            {recentIncidents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No incidents to display</p>
            ) : (
              recentIncidents
                .filter(incident => incident.status !== 'Resolved')
                .map((incident) => (
                  <div
                    key={incident.incident_id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{incident.type}</p>
                      <p className="text-sm text-gray-600">
                        Bus {incident.bus_id} - {incident.route_name || 'Unknown Route'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          incident.severity === 'Critical'
                            ? 'bg-red-100 text-red-800'
                            : incident.severity === 'High'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {incident.severity}
                      </span>
                      <span className="text-xs text-gray-500">{incident.status}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Bell className="w-5 h-5 mr-2 text-blue-600" />
              Recent Alerts
            </h3>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              {recentAlerts.length} New
            </span>
          </div>
          <div className="space-y-3">
            {recentAlerts.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No alerts to display</p>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.alert_id}
                  className="p-4 bg-gray-50 rounded-lg hover:shadow-md transition"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2 rounded-lg ${
                        alert.alert_type === 'Emergency'
                          ? 'bg-red-100'
                          : alert.alert_type === 'Warning'
                          ? 'bg-yellow-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      <Bell
                        className={`w-4 h-4 ${
                          alert.alert_type === 'Emergency'
                            ? 'text-red-600'
                            : alert.alert_type === 'Warning'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {alert.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        To: {alert.recipient_role}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Fleet Status Overview */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Fleet Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-green-50 rounded-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-600 font-medium">Ongoing Trips</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats?.trips?.ongoing_trips || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </div>
          <div className="p-5 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 font-medium">Completed Trips</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats?.trips?.completed_trips || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Successfully finished</p>
          </div>
          <div className="p-5 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <p className="text-sm text-gray-600 font-medium">Delayed Trips</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {stats?.trips?.delayed_trips || 0}
            </p>
            <p className="text-xs text-gray-500 mt-1">Behind schedule</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold mt-2 text-gray-800">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-4 rounded-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;