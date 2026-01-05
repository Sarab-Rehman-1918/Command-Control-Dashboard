import React, { useState, useEffect } from 'react';
import {  Route } from "react-router-dom";
import { BarChart3, TrendingUp, DollarSign, Activity, Bus, AlertTriangle, Calendar } from 'lucide-react'; //Route,
import { analytics } from '../api';

const Analytics = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [routePerformance, setRoutePerformance] = useState([]);
  const [incidentTrends, setIncidentTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('daily');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timePeriod]);

  const fetchAnalyticsData = async () => {
    try {
      const [statsRes, routeRes, incidentRes] = await Promise.all([
        analytics.getDashboardSummary(),
        analytics.getRoutePerformance(),
        analytics.getIncidentTrends()
      ]);

      setDashboardStats(statsRes.data);
      setRoutePerformance(routeRes.data);
      setIncidentTrends(incidentRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl font-semibold text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  const stats = dashboardStats || { fleet: {}, trips: {}, incidents: {}, revenue: {} };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics & Reports</h1>
          <p className="text-gray-600 mt-1">Comprehensive insights into fleet operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-600" />
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`Rs ${stats.revenue.total_revenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          color="green"
          change="+12.5%"
          changeType="positive"
        />
        <MetricCard
          title="Active Fleet"
          value={`${stats.fleet.active_buses || 0}/${stats.fleet.total_buses || 0}`}
          icon={Bus}
          color="blue"
          change="+5.2%"
          changeType="positive"
        />
        <MetricCard
          title="Completed Trips"
          value={stats.trips.completed_trips || 0}
          icon={Activity}
          color="purple"
          change="+8.3%"
          changeType="positive"
        />
        <MetricCard
          title="Incidents Resolved"
          value={stats.incidents.total_incidents || 0}
          icon={AlertTriangle}
          color="orange"
          change="-3.1%"
          changeType="negative"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Revenue Trend</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto text-green-500 mb-3" />
              <p className="text-gray-600 font-medium">Revenue Chart</p>
              <p className="text-sm text-gray-500 mt-2">
                Install Chart.js: npm install chart.js react-chartjs-2
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600">Today</p>
              <p className="text-lg font-bold text-green-600">Rs 12.5K</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600">This Week</p>
              <p className="text-lg font-bold text-blue-600">Rs 85.2K</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600">This Month</p>
              <p className="text-lg font-bold text-purple-600">Rs 340K</p>
            </div>
          </div>
        </div>

        {/* Trip Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Trip Distribution</h3>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto text-blue-500 mb-3" />
              <p className="text-gray-600 font-medium">Pie/Doughnut Chart</p>
              <p className="text-sm text-gray-500 mt-2">Completed vs Delayed vs Cancelled</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Completed</span>
              <span className="text-lg font-bold text-green-600">
                {stats.trips.completed_trips || 0} ({((stats.trips.completed_trips / stats.trips.total_trips) * 100 || 0).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Delayed</span>
              <span className="text-lg font-bold text-orange-600">
                {stats.trips.delayed_trips || 0} ({((stats.trips.delayed_trips / stats.trips.total_trips) * 100 || 0).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">Ongoing</span>
              <span className="text-lg font-bold text-blue-600">
                {stats.trips.ongoing_trips || 0} ({((stats.trips.ongoing_trips / stats.trips.total_trips) * 100 || 0).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Route Performance */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Route className="w-5 h-5 mr-2 text-purple-600" />
            Route Performance
          </h3>
          <span className="text-sm text-gray-500">Top performing routes</span>
        </div>
        <div className="space-y-3">
          {routePerformance.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No route performance data available</p>
          ) : (
            routePerformance.map((route) => {
              const onTimePercentage = route.total_trips > 0
                ? ((route.completed_trips / route.total_trips) * 100).toFixed(1)
                : 0;

              return (
                <div
                  key={route.route_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Route className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-800">{route.route_name}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        parseFloat(onTimePercentage) >= 90
                          ? 'bg-green-100 text-green-800'
                          : parseFloat(onTimePercentage) >= 70
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {onTimePercentage}% On-Time
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Total Trips</p>
                        <p className="font-bold text-gray-800">{route.total_trips || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Completed</p>
                        <p className="font-bold text-green-600">{route.completed_trips || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Delayed</p>
                        <p className="font-bold text-orange-600">{route.delayed_trips || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Incidents</p>
                        <p className="font-bold text-red-600">{route.total_incidents || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-500">Revenue</p>
                    <p className="text-xl font-bold text-green-600">
                      Rs {(route.revenue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Incident Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Incident Statistics
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Incident Types */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4">By Incident Type</h4>
            <div className="space-y-3">
              {incidentTrends.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No incident data available</p>
              ) : (
                incidentTrends.map((incident, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        incident.type === 'Accident' ? 'bg-red-100' :
                        incident.type === 'Breakdown' ? 'bg-orange-100' :
                        incident.type === 'Emergency' ? 'bg-red-100' :
                        'bg-yellow-100'
                      }`}>
                        <AlertTriangle className={`w-5 h-5 ${
                          incident.type === 'Accident' ? 'text-red-600' :
                          incident.type === 'Breakdown' ? 'text-orange-600' :
                          incident.type === 'Emergency' ? 'text-red-600' :
                          'text-yellow-600'
                        }`} />
                      </div>
                      <span className="font-medium text-gray-800">{incident.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">{incident.count}</p>
                      <p className="text-xs text-gray-500">
                        Critical: {incident.critical_count || 0}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Severity Breakdown */}
          <div>
            <h4 className="font-medium text-gray-700 mb-4">By Severity Level</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <span className="font-medium text-gray-800">Critical</span>
                <span className="text-2xl font-bold text-red-600">
                  {stats.incidents.critical_incidents || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <span className="font-medium text-gray-800">High</span>
                <span className="text-2xl font-bold text-orange-600">
                  {incidentTrends.reduce((sum, i) => sum + (i.high_count || 0), 0)}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <span className="font-medium text-gray-800">Medium</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {incidentTrends.length > 0 ? incidentTrends.reduce((sum, i) => sum + (i.count || 0), 0) - incidentTrends.reduce((sum, i) => sum + (i.critical_count || 0) + (i.high_count || 0), 0) : 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <span className="font-medium text-gray-800">Low</span>
                <span className="text-2xl font-bold text-green-600">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Reports</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Export as PDF
          </button>
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
            Export as Excel
          </button>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Email Report
          </button>
          <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            Schedule Report
          </button>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, color, change, changeType }) => {
  const colorClasses = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change && (
          <span
            className={`text-sm font-semibold ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

export default Analytics;