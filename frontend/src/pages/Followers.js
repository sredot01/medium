import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getFollowers } from '../api/api';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function Followers() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    fetchFollowers();
  }, [userId, isAuthenticated, navigate]);

  const fetchFollowers = async () => {
    try {
      setLoading(true);
      const response = await getFollowers(userId);
      setFollowers(response.data.data.followers || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
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
            <h1 className="text-4xl font-bold mt-4 mb-2">Followers</h1>
            <p className="text-gray-600">{followers.length} people follow this user</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            </div>
          ) : followers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No followers yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {followers.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-6">
                  <Link to={`/profile/${item.follower.id}`} className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {item.follower.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 hover:underline">
                        {item.follower.name}
                      </h3>
                      {item.follower.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2">{item.follower.bio}</p>
                      )}
                    </div>
                  </Link>
                  <button className="px-6 py-2 border border-gray-300 rounded-full hover:bg-gray-50 text-sm font-medium">
                    Follow
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

