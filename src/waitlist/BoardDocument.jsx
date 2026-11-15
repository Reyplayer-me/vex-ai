import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { track } from './api';

export const EXAMPLES = [
  {
    idea: 'A subscription box of snacks from a different country every month.',
    scores: [6, 5, 3, 2],
    talk: [
      ['Risk Analyst', 'Five boxes already ship this. What stops them copying your best idea next month?'],
      ['CEO', 'Agreed. No edge, no business.'],
    ],
    question: 'Why would someone pick you over the five boxes already doing this?',
    verdict: 'KILL',
  },
  {
    idea: 'An app that matches dog owners in the same building to share walks.',
    scores: [7, 5, 4, 6],
    talk: [
      ['Psychologist', 'People like sharing in theory. It changes when it’s their own dog.'],
      ['Execution Officer', 'Try one building and a group chat before you build an app.'],
    ],
    question: 'Will neighbours trust a stranger with their dog, or only people they’ve met?',
    verdict: 'PIVOT',
  },
  {
    idea: 'Bookkeeping for tattoo studios, priced per artist.',
    scores: [8, 7, 5, 7],
    talk: [
      ['Industry Expert', 'Studios split money with artists in ways general tools handle badly.'],
      ['CEO', 'Narrow, but they’d pay. Worth a real test.'],
    ],
    question: 'Can you get ten studios to show you how they track money today?',
    verdict: 'PROCEED',
  },
];

const SCORE_LABELS = ['Problem clarity', 'Market demand', 'Execution difficulty', 'Differentiation'];
const SHOW_MS = 6000;
const FADE_MS = 200;

function usePrefersReducedMotion() {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduce, setReduce] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduce;
}

export default function BoardDocument() {
  const reduce = usePrefersReducedMotion();
  const wrapRef = useRef(null);
  const fadeTimer = useRef(null);

  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [pageVisible, setPageVisible] = useState(!document.hidden);

  const paused = reduce || hovered || focused || !onScreen || !pageVisible;

  const advance = useCallback(() => {
    if (fadeTimer.current) return;
    if (reduce) {
      setIndex((i) => (i + 1) % EXAMPLES.length);
      setShown((n) => n + 1);
      return;
    }
    setLeaving(true);
    fadeTimer.current = setTimeout(() => {
      fadeTimer.current = null;
      setIndex((i) => (i + 1) % EXAMPLES.length);
      setShown((n) => n + 1);
      setLeaving(false);
    }, FADE_MS);
  }, [reduce]);

  useEffect(() => () => clearTimeout(fadeTimer.current), []);

  useEffect(() => {
    if (paused || leaving) return undefined;
    const t = setTimeout(advance, SHOW_MS);
    return () => clearTimeout(t);
  }, [paused, leaving, shown, advance]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const onNext = () => {
    track('waitlist_example_next');
    advance();
  };

  const ex = EXAMPLES[index];
  const lowest = Math.min(...ex.scores);
  const summary =
    `Example ${index + 1} of ${EXAMPLES.length}. Idea under review: ${ex.idea} ` +
    SCORE_LABELS.map((label, i) => `${label} ${ex.scores[i]} out of 10`).join(', ') +
    `. ${ex.talk.map(([who, line]) => `${who}: ${line}`).join(' ')} ` +
    `The question to answer first: ${ex.question} Verdict: ${ex.verdict.toLowerCase()}.`;

  return (
    <div
      ref={wrapRef}
      className="wl-doc-wrap"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
    >
      <figure className="wl-doc-tilt" aria-live="off" aria-label="Example board minutes">
        <article
          key={shown}
          className={`wl-doc${shown === 0 ? ' is-first' : ''}${leaving ? ' is-leaving' : ''}`}
        >
          <p className="wl-sr">{summary}</p>
          <div aria-hidden="true">
            <div className="wl-doc-head">
              <span>Minutes of the board</span>
              <span>
                Example {index + 1} of {EXAMPLES.length}
              </span>
            </div>
            <div className="wl-doc-body">
              <p className="wl-doc-kicker">Idea under review:</p>
              <p className="wl-doc-idea">{ex.idea}</p>
              <ul className="wl-scores">
                {SCORE_LABELS.map((label, i) => (
                  <li
                    key={label}
                    className={`wl-score${ex.scores[i] === lowest ? ' is-low' : ''}`}
                    style={{ '--i': i }}
                  >
                    <span>{label}</span>
                    <span className="wl-bar">
                      <span className="wl-bar-fill" style={{ '--v': ex.scores[i] / 10 }} />
                    </span>
                    <span className="wl-score-num">{ex.scores[i]}/10</span>
                  </li>
                ))}
              </ul>
              <div className="wl-doc-talk">
                {ex.talk.map(([who, line]) => (
                  <p key={who}>
                    <strong>{who}:</strong> {line}
                  </p>
                ))}
                <p className="wl-doc-question">
                  <strong>Answer this first:</strong> {ex.question}
                </p>
              </div>
            </div>
          </div>
          <div className={`wl-stamp wl-stamp--${ex.verdict.toLowerCase()}`} aria-hidden="true">
            {ex.verdict}
          </div>
        </article>
      </figure>
      <div className="wl-doc-foot">
        <p>
          Illustrative examples. Your report uses live web results.{' '}
          <Link className="wl-inline-link" to="/sample">
            See a real sample report
          </Link>
        </p>
        <button type="button" className="wl-textbtn" onClick={onNext}>
          Next example
        </button>
      </div>
    </div>
  );
}
