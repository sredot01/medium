import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts, getAllTags } from '../api/api';

export default function RightSidebar() {
  const [staffPicks, setStaffPicks] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffPicks();
    fetchTopics();
  }, []);

  const fetchStaffPicks = async () => {
    try {
      const response = await getAllPosts();
      const posts = response.data.data || [];
      // Get first 3 posts for staff picks
      setStaffPicks(posts.slice(0, 3));
    } catch (error) {
      console.error('Error fetching staff picks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const response = await getAllTags();
      const allTopics = response.data.data || [];
      // Get first 7 topics
      setTopics(allTopics.slice(0, 7));
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const getAvatarColor = (index) => {
    const colors = [
      'from-green-400 to-blue-500',
      'from-blue-400 to-purple-500',
      'from-pink-400 to-red-500',
    ];
    return colors[index % colors.length];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const day = date.getDate();
    return `${month} ${day}`;
  };

  return (
    <aside className="fixed right-0 top-[57px] w-[368px] h-[calc(100vh-57px)] overflow-y-auto px-8 py-10 border-l border-gray-200 bg-white">
      {/* Staff Picks */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-4">
          Staff Picks
        </h3>
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : staffPicks.length > 0 ? (
          <div className="space-y-5">
            {staffPicks.map((post, idx) => (
              <Link key={post.id} to={`/post/${post.slug}`} className="block group">
                <div className="flex items-start space-x-3">
                  {post.authorAvatar ? (
                    <img
                      src={post.authorAvatar}
                      alt={post.author}
                      className="flex-shrink-0 w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${getAvatarColor(idx)} flex items-center justify-center text-white text-xs font-semibold`}>
                      {post.author.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center text-xs text-gray-600 mb-1">
                      <span className="font-medium">{post.author}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-1 line-clamp-2 group-hover:text-gray-700">
                      {post.title}
                    </h4>
                    <div className="flex items-center mt-2">
                      <svg className="w-3 h-3 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No posts available yet</p>
        )}
        {staffPicks.length > 0 && (
          <Link to="/" className="mt-4 text-xs text-green-600 hover:text-green-700 inline-block">
            See the full list
          </Link>
        )}
      </div>

      {/* Start Writing */}
      <div className="bg-gray-50 rounded-lg p-5 mb-8 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Start Writing
        </h3>
        <p className="text-xs text-gray-600 mb-4">
          Share your stories and ideas with our community. Create engaging content and connect with readers worldwide.
        </p>
        <Link 
          to="/create"
          className="px-4 py-2 bg-gray-900 text-white text-xs rounded-full hover:bg-gray-800 inline-block transition-colors"
        >
          Write a story
        </Link>
      </div>

      {/* Recommended Topics */}
      <div>
        <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-4">
          Recommended topics
        </h3>
        {topics.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {topics.map((topic, idx) => (
              <button
                key={idx}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs text-gray-700 rounded-full transition-colors"
              >
                {topic}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No topics available yet</p>
        )}
      </div>

      {/* Footer Links */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
          <a href="#" className="hover:text-gray-900">Help</a>
          <a href="#" className="hover:text-gray-900">Status</a>
          <a href="#" className="hover:text-gray-900">About</a>
          <a href="#" className="hover:text-gray-900">Careers</a>
          <a href="#" className="hover:text-gray-900">Blog</a>
          <a href="#" className="hover:text-gray-900">Privacy</a>
          <a href="#" className="hover:text-gray-900">Terms</a>
          <a href="#" className="hover:text-gray-900">Text to speech</a>
          <a href="#" className="hover:text-gray-900">Teams</a>
        </div>
      </div>
    </aside>
  );
}
