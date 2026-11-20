import CommentThread from '../components/CommentThread';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import DOMPurify from 'dompurify';
import PostAI from '../components/PostAI';
import PostAILayout from '../components/PostAILayout';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, parseISO, isValid } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import {
  getPostBySlug,
  likePost,
  unlikePost,
  getPostLikes,
  createComment,
  getPostComments,
  deleteComment,
  deletePost,
  bookmarkPost,
  removeBookmark,
  checkBookmark,
  recordView,
  recordRead,
} from '../api/api';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function ViewPost() {
  const notify = useToast();
  const confirm = useConfirm();
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  
  // Likes & Comments State
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (slug) fetchPost();
  }, [slug]);

  useEffect(() => {
    if (!post?.id) return;
    fetchLikes(post.id);
    if (isAuthenticated) checkIfBookmarked(post.id);
    else setBookmarked(false);
  }, [post?.id, isAuthenticated, user?.id]);

  useEffect(() => {
    if (!post?.id) return;
    const timer = setTimeout(() => {
      recordRead(post.id).catch(err => console.error('Error recording read:', err));
    }, 30000);
    return () => clearTimeout(timer);
  }, [post?.id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await getPostBySlug(slug);
      const postData = response.data.data || null;
      setPost(postData);
      
      if (postData) {
        // Record view immediately
        recordView(postData.id).catch(err => console.error('Error recording view:', err));
        
        fetchComments(postData.id);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikes = async (postId) => {
    try {
      const response = await getPostLikes(postId);
      // Backend might return { data: { likes: [], count: 0 } } or { data: [] }
      const likes = response.data.data?.likes || response.data.data || [];
      setLikeCount(Array.isArray(likes) ? likes.length : 0);
      setLiked(Array.isArray(likes) ? likes.some(like => like.userId === user?.id) : false);
    } catch (error) {
      console.error('Error fetching likes:', error);
      setLikeCount(0);
      setLiked(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await getPostComments(postId);
      // Backend returns { data: { comments: [], count: 0 } }
      const commentsData = response.data.data?.comments || response.data.data || [];
      // Ensure we always set an array
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]); // Set empty array on error
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated || !post) return;
    
    try {
      if (liked) {
        await unlikePost(post.id);
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await likePost(post.id);
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !newComment.trim() || !post) return;
    
    try {
      setSubmittingComment(true);
      await createComment(post.id, { content: newComment });
      setNewComment('');
      // Refresh comments after posting
      await fetchComments(post.id);
    } catch (error) {
      console.error('Error posting comment:', error);
      notify('Failed to post comment', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!await confirm({ title: 'Delete this comment?', message: 'This action cannot be undone.', action: 'Delete comment' })) return;
    
    try {
      await deleteComment(commentId);
      await fetchComments(post.id);
      notify('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      notify('Failed to delete comment', 'error');
    }
  };

  const handleDeletePost = async () => {
    if (!await confirm({ title: 'Delete this post?', message: 'This will permanently remove the post. This action cannot be undone.', action: 'Delete post' })) return;
    
    try {
      await deletePost(post.id);
      notify('Post deleted successfully');
      navigate('/stories');
    } catch (error) {
      console.error('Error deleting post:', error);
      notify('Failed to delete post', 'error');
    }
  };

  const handleEditPost = () => {
    navigate(`/edit/${post.id}`);
  };

  const checkIfBookmarked = async (postId) => {
    try {
      const response = await checkBookmark(postId);
      setBookmarked(response.data.data.isBookmarked);
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated || !post) return;
    
    try {
      if (bookmarked) {
        await removeBookmark(post.id);
        setBookmarked(false);
      } else {
        await bookmarkPost(post.id);
        setBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      // Parse the ISO string and format as "5 Oct 2024"
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'd MMM yyyy');
      }
      // Try parsing as regular Date if ISO fails
      const fallbackDate = new Date(dateString);
      if (!isNaN(fallbackDate.getTime())) {
        return format(fallbackDate, 'd MMM yyyy');
      }
      return 'Recently';
    } catch (error) {
      console.error('Date parsing error:', error);
      return 'Recently';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header onMenuClick={isAuthenticated ? () => setSidebarOpen(!sidebarOpen) : undefined} />
        {isAuthenticated && <Sidebar isOpen={sidebarOpen} />}
        <div className={`flex justify-center items-center h-[calc(100vh-200px)] transition-all duration-300 ${
          isAuthenticated && sidebarOpen ? 'lg:ml-[240px]' : 'ml-0'
        }`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <Header onMenuClick={isAuthenticated ? () => setSidebarOpen(!sidebarOpen) : undefined} />
        {isAuthenticated && <Sidebar isOpen={sidebarOpen} />}
        <div className={`flex justify-center items-center h-[calc(100vh-200px)] transition-all duration-300 ${
          isAuthenticated && sidebarOpen ? 'lg:ml-[240px]' : 'ml-0'
        }`}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Post not found</h2>
            <Link to={isAuthenticated ? "/home" : "/"} className="text-green-600 hover:text-green-700">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onMenuClick={isAuthenticated ? () => setSidebarOpen(!sidebarOpen) : undefined} />
      {isAuthenticated && <Sidebar isOpen={sidebarOpen} />}

      <div className={`transition-all duration-300 ${isAuthenticated && sidebarOpen ? 'lg:ml-[240px]' : 'ml-0'} pt-14`}>
        {/* Article Container */}
        <PostAILayout assistant={isAuthenticated ? <PostAI key={post.slug} slug={post.slug} /> : null}>
        <article className="mx-auto max-w-3xl pb-12 xl:pt-12">
          {/* Title */}
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center mb-8 pb-8 border-b border-gray-200">
            <Link to={`/profile/${post.userId}`} className="flex items-center hover:opacity-80">
              {post.authorAvatar ? (
                <img
                  src={post.authorAvatar}
                  alt={post.author}
                  className="w-12 h-12 rounded-full object-cover mr-3"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold mr-3">
                  {post.author?.charAt(0) || 'A'}
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-gray-900 hover:underline">
                  {post.author || 'Anonymous'}
                </div>
                <div className="flex items-center text-sm text-gray-500 space-x-2">
                  <span>{formatDate(post.createdAt)}</span>
                  <span>·</span>
                  <span>{post.readTime || 5} min read</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Engagement Bar */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-6">
              {/* Like Button */}
              <button
                onClick={handleLike}
                disabled={!isAuthenticated}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition"
              >
                <svg
                  className={`w-6 h-6 ${liked ? 'fill-red-500 text-red-500' : ''}`}
                  fill={liked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{likeCount}</span>
              </button>

              {/* Comment Count */}
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>{comments.length}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Edit and Delete buttons - only for post author */}
              {user && post.userId === user.id && (
                <>
                  <button
                    onClick={handleEditPost}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-full transition"
                    title="Edit post"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDeletePost}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-full transition"
                    title="Delete post"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </>
              )}
              
              {isAuthenticated && <button
                onClick={handleBookmark}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                <svg
                  className={`w-5 h-5 ${bookmarked ? 'fill-gray-900 text-gray-900' : 'text-gray-600'}`}
                  fill={bookmarked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
              </button>}
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Cover Image */}
          {post.coverImage && post.coverImage.length > 0 && (
            <div className="mb-12">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-auto rounded-lg max-h-[500px] object-cover"
                onError={(e) => {
                  console.error('Cover image failed to load');
                  console.error('Image src:', post.coverImage?.substring(0, 100));
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}


          {/* Content */}
          <div
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-12">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Comments Section */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-2xl font-bold mb-6">
              Responses ({comments.length})
            </h3>

            {/* Comment Form */}
            {isAuthenticated ? <form onSubmit={handleCommentSubmit} className="mb-8">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="What are your thoughts?"
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      type="button"
                      onClick={() => setNewComment('')}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || submittingComment}
                      className="px-6 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                    >
                      {submittingComment ? 'Posting...' : 'Respond'}
                    </button>
                  </div>
                </div>
              </div>
            </form> : <p className="mb-8 text-sm"><Link className="text-green-600 underline" to="/">Sign in</Link> to respond.</p>}

            <CommentThread key={post.id} comments={comments} postId={post.id} user={user}
              reload={fetchComments} onDelete={handleDeleteComment} formatDate={formatDate} />
          </div>
        </article>
        </PostAILayout>
      </div>
    </div>
  );
}
