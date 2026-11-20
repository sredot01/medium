import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ThemeMenu from '../components/ThemeMenu';
import { getAllPosts } from '../api/api';

const papers = [
  ['Model architecture', 'Attention Is All You Need', '1706.03762', 'How self-attention replaced recurrence in the Transformer.'],
  ['Retrieval', 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks', '2005.11401', 'How a language model can use retrieved documents alongside its learned parameters.'],
  ['Fine-tuning', 'LoRA: Low-Rank Adaptation of Large Language Models', '2106.09685', 'How low-rank updates reduce the number of parameters trained during adaptation.'],
  ['Systems', 'FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness', '2205.14135', 'How reducing memory transfers makes exact attention more efficient.'],
  ['Alignment', 'Direct Preference Optimization: Your Language Model is Secretly a Reward Model', '2305.18290', 'How to train directly on preference pairs without a separate reward model training step.'],
  ['Scaling', 'Scaling Laws for Neural Language Models', '2001.08361', 'How model size, dataset size, and compute relate to language-model training loss.']
];

export default function AIResearch() {
  const [posts, setPosts] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    getAllPosts().then(({ data }) => {
      if (!active) return;
      const research = (data.data || []).filter(post =>
        post.slug && [post.category, ...(post.tags || [])].some(label =>
          String(label).trim().toLowerCase() === 'ai research'
        )
      );
      setPosts(research);
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--theme-track)]">
      <header className="border-b border-[var(--theme-line)] bg-[var(--theme-panel)]">
        <nav aria-label="Main" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link to="/" className="font-spectral text-2xl font-bold">TechBlog</Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm hover:underline">Stories</Link>
            <Link to="/ai" aria-current="page" className="text-sm font-semibold text-[var(--theme-accent)]">AI Research</Link>
            <ThemeMenu />
          </div>
        </nav>
      </header>
      <main className="editorial-shell">
        <div className="editorial-masthead editorial-masthead-accent">
          <h1 className="font-spectral">AI Research</h1>
          <p>Read the original papers and explore what their findings mean in practice.</p>
        </div>
        <section className="editorial-stories" aria-labelledby="writeups">
          <h2 id="writeups" className="font-spectral text-3xl font-bold">TechBlog write-ups</h2>
          {failed ? <p className="mt-3" role="status">Write-ups are temporarily unavailable.</p> : posts === null ? (
            <p className="mt-3" role="status">Loading write-ups…</p>
          ) : posts.length ? (
            <ul className="mt-3 divide-y divide-[var(--theme-line)]">
              {posts.map(post => <li key={post.id} className="py-3"><Link className="font-spectral text-xl font-semibold hover:underline" to={'/post/' + encodeURIComponent(post.slug)}>{post.title}</Link></li>)}
            </ul>
          ) : <p className="mt-3 text-[var(--theme-muted)]">Research write-ups will appear here as they’re published.</p>}
        </section>
        <section className="editorial-stories" aria-labelledby="papers">
          <h2 id="papers" className="mb-5 font-spectral text-3xl font-bold">Paper library</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {papers.map(([topic, title, id, summary]) => (
              <li key={id} className="rounded-lg border border-[var(--theme-line)] bg-[var(--theme-panel)] p-5">
                <p className="editorial-label">{topic}</p>
                <h3 className="font-spectral text-xl font-semibold leading-tight">{title}</h3>
                <p className="my-3 text-sm leading-relaxed text-[var(--theme-muted)]">{summary}</p>
                <a className="text-sm font-semibold text-[var(--theme-accent)] underline" href={'https://arxiv.org/abs/' + id} aria-label={'Read ' + title + ' on arXiv'}>Read on arXiv ↗</a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
