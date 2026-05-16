'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const GATE_SYLLABUS = {
  "1. Discrete Maths": ["1. Mathematical Logic", "2. Set Theory and Algebra", "3. Combinatorics", "4. Graph Theory"],
  "2. TOC": ["1. Finite Automata and Regular Languages", "2. PDA - CFL and DCFL", "3. Turing Machine, RE, REC, Undecidabilitu"],
  // ... (Include your full syllabus here)
  "12. DBMS": ["1. ER Model", "2. Funcational Dependencies and Normalizaation", "3. Structure Query Language", "4. Relational Model", "5. Transactions and Concurrency Contorl", "6. File Structures"]
};

export default function ScrapedViewer() {
  const [questions, setQuestions] = useState([]);
  const availableSubjects = Object.keys(GATE_SYLLABUS);
  const [subject, setSubject] = useState(availableSubjects[0]);
  const [chapter, setChapter] = useState(GATE_SYLLABUS[availableSubjects[0]][0]);
  
  const [syncedCount, setSyncedCount] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [imgCacheBuster, setImgCacheBuster] = useState(Date.now());
  const [imageErrors, setImageErrors] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [isReviving, setIsReviving] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadChapterState = (sub, chap) => {
    // Unique local storage key to avoid clashing with main page
    const draftKey = `scraped_draft_${sub}_${chap}`;
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      const parsed = JSON.parse(draft);
      setQuestions(parsed.questions || []);
      setSyncedCount(parsed.syncedCount || 0);
      setIsDirty(parsed.isDirty || false);
    } else {
      setQuestions([]);
      setSyncedCount(0);
      setIsDirty(false);
    }
  };

  const loadFromMongoDB = async (sub, chap) => {
    setIsReviving(true);
    try {
      // Fetching from the newly created scraped-chapters API
      const res = await fetch(`/api/scraped-chapters?subject=${encodeURIComponent(sub)}&chapter=${encodeURIComponent(chap)}`);
      const data = await res.json();
      if (data.success && data.data && data.data.questions && data.data.questions.length > 0) {
        setQuestions(data.data.questions); 
        setSyncedCount(data.data.questions.length); 
        setIsDirty(false);
        showToast(`✅ Revived ${data.data.questions.length} scraped questions!`, 'success');
      } else {
        showToast("ℹ️ No Scraped DB data found. Loaded local draft.", "info");
        loadChapterState(sub, chap);
      }
    } catch (error) {
      showToast("❌ Error auto-loading from DB", "error");
      loadChapterState(sub, chap);
    } finally {
      setIsReviving(false);
    }
  };

  useEffect(() => {
    loadFromMongoDB(subject, chapter);
  }, []);

  const handleSubjectChange = (e) => {
    const selectedSubject = e.target.value;
    const defaultChapter = GATE_SYLLABUS[selectedSubject][0];
    setSubject(selectedSubject);
    setChapter(defaultChapter);
    loadFromMongoDB(selectedSubject, defaultChapter); 
  };

  const handleChapterChange = (e) => {
    const selectedChapter = e.target.value;
    setChapter(selectedChapter);
    loadFromMongoDB(subject, selectedChapter); 
  };

  useEffect(() => {
    const draftKey = `scraped_draft_${subject}_${chapter}`;
    if (isDirty) localStorage.setItem(draftKey, JSON.stringify({ questions, syncedCount, isDirty }));
    else localStorage.removeItem(draftKey);
  }, [questions, syncedCount, isDirty, subject, chapter]);

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.MathJax) {
      window.MathJax = {
        tex: { inlineMath: [['$', '$'], ['\\(', '\\)']], displayMath: [['$$', '$$'], ['\\[', '\\]']] },
        startup: { typeset: false }
      };
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
        const container = document.getElementById('scraped_questions_container');
        if (container) {
          window.MathJax.typesetClear([container]);
          window.MathJax.typesetPromise([container]).catch(err => console.error("MathJax Render Error:", err));
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  });

  const updateQ = (id, field, value) => { 
    let finalValue = value;
    if (typeof value === 'string' && ['text', 'optA', 'optB', 'optC', 'optD', 'natAnswer'].includes(field)) {
      finalValue = value.replace(/\$\$/g, '$').replace(/\n(?:\s*\n)+/g, '\n');
    }
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: finalValue } : q)); 
    setIsDirty(true); 
  };

  const saveToMongoDB = async () => {
    if (!confirm(`🚨 Are you sure you want to SAVE to the SCRAPED DB for "${subject} - ${chapter}"?`)) return;
    try {
      showToast("Saving to Scraped DB...", "info");
      const res = await fetch('/api/scraped-chapters', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, chapter, questions })
      });
      const data = await res.json();
      if (data.success) {
        setSyncedCount(questions.length);
        setIsDirty(false);
        showToast(`✅ Saved successfully!`);
      } else {
        showToast("❌ Error saving to DB: " + data.error, "error");
      }
    } catch (error) { 
        showToast("❌ Error connecting to database", "error"); 
    }
  };

  return (
    <div style={{ maxWidth: '98%', margin: 'auto', padding: '20px' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '30px', right: '30px',
          background: toast.type === 'error' ? '#f38ba8' : toast.type === 'info' ? '#89b4fa' : '#a6e3a1',
          color: '#11111b', padding: '15px 25px', borderRadius: '8px', zIndex: 9999, fontWeight: 'bold'
        }}>{toast.message}</div>
      )}

      <div className="card" style={{ display: 'flex', gap: '15px', alignItems: 'center', padding: '15px', borderBottom: '2px solid #f9e2af', marginBottom: '20px' }}>
        <h2 style={{ color: '#f9e2af', margin: 0, paddingRight: '20px', borderRight: '1px solid #45475a' }}>📚 Scraped DB Viewer</h2>
        
        <div>
          <label style={{ marginTop: 0 }}>Subject</label>
          <select value={subject} onChange={handleSubjectChange} style={{ cursor: 'pointer' }}>
            {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
        
        <div>
          <label style={{ marginTop: 0 }}>Chapter</label>
          <select value={chapter} onChange={handleChapterChange} style={{ cursor: 'pointer' }}>
            {GATE_SYLLABUS[subject].map(chap => <option key={chap} value={chap}>{chap}</option>)}
          </select>
        </div>

        <div style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#181825', borderRadius: '4px' }}>
          {isDirty ? (
            <span style={{ color: '#f9e2af', fontWeight: 'bold' }}>⚠️ {syncedCount}/{questions.length} Synced (Unsaved)</span>
          ) : (
            <span style={{ color: '#a6e3a1', fontWeight: 'bold' }}>✅ All {questions.length} Synced</span>
          )}
        </div>

        <button style={{ background: '#a6e3a1', color: '#11111b', padding: '10px 15px', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={saveToMongoDB}>💾 Save DB</button>
        <Link href="/" style={{ background: '#45475a', color: '#cdd6f4', padding: '10px 15px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>⬅ Main Editor</Link>
        <Link href="/scraper" style={{ background: '#cba6f7', color: '#11111b', padding: '10px 15px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}>🕸️ Scraper</Link>
      </div>

      {/* Render Questions (Same mapping logic as your main page) */}
      <div id="scraped_questions_container">
        {questions.map((q, idx) => {
          let formattedText = q.text.replace(/\n/g, '<br>');
          const hasOptions = q.optA || q.optB || q.optC || q.optD;

          return (
            <div key={q.id} style={{ display: 'flex', background: '#181825', border: '1px solid #313244', borderRadius: '8px', marginBottom: '20px', padding: '20px' }}>
              <div style={{ flex: 1, paddingRight: '20px', borderRight: '1px solid #313244' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#f9e2af' }}>Question {idx + 1}</h3>
                <textarea value={q.text} onChange={(e) => updateQ(q.id, 'text', e.target.value)} style={{ width: '100%', minHeight: '100px', background: '#11111b', color: '#cdd6f4', border: '1px solid #45475a', padding: '10px' }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  <input type="text" value={q.optA} onChange={(e) => updateQ(q.id, 'optA', e.target.value)} placeholder="Option A" />
                  <input type="text" value={q.optB} onChange={(e) => updateQ(q.id, 'optB', e.target.value)} placeholder="Option B" />
                  <input type="text" value={q.optC} onChange={(e) => updateQ(q.id, 'optC', e.target.value)} placeholder="Option C" />
                  <input type="text" value={q.optD} onChange={(e) => updateQ(q.id, 'optD', e.target.value)} placeholder="Option D" />
                </div>
                {!hasOptions && <input type="text" value={q.natAnswer || ""} onChange={(e) => updateQ(q.id, 'natAnswer', e.target.value)} placeholder="NAT Answer" style={{ marginTop: '10px', border: '1px solid #f38ba8' }} />}
              </div>

              <div style={{ flex: 1, paddingLeft: '20px' }}>
                <div style={{ color: '#a6e3a1', fontWeight: 'bold', marginBottom: '10px' }}>
                    [GATE {q.year} {q.setNum ? `Set-${q.setNum} ` : ''}| {q.marks} Mark]
                </div>
                <div dangerouslySetInnerHTML={{ __html: formattedText }} />
                <div style={{ marginTop: '15px' }}>
                  {hasOptions ? (
                    <>
                      <div style={{ marginBottom: '8px' }}><strong>(A)</strong> <span dangerouslySetInnerHTML={{ __html: q.optA }} /></div>
                      <div style={{ marginBottom: '8px' }}><strong>(B)</strong> <span dangerouslySetInnerHTML={{ __html: q.optB }} /></div>
                      <div style={{ marginBottom: '8px' }}><strong>(C)</strong> <span dangerouslySetInnerHTML={{ __html: q.optC }} /></div>
                      <div style={{ marginBottom: '8px' }}><strong>(D)</strong> <span dangerouslySetInnerHTML={{ __html: q.optD }} /></div>
                    </>
                  ) : (<div style={{ color: '#f38ba8' }}><strong>NAT Answer:</strong> {q.natAnswer ? q.natAnswer : '_________________'}</div>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}