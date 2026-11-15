import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import BoardDocument from './BoardDocument';
import WaitlistForm from './WaitlistForm';
import { captureAttribution, track } from './api';
import './waitlist.css';

const SUPPORT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL;

const TITLE = 'Vex: build it or kill it';
const DESCRIPTION =
  'Vex searches the web for real competitors and prices, then five AI advisors argue about your idea and give you a straight answer. You’ll know what to fix before you spend a weekend building it.';
const FONTS_HREF =
  'https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap';

// Sets this page's title, description, preview tags and fonts, and restores the
// site-wide values on the way out.
function usePageHead() {
  useEffect(() => {
    const previousTitle = document.title;
    const restore = [];
    const setMeta = (attr, key, content) => {
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      if (el) {
        const old = el.getAttribute('content');
        restore.push(() => el.setAttribute('content', old));
      } else {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
        restore.push(() => el.remove());
      }
      el.setAttribute('content', content);
    };
    document.title = TITLE;
    setMeta('name', 'description', DESCRIPTION);
    setMeta('name', 'theme-color', '#F3F0E8');
    setMeta('property', 'og:title', TITLE);
    setMeta('property', 'og:description', DESCRIPTION);
    setMeta('property', 'og:image', `${window.location.origin}/og-waitlist.png`);
    setMeta('name', 'twitter:image', `${window.location.origin}/og-waitlist.png`);
    const fonts = document.createElement('link');
    fonts.rel = 'stylesheet';
    fonts.href = FONTS_HREF;
    document.head.appendChild(fonts);
    document.body.classList.add('wl-body');
    return () => {
      document.title = previousTitle;
      restore.forEach((fn) => fn());
      fonts.remove();
      document.body.classList.remove('wl-body');
    };
  }, []);
}

const STEPS = [
  ['You describe the idea.', 'A sentence or two is enough. Add who it’s for if you know.'],
  [
    'Vex checks the web.',
    'It looks up competitors, what they charge and any regulations, and keeps the source link for each one.',
  ],
  [
    'The board decides.',
    'Five advisors score it, disagree where they should, and give one verdict: proceed, pivot or kill.',
  ],
];

const BOARD = [
  ['CEO', 'Cuts through the noise. Asks if this is a business.'],
  ['Execution Officer', 'Finds the smallest thing you can actually ship.'],
  ['Risk Analyst', 'Finds the assumption that could sink it.'],
  ['Psychologist', 'Calls out the bias behind your conviction.'],
  ['Industry Expert', 'Checks what the market already knows.'],
];

const LIMITS = [
  'It won’t invent competitors. Every one comes from a search result, with a link you can check.',
  'It won’t tell you an idea will succeed. It gives a structured opinion and says how confident it is.',
  'It won’t share your idea. Reports are private unless you choose to share a summary.',
];

const FAQS = [
  [
    'When do I get access?',
    'We’re letting people in in small batches during the beta. You’ll get one email when it’s your turn.',
  ],
  [
    'Is it free?',
    'Yes, while it’s in beta. After the beta, full reports are planned to cost $9 each. The basic verdict should stay free.',
  ],
  [
    'Is my idea private?',
    'Yes. Your idea is only visible to you. If you share a result, the public link shows the verdict, the score and a one-line summary, never the full report.',
  ],
  [
    'Is this financial or legal advice?',
    'No. Vex gives structured opinions based on what it can find online. Use it to decide what to test next, not as a guarantee.',
  ],
  [
    'What do you do with my email?',
    'We use it to send your invite. We don’t sell it or add you to a newsletter. You can ask us to delete it at any time, using the Contact link at the bottom of this page.',
  ],
];

let viewTracked = false;

function Section({ id, number, label, title, children }) {
  return (
    <section id={id} className="wl-section" aria-labelledby={`${id}-title`}>
      <div className="wl-wrap wl-section-grid">
        <div className="wl-section-head">
          <p className="wl-label">
            {number} · {label}
          </p>
          <h2 id={`${id}-title`} className="wl-h2">
            {title}
          </h2>
        </div>
        <div className="wl-section-body">{children}</div>
      </div>
    </section>
  );
}

export default function Waitlist() {
  const heroEmailRef = useRef(null);
  usePageHead();

  useEffect(() => {
    captureAttribution();
    if (!viewTracked) {
      viewTracked = true;
      track('waitlist_view');
    }
  }, []);

  const focusHeroEmail = () => {
    const el = heroEmailRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ block: 'center' });
  };

  return (
    <div className="wl">
      <header className="wl-wrap wl-top">
        <a className="wl-wordmark" href="/waitlist">
          Vex
        </a>
        <nav className="wl-top-nav" aria-label="Page">
          <a className="wl-link" href="#how">
            How it works
          </a>
          <button type="button" className="wl-btn wl-btn--sm wl-desktop-only" onClick={focusHeroEmail}>
            Join the waitlist
          </button>
        </nav>
      </header>
      <div className="wl-rule wl-rule--draw" />

      <main>
        <section className="wl-wrap wl-hero" aria-labelledby="wl-title">
          <div className="wl-hero-text">
            <p className="wl-label">Private beta · waitlist open</p>
            <h1 id="wl-title" className="wl-h1">
              Tell us your startup idea. We’ll tell you whether to build it or <em>kill it</em>.
            </h1>
            <p className="wl-sub">
              Vex searches the web for real competitors and prices, then five AI advisors argue about your idea and
              give you a straight answer. You’ll know what to fix before you spend a weekend building it.
            </p>
            <WaitlistForm id="hero" inputRef={heroEmailRef} />
          </div>
          <div className="wl-hero-doc">
            <BoardDocument />
          </div>
        </section>
        <div className="wl-rule wl-rule--draw" />

        <Section id="how" number="01" label="How a verdict works" title="Three steps, about a minute.">
          <ol className="wl-list">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="wl-list-item wl-step">
                <span className="wl-mono wl-step-num">0{i + 1}</span>
                <div>
                  <p className="wl-item-title">{title}</p>
                  <p className="wl-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="wl-after-list">
            You also get the top three risks, the one question you must answer before you build, and what would
            change the board’s mind.
          </p>
        </Section>
        <div className="wl-rule" />

        <Section id="board" number="02" label="The board" title="Five advisors. They won’t all agree.">
          <ul className="wl-list">
            {BOARD.map(([name, line]) => (
              <li key={name} className="wl-list-item wl-member">
                <span className="wl-item-title">{name}</span>
                <span className="wl-muted">{line}</span>
              </li>
            ))}
          </ul>
        </Section>
        <div className="wl-rule" />

        <Section id="limits" number="03" label="What Vex won’t do" title="Honest by design.">
          <ul className="wl-list">
            {LIMITS.map((line) => (
              <li key={line} className="wl-list-item">
                {line}
              </li>
            ))}
          </ul>
        </Section>
        <div className="wl-rule" />

        <Section id="questions" number="04" label="Questions" title="Before you join.">
          <div className="wl-list">
            {FAQS.map(([q, a]) => (
              <details key={q} className="wl-list-item wl-faq">
                <summary>
                  <span>{q}</span>
                  <span className="wl-plus" aria-hidden="true" />
                </summary>
                <p className="wl-muted">{a}</p>
              </details>
            ))}
          </div>
        </Section>

        <section className="wl-closing" aria-labelledby="wl-closing-title">
          <div className="wl-wrap wl-section-grid">
            <div className="wl-section-head">
              <h2 id="wl-closing-title" className="wl-h2">
                Find out before you build.
              </h2>
            </div>
            <div className="wl-section-body">
              <WaitlistForm id="closing" />
            </div>
          </div>
        </section>
      </main>

      <footer className="wl-wrap wl-footer">
        <span>© Vex 2026</span>
        <nav className="wl-footer-nav" aria-label="Legal">
          <Link className="wl-link" to="/privacy">
            Privacy
          </Link>
          <Link className="wl-link" to="/terms">
            Terms
          </Link>
          <a className="wl-link" href={SUPPORT_EMAIL ? `mailto:${SUPPORT_EMAIL}` : '/privacy#contact'}>
            Contact
          </a>
        </nav>
      </footer>
    </div>
  );
}
