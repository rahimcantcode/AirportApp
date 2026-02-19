import React from 'react';
import { useApp } from '../context/AppContext';

export function ToastStack() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="toast-stack" aria-live="polite" aria-relevant="additions removals">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`}>
          <div className="toast__header">
            <div className="toast__title">{t.title}</div>
            <button className="toast__close" onClick={() => removeToast(t.id)} aria-label="Close">
              ×
            </button>
          </div>
          {t.message ? <div className="toast__message">{t.message}</div> : null}
        </div>
      ))}
    </div>
  );
}
