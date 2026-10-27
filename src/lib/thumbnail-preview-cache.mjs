import { SLIDES_PER_GROUP } from './thumbnail-editor.mjs';

// One full-size base image serves both the canvas and filmstrip. Layer edits never invalidate it.
export class ThumbnailPreviewCache {
  constructor({ entries, fetchBatch, concurrency = 2, maxBytes = 64 * 1024 * 1024 }) {
    this.fetchBatch = fetchBatch;
    this.concurrency = concurrency;
    this.maxBytes = maxBytes;
    this.groups = [];
    for (let i = 0; i < entries.length; i += SLIDES_PER_GROUP) this.groups.push({ entries: entries.slice(i, i + SLIDES_PER_GROUP), state: 'pending' });
    this.images = new Map(); this.errors = new Map(); this.listeners = new Set(); this.controllers = new Set();
    this.running = 0; this.bytes = 0; this.enabled = false; this.generation = 0; this.selectedId = entries[0]?.question_id;
    this.total = entries.length;
    this.publish();
  }
  subscribe = listener => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
  getSnapshot = () => this.snapshot;
  publish() {
    this.snapshot = { images: new Map(this.images), errors: new Map(this.errors), completed: this.images.size, total: this.total, loading: this.running > 0, failed: this.errors.size };
    this.listeners.forEach(listener => listener());
  }
  start(questionId) { this.enabled = true; this.prioritize(questionId); }
  pause() { this.enabled = false; }
  prioritize(questionId) {
    this.selectedId = questionId;
    const index = this.groups.findIndex(group => group.entries.some(entry => entry.question_id === questionId));
    if (index >= 0) {
      const group = this.groups[index];
      // A distant revisit may have been evicted by the memory cap.
      if (group.state === 'done' && !this.images.has(questionId)) group.state = 'pending';
      this.groups = [group, ...this.groups.filter(item => item !== group)];
    }
    this.pump();
  }
  retry(questionId) {
    for (const group of this.groups) if (group.state === 'failed') group.state = 'pending';
    this.errors.clear(); this.enabled = true; this.publish(); this.prioritize(questionId);
  }
  stop() {
    this.enabled = false; this.generation++;
    this.controllers.forEach(controller => controller.abort()); this.controllers.clear(); this.running = 0;
    this.groups.forEach(group => { if (group.state === 'running') group.state = 'pending'; });
  }
  store(slide) {
    const size = slide.dataUrl.length * 2;
    if (size > this.maxBytes) throw Error('Preview exceeds the image cache limit.');
    if (this.images.has(slide.questionId)) this.bytes -= this.images.get(slide.questionId).dataUrl.length * 2;
    this.images.set(slide.questionId, slide); this.bytes += size;
    while (this.bytes > this.maxBytes && this.images.size > 1) {
      const id = [...this.images.keys()].find(id => id !== this.selectedId) ?? this.images.keys().next().value;
      this.bytes -= this.images.get(id).dataUrl.length * 2; this.images.delete(id);
    }
  }
  pump() {
    while (this.enabled && this.running < this.concurrency) {
      const group = this.groups.find(group => group.state === 'pending');
      if (!group) return;
      group.state = 'running'; this.running++;
      const controller = new AbortController(), generation = this.generation;
      this.controllers.add(controller); this.publish();
      void this.load(group, controller, generation);
    }
  }
  async load(group, controller, generation) {
    try {
      const slides = await this.fetchBatch(group.entries, controller.signal);
      if (controller.signal.aborted || generation !== this.generation) return;
      const expected = new Set(group.entries.map(entry => entry.question_id));
      if (!Array.isArray(slides) || slides.length !== expected.size || new Set(slides.map(slide => slide.questionId)).size !== expected.size || slides.some(slide => !expected.has(slide.questionId) || typeof slide.dataUrl !== 'string' || !/^data:image\/(png|jpeg|webp);base64,/.test(slide.dataUrl))) throw Error('The preview response is incomplete. Retry this group.');
      slides.forEach(slide => { this.store(slide); this.errors.delete(slide.questionId); });
      group.state = 'done';
    } catch (error) {
      if (controller.signal.aborted || generation !== this.generation) return;
      group.state = 'failed';
      group.entries.forEach(entry => this.errors.set(entry.question_id, error.message || 'Preview could not load.'));
    } finally {
      if (generation === this.generation) {
        this.controllers.delete(controller); this.running--; this.publish(); this.pump();
      }
    }
  }
}

export function reviewPreviewSettings(settings) {
  const { template, theme, textSide, contentWidth, fontSize, accent, brand, showAnswer, backgroundColor, customBackground, showQuestion } = settings;
  return { template, theme, textSide, contentWidth, fontSize, accent, brand, showAnswer, backgroundColor, customBackground, showQuestion };
}
