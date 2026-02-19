import React from 'react';

export function Field({
  label,
  children,
  hint,
  error,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
}) {
  return (
    <div className="field">
      <label className="field__label">{label}</label>
      {children}
      {error ? <div className="field__error">{error}</div> : hint ? <div className="field__hint">{hint}</div> : null}
    </div>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="section-title">
      <div className="section-title__title">{title}</div>
      {subtitle ? <div className="section-title__subtitle">{subtitle}</div> : null}
    </div>
  );
}

export function Divider() {
  return <div className="divider" />;
}
