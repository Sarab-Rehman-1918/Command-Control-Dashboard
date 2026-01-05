import React, { useState, useEffect } from 'react';
import { Bus, Plus, Edit, Trash2, MapPin, Activity, Clock } from 'lucide-react';
import { buses } from '../api';

const FleetManagement = ({ user }) => {
  const [busLocations, setBusLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBusLocations();
  }, []);

  const fetchBusLocations = async () => {
    try {
      const response = await buses.getLocations();
      setBusLocations(response.data);
    } catch (error) {
      console.error('Error fetching bus locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ongoing':
        return 'bg-green-100 text-green-800';
      case 'Delayed':
        return 'bg-orange-100 text-orange-800';
      case 'Completed':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBuses = filterStatus === 'all' 
    ? busLocations 
    : busLocations.filter(bus => bus.trip_status?.toLowerCase() === filterStatus.toLowerCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl font-semibold text-gray-600">Loading fleet data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Fleet Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all buses in real-time</p>
        </div>
        {user?.role === 'Admin' && (
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center shadow-lg">
            <Plus className="w-5 h-5 mr-2" />
            Add Bus
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Buses</p>
              <p className="text-2xl font-bold text-gray-800">{busLocations.length}</p>
            </div>
            <Bus className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {busLocations.filter(b => b.trip_status === 'Ongoing').length}
              </p>
            </div>
            <Activity className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Delayed</p>
              <p className="text-2xl font-bold text-orange-600">
                {busLocations.filter(b => b.trip_status === 'Delayed').length}
              </p>
            </div>
            <Clock className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-blue-600">
                {busLocations.filter(b => b.trip_status === 'Completed').length}
              </p>
            </div>
            <Bus className="w-10 h-10 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({busLocations.length})
          </button>
          <button
            onClick={() => setFilterStatus('ongoing')}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === 'ongoing'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Ongoing
          </button>
          <button
            onClick={() => setFilterStatus('delayed')}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === 'delayed'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Delayed
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bus ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                {user?.role === 'Admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBuses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No buses found
                  </td>
                </tr>
              ) : (
                filteredBuses.map((bus) => (
                  <tr key={`${bus.bus_id}-${bus.trip_id}`} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Bus className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium text-gray-900">Bus {bus.bus_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      #{bus.trip_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {bus.route_name || 'Unknown Route'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          bus.trip_status
                        )}`}
                      >
                        {bus.trip_status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {bus.latitude?.toFixed(4)}, {bus.longitude?.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {bus.recorded_at
                        ? new Date(bus.recorded_at).toLocaleString()
                        : 'N/A'}
                    </td>
                    {user?.role === 'Admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setSelectedBus(bus)}
                            className="text-blue-600 hover:text-blue-800 transition"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FleetManagement;