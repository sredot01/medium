import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getAllAuthors } from '../api/api';

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      const response = await getAllAuthors();
      setAuthors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const navItems = [
    { icon: 'home', label: 'Home', path: '/home' },
    { icon: 'bookmark', label: 'Bookmarks', path: '/bookmarks' },
    { icon: 'user', label: 'Profile', path: '/profile' },
    { icon: 'file', label: 'Stories', path: '/stories' },
    { icon: 'chart', label: 'Stats', path: '/stats' },
  ];

  // Generate random gradient colors for avatars
  const getAvatarColor = (index) => {
    const colors = [
      'from-blue-400 to-purple-500',
      'from-green-400 to-blue-500',
      'from-pink-400 to-red-500',
      'from-yellow-400 to-orange-500',
      'from-purple-400 to-pink-500',
      'from-indigo-400 to-blue-500',
      'from-red-400 to-pink-500',
      'from-teal-400 to-green-500',
    ];
    return colors[index % colors.length];
  };

  return (
    <aside
      className={`
        fixed left-0 top-[57px] h-[calc(100vh-57px)] w-[240px] 
        border-r border-gray-200 bg-white overflow-y-auto z-30
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="py-6 px-6">
        {/* Main Navigation */}
        <nav className="space-y-1 mb-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm ${
                location.pathname === item.path
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.icon === 'home' && (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              )}
              {item.icon === 'bookmark' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              )}
              {item.icon === 'user' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
              {item.icon === 'file' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
              {item.icon === 'chart' && (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              )}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Following Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Following
          </h3>
          <div className="space-y-1">
            {authors.length > 0 ? (
              authors.slice(0, 9).map((author, idx) => (
                <button
                  key={idx}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-md group"
                >
                  <div className={`w-5 h-5 rounded bg-gradient-to-br ${getAvatarColor(idx)} flex-shrink-0 flex items-center justify-center text-white text-[10px] font-semibold`}>
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate flex-1 text-left">{author.name}</span>
                  <span className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                    •
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 text-xs text-gray-500">No authors yet</p>
            )}
          </div>

          {/* Find Writers */}
          <button className="mt-4 px-3 py-2 text-sm text-green-600 hover:text-green-700 flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Find writers and publications to follow</span>
          </button>
          <button className="mt-2 px-3 text-xs text-green-600 hover:text-green-700 underline">
            See suggestions
          </button>
        </div>
      </div>
    </aside>
  );
}
