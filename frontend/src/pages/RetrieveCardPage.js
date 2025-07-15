import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../utils/api';
import { downloadQRCard } from '../utils/qrcode';
import { toast } from 'react-toastify';
import QRCodeCard from '../components/QRCodeCard';
import Loader from '../components/common/Loader';

const RetrieveCardPage = () => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [event, setEvent] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phone || phone.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    try {
      setLoading(true);
      const response = await userAPI.getUserByPhone(phone);
      
      if (response.data.success) {
        const { user, event, qrCode } = response.data.data;
        setUser(user);
        setEvent(event);
        setQrCode(qrCode);
        toast.success('QR code retrieved successfully!');
      }
    } catch (error) {
      console.error('Error retrieving QR code:', error);
      toast.error(error.response?.data?.message || 'Failed to retrieve QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle QR code download
  const handleDownloadQR = () => {
    downloadQRCard('qr-card', `event-qr-${user.phone}.png`)
      .then(success => {
        if (success) {
          toast.success('QR code downloaded successfully!');
        } else {
          toast.error('Failed to download QR code. Please try again.');
        }
      });
  };
  
  // Reset form
  const handleReset = () => {
    setPhone('');
    setUser(null);
    setEvent(null);
    setQrCode(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Retrieve Your QR Code</h1>
          <p className="text-gray-600">Enter your phone number to get your event QR code</p>
        </div>
        
        {!user ? (
          <div className="card p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="phone" className="label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  className="input"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? <Loader size="sm" /> : 'Retrieve QR Code'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <Link to="/" className="text-primary-600 hover:text-primary-800 font-medium">
                Back to Registration
              </Link>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <QRCodeCard 
              user={user} 
              event={event} 
              qrCode={qrCode} 
              onDownload={handleDownloadQR}
              onNewRegistration={handleReset}
              newRegistrationLabel="Retrieve Another"
            />
            
            <div className="mt-6 text-center">
              <Link to="/" className="text-primary-600 hover:text-primary-800 font-medium">
                Back to Registration
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RetrieveCardPage;