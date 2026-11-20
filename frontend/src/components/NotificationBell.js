import { useCallback, useEffect, useRef, useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationsRead } from '../api/api';
import { useToast } from '../context/ToastContext';

const messages = {
  comment: 'commented on your post',
  reply: 'replied to your comment',
  'post-like': 'liked your post',
  'comment-like': 'liked your comment',
  follow: 'followed you',
  'new-post': 'published a new post'
};

export default function NotificationBell({ userId }) {
  const notify = useToast();
  const panel = useRef(null);
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const refresh = useCallback(async signal => {
    try {
      const { data: response } = await getNotifications({ signal });
      if (signal?.aborted) return;
      setData(response.data);
      setFailed(false);
    } catch {
      if (!signal?.aborted) setFailed(true);
    }
  }, []);

  useEffect(() => {
    setData(null);
    const controller = new AbortController();
    refresh(controller.signal);
    const timer = setInterval(() => {
      if (!document.hidden) refresh(controller.signal);
    }, 30000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [refresh, userId]);

  async function markRead(id) {
    try {
      await markNotificationsRead(id);
      await refresh();
    } catch {
      notify('Could not update notification status.', 'error');
    }
  }

  return (
    <details ref={panel} className="relative" onToggle={event => { if (event.currentTarget.open) refresh(); }}>
      <summary aria-label={data?.unread ? `Notifications, ${data.unread} unread` : 'Notifications'}
        className="relative block cursor-pointer list-none rounded-full p-2 text-gray-600 hover:bg-gray-100 [&::-webkit-details-marker]:hidden">
        <BellIcon className="h-5 w-5" aria-hidden="true" />
        {data?.unread > 0 && <span aria-hidden="true" className="absolute right-0 top-0 rounded-full bg-green-600 px-1 text-[10px] text-white">{data.unread > 99 ? '99+' : data.unread}</span>}
      </summary>
      <div className="absolute -right-3 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white text-gray-900 shadow-lg">
        <div className="flex items-center justify-between gap-2 border-b border-gray-200 p-3">
          <h2 className="font-semibold">Notifications</h2>
          {data?.unread > 0 && <button type="button" onClick={() => markRead()} className="text-xs text-green-600">Mark all as read</button>}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {failed && <p className="p-3 text-sm">Could not load notifications.</p>}
          {!data && !failed && <p className="p-3 text-sm">Loading…</p>}
          {data?.items.length === 0 && <p className="p-3 text-sm text-gray-600">No notifications yet.</p>}
          {data?.items.map(item => (
            <Link key={item.id} to={item.slug
              ? '/post/' + encodeURIComponent(item.slug) + (['comment','reply','comment-like'].includes(item.kind) ? '#comment-' + item.targetId : '')
              : '/profile/' + encodeURIComponent(item.actorId)}
              onClick={() => { if (!item.readAt) markRead(item.id); if (panel.current) panel.current.open = false; }}
              className={`block border-b border-gray-200 p-3 text-sm hover:bg-gray-100 ${item.readAt ? '' : 'bg-gray-50'}`}>
              <b>{item.actor}</b> {messages[item.kind]}
              <time className="mt-1 block text-xs text-gray-600">{new Date(item.createdAt).toLocaleString()}</time>
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}
