export default function PostAILayout({ assistant, children }) {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-x-8 px-4 sm:px-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
      <aside aria-label="AI assistant"
        className="min-w-0 self-start xl:sticky xl:top-20 xl:col-start-2 xl:row-start-1 xl:max-h-[calc(100dvh-6rem)] xl:overflow-y-auto">
        {assistant}
      </aside>
      <div className="min-w-0 xl:col-start-1 xl:row-start-1">
        {children}
      </div>
    </div>
  );
}
