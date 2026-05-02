"use client";

import { useState, useEffect, useRef } from 'react';

// --- SYLLABUS DATA STRUCTURE ---
const GATE_SYLLABUS = {
  "1. Discrete Maths": ["1. Mathematical Logic", "2. Set Theory and Algebra", "3. Combinatorics", "4. Graph Theory"],
  "2. TOC": ["1. Finite Automata and Regular Languages", "2. PDA - CFL and DCFL", "3. Turing Machine, RE, REC, Undecidabilitu"],
  "3. Computer Networks": ["1. ISO-OSI Stack and SWP", "2. LAN", "3. TCP, UDP and IP", "4. Routing and Application Layer"],
  "4. COA": ["1. CPU Arch. and Address. Modes", "2. Control Unit Design", "3. Instructions Pipeline", "4. Memory Organization", "5. IO Organisation"],
  "5. Operating Systems": ["1. Process Management-1", "2. Process Management-2", "3. Deadlock", "4. Mem. Mgmt and Virtual Mem", "5. File Sys and Device Mgmt", "6. Miscellaneous"],
  "6. Data Structures": ["1. Arrays", "2. Stack and Queues", "3. Linked Lists", "4. Trees", "5. Graphs", "6. Hashing"],
  "7. Algorithms": ["1. Algo. Analysis and Asymptotic Notations", "2. Divide and Conquer", "3. Greedy Method", "4. Dynamic Programming", "5. P and NP Concepts", "6. Miscellaneous Topics"],
  "8. C Prog": ["1. Programming"],
  "9. Digital Logic": ["1. Logic Functions and Minimizations", "2. Combinational Circuits", "3. Sequential Circuits", "4. Number Systems"],
  "10. Compiler Design": ["1. Lexical Analysis", "2. Parsing Techniques", "3. Syntax Directed Translations", "4. Code Generations and Optimizatinos"],
  "11. Engg. Maths": ["1. Probability", "2. Linear Algebra", "3. Calculus"],
  "12. DBMS": ["1. ER Model", "2. Funcational Dependencies and Normalizaation", "3. Structure Query Language", "4. Relational Model", "5. Transactions and Concurrency Contorl", "6. File Structures"]
};

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const jumpInputRef = useRef(null);
  
  const availableSubjects = Object.keys(GATE_SYLLABUS);
  const [subject, setSubject] = useState(availableSubjects[0]);
  const [chapter, setChapter] = useState(GATE_SYLLABUS[availableSubjects[0]][0]);

  // --- SYNC & DRAFT STATE ---
  const [syncedCount, setSyncedCount] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [missingFocusIndex, setMissingFocusIndex] = useState(0);

  const loadChapterState = (sub, chap) => {
    const draftKey = `gate_draft_${sub}_${chap}`;
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

  // --- PREFERENCES SYNC LOGIC ---
  useEffect(() => {
    fetch('/api/preferences')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          const savedSub = data.data.lastSubject;
          const savedChap = data.data.lastChapter;
          if (GATE_SYLLABUS[savedSub]) {
            setSubject(savedSub);
            const chap = GATE_SYLLABUS[savedSub].includes(savedChap) ? savedChap : GATE_SYLLABUS[savedSub][0];
            setChapter(chap);
            loadChapterState(savedSub, chap);
          }
        } else {
          loadChapterState(availableSubjects[0], GATE_SYLLABUS[availableSubjects[0]][0]);
        }
      })
      .catch(err => {
         console.error("Failed to load preferences", err);
         loadChapterState(availableSubjects[0], GATE_SYLLABUS[availableSubjects[0]][0]);
      });
  }, []);

  const syncPreferences = async (newSubject, newChapter) => {
    try {
      await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newSubject, chapter: newChapter })
      });
    } catch (e) {
      console.error("Background sync failed", e);
    }
  };

  const handleSubjectChange = (e) => {
    const selectedSubject = e.target.value;
    const defaultChapter = GATE_SYLLABUS[selectedSubject][0];
    setSubject(selectedSubject);
    setChapter(defaultChapter);
    syncPreferences(selectedSubject, defaultChapter);
    loadChapterState(selectedSubject, defaultChapter);
  };

  const handleChapterChange = (e) => {
    const selectedChapter = e.target.value;
    setChapter(selectedChapter);
    syncPreferences(subject, selectedChapter);
    loadChapterState(subject, selectedChapter);
  };

  // --- PROTECT UNSAVED CHANGES ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to exit?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const draftKey = `gate_draft_${subject}_${chapter}`;
    if (isDirty) {
      localStorage.setItem(draftKey, JSON.stringify({ questions, syncedCount, isDirty }));
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [questions, syncedCount, isDirty, subject, chapter]);

  // --- SMART REFRESH & MATHJAX LOGIC ---
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
    script.async = true;
    document.head.appendChild(script);

    window.MathJax = {
      tex: { inlineMath: [['$', '$'], ['\\(', '\\)']], displayMath: [['$$', '$$'], ['\\[', '\\]']] },
      startup: { typeset: false }
    };
  }, []);

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => console.log(err));
    }
  }, [questions, subject, chapter]);

  // NEW: Force MathJax to re-parse the whole page (Fixes stuck LaTeX text)
  const forceRefreshPreview = () => {
    if (window.MathJax && window.MathJax.typesetClear) {
      window.MathJax.typesetClear();
      window.MathJax.typesetPromise().catch(err => console.error(err));
    }
  };

  // --- SCROLL, JUMP, & MISSING IMAGE LOGIC ---
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

  const handleJump = (e) => {
    e.preventDefault();
    const jumpValue = jumpInputRef.current?.value; 
    if (!jumpValue) return;
    
    const target = document.getElementById(`question-${jumpValue}`);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    else alert(`Question ${jumpValue} not found on this page.`);
    
    jumpInputRef.current.value = ""; 
  };

  // NEW: Calculate Missing Images dynamically
  const missingIndices = questions.map((q, idx) => {
    const textNeedsImg = q.text.includes('[DIAGRAM_PLACEHOLDER]') || q.text.includes('[IMG_');
    const noDiagramSet = !q.diagram || q.diagram.trim() === '';
    const incompleteOptImg = q.optA === 'IMG:' || q.optB === 'IMG:' || q.optC === 'IMG:' || q.optD === 'IMG:';
    if ((textNeedsImg && noDiagramSet) || incompleteOptImg) return idx + 1;
    return null;
  }).filter(val => val !== null);

  // NEW: Jump to the next missing image
  const handleNextMissingImage = () => {
    if (missingIndices.length === 0) return;
    const targetQNum = missingIndices[missingFocusIndex % missingIndices.length];
    const targetEl = document.getElementById(`question-${targetQNum}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
      // Temporarily highlight the card so it's easy to spot
      targetEl.children[1].style.transition = 'box-shadow 0.3s ease-in-out';
      targetEl.children[1].style.boxShadow = '0 0 15px 5px #f38ba8';
      setTimeout(() => { targetEl.children[1].style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)'; }, 1500);
    }
    setMissingFocusIndex(prev => prev + 1);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const getYearOptions = () => { let opts = []; for (let y = 2026; y >= 1990; y--) opts.push(y); return opts; };

  // --- PARSER LOGIC ---
  const parseAllPastedText = () => {
    if (!bulkText.trim()) return;
    let parts = bulkText.split(/QUESTION:\s*/i);
    let newQuestions = [];

    parts.forEach(part => {
      if (!part.trim()) return;
      let qText = part; let codeText = ""; let optionsText = "";

      let optMatch = qText.match(/OPTIONS:\s*(.*)/is);
      if (optMatch) { optionsText = optMatch[1].trim(); qText = qText.replace(/OPTIONS:\s*(.*)/is, '').trim(); }

      let codeMatch = qText.match(/CODE:\s*(.*)/is);
      if (codeMatch) { codeText = codeMatch[1].trim(); qText = qText.replace(/CODE:\s*(.*)/is, '').trim(); }

      qText = qText.replace(/^([Q]?[\d\.]+)\s*/i, '');
      const metaMatch = qText.match(/\[\s*(\d{4})[^:]*:\s*(\d+)\s*M\s*\]/i);
      let year = "2026"; let marks = "1";
      if (metaMatch) { year = metaMatch[1]; marks = metaMatch[2]; qText = qText.replace(metaMatch[0], '').trim(); }

      let hasDiagram = qText.includes('[DIAGRAM_PLACEHOLDER]') || qText.includes('[IMG_1]');
      let rawOptionsArray = optionsText.split(';');

      newQuestions.push({
        id: generateId(),
        text: qText.trim(), code: codeText, year, marks,
        diagram: hasDiagram ? "auto" : "", ext: ".png",
        optA: rawOptionsArray[0] ? rawOptionsArray[0].trim() : "",
        optB: rawOptionsArray[1] ? rawOptionsArray[1].trim() : "",
        optC: rawOptionsArray[2] ? rawOptionsArray[2].trim() : "",
        optD: rawOptionsArray[3] ? rawOptionsArray[3].trim() : "",
        natAnswer: "" 
      });
    });

    newQuestions = newQuestions.map((q, idx) => ({
      ...q, diagram: q.diagram === "auto" ? (questions.length + idx + 1).toString() : q.diagram
    }));

    setQuestions([...questions, ...newQuestions]);
    setIsDirty(true);
    setBulkText("");
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
  };

  // --- CRUD OPERATIONS ---
  const updateQ = (id, field, value) => { setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q)); setIsDirty(true); };
  const removeQuestion = (id) => { setQuestions(questions.filter(q => q.id !== id)); setIsDirty(true); };
  const insertQuestionAt = (index) => {
    const newQ = { id: generateId(), text: "", code: "", year: "2026", marks: "1", diagram: "", ext: ".png", optA: "", optB: "", optC: "", optD: "", natAnswer: "" };
    const updated = [...questions]; updated.splice(index, 0, newQ);
    setQuestions(updated); setIsDirty(true);
  };
  const handleOptionPaste = (id, e) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes(';')) {
      e.preventDefault(); const parts = pastedText.split(';');
      setQuestions(questions.map(q => {
        if (q.id === id) return { ...q, optA: parts[0]?.trim() || "", optB: parts[1]?.trim() || "", optC: parts[2]?.trim() || "", optD: parts[3]?.trim() || "", natAnswer: "" };
        return q;
      }));
      setIsDirty(true);
    }
  };

  // --- DATABASE, FILE HANDLING & EXPORT ---
  const saveToMongoDB = async () => {
    try {
      const res = await fetch('/api/chapters', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, chapter, questions })
      });
      const data = await res.json();
      if (data.success) {
        setSyncedCount(questions.length); 
        setIsDirty(false); 
        alert(`Saved successfully!`);
      } else alert("Error saving to DB: " + data.error);
    } catch (error) { alert("Error connecting to database"); }
  };

  const loadFromMongoDB = async () => {
    try {
      const res = await fetch(`/api/chapters?subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setQuestions(data.data.questions); setSyncedCount(data.data.questions.length); setIsDirty(false); 
        alert(`Revived ${data.data.questions.length} questions from DB!`);
      } else alert("No saved data found for this subject and chapter.");
    } catch (error) { alert("Error loading from DB"); }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedQuestions = JSON.parse(event.target.result);
        const sanitizedQuestions = importedQuestions.map((q) => ({
          ...q, id: q.id || generateId(),
          optA: q.options?.A || q.optA || "", optB: q.options?.B || q.optB || "",
          optC: q.options?.C || q.optC || "", optD: q.options?.D || q.optD || "",
          natAnswer: q.nat_answer || q.natAnswer || "",
          diagram: q.diagram_path ? q.diagram_path.replace('images/','').split('.')[0] : (q.diagram || ""),
          ext: q.diagram_path ? '.' + q.diagram_path.split('.').pop() : (q.ext || ".png"),
          text: q.question_text || q.text || "", code: q.code_snippet || q.code || "",
          year: q.gate_year || q.year || "2026", marks: q.marks || "1"
        }));
        setQuestions(sanitizedQuestions); setSyncedCount(0); setIsDirty(true);
      } catch (err) { alert("Error reading JSON file."); }
    };
    reader.readAsText(file); e.target.value = null; 
  };

  const handleExportPDF = async () => {
    if (questions.length === 0) return alert("No questions to compile!");
    alert("Compiling LaTeX to PDF... This might take a few seconds.");
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, chapter, questions })
      });
      if (!response.ok) throw new Error("PDF generation failed.");
      const blob = await response.blob(); const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${subject}_${chapter}_PYQs.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
    } catch (error) { alert("Error generating PDF. Make sure you are running locally."); }
  };

  const exportToJSON = () => {
    if (questions.length === 0) return alert("No questions to export!");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 4));
    const downloadAnchorNode = document.createElement('a'); downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "gate_pyq_bulk_export.json");
    document.body.appendChild(downloadAnchorNode); downloadAnchorNode.click(); downloadAnchorNode.remove();
  };

  const clearWorkspace = () => {
    if (confirm("Clear screen?")) { setQuestions([]); setSyncedCount(0); setIsDirty(true); }
  };

  const renderOptionText = (optText, ext) => {
    if (!optText) return null;
    if (optText.startsWith('IMG:')) {
      const imgName = optText.replace('IMG:', '').trim();
      return `<img src="/${subject}/${chapter}/${imgName}${ext}" style="max-height:60px; vertical-align:middle; border:1px solid #45475a; border-radius:4px; margin-left:10px;"/>`;
    }
    return optText;
  };

  return (
    <div style={{ maxWidth: '98%', margin: 'auto', padding: '20px' }}>
      
      {/* HEADER / NAVIGATION (Sticky) */}
      <div className="card" style={{ 
        display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', padding: '15px',
        position: 'sticky', top: '0', zIndex: '100', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', 
        borderBottom: '2px solid #89b4fa', margin: '-20px -20px 20px -20px', 
        borderRadius: '0 0 8px 8px'
      }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ marginTop: 0 }}>Subject</label>
          <select value={subject} onChange={handleSubjectChange} style={{ cursor: 'pointer' }}>
            {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ marginTop: 0 }}>Chapter</label>
          <select value={chapter} onChange={handleChapterChange} style={{ cursor: 'pointer' }}>
            {GATE_SYLLABUS[subject].map(chap => <option key={chap} value={chap}>{chap}</option>)}
          </select>
        </div>

        {/* --- THE SYNC TRACKER WIDGET WITH MISSING IMAGE TRACKER --- */}
        <div style={{ flex: '1 1 250px', textAlign: 'center', padding: '10px', background: '#181825', borderRadius: '4px', border: `1px solid ${isDirty ? '#f9e2af' : (questions.length > 0 ? '#a6e3a1' : '#45475a')}` }}>
          {questions.length === 0 ? (
            <span style={{ color: '#6c7086', fontWeight: 'bold' }}>No Questions Found</span>
          ) : isDirty ? (
            <span style={{ color: '#f9e2af', fontWeight: 'bold' }}>⚠️ {syncedCount}/{questions.length} Synced (Unsaved)</span>
          ) : (
            <span style={{ color: '#a6e3a1', fontWeight: 'bold' }}>✅ All {questions.length} Synced</span>
          )}

          {/* MISSING IMAGE BUTTON */}
          {missingIndices.length > 0 && (
            <button 
              onClick={handleNextMissingImage}
              style={{ display: 'block', margin: '5px auto 0 auto', background: '#f38ba8', color: '#11111b', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
            >
              🖼️ {missingIndices.length} Images Missing (Click to Jump)
            </button>
          )}
        </div>
        
        {/* ACTION BUTTONS & SMART REFRESH */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-export" style={{ background: '#cba6f7', color: '#11111b', padding: '10px 15px' }} onClick={handleExportPDF}>🚀 PDF</button>
          <button className="btn-autofill" style={{ padding: '10px 15px' }} onClick={loadFromMongoDB}>📥 Revive</button>
          <button className="btn-export" style={{ background: '#a6e3a1', color: '#11111b', padding: '10px 15px' }} onClick={saveToMongoDB}>💾 Save DB</button>
          
          <label style={{ margin: 0, cursor: 'pointer', background: '#89b4fa', color: '#11111b', padding: '10px 15px', borderRadius: '4px', fontWeight: 'bold' }}>
            📂 Import JSON
            <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          
          <button className="btn-export" style={{ background: '#f9e2af', color: '#11111b', padding: '10px 15px' }} onClick={exportToJSON}>📤 Export JSON</button>
          <button className="btn-clear" style={{ padding: '10px 15px' }} onClick={clearWorkspace}>🗑️ Clear</button>

          {/* QUICK SCROLL, JUMP & REFRESH TOOLS */}
          <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
            <form onSubmit={handleJump} style={{ display: 'flex', gap: '5px', marginRight: '5px' }}>
              <input type="number" min="1" max={questions.length || 1} ref={jumpInputRef} placeholder="Q#" style={{ width: '55px', padding: '8px', borderRadius: '4px', border: '1px solid #45475a', background: '#181825', color: '#cdd6f4', textAlign: 'center', outline: 'none' }} />
              <button type="submit" style={{ background: '#89b4fa', color: '#11111b', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Go</button>
            </form>
            <button onClick={forceRefreshPreview} style={{ background: '#a6e3a1', color: '#11111b', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }} title="Force Refresh Preview">🔄</button>
            <button onClick={scrollToTop} style={{ background: '#45475a', color: '#cdd6f4', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }} title="Top">⬆️</button>
            <button onClick={scrollToBottom} style={{ background: '#45475a', color: '#cdd6f4', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }} title="Bottom">⬇️</button>
          </div>
        </div>
      </div>

      {/* RENDER QUESTIONS */}
      <div id="questions_container">
        {questions.map((q, idx) => {
          const qNum = idx + 1;
          const imageList = q.diagram ? q.diagram.split(',').map(s => s.trim()).filter(Boolean) : [];
          const hasOptions = q.optA || q.optB || q.optC || q.optD;

          let formattedText = q.text.replace(/\n/g, '<br>');
          imageList.forEach((imgName, i) => {
            const imgPath = `/${subject}/${chapter}/${imgName}${q.ext}`;
            const imgTag = `<div style="border:1px dashed #74c7ec; padding:10px; text-align:center; margin: 10px 0;"><img src="${imgPath}" alt="Missing image" style="max-width:100%; max-height:200px;"/><br/><small style="color:#74c7ec">${imgPath}</small></div>`;
            if (formattedText.includes(`[IMG_${i+1}]`)) formattedText = formattedText.replace(`[IMG_${i+1}]`, imgTag);
            else if (i === 0 && formattedText.includes('[DIAGRAM_PLACEHOLDER]')) formattedText = formattedText.replace('[DIAGRAM_PLACEHOLDER]', imgTag);
            else formattedText += imgTag; 
          });

          return (
            <div key={q.id} id={`question-${qNum}`} style={{ scrollMarginTop: '160px' }}>
              <div style={{ textAlign: 'center', margin: '-10px 0 10px 0' }}>
                <button className="btn-autofill" style={{ width: 'auto', padding: '4px 12px', fontSize: '12px', background: '#45475a', color: '#cdd6f4' }} onClick={() => insertQuestionAt(idx)}>+ Insert Here</button>
              </div>

              <div className="card question-card" style={{ display: 'flex' }}>
                <div className="half-width">
                  <div className="q-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, color: '#a6e3a1' }}>Question {qNum}</h3>
                    <button className="btn-clear" style={{ padding: '4px 10px' }} onClick={() => removeQuestion(q.id)}>Remove</button>
                  </div>
                  <label>Question Text</label>
                  <textarea value={q.text} onChange={(e) => updateQ(q.id, 'text', e.target.value)} className="q-text" />
                  <label>Code Snippet</label>
                  <textarea value={q.code} onChange={(e) => updateQ(q.id, 'code', e.target.value)} className="code-text" />

                  <div className="grid-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px' }}>
                    <div><label>Year</label><select value={q.year} onChange={(e) => updateQ(q.id, 'year', e.target.value)}>{getYearOptions().map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                    <div><label>Marks</label><div className="radio-group" style={{ display: 'flex', gap: '5px' }}><input type="radio" checked={q.marks === "1"} onChange={() => updateQ(q.id, 'marks', "1")} /> 1M <input type="radio" checked={q.marks === "2"} onChange={() => updateQ(q.id, 'marks', "2")} style={{ marginLeft: '10px'}}/> 2M</div></div>
                    <div><label>Images</label><div className="input-group" style={{ display: 'flex' }}><input type="text" value={q.diagram} onChange={(e) => updateQ(q.id, 'diagram', e.target.value)} placeholder="e.g. 1a, 1b" style={{ borderRadius: '4px 0 0 4px' }}/><select value={q.ext} onChange={(e) => updateQ(q.id, 'ext', e.target.value)} style={{ width: '60px' }}><option value=".png">.png</option><option value=".jpg">.jpg</option></select></div></div>
                  </div>

                  <label style={{ color: '#f5c2e7' }}>Options (Paste A;B;C;D in Box A. IMG:filename for images. Blank for NAT)</label>
                  <div className="grid-opts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input type="text" value={q.optA} onPaste={(e) => handleOptionPaste(q.id, e)} onChange={(e) => updateQ(q.id, 'optA', e.target.value)} placeholder="Option A" />
                    <input type="text" value={q.optB} onChange={(e) => updateQ(q.id, 'optB', e.target.value)} placeholder="Option B" />
                    <input type="text" value={q.optC} onChange={(e) => updateQ(q.id, 'optC', e.target.value)} placeholder="Option C" />
                    <input type="text" value={q.optD} onChange={(e) => updateQ(q.id, 'optD', e.target.value)} placeholder="Option D" />
                  </div>
                  {!hasOptions && (<div style={{ marginTop: '10px' }}><input type="text" value={q.natAnswer || ""} onChange={(e) => updateQ(q.id, 'natAnswer', e.target.value)} placeholder="NAT Answer" style={{ border: '1px solid #f38ba8' }} /></div>)}
                </div>

                <div className="preview-pane" style={{ paddingLeft: '20px', width: '50%' }}>
                  <div style={{ color: '#a6e3a1', fontWeight: 'bold', marginBottom: '10px' }}>[GATE {q.year} | {q.marks} Mark]</div>
                  <div dangerouslySetInnerHTML={{ __html: formattedText }} />
                  {q.code && <div style={{ background: '#181825', padding: '10px', border: '1px solid #45475a', fontFamily: 'monospace', whiteSpace: 'pre-wrap', margin: '10px 0' }}>{q.code}</div>}
                  <div style={{ marginTop: '15px' }}>
                    {hasOptions ? (
                      <>
                        <div style={{ marginBottom: '8px' }}><strong>(A)</strong> <span dangerouslySetInnerHTML={{ __html: renderOptionText(q.optA, q.ext) }} /></div>
                        <div style={{ marginBottom: '8px' }}><strong>(B)</strong> <span dangerouslySetInnerHTML={{ __html: renderOptionText(q.optB, q.ext) }} /></div>
                        <div style={{ marginBottom: '8px' }}><strong>(C)</strong> <span dangerouslySetInnerHTML={{ __html: renderOptionText(q.optC, q.ext) }} /></div>
                        <div style={{ marginBottom: '8px' }}><strong>(D)</strong> <span dangerouslySetInnerHTML={{ __html: renderOptionText(q.optD, q.ext) }} /></div>
                      </>
                    ) : (<div style={{ color: '#f38ba8' }}><strong>NAT Answer:</strong> {q.natAnswer ? q.natAnswer : '_________________'}</div>)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" id="paste_section" style={{ marginTop: '20px', border: '2px solid #89b4fa' }}>
        <label style={{ fontSize: '16px' }}>⚡ Quick Paste</label>
        <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} style={{ minHeight: '120px', marginTop: '10px' }}></textarea>
        <button className="btn-autofill" style={{ marginTop: '15px' }} onClick={parseAllPastedText}>⚡ Extract & Append</button>
      </div>

    </div>
  );
}