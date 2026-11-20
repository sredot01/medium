import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ToastContext = createContext(null);

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const sequence = useRef(0);

  const notify = useCallback((message, type = 'success') => {
    const id = ++sequence.current;
    setToasts(current => [...current.slice(-2), { id, message, type }]);
  }, []);

  const dismiss = useCallback(id => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col gap-2 sm:left-auto sm:w-[360px]">
        {toasts.map(toast => <Toast key={toast.id} {...toast} dismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  );
}

function Toast({ id, message, type, dismiss }) {
  const failed = type === 'error';
  const Icon = failed ? ExclamationCircleIcon : CheckCircleIcon;

  useEffect(() => {
    const timer = setTimeout(() => dismiss(id), failed ? 8000 : 5000);
    return () => clearTimeout(timer);
  }, [dismiss, failed, id]);

  return (
    <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-lg">
      <Icon aria-hidden="true" className={`h-5 w-5 shrink-0 ${failed ? 'text-red-700' : 'text-green-700'}`} />
      <p role={failed ? 'alert' : 'status'} className="min-w-0 flex-1 break-words text-sm font-medium">{message}</p>
      <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(id)} className="shrink-0 rounded text-gray-600 hover:text-gray-900">
        <XMarkIcon aria-hidden="true" className="h-5 w-5" />
      </button>
    </div>
  );
}
