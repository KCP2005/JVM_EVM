import React, { useState, useEffect } from 'react';
import { eventAPI, statsAPI } from '../../utils/api';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, TimeScale } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, TimeScale);

const Statistics = () => {
  const [activeEvent, setActiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    gender: null,
    city: null,
    checkin: null,
    registration: null
  });
  
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
        
        // Fetch all stats in parallel
        const [genderStats, cityStats, checkinStats, registrationStats] = await Promise.all([
          statsAPI.getGenderStats(),
          statsAPI.getCityStats(),
          statsAPI.getCheckInStats(),
          statsAPI.getRegistrationStats()
        ]);
        
        console.log('Gender Stats:', genderStats);
        console.log('City Stats:', cityStats);
        console.log('Checkin Stats:', checkinStats);
        console.log('Registration Stats:', registrationStats);
        
        setStats({
          gender: genderStats.data,
          city: cityStats.data,
          checkin: checkinStats.data,
          registration: registrationStats.data
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
        toast.error('Failed to load statistics');
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
        <p className="text-gray-500 mb-6">Please activate an event to view statistics.</p>
      </div>
    );
  }
  
  // Prepare gender chart data
  const genderData = {
    labels: ['Male', 'Female', 'Other'],
    datasets: [
      {
        data: [
          stats.gender?.data?.gender?.male?.count || 0,
          stats.gender?.data?.gender?.female?.count || 0,
          stats.gender?.data?.gender?.other?.count || 0
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
  
  // Prepare registration method chart data
  const registrationData = {
    labels: ['Self Registration', 'On-spot Registration', 'Admin Registration'],
    datasets: [
      {
        data: [
          stats.registration?.data?.registrationMethod?.self?.count || 0,
          stats.registration?.data?.registrationMethod?.onSpot?.count || 0,
          stats.registration?.data?.registrationMethod?.admin?.count || 0
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
  
  // Prepare city chart data
  const cityLabels = stats.city?.data?.cities?.map(city => city.city) || [];
  const cityData = {
    labels: cityLabels,
    datasets: [
      {
        label: 'Registrations by City',
        data: stats.city?.data?.cities?.map(city => city.count) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // Prepare check-in time chart data
  const timeLabels = stats.checkin?.data?.data?.hourly?.map(city => city.hour) || [];

  const checkinData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Check-ins by Hour',
        data: stats.checkin?.data?.hourly?.map(h => h.count) || [],
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };
  
  // Chart options
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
  
  const checkinChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Check-ins by Hour',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          displayFormats: {
            hour: 'HH:mm'
          }
        },
        title: {
          display: true,
          text: 'Time'
        }
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        },
        title: {
          display: true,
          text: 'Number of Check-ins'
        }
      }
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Statistics: {activeEvent?.name || 'No Active Event'}
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
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Gender Distribution */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Gender Distribution</h2>
          <div className="h-64 flex justify-center">
            <Pie data={genderData} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm text-gray-500">Male</div>
              <div className="text-xl font-semibold text-blue-600">{stats.gender?.data?.gender?.male?.count || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Female</div>
              <div className="text-xl font-semibold text-pink-600">{stats.gender?.data?.gender?.female?.count || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Other</div>
              <div className="text-xl font-semibold text-yellow-600">{stats.gender?.data?.gender?.other?.count || 0}</div>
            </div>
          </div>
        </div>
        
        {/* Registration Method */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Registration Method</h2>
          <div className="h-64 flex justify-center">
            <Pie data={registrationData} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-sm text-gray-500">Self Registration</div>
              <div className="text-xl font-semibold text-teal-600">{stats.registration?.data?.registrationMethod?.self?.count || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">On-spot Registration</div>
              <div className="text-xl font-semibold text-purple-600">{stats.registration?.data?.registrationMethod?.onSpot?.count || 0}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Admin Registration</div>
              <div className="text-xl font-semibold text-orange-600">{stats.registration?.data?.registrationMethod?.admin?.count || 0}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* City Distribution */}
      <div className="card p-6 mb-8">
        <div className="h-80">
          <Bar data={cityData} options={cityChartOptions} />
        </div>
      </div>
      
      {/* Check-in Time Distribution */}
      <div className="card p-6 mb-8">
        <div className="h-80">
          <Bar data={checkinData} options={checkinChartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Statistics;