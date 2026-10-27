import puppeteer from 'puppeteer';

// Reuse Chrome and its HTTP/font cache for chapter review. Never run more than two review pages.
let browserPromise, idleTimer;
let active = 0;
const waiters = [];
function abortError() { return new DOMException('Preview cancelled.', 'AbortError'); }
async function slot(signal) {
  if (signal.aborted) throw abortError();
  if (active < 2) { active++; return; }
  await new Promise((resolve, reject) => {
    const item = { resolve: () => { signal.removeEventListener('abort', onAbort); resolve(); } };
    const onAbort = () => { const i = waiters.indexOf(item); if (i >= 0) waiters.splice(i, 1); reject(abortError()); };
    signal.addEventListener('abort', onAbort, { once: true }); waiters.push(item);
  });
}
function release() {
  const next = waiters.shift();
  if (next) { next.resolve(); return; }
  active--;
  if (!active) {
    idleTimer = setTimeout(() => {
      const pending = browserPromise; browserPromise = undefined;
      void pending?.then(browser => browser.close()).catch(() => {});
    }, 60_000);
    idleTimer.unref?.();
  }
}
export async function acquirePreviewPage(signal) {
  await slot(signal); clearTimeout(idleTimer);
  try {
    if (signal.aborted) throw abortError();
    if (!browserPromise) {
      const pending = puppeteer.launch({ headless: true, args: ['--disable-dev-shm-usage', '--disable-gpu'] }).then(browser => {
        browser.once('disconnected', () => { if (browserPromise === pending) browserPromise = undefined; });
        return browser;
      }).catch(error => { if (browserPromise === pending) browserPromise = undefined; throw error; });
      browserPromise = pending;
    }
    const browser = await browserPromise;
    if (signal.aborted) throw abortError();
    const page = await browser.newPage();
    let released = false;
    return { page, release: async () => { if (released) return; released = true; try { await page.close().catch(() => {}); } finally { release(); } } };
  } catch (error) { release(); throw error; }
}
