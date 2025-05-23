import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const BookingDetails = ({ bookingId }) => {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch {
        setError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) return <p>Loading booking details...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!booking) return <p>No booking found.</p>;

  return (
    <div>
      <h3>Booking Details for {booking.eventName}</h3>
      <p><strong>Quantity:</strong> {booking.quantity}</p>
      <p><strong>Price per Ticket:</strong> ${booking.price}</p>
      <p><strong>Total Price:</strong> ${(booking.quantity * booking.price).toFixed(2)}</p>
      <p><strong>Status:</strong> {booking.status}</p>
      <p><strong>Booked On:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
      {/* Add more details as needed */}
    </div>
  );
};

export default BookingDetails;
