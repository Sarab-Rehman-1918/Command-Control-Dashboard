import React, { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Edit, Trash2, X, Check, Filter, Clock, Bus } from 'lucide-react';
import { incidents, trips } from '../api';

const IncidentManagement = ({ user: currentUser }) => {
  const [incidentsList, setIncidentsList] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [formData, setFormData] = useState({
    trip_id: '',
    bus_id: '',
    type: 'Breakdown',
    severity: 'Medium',
    status: 'Open'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [incidentsRes, tripsRes] = await Promise.all([
        incidents.getAll(),
        trips.getAll()
      ]);
      setIncidentsList(incidentsRes.data);
      setTripsList(tripsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIncident = () => {
    setModalMode('add');
    setFormData({
      trip_id: '',
      bus_id: '',
      type: 'Breakdown',
      severity: 'Medium',
      status: 'Open'
    });
    setShowModal(true);
  };

  const handleEditIncident = (incident) => {
    setModalMode('edit');
    setSelectedIncident(incident);
    setFormData({
      trip_id: incident.trip_id,
      bus_id: incident.bus_id,
      type: incident.type,
      severity: incident.severity,
      status: incident.status
    });
    setShowModal(true);
  };

  const handleDeleteIncident = async (incidentId) => {
    if (window.confirm('Are you sure you want to delete this incident?')) {
      try {
        await incidents.delete(incidentId);
        fetchData();
        alert('Incident deleted successfully!');
      } catch (error) {
        console.error('Error deleting incident:', error);
        alert('Failed to delete incident');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'add') {
        await incidents.create(formData);
        alert('Incident reported successfully!');
      } else {
        await incidents.update(selectedIncident.incident_id, formData);
        alert('Incident updated successfully!');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving incident:', error);
      alert('Failed to save incident');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-red-100 text-red-800';
      case 'Investigating':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredIncidents = incidentsList.filter((incident) => {
    const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
    const matchesSeverity = filterSeverity === 'all' || incident.severity === filterSeverity;
    return matchesStatus && matchesSeverity;
  });

  const stats = {
    total: incidentsList.length,
    open: incidentsList.filter(i => i.status === 'Open').length,
    investigating: incidentsList.filter(i => i.status === 'Investigating').length,
    resolved: incidentsList.filter(i => i.status === 'Resolved').length,
    critical: incidentsList.filter(i => i.severity === 'Critical').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl font-semibold text-gray-600">Loading incidents...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Incident Management</h1>
          <p className="text-gray-600 mt-1">Track and resolve fleet incidents in real-time</p>
        </div>
        <button
          onClick={handleAddIncident}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition flex items-center shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Report Incident
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Incidents</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-gray-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Open</p>
              <p className="text-2xl font-bold text-red-600">{stats.open}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Investigating</p>
              <p className="text-2xl font-bold text-blue-600">{stats.investigating}</p>
            </div>
            <Clock className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <Check className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical</p>
              <p className="text-2xl font-bold text-red-700">{stats.critical}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-6">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('Open')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filterStatus === 'Open' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilterStatus('Investigating')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filterStatus === 'Investigating' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Investigating
            </button>
            <button
              onClick={() => setFilterStatus('Resolved')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filterStatus === 'Resolved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Resolved
            </button>
          </div>

          {/* Severity Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Severity:</span>
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filterSeverity === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterSeverity('Critical')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filterSeverity === 'Critical' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setFilterSeverity('High')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filterSeverity === 'High' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              High
            </button>
            <button
              onClick={() => setFilterSeverity('Medium')}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                filterSeverity === 'Medium' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Medium
            </button>
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-4">
        {filteredIncidents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertTriangle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No incidents found</h3>
            <p className="text-gray-600">No incidents match your current filters</p>
          </div>
        ) : (
          filteredIncidents.map((incident) => (
            <div
              key={incident.incident_id}
              className={`bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden border-l-4 ${
                incident.severity === 'Critical' ? 'border-red-600' :
                incident.severity === 'High' ? 'border-orange-500' :
                incident.severity === 'Medium' ? 'border-yellow-500' : 'border-green-500'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <AlertTriangle className={`w-6 h-6 ${
                        incident.severity === 'Critical' ? 'text-red-600' :
                        incident.severity === 'High' ? 'text-orange-500' :
                        'text-yellow-500'
                      }`} />
                      <h3 className="text-xl font-bold text-gray-800">{incident.type}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(incident.status)}`}>
                        {incident.status}
                      </span>
                    </div>

                    {/* Incident Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium">Incident ID</p>
                        <p className="text-sm font-bold text-gray-800">#{incident.incident_id}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium flex items-center">
                          <Bus className="w-3 h-3 mr-1" />
                          Bus ID
                        </p>
                        <p className="text-sm font-bold text-gray-800">Bus {incident.bus_id}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium">Trip ID</p>
                        <p className="text-sm font-bold text-gray-800">#{incident.trip_id}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium">Route</p>
                        <p className="text-sm font-bold text-gray-800">{incident.route_name || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {currentUser?.role === 'Admin' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditIncident(incident)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteIncident(incident.incident_id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalMode === 'add' ? 'Report New Incident' : 'Update Incident'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip ID
                  </label>
                  <select
                    value={formData.trip_id}
                    onChange={(e) => setFormData({ ...formData, trip_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Trip</option>
                    {tripsList.map((trip) => (
                      <option key={trip.trip_id} value={trip.trip_id}>
                        Trip #{trip.trip_id} - {trip.route_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bus ID
                  </label>
                  <input
                    type="number"
                    value={formData.bus_id}
                    onChange={(e) => setFormData({ ...formData, bus_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter bus ID"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Breakdown">Breakdown</option>
                  <option value="Accident">Accident</option>
                  <option value="Delay">Delay</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Open">Open</option>
                    <option value="Investigating">Investigating</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {modalMode === 'add' ? 'Report Incident' : 'Update Incident'}
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

export default IncidentManagement;