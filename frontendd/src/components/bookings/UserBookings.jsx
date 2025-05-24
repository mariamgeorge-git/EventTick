import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './UserBookings.css';
import BookingDetails from './BookingDetails';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  // Fetch bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  // Function to fetch user's bookings
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/bookings');
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
      await api.delete(`/bookings/${bookingId}`);
      
      // Refresh bookings list
      fetchBookings();
      
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
      console.error('Error cancelling booking:', err);
    }
  };

  // Function to open the booking details modal
  const handleViewDetails = (bookingId) => {
    setSelectedBookingId(bookingId);
  };

  // Function to close the booking details modal
  const handleCloseModal = () => {
    setSelectedBookingId(null);
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
      <h1>My Bookings</h1>
      {error && <div className="error-message">{error}</div>}
      
      {bookings.length === 0 ? (
        <p>You haven't made any bookings yet.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div 
              key={booking._id} 
              className={`booking-card ${booking.status}`}
              onClick={() => handleViewDetails(booking._id)}
            >
              <h3>{booking.event.title}</h3>
              <div className="booking-details">
                <p><strong>Tickets:</strong> {booking.numberOfTickets}</p>
                <p><strong>Total Price:</strong> ${booking.totalPrice?.toFixed(2)}</p>
              </div>
              
              {booking.status !== 'cancelled' && new Date(booking.event.date) > new Date() && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelBooking(booking._id);
                  }}
                  className="cancel-button"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBookingId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>×</button>
            <BookingDetails bookingId={selectedBookingId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookings; 