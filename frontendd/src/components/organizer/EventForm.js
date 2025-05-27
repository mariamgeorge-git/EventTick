import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import './EventForm.css';

const EventForm = ({ initialData = {}, onSubmit, isEdit = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    ticketsAvailable: '',
    Price: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      const formattedDate = initialData.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : '';
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        date: formattedDate,
        location: initialData.location || '',
        ticketsAvailable: initialData.ticketsAvailable !== undefined ? String(initialData.ticketsAvailable) : '',
        Price: initialData.Price !== undefined ? String(initialData.Price) : '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.ticketsAvailable.trim()) newErrors.ticketsAvailable = 'Ticket count is required';
    if (!formData.Price.trim()) newErrors.Price = 'Price is required';

    const tickets = Number(formData.ticketsAvailable);
    if (isNaN(tickets) || tickets < 0) {
        newErrors.ticketsAvailable = 'Ticket count must be a non-negative number';
    }

    const priceValue = Number(formData.Price);
     if (isNaN(priceValue) || priceValue < 0) {
        newErrors.Price = 'Price must be a non-negative number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    const dataToSubmit = {
      ...formData,
      ticketsAvailable: Number(formData.ticketsAvailable),
      Price: Number(formData.Price) || 0,
    };

    console.log('Form Data before submit:', formData);
    console.log('Data to submit:', dataToSubmit);

    try {
      await onSubmit(dataToSubmit);
    } catch (error) {
      console.error('Form submission error:', error);
      alert(error.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelClick = () => {
    setOpenCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    setOpenCancelDialog(false);
    navigate('/my-events');
  };

  const handleCancelClose = () => {
    setOpenCancelDialog(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md event-form-container">
        <div className="mb-4 form-field">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
          {errors.title && <span style={{ color: 'red' }}>{errors.title}</span>}
        </div>
        <div className="mb-4 form-field">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          ></textarea>
          {errors.description && <span style={{ color: 'red' }}>{errors.description}</span>}
        </div>
        <div className="mb-4 form-field">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            name="date"
            id="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
          {errors.date && <span style={{ color: 'red' }}>{errors.date}</span>}
        </div>
        <div className="mb-4 form-field">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            name="location"
            id="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
          {errors.location && <span style={{ color: 'red' }}>{errors.location}</span>}
        </div>
        <div className="mb-4 form-field">
          <label htmlFor="ticketsAvailable" className="block text-sm font-medium text-gray-700 mb-1">Ticket Count</label>
          <input
            type="number"
            name="ticketsAvailable"
            id="ticketsAvailable"
            value={formData.ticketsAvailable}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
            min="0"
          />
          {errors.ticketsAvailable && <span style={{ color: 'red' }}>{errors.ticketsAvailable}</span>}
        </div>
        <div className="mb-4 form-field">
          <label htmlFor="Price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
          <input
            type="number"
            name="Price"
            id="Price"
            value={formData.Price}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
            min="0"
            step="0.01"
          />
          {errors.Price && <span style={{ color: 'red' }}>{errors.Price}</span>}
        </div>
        <div className="button-group" style={{ display: 'flex', gap: '1rem' }}>
          <button
            type="submit"
            className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : (isEdit ? 'Update Event' : 'Create Event')}
          </button>
          <button
            type="button"
            onClick={handleCancelClick}
            className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </form>

      <Dialog
        open={openCancelDialog}
        onClose={handleCancelClose}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">
          {isEdit ? 'Cancel Event Editing' : 'Cancel Event Creation'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Are you sure you want to cancel? Any unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelClose} color="primary">
            Continue Editing
          </Button>
          <Button onClick={handleCancelConfirm} color="error" autoFocus>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EventForm; 