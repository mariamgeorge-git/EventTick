import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../components/auth/AuthContext';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './MyEventsPage.css';

const MyEventsPage = () => {
  const { fetchMyEvents, deleteEvent } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const organizerEvents = await fetchMyEvents();
        setEvents(organizerEvents);
      } catch (err) {
        setError(err.message || 'Failed to load your events');
        toast.error('Failed to load your events.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [fetchMyEvents]);

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        // TODO: Implement delete functionality
        console.log('Attempting to delete event with ID:', eventId);
        await deleteEvent(eventId);
        toast.success('Event deleted successfully!');
        // Remove the deleted event from the state
        setEvents(events.filter(event => event._id !== eventId));
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error(error.message || 'Failed to delete event.');
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading your events...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</div>;
  }

  return (
    <div className="my-events-container">
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>My Events</h1>
      <div className="create-event-link-container">
        <Link to="/create-event" className="create-event-button">
          Create New Event
        </Link>
        <Link to="/my-events/analytics" className="view-analytics-button">
          View Analytics
        </Link>
      </div>

      {events.length === 0 ? (
        <p>You haven't created any events yet.</p>
      ) : (
        <ul className="event-list">
          {events.map(event => (
            <li key={event._id} className="event-item">
              <div className="event-details">
                <h2 className="text-lg font-semibold">{event.title}</h2>
                <p className="text-sm text-gray-600">Date: {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</p>
                <p className="text-sm text-gray-600">Location: {event.location}</p>
                <p className="text-sm text-gray-600">Price: ${event.Price ? event.Price.toFixed(2) : 'N/A'}</p>
              </div>
              <div className="event-actions">
                <Link to={`/events/${event._id}`} className="view-link">View</Link>
                <Link to={`/edit-event/${event._id}`} className="edit-link">Edit</Link>
                <button onClick={() => handleDeleteEvent(event._id)} className="delete-button">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyEventsPage; 