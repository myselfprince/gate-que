'use client';
/* eslint-disable @next/next/no-img-element -- Runtime PYQ diagram paths. */
import { useEffect, useRef, useState } from 'react';
import styles from './mock.module.css';

export function loadMath() {
  if (window.MathJax?.typesetPromise) return Promise.resolve(window.MathJax.startup?.promise).then(() => window.MathJax);
  if (!window.gateMockMathPromise) window.gateMockMathPromise = new Promise((resolve, reject) => {
    window.MathJax = { tex: { inlineMath: [['$', '$'], ['\\(', '\\)']], displayMath: [['$$', '$$'], ['\\[', '\\]']] }, startup: { typeset: false } };
    const script = document.createElement('script'); script.src = '/vendor/mathjax/tex-mml-chtml.js'; script.async = true;
    script.onload = () => window.MathJax.startup.promise.then(() => resolve(window.MathJax), reject);
    script.onerror = () => { window.gateMockMathPromise = null; reject(new Error('Math rendering unavailable.')); };
    document.head.appendChild(script);
  });
  return window.gateMockMathPromise;
}

export function MockOption({ question, text }) {
  if (/^IMG:/i.test(text)) return <Diagram question={question} name={text.slice(4).trim()} />;
  return question.isCodeOptions ? <code className={styles.prose}>{text}</code> : <span className={styles.prose}>{text}</span>;
}
function Diagram({ question, name }) {
  const [failed, setFailed] = useState(false);
  if (!name || !/^[A-Za-z0-9 .()_-]+$/.test(name) || failed) return <span role="alert">[Diagram unavailable — report this question]</span>;
  const ext = /^\.(png|jpe?g|webp|gif)$/.test(question.ext) ? question.ext : '.png';
  const src = '/' + [question.assetSubject || question.subject, question.assetChapter || question.chapter, name + ext].map(encodeURIComponent).join('/');
  return <img className={styles.diagram} src={src} alt={`Question diagram ${name}`} onError={() => setFailed(true)} />;
}
export default function MockQuestion({ question, children }) {
  const ref = useRef(null);
  const [mathError, setMathError] = useState('');
  useEffect(() => {
    let disposed = false;
    const node = ref.current;
    loadMath().then(async math => { if (!disposed && node) { await math.typesetPromise([node]); if (!disposed) node.dataset.mathReady = 'true'; } }).catch(() => { if (!disposed) setMathError('Math renderer could not load; formula source is shown.'); });
    return () => { disposed = true; if (node && window.MathJax?.typesetClear) window.MathJax.typesetClear([node]); };
  }, [question.key]);
  const names = (question.diagram || '').split(',').map(name => name.trim()).filter(Boolean);
  const used = new Set();
  const pieces = question.text.split(/(\[CODE\]|\[IMG_\d+\]|\[DIAGRAM_PLACEHOLDER\])/g);
  return <div ref={ref} className={styles.questionContent}>
    <div className={styles.prose}>{pieces.map((piece, index) => {
      if (piece === '[CODE]') return <pre key={index}>{question.code || '[Code unavailable]'}</pre>;
      if (/^\[(?:IMG_\d+|DIAGRAM_PLACEHOLDER)\]$/.test(piece)) {
        const number = piece === '[DIAGRAM_PLACEHOLDER]' ? 0 : Number(piece.match(/\d+/)[0]) - 1;
        used.add(number); return <Diagram key={index} question={question} name={names[number]} />;
      }
      return <span key={index}>{piece}</span>;
    })}</div>
    {question.code && !question.text.includes('[CODE]') && <pre>{question.code}</pre>}
    {names.map((name, index) => !used.has(index) && <Diagram key={name} question={question} name={name} />)}
    {children}
    {mathError && <small role="status">{mathError}</small>}
  </div>;
}
