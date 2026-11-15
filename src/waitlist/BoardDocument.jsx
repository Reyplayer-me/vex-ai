import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { track } from './api';

const EXAMPLES = [
  {
    idea: 'A subscription box of snacks from a different country every month.',
    scores: [6, 5, 3, 2],
    question: 'Why would someone pick you over the five boxes already doing this?',
    verdict: 'KILL',
  },
  {
    idea: 'An app that matches dog owners in the same building to share walks.',
    scores: [7, 5, 4, 6],
    question: 'Will neighbours trust a stranger with their dog, or only people they’ve met?',
    verdict: 'PIVOT',
  },
  {
    idea: 'Bookkeeping for tattoo studios, priced per artist.',
    scores: [8, 7, 5, 7],
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
  const summary =
    `Example ${index + 1} of ${EXAMPLES.length}. Idea under review: ${ex.idea} ` +
    SCORE_LABELS.map((label, i) => `${label} ${ex.scores[i]} out of 10`).join(', ') +
    `. The question to answer first: ${ex.question} Verdict: ${ex.verdict.toLowerCase()}.`;

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
      <figure className="wl-doc-figure" aria-live="off" aria-label="Example board minutes">
        <article
          key={shown}
          className={`wl-doc${shown === 0 ? ' is-first' : ''}${leaving ? ' is-leaving' : ''}`}
        >
          <p className="wl-sr">{summary}</p>
          <div aria-hidden="true">
            <div className="wl-doc-head wl-mono">
              <span>Vex board · minutes</span>
              <span>
                Example {index + 1} of {EXAMPLES.length}
              </span>
            </div>
            <div className="wl-rule wl-rule--draw" />
            <div className="wl-doc-body">
              <p className="wl-label">Idea under review</p>
              <p className="wl-doc-idea">“{ex.idea}”</p>
              <ul className="wl-scores">
                {SCORE_LABELS.map((label, i) => (
                  <li key={label} className="wl-score" style={{ '--i': i }}>
                    <span className="wl-mono">{label}</span>
                    <span className="wl-bar">
                      <span className="wl-bar-fill" style={{ '--v': ex.scores[i] / 10 }} />
                    </span>
                    <span className="wl-mono wl-score-num">{ex.scores[i]}/10</span>
                  </li>
                ))}
              </ul>
              <p className="wl-label">The question to answer first</p>
              <p className="wl-doc-question">{ex.question}</p>
            </div>
          </div>
          <div className={`wl-stamp wl-stamp--${ex.verdict.toLowerCase()}`} aria-hidden="true">
            {ex.verdict}
          </div>
        </article>
      </figure>
      <div className="wl-doc-foot">
        <p className="wl-doc-caption">
          Illustrative examples. Your report uses live web results.{' '}
          <Link className="wl-link" to="/sample">
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
