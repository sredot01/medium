import { useEffect, useState } from 'react';
import { generatePostDraft, getAIProviders, summarizePost } from '../api/api';

const providerNames = { gemini: 'Gemini', ollama: 'Ollama' };

export default function PostAI({ slug, onInsert }) {
  const drafting = !slug;
  const [open, setOpen] = useState(false);
  const [providers, setProviders] = useState(null);
  const [provider, setProvider] = useState('');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    getAIProviders()
      .then(({ data }) => {
        if (!active) return;
        setProviders(data.data);
        setProvider(current => data.data.includes(current) ? current : data.data[0] || '');
      })
      .catch(() => {
        if (!active) return;
        setProviders([]);
        setError('Could not load AI providers. Close and reopen to try again.');
      });
    return () => { active = false; };
  }, [open]);

  async function generate() {
    setError('');
    setResult('');
    setLoading(true);
    try {
      const { data } = drafting
        ? await generatePostDraft({ prompt, provider })
        : await summarizePost({ slug, provider });
      setResult(data.data.text);
    } catch (failure) {
      setError(failure.response?.data?.message || 'Could not generate text. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="my-5 text-sm">
      <button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}
        className="rounded-full border border-gray-300 bg-white px-4 py-2 font-medium">
        {drafting ? 'Write with AI' : 'Summarize with AI'}
      </button>
      {open && (
        <div className="mt-3 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          {providers === null && <p role="status">Loading AI providers…</p>}
          {providers?.length === 0 && !error && <p>No AI provider is configured.</p>}
          {providers?.length > 0 && (
            <>
              <label className="flex items-center gap-2">
                AI provider
                <select value={provider} onChange={event => setProvider(event.target.value)} disabled={loading}
                  className="rounded-md border border-gray-300 bg-white p-2">
                  {providers.map(id => <option key={id} value={id}>{providerNames[id] || id}</option>)}
                </select>
              </label>
              {drafting && (
                <label className="block">
                  What should the post cover?
                  <textarea value={prompt} onChange={event => setPrompt(event.target.value)} maxLength={2000}
                    rows={3} className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-3" />
                </label>
              )}
              <button type="button" disabled={loading || !provider || (drafting && prompt.trim().length < 8)}
                onClick={generate} className="rounded-full bg-green-600 px-4 py-2 font-medium text-white disabled:opacity-50">
                {loading ? 'Generating…' : drafting ? 'Generate draft' : 'Generate summary'}
              </button>
            </>
          )}
          {error && <p role="alert" className="text-red-700">{error}</p>}
          {result && (
            <div aria-live="polite" className="space-y-3">
              <p className="max-h-80 overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-gray-200 bg-white p-3">{result}</p>
              {drafting && (
                <button type="button" onClick={() => { onInsert(result); setResult(''); setOpen(false); }}
                  className="rounded-full border border-gray-300 bg-white px-4 py-2 font-medium">
                  Append to post
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function appendDraft(html, draft) {
  const escape = text => text.replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  return html + draft.split(/\n\s*\n/).map(paragraph =>
    '<p>' + escape(paragraph).replace(/\n/g, '<br>') + '</p>').join('');
}
