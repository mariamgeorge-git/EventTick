import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../components/auth/AuthContext';
import EventForm from '../components/organizer/EventForm';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditEventPage = () => {
  const { id } = useParams();
  const { fetchEventById, updateEvent } = useContext(AuthContext);
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        const eventData = await fetchEventById(id);
        setEvent(eventData);
      } catch (err) {
        setError(err.message || 'Failed to load event');
        toast.error('Failed to load event for editing.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEvent();
    } else {
      setError('No event ID provided for editing.');
      setLoading(false);
    }
  }, [id, fetchEventById]);

  const handleSubmit = async (eventData) => {
    setSubmitting(true);
    try {
      await updateEvent(id, eventData);
      toast.success('Event updated successfully!');
      navigate('/my-events'); // Redirect after update
    } catch (error) {
      toast.error(error.message || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading event for editing...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</div>;
  }

  if (!event) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Event not found for editing.</div>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Edit Event</h1>
      <EventForm initialData={event} onSubmit={handleSubmit} isEdit={true} />
    </div>
  );
};

export default EditEventPage; 