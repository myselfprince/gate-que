import Link from 'next/link';
import styles from './GatePractice.module.css';

export default function MockLayout({ children, review = false, onHome }) {
  return <main className={styles.page}>
    <header className={styles.header}>
      <Link href="/gatemock" onClick={onHome ? event => { event.preventDefault(); onHome(); } : undefined} className={styles.brand}><span className={styles.seal} aria-hidden="true">G4</span><span>G4Gate<small>GATE EXAM PRACTICE</small></span></Link>
      <div className={styles.headerTitle}>Graduate Aptitude Test in Engineering<small>Previous-year papers · Computer based tests</small></div>
      <Link href={review ? '/gatemock' : '/gatemock/admin/papers'} onClick={review && onHome ? event => { event.preventDefault(); onHome(); } : undefined} className={styles.headerLink}>{review ? 'Test centre' : 'Manage papers'}</Link>
    </header>
    <div className={styles.strip}><span>GATE {review ? '· Test results & solutions' : '· Previous-year test centre'}</span><span>Practice in the GATE exam format</span></div>
    <div className={styles.content}>{children}</div>
    <footer className={styles.siteFooter}>G4Gate practice environment<span>Independent practice platform · Not an official GATE website</span></footer>
  </main>;
}
