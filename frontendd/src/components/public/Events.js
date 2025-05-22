import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { toast } from 'react-toastify';

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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        Loading events...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Events</h1>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {events.map((event) => (
          <div key={event._id} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            backgroundColor: 'white'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>{event.title}</h2>
            <p style={{ marginBottom: '0.5rem' }}><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Location:</strong> {event.location}</p>
            <p style={{ marginBottom: '0.5rem' }}><strong>Price:</strong> ${event.price}</p>
            <p style={{ marginBottom: '1rem' }}>{event.description}</p>
            <button 
              onClick={() => {/* TODO: Add booking functionality */}}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events; 