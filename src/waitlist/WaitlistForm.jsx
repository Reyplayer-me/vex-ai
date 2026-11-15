import React, { useRef, useState } from 'react';
import { joinWaitlist, sendFollowup, track } from './api';

const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

const MESSAGES = {
  invalid: 'That email doesn’t look right. Check it and try again.',
  error: 'Something went wrong on our side. Try again in a moment.',
};

export default function WaitlistForm({ id, inputRef }) {
  const ownRef = useRef(null);
  const emailRef = inputRef || ownRef;
  const honeypotRef = useRef(null);
  const busy = useRef(false);
  const doneRef = useRef(null);

  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [joined, setJoined] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy.current) return;

    const clean = email.trim().toLowerCase();
    if (clean.length > 254 || !EMAIL_RE.test(clean)) {
      setStatus('invalid');
      emailRef.current.focus();
      return;
    }

    const finish = (result) => {
      setJoined(result);
      setStatus('done');
      requestAnimationFrame(() => doneRef.current && doneRef.current.focus());
    };

    if (honeypotRef.current.value) {
      finish({ email: clean, duplicate: false, token: null });
      return;
    }

    busy.current = true;
    setStatus('submitting');
    try {
      const res = await joinWaitlist(clean, '');
      const duplicate = res.status === 'duplicate';
      track(duplicate ? 'waitlist_duplicate' : 'waitlist_submitted');
      finish({ email: clean, duplicate, token: res.token });
    } catch (err) {
      setStatus(err.kind === 'invalid' ? 'invalid' : 'error');
    } finally {
      busy.current = false;
    }
  };

  if (status === 'done') {
    return (
      <div className="wl-done" ref={doneRef} tabIndex={-1} aria-live="polite">
        <p className="wl-label">You’re on the list</p>
        <p className="wl-done-text">
          {joined.duplicate
            ? `You’re already on the list. We’ll email ${joined.email} when your spot opens.`
            : `We’ll email ${joined.email} once, when your spot opens.`}
        </p>
        <FollowUp id={id} token={joined.token} />
      </div>
    );
  }

  const messageId = `${id}-message`;
  const message = MESSAGES[status];

  return (
    <div className="wl-form-wrap">
      <form className="wl-form" onSubmit={onSubmit} noValidate>
        <label className="wl-field-label" htmlFor={`${id}-email`}>
          Email
        </label>
        <div className="wl-form-row">
          <input
            ref={emailRef}
            id={`${id}-email`}
            className="wl-input"
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck="false"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={status === 'invalid' ? 'true' : undefined}
            aria-describedby={message ? messageId : undefined}
          />
          <button className="wl-btn" type="submit" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Adding you…' : 'Join the waitlist'}
          </button>
        </div>
        <div className="wl-hp" aria-hidden="true">
          <label htmlFor={`${id}-hp`}>Leave this field empty</label>
          <input ref={honeypotRef} id={`${id}-hp`} name="vex_hp_field" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </form>
      <p id={messageId} className="wl-form-message" aria-live="polite">
        {message}
        {status === 'submitting' && <span className="wl-sr">Adding you…</span>}
      </p>
      <p className="wl-note">Free during beta. We’ll email you once when your spot opens. Nothing else.</p>
    </div>
  );
}

function FollowUp({ id, token }) {
  const [note, setNote] = useState('');
  const [state, setState] = useState('open');

  const onSend = async (e) => {
    e.preventDefault();
    const clean = note.trim();
    if (!clean) {
      setState('skipped');
      return;
    }
    setState('sending');
    try {
      if (token) await sendFollowup(token, clean.slice(0, 500));
      track('waitlist_followup_sent');
      setState('sent');
    } catch (err) {
      setState('error');
    }
  };

  if (state === 'skipped') return null;
  if (state === 'sent') {
    return (
      <p className="wl-followup-thanks" aria-live="polite">
        Thanks. That helps us build the right thing.
      </p>
    );
  }

  return (
    <form className="wl-followup" onSubmit={onSend}>
      <label className="wl-field-label" htmlFor={`${id}-idea`}>
        What idea would you test first? (optional)
      </label>
      <textarea
        id={`${id}-idea`}
        className="wl-input wl-textarea"
        maxLength={500}
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="wl-followup-actions">
        <button className="wl-btn" type="submit" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending…' : 'Send'}
        </button>
        <button className="wl-textbtn" type="button" onClick={() => setState('skipped')}>
          Skip
        </button>
      </div>
      <p className="wl-form-message" aria-live="polite">
        {state === 'error' && MESSAGES.error}
      </p>
    </form>
  );
}
