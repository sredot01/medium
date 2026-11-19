import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserStats, getUserPostStats } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { format, parseISO, isValid, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function Stats() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState(null);
  const [postStats, setPostStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewPeriod, setViewPeriod] = useState('lifetime'); // lifetime, monthly
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/');
      return;
    }
    fetchStats();
  }, [user, isAuthenticated, navigate]);

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [statsResponse, postStatsResponse] = await Promise.all([
        getUserStats(user.id),
        getUserPostStats(user.id),
      ]);
      
      setStats(statsResponse.data.data);
      setPostStats(postStatsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'MMM d, yyyy');
      }
      return 'Recent';
    } catch (error) {
      return 'Recent';
    }
  };

  const getMonthLabel = () => {
    return format(selectedMonth, 'MMMM yyyy');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="flex">
          <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
          <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[240px]' : 'ml-0'}`}>
            <div className="max-w-7xl mx-auto px-8 py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading your stats...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[240px]' : 'ml-0'} pt-[57px]`}>
          <div className="max-w-7xl mx-auto px-8 py-12">
            {/* Header */}
            <div className="mb-12">
              <h1 className="text-5xl font-bold text-gray-900 mb-2">Stats</h1>
              <p className="text-gray-600">Track your story performance and engagement</p>
            </div>

            {/* Period Toggle */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setViewPeriod('monthly')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    viewPeriod === 'monthly'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setViewPeriod('lifetime')}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    viewPeriod === 'lifetime'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Lifetime
                </button>
              </div>

              {viewPeriod === 'monthly' && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium text-gray-900 min-w-[120px] text-center">
                    {getMonthLabel()}
                  </span>
                  <button
                    onClick={() => setSelectedMonth(prev => {
                      const next = new Date(prev);
                      next.setMonth(next.getMonth() + 1);
                      if (next > new Date()) return prev;
                      return next;
                    })}
                    disabled={selectedMonth >= startOfMonth(new Date())}
                    className="p-2 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                {/* Total Posts */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Posts</div>
                  <div className="text-4xl font-bold text-gray-900">{stats.totalPosts}</div>
                </div>

                {/* Views */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Views</div>
                  <div className="text-4xl font-bold text-gray-900">{stats.totalViews}</div>
                </div>

                {/* Reads */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Reads</div>
                  <div className="text-4xl font-bold text-gray-900">{stats.totalReads}</div>
                </div>

                {/* Likes */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Likes</div>
                  <div className="text-4xl font-bold text-gray-900">{stats.totalLikes}</div>
                </div>

                {/* Comments */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Comments</div>
                  <div className="text-4xl font-bold text-gray-900">{stats.totalComments}</div>
                </div>
              </div>
            )}

            {/* Individual Post Stats */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Story performance</h2>
              
              {postStats.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                    <div className="col-span-6">Story</div>
                    <div className="col-span-2 text-center">Views</div>
                    <div className="col-span-2 text-center">Reads</div>
                    <div className="col-span-1 text-center">Likes</div>
                    <div className="col-span-1 text-center">Comments</div>
                  </div>

                  {/* Table Rows */}
                  {postStats.map((post) => (
                    <div
                      key={post.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/post/${post.slug}`)}
                    >
                      <div className="col-span-6">
                        <h3 className="font-medium text-gray-900 line-clamp-1">{post.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(post.createdAt)}</p>
                      </div>
                      <div className="col-span-2 text-center text-gray-900 font-medium">
                        {post.views || 0}
                      </div>
                      <div className="col-span-2 text-center text-gray-900 font-medium">
                        {post.reads || 0}
                      </div>
                      <div className="col-span-1 text-center text-gray-900 font-medium">
                        {post.likes || 0}
                      </div>
                      <div className="col-span-1 text-center text-gray-900 font-medium">
                        {post.comments || 0}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-600 text-lg">No stories published yet</p>
                  <button
                    onClick={() => navigate('/create')}
                    className="mt-4 px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                  >
                    Write your first story
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

