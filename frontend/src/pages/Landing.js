import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import { getAllPosts } from '../api/api';
import { format, parseISO, isValid } from 'date-fns';

const Landing = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin'); // 'signin' or 'signup'
  const [trendingPosts, setTrendingPosts] = useState([]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Fetch trending posts
  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  // If authenticated, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const fetchTrendingPosts = async () => {
    try {
      const response = await getAllPosts();
      const posts = response.data.data || [];
      // Get top 6 posts sorted by likes
      const sorted = [...posts].sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
      setTrendingPosts(sorted.slice(0, 6));
    } catch (error) {
      console.error('Error fetching trending posts:', error);
      setTrendingPosts([]);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'd MMM');
      }
      const fallbackDate = new Date(dateString);
      if (!isNaN(fallbackDate.getTime())) {
        return format(fallbackDate, 'd MMM');
      }
      return 'Recently';
    } catch (error) {
      return 'Recently';
    }
  };

  const openSignIn = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFC017] overflow-hidden">
      {/* Header */}
      <header className="border-b border-black">
        <div className="max-w-[1192px] mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" className="font-spectral text-3xl font-bold text-black">
            Medium
          </Link>
          <nav className="flex items-center space-x-4">
            <button
              onClick={openSignIn}
              className="text-sm font-medium text-black hover:opacity-70 transition-opacity"
            >
              Sign in
            </button>
            <button
              onClick={openSignUp}
              className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-900 transition-colors"
            >
              Get started
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-black">
        <div className="max-w-[1192px] mx-auto px-6 py-24 md:py-32 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="font-spectral text-[88px] md:text-[106px] leading-[95px] font-normal mb-8 tracking-tight text-black">
              Human
              <br />
              stories & ideas
            </h1>
            <p className="text-[24px] text-black mb-12">
              A place to read, write, and deepen your understanding
            </p>
            <button
              onClick={openSignUp}
              className="px-12 py-3 bg-black text-white rounded-full text-[20px] font-medium hover:bg-gray-900 transition-colors"
            >
              Start reading
            </button>
          </div>

          {/* Right Illustration */}
          <div className="hidden md:flex items-center justify-center">
            {/* Medium's characteristic M illustration */}
            <svg
              width="460"
              height="460"
              viewBox="0 0 460 460"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Simple artistic illustration placeholder */}
              <g>
                {/* Background circles */}
                <circle cx="230" cy="230" r="200" fill="#191919" opacity="0.9" />
                <circle cx="280" cy="180" r="80" fill="#FFC017" opacity="0.3" />
                <circle cx="150" cy="250" r="100" fill="#191919" opacity="0.5" />
                
                {/* Letter M stylized */}
                <path
                  d="M130 320 L130 140 L230 240 L330 140 L330 320"
                  stroke="white"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="bg-white">
        <div className="max-w-[1192px] mx-auto px-6 py-16">
          <div className="flex items-center space-x-2 mb-6">
            <svg
              className="w-6 h-6 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-black">
              Trending on Medium
            </h2>
          </div>

          {/* Trending Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingPosts.length > 0 ? (
              trendingPosts.map((post, index) => (
                <div key={post.id} className="flex">
                  <span className="text-[32px] font-bold text-gray-200 mr-4">
                    0{index + 1}
                  </span>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      {post.authorAvatar ? (
                        <img
                          src={post.authorAvatar}
                          alt={post.author}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                          <span className="text-white text-[10px] font-semibold">
                            {post.author?.charAt(0).toUpperCase() || 'A'}
                          </span>
                        </div>
                      )}
                      <span className="text-xs font-medium text-gray-900">{post.author || 'Anonymous'}</span>
                    </div>
                    <button
                      onClick={openSignUp}
                      className="text-left"
                    >
                      <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight hover:underline">
                        {post.title}
                      </h3>
                    </button>
                    <p className="text-xs text-gray-500">
                      {formatDate(post.createdAt)} · {post.readTime || 5} min read
                      {post.likeCount > 0 && <span className="ml-1">· {post.likeCount} ❤️</span>}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-500">
                <p>No posts available yet. Be the first to write!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-[1192px] mx-auto px-6 py-8">
          <div className="flex flex-wrap justify-center space-x-6 text-xs text-gray-500">
            <Link to="/help" className="hover:underline">Help</Link>
            <Link to="/status" className="hover:underline">Status</Link>
            <Link to="/writers" className="hover:underline">Writers</Link>
            <Link to="/blog" className="hover:underline">Blog</Link>
            <Link to="/careers" className="hover:underline">Careers</Link>
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <Link to="/about" className="hover:underline">About</Link>
            <Link to="/text-to-speech" className="hover:underline">Text to speech</Link>
            <Link to="/teams" className="hover:underline">Teams</Link>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          mode={authMode}
        />
      )}
    </div>
  );
};

export default Landing;

