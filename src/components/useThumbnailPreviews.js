import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { ThumbnailPreviewCache, reviewPreviewSettings } from '@/lib/thumbnail-preview-cache.mjs';

export default function useThumbnailPreviews({ subject, chapter, questions, metadata, settings, ready, selectedId, revision }) {
  const manifest = JSON.stringify({ subject, chapter, questions, entries: metadata.map(({ question_id, index, topic }) => ({ question_id, index, topic })), thumbnailSettings: reviewPreviewSettings(settings), revision });
  const cache = useMemo(() => {
    const source = JSON.parse(manifest);
    const questions = new Map(source.questions.map(question => [question.id, question]));
    return new ThumbnailPreviewCache({ entries: source.entries, fetchBatch: async (entries, signal) => {
      const response = await fetch('/api/thumbnail-export', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal,
        body: JSON.stringify({ subject: source.subject, chapter: source.chapter, mode: 'review', questions: entries.map(entry => questions.get(entry.question_id)), questionNumbers: entries.map(entry => entry.index), headlines: entries.map(entry => entry.topic || ''), thumbnailSettings: source.thumbnailSettings }),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error || 'Question previews could not load.');
      return result.slides;
    } });
    // Refresh explicitly creates a new render generation. Geometry and PNG resolution do not.
  }, [manifest]);
  const state = useSyncExternalStore(cache.subscribe, cache.getSnapshot, cache.getSnapshot);
  useEffect(() => { if (ready) cache.start(selectedId); else cache.pause(); }, [cache, ready, selectedId]);
  useEffect(() => () => cache.stop(), [cache]);
  return { ...state, retry: () => cache.retry(selectedId) };
}
