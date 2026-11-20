import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createComment, setCommentLike } from '../api/api';
import { useToast } from '../context/ToastContext';

export default function CommentThread({ comments, postId, user, reload, onDelete, formatDate }) {
  const notify = useToast();
  const { hash } = useLocation();
  const [replyTo, setReplyTo] = useState(null);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);
  const [liking, setLiking] = useState(null);

  const thread = useMemo(() => {
    const parents = new Map();
    const ids = new Set(comments.map(comment => comment.id));
    for (const comment of comments) {
      const parent = ids.has(comment.parentId) ? comment.parentId : null;
      if (!parents.has(parent)) parents.set(parent, []);
      parents.get(parent).push(comment);
    }
    const ordered = [];
    const stack = (parents.get(null) || []).slice().reverse().map(comment => ({ comment, depth: 0 }));
    while (stack.length) {
      const entry = stack.pop();
      ordered.push(entry);
      for (const comment of parents.get(entry.comment.id) || []) {
        stack.push({ comment, depth: entry.depth + 1 });
      }
    }
    return ordered;
  }, [comments]);

  useEffect(() => {
    if (hash.startsWith('#comment-')) document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'center' });
  }, [hash, thread]);

  async function submitReply(event) {
    event.preventDefault();
    if (!reply.trim() || replying) return;
    setReplying(true);
    try {
      await createComment(postId, { content: reply, parentId: replyTo });
      setReply('');
      setReplyTo(null);
      await reload(postId);
    } catch (error) {
      notify(error.response?.data?.message || 'Could not post the reply.', 'error');
    } finally {
      setReplying(false);
    }
  }

  async function toggleLike(comment) {
    if (liking) return;
    setLiking(comment.id);
    try {
      await setCommentLike(comment.id, !comment.liked);
      await reload(postId);
    } catch {
      notify('Could not update the comment like.', 'error');
    } finally {
      setLiking(null);
    }
  }

  return (
    <div className="space-y-5">
      {thread.map(({ comment, depth }) => (
        <div key={comment.id} id={'comment-' + comment.id}
          className={`scroll-mt-20 flex items-start gap-3 ${depth ? 'border-l border-gray-200 pl-2 sm:pl-3' : ''}`}
          style={{ marginInlineStart: Math.min(depth, 4) * 12 }}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-teal-500 font-semibold text-white">
            {comment.user?.avatar
              ? <img src={comment.user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
              : comment.user?.name?.trim().charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-x-2">
              <span className="text-sm font-semibold">{comment.user?.name?.trim() || 'Anonymous'}</span>
              <time className="text-xs text-gray-500">{formatDate(comment.createdAt)}</time>
            </div>
            <p className="mb-2 whitespace-pre-wrap break-words text-gray-800">{comment.content}</p>
            {user ? (
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <button type="button" aria-pressed={comment.liked} disabled={liking === comment.id}
                  onClick={() => toggleLike(comment)} className={comment.liked ? 'text-green-600' : 'hover:text-gray-900'}>
                  {comment.liked ? 'Liked' : 'Like'}{comment.likeCount ? ` · ${comment.likeCount}` : ''}
                </button>
                <button type="button" disabled={replying} onClick={() => { setReplyTo(comment.id); setReply(''); }} className="hover:text-gray-900">Reply</button>
                {user.id === comment.userId && <button type="button" className="hover:text-red-600" onClick={() => onDelete(comment.id)}>Delete</button>}
              </div>
            ) : Boolean(comment.likeCount) && <p className="text-xs text-gray-500">{comment.likeCount} {comment.likeCount === 1 ? 'like' : 'likes'}</p>}
            {replyTo === comment.id && (
              <form className="mt-3" onSubmit={submitReply}>
                <textarea autoFocus aria-label="Write a reply" placeholder="Write a reply…" value={reply} onChange={e => setReply(e.target.value)}
                  maxLength={4000} rows={2} className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm" />
                <div className="mt-2 flex justify-end gap-3 text-sm">
                  <button type="button" disabled={replying} onClick={() => setReplyTo(null)}>Cancel</button>
                  <button type="submit" disabled={replying || !reply.trim()} className="rounded-full bg-green-600 px-4 py-2 text-white disabled:opacity-50">
                    {replying ? 'Posting…' : 'Post reply'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ))}
      {!thread.length && <p className="py-8 text-center text-gray-500">No responses yet.</p>}
    </div>
  );
}
