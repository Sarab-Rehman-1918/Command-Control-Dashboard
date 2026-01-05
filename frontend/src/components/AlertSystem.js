import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, X, Check, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { alerts, incidents } from '../api';

const AlertSystem = ({ user: currentUser }) => {
  const [alertsList, setAlertsList] = useState([]);
  const [incidentsList, setIncidentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    incident_id: '',
    alert_type: 'System',
    message: '',
    recipient_role: 'Operations Manager'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [alertsRes, incidentsRes] = await Promise.all([
        alerts.getAll(),
        incidents.getAll()
      ]);
      setAlertsList(alertsRes.data);
      setIncidentsList(incidentsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlert = () => {
    setFormData({
      incident_id: '',
      alert_type: 'System',
      message: '',
      recipient_role: 'Operations Manager'
    });
    setShowModal(true);
  };

  const handleDeleteAlert = async (alertId) => {
    if (window.confirm('Are you sure you want to delete this alert?')) {
      try {
        await alerts.delete(alertId);
        fetchData();
        alert('Alert deleted successfully!');
      } catch (error) {
        console.error('Error deleting alert:', error);
        alert('Failed to delete alert');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await alerts.create(formData);
      alert('Alert created successfully!');
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating alert:', error);
      alert('Failed to create alert');
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'Emergency':
        return AlertTriangle;
      case 'Warning':
        return AlertCircle;
      case 'System':
      case 'Info':
      default:
        return Info;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'Emergency':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          badge: 'bg-red-100 text-red-800'
        };
      case 'Warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          icon: 'text-yellow-600',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'System':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          badge: 'bg-blue-100 text-blue-800'
        };
      case 'Info':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          badge: 'bg-green-100 text-green-800'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          icon: 'text-gray-600',
          badge: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const filteredAlerts = filterType === 'all'
    ? alertsList
    : alertsList.filter(alert => alert.alert_type === filterType);

  const stats = {
    total: alertsList.length,
    emergency: alertsList.filter(a => a.alert_type === 'Emergency').length,
    warning: alertsList.filter(a => a.alert_type === 'Warning').length,
    system: alertsList.filter(a => a.alert_type === 'System').length,
    info: alertsList.filter(a => a.alert_type === 'Info').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl font-semibold text-gray-600">Loading alerts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Alert System</h1>
          <p className="text-gray-600 mt-1">Monitor and manage system alerts and notifications</p>
        </div>
        {currentUser?.role === 'Admin' && (
          <button
            onClick={handleCreateAlert}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Alert
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Bell className="w-10 h-10 text-gray-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Emergency</p>
              <p className="text-2xl font-bold text-red-600">{stats.emergency}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Warning</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.warning}</p>
            </div>
            <AlertCircle className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">System</p>
              <p className="text-2xl font-bold text-blue-600">{stats.system}</p>
            </div>
            <Info className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Info</p>
              <p className="text-2xl font-bold text-green-600">{stats.info}</p>
            </div>
            <Info className="w-10 h-10 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700">Filter by type:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilterType('Emergency')}
            className={`px-4 py-2 rounded-lg transition ${
              filterType === 'Emergency'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Emergency
          </button>
          <button
            onClick={() => setFilterType('Warning')}
            className={`px-4 py-2 rounded-lg transition ${
              filterType === 'Warning'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Warning
          </button>
          <button
            onClick={() => setFilterType('System')}
            className={`px-4 py-2 rounded-lg transition ${
              filterType === 'System'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            System
          </button>
          <button
            onClick={() => setFilterType('Info')}
            className={`px-4 py-2 rounded-lg transition ${
              filterType === 'Info'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Info
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No alerts found</h3>
            <p className="text-gray-600">There are no alerts matching your current filter</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const colors = getAlertColor(alert.alert_type);
            const Icon = getAlertIcon(alert.alert_type);

            return (
              <div
                key={alert.alert_id}
                className={`${colors.bg} border-2 ${colors.border} rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden`}
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full ${colors.bg} border-2 ${colors.border} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${colors.icon}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
                            {alert.alert_type}
                          </span>
                          <span className="px-3 py-1 bg-white rounded-full text-xs font-semibold text-gray-700 border">
                            ID: #{alert.alert_id}
                          </span>
                        </div>
                        {currentUser?.role === 'Admin' && (
                          <button
                            onClick={() => handleDeleteAlert(alert.alert_id)}
                            className="text-red-600 hover:text-red-800 transition p-2 hover:bg-white rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>

                      {/* Alert Message */}
                      <p className="text-gray-800 font-medium text-lg mb-3">
                        {alert.message}
                      </p>

                      {/* Alert Details */}
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Recipient:</span>
                          <span className="font-semibold text-gray-700 bg-white px-3 py-1 rounded-full">
                            {alert.recipient_role}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Incident ID:</span>
                          <span className="font-semibold text-gray-700 bg-white px-3 py-1 rounded-full">
                            #{alert.incident_id}
                          </span>
                        </div>
                        {alert.severity && (
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">Severity:</span>
                            <span className={`font-semibold px-3 py-1 rounded-full ${
                              alert.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                              alert.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {alert.severity}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Create New Alert</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident
                </label>
                <select
                  value={formData.incident_id}
                  onChange={(e) => setFormData({ ...formData, incident_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Incident</option>
                  {incidentsList.map((incident) => (
                    <option key={incident.incident_id} value={incident.incident_id}>
                      #{incident.incident_id} - {incident.type} (Bus {incident.bus_id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Type
                </label>
                <select
                  value={formData.alert_type}
                  onChange={(e) => setFormData({ ...formData, alert_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="System">System</option>
                  <option value="Warning">Warning</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Info">Info</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter alert message..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipient Role
                </label>
                <select
                  value={formData.recipient_role}
                  onChange={(e) => setFormData({ ...formData, recipient_role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Operations Manager">Operations Manager</option>
                  <option value="Control Center">Control Center</option>
                  <option value="Admin">Admin</option>
                  <option value="Dispatcher">Dispatcher</option>
                  <option value="Driver">Driver</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Create Alert
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertSystem;