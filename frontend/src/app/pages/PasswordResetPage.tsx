import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Field, SectionTitle } from '../components/ui';
import { isPasswordValid } from '../utils/validation';

export function PasswordResetPage() {
  const { resetPassword, addToast } = useApp();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = 'Username is required.';
    if (!newPassword) e.newPassword = 'New password is required.';
    if (newPassword && !isPasswordValid(newPassword)) e.newPassword = 'Password must be at least 6 characters and include letters and digits.';
    if (!confirm) e.confirm = 'Please confirm the new password.';
    if (confirm && newPassword && confirm !== newPassword) e.confirm = 'Passwords do not match.';
    return e;
  }, [username, newPassword, confirm]);

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (Object.keys(errors).length > 0) {
      addToast({ type: 'error', title: 'Fix the reset fields', message: 'Please correct the validation issues.' });
      return;
    }
    const res = resetPassword(username.trim(), newPassword);
    if (!res.ok) {
      addToast({ type: 'error', title: 'Reset failed', message: res.error || 'Could not reset password.' });
      return;
    }
    addToast({ type: 'success', title: 'Password updated', message: 'You can now sign in with the new password.' });
    window.location.hash = '';
  };

  return (
    <div className="auth">
      <SectionTitle title="Password Reset" subtitle="Set a new password. Your old password will not be shown." />

      <form className="form" onSubmit={onSubmit}>
        <Field label="Username" error={errors.username}>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </Field>

        <Field label="New password" error={errors.newPassword}>
          <input className="input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </Field>

        <Field label="Confirm new password" error={errors.confirm}>
          <input className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </Field>

        <div className="row row--between">
          <a className="link" href="#">
            Back to login
          </a>
          <button className="btn" type="submit">
            Update password
          </button>
        </div>
      </form>
    </div>
  );
}
