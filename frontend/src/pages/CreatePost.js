import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';
import { createPost } from '../api/api';
import { useAuth } from '../context/AuthContext';

export default function CreatePost() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: '',
    tags: '',
    coverImage: '',
  });
  const [publishing, setPublishing] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [uploading, setUploading] = useState(false);
  const quillRef = useRef(null);
  const imageInputRef = useRef(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'link', 'image', 'code-block'],
    ],
  };

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'blockquote',
    'list',
    'bullet',
    'link',
    'image',
    'code-block',
  ];

  // Pre-fill author name with logged-in user's name
  useEffect(() => {
    if (user?.name && !formData.author) {
      setFormData(prev => ({
        ...prev,
        author: user.name
      }));
    }
  }, [user, formData.author]);

  // Helper function to strip HTML and get plain text
  const stripHtmlAndImages = (html) => {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    // Remove all img tags
    const images = temp.getElementsByTagName('img');
    while (images.length > 0) {
      images[0].parentNode.removeChild(images[0]);
    }
    return temp.textContent || temp.innerText || '';
  };

  const handlePublish = async () => {
    if (!formData.title || !formData.content) {
      alert('Please add a title and content to your story');
      return;
    }

    if (!formData.author) {
      alert('Please enter your name');
      return;
    }

    try {
      setPublishing(true);
      
      // Clean excerpt - strip HTML and images, limit length
      let cleanExcerpt = formData.excerpt;
      if (cleanExcerpt) {
        cleanExcerpt = stripHtmlAndImages(cleanExcerpt).substring(0, 200);
      } else {
        // Auto-generate from content if not provided
        cleanExcerpt = stripHtmlAndImages(formData.content).substring(0, 160) + '...';
      }
      
      const postData = {
        ...formData,
        excerpt: cleanExcerpt,
        tags: formData.tags.split(',').map((tag) => tag.trim()).filter((tag) => tag),
      };

      console.log('Publishing post:', postData);
              const response = await createPost(postData);
              console.log('Response:', response);

              if (response.data.success) {
                alert('Story published successfully!');
                navigate('/home');
              } else {
                alert('Failed to publish: ' + (response.data.message || 'Unknown error'));
              }
    } catch (error) {
      console.error('Error creating post:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to publish story';
      alert('Failed to publish story: ' + errorMessage);
    } finally {
      setPublishing(false);
    }
  };

  // Handle image upload from file system
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    // Convert image to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Image = event.target.result;
      
      if (quillRef.current) {
        const editor = quillRef.current.getEditor();
        const range = editor.getSelection() || { index: editor.getLength() };
        
        // Insert image at cursor position
        editor.insertEmbed(range.index, 'image', base64Image);
        editor.setSelection(range.index + 1);
      }
      
      setUploading(false);
      setShowPlusMenu(false);
    };

    reader.onerror = () => {
      alert('Error reading file');
      setUploading(false);
    };

    reader.readAsDataURL(file);
  };

  const insertContent = (type) => {
    if (!quillRef.current) return;
    
    const editor = quillRef.current.getEditor();
    const range = editor.getSelection() || { index: editor.getLength() };

    switch (type) {
      case 'image':
        // Trigger file input
        imageInputRef.current?.click();
        break;
      
      case 'video':
        const videoUrl = prompt('Enter video URL (YouTube, Vimeo, etc.):');
        if (videoUrl) {
          editor.insertText(range.index, `\n[Video: ${videoUrl}]\n`);
          editor.setSelection(range.index + 1);
          setShowPlusMenu(false);
        }
        break;
      
      case 'divider':
        editor.insertText(range.index, '\n━━━━━━━━━━━━━━━━━━\n');
        editor.setSelection(range.index + 1);
        setShowPlusMenu(false);
        break;
      
      case 'code':
        editor.insertText(range.index, '\n');
        editor.formatLine(range.index + 1, 1, 'code-block', true);
        editor.setSelection(range.index + 1);
        setShowPlusMenu(false);
        break;
      
      case 'embed':
        const embedCode = prompt('Paste your embed code:');
        if (embedCode) {
          editor.insertText(range.index, `\n[Embed Code]\n`);
          editor.setSelection(range.index + 1);
          setShowPlusMenu(false);
        }
        break;
      
      case 'social':
        const socialUrl = prompt('Enter social media post URL:');
        if (socialUrl) {
          editor.insertText(range.index, `\n[Social: ${socialUrl}]\n`);
          editor.setSelection(range.index + 1);
          setShowPlusMenu(false);
        }
        break;
      
      default:
        break;
    }
  };

  const contentOptions = [
    {
      id: 'image',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-green-600',
    },
    {
      id: 'video',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: 'text-green-600',
    },
    {
      id: 'divider',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      ),
      color: 'text-gray-600',
    },
    {
      id: 'code',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      color: 'text-gray-600',
    },
    {
      id: 'embed',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      color: 'text-gray-600',
    },
    {
      id: 'social',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'text-gray-600',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hidden file input for image upload */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Simple Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-[1000px] mx-auto px-6 h-[65px] flex items-center justify-between">
          {/* Left: Logo and Draft Status */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/home')}
              className="text-[32px] font-bold tracking-tight hover:opacity-80 transition-opacity"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              Medium
            </button>
            <span className="text-sm text-gray-500">
              Draft in {user?.name || 'Your Name'}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowPublishModal(true)}
              disabled={!formData.title || !formData.content}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-sm rounded-full transition-colors font-medium"
            >
              Publish
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
            <button className="p-1.5 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            {/* User Avatar */}
            <button
              onClick={() => navigate('/profile')}
              className="cursor-pointer hover:ring-2 hover:ring-gray-300 transition-all rounded-full"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Uploading Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Uploading image...</p>
          </div>
        </div>
      )}

      {/* Main Editor - Centered */}
      <main className="pt-[65px]">
        <div className="max-w-[740px] mx-auto px-10 py-20">
          {/* Title with Plus Button */}
          <div className="mb-8 relative">
            <div className="flex items-start space-x-4">
              {/* Plus Button */}
              <div className="relative">
                <button
                  onClick={() => setShowPlusMenu(!showPlusMenu)}
                  className={`w-10 h-10 flex-shrink-0 rounded-full border flex items-center justify-center transition-all ${
                    showPlusMenu 
                      ? 'border-gray-900 text-gray-900 rotate-45' 
                      : 'border-gray-300 text-gray-400 hover:border-gray-500 hover:text-gray-600'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                {/* Plus Menu Dropdown - Horizontal Icons */}
                {showPlusMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowPlusMenu(false)}
                    />
                    <div className="absolute left-0 top-12 z-20 bg-white rounded-lg shadow-xl border border-gray-200 py-2 px-2">
                      <div className="flex items-center space-x-1">
                        {/* Close X */}
                        <button
                          onClick={() => setShowPlusMenu(false)}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        {/* Divider */}
                        <div className="w-px h-8 bg-gray-200"></div>

                        {/* Content Options */}
                        {contentOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => insertContent(option.id)}
                            disabled={uploading && option.id === 'image'}
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${option.color} hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={option.id.charAt(0).toUpperCase() + option.id.slice(1)}
                          >
                            {option.icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Title Input */}
              <div className="flex-1">
                <textarea
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Title"
                  className="w-full text-[42px] font-medium text-gray-900 placeholder-gray-300 border-0 outline-none resize-none leading-[1.2] tracking-tight"
                  style={{ fontFamily: 'Spectral, Georgia, serif' }}
                  rows="1"
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Story Content */}
          <div className="mt-8">
            <ReactQuill
              ref={quillRef}
              theme="bubble"
              value={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              modules={modules}
              formats={formats}
              placeholder="Tell your story..."
              className="min-h-[500px]"
            />
          </div>
        </div>
      </main>

      {/* Publish Modal - Medium Style Two Column */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-white">
          {/* Close button - top right */}
          <button
            onClick={() => setShowPublishModal(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="h-full overflow-y-auto">
            <div className="max-w-[1192px] mx-auto px-8 py-12">
              <div className="grid grid-cols-2 gap-16">
                {/* Left Column - Story Preview */}
                <div>
                  <h2 className="text-[16px] font-semibold text-gray-900 mb-8">Story Preview</h2>
                  
                  {/* Cover Image Preview */}
                  <div className="mb-8">
                    {formData.coverImage ? (
                      <img 
                        src={formData.coverImage} 
                        alt="Cover" 
                        className="w-full h-[200px] object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-[200px] bg-gray-100 rounded flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">Include a high-quality image in your story to make it more inviting to readers.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preview Title */}
                  <input
                    type="text"
                    value={formData.title}
                    readOnly
                    placeholder="Write a preview title"
                    className="w-full text-[16px] font-semibold text-gray-400 placeholder-gray-300 border-0 border-b border-gray-200 pb-3 mb-4 outline-none"
                  />

                  {/* Preview Subtitle */}
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Write a preview subtitle..."
                    className="w-full text-[14px] text-gray-400 placeholder-gray-300 border-0 border-b border-gray-200 pb-3 outline-none resize-none"
                    rows="2"
                  />

                  {/* Note */}
                  <p className="mt-6 text-[13px] text-gray-500 leading-relaxed">
                    <span className="font-semibold">Note:</span> Changes here will affect how your story appears in public places like Medium's homepage and in subscribers' inboxes — not the contents of the story itself.
                  </p>
                </div>

                {/* Right Column - Publishing Options */}
                <div>
                  <div className="mb-8">
                    <p className="text-[13px] text-gray-600 mb-1">
                      Publishing to: <span className="font-semibold text-gray-900">{formData.author || 'Your Name'}</span>
                    </p>
                  </div>

                  {/* Author Name Input */}
                  <div className="mb-6">
                    <label className="block text-[13px] text-gray-700 mb-2">
                      Your name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="Enter your name"
                      className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    />
                  </div>

                  {/* Topics/Tags */}
                  <div className="mb-6">
                    <label className="block text-[13px] text-gray-700 mb-2">
                      Add or change topics (up to 5) so readers know what your story is about
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="Add a topic..."
                      className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    />
                    <p className="mt-1 text-[12px] text-gray-500">
                      Separate tags with commas (e.g., coding, tutorial, react)
                    </p>
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <label className="block text-[13px] text-gray-700 mb-2">
                      Category <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Technology"
                      className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    />
                  </div>

                  {/* Cover Image URL */}
                  <div className="mb-6">
                    <label className="block text-[13px] text-gray-700 mb-2">
                      Cover image URL <span className="text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.coverImage}
                      onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
                    />
                  </div>

                  {/* Learn More Link */}
                  <a href="#" className="inline-block text-[13px] text-green-600 hover:text-green-700 mb-8 underline">
                    Learn more
                  </a>
                  <span className="text-[13px] text-gray-600"> about what happens to your story when you publish.</span>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-3 mt-8 pt-8 border-t border-gray-200">
                    <button
                      onClick={handlePublish}
                      disabled={publishing || !formData.author}
                      className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-[14px] rounded-full transition-colors font-medium"
                    >
                      {publishing ? 'Publishing...' : 'Publish now'}
                    </button>
                    <button
                      className="px-4 py-1.5 text-[14px] text-gray-600 hover:text-gray-900 font-medium"
                    >
                      Schedule for later
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
