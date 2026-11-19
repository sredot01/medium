import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserPosts, deletePost } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { format, parseISO, isValid } from 'date-fns';

export default function Stories() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('published'); // published, drafts, responses
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchUserPosts();
  }, [user, navigate]);

  const fetchUserPosts = async () => {
    try {
      setLoading(true);
      const response = await getUserPosts(user.id);
      setPosts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await deletePost(postId);
        setPosts(posts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post');
      }
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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading your stories...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold mb-4">Your stories</h1>
        <Link
          to="/create"
          className="inline-block px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
        >
          Write a story
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-300 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('published')}
            className={`pb-4 px-1 font-medium ${
              activeTab === 'published'
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Published ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('drafts')}
            className={`pb-4 px-1 font-medium ${
              activeTab === 'drafts'
                ? 'border-b-2 border-gray-900 text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Drafts (0)
          </button>
        </nav>
      </div>

      {/* Posts List */}
      {activeTab === 'published' && (
        <div className="space-y-8">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven't published any stories yet.</p>
              <Link
                to="/create"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
              >
                Write your first story
              </Link>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="border-b border-gray-200 pb-8"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    {/* Title */}
                    <Link
                      to={`/post/${post.id}`}
                      className="block"
                    >
                      <h2 className="text-2xl font-bold text-gray-900 hover:text-gray-700 mb-2">
                        {post.title}
                      </h2>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>{formatDate(post.createdAt)}</span>
                      <span>·</span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>0 views</span>
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-4 mt-4">
                      <Link
                        to={`/edit/${post.id}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Edit story
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                      <Link
                        to={`/post/${post.id}`}
                        className="text-gray-600 hover:text-gray-700 text-sm"
                      >
                        View
                      </Link>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  {post.coverImage && (
                    <Link to={`/post/${post.id}`}>
                      <img
                        src={post.coverImage}
                        alt={post.title}
                        className="w-32 h-32 object-cover rounded"
                      />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Drafts Tab */}
      {activeTab === 'drafts' && (
        <div className="text-center py-12">
          <p className="text-gray-500">No drafts yet.</p>
        </div>
      )}
    </div>
  );
}

