import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getUserProfile, getUserPosts, followUser, unfollowUser, checkFollowing } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { format, parseISO, isValid } from 'date-fns';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // home, about

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    const profileUserId = userId || currentUser?.id;
    if (profileUserId) {
      fetchProfile(profileUserId);
      fetchUserPosts(profileUserId);
      if (currentUser && profileUserId !== currentUser.id) {
        checkIfFollowing(profileUserId);
      }
    }
  }, [userId, currentUser?.id, isAuthenticated, navigate]);

  const fetchProfile = async (id) => {
    try {
      const response = await getUserProfile(id);
      setProfile(response.data.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchUserPosts = async (id) => {
    try {
      setLoading(true);
      const response = await getUserPosts(id);
      setPosts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFollowing = async (id) => {
    try {
      const response = await checkFollowing(id);
      setIsFollowing(response.data.data.isFollowing);
    } catch (error) {
      console.error('Error checking following status:', error);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;
    
    try {
      if (isFollowing) {
        await unfollowUser(profile.id);
        setIsFollowing(false);
        setProfile(prev => ({
          ...prev,
          followerCount: prev.followerCount - 1
        }));
      } else {
        await followUser(profile.id);
        setIsFollowing(true);
        setProfile(prev => ({
          ...prev,
          followerCount: prev.followerCount + 1
        }));
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      alert('Failed to update follow status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'MMM d, yyyy');
      }
      const fallbackDate = new Date(dateString);
      if (!isNaN(fallbackDate.getTime())) {
        return format(fallbackDate, 'MMM d, yyyy');
      }
      return 'Recent';
    } catch (error) {
      return 'Recent';
    }
  };

  const isOwnProfile = currentUser && profile && currentUser.id === profile.id;

  if (!profile) {
    return (
      <div className="min-h-screen bg-white">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} />
        <div className={`flex justify-center items-center h-[calc(100vh-200px)] transition-all duration-300 ${
          sidebarOpen ? 'ml-[240px]' : 'ml-0'
        }`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />

      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-[240px]' : 'ml-0'} pt-14`}>
        {/* Profile Header */}
        <div className="border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold">
                    {profile.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                  <p className="text-gray-600">{profile.email}</p>
                  {profile.bio && <p className="text-gray-700 mt-2">{profile.bio}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {isOwnProfile ? (
                  <Link
                    to="/profile/edit"
                    className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 text-sm font-medium"
                  >
                    Edit profile
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={handleFollow}
                      className={`px-6 py-2 rounded-full text-sm font-medium transition ${
                        isFollowing
                          ? 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>{profile.postCount || 0} stories</span>
              <Link to={`/profile/${profile.id}/followers`} className="hover:text-gray-900">
                {profile.followerCount || 0} followers
              </Link>
              <Link to={`/profile/${profile.id}/following`} className="hover:text-gray-900">
                {profile.followingCount || 0} following
              </Link>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-8 mt-8">
              <button
                onClick={() => setActiveTab('home')}
                className={`pb-3 px-1 font-medium border-b-2 ${
                  activeTab === 'home'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`pb-3 px-1 font-medium border-b-2 ${
                  activeTab === 'about'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                About
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          {activeTab === 'home' && (
            <div>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No stories published yet.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {posts.map((post) => (
                    <article key={post.id} className="border-b border-gray-200 pb-8">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                          <Link to={`/post/${post.slug || post.id}`}>
                            <h2 className="text-2xl font-bold text-gray-900 hover:text-gray-700 mb-2">
                              {post.title}
                            </h2>
                          </Link>
                          <p className="text-gray-600 mb-3 line-clamp-2">{post.excerpt}</p>
                          <div className="flex items-center text-sm text-gray-500 space-x-2">
                            <span>{formatDate(post.createdAt)}</span>
                            <span>·</span>
                            <span>5 min read</span>
                          </div>
                        </div>
                        {post.coverImage && (
                          <Link to={`/post/${post.slug || post.id}`}>
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-32 h-32 object-cover rounded"
                            />
                          </Link>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="prose max-w-none">
              <p className="text-gray-600">
                {profile.bio || `${profile.name} hasn't written a bio yet.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

