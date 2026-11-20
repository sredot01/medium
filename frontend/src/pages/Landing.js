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
    ALLOWED_TAGS: ['img', 'p', 'div', 'li', 'br', 'blockquote'],
    ALLOWED_ATTR: ['src'],
    RETURN_DOM_FRAGMENT: true
  });
  const safeImage = source => /^(https?:\/\/|\/(?!\/)|data:image\/(png|jpe?g|webp|avif|gif);base64,)/i.test(source || '');
  const image = [post.coverImage, content.querySelector('img')?.getAttribute('src')].find(safeImage);
  content.querySelectorAll('p, div, li, br, blockquote').forEach(node => node.after(' '));
  const opening = content.textContent.replace(/(^|\s)#{1,6}\s+/g, '$1').replace(/\s+/g, ' ').trim();
  const limit = featured ? 310 : 230;
  const excerpt = opening.length > limit ? opening.slice(0, limit).replace(/\s+\S*$/, '') + '…' : opening;
  const showImage = image && !imageFailed;
  const Heading = featured ? 'h2' : 'h3';
  return (
    <article className={featured ? 'editorial-lead' + (showImage ? '' : ' editorial-lead-text') : 'editorial-row'}>
      {showImage && (
        <Link tabIndex={-1} aria-hidden="true" to={'/post/' + encodeURIComponent(post.slug)} className="editorial-image">
          <img src={image} alt="" loading={featured ? 'eager' : 'lazy'} onError={() => setImageFailed(true)} />
        </Link>
      )}
      <div className="editorial-story-copy">
        {featured && <p className="editorial-label">Featured analysis</p>}
        <Heading className="font-spectral">
          <Link to={'/post/' + encodeURIComponent(post.slug)}>{post.title}</Link>
        </Heading>
        {excerpt && <p className="editorial-excerpt">{excerpt}</p>}
        <p className="editorial-byline">
          <strong>{post.author || 'Anonymous'}</strong>
          {isValid(date) && <> · <time dateTime={date.toISOString()}>{format(date, 'd MMM yyyy')}</time></>}
          {post.readTime > 0 && <> · {post.readTime} min read</>}
        </p>
        {featured && <Link to={'/post/' + encodeURIComponent(post.slug)} className="editorial-read">Read the analysis <span aria-hidden="true">↗</span></Link>}
      </div>
    </article>
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
          <nav aria-label="Main" className="flex flex-wrap items-center justify-end gap-2 sm:gap-5">
            <a href="#stories" className="hidden text-sm font-medium hover:underline sm:inline">Stories</a>
            <Link to="/ai" className="whitespace-nowrap text-sm font-semibold text-[var(--theme-accent)] hover:underline">AI Research</Link>
            <ThemeMenu />
            <Link to="/signin" className="whitespace-nowrap text-sm font-medium hover:underline">Sign in</Link>
            <button type="button" onClick={() => setSignup(true)} className="landing-primary">Join TechBlog</button>
          </nav>
        </div>
      </header>

      <main className="editorial-shell">
        <div className="editorial-masthead editorial-masthead-accent">
          <h1 className="font-spectral">Technology and the decisions behind it.</h1>
          <p>Analysis for leaders making decisions about AI, software, and infrastructure.</p>
        </div>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link className="landing-primary" to="/ai">Explore AI research</Link>
            <a className="self-center text-sm font-semibold hover:underline" href="#stories">Browse stories ↓</a>
          </div>
        {featured && <StoryCard key={featured.id} post={featured} featured />}

        <section id="stories" className="editorial-stories scroll-mt-5" aria-labelledby="stories-heading">
          <h2 id="stories-heading" className="font-spectral text-3xl font-bold">{featured ? 'More to read' : 'Stories'}</h2>
          {loadError ? <p role="status">Stories are temporarily unavailable.</p> : !posts ? (
            <p role="status">Loading stories…</p>
          ) : !posts.length ? <p>No stories have been published yet.</p> : stories.length ? (
            stories.map(post => <StoryCard key={post.id} post={post} />)
          ) : <p>Check back for the next story.</p>}
        </section>
      </main>
      <footer className="border-t border-[var(--theme-line)]">
        <nav aria-label="Legal" className="editorial-shell flex flex-wrap gap-6 py-6 text-sm">
          <Link className="hover:underline" to="/privacy">Privacy Policy</Link>
          <Link className="hover:underline" to="/terms">Terms of Service</Link>
        </nav>
      </footer>
      {signup && <AuthModal isOpen mode="signup" onClose={() => setSignup(false)} />}
    </div>
  );
}
