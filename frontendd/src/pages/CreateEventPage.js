import React, { useContext, useState } from 'react';
import { AuthContext } from '../components/auth/AuthContext';
import EventForm from '../components/organizer/EventForm';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CreateEventPage = () => {
  const { createEvent } = useContext(AuthContext);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (eventData) => {
    setSubmitting(true);
    try {
      await createEvent(eventData);
      toast.success('Event created successfully!');
      navigate('/my-events'); // Redirect to a page showing organizer's events
    } catch (error) {
      toast.error(error.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create New Event</h1>
      <EventForm onSubmit={handleSubmit} />
    </div>
  );
};

export default CreateEventPage; 