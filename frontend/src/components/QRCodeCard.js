import React from 'react';
import {
  FaDownload,
  FaUserAlt,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaLocationArrow,
} from 'react-icons/fa';

const QRCodeCard = ({
  user,
  event,
  qrCode,
  onDownload,
  onNewRegistration,
  newRegistrationLabel = 'New Registration',
}) => {
  if (!user || !event || !qrCode) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="card overflow-hidden border rounded-xl shadow-lg">
      <div id="qr-card" className="qr-card">
        {/* Banner */}
        <div className="w-full h-40 overflow-hidden">
          {event.bannerImage ? (
            <img
              src={`${process.env.REACT_APP_API_URL.replace('/api', '')}${event.bannerImage}`}
              alt={event.name}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary-600 to-secondary-600" />
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-800 text-center">{event.name}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="flex items-center">
              <FaCalendarAlt className="text-primary-500 mr-2" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center">
              <FaLocationArrow className="text-primary-500 mr-2" />
              <span>{event.venue}</span>
            </div>
          </div>

          <div className="text-gray-700">
            <div className="flex items-center mb-2">
              <FaUserAlt className="text-gray-500 mr-2" />
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex items-center mb-2">
              <FaPhone className="text-gray-500 mr-2" />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-gray-500 mr-2" />
              <span>{user.address}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center pt-4">
            <img src={qrCode} alt="QR Code" className="w-40 h-40 object-contain" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
        <button
          onClick={onDownload}
          className="btn btn-primary flex items-center justify-center w-full sm:w-auto"
        >
          <FaDownload className="mr-2" />
          Download QR Card
        </button>

        <button
          onClick={onNewRegistration}
          className="btn btn-outline w-full sm:w-auto"
        >
          {newRegistrationLabel}
        </button>
      </div>
    </div>
  );
};

export default QRCodeCard;
