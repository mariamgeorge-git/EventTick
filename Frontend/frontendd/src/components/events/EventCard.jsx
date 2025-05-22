import React from 'react';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/events/${event._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: '1rem',
        marginBottom: '1rem',
        cursor: 'pointer',
        userSelect: 'none',
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleCardClick();
      }}
    >
      <h3 style={{ marginBottom: '0.5rem' }}>{event.title}</h3>
      <p style={{ marginBottom: '0.25rem' }}>
        <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
      </p>
      <p style={{ marginBottom: '0.25rem' }}>
        <strong>Location:</strong> {event.location}
      </p>
      <p style={{ marginBottom: '0.25rem' }}>
        <strong>Time:</strong> {event.timing || 'N/A'}
      </p>
      <p style={{ marginBottom: 0 }}>
        <strong>Price:</strong> ${event.price.toFixed(2)}
      </p>
    </div>
  );
};

export default EventCard;
