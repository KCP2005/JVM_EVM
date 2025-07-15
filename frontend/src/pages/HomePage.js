import React, { useState, useEffect } from 'react';
import { eventAPI, userAPI } from '../utils/api';
import { downloadQRCard } from '../utils/qrcode';
import { toast } from 'react-toastify';
import QRCodeCard from '../components/QRCodeCard';
import RegistrationForm from '../components/RegistrationForm';
import EventInfo from '../components/EventInfo';
import Loader from '../components/common/Loader';

const HomePage = () => {
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [showQRCard, setShowQRCard] = useState(false);
  
  // Fetch active event on component mount
  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        setLoading(true);
        const response = await eventAPI.getActiveEvent();
        
        if (response.data.success) {
          // Handle both response structures
          const eventData = response.data.data || response.data;
          setActiveEvent(eventData);
        } else {
          setError('No active event found');
        }
      } catch (error) {
        console.error('Error fetching active event:', error);
        setError('Failed to load event. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveEvent();
  }, []);
  
  // Handle form submission
  const handleRegister = async (formData) => {
    try {
      setLoading(true);
      const response = await userAPI.registerUser(formData);
      
      if (response.data.success) {
        // Handle both response structures
        const responseData = response.data.data || response.data;
        const { user, qrCode } = responseData;
        setRegisteredUser(user);
        setQrCode(qrCode);
        setShowQRCard(true);
        toast.success('Registration successful!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Check if user is already registered
      if (error.response?.data?.isRegistered) {
        // Fetch user QR code
        try {
          const userResponse = await userAPI.getUserByPhone(formData.phone);
          if (userResponse.data.success) {
            // Handle both response structures
            const responseData = userResponse.data.data || userResponse.data;
            const { user, qrCode } = responseData;
            setRegisteredUser(null);
            setQrCode(null);
            setShowQRCard(false);
            handleNewRegistration();
            toast.info('You are already registered.');
          }
        } catch (userError) {
          toast.error('Failed to retrieve your registration. Please try again.');
        }
      } else {
        toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle QR code download
  const handleDownloadQR = () => {
    downloadQRCard('qr-card', `event-qr-${registeredUser.phone}.png`)
      .then(success => {
        if (success) {
          toast.success('QR code downloaded successfully!');
        } else {
          toast.error('Failed to download QR code. Please try again.');
        }
      });
  };
  
  // Reset registration form
  const handleNewRegistration = () => {
    setRegisteredUser(null);
    setQrCode(null);
    setShowQRCard(false);
  };
  
  if (loading && !activeEvent) {
    return <Loader />;
  }
  
  if (error && !activeEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Active Event</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-gray-500">Please check back later for upcoming events.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Event Banner */}
      <div className="relative h-64 md:h-80 bg-primary-700 overflow-hidden">
        {activeEvent?.bannerImage ? (
          <img 
            src={`${process.env.REACT_APP_API_URL.replace('/api', '')}${activeEvent.bannerImage}`} 
            alt={activeEvent.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Error loading banner image:', e);
              e.target.onerror = null;
              e.target.src = '';
              e.target.style.display = 'none';
              e.target.parentElement.classList.add('bg-gradient-to-r', 'from-primary-600', 'to-secondary-600', 'flex', 'items-center', 'justify-center');
              const titleElement = document.createElement('h1');
              titleElement.className = 'text-3xl md:text-4xl font-bold text-white px-4 text-center';
              titleElement.textContent = activeEvent?.name || 'Event Registration';
              e.target.parentElement.appendChild(titleElement);
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-600 to-secondary-600 flex items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-white px-4 text-center">
              {activeEvent?.name || 'Event Registration'}
            </h1>
          </div>
        )}
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Event Information */}
          <div>
            <EventInfo event={activeEvent} />
          </div>
          
          {/* Registration Form or QR Card */}
          <div>
            {showQRCard ? (
              <div className="animate-fade-in">
                <QRCodeCard 
                  user={registeredUser} 
                  event={activeEvent} 
                  qrCode={qrCode} 
                  onDownload={handleDownloadQR}
                  onNewRegistration={handleNewRegistration}
                />
              </div>
            ) : (
              <div className="card p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">Register for Event</h2>
                <RegistrationForm onSubmit={handleRegister} loading={loading} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;