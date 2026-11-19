import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPostById, updatePost } from '../api/api';
import { useAuth } from '../context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function EditPost() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchPost();
  }, [id, user, navigate]);

  // Helper function to strip HTML and get plain text
  const stripHtmlAndImages = (html) => {
    if (!html) return '';
    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    // Remove all img tags
    const images = temp.getElementsByTagName('img');
    while (images.length > 0) {
      images[0].parentNode.removeChild(images[0]);
    }
    // Get text content only
    return temp.textContent || temp.innerText || '';
  };

  const fetchPost = async () => {
    try {
      const response = await getPostById(id);
      const post = response.data.data;

      // Check if user owns this post
      if (post.userId !== user.id) {
        alert('You can only edit your own posts');
        navigate('/stories');
        return;
      }

      setTitle(post.title);
      setContent(post.content);
      // Strip HTML and images from excerpt
      const cleanExcerpt = stripHtmlAndImages(post.excerpt || post.content);
      setExcerpt(cleanExcerpt.substring(0, 200));
      setCategory(post.category || '');
      setTags(post.tags ? post.tags.join(', ') : '');
      setCoverImage(post.coverImage || '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      alert('Failed to load post');
      navigate('/stories');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    if (!content.trim()) {
      alert('Please write some content');
      return;
    }

    try {
      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Generate clean excerpt if not provided
      let cleanExcerpt = excerpt;
      if (!cleanExcerpt || cleanExcerpt.trim() === '') {
        cleanExcerpt = stripHtmlAndImages(content).substring(0, 160) + '...';
      }

      const postData = {
        title,
        content,
        excerpt: cleanExcerpt,
        category: category || 'Uncategorized',
        tags: tagsArray,
        coverImage: coverImage || '',
      };

      await updatePost(id, postData);
      navigate('/stories');
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'],
    ],
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center">Loading post...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/stories')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Stories
        </button>
        <button
          onClick={() => setShowPublishModal(true)}
          className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition"
        >
          Update
        </button>
      </div>

      {/* Title Input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        className="w-full text-4xl font-bold mb-6 outline-none border-none focus:ring-0"
      />

      {/* Content Editor */}
      <ReactQuill
        theme="snow"
        value={content}
        onChange={setContent}
        modules={modules}
        placeholder="Tell your story..."
        className="mb-8"
        style={{ minHeight: '400px' }}
      />

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Left: Story Preview */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Story Preview</h3>
                
                {/* Cover Image */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Cover Image
                  </label>
                  {coverImage ? (
                    <div className="relative">
                      <img
                        src={coverImage}
                        alt="Cover"
                        className="w-full h-48 object-cover rounded mb-2"
                      />
                      <button
                        onClick={() => setCoverImage('')}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400">
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="flex flex-col items-center justify-center h-full">
                        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-500">Upload cover image</p>
                      </div>
                    </label>
                  )}
                </div>

                {/* Title Preview */}
                <h2 className="text-2xl font-bold mb-2">{title || 'Your title'}</h2>
                
                {/* Excerpt Preview */}
                <p className="text-gray-600 mb-4">
                  {excerpt || 'Your excerpt will appear here...'}
                </p>
              </div>

              {/* Right: Publishing Details */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Publishing details
                </h3>

                {/* Excerpt */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Excerpt (optional)
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Write a short excerpt..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Technology, Design"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., React, JavaScript, Web Development"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex space-x-4">
                  <button
                    onClick={handlePublish}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition font-medium"
                  >
                    Update story
                  </button>
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

