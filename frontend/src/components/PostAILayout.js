export default function PostAILayout({ assistant, children, writing = false }) {
  const columns = writing
    ? 'max-w-[1440px] xl:grid-cols-[minmax(0,1fr)_23rem]'
    : 'max-w-6xl xl:grid-cols-[minmax(0,1fr)_18rem]';
  const panel = writing
    ? 'xl:flex xl:min-h-[calc(100dvh-6rem)] xl:flex-col'
    : '';

  return (
    <div className={`mx-auto grid w-full gap-x-8 px-4 sm:px-6 ${columns}`}>
      <aside aria-label="AI assistant"
        className={`min-w-0 self-start xl:sticky xl:top-20 xl:col-start-2 xl:row-start-1 xl:max-h-[calc(100dvh-6rem)] xl:overflow-y-auto ${panel}`}>
        <div className={writing ? 'xl:my-auto' : undefined}>{assistant}</div>
      </aside>
      <div className="min-w-0 xl:col-start-1 xl:row-start-1">
        {children}
      </div>
    </div>
  );
}
