import { useEffect, useId, useRef, useState } from 'react';
import { ComputerDesktopIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { accents, modes, useTheme } from '../context/ThemeContext';

const icons = { system: ComputerDesktopIcon, light: SunIcon, dark: MoonIcon };

export default function ThemeMenu() {
  const { mode, accent, setMode, setAccent } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapper = useRef(null);
  const trigger = useRef(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function dismissOutside(event) {
      if (!wrapper.current?.contains(event.target)) setOpen(false);
    }
    function dismissOnEscape(event) {
      if (event.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    }
    document.addEventListener('pointerdown', dismissOutside);
    document.addEventListener('keydown', dismissOnEscape);
    return () => {
      document.removeEventListener('pointerdown', dismissOutside);
      document.removeEventListener('keydown', dismissOnEscape);
    };
  }, [open]);

  return (
    <div ref={wrapper} className="theme-menu">
      <button
        ref={trigger}
        type="button"
        className="theme-trigger"
        aria-label="Theme settings"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen(value => !value)}
      >
        <SunIcon aria-hidden="true" />
      </button>
      {open && (
        <div id={panelId} className="theme-panel">
          <fieldset>
            <legend>Theme</legend>
            <div className="theme-options">
              {modes.map(value => {
                const Icon = icons[value];
                return (
                  <button type="button" key={value} aria-pressed={mode === value} onClick={() => setMode(value)}>
                    <Icon aria-hidden="true" />
                    {value}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend>Accent colour</legend>
            <div className="theme-swatches">
              {accents.map(({ id, label, swatch }) => (
                <button
                  type="button"
                  key={id}
                  aria-label={label}
                  title={label}
                  aria-pressed={accent === id}
                  style={{ backgroundColor: swatch }}
                  onClick={() => setAccent(id)}
                />
              ))}
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
