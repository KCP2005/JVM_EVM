import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, FaQrcode } from 'react-icons/fa';

const EventInfo = ({ event }) => {
  if (!event) return null;
  
  // Format date
  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="card p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6">{event.name}</h2>
      
      {event.description && (
        <div className="mb-6">
          <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Date */}
        <div className="flex items-start">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <FaCalendarAlt className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Date & Time</h3>
            <p className="mt-1 text-sm text-gray-600">
              {formatDate(event.date)}
              {event.time && <span> at {event.time}</span>}
            </p>
          </div>
        </div>
        
        {/* Location */}
        <div className="flex items-start">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <FaMapMarkerAlt className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Location</h3>
            <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{event.venue}</p>
          </div>
        </div>
        
        {/* Additional Info */}
        {event.additionalInfo && (
          <div className="flex items-start">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
              <FaInfoCircle className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Additional Information</h3>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{event.additionalInfo}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Retrieve QR Code Link */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center">
          <FaQrcode className="h-5 w-5 text-primary-600 mr-2" />
          <span className="text-sm text-gray-700">Already registered?</span>
        </div>
        <Link 
          to="/retrieve" 
          className="mt-2 inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-800"
        >
          Retrieve your QR code
        </Link>
      </div>
    </div>
  );
};

export default EventInfo;