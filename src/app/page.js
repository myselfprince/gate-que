'use client'

import { useState, useEffect, useRef } from 'react';
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

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const jumpInputRef = useRef(null);
  const [lockCount, setLockCount] = useState(0);
  const lockInputRef = useRef(null);

  const availableSubjects = Object.keys(GATE_SYLLABUS);
  const [subject, setSubject] = useState(availableSubjects[0]);
  const [chapter, setChapter] = useState(GATE_SYLLABUS[availableSubjects[0]][0]);

  const [syncedCount, setSyncedCount] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [imgCacheBuster, setImgCacheBuster] = useState(Date.now());
  const [imageErrors, setImageErrors] = useState(new Set());
  const [missingFocusIndex, setMissingFocusIndex] = useState(0);
  const [activePasteIndex, setActivePasteIndex] = useState(null);
  const [inlinePasteText, setInlinePasteText] = useState("");
  const [imageTextWidth, setImageTextWidth] = useState(70);
  const [toast, setToast] = useState(null);
  const [isReviving, setIsReviving] = useState(false);

  // SEARCH STATES
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [hasJumped, setHasJumped] = useState(false); // Tracks if we've scrolled to the first result yet

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const saveHistory = () => {
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(questions))].slice(-20));
  };

  const handleUndo = () => {
    if (history.length === 0) return showToast("Nothing to undo!", "info");
    const prevHistory = [...history];
    const previousState = prevHistory.pop();
    setHistory(prevHistory);
    setQuestions(previousState);
    setIsDirty(true);
    showToast("⏪ Undid recent change!");
  };

  const loadChapterState = (sub, chap) => {
    const draftKey = `gate_draft_${sub}_${chap}`;
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      const parsed = JSON.parse(draft);
      setQuestions(parsed.questions || []);
      setSyncedCount(parsed.syncedCount || 0);
      setLockCount(parsed.lockCount || 0);
      setIsDirty(parsed.isDirty || false);
    } else {
      setQuestions([]);
      setSyncedCount(0);
      setLockCount(0);
      setIsDirty(false);
    }
    setHistory([]);
    setSearchQuery(""); 
    setHasJumped(false);
  };

  const loadFromMongoDB = async (sub, chap) => {
    setIsReviving(true);
    try {
      const res = await fetch(`/api/chapters?subject=${encodeURIComponent(sub)}&chapter=${encodeURIComponent(chap)}`);
      const data = await res.json();
      if (data.success && data.data && data.data.questions && data.data.questions.length > 0) {
        setQuestions(data.data.questions);
        setSyncedCount(data.data.questions.length);
        setLockCount(data.data.lockCount || 0);
        setIsDirty(false);
        setHistory([]);
        showToast(`✅ Revived ${data.data.questions.length} questions!`, 'success');
      } else {
        showToast("ℹ️ No DB data found. Loaded local draft.", "info");
        loadChapterState(sub, chap);
      }
    } catch (error) {
      showToast("❌ Error auto-loading from DB", "error");
      loadChapterState(sub, chap);
    } finally {
      setIsReviving(false);
      setSearchQuery(""); 
      setHasJumped(false);
    }
  };

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
            loadFromMongoDB(savedSub, chap);
          } else {
            loadFromMongoDB(availableSubjects[0], GATE_SYLLABUS[availableSubjects[0]][0]);
          }
        } else {
          loadFromMongoDB(availableSubjects[0], GATE_SYLLABUS[availableSubjects[0]][0]);
        }
      })
      .catch(err => {
        console.error("Failed to load preferences", err);
        loadFromMongoDB(availableSubjects[0], GATE_SYLLABUS[availableSubjects[0]][0]);
      });
  }, []);

  useEffect(() => {
    window.reportImageStatus = (path, isError) => {
      setImageErrors(prev => {
        if (isError && prev.has(path)) return prev;
        if (!isError && !prev.has(path)) return prev;
        const newSet = new Set(prev);
        if (isError) newSet.add(path);
        else newSet.delete(path);
        return newSet;
      });
    };
    return () => { delete window.reportImageStatus; };
  }, []);

  // SEARCH SCANNER EFFECT
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      setHasJumped(false);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const matches = [];
    
    questions.forEach((q, idx) => {
      const isLocked = idx < lockCount;
      if (!isLocked) {
        const matchesSearch =
          q.text.toLowerCase().includes(lowerQuery) ||
          (q.code && q.code.toLowerCase().includes(lowerQuery)) ||
          (q.optA && q.optA.toLowerCase().includes(lowerQuery)) ||
          (q.optB && q.optB.toLowerCase().includes(lowerQuery)) ||
          (q.optC && q.optC.toLowerCase().includes(lowerQuery)) ||
          (q.optD && q.optD.toLowerCase().includes(lowerQuery));

        if (matchesSearch) {
          matches.push(idx); // Store the actual array index of the match
        }
      }
    });

    setSearchResults(matches);
    setCurrentSearchIndex(0);
    setHasJumped(false); // Reset jump state when typing new queries
  }, [searchQuery, questions, lockCount]);

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
    setLockCount(0);
    syncPreferences(selectedSubject, defaultChapter);
    loadFromMongoDB(selectedSubject, defaultChapter);
  };

  const handleChapterChange = (e) => {
    const selectedChapter = e.target.value;
    setChapter(selectedChapter);
    setLockCount(0);
    syncPreferences(subject, selectedChapter);
    loadFromMongoDB(subject, selectedChapter);
  };

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
      localStorage.setItem(draftKey, JSON.stringify({ questions, syncedCount, isDirty, lockCount }));
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [questions, syncedCount, isDirty, subject, chapter, lockCount]);

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
        const container = document.getElementById('questions_container');
        if (container) {
          window.MathJax.typesetClear([container]);
          window.MathJax.typesetPromise([container]).catch(err => console.error("MathJax Render Error:", err));
        }
      }
    }, 800);
    return () => clearTimeout(timer);
  });

  useEffect(() => {
    if (lockInputRef.current) {
      lockInputRef.current.value = lockCount > 0 ? lockCount : '';
    }
  }, [lockCount]);

  const forceRefreshPreview = () => {
    setImgCacheBuster(Date.now());
    setImageErrors(new Set());
    showToast("🔄 Previews refreshed", "info");
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

  const saveToMongoDB = async (overrideLockCount = null, isSilent = false) => {
    const lockVal = overrideLockCount !== null ? overrideLockCount : lockCount;
    if (!isSilent) {
      if (!confirm(`🚨 DATABASE OVERWRITE CONFIRMATION 🚨\n\nAre you sure you want to SAVE to DB?\n\nThis will permanently overwrite the database for "${subject} - ${chapter}" with the ${questions.length} questions currently on your screen.`)) {
        return false;
      }
    }
    try {
      if (!isSilent) showToast("Saving to DB...", "info");
      const res = await fetch('/api/chapters', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, chapter, questions, lockCount: lockVal })
      });
      const data = await res.json();
      if (data.success) {
        setSyncedCount(questions.length);
        setIsDirty(false);
        if (!isSilent) showToast(`✅ Saved successfully!`);
        return true;
      } else {
        showToast("❌ Error saving to DB: " + data.error, "error");
        return false;
      }
    } catch (error) {
      showToast("❌ Error connecting to database", "error");
      return false;
    }
  };

  const handleLock = async (e) => {
    e.preventDefault();
    const val = parseInt(lockInputRef.current?.value || 0, 10);
    if (isNaN(val) || val < 0 || val > questions.length) {
      return showToast(`❌ Invalid lock number. Must be between 0 and ${questions.length}`, "error");
    }
    setLockCount(val);
    showToast("Saving lock state to DB...", "info");
    const success = await saveToMongoDB(val, true);
    if (success) {
      if (val === 0) showToast("🔓 All questions unlocked & Saved!");
      else showToast(`🔒 Locked Qs 1 to ${val} & Saved!`);
    }
  };

  const handleJump = (e) => {
    e.preventDefault();
    const jumpValue = jumpInputRef.current?.value;
    if (!jumpValue) return;
    const target = document.getElementById(`question-${jumpValue}`);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    else showToast(`❌ Question ${jumpValue} not found.`, "error");
    jumpInputRef.current.value = "";
  };

  // --- SEARCH CONTROLS ---
  const jumpToMatch = (index) => {
    if (searchResults.length === 0) return;
    const targetQIdx = searchResults[index];
    const targetEl = document.getElementById(`question-${targetQIdx + 1}`);
    
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const card = targetEl.querySelector('.question-card');
      if (card) {
        card.style.transition = 'box-shadow 0.3s ease-in-out';
        card.style.boxShadow = '0 0 20px 5px #89b4fa';
        setTimeout(() => { card.style.boxShadow = 'none'; }, 1500);
      }
    }
  };

  const handleNextMatch = (e) => {
    if (e) e.preventDefault();
    if (searchResults.length === 0) return showToast("No match found", "info");
    
    let targetIndex = currentSearchIndex;
    if (hasJumped) {
       targetIndex = (currentSearchIndex + 1) % searchResults.length;
       setCurrentSearchIndex(targetIndex);
    } else {
       setHasJumped(true); // First click jumps to current index 0
    }
    jumpToMatch(targetIndex);
  };

  const handlePrevMatch = (e) => {
    if (e) e.preventDefault();
    if (searchResults.length === 0) return showToast("No match found", "info");
    
    let targetIndex = currentSearchIndex;
    if (hasJumped) {
       targetIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
       setCurrentSearchIndex(targetIndex);
    } else {
       setHasJumped(true); // First click jumps to current index 0
    }
    jumpToMatch(targetIndex);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      if (e.shiftKey) {
        handlePrevMatch();
      } else {
        handleNextMatch();
      }
    }
  };
  // ----------------------

  const handleMoveQuestion = (currentIndex, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const targetQNum = parseInt(e.target.value, 10);
      if (isNaN(targetQNum) || targetQNum < 1 || targetQNum > questions.length) {
        return showToast("❌ Invalid target question number", "error");
      }
      const targetIndex = targetQNum - 1;

      if (currentIndex < lockCount) return showToast("❌ Cannot move a locked question!", "error");
      if (targetIndex < lockCount) return showToast(`❌ Cannot move into locked zone (Qs 1-${lockCount})!`, "error");

      saveHistory();
      const updated = [...questions];
      const [movedItem] = updated.splice(currentIndex, 1);
      updated.splice(targetIndex, 0, movedItem);

      const synced = updated.map((q, idx) => {
        if (idx < lockCount) return q;
        const expectedNum = idx + 1;
        const syncStr = (str) => str ? str.split(',').map(s => s.replace(/\d+/, expectedNum)).join(',') : "";
        const syncOpt = (opt) => opt && opt.startsWith('IMG:') ? opt.replace(/\d+/, expectedNum) : opt;
        return {
          ...q,
          diagram: syncStr(q.diagram),
          optA: syncOpt(q.optA),
          optB: syncOpt(q.optB),
          optC: syncOpt(q.optC),
          optD: syncOpt(q.optD)
        };
      });

      setQuestions(synced);
      setIsDirty(true);
      e.target.value = '';

      setTimeout(() => {
        const targetEl = document.getElementById(`question-${targetQNum}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
          targetEl.children[1].style.transition = 'box-shadow 0.3s ease-in-out';
          targetEl.children[1].style.boxShadow = '0 0 15px 5px #a6e3a1';
          setTimeout(() => { targetEl.children[1].style.boxShadow = 'none'; }, 1500);
        }
      }, 100);

      showToast(`✅ Moved to Q${targetQNum} & Synced Images!`);
    }
  };

  const removeQuestion = (id) => {
    saveHistory();
    const filtered = questions.filter(q => q.id !== id);
    const synced = filtered.map((q, idx) => {
      if (idx < lockCount) return q;
      const expectedNum = idx + 1;
      const syncStr = (str) => str ? str.split(',').map(s => s.replace(/\d+/, expectedNum)).join(',') : "";
      const syncOpt = (opt) => opt && opt.startsWith('IMG:') ? opt.replace(/\d+/, expectedNum) : opt;
      return { ...q, diagram: syncStr(q.diagram), optA: syncOpt(q.optA), optB: syncOpt(q.optB), optC: syncOpt(q.optC), optD: syncOpt(q.optD) };
    });
    setQuestions(synced);
    setIsDirty(true);
    showToast("🗑️ Question removed & Images synced!", "info");
  };

  const missingIndices = questions.map((q, idx) => {
    const textNeedsImg = q.text.includes('[DIAGRAM_PLACEHOLDER]') || q.text.includes('[IMG_');
    const noDiagramSet = !q.diagram || q.diagram.trim() === '';
    const incompleteOptImg = q.optA === 'IMG:' || q.optB === 'IMG:' || q.optC === 'IMG:' || q.optD === 'IMG:';
    let has404 = false;

    const imageList = q.diagram ? q.diagram.split(',').map(s => s.trim()).filter(Boolean) : [];
    imageList.forEach((imgName) => {
      if (imageErrors.has(`/${subject}/${chapter}/${imgName}${q.ext}`)) has404 = true;
    });

    ['optA', 'optB', 'optC', 'optD'].forEach(opt => {
      if (q[opt]?.startsWith('IMG:')) {
        const imgName = q[opt].replace('IMG:', '').trim();
        if (imgName && imageErrors.has(`/${subject}/${chapter}/${imgName}${q.ext}`)) has404 = true;
      }
    });

    if ((textNeedsImg && noDiagramSet) || incompleteOptImg || has404) return idx + 1;
    return null;
  }).filter(val => val !== null);

  const handleNextMissingImage = () => {
    if (missingIndices.length === 0) return;
    const targetQNum = missingIndices[missingFocusIndex % missingIndices.length];
    const targetEl = document.getElementById(`question-${targetQNum}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
      targetEl.children[1].style.transition = 'box-shadow 0.3s ease-in-out';
      targetEl.children[1].style.boxShadow = '0 0 15px 5px #f38ba8';
      setTimeout(() => { targetEl.children[1].style.boxShadow = 'none'; }, 1500);
    }
    setMissingFocusIndex(prev => prev + 1);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const getYearOptions = () => { let opts = []; for (let y = 2026; y >= 1990; y--) opts.push(y); return opts; };

  const processExtractedQuestions = (textStr, startIndexOffset = 0) => {
    if (!textStr.trim()) return [];
    let cleanedTextStr = textStr
      .replace(/\$\$/g, '$')
      .replace(/\n(?:\s*\n)+/g, '\n');

    let parts = cleanedTextStr.split(/QUESTION:\s*/i);
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

    return newQuestions.map((q, idx) => ({
      ...q, diagram: q.diagram === "auto" ? (questions.length + idx + startIndexOffset + 1).toString() : q.diagram
    }));
  };

  const applyLatexFormatting = (str) => {
    if (!str || !/\$\s+\$/.test(str)) return str;
    let formattedText = str.replace(/\$[^$]+\$(?:\s+\$[^$]+\$)+/g, (match) => {
      const formatted = match.replace(/\$\s+\$/g, '$\n$');
      return `\n${formatted}\n`;
    });
    return formattedText
      .replace(/([^\S\n]*)\n([^\S\n]*)/g, '\n')
      .replace(/\n\.([A-Z])/g, '\n$1')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const handleFormatSingleLatexSpaces = (id) => {
    saveHistory();
    let hasChanges = false;

    setQuestions(questions.map(q => {
      if (q.id === id) {
        const newText = applyLatexFormatting(q.text);
        const newOptA = applyLatexFormatting(q.optA);
        const newOptB = applyLatexFormatting(q.optB);
        const newOptC = applyLatexFormatting(q.optC);
        const newOptD = applyLatexFormatting(q.optD);

        if (newText !== q.text || newOptA !== q.optA || newOptB !== q.optB || newOptC !== q.optC || newOptD !== q.optD) {
          hasChanges = true;
        }
        return { ...q, text: newText, optA: newOptA, optB: newOptB, optC: newOptC, optD: newOptD };
      }
      return q;
    }));

    if (hasChanges) {
      setIsDirty(true);
      showToast("✨ Formatted math spacing in Question & Options!");
    } else {
      showToast("ℹ️ No '$ $' spaces found in this question or options.", "info");
    }
  };

  const parseAllPastedText = () => {
    saveHistory();
    const newQs = processExtractedQuestions(bulkText, 0);
    setQuestions([...questions, ...newQs]);
    setIsDirty(true);
    setBulkText("");
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    showToast(`Parsed ${newQs.length} questions from text!`);
  };

  const handleInlinePaste = (index) => {
    saveHistory();
    const newQs = processExtractedQuestions(inlinePasteText, index);
    const updated = [...questions];
    updated.splice(index, 0, ...newQs);
    setQuestions(updated);
    setIsDirty(true);
    setInlinePasteText("");
    setActivePasteIndex(null);
    showToast(`Inserted ${newQs.length} questions inline!`);
  };

  const updateQ = (id, field, value) => {
    let finalValue = value;
    if (typeof value === 'string' && ['text', 'optA', 'optB', 'optC', 'optD', 'natAnswer'].includes(field)) {
      finalValue = value.replace(/\$\$/g, '$').replace(/\n(?:\s*\n)+/g, '\n');
    }
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: finalValue } : q));
    setIsDirty(true);
  };

  const handleOptionPaste = (id, e) => {
    let pastedText = e.clipboardData.getData('text');
    if (pastedText.includes(';')) {
      e.preventDefault();
      saveHistory();
      pastedText = pastedText.replace(/\$\$/g, '$').replace(/\n(?:\s*\n)+/g, '\n');
      const parts = pastedText.split(';');
      setQuestions(questions.map(q => {
        if (q.id === id) return { ...q, optA: parts[0]?.trim() || "", optB: parts[1]?.trim() || "", optC: parts[2]?.trim() || "", optD: parts[3]?.trim() || "", natAnswer: "" };
        return q;
      }));
      setIsDirty(true);
      showToast("Options auto-filled!");
    }
  };

  const handleExportPDF = async () => {
    if (questions.length === 0) return showToast("❌ No questions to compile!", "error");
    showToast("🚀 Compiling LaTeX chunks... This may take a moment.", "info");

    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, chapter, questions })
      });

      if (!response.ok) throw new Error("PDF generation failed.");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const contentType = response.headers.get('Content-Type');
      const isZip = contentType === 'application/zip';
      a.download = isZip ? `${subject}_${chapter}_PYQs.zip` : `${subject}_${chapter}_PYQs.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("✅ PDF Chunks Exported Successfully!");
    } catch (error) {
      showToast("❌ Error generating PDF. Make sure you are running locally.", "error");
    }
  };

  const cleanLatexForYT = (text) => {
    if (!text) return "";
    let cleaned = text.replace(/\[IMG_\d+\]/g, ' ');
    cleaned = cleaned.replace(/\[DIAGRAM_PLACEHOLDER\]/g, ' ');
    cleaned = cleaned.replace(/<[^>]+>/g, ' ');
    cleaned = cleaned.replace(/\$/g, '');
    cleaned = cleaned.replace(/\\\[/g, '');
    cleaned = cleaned.replace(/\\\]/g, '');

    cleaned = cleaned.replace(/\\Leftrightarrow/g, ' bi implication ');
    cleaned = cleaned.replace(/\\leftrightarrow/g, ' bi implication ');
    cleaned = cleaned.replace(/<=>/g, ' bi implication ');
    cleaned = cleaned.replace(/<->/g, ' bi implication ');

    cleaned = cleaned.replace(/\\Rightarrow/g, ' implication ');
    cleaned = cleaned.replace(/\\rightarrow/g, ' implication ');
    cleaned = cleaned.replace(/=>/g, ' implication ');
    cleaned = cleaned.replace(/->/g, ' implication ');

    const map = {
      '\\Leftarrow': ' is implied by ', '\\leftarrow': ' from ',
      '\\neg': ' not ', '\\vee': ' or ', '\\wedge': ' and ', '\\oplus': ' xor ',
      '\\ge': ' greater equal ', '\\le': ' less equal ',
      '\\neq': ' != ', '\\approx': ' ~ ', '\\equiv': ' = ', '\\times': ' x ', '\\div': ' div ',
      '\\pm': ' +- ', '\\infty': ' infinity ', '\\forall': ' for all ', '\\exists': ' exists ',
      '\\in ': ' in ', '\\notin ': ' not in ', '\\cup': ' union ', '\\cap': ' intersection ',
      '\\emptyset': ' empty set '
    };

    for (const [key, value] of Object.entries(map)) {
      cleaned = cleaned.replaceAll(key, value);
    }

    cleaned = cleaned.replace(/<=/g, ' less equal '); 
    cleaned = cleaned.replace(/\\[a-zA-Z]+/g, ' ');
    cleaned = cleaned.replace(/[{}]/g, ' ');
    cleaned = cleaned.replace(/[<>:"/\\|?*]/g, ' ');

    return cleaned.replace(/\s+/g, ' ').trim();
  };

  const copyForYouTube = (q, index) => {
    const cleanSubject = subject.replace(/^\d+\.\s*/, '').trim();
    const cleanChapter = chapter.replace(/^\d+\.\s*/, '').trim();
    const isTextOpt = (opt) => opt && !opt.startsWith('IMG:');

    let ytText = `[GATE ${q.year}, ${q.marks} Mark, ${cleanSubject}, ${cleanChapter}]\n\n`;
    ytText += `${cleanLatexForYT(q.text)}\n`;
    if (q.code) {
      let safeCode = q.code.replace(/[<>]/g, ' ');
      ytText += `\nCode:\n${safeCode}\n\n`;
    }
    if (isTextOpt(q.optA) || isTextOpt(q.optB) || isTextOpt(q.optC) || isTextOpt(q.optD)) {
      if (isTextOpt(q.optA)) ytText += `(A) ${cleanLatexForYT(q.optA)}\n`;
      if (isTextOpt(q.optB)) ytText += `(B) ${cleanLatexForYT(q.optB)}\n`;
      if (isTextOpt(q.optC)) ytText += `(C) ${cleanLatexForYT(q.optC)}\n`;
      if (isTextOpt(q.optD)) ytText += `(D) ${cleanLatexForYT(q.optD)}\n\n`;
    } else if (q.natAnswer) {
      ytText += `Answer: ${cleanLatexForYT(q.natAnswer)}\n\n`;
    }

    ytText += `--------------------------------------------------------\n\n`;
    ytText += `GATE CSE ${q.year} PYQ, ${cleanSubject}, ${cleanChapter}\n`;
    ytText += `Marks: ${q.marks} Mark\n\n`;

    ytText += `Question:\n${cleanLatexForYT(q.text)}\n\n`;
    if (q.code) {
      let safeCode = q.code.replace(/[<>]/g, ' ');
      ytText += `Code Snippet:\n${safeCode}\n\n`;
    }

    if (isTextOpt(q.optA) || isTextOpt(q.optB) || isTextOpt(q.optC) || isTextOpt(q.optD)) {
      ytText += `Options:\n`;
      if (isTextOpt(q.optA)) ytText += `(A) ${cleanLatexForYT(q.optA)}\n`;
      if (isTextOpt(q.optB)) ytText += `(B) ${cleanLatexForYT(q.optB)}\n`;
      if (isTextOpt(q.optC)) ytText += `(C) ${cleanLatexForYT(q.optC)}\n`;
      if (isTextOpt(q.optD)) ytText += `(D) ${cleanLatexForYT(q.optD)}\n\n`;
    } else if (q.natAnswer) {
      ytText += `Answer: ${cleanLatexForYT(q.natAnswer)}\n\n`;
    }

    ytText += `Prepare for GATE Computer Science Engineering (CSE) with detailed previous year questions (PYQs). `;
    ytText += `This specific problem belongs to the ${cleanSubject} subject, focusing on the ${cleanChapter} topic.\n\n`;

    const subjectTag = cleanSubject.replace(/[^a-zA-Z0-9]/g, '');
    const chapterTag = cleanChapter.replace(/[^a-zA-Z0-9]/g, '');
    ytText += `#GATECSE #GATE${q.year} #${subjectTag} #${chapterTag} #GATEPreparation #GATECSEPYQ #ComputerScience #GATEExam`;

    navigator.clipboard.writeText(ytText.trim());
    showToast("📋 Copied combined text for YT!");
  };

  const handleExportYTData = () => {
    if (questions.length === 0) return showToast("❌ No questions to export!", "error");

    const ytData = questions.map((q, index) => {
      let fullText = cleanLatexForYT(q.text);
      const optionsList = [q.optA, q.optB, q.optC, q.optD]
        .map(opt => cleanLatexForYT(opt))
        .filter(opt => opt && !opt.startsWith('IMG:'));

      if (optionsList.length > 0) fullText += ' ' + optionsList.join(' ');
      const cleanText = fullText.replace(/\s+/g, ' ').trim();
      const cleanSubject = subject.replace(/^\d+\.\s*/, '').trim();
      const cleanChapter = chapter.replace(/^\d+\.\s*/, '').trim();

      const videoTitle = `GATE CSE ${q.year} ${cleanSubject} ${cleanText}`.replace(/\s+/g, ' ').trim();
      const timestampTitle = `GATE CSE ${q.year} ${cleanChapter} ${cleanText}`.replace(/\s+/g, ' ').trim();

      return {
        index: index + 1, year: q.year, marks: q.marks, subject: cleanSubject, chapter: cleanChapter,
        video_title: videoTitle, timestamp_title: timestampTitle
      };
    });

    const jsonString = JSON.stringify(ytData, null, 4);
    navigator.clipboard.writeText(jsonString).then(() => {
      showToast("▶️ YT Data copied to clipboard & downloaded!");
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "G4Gate_YT_Export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const clearWorkspace = () => {
    if (confirm("🚨 Are you sure you want to clear the screen?")) {
      saveHistory();
      setQuestions([]);
      setSyncedCount(0);
      setIsDirty(true);
      showToast("Workspace cleared.", "info");
    }
  };

  const renderOptionText = (optText, ext) => {
    if (!optText) return null;
    if (optText.startsWith('IMG:')) {
      const imgName = optText.replace('IMG:', '').trim();
      const imgPath = `/${subject}/${chapter}/${imgName}${ext}`;
      const isErr = imageErrors.has(imgPath);
      return `<img src="${imgPath}?t=${imgCacheBuster}" onerror="window.reportImageStatus('${imgPath}', true)" onload="window.reportImageStatus('${imgPath}', false)" style="max-height:60px; vertical-align:middle; border:2px solid ${isErr ? '#f38ba8' : '#45475a'}; border-radius:4px; margin-left:10px;"/>`;
    }
    return optText.replace(/\n/g, '<br>');
  };

  const handleExportAllImages = async () => {
    if (questions.length === 0) return showToast("❌ No questions to export!", "error");
    showToast("📸 Generating Image ZIP... Please wait.", "info");

    try {
      const baseUrl = window.location.origin;
      const response = await fetch('/api/export-images-zip', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, chapter, questions, baseUrl, contentWidth: imageTextWidth })
      });

      if (!response.ok) throw new Error("Image export failed.");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${subject}_${chapter}_Images.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("✅ Images exported successfully!");
    } catch (error) { showToast("❌ Error generating Image ZIP.", "error"); }
  };

  return (
    <div style={{ maxWidth: '98%', margin: 'auto', padding: '20px' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '30px', right: '30px',
          background: toast.type === 'error' ? '#f38ba8' : toast.type === 'info' ? '#89b4fa' : '#a6e3a1',
          color: '#11111b', padding: '15px 25px', borderRadius: '8px',
          zIndex: 9999, fontWeight: 'bold', boxShadow: '0 8px 15px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease-in-out'
        }}>
          {toast.message}
        </div>
      )}

      {isReviving && (
        <div style={{
          position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
          background: 'rgba(17, 17, 27, 0.85)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 9999,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#1e1e2e', color: '#a6e3a1', padding: '40px 60px',
            borderRadius: '12px', fontSize: '32px', fontWeight: 'bold',
            border: '2px solid #a6e3a1', boxShadow: '0 0 30px rgba(166, 227, 161, 0.3)'
          }}>
            🔄 Reviving Database...
          </div>
        </div>
      )}

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

        <div style={{ flex: '1 1 250px', textAlign: 'center', padding: '10px', background: '#181825', borderRadius: '4px', border: `1px solid ${isDirty ? '#f9e2af' : (questions.length > 0 ? '#a6e3a1' : '#45475a')}` }}>
          {questions.length === 0 ? (
            <span style={{ color: '#6c7086', fontWeight: 'bold' }}>No Questions Found</span>
          ) : isDirty ? (
            <span style={{ color: '#f9e2af', fontWeight: 'bold' }}>⚠️ {syncedCount}/{questions.length} Synced (Unsaved)</span>
          ) : (
            <span style={{ color: '#a6e3a1', fontWeight: 'bold' }}>✅ All {questions.length} Synced</span>
          )}

          {missingIndices.length > 0 && (
            <button
              onClick={handleNextMissingImage}
              style={{ display: 'block', margin: '5px auto 0 auto', background: '#f38ba8', color: '#11111b', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
            >
              ⚠️ {missingIndices.length} Issues Found (Click to Jump)
            </button>
          )}
        </div>

        <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', padding: '0 10px' }}>
          <label style={{ marginTop: 0, fontSize: '13px', color: '#cdd6f4' }}>
            Thumbnail Text Width: <strong>{imageTextWidth}%</strong>
          </label>
          <input
            type="range" min="40" max="100" value={imageTextWidth}
            onChange={(e) => setImageTextWidth(e.target.value)}
            style={{ cursor: 'pointer', marginTop: '5px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-export" style={{ background: '#cba6f7', color: '#11111b', padding: '10px 15px' }} onClick={() => handleExportPDF()}>🚀 Export Full PDF</button>
          <button className="btn-export" style={{ background: '#a6e3a1', color: '#11111b', padding: '10px 15px' }} onClick={() => saveToMongoDB(null, false)}>💾 Save DB</button>
          <button className="btn-export" style={{ background: '#f5c2e7', color: '#11111b', padding: '10px 15px' }} onClick={handleExportYTData}>▶️ Export YT Data</button>
          <button className="btn-export" style={{ background: '#89dceb', color: '#11111b', padding: '10px 15px' }} onClick={handleExportAllImages}>📸 Export All Images (ZIP)</button>
          <button className="btn-clear" style={{ padding: '10px 15px' }} onClick={clearWorkspace}>🗑️ Clear</button>

          <button
            className="btn-export"
            style={{ background: history.length > 0 ? '#fab387' : '#45475a', color: history.length > 0 ? '#11111b' : '#6c7086', padding: '10px 15px', cursor: history.length > 0 ? 'pointer' : 'not-allowed' }}
            onClick={handleUndo}
            disabled={history.length === 0}
            title={history.length > 0 ? "Undo recent structural change" : "Nothing to undo"}
          >
            ⏪ Undo
          </button>

          <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
            <form onSubmit={handleLock} style={{ display: 'flex', gap: '5px', marginRight: '10px' }}>
              <input type="number" min="0" max={questions.length} ref={lockInputRef} placeholder="Lock #" title="Lock questions 1 through N" style={{ width: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #f9e2af', background: '#181825', color: '#cdd6f4', textAlign: 'center', outline: 'none' }} />
              <button type="submit" style={{ background: '#f9e2af', color: '#11111b', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🔒 Lock</button>
            </form>

            {/* SEARCH BOX WITH ARROWS */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginRight: '10px', background: '#181825', border: '1px solid #74c7ec', borderRadius: '4px', padding: '0 5px' }}>
              <input
                type="text"
                placeholder="🔍 Search (Enter)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                style={{ width: '130px', padding: '8px', border: 'none', background: 'transparent', color: '#cdd6f4', outline: 'none' }}
              />
              
              {searchQuery && (
                <span style={{ fontSize: '12px', color: '#a6adc8', fontWeight: 'bold', minWidth: '35px', textAlign: 'center' }}>
                  {searchResults.length > 0 ? `${currentSearchIndex + 1}/${searchResults.length}` : '0/0'}
                </span>
              )}
              
              {searchResults.length > 0 && (
                <div style={{ display: 'flex', gap: '2px', borderLeft: '1px solid #45475a', paddingLeft: '5px', marginLeft: '2px' }}>
                  <button type="button" onClick={handlePrevMatch} style={{ background: 'transparent', color: '#cdd6f4', border: 'none', cursor: 'pointer', padding: '0 4px', fontSize: '12px' }} title="Previous Match (Shift+Enter)">▲</button>
                  <button type="button" onClick={handleNextMatch} style={{ background: 'transparent', color: '#cdd6f4', border: 'none', cursor: 'pointer', padding: '0 4px', fontSize: '12px' }} title="Next Match (Enter)">▼</button>
                </div>
              )}

              {searchQuery && (
                <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); setHasJumped(false); }} style={{ background: 'transparent', color: '#f38ba8', border: 'none', padding: '0 5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginLeft: '2px' }} title="Clear Search">
                  ✕
                </button>
              )}
            </div>

            <form onSubmit={handleJump} style={{ display: 'flex', gap: '5px', marginRight: '5px' }}>
              <input type="number" min="1" max={questions.length || 1} ref={jumpInputRef} placeholder="Q#" style={{ width: '55px', padding: '8px', borderRadius: '4px', border: '1px solid #45475a', background: '#181825', color: '#cdd6f4', textAlign: 'center', outline: 'none' }} />
              <button type="submit" style={{ background: '#89b4fa', color: '#11111b', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Go</button>
            </form>
            <button onClick={forceRefreshPreview} style={{ background: '#a6e3a1', color: '#11111b', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }} title="Force Refresh Preview">🔄</button>
            <button onClick={scrollToTop} style={{ background: '#45475a', color: '#cdd6f4', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }} title="Top">⬆️</button>
            <button onClick={scrollToBottom} style={{ background: '#45475a', color: '#cdd6f4', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }} title="Bottom">⬇️</button>
          </div>
        </div>

        <Link href="/scraper" style={{ background: '#3ac04e', color: '#11111b', padding: '10px 15px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', marginTop: '10px' }} target="_blank">
          Go to scraper
        </Link>
      </div>

      <div id="questions_container">
        {questions.map((q, idx) => {
          const qNum = idx + 1;
          const imageList = q.diagram ? q.diagram.split(',').map(s => s.trim()).filter(Boolean) : [];
          const hasOptions = q.optA || q.optB || q.optC || q.optD;
          const isLocked = idx < lockCount;

          let formattedText = q.text.replace(/\n/g, '<br>');

          imageList.forEach((imgName, i) => {
            const imgPath = `/${subject}/${chapter}/${imgName}${q.ext}`;
            const isErr = imageErrors.has(imgPath);
            const imgTag = `<div style="border:1px dashed ${isErr ? '#f38ba8' : '#74c7ec'}; padding:10px; text-align:center; margin: 10px 0;">
              <img src="${imgPath}?t=${imgCacheBuster}" onerror="window.reportImageStatus('${imgPath}', true)" onload="window.reportImageStatus('${imgPath}', false)" alt="Missing" style="max-width:100%; max-height:200px;"/>
              <br/><small style="color:${isErr ? '#f38ba8' : '#74c7ec'}">${isErr ? '⚠️ 404 NOT FOUND: ' : ''}${imgPath}</small>
            </div>`;
            if (formattedText.includes(`[IMG_${i + 1}]`)) formattedText = formattedText.replace(`[IMG_${i + 1}]`, imgTag);
            else if (i === 0 && formattedText.includes('[DIAGRAM_PLACEHOLDER]')) formattedText = formattedText.replace('[DIAGRAM_PLACEHOLDER]', imgTag);
            else formattedText += imgTag;
          });

          return (
            <div key={q.id} id={`question-${qNum}`} style={{ scrollMarginTop: '160px', opacity: isLocked ? 0.85 : 1 }}>
              <div style={{ textAlign: 'center', margin: '-10px 0 10px 0' }}>
                {activePasteIndex === idx ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: '#181825', padding: '15px', borderRadius: '8px', border: '1px dashed #cba6f7' }}>
                    <textarea value={inlinePasteText} onChange={(e) => setInlinePasteText(e.target.value)} placeholder="Paste QUESTION: ... OPTIONS: ... here to insert at this index" style={{ width: '80%', minHeight: '100px' }}></textarea>
                    <div>
                      <button onClick={() => handleInlinePaste(idx)} style={{ background: '#a6e3a1', padding: '6px 15px', fontWeight: 'bold', color: '#11111b', borderRadius: '4px' }}>⚡ Extract & Insert Here</button>
                      <button onClick={() => setActivePasteIndex(null)} style={{ background: '#f38ba8', padding: '6px 15px', fontWeight: 'bold', color: '#11111b', borderRadius: '4px', marginLeft: '10px' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn-autofill" disabled={isLocked} style={{ width: 'auto', padding: '4px 12px', fontSize: '12px', background: '#45475a', color: '#cdd6f4', opacity: isLocked ? 0.5 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }} onClick={() => setActivePasteIndex(idx)}>⚡ Quick Paste Here</button>
                )}
              </div>

              <div className="card question-card" style={{ display: 'flex', border: isLocked ? '1px solid #f9e2af' : 'none' }}>
                <div className="half-width">
                  <div className="q-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, color: isLocked ? '#f9e2af' : '#a6e3a1', display: 'inline-block' }}>
                        {isLocked && "🔒 "}Question {qNum}
                      </h3>
                      <button className="btn-export" style={{ background: '#f9e2af', color: '#11111b', padding: '4px 10px', marginLeft: '10px', fontSize: '12px' }} onClick={() => copyForYouTube(q, idx)}>📋 Copy for YT</button>
                      <button
                        className="btn-export"
                        disabled={isLocked}
                        style={{ background: '#f5a97f', color: '#11111b', padding: '4px 10px', marginLeft: '10px', fontSize: '12px', opacity: isLocked ? 0.5 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }}
                        onClick={() => handleFormatSingleLatexSpaces(q.id)}
                        title="Converts consecutive math blocks onto separate lines"
                      >
                        ✨ Format $ $
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="number"
                        placeholder="Move to #"
                        onKeyDown={(e) => handleMoveQuestion(idx, e)}
                        disabled={isLocked}
                        title={isLocked ? "Locked" : "Type target Q# and press Enter"}
                        style={{ width: '80px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #89b4fa', background: '#11111b', color: '#cdd6f4', textAlign: 'center', outline: 'none', cursor: isLocked ? 'not-allowed' : 'text' }}
                      />
                      <button className="btn-clear" disabled={isLocked} style={{ padding: '4px 10px', opacity: isLocked ? 0.5 : 1, cursor: isLocked ? 'not-allowed' : 'pointer' }} onClick={() => removeQuestion(q.id)}>Remove</button>
                    </div>
                  </div>

                  <label>Question Text</label>
                  <textarea disabled={isLocked} value={q.text} onChange={(e) => updateQ(q.id, 'text', e.target.value)} className="q-text" />

                  <label>Code Snippet</label>
                  <textarea disabled={isLocked} value={q.code} onChange={(e) => updateQ(q.id, 'code', e.target.value)} className="code-text" />

                  <div className="grid-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px' }}>
                    <div><label>Year</label><select disabled={isLocked} value={q.year} onChange={(e) => updateQ(q.id, 'year', e.target.value)}>{getYearOptions().map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                    <div><label>Marks</label><div className="radio-group" style={{ display: 'flex', gap: '5px' }}><input disabled={isLocked} type="radio" checked={q.marks === "1"} onChange={() => updateQ(q.id, 'marks', "1")} /> 1M <input disabled={isLocked} type="radio" checked={q.marks === "2"} onChange={() => updateQ(q.id, 'marks', "2")} style={{ marginLeft: '10px' }} /> 2M</div></div>
                    <div><label>Images</label><div className="input-group" style={{ display: 'flex' }}><input disabled={isLocked} type="text" value={q.diagram} onChange={(e) => updateQ(q.id, 'diagram', e.target.value)} placeholder="e.g. 1a, 1b" style={{ borderRadius: '4px 0 0 4px' }} /><select disabled={isLocked} value={q.ext} onChange={(e) => updateQ(q.id, 'ext', e.target.value)} style={{ width: '60px' }}><option value=".png">.png</option><option value=".jpg">.jpg</option></select></div></div>
                  </div>

                  <label style={{ color: '#f5c2e7' }}>Options (Paste A;B;C;D in Box A. IMG:filename for images. Blank for NAT)</label>
                  <div className="grid-opts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <textarea disabled={isLocked} value={q.optA} onPaste={(e) => handleOptionPaste(q.id, e)} onChange={(e) => updateQ(q.id, 'optA', e.target.value)} placeholder="Option A" style={{ minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #45475a', background: '#181825', color: '#cdd6f4', resize: 'vertical' }} />
                    <textarea disabled={isLocked} value={q.optB} onChange={(e) => updateQ(q.id, 'optB', e.target.value)} placeholder="Option B" style={{ minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #45475a', background: '#181825', color: '#cdd6f4', resize: 'vertical' }} />
                    <textarea disabled={isLocked} value={q.optC} onChange={(e) => updateQ(q.id, 'optC', e.target.value)} placeholder="Option C" style={{ minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #45475a', background: '#181825', color: '#cdd6f4', resize: 'vertical' }} />
                    <textarea disabled={isLocked} value={q.optD} onChange={(e) => updateQ(q.id, 'optD', e.target.value)} placeholder="Option D" style={{ minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #45475a', background: '#181825', color: '#cdd6f4', resize: 'vertical' }} />
                  </div>

                  {!hasOptions && (
                    <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {!q.isProof && (
                        <input disabled={isLocked} type="text" value={q.natAnswer || ""} onChange={(e) => updateQ(q.id, 'natAnswer', e.target.value)} placeholder="NAT Answer" style={{ border: '1px solid #f38ba8', flex: 1 }} />
                      )}
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#bac2de', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                        <input disabled={isLocked} type="checkbox" checked={q.isProof || false} onChange={(e) => updateQ(q.id, 'isProof', e.target.checked)} />
                        {q.isProof ? '📝 Proof/Subjective (NAT Hidden)' : 'Hide NAT'}
                      </label>
                    </div>
                  )}
                </div>

                <div id={`preview-${q.id}`} className="preview-pane" style={{ paddingLeft: '20px', width: '50%' }}>
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
                    ) : !q.isProof ? (
                      <div style={{ color: '#f38ba8' }}><strong>NAT Answer:</strong> {q.natAnswer ? q.natAnswer : '_________________'}</div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card" id="paste_section" style={{ marginTop: '20px', border: '2px solid #89b4fa' }}>
        <label style={{ fontSize: '16px' }}>⚡ Bulk Quick Paste</label>
        <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} style={{ minHeight: '120px', marginTop: '10px' }}></textarea>
        <button className="btn-autofill" style={{ marginTop: '15px' }} onClick={parseAllPastedText}>⚡ Extract & Append to End</button>
      </div>
    </div>
  );
}