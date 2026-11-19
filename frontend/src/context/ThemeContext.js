import { createContext, useContext, useEffect, useState } from 'react';

export const modes = ['system', 'light', 'dark'];
export const accents = [
  { id: 'coral', label: 'Coral', swatch: '#e67f66' },
  { id: 'blue', label: 'Blue', swatch: '#3b82f6' },
  { id: 'lavender', label: 'Lavender', swatch: '#9293fa' },
  { id: 'mint', label: 'Mint', swatch: '#10b981' }
];

const ThemeContext = createContext(null);
const storageKey = 'techblog-theme';

function readPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    return {
      mode: modes.includes(stored?.mode) ? stored.mode : 'system',
      accent: accents.some(({ id }) => id === stored?.accent) ? stored.accent : 'mint'
    };
  } catch {
    return { mode: 'system', accent: 'mint' };
  }
}

export function ThemeProvider({ children }) {
  const [preferences, setPreferences] = useState(readPreferences);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    function applyTheme() {
      const dark = preferences.mode === 'dark' || (preferences.mode === 'system' && media.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
      document.documentElement.dataset.accent = preferences.accent;
    }

    applyTheme();
    try {
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch {
      // Preferences still apply when browser storage is unavailable.
    }
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [preferences]);

  return (
    <ThemeContext.Provider value={{
      ...preferences,
      setMode: mode => setPreferences(current => ({ ...current, mode })),
      setAccent: accent => setPreferences(current => ({ ...current, accent }))
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
