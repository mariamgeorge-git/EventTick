import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import { Link, useSearchParams } from 'react-router-dom';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchEvents } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

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

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = events.filter(event =>
      event.title.toLowerCase().includes(lowerCaseQuery) ||
      event.location.toLowerCase().includes(lowerCaseQuery) ||
      (event.description && event.description.toLowerCase().includes(lowerCaseQuery))
    );
    setFilteredEvents(filtered);
  }, [events, searchQuery]);

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
    <div style={{ padding: '1rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Events</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '2rem',
          maxWidth: '1000px',
          margin: '0 auto',
        }}
      >
        {(filteredEvents || []).map((evt) => (
  <Link
    to={`/events/${evt._id}`}
    key={evt._id}
    style={{ textDecoration: 'none', color: 'inherit' }}
  >
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '0.75rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        backgroundColor: 'white',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
        height: '100%',
        fontSize: '0.9rem',
      }}
    >
      <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{evt.title}</h2>
      <p>
        <strong>Date:</strong> {new Date(evt.date).toLocaleDateString()}
      </p>
      <p>
        <strong>Location:</strong> {evt.location}
      </p>
      <p>
        <strong>Price:</strong> {evt.Price !== undefined ? `$${evt.Price.toFixed(2)}` : 'N/A'}
      </p>
    </div>
  </Link>
))}

      </div>
    </div>
  );
};

export default Events;
