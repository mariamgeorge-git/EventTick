import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import BookTicketForm from './BookTicketForm';

const EventDetails = () => {
  const { id } = useParams();
  console.log('Event ID from URL:', id);

  const { fetchEventById, user } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      console.log('No ID provided');
      return;
    }
    
    const loadEvent = async () => {
      try {
        console.log('Fetching event with ID:', id);
        const response = await fetchEventById(id);
        console.log('Raw API response:', response);
        
        if (!response) {
          console.error('No response received from API');
          setError('Event not found.');
          setEvent(null);
        } else {
          // The response is already the event data since fetchEventById returns res.data
          setEvent(response);
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError(`Failed to load event details: ${err.message}`);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, fetchEventById]);

  if (loading) return <p>Loading event details...</p>;
  if (error) return <p>{error}</p>;
  if (!event) return <p>Event not found.</p>;

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'Price not available';
    return `$${Number(price).toFixed(2)}`;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: 'auto' }}>
      <h1>{event.title}</h1>
      <p><strong>Date:</strong> {new Date(event.date).toLocaleString()}</p>
      <p><strong>Location:</strong> {event.location}</p>
      <p><strong>Price:</strong> {formatPrice(event.price)}</p>
      <p><strong>Description:</strong> {event.description}</p>
      {event.timing && <p><strong>Timing:</strong> {event.timing}</p>}

      {user ? (
        <BookTicketForm event={event} onBookingSuccess={() => alert('Thanks for booking!')} />
      ) : (
        <p>Please <a href="/login">log in</a> to book tickets.</p>
      )}
    </div>
  );
};

export default EventDetails;
