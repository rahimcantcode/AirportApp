import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Field, SectionTitle } from '../../components/ui';

export function AirlineMessages() {
  const { messages, addMessage, addToast, currentUser } = useApp();
  const [body, setBody] = useState('');

  const inbox = useMemo(() => messages.filter((m) => m.toRole === 'airline'), [messages]);

  const onSend = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!body.trim()) {
      addToast({ type: 'error', title: 'Message required' });
      return;
    }
    addMessage({ fromUsername: currentUser?.username || 'airline', toRole: 'admin', body: body.trim() });
    addToast({ type: 'success', title: 'Sent to admin' });
    setBody('');
  };

  return (
    <div>
      <SectionTitle title="Messages" subtitle="Inbox and message admin" />

      <div className="grid grid--2">
        <div>
          <div className="subhead">Inbox</div>
          {inbox.length === 0 ? <div className="note">No messages.</div> : null}
          <div className="list">
            {inbox.map((m) => (
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
          <div className="subhead">Send to admin</div>
          <form className="form" onSubmit={onSend}>
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
