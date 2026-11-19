import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getFollowing } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function Following() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchFollowing();
  }, [userId, isAuthenticated, navigate]);

  const fetchFollowing = async () => {
    try {
      setLoading(true);
      const response = await getFollowing(userId);
      setFollowing(response.data.data.following || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-[240px]' : 'ml-0'} pt-14`}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-8">
            <Link to={`/profile/${userId}`} className="text-green-600 hover:text-green-700 text-sm">
              ← Back to profile
            </Link>
            <h1 className="text-4xl font-bold mt-4 mb-2">Following</h1>
            <p className="text-gray-600">{following.length} people this user follows</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : following.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Not following anyone yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {following.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-6">
                  <Link to={`/profile/${item.following.id}`} className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-white font-semibold">
                      {item.following.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 hover:underline">
                        {item.following.name}
                      </h3>
                      {item.following.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2">{item.following.bio}</p>
                      )}
                    </div>
                  </Link>
                  <button className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 text-sm font-medium">
                    Following
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

