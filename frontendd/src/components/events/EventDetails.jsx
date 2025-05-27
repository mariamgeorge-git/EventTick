import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import BookTicketForm from './BookTicketForm';
import { Button, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const { fetchEventById, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        console.log('Fetching event with ID:', id);
        
        if (!id) {
          throw new Error('No event ID provided');
        }

        const response = await fetchEventById(id);
        console.log('Raw API response:', response);

        if (!response) {
          throw new Error('No response received from API');
        }

        // Check if response is the event data directly or if it's nested in data property
        const eventData = response.data || response;
        console.log('Processed event data:', eventData);

        if (!eventData) {
          throw new Error('No event data in response');
        }

        setEvent(eventData);
        setError(null);
      } catch (err) {
        console.error('Error loading event:', err);
        setError(err.message || 'Failed to load event details');
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, fetchEventById]);

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'Price not available';
    return `$${Number(price).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="event-loading">
        <p className="text-lg">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-error-message">
        <p>{error}</p>
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          Return to Events
        </Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-container">
        <p className="text-lg mb-4">Event not found</p>
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          Return to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="event-details-container">
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
      </Box>
      <div className="event-details-card">
        <h1 className="event-details-title">{event.title}</h1>
        
        <div className="event-details-grid">
          <div className="event-details-section">
            <p className="event-detail-item">
              <span className="event-detail-label">Date:</span>{' '}
              <span className="event-detail-value">{new Date(event.date).toLocaleString()}</span>
            </p>
            <p className="event-detail-item">
              <span className="event-detail-label">Location:</span>{' '}
              <span className="event-detail-value">{event.location}</span>
            </p>
            <p className="event-detail-item">
              <span className="event-detail-label">Price:</span>{' '}
              <span className="event-detail-value">{formatPrice(event.Price)}</span>
            </p>
            {event.ticketsAvailable !== undefined && (
              <p className="event-detail-item">
                <span className="event-detail-label">Tickets Available:</span>{' '}
                <span className="event-detail-value">{event.ticketsAvailable}</span>
              </p>
            )}
          </div>
          
          <div className="event-details-section">
            <h2 className="event-details-section h2">Description</h2>
            <p className="event-description">{event.description}</p>
          </div>
        </div>

        {user && user.role === 'standard_user' ? (
          <BookTicketForm 
            event={event} 
            onBookingSuccess={() => {
              // The success message is now handled in BookTicketForm
              // This callback can be used for additional actions if needed
            }} 
          />
        ) : (
          <div className="event-booking-section">
            <p className="text-center">
              Please{' '}
              {user ? (
                'log in with a standard user account'
              ) : (
                <Link to="/login" className="text-blue-500 hover:text-blue-700">
                  log in
                </Link>
              )}{' '}
              to book tickets.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
