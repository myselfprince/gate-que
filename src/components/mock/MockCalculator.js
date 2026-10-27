'use client';
import { useEffect, useRef, useState } from 'react';
import ScientificCalculator from './ScientificCalculator';
import styles from './GateExamScreen.module.css';

export default function MockCalculator({ open, onClose }) {
  const [position, setPosition] = useState({ x: 360, y: 80 });
  const [minimized, setMinimized] = useState(false);
  const windowRef = useRef(null), drag = useRef(null), placed = useRef(false);
  function bounded(x, y) {
    const bounds = windowRef.current?.getBoundingClientRect();
    return { x: Math.max(0, Math.min(window.innerWidth - (bounds?.width || 463), x)), y: Math.max(0, Math.min(window.innerHeight - (bounds?.height || 360), y)) };
  }
  useEffect(() => {
    if (!open) return;
    const place = () => {
      setPosition(current => placed.current ? bounded(current.x, current.y) : bounded((window.innerWidth - 463) / 2, 80));
      placed.current = true;
    };
    const frame = requestAnimationFrame(place);
    window.addEventListener('resize', place);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', place); };
  }, [open, minimized]);
  return <div ref={windowRef} role="dialog" aria-label="Scientific calculator window" hidden={!open} data-minimized={minimized} className={styles.calculatorWindow} style={{ left: position.x, top: position.y }}
    onPointerDown={event => {
      if (!event.target.closest('header') || event.target.closest('button')) return;
      drag.current = { x: event.clientX - position.x, y: event.clientY - position.y };
      event.currentTarget.setPointerCapture(event.pointerId); event.preventDefault();
    }}
    onPointerMove={event => { if (drag.current) setPosition(bounded(event.clientX - drag.current.x, event.clientY - drag.current.y)); }}
    onPointerCancel={() => { drag.current = null; }}
    onLostPointerCapture={() => { drag.current = null; }}
    onPointerUp={event => { if (drag.current) { drag.current = null; event.currentTarget.releasePointerCapture(event.pointerId); } }}>
    <ScientificCalculator onClose={onClose} onMinimize={() => setMinimized(value => !value)} minimized={minimized} />
  </div>;
}
