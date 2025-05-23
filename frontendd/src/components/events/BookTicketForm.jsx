import React, { useState } from 'react';
import api from '../../services/api';

const BookTicketForm = ({ event, onBookingSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
     
  const maxTickets = event.ticketsAvailable || 0;
  const pricePerTicket = event.Price || 0;
  const totalPrice = quantity * pricePerTicket;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (quantity < 1 || quantity > maxTickets) {
      setError(`Please select between 1 and ${maxTickets} tickets.`);
      return;
    }
    console.log('Event:', event);
    console.log('Event received in BookTicketForm:', event);
    console.log('Event price:', event.price);


    setLoading(true);
    try {
      await api.post('/bookings', {
       eventId: event._id,         
        numberOfTickets: quantity,  
     });
      onBookingSuccess();  // To refresh data in parent
      alert(`Booking successful! Total price: $${totalPrice.toFixed(2)}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
  <form onSubmit={handleSubmit}>
    <label>
      Tickets (max {maxTickets}):
      <input
        type="number"
        min="1"
        max={maxTickets}
        value={quantity}
        onChange={e => setQuantity(Number(e.target.value))}
        required
        disabled={loading}
      />
    </label>

    {/* Put the total price display here */}
    <p>Total Price: ${totalPrice.toFixed(2)}</p>

    <button type="submit" disabled={maxTickets === 0 || loading}>
      {loading ? 'Booking...' : 'Book Tickets'}
    </button>

    {error && <p style={{ color: 'red' }}>{error}</p>}
  </form>
  );

};

export default BookTicketForm;
