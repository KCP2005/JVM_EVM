import React, { useEffect, useState } from 'react';
import { FaUsers, FaCalendarCheck, FaUserCheck, FaPercentage } from 'react-icons/fa';
import { eventAPI, statsAPI } from '../../utils/api';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch active event
        const eventResponse = await eventAPI.getActiveEvent();
        console.log('Active Event Response:', eventResponse);
        
        if (!eventResponse.data || !eventResponse.data.data) {
          console.error('No active event data found');
          setLoading(false);
          return;
        }
        
        setActiveEvent(eventResponse.data.data);
        
        // Fetch dashboard stats
        const statsResponse = await statsAPI.getDashboardStats();
        console.log('Dashboard Stats Response:', statsResponse);
        setStats(statsResponse.data);
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
        <p className="text-gray-500 mb-6">Please activate an event to view dashboard statistics.</p>
      </div>
    );
  }
  
  // Prepare gender chart data
  const genderData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        data: [
          stats?.data?.gender?.male || 0,
          stats?.data?.gender?.female || 0,
          stats?.data?.gender?.other || 0
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare chart data for registration method
  const registrationData = {
    labels: ['Self Registration', 'On-spot Registration', 'Admin Registration'],
    datasets: [
      {
        data: [
          stats?.data?.registrationMethod?.self || 0,
          stats?.data?.registrationMethod?.onSpot || 0,
          stats?.data?.registrationMethod?.admin || 0
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare chart data for city distribution
  const cityLabels = stats?.data?.topCities?.map(city => city.city) || [];
  const cityData = {
    labels: cityLabels,
    datasets: [
      {
        label: 'Registrations by City',
        data: stats?.data?.topCities?.map(city => city.count) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // City chart options
  const cityChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Registrations by City',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Dashboard: {activeEvent?.name || 'No Active Event'}
        </h1>
        {activeEvent?.date && (
          <p className="text-gray-600">
            {new Date(activeEvent.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        )}
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Registrations */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaUsers className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Registrations</p>
              <p className="text-2xl font-semibold text-gray-800">{stats?.data?.registration?.total || 0}</p>
            </div>
          </div>
        </div>
        
        {/* Total Check-ins */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaUserCheck className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Check-ins</p>
              <p className="text-2xl font-semibold text-gray-800">{stats?.data?.registration?.checkedIn || 0}</p>
            </div>
          </div>
        </div>
        
        {/* Check-in Rate */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaPercentage className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Check-in Rate</p>
              <p className="text-2xl font-semibold text-gray-800">
                {stats?.data?.registration?.checkInPercentage || 0}%
              </p>
            </div>
          </div>
        </div>
        
        {/* Namdharak Count */}
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaCalendarCheck className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Namdharak Count</p>
              <p className="text-2xl font-semibold text-gray-800">{stats?.data?.registration?.namdharakCount || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Gender Distribution</h2>
          <div className="h-64 flex justify-center">
            <Pie data={genderData} />
          </div>
        </div>
        
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Registration Method</h2>
          <div className="h-64 flex justify-center">
            <Pie data={registrationData} />
          </div>
        </div>
      </div>
      
      {/* City Distribution */}
      <div className="card p-6 mb-8">
        <div className="h-80">
          <Bar data={cityData} options={cityChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;