import { useState } from 'react';
import { generatePostDraft, summarizePost } from '../api/api';

export default function PostAI({ slug, onInsert }) {
  const drafting = !slug;
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const { data } = drafting
        ? await generatePostDraft({ prompt })
        : await summarizePost({ slug });
      setResult(data.data);
    } catch (failure) {
      setError(failure.response?.data?.message || 'Could not generate text. Try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!drafting) {
    const summary = result?.summary;
    return (
      <section className="my-5 text-sm" aria-busy={loading}>
        {!result && (
          <button type="button" disabled={loading} onClick={generate}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 font-medium disabled:opacity-50">
            {loading ? 'Summarizing…' : 'Summarize with AI'}
          </button>
        )}
        {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
        {result && (
          <div aria-live="polite" className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-xl font-semibold">AI summary</h2>
            {(summary?.overview || (!summary && result.text)) && (
              <div>
                <h3 className="mb-1 font-semibold">Overview</h3>
                <p className="whitespace-pre-wrap leading-relaxed">{summary?.overview || result.text}</p>
              </div>
            )}
            {[['Key points', summary?.keyPoints], ['Takeaways', summary?.takeaways]].map(([heading, items]) =>
              items?.length > 0 && (
                <div key={heading}>
                  <h3 className="mb-1 font-semibold">{heading}</h3>
                  <ul className="list-disc space-y-1 pl-5 leading-relaxed">
                    {items.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
              )
            )}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="my-5 text-sm">
      <button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}
        className="rounded-full border border-gray-300 bg-white px-4 py-2 font-medium">
        Write with AI
      </button>
      {open && (
        <div className="mt-3 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <label className="block">
            What should the post cover?
            <textarea value={prompt} onChange={event => setPrompt(event.target.value)} maxLength={2000}
              rows={3} className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-3" />
          </label>
          <button type="button" disabled={loading || prompt.trim().length < 8}
            onClick={generate} className="rounded-full bg-green-600 px-4 py-2 font-medium text-white disabled:opacity-50">
            {loading ? 'Generating…' : 'Generate draft'}
          </button>
          {error && <p role="alert" className="text-red-700">{error}</p>}
          {result && (
            <div aria-live="polite" className="space-y-3">
              <p className="max-h-80 overflow-y-auto whitespace-pre-wrap break-words rounded-md border border-gray-200 bg-white p-3">{result.text}</p>
              <button type="button" onClick={() => { onInsert(result.text); setResult(null); setOpen(false); }}
                className="rounded-full border border-gray-300 bg-white px-4 py-2 font-medium">
                Append to post
              </button>
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
