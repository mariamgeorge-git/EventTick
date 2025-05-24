import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import { Link, useSearchParams } from 'react-router-dom';
import './Events.css';
import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchEvents } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [filterDate, setFilterDate] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

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
    const lowerCaseLocationFilter = filterLocation.toLowerCase();

    const filtered = events.filter(event => {
      const eventDate = new Date(event.date);
      const filterDateObj = filterDate ? new Date(filterDate) : null;

      const matchesSearch = 
        event.title.toLowerCase().includes(lowerCaseQuery) ||
        event.location.toLowerCase().includes(lowerCaseQuery) ||
        (event.description && event.description.toLowerCase().includes(lowerCaseQuery));

      const matchesDate = filterDate ? eventDate.toDateString() === filterDateObj.toDateString() : true;

      const matchesLocation = filterLocation ? event.location.toLowerCase().includes(lowerCaseLocationFilter) : true;

      return matchesSearch && matchesDate && matchesLocation;
    });
    setFilteredEvents(filtered);
  }, [events, searchQuery, filterDate, filterLocation]);

  if (loading) {
    return (
      <div
        className="loading-container"
      >
        Loading events...
      </div>
    );
  }

  return (
    <div className="events-container">
      <h1 className="events-title">Events</h1>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-input-group">
          <label htmlFor="date-filter">Date:</label>
          <div className="input-with-icon">
            <FaCalendarAlt className="filter-icon" />
            <input 
              id="date-filter"
              type="date" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)} 
            />
          </div>
        </div>
        <div className="filter-input-group">
          <label htmlFor="location-filter">Location:</label>
          <div className="input-with-icon">
            <FaMapMarkerAlt className="filter-icon" />
            <input 
              id="location-filter"
              type="text" 
              placeholder="Enter Location" 
              value={filterLocation} 
              onChange={(e) => setFilterLocation(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div
        className="events-grid"
      >
        {(filteredEvents || []).map((evt) => (
  <Link
    to={`/events/${evt._id}`}
    key={evt._id}
    className="event-link"
  >
    <div
      className="event-card"
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
      <Link to={`/events/${evt._id}`} className="view-details-button">
        View Details
      </Link>
    </div>
  </Link>
))}

      </div>
    </div>
  );
};

export default Events;
