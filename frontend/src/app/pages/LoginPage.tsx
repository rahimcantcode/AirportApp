import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { isPasswordValid, isUsernameValid } from '../utils/validation';
import styles from './LoginPage.module.css';

export function LoginPage() {
  const { login, addToast } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = 'Username is required.';
    if (!password) e.password = 'Password is required.';
    if (username.trim() && username.trim().toLowerCase() !== 'admin' && !isUsernameValid(username.trim())) {
      e.username = 'Username format: lastname + 2 digits (example: smith01).';
    }
    if (password && !isPasswordValid(password)) {
      e.password = 'Password must be at least 6 characters and include letters and digits.';
    }
    return e;
  }, [username, password]);

  const onSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (Object.keys(errors).length > 0) {
      addToast({ type: 'error', title: 'Fix the login fields', message: 'Please correct the highlighted validation issues.' });
      return;
    }
    const res = login(username.trim(), password);
    if (!res.ok) {
      addToast({ type: 'error', title: 'Login failed', message: res.error || 'Invalid credentials.' });
      return;
    }
    addToast({ type: 'success', title: 'Welcome', message: 'You are signed in.' });
  };

  return (
    <div className={styles.hero}>
      <section className={styles.marketing}>
        <h1 className={styles.brandTitle}>Smooth Luggage</h1>
        <p className={styles.brandSub}>Airport operations dashboard for flights, passengers, gate, and baggage teams.</p>
        <ul className={styles.points}>
          <li>Unified dashboards for each airport role</li>
          <li>Real-time readiness and bag workflow visibility</li>
          <li>Demo accounts are pre-seeded by administrators</li>
        </ul>
      </section>

      <div className={styles.authCard} role="region" aria-label="Login card">
        <h2 className={styles.formTitle}>Sign in</h2>

        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">Username</label>
            <input id="username" className={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" aria-invalid={!!errors.username} />
            <div className={styles.helper}>Example: smith01. Admin username is admin.</div>
            {errors.username && <div className={styles.error}>{errors.username}</div>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.inputWrap}>
              <input
                id="password"
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => setCapsLock(e.getModifierState && e.getModifierState('CapsLock'))}
                onKeyUp={(e) => setCapsLock(e.getModifierState && e.getModifierState('CapsLock'))}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
              />
              <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} className={styles.toggleBtn} onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {capsLock && <div className={styles.caps}>Caps Lock is on</div>}
            {errors.password && <div className={styles.error}>{errors.password}</div>}
          </div>

          <button className={styles.submitBtn} type="submit">Sign in</button>
          <div className={styles.securityNote}>Accounts are created by the administrator. No self registration.</div>
        </form>

        <div className={styles.testPanel}>
          <div className={styles.testTitle}>Test accounts</div>
          <div>admin / Admin123</div>
          <div>smith01 / Pass1234</div>
          <div>johnson02 / Pass1234</div>
        </div>

        <div className={styles.reset}>Forgot password? <a href="#password-reset">Reset here</a></div>
      </div>
    </div>
  );
}
