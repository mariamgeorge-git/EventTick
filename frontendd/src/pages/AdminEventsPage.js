import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../components/auth/AuthContext';
import { toast } from 'react-toastify';
import './AdminEventsPage.css'; // Import the CSS file

const AdminEventsPage = () => {
  const { fetchAllEventsAsAdmin, updateEventStatus } = useContext(AuthContext); // Fetch AuthContext functions

  const [allEvents, setAllEvents] = useState([]); // Store all fetched events
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'approved', 'pending', 'declined'

  // Fetch events on component mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const eventsData = await fetchAllEventsAsAdmin(); 
        setAllEvents(eventsData);
      } catch (err) {
        setError(err.message || 'Failed to load events');
        toast.error('Failed to load events.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [fetchAllEventsAsAdmin]); // Dependency array includes fetchAllEventsAsAdmin

  // Filter events based on the current filter state
  const filteredEvents = allEvents.filter(event => {
    if (filter === 'all') return true;
    return event.status === filter;
  });

  // Handle Approve and Decline actions
  const handleStatusChange = async (eventId, status) => {
    try {
      await updateEventStatus(eventId, status);
      // Update the status of the event in the local state
      setAllEvents(allEvents.map(event => event._id === eventId ? { ...event, status } : event));
      toast.success(`Event ${status} successfully!`);
    } catch (error) {
      toast.error(error.message || `Failed to ${status} event.`);
    }
  };

  if (loading) {
    return <div className="admin-events-container">Loading events...</div>;{/* Apply container class */}
  }

  if (error) {
    return <div className="admin-events-container" style={{ color: 'red' }}>{error}</div>;{/* Apply container class */}
  }

  return (
    <div className="admin-events-container"> {/* Apply container class */}
      <h1>Manage All Events</h1> {/* Apply heading style from CSS */}

      <div className="filter-buttons"> {/* Apply filter button container class */}
        <button onClick={() => setFilter('all')} className={filter === 'all' ? 'active' : ''}>All</button>
        <button onClick={() => setFilter('pending')} className={filter === 'pending' ? 'active' : ''}>Pending</button>
        <button onClick={() => setFilter('approved')} className={filter === 'approved' ? 'active' : ''}>Approved</button>
        <button onClick={() => setFilter('cancelled')} className={filter === 'cancelled' ? 'active' : ''}>Cancelled</button>
      </div>

      {filteredEvents.length === 0 ? (
        <p>No events found with the selected filter.</p>
      ) : (
        <table className="events-table"> {/* Apply table class */}
          <thead>
            <tr>
              <th>Title</th>
              <th>Organizer</th>{/* Assuming organizer name is available */}
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map(event => (
              <tr key={event._id}>
                <td>{event.title}</td>
                <td>{event.organizer?.name || 'N/A'}</td> {/* Access organizer name */}
                <td>{event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</td>
                <td>{event.status}</td>
                <td className="actions-cell"> {/* Apply actions cell class */}
                  {event.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusChange(event._id, 'approved')} className="approve-button">Approve</button>
                      <button onClick={() => handleStatusChange(event._id, 'cancelled')} className="decline-button">Decline</button>
                    </>
                  )}
                   {event.status === 'approved' && (
                    <button onClick={() => handleStatusChange(event._id, 'cancelled')} className="decline-button">Decline</button>
                  )}
                   {event.status === 'cancelled' && (
                    <button onClick={() => handleStatusChange(event._id, 'approved')} className="approve-button">Approve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
};

export default AdminEventsPage; 