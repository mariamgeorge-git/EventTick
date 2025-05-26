import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Simulate fetching notifications from backend
  useEffect(() => {
    // This would be replaced with actual API calls
    const fetchNotifications = async () => {
      try {
        // Simulated notifications
        const mockNotifications = [
          {
            id: 1,
            title: 'New Event',
            message: 'Amr Diab concert tickets are now available!',
            type: 'event',
            read: false,
            timestamp: new Date(),
          },
          {
            id: 2,
            title: 'Booking Confirmed',
            message: 'Your booking for Mohamed Ramadan concert has been confirmed.',
            type: 'booking',
            read: false,
            timestamp: new Date(),
          },
          {
            id: 3,
            title: 'Special Offer',
            message: 'Get 20% off on your next booking!',
            type: 'offer',
            read: false,
            timestamp: new Date(),
          },
        ];
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      read: false,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
    toast.info(notification.message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const removeNotification = (notificationId) => {
    setNotifications(prevNotifications =>
      prevNotifications.filter(notification => notification.id !== notificationId)
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}; 