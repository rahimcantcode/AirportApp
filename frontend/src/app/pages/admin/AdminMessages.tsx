import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Field, SectionTitle } from '../../components/ui';

export function AdminMessages() {
  const { messages, addMessage, addToast, currentUser } = useApp();
  const [toRole, setToRole] = useState<'airline' | 'gate' | 'ground'>('airline');
  const [body, setBody] = useState('');

  const filtered = useMemo(() => messages.filter((m) => m.toRole === 'admin'), [messages]);

  const onSend = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!body.trim()) {
      addToast({ type: 'error', title: 'Message required' });
      return;
    }
    addMessage({ fromUsername: currentUser?.username || 'admin', toRole, body: body.trim() });
    addToast({ type: 'success', title: 'Message sent' });
    setBody('');
  };

  return (
    <div>
      <SectionTitle title="Admin Messages" subtitle="View messages sent to admin and send messages to staff" />

      <div className="grid grid--2">
        <div>
          <div className="subhead">Inbox (to admin)</div>
          {filtered.length === 0 ? <div className="note">No messages yet.</div> : null}
          <div className="list">
            {filtered.map((m) => (
              <div key={m.id} className="list__item">
                <div className="list__meta">
                  <div><b>From:</b> {m.fromUsername}</div>
                  <div className="muted">{new Date(m.timestamp).toLocaleString()}</div>
                </div>
                <div>{m.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="subhead">Send a message</div>
          <form className="form" onSubmit={onSend}>
            <Field label="To role">
              <select className="input" value={toRole} onChange={(e) => setToRole(e.target.value as any)}>
                <option value="airline">airline</option>
                <option value="gate">gate</option>
                <option value="ground">ground</option>
              </select>
            </Field>

            <Field label="Message">
              <textarea className="input" value={body} onChange={(e) => setBody(e.target.value)} rows={5} />
            </Field>

            <div className="row row--end">
              <button className="btn" type="submit">Send</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
