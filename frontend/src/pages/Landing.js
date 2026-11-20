import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { format, isValid } from 'date-fns';
import ThemeMenu from '../components/ThemeMenu';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';
import { getAllPosts } from '../api/api';

function StoryCard({ post, featured = false }) {
  const date = new Date(post.createdAt);
  const [imageFailed, setImageFailed] = useState(false);
  const content = DOMPurify.sanitize(post.content || '', {
    ALLOWED_TAGS: ['img'], ALLOWED_ATTR: ['src'], RETURN_DOM_FRAGMENT: true
  });
  const image = post.coverImage || content.querySelector('img')?.getAttribute('src');
  const showImage = image && /^(https?:\/\/|\/(?!\/)|data:image\/(png|jpe?g|webp|avif|gif);base64,)/i.test(image) && !imageFailed;
  return (
    <Link to={'/post/' + encodeURIComponent(post.slug)} className={'landing-story group ' + (featured ? 'landing-story-featured' : '')}>
      {featured && (showImage
        ? <img className="landing-cover" src={image} alt="" onError={() => setImageFailed(true)} />
        : <div className="landing-cover landing-cover-pattern" aria-hidden="true" />)}
      <div className="p-5 sm:p-6">
        <p className="text-sm text-[var(--theme-muted)]">{post.author || 'Anonymous'}</p>
        <h3 className="mt-2 font-spectral text-2xl font-bold leading-tight group-hover:underline">{post.title}</h3>
        <p className="mt-3 text-sm text-[var(--theme-muted)]">
          {isValid(date) && <>{format(date, 'd MMM')} · </>}{post.readTime || 5} min read
        </p>
      </div>
    </Link>
  );
}

export default function Landing() {
  const [signup, setSignup] = useState(false);
  const [posts, setPosts] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    let active = true;
    getAllPosts().then(({ data }) => {
      if (!active) return;
      const published = (data.data || []).filter(post => post.slug);
      published.sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
        (b.likeCount || 0) - (a.likeCount || 0) || new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(published.slice(0, 7));
    }).catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, []);

  if (isAuthenticated) return <Navigate to="/home" replace />;
  const [featured, ...stories] = posts || [];

  return (
    <div className="min-h-screen bg-[var(--theme-track)]">
      <header className="border-b border-[var(--theme-line)] bg-[var(--theme-panel)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
          <Link to="/" className="font-spectral text-2xl font-bold sm:text-3xl">TechBlog</Link>
          <nav aria-label="Main" className="flex items-center gap-3 sm:gap-5">
            <a href="#stories" className="hidden text-sm font-medium hover:underline sm:inline">Stories</a>
            <ThemeMenu />
            <Link to="/signin" className="whitespace-nowrap text-sm font-medium hover:underline">Sign in</Link>
            <button type="button" onClick={() => setSignup(true)} className="landing-primary">Join TechBlog</button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 sm:px-8">
        <section className="grid items-center gap-10 border-b border-[var(--theme-line)] py-12 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:gap-16 lg:py-20">
          <div>
            <h1 className="font-spectral text-[clamp(2.8rem,6.5vw,5.5rem)] font-semibold leading-[0.99] tracking-tight">
              Technology, <span className="text-[var(--theme-accent)]">explained.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-[var(--theme-muted)]">
              Explore ideas in AI, software, and infrastructure from the people building with them.
            </p>
            <a href="#stories" className="landing-primary mt-7 inline-flex items-center gap-3">Explore stories <span aria-hidden="true">↓</span></a>
          </div>
          {featured && <div><p className="mb-3 text-sm font-semibold text-[var(--theme-muted)]">Featured story</p><StoryCard key={featured.id} post={featured} featured /></div>}
        </section>

        <section id="stories" className="scroll-mt-5 py-10 sm:py-12" aria-labelledby="stories-heading">
          <h2 id="stories-heading" className="mb-6 font-spectral text-3xl font-bold">Explore stories</h2>
          {loadError ? <p role="status">Stories are temporarily unavailable.</p> : !posts ? <p role="status">Loading stories…</p> : !posts.length ? <p>No stories have been published yet.</p> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(stories.length ? stories : [featured]).map(post => <StoryCard key={post.id} post={post} />)}
            </div>
          )}
        </section>
      </main>
      {signup && <AuthModal isOpen mode="signup" onClose={() => setSignup(false)} />}
    </div>
  );
}
