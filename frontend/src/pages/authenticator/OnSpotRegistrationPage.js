import React, { useState, useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { eventAPI, userAPI } from '../../utils/api';
import { toast } from 'react-toastify';
import RegistrationForm from '../../components/RegistrationForm';
import QRCodeCard from '../../components/QRCodeCard';
import { downloadQRCard } from '../../utils/qrcode';
import { useNavigate,useLocation } from 'react-router-dom';

const OnSpotRegistrationPage = () => {
  const [loading, setLoading] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();


  
  // Fetch active event on component mount
  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        const response = await eventAPI.getActiveEvent();
        const activeEventData = response.data.data || response.data;
        setActiveEvent(activeEventData);
        
        if (!activeEventData) {
          setError('No active event found. Please contact an administrator.');
        }
      } catch (error) {
        console.error('Error fetching active event:', error);
        setError('Failed to fetch active event. Please try again.');
      }
    };
    
    fetchActiveEvent();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (formData) => {
    try {
      setLoading(true);
      setError('');
      
      // Register user on-spot
      const response = await userAPI.registerOnSpot(formData);
      console.log(response)
      if(response.status == 201){
        setRegisteredUser(response.data.user);
        setQrCode(response.data.qrCode);
        
        toast.success('User registered successfully');
      }else{
        toast.error('Registration failed. Please try again.');
        return 0;
        
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
        navigate('/dummy'); // go somewhere else temporarily
        setTimeout(() => {
          navigate(location.pathname); // then back to current route
        }, 50);

      setLoading(false);
    }
  };
  
  // Handle QR code download
  const handleDownload = () => {
    downloadQRCard('qr-card');
  };
  
  // Reset registration form
  const handleNewRegistration = () => {
    setRegisteredUser(null);
    setQrCode('');
  };
  
  if (!activeEvent && !loading && !error) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">No Active Event</h1>
        <p className="text-gray-500 mb-6">There is no active event at the moment. Please contact an administrator.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">On-Spot Registration</h1>
        {activeEvent && (
          <p className="text-gray-600">
            Active Event: {activeEvent.name} (
            {new Date(activeEvent.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })})
          </p>
        )}
      </div>
      
      {error && !activeEvent && (
        <div className="card p-6 text-center">
          <p className="text-red-500 mb-4">{error}</p>
        </div>
      )}
      
      {activeEvent && (
        <div className="max-w-2xl mx-auto">
          {registeredUser && qrCode ? (
            <div className="space-y-6">
              <div className="card p-6 text-center">
                <div className="text-green-500 text-5xl mb-4">
                  <FaCheckCircle className="mx-auto" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Registration Successful!
                </h2>
                <p className="text-gray-600 mb-4">
                  The user has been registered successfully. They can use the QR code below to check in at the event.
                </p>
              </div>
              
              <QRCodeCard
                user={registeredUser}
                event={activeEvent}
                qrCode={qrCode}
                onDownload={handleDownload}
                onNewRegistration={handleNewRegistration}
                newRegistrationLabel="Register Another User"
              />
            </div>
          ) : (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Register New User</h2>
              <RegistrationForm onSubmit={handleSubmit} loading={loading} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OnSpotRegistrationPage;