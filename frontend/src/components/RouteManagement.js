import React, { useState, useEffect } from 'react';
//import { Route as RouteIcon, Plus, Edit, Trash2, MapPin, Navigation, TrendingUp, X, Check } from 'lucide-react';
import { Plus, Edit, Trash2, MapPin, Navigation, TrendingUp, X, Check } from "lucide-react"; //RouteIcon,
import { routes } from '../api';
import { RouteIcon } from "lucide-react";


const RouteManagement = ({ user: currentUser }) => {
  const [routesList, setRoutesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [formData, setFormData] = useState({
    route_name: '',
    start_point: '',
    end_point: '',
    total_distance: ''
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await routes.getAll();
      setRoutesList(response.data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = () => {
    setModalMode('add');
    setFormData({
      route_name: '',
      start_point: '',
      end_point: '',
      total_distance: ''
    });
    setShowModal(true);
  };

  const handleEditRoute = (route) => {
    setModalMode('edit');
    setSelectedRoute(route);
    setFormData({
      route_name: route.route_name,
      start_point: route.start_point,
      end_point: route.end_point,
      total_distance: route.total_distance
    });
    setShowModal(true);
  };

  const handleDeleteRoute = async (routeId) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await routes.delete(routeId);
        fetchRoutes();
        alert('Route deleted successfully!');
      } catch (error) {
        console.error('Error deleting route:', error);
        alert('Failed to delete route');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'add') {
        await routes.create(formData);
        alert('Route added successfully!');
      } else {
        await routes.update(selectedRoute.route_id, formData);
        alert('Route updated successfully!');
      }
      setShowModal(false);
      fetchRoutes();
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Failed to save route');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl font-semibold text-gray-600">Loading routes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Route Management</h1>
          <p className="text-gray-600 mt-1">Manage all bus routes and their details</p>
        </div>
        {currentUser?.role === 'Admin' && (
          <button
            onClick={handleAddRoute}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Route
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Routes</p>
              <p className="text-2xl font-bold text-gray-800">{routesList.length}</p>
            </div>
            <RouteIcon className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Distance</p>
              <p className="text-2xl font-bold text-green-600">
                {routesList.reduce((sum, r) => sum + parseFloat(r.total_distance || 0), 0).toFixed(1)} km
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Distance</p>
              <p className="text-2xl font-bold text-purple-600">
                {routesList.length > 0
                  ? (routesList.reduce((sum, r) => sum + parseFloat(r.total_distance || 0), 0) / routesList.length).toFixed(1)
                  : 0}{' '}
                km
              </p>
            </div>
            <Navigation className="w-10 h-10 text-purple-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Routes</p>
              <p className="text-2xl font-bold text-orange-600">{routesList.length}</p>
            </div>
            <MapPin className="w-10 h-10 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routesList.map((route) => (
          <div
            key={route.route_id}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <RouteIcon className="w-6 h-6 text-white" />
                  <h3 className="text-lg font-bold text-white">{route.route_name}</h3>
                </div>
                <span className="bg-white bg-opacity-30 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  ID: {route.route_id}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Start Point */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Start Point</p>
                  <p className="text-sm font-semibold text-gray-800">{route.start_point}</p>
                </div>
              </div>

              {/* Distance Indicator */}
              <div className="flex items-center justify-center">
                <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                <div className="px-3 py-1 bg-blue-50 rounded-full">
                  <p className="text-xs font-bold text-blue-600">
                    {route.total_distance} km
                  </p>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
              </div>

              {/* End Point */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">End Point</p>
                  <p className="text-sm font-semibold text-gray-800">{route.end_point}</p>
                </div>
              </div>

              {/* Actions */}
              {currentUser?.role === 'Admin' && (
                <div className="flex space-x-2 pt-4 border-t">
                  <button
                    onClick={() => handleEditRoute(route)}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-medium">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteRoute(route.route_id)}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {routesList.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <RouteIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No routes found</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first route</p>
          {currentUser?.role === 'Admin' && (
            <button
              onClick={handleAddRoute}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Route
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalMode === 'add' ? 'Add New Route' : 'Edit Route'}
              </h2>
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
                  Route Name
                </label>
                <input
                  type="text"
                  value={formData.route_name}
                  onChange={(e) => setFormData({ ...formData, route_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Route 101"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Point
                </label>
                <input
                  type="text"
                  value={formData.start_point}
                  onChange={(e) => setFormData({ ...formData, start_point: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., UET Lahore"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Point
                </label>
                <input
                  type="text"
                  value={formData.end_point}
                  onChange={(e) => setFormData({ ...formData, end_point: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Gaddafi Stadium"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Distance (km)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.total_distance}
                  onChange={(e) => setFormData({ ...formData, total_distance: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12.5"
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {modalMode === 'add' ? 'Add Route' : 'Update Route'}
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

export default RouteManagement;