import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ConfirmContext = createContext(null);
export const useConfirm = () => useContext(ConfirmContext);

export function ConfirmProvider({ children }) {
  const [options, setOptions] = useState(null);
  const dialog = useRef(null);
  const cancel = useRef(null);
  const pending = useRef(null);

  const confirm = useCallback(details => {
    if (pending.current) return Promise.resolve(false);
    return new Promise(resolve => {
      pending.current = resolve;
      setOptions(details);
    });
  }, []);

  const finish = useCallback(accepted => {
    dialog.current?.close();
    const resolve = pending.current;
    pending.current = null;
    setOptions(null);
    resolve?.(accepted);
  }, []);

  useEffect(() => {
    if (options && !dialog.current.open) {
      dialog.current.showModal();
      cancel.current.focus();
    }
  }, [options]);

  useEffect(() => () => pending.current?.(false), []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog ref={dialog} aria-labelledby="confirmation-title" aria-describedby="confirmation-message"
        onCancel={event => { event.preventDefault(); finish(false); }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-gray-200 bg-white p-6 text-gray-900 shadow-xl backdrop:bg-black/50">
        {options && (
          <>
            <h2 id="confirmation-title" className="text-xl font-semibold">{options.title}</h2>
            <p id="confirmation-message" className="mt-2 text-sm text-gray-600">{options.message}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button ref={cancel} type="button" onClick={() => finish(false)}
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium">Cancel</button>
              <button type="button" onClick={() => finish(true)}
                className="rounded-full bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800">
                {options.action}
              </button>
            </div>
          </>
        )}
      </dialog>
    </ConfirmContext.Provider>
  );
}
