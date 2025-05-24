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
        setBooking(res.data.data);
        console.log('Fetched booking details:', res.data);
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

  console.log('Rendering booking details for:', booking);
  console.log('Booking event details:', booking.event);

  return (
    <div>
      <h3>Booking Details for {booking.event?.title}</h3>
      <p><strong>Quantity:</strong> {booking.numberOfTickets}</p>
      <p><strong>Price per Ticket:</strong> ${booking.event?.price ? booking.event.price.toFixed(2) : 'N/A'}</p>
      <p><strong>Total Price:</strong> ${booking.totalPrice?.toFixed(2)}</p>
      <p><strong>Status:</strong> {booking.status}</p>
      <p><strong>Booked On:</strong> {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'Invalid Date'}</p>
      {/* Add more details as needed */}
    </div>
  );
};

export default BookingDetails;
