import React, { useState, useEffect, useRef } from 'react';
import { QrReader } from 'react-qr-reader';
import { FaUser, FaPhone, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { eventAPI, userAPI } from '../../utils/api';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { parseQRData } from '../../utils/qrcode';
import { useLocation, useNavigate } from 'react-router-dom';

const ScanQRPage = () => {
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [checkedIn, setCheckedIn] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState(null);
  const scannerRef = useRef(null);
  const lastScannedRef = useRef('');
  const location = useLocation();
  const navigate = useNavigate();

  const playBeepAndVibrate = () => {
    //  Beep sound using Web Audio API
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
  
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1100, ctx.currentTime); // higher pitch
    gainNode.gain.setValueAtTime(0.8, ctx.currentTime); // louder
  
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
  
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.4); // longer duration
  
    // Mobile vibration (if supported)
    if (navigator.vibrate) {
      navigator.vibrate(300); // 300ms vibration
    }
  };
  
  // Fetch active event on component mount
  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        const response = await eventAPI.getActiveEvent();
        const activeEventData = response.data.data || response.data;
        setActiveEvent(activeEventData);
        
        if (!activeEventData) {
          setError('No active event found. Please contact an administrator.');
          setScanning(false);
        }
      } catch (error) {
        console.error('Error fetching active event:', error);
        setError('Failed to fetch active event. Please try again.');
        setScanning(false);
      }
    };
    
    fetchActiveEvent();
  }, []);

  const reloadPage = () => {
    navigate('/dummy');
    setTimeout(() => {
      navigate(location.pathname);
    }, 50);
  };
  
  const handleScan = async (result) => {
    if (result?.text && !loading && result.text !== lastScannedRef.current) {
      lastScannedRef.current = result.text;
  
      try {
        setLoading(true);
        setScanning(false);
  
        const phone = parseQRData(result.text);
        setPhone(phone);
  
        if (!phone) {
          throw new Error('Invalid QR code');
        }
  
        const userResponse = await userAPI.getUserByPhone(phone);
        const userData = userResponse.data.data || userResponse.data;
        console.log(userData.user);
        setUser(userData);
  
        const isCheckedIn = userData.checkIns?.some(
          checkIn => checkIn.event.toString() === activeEvent._id.toString()
        );
  
        if (isCheckedIn) {
          setCheckedIn(true);
          toast.info('User has already checked in for this event');
        } else {
          await userAPI.checkInUser(phone);
          setCheckedIn(true);
          playBeepAndVibrate(); 
// Play beep and vibrate on successful check-in
          //  Play beep sound on successful check-in
          toast.success('User checked in successfully');
        }
      } catch (error) {
        console.error('Error processing QR code:', error);
        setError(error.response?.data?.message || error.message || 'Failed to process QR code');
        toast.error(error.response?.data?.message || error.message || 'Failed to process QR code');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetScanner = () => {
    reloadPage();
    setUser(null);
    setCheckedIn(false);
    setError('');
    lastScannedRef.current = '';
    setPhone(null);
    setScanning(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
        <h1 className="text-2xl font-bold text-gray-800">Scan QR Code</h1>
        {activeEvent && (
          <p className="text-gray-600">
            Active Event: {activeEvent.name} ({formatDate(activeEvent.date)})
          </p>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">QR Code Scanner</h2>
          
          {scanning ? (
            <div className="relative">
              <QrReader
                constraints={{ facingMode: 'environment' }}
                onResult={handleScan}
                scanDelay={500}
                className="w-full max-w-md mx-auto border rounded-lg overflow-hidden"
                videoStyle={{ width: '100%', height: 'auto' }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-primary-500 rounded-lg"></div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              {loading ? (
                <div className="py-10">
                  <Loader size="xl" />
                  <p className="mt-4 text-gray-600">Processing QR code...</p>
                </div>
              ) : error ? (
                <div className="py-10">
                  <div className="text-red-500 text-5xl mb-4">
                    <FaTimesCircle className="mx-auto" />
                  </div>
                  <p className="text-red-500 mb-6">{error}</p>
                  <button
                    onClick={resetScanner}
                    className="btn btn-primary"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="py-10">
                  <div className="text-green-500 text-5xl mb-4">
                    <FaCheckCircle className="mx-auto" />
                  </div>
                  <p className="text-green-500 mb-6">QR code scanned successfully!</p>
                  <button
                    onClick={resetScanner}
                    className="btn btn-primary"
                  >
                    Scan Another
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* User Details */}
        {user && (
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4">User Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-100 text-gray-600">
                  <FaUser className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-lg font-semibold text-gray-800">{user.user.name}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-100 text-gray-600">
                  <FaPhone className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-lg font-semibold text-gray-800">{user.user.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-100 text-gray-600">
                  <FaMapMarkerAlt className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">City</p>
                  <p className="text-lg font-semibold text-gray-800">{user.user.address}</p>
                </div>
              </div>
              
              <div className="pt-4">
                <div className={`p-4 rounded-lg ${checkedIn ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  <p className={`text-lg font-semibold ${checkedIn ? 'text-green-700' : 'text-yellow-700'}`}>
                    {checkedIn ? 'Checked In' : 'Not Checked In'}
                  </p>
                  <p className={`text-sm ${checkedIn ? 'text-green-600' : 'text-yellow-600'}`}>
                    {checkedIn 
                      ? 'User has been successfully checked in for this event.'
                      : 'User has not been checked in for this event yet.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanQRPage;
