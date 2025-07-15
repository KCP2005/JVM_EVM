import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck, FaImage } from 'react-icons/fa';
import { eventAPI } from '../../utils/api';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    venue: '',
    time: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  
  // Fetch events
  useEffect(() => {
    fetchEvents();
  }, []);
  
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getEvents();
      setEvents(response.data.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Open modal for creating new event
  const openCreateModal = () => {
    setCurrentEvent(null);
    setFormData({
      name: '',
      description: '',
      date: '',
      venue: '',
      time: ''
    });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };
  
  // Open modal for editing event
  const openEditModal = (event) => {
    setCurrentEvent(event);
    setFormData({
      name: event.name,
      description: event.description,
      date: new Date(event.date).toISOString().split('T')[0],
      venue: event.venue,
      time: event.time
    });
    setImagePreview(event.bannerImage ? `${process.env.REACT_APP_API_URL.replace('/api', '')}${event.bannerImage}` : '');
    setShowModal(true);
  };
  
  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setCurrentEvent(null);
    setFormData({
      name: '',
      description: '',
      date: '',
      venue: '',
      time: ''
    });
    setImageFile(null);
    setImagePreview('');
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUploadLoading(true);
      
      // Create or update event
      let eventId;
      
      if (currentEvent) {
        // Update existing event
        console.log('Updating existing event with ID:', currentEvent._id);
        const response = await eventAPI.updateEvent(currentEvent._id, formData);
        console.log('Update event response:', response);
        eventId = response.data.data._id; // Access _id from data.data
        console.log('Event ID after update:', eventId);
        toast.success('Event updated successfully');
      } else {
        // Create new event
        console.log('Creating new event');
        const response = await eventAPI.createEvent(formData);
        console.log('Create event response:', response);
        eventId = response.data.data._id; // Access _id from data.data
        console.log('Event ID after creation:', eventId);
        toast.success('Event created successfully');
      }
      
      // Upload banner image if selected
      if (imageFile) {
        console.log('Preparing to upload image file:', imageFile);
        console.log('Image file details:', {
          name: imageFile.name,
          type: imageFile.type,
          size: imageFile.size + ' bytes'
        });
        
        const formData = new FormData();
        formData.append('banner', imageFile);
        
        // Log FormData (note: can't directly log the content)
        console.log('FormData created with banner file');
        
        try {
          console.log('Sending banner upload request for event ID:', eventId);
          const uploadResponse = await eventAPI.uploadBanner(eventId, formData);
          console.log('Banner upload response:', uploadResponse);
          console.log('Banner uploaded successfully');
          toast.success('Banner image uploaded successfully');
        } catch (uploadError) {
          console.error('Error uploading banner:', uploadError);
          console.error('Error details:', {
            message: uploadError.message,
            response: uploadError.response ? {
              status: uploadError.response.status,
              statusText: uploadError.response.statusText,
              data: uploadError.response.data
            } : 'No response data'
          });
          toast.error(`Failed to upload banner: ${uploadError.message}`);
        }
      }
      
      // Refresh events list
      fetchEvents();
      closeModal();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setUploadLoading(false);
    }
  };
  
  // Delete event
  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventAPI.deleteEvent(eventId);
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    }
  };
  
  // Set event as active
  const handleSetActive = async (eventId) => {
    try {
      await eventAPI.setActiveEvent(eventId);
      toast.success('Event set as active successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error setting active event:', error);
      toast.error('Failed to set active event');
    }
  };
  // Set event as deactive
  const handleSetDeactive = async (eventId) => {
    try {
      await eventAPI.setDeactiveEvent(eventId);
      toast.success('Event set as deactived successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error setting active event:', error);
      toast.error('Failed to set active event');
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="xl" />
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Event Management</h1>
        <button
          onClick={openCreateModal}
          className="btn btn-primary flex items-center"
        >
          <FaPlus className="mr-2" />
          Create Event
        </button>
      </div>
      
      {/* Events List */}
      <div className="grid grid-cols-1 gap-6">
        {events.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-gray-500">No events found. Create your first event!</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event._id} className="card p-6">
              <div className="flex flex-col md:flex-row">
                {/* Event Banner */}
                <div className="w-full md:w-1/4 mb-4 md:mb-0 md:mr-6">
                  {event.bannerImage ? (
                    <img 
                      src={`${process.env.REACT_APP_API_URL.replace('/api', '')}${event.bannerImage}`} 
                      alt={event.name}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FaImage className="text-gray-400 text-4xl" />
                    </div>
                  )}
                </div>
                
                {/* Event Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {event.name}
                        {event.isActive && (
                          <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        )}
                      </h2>
                      <p className="text-gray-600 mt-1">{formatDate(event.date)} • {event.time}</p>
                      <p className="text-gray-600 mt-1">{event.venue}</p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {!event.isActive ? (
                        <button
                          onClick={() => handleSetActive(event._id)}
                          className="btn btn-sm btn-outline flex items-center"
                          title="Set as Active"
                        >
                          <FaCheck className="mr-1" />
                          Set Active
                        </button>
                      ):(
                        <button
                          onClick={() => handleSetDeactive(event._id)}
                          className="btn btn-sm btn-outline flex items-center"
                          title="Set as Active"
                        >
                          <FaCheck className="mr-1" />
                          De-Active
                        </button>
                      )}
                      <button
                        onClick={() => openEditModal(event)}
                        className="btn btn-sm btn-outline flex items-center"
                        title="Edit Event"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="btn btn-sm btn-outline btn-danger flex items-center"
                        title="Delete Event"
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mt-4">{event.description}</p>
                  
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <div className="mr-6">
                      <span className="font-medium">{event.registeredUsers?.length || 0}</span> Registrations
                    </div>
                    <div>
                      <span className="font-medium">{event.checkedInUsers?.length || 0}</span> Check-ins
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Create/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {currentEvent ? 'Edit Event' : 'Create New Event'}
                </h3>
                
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="space-y-4">
                    {/* Event Name */}
                    <div>
                      <label htmlFor="name" className="label">Event Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="input"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    {/* Event Description */}
                    <div>
                      <label htmlFor="description" className="label">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        className="input"
                        value={formData.description}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                    
                    {/* Event Date */}
                    <div>
                      <label htmlFor="date" className="label">Date</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        className="input"
                        value={formData.date}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    {/* Event Time */}
                    <div>
                      <label htmlFor="time" className="label">Time</label>
                      <input
                        type="text"
                        id="time"
                        name="time"
                        className="input"
                        placeholder="e.g. 10:00 AM - 4:00 PM"
                        value={formData.time}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    {/* Event Venue */}
                    <div>
                      <label htmlFor="venue" className="label">Venue</label>
                      <input
                        type="text"
                        id="venue"
                        name="venue"
                        className="input"
                        value={formData.venue}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    {/* Banner Image */}
                    <div>
                      <label className="label">Banner Image</label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="file"
                          id="banner"
                          name="banner"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="banner"
                          className="btn btn-outline flex items-center cursor-pointer"
                        >
                          <FaImage className="mr-2" />
                          {imagePreview ? 'Change Image' : 'Upload Image'}
                        </label>
                      </div>
                      
                      {imagePreview && (
                        <div className="mt-3">
                          <img
                            src={imagePreview}
                            alt="Banner Preview"
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={uploadLoading}
                    >
                      {uploadLoading ? <Loader size="sm" color="white" /> : (currentEvent ? 'Update Event' : 'Create Event')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;