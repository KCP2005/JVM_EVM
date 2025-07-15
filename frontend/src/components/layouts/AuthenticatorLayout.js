import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { FaQrcode, FaUserPlus, FaSignOutAlt, FaTachometerAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AuthenticatorLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-green-700' : '';
  };
  
  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="md:hidden bg-green-800 text-white p-4 flex justify-between items-center">
        <div className="text-xl font-bold">Event Authenticator</div>
        <label htmlFor="sidebar-toggle" className="md:hidden">
          <FaBars className="h-6 w-6" />
        </label>
      </header>
      
      {/* Sidebar Toggle (hidden checkbox) */}
      <input type="checkbox" id="sidebar-toggle" className="hidden peer" />
      
      {/* Sidebar */}
      <div className="w-64 bg-green-800 text-white fixed md:static inset-y-0 left-0 transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out peer-checked:translate-x-0 z-10">
        <div className="p-4 text-xl font-bold border-b border-green-700 flex justify-between items-center">
          <span>Event Authenticator</span>
          <label htmlFor="sidebar-toggle" className="md:hidden">
            <FaTimes className="h-6 w-6" />
          </label>
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <Link
                to="/authenticator"
                className={`flex items-center p-4 hover:bg-green-700 ${isActive('/authenticator')}`}
                onClick={() => document.getElementById('sidebar-toggle').checked = false}
              >
                <FaTachometerAlt className="mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/authenticator/scan"
                className={`flex items-center p-4 hover:bg-green-700 ${isActive('/authenticator/scan')}`}
                onClick={() => document.getElementById('sidebar-toggle').checked = false}
              >
                <FaQrcode className="mr-3" />
                Scan QR
              </Link>
            </li>
            <li>
              <Link
                to="/authenticator/register"
                className={`flex items-center p-4 hover:bg-green-700 ${isActive('/authenticator/register')}`}
                onClick={() => document.getElementById('sidebar-toggle').checked = false}
              >
                <FaUserPlus className="mr-3" />
                On-spot Registration
              </Link>
            </li>
            <li>
              <button
                onClick={() => {
                  handleLogout();
                  document.getElementById('sidebar-toggle').checked = false;
                }}
                className="flex items-center w-full p-4 hover:bg-green-700 text-left"
              >
                <FaSignOutAlt className="mr-3" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      {/* Overlay for mobile */}
      <label 
        htmlFor="sidebar-toggle" 
        className="hidden fixed inset-0 bg-black bg-opacity-50 z-0 peer-checked:block md:hidden"
      ></label>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto md:ml-0">
        <header className="bg-white shadow-md p-4 hidden md:block">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Authenticator Panel</h1>
          </div>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AuthenticatorLayout;