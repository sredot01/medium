import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
              </svg>
              <span className="text-xl font-bold text-gray-900">TechBlog</span>
            </Link>
            <p className="text-sm text-gray-600 leading-relaxed max-w-md">
              A platform for developers and tech enthusiasts to share knowledge, 
              learn from each other, and grow together in the ever-evolving world of technology.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/create" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Write a Story
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Popular Topics</h3>
            <ul className="space-y-2">
              <li>
                <a href="/?category=web-development" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Web Development
                </a>
              </li>
              <li>
                <a href="/?category=frontend" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  Frontend
                </a>
              </li>
              <li>
                <a href="/?category=devops" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  DevOps
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} TechBlog. Built with React.js and Node.js.
            </p>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Help
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
