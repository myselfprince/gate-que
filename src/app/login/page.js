"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        setError(payload.error || 'Unable to sign in.');
        return;
      }
      router.replace('/');
      router.refresh();
    } catch {
      setError('Unable to contact the application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px' }}>
      <form onSubmit={handleSubmit} className="card" style={{ width: 'min(100%, 420px)', padding: '28px' }}>
        <h1 style={{ marginTop: 0, color: '#a6e3a1' }}>GATE PYQ Workspace</h1>
        <p style={{ color: '#bac2de' }}>Enter the application password to continue.</p>
        <label htmlFor="password">Application password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          autoFocus
        />
        {error && <p role="alert" style={{ color: '#f38ba8', marginBottom: 0 }}>{error}</p>}
        <button type="submit" disabled={isSubmitting} style={{ width: '100%', marginTop: '20px', background: '#a6e3a1' }}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
