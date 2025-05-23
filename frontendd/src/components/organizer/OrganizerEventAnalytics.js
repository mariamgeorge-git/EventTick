import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OrganizerEventAnalytics = () => {
  const { fetchMyEventAnalytics } = useContext(AuthContext);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        const data = await fetchMyEventAnalytics();
        setAnalyticsData(data);
      } catch (err) {
        setError(err.message || 'Failed to load event analytics');
        toast.error('Failed to load event analytics.');
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [fetchMyEventAnalytics]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading analytics...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', padding: '2rem' }}>{error}</div>;
  }

  if (analyticsData.length === 0) {
    return <p>No analytics data available for your events.</p>;
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Event Analytics</h1>
      
      {/* Display Bar Chart */}
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={analyticsData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="eventName" />{/* Assuming backend returns eventName */}
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ticketsSold" fill="#8884d8" name="Tickets Sold" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Optional: Display raw data as well */}
      {/* <div>
        <h2>Raw Analytics Data:</h2>
        <pre>{JSON.stringify(analyticsData, null, 2)}</pre>
      </div> */}
    </div>
  );
};

export default OrganizerEventAnalytics; 