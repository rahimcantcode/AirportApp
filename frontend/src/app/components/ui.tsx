import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button {...props} className={`btn btn--${variant} ${className}`.trim()}>
      {children}
    </button>
  );
}

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

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="section-title">
      <div className="section-title__title">{title}</div>
      {subtitle ? <div className="section-title__subtitle">{subtitle}</div> : null}
    </div>
  );
}

export function DashboardCard({
  title,
  subtitle,
  footer,
  children,
  className = '',
}: {
  title?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`dashboard-card ${className}`.trim()}>
      {(title || subtitle) && (
        <header className="dashboard-card__header">
          {title ? <h3 className="dashboard-card__title">{title}</h3> : null}
          {subtitle ? <p className="dashboard-card__subtitle">{subtitle}</p> : null}
        </header>
      )}
      <div>{children}</div>
      {footer ? <footer className="dashboard-card__footer">{footer}</footer> : null}
    </section>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return <PageHeader title={title} subtitle={subtitle} />;
}

export function Divider() {
  return <div className="divider" />;
}
