const updateEventStatus = async (eventId, status) => {
  console.log('updateEventStatus - ID:', eventId);
  console.log('updateEventStatus - Status:', status);
  try {
    // Use the dedicated status update endpoint
    const res = await api.put(`/events/${eventId}/status`, { status }); 
    console.log('updateEventStatus - API Response:', res);
    return res.data;
  } catch (error) {
    console.error('updateEventStatus - Error:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || `Failed to update event status.`);
    } else if (error.request) {
      throw new Error('No response from server. Please check your connection.');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}; 