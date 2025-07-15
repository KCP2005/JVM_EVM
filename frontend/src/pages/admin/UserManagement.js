import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaDownload, FaUserCheck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api, { eventAPI, userAPI } from '../../utils/api';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    isNamdharak: '',
    isCheckedIn: '',
    registrationMethod: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeEvent, setActiveEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const USERS_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        // 1. Get the active event
        const eventResponse = await eventAPI.getActiveEvent();
        const activeEventData = eventResponse.data.data || eventResponse.data;
  
        // Extract the active event ID as a plain string
        const activeEventId =
          activeEventData._id?.$oid || activeEventData._id;
  
        setActiveEvent(activeEventData);
  
        // 2. Get all users
        const usersResponse = await userAPI.getUsers();
  
        if (usersResponse.data && Array.isArray(usersResponse.data.data)) {
          const allUsers = usersResponse.data.data;
  
          // 3. Filter users registered for the active event
          const filteredUsers = allUsers.filter(user => {
            if (!Array.isArray(user.registeredEvents)) return false;
  
            return user.registeredEvents.some(eventIdObj => {
              const eventIdStr =
                eventIdObj?.$oid || eventIdObj;
              return eventIdStr === activeEventId;
            });
          });
  
          setUsers(filteredUsers);
        } else {
          console.error('Invalid users data format:', usersResponse.data);
          setUsers([]);
          toast.error('Invalid user data format received');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      gender: '',
      isNamdharak: '',
      isCheckedIn: '',
      registrationMethod: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    if (!filteredUsers.length) {
      toast.error('No users to export');
      return;
    }

    const headers = ['Name', 'Phone', 'Gender', 'City', 'Namdharak', 'Registration Type', 'Checked In'];
    const rows = filteredUsers.map(user => [
      user.name,
      user.phone,
      user.gender === 'M' ? 'Male' : user.gender === 'F' ? 'Female' : 'Other',
      user.address,
      user.isNamdharak ? 'Yes' : 'No',
      user.registrationMethod === 'self' ? 'Self' : 'On-spot',
      isUserCheckedIn(user) ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Users exported successfully');
  };

  const isUserCheckedIn = (user) => {
    if (!activeEvent) return false;
    return user.checkIns?.some(checkIn => checkIn.event.toString() === activeEvent._id.toString());
  };

  const filteredUsers = users.filter(user => {
    if (
      searchTerm &&
      !user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !user.phone.includes(searchTerm) &&
      !user.address.toLowerCase().includes(searchTerm.toLowerCase())
    ) return false;

    if (filters.gender && user.gender !== filters.gender) return false;

    if (filters.isNamdharak !== '') {
      const isNamdharakBool = filters.isNamdharak === 'yes';
      if (user.isNamdharak !== isNamdharakBool) return false;
    }

    if (filters.isCheckedIn !== '') {
      const isCheckedInBool = filters.isCheckedIn === 'yes';
      if (isUserCheckedIn(user) !== isCheckedInBool) return false;
    }

    if (filters.registrationMethod && user.registrationMethod !== filters.registrationMethod) return false;

    return true;
  });

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="xl" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="btn btn-outline flex items-center">
            <FaFilter className="mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
          <button onClick={exportToCSV} className="btn btn-primary flex items-center" disabled={!filteredUsers.length}>
            <FaDownload className="mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search by name, phone or city..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {showFilters && (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="gender" className="label">Gender</label>
                <select id="gender" name="gender" className="input" value={filters.gender} onChange={handleFilterChange}>
                  <option value="">All</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="isNamdharak" className="label">Namdharak</label>
                <select id="isNamdharak" name="isNamdharak" className="input" value={filters.isNamdharak} onChange={handleFilterChange}>
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label htmlFor="isCheckedIn" className="label">Checked In</label>
                <select id="isCheckedIn" name="isCheckedIn" className="input" value={filters.isCheckedIn} onChange={handleFilterChange}>
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div>
                <label htmlFor="registrationMethod" className="label">Registration Type</label>
                <select id="registrationMethod" name="registrationMethod" className="input" value={filters.registrationMethod} onChange={handleFilterChange}>
                  <option value="">All</option>
                  <option value="self">Self</option>
                  <option value="onspot">On-spot</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 flex justify-end">
            <button onClick={resetFilters} className="btn btn-sm btn-outline">Reset Filters</button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Phone</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Gender</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">City</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Namdharak</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Registration</th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-4 text-center text-gray-500">No users found</td>
              </tr>
            ) : (
              paginatedUsers.map(user => (
                <tr key={user._id}>
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.phone}</td>
                  <td className="px-4 py-3">
                    {user.gender === 'M' ? 'Male' : user.gender === 'F' ? 'Female' : 'Other'}
                  </td>
                  <td className="px-4 py-3">{user.address}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 inline-block text-xs rounded-full ${user.isNamdharak ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.isNamdharak ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.registrationMethod === 'self' ? 'Self' : 'On-spot'}
                  </td>
                  <td className="px-4 py-3">
                    {isUserCheckedIn(user) ? (
                      <span className="flex items-center text-green-600 text-xs">
                        <FaUserCheck className="mr-1" />
                        Checked In
                      </span>
                    ) : (
                      <span className="text-gray-500 text-xs">Not Checked In</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="btn btn-sm btn-outline flex items-center"
            disabled={currentPage === 1}
          >
            <FaChevronLeft className="mr-1" />
            Prev
          </button>
          <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="btn btn-sm btn-outline flex items-center"
            disabled={currentPage === totalPages}
          >
            Next
            <FaChevronRight className="ml-1" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
