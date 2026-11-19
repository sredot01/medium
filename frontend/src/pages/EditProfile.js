import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function EditProfile() {
  const { user, isAuthenticated, loading: authLoading, setUser } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    avatar: '',
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
      };

      // Add avatar if a new one was selected
      if (avatarPreview && avatarPreview !== formData.avatar) {
        updateData.avatar = avatarPreview;
      }

      const response = await updateProfile(updateData);
      
      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        // Update user in context
        setUser(response.data.data);
        
        // Redirect to profile after 2 seconds
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        onSearch={() => {}}
      />
      
      <div className="flex relative">
        <Sidebar isOpen={sidebarOpen} />

        <main 
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-[240px]' : 'ml-0'
          }`}
        >
          <div className="max-w-3xl mx-auto px-6 py-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Edit Profile
              </h1>
              <p className="text-gray-600">
                Update your personal information and profile photo
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              {/* Profile Photo */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-gray-900 mb-4">
                  Profile Photo
                </label>
                <div className="flex items-center space-x-6">
                  {/* Current Avatar */}
                  <div className="relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                        {getUserInitials(formData.name)}
                      </div>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <div>
                    <label
                      htmlFor="avatar-upload"
                      className="cursor-pointer inline-block px-4 py-2 bg-gray-900 text-white text-sm rounded-full hover:bg-gray-800 transition-colors"
                    >
                      Choose Photo
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      JPG, PNG or GIF. Max 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Bio */}
              <div className="mb-8">
                <label htmlFor="bio" className="block text-sm font-semibold text-gray-900 mb-2">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.bio.length} / 200 characters
                </p>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="px-6 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

