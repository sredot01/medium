import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { bookmarkPost, removeBookmark, checkBookmark, featurePost, unfeaturePost, checkFeatured } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function BlogCard({ post }) {
  const { isAuthenticated } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);
  const [featured, setFeatured] = useState(post.featured || false);
  const [featuring, setFeaturing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && post.id) {
      checkIfBookmarked();
      checkIfFeatured();
    }
  }, [post.id, isAuthenticated]);

  const checkIfBookmarked = async () => {
    try {
      const response = await checkBookmark(post.id);
      setBookmarked(response.data.data.isBookmarked);
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated || bookmarking) return;
    
    try {
      setBookmarking(true);
      if (bookmarked) {
        await removeBookmark(post.id);
        setBookmarked(false);
      } else {
        await bookmarkPost(post.id);
        setBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setBookmarking(false);
    }
  };

  const checkIfFeatured = async () => {
    try {
      const response = await checkFeatured(post.id);
      setFeatured(response.data.data.isFeatured);
    } catch (error) {
      console.error('Error checking featured:', error);
    }
  };

  const handleFeature = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated || featuring) return;
    
    try {
      setFeaturing(true);
      if (featured) {
        await unfeaturePost(post.id);
        setFeatured(false);
      } else {
        await featurePost(post.id);
        setFeatured(true);
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    } finally {
      setFeaturing(false);
    }
  };

  // Format date as "5 Oct 2024"
  const formatDate = (dateString) => {
    if (!dateString) return 'Recent';
    try {
      // Parse the ISO string
      const date = parseISO(dateString);
      if (isValid(date)) {
        // Format as "5 Oct 2024"
        return format(date, 'd MMM yyyy');
      }
      // Try parsing as regular Date if ISO fails
      const fallbackDate = new Date(dateString);
      if (!isNaN(fallbackDate.getTime())) {
        return format(fallbackDate, 'd MMM yyyy');
      }
      return 'Recent';
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Recent';
    }
  };

  return (
    <article className="py-6 border-b border-gray-200 fade-in">
      <div className="flex items-start space-x-4">
        {/* Left: Content */}
        <div className="flex-1 min-w-0">
          {/* Author */}
          <div className="flex items-center space-x-2 mb-3">
            <Link to={`/profile/${post.userId}`} className="flex items-center space-x-2 hover:opacity-80">
              {post.authorAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={post.author}
                  className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-semibold">
                    {post.author.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-[13px] text-gray-900 font-medium">{post.author}</span>
            </Link>
          </div>

          {/* Title */}
          <Link to={`/post/${post.slug}`}>
            <h2 className="text-[20px] font-bold text-gray-900 leading-tight mb-2 hover:text-gray-700 cursor-pointer line-clamp-2">
              {post.title}
            </h2>
          </Link>

          {/* Excerpt */}
          <p className="text-[15px] text-gray-600 leading-relaxed mb-3 line-clamp-2">
            {post.excerpt}
          </p>

          {/* Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 text-[13px] text-gray-600">
              {/* Star for featured */}
              <button
                onClick={handleFeature}
                disabled={!isAuthenticated || featuring}
                className={`transition-colors ${
                  featured 
                    ? 'text-yellow-500' 
                    : 'text-gray-400 hover:text-yellow-500'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={featured ? 'Unfeature post' : 'Feature post'}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>

              <span>{formatDate(post.createdAt)}</span>
              
              {/* Likes */}
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{post.likeCount || 0}</span>
              </div>

              {/* Comments */}
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{post.commentCount || 0}</span>
              </div>

              <span>·</span>
              <span>{post.readTime} min read</span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Bookmark */}
              <button 
                onClick={handleBookmark}
                disabled={!isAuthenticated || bookmarking}
                className={`p-1 transition-colors ${
                  bookmarked 
                    ? 'text-gray-900' 
                    : 'text-gray-500 hover:text-gray-900'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={bookmarked ? 'Remove bookmark' : 'Bookmark post'}
              >
                <svg 
                  className="w-5 h-5" 
                  fill={bookmarked ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>

              {/* More */}
              <button className="p-1 text-gray-500 hover:text-gray-900">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        {post.coverImage && post.coverImage.length > 0 && (
          <Link to={`/post/${post.slug}`} className="flex-shrink-0">
            <div className="w-[112px] h-[112px] bg-gray-100 rounded overflow-hidden">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Image failed to load:', post.title);
                  console.error('Image src:', post.coverImage?.substring(0, 100));
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="112" height="112"%3E%3Crect fill="%23e5e7eb" width="112" height="112"/%3E%3Ctext fill="%239ca3af" font-size="14" font-family="Arial" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </Link>
        )}
      </div>
    </article>
  );
}
