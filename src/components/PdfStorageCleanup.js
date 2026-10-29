'use client';

import { useState } from 'react';
import styles from './PdfExportPanel.module.css';

const formatBytes = bytes => {
  if (!bytes) return '0 B';
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${(bytes / 1024 ** unit).toFixed(unit ? 1 : 0)} ${['B', 'KB', 'MB', 'GB'][unit]}`;
};

export default function PdfStorageCleanup({ disabled, onBusyChange, onCleaned }) {
  const [storage, setStorage] = useState(null);
  const [checking, setChecking] = useState(false);
  const [cleaning, setCleaning] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function refreshStorage() {
    setChecking(true); setError('');
    try {
      const response = await fetch('/api/pdf-jobs/storage', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Storage could not be checked.');
      setStorage(data.storage);
    } catch (error) { setStorage(null); setError(error.message); }
    finally { setChecking(false); }
  }

  async function cleanup(target) {
    if (disabled || checking || cleaning || !storage) return;
    const prompt = target === 'exports'
      ? `Delete all ${storage.exports.count} saved PDF exports across every subject? This permanently removes their PDFs, ZIPs, generated images and export-history entries. Questions, original diagrams and downloaded copies are kept. Active exports are skipped.`
      : 'Delete all generated PDF page images and image ZIPs across every subject? Saved PDFs, questions, original diagrams and downloaded copies are kept. Active exports are skipped.';
    if (!window.confirm(prompt)) return;
    setCleaning(target); onBusyChange(true); setError(''); setNotice('');
    let finished = false;
    try {
      const response = await fetch('/api/pdf-jobs/storage', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target }) });
      const data = await response.json();
      if (!response.ok) throw Error(data.error || 'Storage cleanup failed.');
      finished = true;
      const result = data.result;
      const skipped = result.skippedActiveIds.length + result.skippedBusyIds.length;
      setNotice(`${target === 'exports' ? `Deleted ${result.deletedIds.length} saved export${result.deletedIds.length === 1 ? '' : 's'}.` : `Removed generated page images from ${result.imageJobIds.length} export${result.imageJobIds.length === 1 ? '' : 's'}.`} Freed ${formatBytes(result.bytesFreed)}.${skipped ? ` ${skipped} active or busy export${skipped === 1 ? ' was' : 's were'} kept.` : ''}${result.failures.length ? ` ${result.failures.length} export${result.failures.length === 1 ? '' : 's'} could not be cleaned. Refresh storage and try again.` : ''}`);
      await onCleaned(result);
      await refreshStorage();
    } catch (error) { setError(`${finished ? 'Cleanup finished, but export history could not refresh. ' : ''}${error.message}`); }
    finally { setCleaning(''); onBusyChange(false); }
  }

  const locked = disabled || checking || Boolean(cleaning);
  return <details className={styles.storageCleanup} aria-label="Export storage cleanup" onToggle={event => { if (event.currentTarget.open) refreshStorage(); }}>
    <summary><strong>Storage cleanup</strong><span>Delete saved PDFs or generated page images</span></summary>
    <div className={styles.storageBody}>
      <p className={styles.deleteHint}>Applies to saved exports from every subject. Questions, original diagrams and downloaded copies are kept.</p>
      <div className={styles.storageGrid}>
        <div className={styles.storageCard}>
          <h4>Saved PDF exports</h4>
          <p>{checking ? 'Checking storage…' : storage ? `${storage.exports.count} export${storage.exports.count === 1 ? '' : 's'} · ${formatBytes(storage.exports.bytes)}` : 'Storage unavailable'}</p>
          <small>PDFs, ZIPs, export history and associated generated files.</small>
          <button type="button" className={styles.danger} disabled={locked || !storage?.exports.count} onClick={() => cleanup('exports')}>{cleaning === 'exports' ? 'Deleting exports…' : 'Delete all saved PDFs'}</button>
        </div>
        <div className={styles.storageCard}>
          <h4>Generated page images</h4>
          <p>{checking ? 'Checking storage…' : storage ? `${storage.images.count} export${storage.images.count === 1 ? '' : 's'} with images · ${formatBytes(storage.images.bytes)}` : 'Storage unavailable'}</p>
          <small>Remove generated PNGs and page-image ZIPs. Keep PDFs.</small>
          <button type="button" className={styles.danger} disabled={locked || !storage?.images.count} onClick={() => cleanup('images')}>{cleaning === 'images' ? 'Deleting images…' : 'Delete generated page images'}</button>
        </div>
      </div>
      {Boolean(storage?.activeExports) && <p className={styles.deleteHint}>{storage.activeExports} queued or running export{storage.activeExports === 1 ? '' : 's'} will be kept.</p>}
      {Boolean(storage?.unavailableExports) && <p className={styles.warning}>{storage.unavailableExports} saved export location{storage.unavailableExports === 1 ? '' : 's'} could not be inspected.</p>}
      {error && <p role="alert" className={styles.error}>{error}</p>}
      {notice && <p role="status" className={styles.notice}>{notice}</p>}
      <button type="button" className={styles.textButton} disabled={locked} onClick={refreshStorage}>Refresh storage</button>
    </div>
  </details>;
}
