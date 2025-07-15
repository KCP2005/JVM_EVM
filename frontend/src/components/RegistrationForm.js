import React, { useState } from 'react';
import Loader from './common/Loader';

const RegistrationForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    gender: '',
    address: '',
    isNamdharak: false
  });
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'phone') {
      // Allow only digits
      const numericValue = value.replace(/\D/g, ''); // Remove all non-digits
      if (numericValue.length <= 10) {
        setFormData(prev => ({
          ...prev,
          [name]: numericValue
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="label">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            className="input"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Phone */}
        <div>
          <label htmlFor="phone" className="label">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="input"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            maxLength={10}
            minLength={10}
            required
          />
        </div>
        
        {/* Gender */}
        <div>
          <label className="label">Gender</label>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center">
              <input
                type="radio"
                id="gender-male"
                name="gender"
                value="M"
                className="mr-2"
                checked={formData.gender === 'M'}
                onChange={handleChange}
                required
              />
              <label htmlFor="gender-male">Male</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="gender-female"
                name="gender"
                value="F"
                className="mr-2"
                checked={formData.gender === 'F'}
                onChange={handleChange}
                required
              />
              <label htmlFor="gender-female">Female</label>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                id="gender-other"
                name="gender"
                value="O"
                className="mr-2"
                checked={formData.gender === 'O'}
                onChange={handleChange}
                required
              />
              <label htmlFor="gender-other">Other</label>
            </div>
          </div>
        </div>
        
        {/* Address (City) */}
        <div>
          <label htmlFor="address" className="label">City</label>
          <input
            type="text"
            id="address"
            name="address"
            className="input"
            placeholder="Enter your city"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Namdharak */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isNamdharak"
            name="isNamdharak"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            checked={formData.isNamdharak}
            onChange={handleChange}
          />
          <label htmlFor="isNamdharak" className="ml-2 block text-sm text-gray-900">
            तुम्ही जीवनविद्येचे नामधारक आहात का?
          </label>
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? <Loader size="sm" /> : 'Register'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default RegistrationForm;