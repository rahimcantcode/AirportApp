import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Button, DashboardCard, Field, PageHeader } from '../../components/ui';
import { isEmailValid, isPasswordValid, isPhoneValid, isUsernameValid } from '../../utils/validation';

export function ManageStaff() {
  const { users, addUser, addToast } = useApp();

  const [role, setRole] = useState<'admin' | 'airline' | 'gate' | 'ground' | 'passenger'>('airline');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [airlineCode, setAirlineCode] = useState('');
  const [station, setStation] = useState('');

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = 'Username is required.';
    if (username.trim() && username.trim().toLowerCase() !== 'admin' && !isUsernameValid(username.trim())) {
      e.username = 'Username format: lastname + 2 digits (example: smith01).';
    }
    if (username.trim() && isEmailValid(username.trim())) {
      e.username = 'Do not use an email address as username.';
    }
    if (username.trim() && users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      e.username = 'Username must be unique.';
    }
    if (!password) e.password = 'Password is required.';
    if (password && !isPasswordValid(password)) e.password = 'Password must be at least 6 characters and include letters and digits.';
    if (!email.trim()) e.email = 'Email is required.';
    if (email.trim() && !isEmailValid(email.trim())) e.email = 'Email format example: user@aa.com';
    if (!phone.trim()) e.phone = 'Phone is required.';
    if (phone.trim() && !isPhoneValid(phone.trim())) e.phone = 'Phone must be 10 digits.';
    return e;
  }, [username, password, email, phone, users]);

  const onAdd = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (Object.keys(errors).length > 0) {
      addToast({ type: 'error', title: 'Fix user fields', message: 'Missing or invalid staff/user information.' });
      return;
    }

    const res = addUser({ role, username: username.trim(), password, email: email.trim(), phone: phone.trim() });
    if (!res.ok) {
      addToast({ type: 'error', title: 'Could not add user', message: res.error || 'Unknown error.' });
      return;
    }

    addToast({ type: 'success', title: 'User created', message: 'Password is hidden and never displayed.' });
    setUsername('');
    setPassword('');
    setEmail('');
    setPhone('');
    setAirlineCode('');
    setStation('');
  };

  return (
    <div className="page-stack">
      <PageHeader title="Manage Staff" subtitle="Review staff accounts and create new ones" />

      <DashboardCard title="Staff Accounts" subtitle="Existing user records">
        <div className="table">
          <div className="table__header table__header--staff">
            <div>Username</div><div>Role</div><div>Email</div><div>Phone</div><div>Actions</div>
          </div>
          {users.map((u) => (
            <div key={u.id} className="table__row table__row--staff">
              <div>{u.username}</div>
              <div>{u.role}</div>
              <div>{u.email || '-'}</div>
              <div>{u.phone || '-'}</div>
              <div className="row row--end action-group">
                <Button variant="secondary" type="button" onClick={() => addToast({ type: 'info', title: 'User details', message: `${u.username} (${u.role})` })}>Details</Button>
                <Button variant="danger" type="button" onClick={() => addToast({ type: 'info', title: 'Removal disabled', message: 'User removal is not enabled in this demo.' })}>Remove</Button>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard
        className="staff-create"
        title="Create Staff Account"
        subtitle="Create operations accounts with role-specific hints"
        footer={<div className="muted">Passwords are never displayed. Accounts are admin-managed only.</div>}
      >
        <form className="form" onSubmit={onAdd}>
          <div className="grid grid--2">
            <Field label="Role">
              <select className="input" value={role} onChange={(e) => setRole(e.target.value as any)}>
                <option value="admin">admin</option>
                <option value="airline">airline</option>
                <option value="gate">gate</option>
                <option value="ground">ground</option>
                <option value="passenger">passenger</option>
              </select>
            </Field>

            <Field label="Username" error={errors.username} hint="lastname + 2 digits, example smith01">
              <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
            </Field>

            <Field label="Password" error={errors.password}>
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </Field>

            <Field label="Email" error={errors.email}>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="user@aa.com" />
            </Field>

            <Field label="Phone" error={errors.phone}>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10 digits" />
            </Field>

            <Field label="Airline code" hint="Used for airline staff assignment hints.">
              <input className="input" value={airlineCode} onChange={(e) => setAirlineCode(e.target.value)} placeholder="AA" />
            </Field>

            <Field label="Gate or station" hint="Example gate A12 or station Baggage Ops.">
              <input className="input" value={station} onChange={(e) => setStation(e.target.value)} placeholder="A12 / Baggage" />
            </Field>
          </div>
          <div className="row row--end"><Button type="submit">Create staff</Button></div>
        </form>
      </DashboardCard>
    </div>
  );
}
