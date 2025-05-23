import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './UserBookings.css';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Function to fetch user's bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/user');
      setBookings(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch bookings. Please try again later.');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to cancel a booking
  const handleCancelBooking = async (bookingId) => {
    try {
      // Check if booking can be cancelled
      const booking = bookings.find(b => b._id === bookingId);
      if (!booking) return;

      // Prevent cancelling already cancelled bookings
      if (booking.status === 'cancelled') {
        setError('This booking is already cancelled.');
        return;
      }

      // Prevent cancelling expired bookings
      const eventDate = new Date(booking.event.date);
      if (eventDate < new Date()) {
        setError('Cannot cancel bookings for past events.');
        return;
      }

      // Send cancel request to backend
      await api.put(`/bookings/${bookingId}/cancel`);
      
      // Refresh bookings list
      fetchBookings();
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
      console.error('Error cancelling booking:', err);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div>Loading your bookings...</div>;

  return (
    <div className="user-bookings">
      <h2>My Bookings</h2>
      {error && <div className="error-message">{error}</div>}
      
      {bookings.length === 0 ? (
        <p>You haven't made any bookings yet.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className={`booking-card ${booking.status}`}>
              <h3>{booking.event.title}</h3>
              <div className="booking-details">
                <p><strong>Date:</strong> {formatDate(booking.event.date)}</p>
                <p><strong>Location:</strong> {booking.event.location}</p>
                <p><strong>Tickets:</strong> {booking.numberOfTickets}</p>
                <p><strong>Total Price:</strong> ${booking.totalPrice.toFixed(2)}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                <p><strong>Booked on:</strong> {formatDate(booking.createdAt)}</p>
              </div>
              
              {booking.status !== 'cancelled' && new Date(booking.event.date) > new Date() && (
                <button 
                  onClick={() => handleCancelBooking(booking._id)}
                  className="cancel-button"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserBookings; 