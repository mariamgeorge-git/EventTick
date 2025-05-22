import React, { useContext, useEffect, useState } from 'react';
import EventCard from './EventCard';
import { AuthContext } from '../auth/AuthContext';

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { fetchEvents } = useContext(AuthContext);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await fetchEvents();
        if (response && response.data) {
          setEvents(response.data.data || []);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error('Error loading events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [fetchEvents]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg">No events found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(event => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
};

export default EventList;
// This component fetches and displays a list of events using the EventCard component.