"use client";

export default function GlobalError({ reset }) {
  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: '#1a1a1b', color: '#cdd6f4' }}>
      <section style={{ maxWidth: '520px', textAlign: 'center' }}>
        <h1>Something went wrong</h1>
        <p>Please try the action again. Your local draft is kept in this browser.</p>
        <button onClick={() => reset()} style={{ background: '#89b4fa', color: '#11111b' }}>Try again</button>
      </section>
    </main>
  );
}
