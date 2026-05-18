'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';

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

const TOPIC_MAPPING = {
  "Asymptotic Notation": "1. Algo. Analysis and Asymptotic Notations",
  "Recurrence Relation": "1. Algo. Analysis and Asymptotic Notations",
  "Divide and Conquer": "2. Divide and Conquer",
  "Sorting": "2. Divide and Conquer",
  "Greedy Technique": "3. Greedy Method",
  "Minimum Spanning Tree": "3. Greedy Method",
  "Shortest Path": "3. Greedy Method",
  "Graph Traversal": "6. Miscellaneous Topics",
  "Dynamic Programming": "4. Dynamic Programming",
  "Array": "1. Arrays",
  "Link List": "3. Linked Lists",
  "Stack": "2. Stack and Queues",
  "Queue": "2. Stack and Queues",
  "Binary Tree": "4. Trees",
  "Binary Search Tree": "4. Trees",
  "AVL Tree": "4. Trees",
  "B Tree": "4. Trees",
  "B+ Tree": "4. Trees",
  "Heap Tree": "4. Trees",
  "n-ary Tree": "4. Trees",
  "Hashing": "6. Hashing",
  "Arithmetic Operation": "1. Programming",
  "Conditional Statement": "1. Programming",
  "Loops": "1. Programming",
  "Array and Pointer": "1. Programming",
  "Function": "1. Programming",
  "Lexical Analysis": "1. Lexical Analysis",
  "Parsing": "2. Parsing Techniques",
  "Syntax-directed Translation": "3. Syntax Directed Translations",
  "Intermediate Code Generation": "4. Code Generations and Optimizatinos",
  "Runtime Environment": "4. Code Generations and Optimizatinos",
  "Matching": "1. Lexical Analysis",
  "Regular Expression": "1. Finite Automata and Regular Languages",
  "Regular Grammar": "1. Finite Automata and Regular Languages",
  "Regular Language": "1. Finite Automata and Regular Languages",
  "Finite Automata": "1. Finite Automata and Regular Languages",
  "Context Free Grammar": "2. PDA - CFL and DCFL",
  "Context Free Language": "2. PDA - CFL and DCFL",
  "Push-down Automata": "2. PDA - CFL and DCFL",
  "Recursive Language": "3. Turing Machine, RE, REC, Undecidabilitu",
  "Turing Machine": "3. Turing Machine, RE, REC, Undecidabilitu",
  "Undecidability": "3. Turing Machine, RE, REC, Undecidabilitu",
  "Process": "1. Process Management-1",
  "Thread": "1. Process Management-1",
  "CPU Scheduling": "1. Process Management-1",
  "Process Synchronization": "2. Process Management-2",
  "Deadlock": "3. Deadlock",
  "Memory Management": "4. Mem. Mgmt and Virtual Mem",
  "File Systems": "5. File Sys and Device Mgmt",
  "Disk Scheduling": "5. File Sys and Device Mgmt",
  "System Call": "6. Miscellaneous",
  "OSI Layer": "1. ISO-OSI Stack and SWP",
  "Physical Layer": "1. ISO-OSI Stack and SWP",
  "Data Link Layer": "1. ISO-OSI Stack and SWP",
  "Network Layer Protocol": "3. TCP, UDP and IP",
  "Transport Layer Protocol": "3. TCP, UDP and IP",
  "Application Layer Protocols": "4. Routing and Application Layer",
  "Network Security": "4. Routing and Application Layer",
  "Machine Instruction": "1. CPU Arch. and Address. Modes",
  "Addressing Modes": "1. CPU Arch. and Address. Modes",
  "ALU Data Path and Control Unit": "2. Control Unit Design",
  "Pipeline Processor": "3. Instructions Pipeline",
  "Cache Memory": "4. Memory Organization",
  "Secondary Storage": "4. Memory Organization",
  "Memory Chip Design": "4. Memory Organization",
  "IO Interface": "5. IO Organisation",
  "Interrupt": "5. IO Organisation",
  "ER Model": "1. ER Model",
  "Normal Form": "2. Funcational Dependencies and Normalizaation",
  "SQL": "3. Structure Query Language",
  "Relational Schema": "4. Relational Model",
  "Relational Algebra": "4. Relational Model",
  "Tuple Calculus": "4. Relational Model",
  "Integrity Constraints": "4. Relational Model",
  "Transactions": "5. Transactions and Concurrency Contorl",
  "File System": "6. File Structures",
  "Propositional Logic": "1. Mathematical Logic",
  "Set Theory": "2. Set Theory and Algebra",
  "Relation": "2. Set Theory and Algebra",
  "Functions": "2. Set Theory and Algebra",
  "Lattice": "2. Set Theory and Algebra",
  "Group Theory": "2. Set Theory and Algebra",
  "Combination": "3. Combinatorics",
  "Recurrence": "3. Combinatorics",
  "Graph Theory": "4. Graph Theory",
  "Planar Graph": "4. Graph Theory",
  "Probability Theory": "1. Probability",
  "Boolean Algebra": "1. Logic Functions and Minimizations",
  "Combinational Circuit": "2. Combinational Circuits",
  "Sequential Circuit": "3. Sequential Circuits",
  "Number System": "4. Number Systems",
  "Linear Algebra": "2. Linear Algebra",
  "Calculus": "3. Calculus",
  "Numerical Method": "3. Calculus"
};

export default function ScraperPage() {
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [groupedQuestions, setGroupedQuestions] = useState({});
  const [toast, setToast] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});

  const availableSubjects = Object.keys(GATE_SYLLABUS);
  const [subject, setSubject] = useState(availableSubjects[1]);
  const [chapter, setChapter] = useState(GATE_SYLLABUS[availableSubjects[1]][0]);
  const [savedBackups, setSavedBackups] = useState([]);
  const [selectedBackup, setSelectedBackup] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAvailableBackups = () => {
    if (typeof window === 'undefined') return;
    const keys = Object.keys(localStorage)
      .filter(key => key.startsWith('gate_scraper_backup_'))
      .map(key => key.replace('gate_scraper_backup_', ''));
    setSavedBackups(keys);
    if (keys.length > 0 && !selectedBackup) setSelectedBackup(keys[0]);
  };

  const handleLoadFromDB = async (targetSubject) => {
    if (!targetSubject) return;
    try {
      showToast(`☁️ Fetching ${targetSubject} from Cloud DB...`, "info");
      const loadedGroups = {};
      const newExpandedState = {};
      let totalQs = 0;

      for (const chap of GATE_SYLLABUS[targetSubject]) {
        const res = await fetch(`/api/scraped-chapters?subject=${encodeURIComponent(targetSubject)}&chapter=${encodeURIComponent(chap)}`);
        const data = await res.json();
        if (data.success && data.data && data.data.questions && data.data.questions.length > 0) {
          loadedGroups[chap] = data.data.questions;
          newExpandedState[chap] = true; // Default Expand
          totalQs += data.data.questions.length;
        }
      }

      if (totalQs === 0) {
        showToast(`ℹ️ No data found in MongoDB for ${targetSubject}`, "info");
        return;
      }

      setGroupedQuestions(loadedGroups);
      setExpandedGroups(newExpandedState);
      setSubject(targetSubject);
      setChapter(GATE_SYLLABUS[targetSubject][0]);
      showToast(`✅ Loaded ${totalQs} questions from DB for ${targetSubject}!`);
    } catch (error) {
      showToast("❌ Error loading from DB", "error");
    }
  };

  const handlePushLiveToDB = async () => {
    if (Object.keys(groupedQuestions).length === 0) return showToast("❌ No questions on screen to push!", "error");
    const flatQuestions = [];
    Object.values(groupedQuestions).forEach(arr => flatQuestions.push(...arr));

    if (!confirm(`🚨 Are you sure you want to OVERWRITE the Cloud DB for all chapters in "${subject}" with the ${flatQuestions.length} questions currently on your screen?`)) return;

    try {
      showToast(`☁️ Pushing ${subject} to Cloud...`, "info");
      for (const [chapterName, qsArray] of Object.entries(groupedQuestions)) {
        await fetch('/api/scraped-chapters', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, chapter: chapterName, questions: qsArray })
        });
      }
      showToast(`✅ Successfully pushed all ${subject} data to Cloud DB!`);
    } catch (error) {
      showToast("❌ Network error saving to cloud", "error");
    }
  };

  useEffect(() => {
    loadAvailableBackups();
  }, []);

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
    if (isScraping) return;
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.MathJax && window.MathJax.typesetPromise) {
        const container = document.getElementById('questions_render_container');
        if (container) {
          window.MathJax.typesetClear([container]);
          window.MathJax.typesetPromise([container]).catch(err => console.error(err));
        }
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [groupedQuestions, expandedGroups, isScraping]);

  const startScraping = async () => {
    if (!url.includes('practicepaper.in')) {
      return showToast("❌ Please enter a valid practicepaper.in URL", "error");
    }
    setIsScraping(true);
    setGroupedQuestions({});
    setExpandedGroups({});
    setProgress({ current: 1, total: '?' });

    let allQuestions = [];
    let totalPages = 1;

    try {
      const firstRes = await fetch(`/api/scrape?url=${encodeURIComponent(url)}&page=1`);
      const firstData = await firstRes.json();
      if (!firstData.success) throw new Error(firstData.error);
      
      totalPages = firstData.totalPages;
      allQuestions = [...firstData.questions];
      setProgress({ current: 1, total: totalPages });

      for (let p = 2; p <= totalPages; p++) {
        setProgress({ current: p, total: totalPages });
        const res = await fetch(`/api/scrape?url=${encodeURIComponent(url)}&page=${p}`);
        const data = await res.json();
        if (data.success && data.questions) {
          allQuestions = [...allQuestions, ...data.questions];
        }
      }

      const newGroups = {};
      const newExpandedState = {};

      allQuestions.sort((a, b) => parseInt(a.year) - parseInt(b.year)).forEach(q => {
        const mappedChapter = TOPIC_MAPPING[q.rawTopic] || q.rawTopic || "Uncategorized";
        if (!newGroups[mappedChapter]) {
          newGroups[mappedChapter] = [];
          newExpandedState[mappedChapter] = true; // Default Expand
        }
        newGroups[mappedChapter].push(q);
      });

      setGroupedQuestions(newGroups);
      setExpandedGroups(newExpandedState);
      showToast(`✅ Successfully scraped ${allQuestions.length} questions into ${Object.keys(newGroups).length} groups!`);
    } catch (error) {
      showToast(`❌ Error: ${error.message}`, "error");
    } finally {
      setIsScraping(false);
    }
  };

  const handleCopyGroup = (questionsArray, chapterName) => {
    let bulkString = "";
    questionsArray.forEach(q => {
      bulkString += `QUESTION: ${q.text.trim()} [${q.year} : ${q.marks} M]\n`;
      if (q.code) bulkString += `CODE: ${q.code}\n`;
      if (q.optA || q.optB || q.optC || q.optD) {
        bulkString += `OPTIONS: ${q.optA || ''} ; ${q.optB || ''} ; ${q.optC || ''} ; ${q.optD || ''}\n`;
      }
      bulkString += `\n`;
    });
    navigator.clipboard.writeText(bulkString.trim());
    showToast(`📋 Copied ${questionsArray.length} questions for ${chapterName}!`);
  };

  const toggleGroup = (chapterName) => {
    setExpandedGroups(prev => ({ ...prev, [chapterName]: !prev[chapterName] }));
  };

  const toggleAll = (forceExpand) => {
    const newState = {};
    Object.keys(groupedQuestions).forEach(key => { newState[key] = forceExpand; });
    setExpandedGroups(newState);
  };

  const handleSaveToLocalStorage = () => {
    if (Object.keys(groupedQuestions).length === 0) return showToast("❌ No data to save!", "error");
    localStorage.setItem(`gate_scraper_backup_${subject}`, JSON.stringify(groupedQuestions));
    loadAvailableBackups();
    setSelectedBackup(subject);
    showToast(`💾 Saved backup for ${subject}!`);
  };

  const handleLoadFromLocalStorage = (targetSubject) => {
    if (!targetSubject) return;
    const saved = localStorage.getItem(`gate_scraper_backup_${targetSubject}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setGroupedQuestions(parsed);
      const newExpandedState = {};
      Object.keys(parsed).forEach(key => { newExpandedState[key] = true; }); // Default Expand
      setExpandedGroups(newExpandedState);
      setSubject(targetSubject);
      setChapter(GATE_SYLLABUS[targetSubject][0]);
      showToast(`📂 Loaded backup for ${targetSubject}!`);
    }
  };

  const handleCopySingleQuestion = (q) => {
    let qString = `QUESTION: ${q.text.trim()} [${q.year} : ${q.marks} M]\n`;
    if (q.code) qString += `CODE: ${q.code}\n`;
    if (q.optA || q.optB || q.optC || q.optD) {
      qString += `OPTIONS: ${q.optA || ''} ; ${q.optB || ''} ; ${q.optC || ''} ; ${q.optD || ''}\n`;
    }
    navigator.clipboard.writeText(qString.trim());
    showToast(`📋 Copied Question to clipboard!`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px', color: '#cdd6f4' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '30px', right: '30px',
          background: toast.type === 'error' ? '#f38ba8' : toast.type === 'info' ? '#89b4fa' : '#a6e3a1',
          color: '#11111b', padding: '15px 25px', borderRadius: '8px', zIndex: 9999, fontWeight: 'bold'
        }}>{toast.message}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #89b4fa', paddingBottom: '15px', marginBottom: '20px' }}>
        <h1 style={{ color: '#89b4fa', margin: 0 }}>🕸️ Topic-Grouped Scraper</h1>
        <Link href="/" style={{ background: '#45475a', color: '#cdd6f4', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          ⬅ Back to Editor
        </Link>
      </div>

      <div className="card" style={{ background: '#1e1e2e', padding: '15px 20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', border: '1px solid #a6e3a1' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '20px' }}>☁️</span>
          <h3 style={{ margin: 0, color: '#a6e3a1', fontSize: '16px' }}>Cloud DB Manager</h3>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setChapter(GATE_SYLLABUS[e.target.value][0]); }}
            style={{ padding: '8px', borderRadius: '4px', background: '#11111b', color: '#cdd6f4', border: '1px solid #a6e3a1', outline: 'none', cursor: 'pointer' }}
          >
            {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
          <button onClick={() => handleLoadFromDB(subject)} style={{ background: '#a6e3a1', color: '#11111b', padding: '8px 15px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            📂 Load from DB
          </button>
          {Object.keys(groupedQuestions).length > 0 && (
            <button onClick={handlePushLiveToDB} style={{ background: '#f38ba8', color: '#11111b', padding: '8px 15px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              🚨 Push Screen to DB
            </button>
          )}
        </div>
      </div>

      <div className="card" style={{ background: '#181825', padding: '20px', borderRadius: '10px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div style={{ flex: '1 1 100%' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#bac2de', fontWeight: 'bold' }}>Target URL to Scrape</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="e.g., https://practicepaper.in/gate-cse/theory-of-computation"
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #45475a', background: '#11111b', color: '#cdd6f4', outline: 'none' }}
            disabled={isScraping}
          />
        </div>
        <button onClick={startScraping} disabled={isScraping || !url} style={{ background: isScraping ? '#6c7086' : '#89b4fa', color: '#11111b', padding: '12px 25px', borderRadius: '6px', fontWeight: 'bold', border: 'none', cursor: isScraping ? 'not-allowed' : 'pointer' }}>
          {isScraping ? `Scraping Page ${progress.current} of ${progress.total}...` : '🚀 Start Scraping & Auto-Group'}
        </button>
      </div>

      {Object.keys(groupedQuestions).length > 0 && (
        <div style={{ background: '#313244', padding: '15px', borderRadius: '10px', display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px', border: '1px solid #a6e3a1', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: '1 1 auto' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#bac2de' }}>Target Subject:</label>
              <select value={subject} onChange={(e) => { setSubject(e.target.value); setChapter(GATE_SYLLABUS[e.target.value][0]); }} style={{ padding: '8px', borderRadius: '4px', background: '#11111b', color: '#cdd6f4', border: '1px solid #45475a' }}>
                {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={handleSaveToLocalStorage} style={{ background: '#89b4fa', color: '#11111b', padding: '10px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              💾 Save Backup
            </button>
            <button onClick={() => toggleAll(true)} style={{ background: '#45475a', color: '#cdd6f4', padding: '10px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Expand All</button>
            <button onClick={() => toggleAll(false)} style={{ background: '#45475a', color: '#cdd6f4', padding: '10px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Collapse All</button>
          </div>
        </div>
      )}

      <div id="questions_render_container">
        <div style={{ display: 'grid', gap: '15px' }}>
          {Object.entries(groupedQuestions).map(([chapterName, questionsArray]) => (
            <div key={chapterName} style={{ background: '#11111b', border: '2px solid #cba6f7', borderRadius: '10px', overflow: 'hidden' }}>
              <div
                onClick={() => toggleGroup(chapterName)}
                style={{ background: '#313244', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', borderBottom: expandedGroups[chapterName] ? '2px solid #cba6f7' : 'none' }}
              >
                <h2 style={{ margin: 0, color: '#cba6f7', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px', display: 'inline-block', width: '20px', textAlign: 'center' }}>{expandedGroups[chapterName] ? '▼' : '▶'}</span>
                  {chapterName} <span style={{ fontSize: '14px', color: '#bac2de' }}>({questionsArray.length} Qs)</span>
                </h2>
                <button onClick={(e) => { e.stopPropagation(); handleCopyGroup(questionsArray, chapterName); }} style={{ background: '#a6e3a1', color: '#11111b', padding: '8px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                  📋 Copy Group
                </button>
              </div>

              {expandedGroups[chapterName] && (
                <div style={{ padding: '20px', display: 'grid', gap: '20px' }}>
                  {questionsArray.map((q, idx) => (
                    <div key={q.id} style={{ background: '#1e1e2e', padding: '20px', borderRadius: '8px', border: '1px solid #45475a' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ color: '#89b4fa', fontWeight: 'bold' }}>#{idx + 1}</span>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          {q.setNum && <span style={{ background: '#89b4fa', color: '#11111b', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginRight: '10px' }}>Set-{q.setNum}</span>}
                          <span style={{ background: '#f9e2af', color: '#11111b', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>GATE {q.year} | {q.marks} Mark</span>
                          <button onClick={() => handleCopySingleQuestion(q)} style={{ background: '#cba6f7', color: '#11111b', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', marginLeft: '10px', border: 'none', cursor: 'pointer' }} title="Copy formatted LaTeX for this question">
                            📋 Copy
                          </button>
                        </div>
                      </div>
                      <div style={{ marginBottom: '15px', whiteSpace: 'pre-wrap' }} dangerouslySetInnerHTML={{ __html: q.text.replace(/\n/g, '<br>') }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {q.optA && <div style={{ background: '#11111b', padding: '10px', borderRadius: '4px', border: '1px solid #45475a' }}><strong>(A)</strong> <span dangerouslySetInnerHTML={{ __html: q.optA }} /></div>}
                        {q.optB && <div style={{ background: '#11111b', padding: '10px', borderRadius: '4px', border: '1px solid #45475a' }}><strong>(B)</strong> <span dangerouslySetInnerHTML={{ __html: q.optB }} /></div>}
                        {q.optC && <div style={{ background: '#11111b', padding: '10px', borderRadius: '4px', border: '1px solid #45475a' }}><strong>(C)</strong> <span dangerouslySetInnerHTML={{ __html: q.optC }} /></div>}
                        {q.optD && <div style={{ background: '#11111b', padding: '10px', borderRadius: '4px', border: '1px solid #45475a' }}><strong>(D)</strong> <span dangerouslySetInnerHTML={{ __html: q.optD }} /></div>}
                      </div>
                      {q.natAnswer === "NAT" && !q.optA && <div style={{ marginTop: '10px', color: '#f38ba8', fontWeight: 'bold' }}>Numerical Answer Type (NAT)</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}