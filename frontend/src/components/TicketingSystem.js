import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Edit, Trash2, X, Check, CreditCard, DollarSign, User, Calendar } from 'lucide-react';
import { tickets, trips } from '../api';

const TicketingSystem = ({ user: currentUser }) => {
  const [ticketsList, setTicketsList] = useState([]);
  const [tripsList, setTripsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    trip_id: '',
    seat_number: '',
    price: '',
    status: 'Booked'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsRes, tripsRes] = await Promise.all([
        tickets.getAll(),
        trips.getAll()
      ]);
      setTicketsList(ticketsRes.data);
      setTripsList(tripsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTicket = () => {
    setModalMode('add');
    setFormData({
      user_id: '',
      trip_id: '',
      seat_number: '',
      price: '',
      status: 'Booked'
    });
    setShowModal(true);
  };

  const handleEditTicket = (ticket) => {
    setModalMode('edit');
    setSelectedTicket(ticket);
    setFormData({
      user_id: ticket.user_id,
      trip_id: ticket.trip_id,
      seat_number: ticket.seat_number,
      price: ticket.price,
      status: ticket.status
    });
    setShowModal(true);
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await tickets.delete(ticketId);
        fetchData();
        alert('Ticket deleted successfully!');
      } catch (error) {
        console.error('Error deleting ticket:', error);
        alert('Failed to delete ticket');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'add') {
        await tickets.create(formData);
        alert('Ticket created successfully!');
      } else {
        await tickets.update(selectedTicket.ticket_id, formData);
        alert('Ticket updated successfully!');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving ticket:', error);
      alert('Failed to save ticket');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Booked':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'Completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredTickets = filterStatus === 'all'
    ? ticketsList
    : ticketsList.filter(ticket => ticket.status === filterStatus);

  const stats = {
    total: ticketsList.length,
    booked: ticketsList.filter(t => t.status === 'Booked').length,
    cancelled: ticketsList.filter(t => t.status === 'Cancelled').length,
    completed: ticketsList.filter(t => t.status === 'Completed').length,
    revenue: ticketsList
      .filter(t => t.status === 'Booked' || t.status === 'Completed')
      .reduce((sum, t) => sum + parseFloat(t.price || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-xl font-semibold text-gray-600">Loading tickets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Ticketing System</h1>
          <p className="text-gray-600 mt-1">Manage passenger bookings and tickets</p>
        </div>
        {currentUser?.role === 'Admin' && (
          <button
            onClick={handleAddTicket}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Ticket
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Ticket className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Booked</p>
              <p className="text-2xl font-bold text-green-600">{stats.booked}</p>
            </div>
            <Check className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
            </div>
            <X className="w-10 h-10 text-red-500" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">
                Rs {stats.revenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-purple-500" />
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
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus('Booked')}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === 'Booked'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Booked
          </button>
          <button
            onClick={() => setFilterStatus('Completed')}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === 'Completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setFilterStatus('Cancelled')}
            className={`px-4 py-2 rounded-lg transition ${
              filterStatus === 'Cancelled'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip / Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {currentUser?.role === 'Admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No tickets found
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.ticket_id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Ticket className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium text-gray-900">#{ticket.ticket_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">User #{ticket.user_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          Trip #{ticket.trip_id}
                        </div>
                        <div className="text-gray-500">
                          {ticket.route_name || 'Unknown Route'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        {ticket.seat_number}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                        <span className="font-semibold text-gray-800">
                          Rs {parseFloat(ticket.price).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    {currentUser?.role === 'Admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleEditTicket(ticket)}
                            className="text-blue-600 hover:text-blue-800 transition"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTicket(ticket.ticket_id)}
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

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {modalMode === 'add' ? 'Create New Ticket' : 'Edit Ticket'}
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
                    User ID
                  </label>
                  <input
                    type="number"
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter user ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seat Number
                  </label>
                  <input
                    type="text"
                    value={formData.seat_number}
                    onChange={(e) => setFormData({ ...formData, seat_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (Rs)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="50.00"
                    required
                  />
                </div>
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
                  <option value="Booked">Booked</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                >
                  <Check className="w-5 h-5 mr-2" />
                  {modalMode === 'add' ? 'Create Ticket' : 'Update Ticket'}
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

export default TicketingSystem;