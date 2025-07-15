import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserCheck, FaQrcode, FaUserPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { eventAPI, statsAPI, userAPI } from '../../utils/api';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const AuthenticatorDashboard = () => {
  const [activeEvent, setActiveEvent] = useState(null);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    totalCheckins: 0,
    checkinRate: 0,
    recentCheckins: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const authUserId = localStorage.getItem('authUserId');
        if (!authUserId) {
          toast.error("Authenticated user not found in session.");
          return;
        }
  
        const eventResponse = await eventAPI.getActiveEvent();
        const activeEventData = eventResponse.data.data || eventResponse.data;
        setActiveEvent(activeEventData);
  
        if (activeEventData) {
          const statsResponse = await statsAPI.getDashboardStats();
          const usersResponse = await userAPI.getUsers();
          const users = usersResponse.data.data || usersResponse.data;
  
          // ✅ Filter users who checked in to the current event AND were authenticated by this user
          const checkedInUsers = users.filter(user =>
            user.checkIns?.some(checkIn =>
              checkIn.event.toString() === activeEventData._id.toString() &&
              checkIn.authenticatedBy?.toString() === authUserId
            )
          );
  
          const recentCheckins = checkedInUsers
            .map(user => {
              const checkIn = user.checkIns.find(checkIn =>
                checkIn.event.toString() === activeEventData._id.toString() &&
                checkIn.authenticatedBy?.toString() === authUserId
              );
              return {
                user,
                checkInTime: new Date(checkIn.checkInTime)
              };
            })
            .sort((a, b) => b.checkInTime - a.checkInTime)
            .slice(0, 5);
  
          setStats({
            totalRegistrations: statsResponse.data.data.registration.total || 0,
            totalCheckins: statsResponse.data.data.registration.checkedIn || 0,
            checkinRate: statsResponse.data.data.registration.checkInPercentage || 0,
            recentCheckins
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="xl" />
      </div>
    );
  }

  if (!activeEvent) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">No Active Event</h1>
        <p className="text-gray-500 mb-6">There is no active event at the moment. Please contact an administrator.</p>
      </div>
    );
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
          Welcome, Authenticator
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          Active Event: {activeEvent.name} ({formatDate(activeEvent.date)})
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link to="/authenticator/scan" className="card p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <FaQrcode className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">Scan QR Code</h2>
              <p className="text-xs sm:text-sm text-gray-600">Check in users by scanning their QR code</p>
            </div>
          </div>
        </Link>

        <Link to="/authenticator/register" className="card p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-secondary-100 text-secondary-600">
              <FaUserPlus className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800">On-Spot Registration</h2>
              <p className="text-xs sm:text-sm text-gray-600">Register new users on the spot</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaUsers className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Registrations</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-800">{stats.totalRegistrations}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaUserCheck className="h-6 w-6" />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Check-ins</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-800">{stats.totalCheckins}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <div className="h-6 w-6 flex items-center justify-center font-bold text-sm">%</div>
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Check-in Rate</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-800">{stats.checkinRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="card p-4 sm:p-6 overflow-x-auto">
        <h2 className="text-lg font-semibold mb-4">Recent Check-ins</h2>

        {stats.recentCheckins.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent check-ins</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">City</th>
                <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Check-in Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentCheckins.map((checkIn, index) => (
                <tr key={index}>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap break-words">{checkIn.user.name}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap break-words">{checkIn.user.phone}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap break-words">{checkIn.user.address}</td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap break-words">{formatTime(checkIn.user.checkIns[0].timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AuthenticatorDashboard;
