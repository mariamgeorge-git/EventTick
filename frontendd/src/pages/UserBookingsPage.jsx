import React from 'react';
import UserBookings from '../components/bookings/UserBookings';
import './UserBookingsPage.css';

const UserBookingsPage = () => {
  return (
    <div className="user-bookings-page">
      <div className="container">
        <UserBookings />
      </div>
    </div>
  );
};

export default UserBookingsPage;
