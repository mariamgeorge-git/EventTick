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
        setEvents(response.data.data);  // Adjust if your API response shape is different
      } catch {
        setError('Failed to load events.');
      } finally {
        setLoading(false);
      }
    };
   loadEvents();
  }, [fetchEvents]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!events.length) return <p>No events found.</p>;

  return (
    <div>
      {events.map(event => <EventCard key={event._id} event={event} />)}
    </div>
  );
};

export default EventList;
// This component fetches and displays a list of events using the EventCard component.