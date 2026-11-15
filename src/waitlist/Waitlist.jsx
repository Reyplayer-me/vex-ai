import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import BoardDocument, { EXAMPLES } from './BoardDocument';
import WaitlistForm from './WaitlistForm';
import { captureAttribution, track } from './api';
import { CONTACT_HREF, CONTACT_LABEL } from '../lib/contact';
import wordmark from '../assets/vex-wordmark.png';
import './waitlist.css';

const TITLE = 'Vex: build it or kill it';
const DESCRIPTION =
  'Tell us your startup idea. Vex looks up real competitors, prices and rules on the web, then five AI advisors argue about it and give you one straight answer.';
// Inter and Orbitron come with the app; the board minutes add a typewriter face.
const FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap';

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
    setMeta('name', 'theme-color', '#09090B');
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

// Dot colours match the advisor colours in the main Vex app.
const BOARD = [
  ['CEO', 'Cuts through the noise. Asks if this is a business.', '#b57cf5'],
  ['Execution Officer', 'Finds the smallest thing you can actually ship.', '#5fdce8'],
  ['Risk Analyst', 'Finds the assumption that could sink it.', '#f9be5c'],
  ['Psychologist', 'Calls out the bias behind your conviction.', '#f27bb0'],
  ['Industry Expert', 'Checks what the market already knows.', '#6ce0a6'],
];

const LIMITS = [
  ['Invent competitors.', 'Every one comes from a search result, with a link you can check.'],
  ['Promise you’ll succeed.', 'It gives a structured opinion and says how confident it is.'],
  ['Share your idea.', 'Reports are private unless you choose to share a summary.'],
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

export default function Waitlist() {
  usePageHead();

  useEffect(() => {
    captureAttribution();
    if (!viewTracked) {
      viewTracked = true;
      track('waitlist_view');
    }
  }, []);

  return (
    <div className="wl">
      <header className="wl-wrap wl-top">
        <a className="wl-logo" href="#top">
          <img src={wordmark} alt="Vex" width="486" height="214" />
        </a>
        <nav className="wl-top-nav" aria-label="Page">
          <a className="wl-link" href="#how">
            How it works
          </a>
          <a className="wl-link" href="#examples">
            Examples
          </a>
          <a className="wl-btn wl-btn--sm" href="#join">
            Get early access
          </a>
        </nav>
      </header>

      <main>
        <section id="top" className="wl-wrap wl-hero" aria-labelledby="wl-title">
          <div className="wl-hero-text" id="join">
            <p className="wl-badge">Private beta. Waitlist open.</p>
            <h1 id="wl-title" className="wl-h1">
              Build it
              <br />
              or <em>kill it.</em>
            </h1>
            <p className="wl-sub">
              Tell us your startup idea. Vex looks up real competitors, prices and rules on the web, then five AI
              advisors argue about it and give you one straight answer. Find the flaw before you spend a weekend
              building.
            </p>
            <WaitlistForm id="hero" />
          </div>
          <div className="wl-hero-doc">
            <BoardDocument />
          </div>
        </section>

        <section id="examples" className="wl-section wl-panel" aria-labelledby="examples-title">
          <div className="wl-wrap">
            <div className="wl-section-head">
              <h2 id="examples-title" className="wl-h2">
                Three ordinary ideas. Three different answers.
              </h2>
              <p>Most ideas aren’t brilliant or doomed. Vex tells you which way yours leans and what to check before you commit.</p>
            </div>
            <ul className="wl-grid">
              {EXAMPLES.map((ex) => (
                <li key={ex.verdict} className="wl-example">
                  <p className="wl-label">The idea</p>
                  <p className="wl-example-idea">{ex.idea}</p>
                  <p className="wl-example-question">{ex.question}</p>
                  <p className={`wl-verdict wl-verdict--${ex.verdict.toLowerCase()}`}>
                    <span className="wl-sr">Verdict: </span>
                    {ex.verdict}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how" className="wl-wrap wl-section wl-steps" aria-labelledby="how-title">
          <h2 id="how-title" className="wl-h2">
            About a minute,
            <br />
            start to verdict.
          </h2>
          <ol className="wl-grid">
            {STEPS.map(([title, text], i) => (
              <li key={title} className="wl-step">
                <span className="wl-step-num" aria-hidden="true">
                  0{i + 1}
                </span>
                <p className="wl-step-title">{title}</p>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="wl-callout">
            You also get the top three risks, the one question to answer before you build, and what would change the
            board’s mind.
          </p>
        </section>

        <section className="wl-section wl-panel" aria-labelledby="board-title">
          <div className="wl-wrap wl-split">
            <div>
              <h2 id="board-title" className="wl-h2">
                Five advisors. They won’t all agree.
              </h2>
              <p className="wl-split-lead">
                Each one looks at your idea from a different seat. When they disagree, you see why.
              </p>
            </div>
            <ul className="wl-advisors">
              {BOARD.map(([name, line, dot]) => (
                <li key={name}>
                  <span className="wl-advisor" style={{ '--dot': dot }}>
                    {name}
                  </span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="wl-wrap wl-section wl-limits" aria-labelledby="limits-title">
          <h2 id="limits-title" className="wl-h2">
            What Vex won’t do.
          </h2>
          <ul className="wl-grid">
            {LIMITS.map(([title, text]) => (
              <li key={title} className="wl-card">
                <svg aria-hidden="true" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ff5c64" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M5 5l14 14M19 5L5 19" />
                </svg>
                <p className="wl-card-title">
                  <span className="wl-sr">Vex won’t </span>
                  {title}
                </p>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="wl-wrap wl-split" style={{ paddingBottom: 'var(--section-space)' }} aria-labelledby="faq-title">
          <h2 id="faq-title" className="wl-h2">
            Questions
          </h2>
          <div className="wl-faqs">
            {FAQS.map(([q, a]) => (
              <details key={q} className="wl-faq">
                <summary>
                  <span>{q}</span>
                  <span className="wl-plus" aria-hidden="true" />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="wl-closing" aria-labelledby="wl-closing-title">
          <div className="wl-wrap wl-closing-inner">
            <h2 id="wl-closing-title" className="wl-h2">
              Find out before you build.
            </h2>
            <div className="wl-closing-form">
              <WaitlistForm id="closing" />
            </div>
          </div>
        </section>
      </main>

      <footer className="wl-wrap wl-footer">
        <span className="wl-footer-brand">
          <img src={wordmark} alt="" width="486" height="214" />© Vex 2026
        </span>
        <nav className="wl-footer-nav" aria-label="Legal">
          <Link className="wl-link" to="/privacy">
            Privacy
          </Link>
          <Link className="wl-link" to="/terms">
            Terms
          </Link>
          <a className="wl-link" href={CONTACT_HREF} title={CONTACT_LABEL}>
            Contact
          </a>
        </nav>
      </footer>
    </div>
  );
}
