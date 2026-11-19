import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import RightSidebar from '../components/RightSidebar';
import BlogCard from '../components/BlogCard';
import { getAllPosts, getAllCategories } from '../api/api';

export default function Home() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('for-you');
  const [categories, setCategories] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts();
      fetchCategories();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Filter posts based on search query
    if (searchQuery.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = posts.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.author.toLowerCase().includes(query) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
        (post.category && post.category.toLowerCase().includes(query)) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(query)))
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await getAllPosts();
      setPosts(response.data.data || []);
      setFilteredPosts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
      setFilteredPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
        onSearch={handleSearch}
      />
      
      <div className="flex relative">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} />

        {/* Main Content - with dynamic margin */}
        <main 
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-[240px]' : 'ml-0'
          }`}
        >
          <div className="max-w-[728px] mx-auto">
            {/* Tabs */}
            <div className="border-b border-gray-200 sticky top-[57px] bg-white z-10">
              <div className="flex space-x-8 px-6">
                <button
                  onClick={() => setSelectedTab('for-you')}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    selectedTab === 'for-you'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  For you
                </button>
                <button
                  onClick={() => setSelectedTab('featured')}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    selectedTab === 'featured'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Featured
                </button>
              </div>
            </div>

            {/* Search Results Info */}
            {searchQuery && (
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-700">
                  {filteredPosts.length > 0 ? (
                    <>
                      Found <strong>{filteredPosts.length}</strong> result{filteredPosts.length !== 1 ? 's' : ''} for "<strong>{searchQuery}</strong>"
                    </>
                  ) : (
                    <>No stories found for "<strong>{searchQuery}</strong>"</>
                  )}
                </p>
              </div>
            )}

            {/* Posts Feed */}
            <div className="px-6 py-8">
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading posts...</div>
              ) : filteredPosts.length > 0 ? (
                <div className="space-y-8">
                  {filteredPosts.map((post) => (
                    <BlogCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  {searchQuery ? "No stories match your search." : "No posts available yet. Start writing!"}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>
    </div>
  );
}
