import React, { useState } from 'react';

const BookTicketForm = ({ event, onBookingSuccess }) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const maxTickets = event.ticketsAvailable || 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (quantity < 1 || quantity > maxTickets) {
      setError(`Please select between 1 and ${maxTickets} tickets.`);
      return;
    }

    try {
      // TODO: call backend API to book tickets
      onBookingSuccess();
      alert('Booking successful!');
    } catch {
      setError('Booking failed. Please try again.');
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
        />
      </label>
      <button type="submit" disabled={maxTickets === 0}>Book Tickets</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default BookTicketForm;
// This component allows users to book tickets for an event. It includes validation for the number of tickets and handles booking submission.
// It also provides feedback on success or failure of the booking process.