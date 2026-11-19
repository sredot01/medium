import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserBookmarks } from '../api/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import BlogCard from '../components/BlogCard';

export default function Bookmarks() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  console.log('Bookmarks - Current user:', user);
  console.log('Bookmarks - Is authenticated:', isAuthenticated);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookmarks();
    }
  }, [isAuthenticated]);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const response = await getUserBookmarks();
      console.log('Bookmarks API Response:', response);
      console.log('Bookmarks data:', response.data);
      console.log('Bookmarks array:', response.data.data);
      const bookmarks = response.data.data || [];
      console.log('Final bookmarks:', bookmarks);
      setBookmarkedPosts(bookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      console.error('Error details:', error.response?.data);
      setBookmarkedPosts([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        onSearch={() => {}}
      />
      
      <div className="flex relative">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Main Content */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-[240px]' : 'ml-0'
          }`}
        >
          <div className="max-w-[728px] mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Bookmarks
              </h1>
              <p className="text-gray-600">
                {bookmarkedPosts.length} saved {bookmarkedPosts.length === 1 ? 'story' : 'stories'}
              </p>
            </div>

            {/* Bookmarked Posts */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              </div>
            ) : bookmarkedPosts.length > 0 ? (
              <div className="space-y-6">
                {bookmarkedPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <svg 
                  className="mx-auto h-24 w-24 text-gray-300 mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                  />
                </svg>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  No bookmarks yet
                </h2>
                <p className="text-gray-600 mb-6">
                  Save stories to read later by clicking the bookmark icon
                </p>
                <button
                  onClick={() => navigate('/home')}
                  className="px-6 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  Explore stories
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

