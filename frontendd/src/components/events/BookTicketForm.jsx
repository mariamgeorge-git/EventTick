import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './BookTicketForm.css';

const BookTicketForm = ({ event, onBookingSuccess }) => {
  const navigate = useNavigate();
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
      const response = await api.post('/bookings', {
        eventId: event._id,         
        numberOfTickets: quantity,  
      });
      
      // Show success notification
      const message = `Successfully booked ${quantity} ${quantity === 1 ? 'ticket' : 'tickets'} for $${totalPrice.toFixed(2)}!`;
      toast.success(message);
      
      // Call the success callback if provided
      if (onBookingSuccess) {
        onBookingSuccess();
      }
      
      // Redirect to User Bookings page after a short delay
      setTimeout(() => {
        navigate('/bookings');
      }, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Booking failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle quantity changes with validation
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    // Only allow numbers and empty string
    if (value === '' || /^\d+$/.test(value)) {
      const numValue = value === '' ? '' : parseInt(value, 10);
      setQuantity(numValue);
      
      // Clear any existing error if the new value is valid
      if (value === '' || (numValue > 0 && numValue <= maxTickets)) {
        setError('');
      }
    }
  };

  // Handle increment button click
  const incrementQuantity = () => {
    const newValue = Math.min((quantity || 0) + 1, maxTickets);
    setQuantity(newValue);
    setError('');
  };

  // Handle decrement button click
  const decrementQuantity = () => {
    const newValue = Math.max((quantity || 1) - 1, 1);
    setQuantity(newValue);
    setError('');
  };

  // Handle blur to ensure value is within bounds
  const handleBlur = () => {
    if (quantity === '') {
      setQuantity(1);
    } else if (quantity < 1) {
      setQuantity(1);
    } else if (quantity > maxTickets) {
      setQuantity(maxTickets);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ticket-booking-form">
      <div className="form-group">
        <label htmlFor="ticket-quantity">
          Number of Tickets {maxTickets > 0 ? `(max ${maxTickets})` : ''}:
        </label>
        <div className="input-with-buttons">
          <button 
            type="button" 
            className="quantity-button"
            onClick={decrementQuantity}
            disabled={loading || maxTickets === 0 || quantity <= 1}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <div className="input-with-icon">
            <i className="fas fa-ticket-alt filter-icon"></i>
            <input
              type="number"
              id="ticket-quantity"
              min="1"
              max={maxTickets}
              value={quantity}
              onChange={handleQuantityChange}
              onBlur={handleBlur}
              className="ticket-input"
              disabled={loading || maxTickets === 0}
              required
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby={error ? 'quantity-error' : undefined}
            />
          </div>
          <button 
            type="button" 
            className="quantity-button"
            onClick={incrementQuantity}
            disabled={loading || maxTickets === 0 || quantity >= maxTickets}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        {error && (
          <p id="quantity-error" className="error-message">
            {error}
          </p>
        )}
      </div>

      <div className="price-summary">
        <p className="total-price">
          Total: <span>${totalPrice.toFixed(2)}</span>
        </p>
      </div>

      <button 
        type="submit" 
        className="book-button"
        disabled={maxTickets === 0 || loading}
      >
        {loading ? 'Processing...' : 'Book Now'}
      </button>

      {error && <p className="error-message">{error}</p>}
    </form>
  );

};

export default BookTicketForm;
