import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchEvents } = useContext(AuthContext);

  useEffect(() => {
    const getEvents = async () => {
      try {
        const response = await fetchEvents();
        setEvents(response.data);
      } catch (error) {
        toast.error('Failed to fetch events');
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    getEvents();
  }, [fetchEvents]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        Loading events...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Events</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '2rem',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {(events || []).map((evt) => (
  <Link
    to={`/events/${evt._id}`}
    key={evt._id}
    style={{ textDecoration: 'none', color: 'inherit' }}
  >
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        height: '100%',
      }}
    >
      <h2 style={{ margin: 0 }}>{evt.title}</h2>
      <p>
        <strong>Date:</strong> {new Date(evt.date).toLocaleDateString()}
      </p>
      <p>
        <strong>Location:</strong> {evt.location}
      </p>
      <p>
        <strong>Time:</strong> {evt.timing || 'N/A'}
      </p>
      <p>
        <strong>Price:</strong> {evt.price !== undefined ? `$${evt.price.toFixed(2)}` : 'N/A'}
      </p>
    </div>
  </Link>
))}

      </div>
    </div>
  );
};

export default Events;
