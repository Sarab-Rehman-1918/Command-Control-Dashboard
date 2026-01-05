import React, { useState, useEffect } from 'react';
import { Map, Bus, MapPin, RefreshCw, Navigation } from 'lucide-react';
import { buses } from '../api';

const LiveMap = () => {
  const [busLocations, setBusLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchBusLocations();
    
    // Auto-refresh every 10 seconds
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchBusLocations();
      }, 10000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const fetchBusLocations = async () => {
    try {
      const response = await buses.getLocations();
      setBusLocations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bus locations:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ongoing':
        return 'bg-green-500';
      case 'Delayed':
        return 'bg-orange-500';
      case 'Completed':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusDotColor = (status) => {
    switch (status) {
      case 'Ongoing':
        return 'bg-green-400';
      case 'Delayed':
        return 'bg-orange-400';
      case 'Completed':
        return 'bg-blue-400';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Live Fleet Tracking</h1>
          <p className="text-gray-600 mt-1">Real-time GPS monitoring of all buses</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
              autoRefresh
                ? 'bg-green-100 text-green-700 border border-green-300'
                : 'bg-gray-100 text-gray-700 border border-gray-300'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
          </button>
          <button
            onClick={fetchBusLocations}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Refresh Now
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-96 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative">
          {/* Map Placeholder - Replace with actual map library */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Map className="w-24 h-24 mx-auto text-blue-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Interactive Map View
              </h3>
              <p className="text-gray-500 mb-4">
                Integrate with Leaflet or Google Maps for live tracking
              </p>
              <div className="bg-white p-4 rounded-lg shadow-md inline-block">
                <p className="text-sm text-gray-600 mb-2">Quick Setup:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                  npm install react-leaflet leaflet
                </code>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg">
            <h4 className="font-semibold text-sm mb-2">Status Legend</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs">Ongoing</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-xs">Delayed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-xs">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bus List Below Map */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Active Buses ({busLocations.length})</h3>
            {loading && (
              <span className="text-sm text-gray-500">Updating...</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {busLocations.map((bus) => (
              <div
                key={`${bus.bus_id}-${bus.trip_id}`}
                onClick={() => setSelectedBus(bus)}
                className={`p-4 bg-white rounded-lg border-2 cursor-pointer transition transform hover:scale-105 hover:shadow-lg ${
                  selectedBus?.bus_id === bus.bus_id
                    ? 'border-blue-500 shadow-md'
                    : 'border-gray-200'
                }`}
              >
                {/* Status Indicator */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Bus className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-gray-800">Bus {bus.bus_id}</span>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusDotColor(bus.trip_status)} animate-pulse`}></div>
                </div>

                {/* Status Badge */}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(
                    bus.trip_status
                  )} mb-2`}
                >
                  {bus.trip_status || 'Unknown'}
                </span>

                {/* Route Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Navigation className="w-4 h-4 mr-2" />
                    <span className="font-medium">{bus.route_name || 'No Route'}</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-start text-gray-500">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-xs">
                      {/* <div>Lat: {bus.latitude?.toFixed(6)}</div> */}
                      {/* <div>Lng: {bus.longitude?.toFixed(6)}</div> */}
                      <div>Lat: {Number(bus.latitude).toFixed(6)}</div>
                      <div>Lng: {Number(bus.longitude).toFixed(6)}</div>

                    </div>
                  </div>

                  {/* Trip ID */}
                  <div className="text-xs text-gray-400 border-t pt-2">
                    Trip ID: #{bus.trip_id}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {busLocations.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <Bus className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No active buses found</p>
              <p className="text-sm">Buses will appear here once they start their trips</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Bus Details */}
      {selectedBus && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Bus {selectedBus.bus_id} Details</h3>
            <button
              onClick={() => setSelectedBus(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Trip ID</p>
              <p className="text-lg font-bold text-blue-600">#{selectedBus.trip_id}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="text-lg font-bold text-green-600">{selectedBus.trip_status}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Route</p>
              <p className="text-lg font-bold text-purple-600">{selectedBus.route_name}</p>
            </div>
          </div>
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Current Location</p>
            <p className="font-mono text-sm">
              {selectedBus.latitude?.toFixed(6)}, {selectedBus.longitude?.toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMap;