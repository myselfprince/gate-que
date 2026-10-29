export function normalizeSolutionUrl(value) {
  if (value === undefined || value === '') return '';
  if (typeof value !== 'string' || value.length > 1000) throw new Error('Solution link must be a YouTube URL.');
  if (!value.trim()) return '';
  let url;
  try { url = new URL(value.trim()); } catch { throw new Error('Enter a complete YouTube solution URL.'); }
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.port) throw new Error('Solution link must be a YouTube URL.');
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  let videoId;
  if (host === 'youtu.be') videoId = url.pathname.slice(1);
  else if (['youtube.com', 'm.youtube.com', 'music.youtube.com'].includes(host)) {
    videoId = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:shorts|live|embed)\/([^/]+)\/?$/)?.[1];
  }
  if (!/^[A-Za-z0-9_-]{11}$/.test(videoId || '')) throw new Error('Enter a YouTube video link, including its video ID.');
  const rawTime = url.searchParams.get('t') || url.searchParams.get('start') || url.hash.match(/^#t=(.+)$/)?.[1] || '0';
  let seconds;
  if (/^\d+s?$/.test(rawTime)) seconds = Number(rawTime.replace(/s$/, ''));
  else {
    const time = rawTime.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);
    if (!time || !time[0]) throw new Error('Solution timestamp is invalid.');
    seconds = Number(time[1] || 0) * 3600 + Number(time[2] || 0) * 60 + Number(time[3] || 0);
  }
  if (!Number.isSafeInteger(seconds) || seconds < 0 || seconds > 604800) throw new Error('Solution timestamp is invalid.');
  return `https://www.youtube.com/watch?v=${videoId}${seconds ? `&t=${seconds}s` : ''}`;
}

export function safeSolutionUrl(value) {
  try { return normalizeSolutionUrl(value); } catch { return ''; }
}

export function normalizeGateOverflowUrl(value) {
  if (value === undefined || value === '') return '';
  if (typeof value !== 'string' || value.length > 2000) throw new Error('GateOverflow link must be a URL up to 2000 characters.');
  if (!value.trim()) return '';
  let url;
  try { url = new URL(value.trim()); } catch { throw new Error('Enter a complete GateOverflow solution URL.'); }
  const host = url.hostname.toLowerCase().replace(/^www\./, '');
  if (!['https:', 'http:'].includes(url.protocol) || host !== 'gateoverflow.in' || url.username || url.password || url.port
    || /[\x00-\x1f]/.test(value.trim())) throw new Error('Use a https://gateoverflow.in/ question or answer URL.');
  url.protocol = 'https:';
  url.hostname = 'gateoverflow.in';
  return url.href.replace(/[\\{}<>"^`]/g, character => encodeURIComponent(character));
}

export function safeGateOverflowUrl(value) {
  try { return normalizeGateOverflowUrl(value); } catch { return ''; }
}
