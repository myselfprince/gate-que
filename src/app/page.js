"use client";
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

const shouldUseTwoCols = (q) => {
  if (!q.optA && !q.optB && !q.optC && !q.optD) return false;
  const maxLen = Math.max(
    (q.optA || "").length,
    (q.optB || "").length,
    (q.optC || "").length,
    (q.optD || "").length
  );
  const hasBlockMath = [q.optA, q.optB, q.optC, q.optD].some(opt => opt?.includes('$$'));
  const hasManyBreaks = [q.optA, q.optB, q.optC, q.optD].some(opt => (opt?.match(/\n/g) || []).length > 2);
  if (hasBlockMath || hasManyBreaks || maxLen > 65) return false;
  return true;
};

const formatCCode = (code) => {
  if (!code) return "";
  const lines = code.split('\n');
  let indentLevel = 0;
  let formatted = [];
  for (let line of lines) {
    let trimmed = line.trim();
    if (!trimmed) {
      formatted.push("");
      continue;
    }
    if (trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    formatted.push('    '.repeat(indentLevel) + trimmed);
    const openBraces = (trimmed.match(/{/g) || []).length;
    const closeBraces = (trimmed.match(/}/g) || []).length;
    if (openBraces > closeBraces) {
      indentLevel += (openBraces - closeBraces);
    } else if (closeBraces > openBraces && !trimmed.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - (closeBraces - openBraces));
    }
  }
  return formatted.join('\n');
};

const formatOptionsIndent = (opt) => {
  if (!opt) return "";
  return opt.split('\n').map((line, idx) => {
    let trimmed = line.trim();
    if (idx > 0 && trimmed !== "" && !trimmed.startsWith('$\\quad $')) {
      return '$\\quad $ ' + trimmed;
    }
    return trimmed;
  }).join('\n');
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
  const [blankFocusIndex, setBlankFocusIndex] = useState(0)
  const [activePasteIndex, setActivePasteIndex] = useState(null);
  const [inlinePasteText, setInlinePasteText] = useState("");
  const [imageTextWidth, setImageTextWidth] = useState(70);
  const [toast, setToast] = useState(null);
  const [isReviving, setIsReviving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [hasJumped, setHasJumped] = useState(false);
  const [showMissingDropdown, setShowMissingDropdown] = useState(false);
  const [showBlankDropdown, setShowBlankDropdown] = useState(false);
  const [blankBulkText, setBlankBulkText] = useState("");
  // VIEW FILTERS
  const [filterYear, setFilterYear] = useState('All');
  const [hideBulkLocked, setHideBulkLocked] = useState(false);
  const [hidePosLocked, setHidePosLocked] = useState(false);

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
    setFilterYear('All');
    setHideBulkLocked(false);
    setHidePosLocked(false);
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
      setFilterYear('All');
      setHideBulkLocked(false);
      setHidePosLocked(false);
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
      if (q.isBlank) return;
      const isLocked = idx < lockCount;
      if (!isLocked) {
        const matchesSearch =
          (q.text && q.text.toLowerCase().includes(lowerQuery)) ||
          (q.code && q.code.toLowerCase().includes(lowerQuery)) ||
          (q.optA && q.optA.toLowerCase().includes(lowerQuery)) ||
          (q.optB && q.optB.toLowerCase().includes(lowerQuery)) ||
          (q.optC && q.optC.toLowerCase().includes(lowerQuery)) ||
          (q.optD && q.optD.toLowerCase().includes(lowerQuery));
        if (matchesSearch) {
          matches.push(idx);
        }
      }
    });
    setSearchResults(matches);
    setCurrentSearchIndex(0);
    setHasJumped(false);
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

      // Strip the temporary _justFilled tags before sending to DB
      const cleanQuestions = questions.map(q => {
        const { _justFilled, ...rest } = q;
        return rest;
      });

      const res = await fetch('/api/chapters', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, chapter, questions: cleanQuestions, lockCount: lockVal })
      });
      const data = await res.json();
      if (data.success) {
        setSyncedCount(questions.length);
        setIsDirty(false);
        
        // Refresh the dropdown UI by removing the _justFilled tags locally
        setQuestions(prev => prev.map(q => ({ ...q, _justFilled: false })));
        
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
      if (val === 0) showToast("🔓 All questions bulk-unlocked & Saved!");
      else showToast(`🔒 Bulk Locked Qs 1 to ${val} & Saved!`);
    }
  };

  const handleJump = (e) => {
    e.preventDefault();
    const jumpValue = jumpInputRef.current?.value;
    if (!jumpValue) return;
    const targetQNum = parseInt(jumpValue, 10);
    const target = document.getElementById(`question-${targetQNum}`);
    
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    } else {
        const jumpIndex = targetQNum - 1;
        const targetQ = questions[jumpIndex];
        if (targetQ) {
            let reasons = [];
            if (filterYear !== 'All' && (targetQ.isBlank || targetQ.year !== filterYear)) reasons.push("Year Filter");
            if (hideBulkLocked && jumpIndex < lockCount) reasons.push("Hide Bulk Locked");
            if (hidePosLocked && targetQ.isPosLocked) reasons.push("Hide Pos Locked");
            
            if (reasons.length > 0) {
                showToast(`❌ Question ${jumpValue} exists but is hidden by: ${reasons.join(' & ')}`, "error");
            } else {
                showToast(`❌ Question ${jumpValue} not found in view.`, "error");
            }
        } else {
            showToast(`❌ Question ${jumpValue} does not exist.`, "error");
        }
    }
    jumpInputRef.current.value = "";
  };

  const jumpToMatch = (index) => {
    if (searchResults.length === 0) return;
    const targetQIdx = searchResults[index];
    const targetEl = document.getElementById(`question-${targetQIdx + 1}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const card = targetEl.querySelector('.question-card') || targetEl;
      if (card) {
        card.style.transition = 'box-shadow 0.3s ease-in-out';
        card.style.boxShadow = '0 0 20px 5px #89b4fa';
        setTimeout(() => { card.style.boxShadow = 'none'; }, 1500);
      }
    } else {
      showToast(`Match is in Q${targetQIdx + 1}, but it's hidden by your active filters!`, "error");
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
      setHasJumped(true);
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
      setHasJumped(true);
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

  const syncImages = (questionsArray, currentLockCount) => {
    return questionsArray.map((q, idx) => {
      if (idx < currentLockCount || q.isPosLocked || q.isBlank) return q;
      const expectedNum = idx + 1;
      const syncStr = (str) => str ? str.split(',').map(s => s.replace(/\d+/, expectedNum)).join(',') : "";
      
      // --- NEW: Smart Option Translator ---
      const syncOpt = (opt, letter) => {
        if (!opt) return opt;
        // If the AI gave us the generic "IMG:optA", auto-translate it to the real number!
        if (opt.match(/IMG:opt[a-d]/i)) {
            return opt.replace(/IMG:opt[a-d]/i, `IMG:${expectedNum}${letter}`);
        }
        // Otherwise, if it has an old number, sync it to the new expected number
        if (opt.startsWith('IMG:')) {
            return opt.replace(/\d+/, expectedNum);
        }
        return opt;
      };

      return {
        ...q,
        diagram: q.diagram === "auto" ? expectedNum.toString() : syncStr(q.diagram),
        optA: syncOpt(q.optA, 'a'),
        optB: syncOpt(q.optB, 'b'),
        optC: syncOpt(q.optC, 'c'),
        optD: syncOpt(q.optD, 'd')
      };
    });
  };

  const insertFlow = (questionsArr, startIndex, newItems, currentLockCount) => {
    let result = [...questionsArr];
    let itemsToPlace = [...newItems];
    let i = startIndex;
    while (itemsToPlace.length > 0) {
      if (i >= result.length) {
        result.push(itemsToPlace.shift());
      } else {
        // ✅ CHANGED: Treat blank questions as weak targets, ignoring their lock state
        const isSpotLocked = (i < currentLockCount) || (result[i].isPosLocked && !result[i].isBlank);
        if (isSpotLocked) {
          i++;
          continue;
        }
        if (result[i].isBlank) {
          result[i] = itemsToPlace.shift();
        } else {
          itemsToPlace.push(result[i]);
          result[i] = itemsToPlace.shift();
        }
      }
      i++;
    }
    let lastLockedIdx = -1;
    for (let j = 0; j < result.length; j++) {
      if (j < currentLockCount || result[j].isPosLocked) {
        lastLockedIdx = j;
      }
    }
    if (lastLockedIdx < result.length - 1) {
      const tail = result.slice(lastLockedIdx + 1);
      tail.sort((a, b) => {
        if (a.isBlank && !b.isBlank) return 1;
        if (!a.isBlank && b.isBlank) return -1;
        const ya = parseInt(a.year) || 2026;
        const yb = parseInt(b.year) || 2026;
        return ya - yb;
      });
      result = [...result.slice(0, lastLockedIdx + 1), ...tail];
    }
    return syncImages(result, currentLockCount);
  };

  const handleMoveQuestion = (currentIndex, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const targetQNum = parseInt(e.target.value, 10);
      if (isNaN(targetQNum) || targetQNum < 1) {
        return showToast("❌ Invalid target question number", "error");
      }
      const targetIndex = targetQNum - 1;
      if (currentIndex < lockCount) return showToast("❌ Cannot move a bulk-locked question!", "error");
      if (targetIndex < lockCount) return showToast(`❌ Cannot move into bulk-locked zone (Qs 1-${lockCount})!`, "error");
      
      // ✅ CHANGED: Allow moving to a locked position IF it is a blank question
      if (questions[targetIndex]?.isPosLocked && !questions[targetIndex]?.isBlank) {
          return showToast(`❌ Position Q${targetQNum} is already Locked! Unlock it first.`, "error");
      }

      saveHistory();
      const movingQ = { ...questions[currentIndex], isPosLocked: true };
      let updated = [...questions];
      updated[currentIndex] = { id: generateId(), isBlank: true, isPosLocked: false, text: "", diagram: "", ext: ".png", optA: "", optB: "", optC: "", optD: "", natAnswer: "", year: "2026", marks: "1" };
      updated = insertFlow(updated, targetIndex, [movingQ], lockCount);
      setQuestions(updated);
      setIsDirty(true);
      e.target.value = '';
      setTimeout(() => {
        const targetEl = document.getElementById(`question-${targetQNum}`);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const targetCard = targetEl.querySelector('.question-card') || targetEl;
          targetCard.style.transition = 'box-shadow 0.3s ease-in-out';
          targetCard.style.boxShadow = '0 0 15px 5px #a6e3a1';
          setTimeout(() => { targetCard.style.boxShadow = 'none'; }, 1500);
        } else {
            showToast(`✅ Moved to Q${targetQNum}, but it's hidden by your active filters!`, "info");
        }
      }, 150);
      showToast(`✅ Moved and permanently locked to Q${targetQNum}!`);
    }
  };

  const togglePosLock = (id) => {
    saveHistory();
    setQuestions(questions.map(q => q.id === id ? { ...q, isPosLocked: !q.isPosLocked } : q));
    setIsDirty(true);
  };

  const clearToBlank = (id) => {
    saveHistory();
    setQuestions(questions.map(q => {
      if (q.id === id) {
        return { ...q, isBlank: true, optLayout: "auto", isPosLocked: true, text: "", code: "", diagram: "", ext: ".png", optA: "", optB: "", optC: "", optD: "", natAnswer: "", tempPaste: "" };
      }
      return q;
    }));
    setIsDirty(true);
    showToast("🗑️ Cleared to Blank & Locked position!", "info");
  };

  const removeQuestionCompletely = (id) => {
    const idx = questions.findIndex(q => q.id === id);
    const hasLocksBelow = questions.slice(idx + 1).some(q => q.isPosLocked);
    if (hasLocksBelow) {
      if (!confirm("⚠️ There are Pos-Locked questions below this one. Deleting this completely will shift them UP and change their numbers. Use 'Clear to Blank' if you want to preserve numbering. Proceed anyway?")) {
        return;
      }
    }
    saveHistory();
    let filtered = questions.filter(q => q.id !== id);
    filtered = syncImages(filtered, lockCount);
    setQuestions(filtered);
    setIsDirty(true);
    showToast("🗑️ Deleted completely & shifted sequence up!", "info");
  };

  const addBlankAt = (index) => {
    saveHistory();
    const blank = { id: generateId(), optLayout: "auto", isBlank: true, isPosLocked: true, text: "", diagram: "", ext: ".png", optA: "", optB: "", optC: "", optD: "", natAnswer: "", year: "2026", marks: "1" };
    let updated = insertFlow([...questions], index, [blank], lockCount);
    setQuestions(updated);
    setIsDirty(true);
    showToast(`➕ Added Blank Placeholder!`);
  };

  const missingIndices = questions.map((q, idx) => {
    if (q.isBlank) return null;
    const textNeedsImg = q.text && (q.text.includes('[DIAGRAM_PLACEHOLDER]') || q.text.includes('[IMG_'));
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
      const card = targetEl.querySelector('.question-card') || targetEl;
      card.style.transition = 'box-shadow 0.3s ease-in-out';
      card.style.boxShadow = '0 0 15px 5px #f38ba8';
      setTimeout(() => { card.style.boxShadow = 'none'; }, 1500);
    } else {
      showToast(`Missing image in Q${targetQNum} is hidden by your active filters.`, "error");
    }
    setMissingFocusIndex(prev => prev + 1);
  };
  const blankIndices = questions.map((q, idx) => (q.isBlank || q._justFilled) ? idx + 1 : null).filter(val => val !== null);

  const handleNextBlank = () => {
    if (blankIndices.length === 0) return;
    const targetQNum = blankIndices[blankFocusIndex % blankIndices.length];
    const targetEl = document.getElementById(`question-${targetQNum}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Apply shadow directly to the element since blanks don't have the .question-card class
      targetEl.style.transition = 'box-shadow 0.3s ease-in-out';
      targetEl.style.boxShadow = '0 0 15px 5px #f9e2af'; // Yellow glow for blanks
      setTimeout(() => { targetEl.style.boxShadow = 'none'; }, 1500);
    } else {
      showToast(`Blank Q${targetQNum} is hidden by your active filters.`, "error");
    }
    setBlankFocusIndex(prev => prev + 1);
  };
  const handleBulkBlankFill = () => {
    if (!blankBulkText.trim()) return showToast("Nothing to paste!", "info");
    saveHistory();

    const parsedQs = processExtractedQuestions(blankBulkText, 0);
    if (parsedQs.length === 0) return showToast("No valid questions found in text", "error");

    let updatedQuestions = [...questions];
    
    // Find only the TRULY empty blanks (ignoring ones we just filled)
    const actualBlankIndices = updatedQuestions
      .map((q, idx) => q.isBlank && !q._justFilled ? idx : -1)
      .filter(idx => idx !== -1);

    if (actualBlankIndices.length === 0) {
      return showToast("No empty blanks available to fill!", "error");
    }

    let fillCount = 0;
    for (let i = 0; i < parsedQs.length; i++) {
      if (i < actualBlankIndices.length) {
         const targetIdx = actualBlankIndices[i];
         
         // Overwrite the blank with the parsed question, but keep its ID and Lock State
         updatedQuestions[targetIdx] = {
           ...parsedQs[i],
           id: updatedQuestions[targetIdx].id,
           isPosLocked: updatedQuestions[targetIdx].isPosLocked,
           isBlank: false,
           _justFilled: true, // Temporary flag to keep it in the dropdown as Green
         };
         fillCount++;
      }
    }

    setQuestions(updatedQuestions);
    setIsDirty(true);
    setBlankBulkText("");
    
    if (parsedQs.length > fillCount) {
      showToast(`✅ Filled ${fillCount} blanks. Ignored ${parsedQs.length - fillCount} extra questions.`, "info");
    } else {
      showToast(`✅ Chronologically filled ${fillCount} blank(s)!`);
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const getYearOptions = () => { let opts = []; for (let y = 2026; y >= 1990; y--) opts.push(y); return opts; };

  const availableYears = ['All', ...Array.from(new Set(questions.filter(q => !q.isBlank && q.year).map(q => q.year))).sort((a, b) => parseInt(b) - parseInt(a))];

  const processExtractedQuestions = (textStr, startIndexOffset = 0) => {
    if (!textStr || !textStr.trim()) return [];
    let cleanedTextStr = textStr.replace(/\$\$/g, '$').replace(/\n(?:\s*\n)+/g, '\n');
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
      let needsManualOptionFix = false;
      let finalOptA = "", finalOptB = "", finalOptC = "", finalOptD = "";
      
      if (rawOptionsArray.length > 4) {
        needsManualOptionFix = true;
        finalOptA = optionsText;
      } else {
        finalOptA = formatOptionsIndent(rawOptionsArray[0] ? rawOptionsArray[0].trim() : "");
        finalOptB = formatOptionsIndent(rawOptionsArray[1] ? rawOptionsArray[1].trim() : "");
        finalOptC = formatOptionsIndent(rawOptionsArray[2] ? rawOptionsArray[2].trim() : "");
        finalOptD = formatOptionsIndent(rawOptionsArray[3] ? rawOptionsArray[3].trim() : "");
      }
      
      newQuestions.push({
        id: generateId(),
        isBlank: false, isPosLocked: false, needsManualOptionFix, isCodeOptions: false,
        text: qText.trim(),
        code: formatCCode(codeText),
        year, marks,
        diagram: hasDiagram ? "auto" : "", ext: ".png",
        optA: finalOptA, optB: finalOptB, optC: finalOptC, optD: finalOptD,
        natAnswer: "",
        optLayout: "auto"
      });
    });

    return newQuestions.map((q, idx) => {
      // 1. We calculate your math formula ONCE here
      const expectedNum = questions.length + idx + startIndexOffset + 1;
      
      // 2. We use it to magically translate AI generic names to specific files (optA -> 130a)
      const autoReplaceOpt = (opt, letter) => {
          if (opt && opt.match(/IMG:opt[a-d]/i)) {
              return opt.replace(/IMG:opt[a-d]/i, `IMG:${expectedNum}${letter}`);
          }
          return opt;
      };

      return {
        ...q, 
        // 3. We ALSO use the math variable here for the main question diagram
        diagram: q.diagram === "auto" ? expectedNum.toString() : q.diagram,
        optA: autoReplaceOpt(q.optA, 'a'),
        optB: autoReplaceOpt(q.optB, 'b'),
        optC: autoReplaceOpt(q.optC, 'c'),
        optD: autoReplaceOpt(q.optD, 'd')
      };
    });
  };

  const parseAllPastedText = () => {
    saveHistory();
    const newQs = processExtractedQuestions(bulkText, questions.length);
    setQuestions([...questions, ...newQs]);
    setIsDirty(true);
    setBulkText("");
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    showToast(`Parsed ${newQs.length} questions from text!`);
  };

  const handleInlinePaste = (index) => {
    saveHistory();
    const newQs = processExtractedQuestions(inlinePasteText, index);
    if (newQs.length === 0) return;
    let updated = insertFlow([...questions], index, newQs, lockCount);
    setQuestions(updated);
    setIsDirty(true);
    setInlinePasteText("");
    setActivePasteIndex(null);
    showToast(`Inserted ${newQs.length} questions inline!`);
  };

  const handleBlankPaste = (index, textToParse) => {
    saveHistory();
    const newQs = processExtractedQuestions(textToParse, index);
    if (newQs.length === 0) return showToast("❌ No valid questions found in text", "error");
    let updated = [...questions];
    const firstNew = newQs.shift();
    updated[index] = { ...firstNew, isPosLocked: updated[index].isPosLocked, id: updated[index].id, isBlank: false };
    if (newQs.length > 0) {
      updated = insertFlow(updated, index + 1, newQs, lockCount);
    }
    setQuestions(updated);
    setIsDirty(true);
    showToast(`✅ Filled blank ${newQs.length > 0 ? `and flowed ${newQs.length} more` : ''}!`);
  };

  const updateQ = (id, field, value) => {
let finalValue = value;
if (typeof value === 'string' && ['text', 'optA', 'optB', 'optC', 'optD', 'natAnswer'].includes(field)) {
finalValue = value.replace(/\$\$/g, '$').replace(/\n(?:\s*\n)+/g, '\n');
}
setQuestions(questions.map((q, idx) => {
if (q.id === id) {
// AUTO-MAGIC IMAGE FIX: Catch manual typing of IMG:optA
if (typeof finalValue === 'string' && finalValue.match(/IMG:opt[a-d]/i)) {
const expectedNum = idx + 1;
let letter = '';
if (field === 'optA') letter = 'a';
else if (field === 'optB') letter = 'b';
else if (field === 'optC') letter = 'c';
else if (field === 'optD') letter = 'd';

if (letter) {
finalValue = finalValue.replace(/IMG:opt[a-d]/i, `IMG:${expectedNum}${letter}`);
}
}
return { ...q, [field]: finalValue };
}
return q;
}));
setIsDirty(true);
};

const handleOptionPaste = (id, e) => {
let pastedText = e.clipboardData.getData('text');
if (pastedText.includes(';') || pastedText.includes('#') || pastedText.includes('@')) {
e.preventDefault();
saveHistory();
pastedText = pastedText.replace(/\$\$/g, '$').replace(/\n(?:\s*\n)+/g, '\n');
let separator = ';';
if (pastedText.includes('#')) separator = '#';
else if (pastedText.includes('@')) separator = '@';
const parts = pastedText.split(separator);

setQuestions(questions.map((q, idx) => {
if (q.id === id) {
const expectedNum = idx + 1;

// AUTO-MAGIC IMAGE FIX: Catch semicolon pastes with IMG:optA
const autoReplaceOpt = (opt, letter) => {
if (opt && opt.match(/IMG:opt[a-d]/i)) {
return opt.replace(/IMG:opt[a-d]/i, `IMG:${expectedNum}${letter}`);
}
return opt;
};

return {
...q,
needsManualOptionFix: false,
optA: autoReplaceOpt(q.isCodeOptions ? formatCCode(parts[0]?.trim() || "") : formatOptionsIndent(parts[0]?.trim() || ""), 'a'),
optB: autoReplaceOpt(q.isCodeOptions ? formatCCode(parts[1]?.trim() || "") : formatOptionsIndent(parts[1]?.trim() || ""), 'b'),
optC: autoReplaceOpt(q.isCodeOptions ? formatCCode(parts[2]?.trim() || "") : formatOptionsIndent(parts[2]?.trim() || ""), 'c'),
optD: autoReplaceOpt(q.isCodeOptions ? formatCCode(parts[3]?.trim() || "") : formatOptionsIndent(parts[3]?.trim() || ""), 'd'),
natAnswer: ""
};
}
return q;
}));
setIsDirty(true);
showToast(`Options auto-filled (split by ${separator}) and aligned!`);
}
};

  const handleFormatSingleLatexSpaces = (id) => {
    saveHistory();
    let hasChanges = false;
    const applyLatexFormatting = (str) => {
      if (!str || !/\$\s+\$/.test(str)) return str;
      let formattedText = str.replace(/\$[^$]+\$(?:\s+\$[^$]+\$)+/g, (match) => match.replace(/\$\s+\$/g, '$\n$'));
      return formattedText.replace(/([^\S\n]*)\n([^\S\n]*)/g, '\n').replace(/\n\.([A-Z])/g, '\n$1').replace(/\n{3,}/g, '\n\n').trim();
    };
    setQuestions(questions.map(q => {
      if (q.id === id) {
        const newText = applyLatexFormatting(q.text);
        const newCode = formatCCode(q.code);
        const newOptA = q.isCodeOptions ? formatCCode(q.optA) : formatOptionsIndent(applyLatexFormatting(q.optA));
        const newOptB = q.isCodeOptions ? formatCCode(q.optB) : formatOptionsIndent(applyLatexFormatting(q.optB));
        const newOptC = q.isCodeOptions ? formatCCode(q.optC) : formatOptionsIndent(applyLatexFormatting(q.optC));
        const newOptD = q.isCodeOptions ? formatCCode(q.optD) : formatOptionsIndent(applyLatexFormatting(q.optD));
        if (newText !== q.text || newCode !== q.code || newOptA !== q.optA || newOptB !== q.optB || newOptC !== q.optC || newOptD !== q.optD) hasChanges = true;
        return { ...q, text: newText, code: newCode, optA: newOptA, optB: newOptB, optC: newOptC, optD: newOptD };
      }
      return q;
    }));
    if (hasChanges) { setIsDirty(true); showToast("✨ Formatted Math, Indented Code & Options!"); }
    else { showToast("ℹ️ Everything looks formatted.", "info"); }
  };

  const handleExportPDF = async () => {
  // Send all questions (including blanks) so numbering stays perfectly aligned
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
    const isZip = response.headers.get('Content-Type') === 'application/zip';
    a.download = isZip ? `${subject}_${chapter}_PYQs.zip` : `${subject}_${chapter}_PYQs.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast("✅ PDF Chunks Exported Successfully!");
  } catch (error) {
    showToast("❌ Error generating PDF. Make sure you are running locally.", "error");
  }
};

const handleExportAllImages = async () => {
  // Send all questions (including blanks) so numbering stays perfectly aligned
  if (questions.length === 0) return showToast("❌ No questions to export!", "error");
  showToast("📸 Generating Image ZIP... Please wait.", "info");
  try {
    const response = await fetch('/api/export-images-zip', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, chapter, questions, baseUrl: window.location.origin, contentWidth: imageTextWidth })
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
  } catch (error) { 
    showToast("❌ Error generating Image ZIP.", "error"); 
  }
};

  const cleanLatexForYT = (text) => {
    if (!text) return "";
    let cleaned = text.replace(/\[IMG_\d+\]/g, ' ').replace(/\[DIAGRAM_PLACEHOLDER\]/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\$/g, '').replace(/\\\[/g, '').replace(/\\\]/g, '');
    const map = { '\\Leftrightarrow': ' bi implication ', '\\leftrightarrow': ' bi implication ', '<=>': ' bi implication ', '<->': ' bi implication ', '\\Rightarrow': ' implication ', '\\rightarrow': ' implication ', '=>': ' implication ', '->': ' implication ', '\\Leftarrow': ' is implied by ', '\\leftarrow': ' from ', '\\neg': ' not ', '\\vee': ' or ', '\\wedge': ' and ', '\\oplus': ' xor ', '\\ge': ' greater equal ', '\\le': ' less equal ', '\\neq': ' != ', '\\approx': ' ~ ', '\\equiv': ' = ', '\\times': ' x ', '\\div': ' div ', '\\pm': ' +- ', '\\infty': ' infinity ', '\\forall': ' for all ', '\\exists': ' exists ', '\\in ': ' in ', '\\notin ': ' not in ', '\\cup': ' union ', '\\cap': ' intersection ', '\\emptyset': ' empty set ' };
    for (const [key, value] of Object.entries(map)) { cleaned = cleaned.replaceAll(key, value); }
    cleaned = cleaned.replace(/<=/g, ' less equal ').replace(/\\[a-zA-Z]+/g, ' ').replace(/[{}]/g, ' ').replace(/[<>:"/\\|?*]/g, ' ');
    return cleaned.replace(/\s+/g, ' ').trim();
  };

  const copyForYouTube = (q) => {
    const cleanSubject = subject.replace(/^\d+\.\s*/, '').trim();
    const cleanChapter = chapter.replace(/^\d+\.\s*/, '').trim();
    const isTextOpt = (opt) => opt && !opt.startsWith('IMG:');
    let textForYT = cleanLatexForYT(q.text);
    let safeCode = q.code ? q.code.replace(/[<>]/g, ' ') : '';
    if (safeCode && textForYT.includes('[CODE]')) {
      textForYT = textForYT.replace('[CODE]', `\n\nCode Snippet:\n${safeCode}\n\n`);
    }
    let ytText = `[GATE ${q.year}, ${q.marks} Mark, ${cleanSubject}, ${cleanChapter}]\n\n${textForYT}\n`;
    if (safeCode && !cleanLatexForYT(q.text).includes('[CODE]')) {
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
    ytText += `GATE CSE ${q.year} PYQ, ${cleanSubject}, ${cleanChapter}\nMarks: ${q.marks} Mark\n\nQuestion:\n${textForYT}\n\n`;
    if (safeCode && !cleanLatexForYT(q.text).includes('[CODE]')) {
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
    ytText += `Prepare for GATE Computer Science Engineering (CSE) with detailed previous year questions (PYQs). This specific problem belongs to the ${cleanSubject} subject, focusing on the ${cleanChapter} topic.\n\n`;
    ytText += `#GATECSE #GATE${q.year} #${cleanSubject.replace(/[^a-zA-Z0-9]/g, '')} #${cleanChapter.replace(/[^a-zA-Z0-9]/g, '')} #GATEPreparation #GATECSEPYQ #ComputerScience #GATEExam`;
    navigator.clipboard.writeText(ytText.trim());
    showToast("📋 Copied combined text for YT!");
  };

  const handleExportForAI = async () => {
    const validQs = questions.filter((q) => {
      if (q.isBlank) return false;

      // 1. Exclude questions with any image or diagram placeholder
      const hasImage = 
        (q.diagram && q.diagram !== "auto" && q.diagram.trim() !== "") ||
        (q.text && (q.text.includes("[DIAGRAM_PLACEHOLDER]") || q.text.includes("[IMG_"))) ||
        [q.optA, q.optB, q.optC, q.optD].some((opt) => opt && opt.includes("IMG:"));

      if (hasImage) return false;

      // 2. NEW: Exclude any questions that contain a code snippet
      if (q.code && q.code.trim() !== "") return false;

      // 3. Exclude very long questions (> 800 characters of text)
      const isTooLong = q.text && q.text.length > 800;

      if (isTooLong) return false;

      return true;
    });

    if (validQs.length === 0) return showToast("❌ No valid questions to export for AI!", "error");

    // The complete system prompt injected programmatically
    const systemPrompt = `PROMPT
Act as an expert GATE CS problem generator. Generate practice questions for GATE Computer Science. Write the Answers and Explanations of the Provided Questions below in the correct format.

Constraints:
1. Allowed Subjects: You must strictly categorize the question under one of these subjects: Discrete Maths, Engg. Maths, Digital L., COA, Prog. and DS, Algo, TOC, Compiler, OS, DBMS, Computer Networks, General Aptitude, Other.
2. Formatting Output: Use plain text only for the labels. Do not use bolding, markdown formatting, or numbering for the keys.
3. Math & LaTeX (CRITICAL FOR WRAPPING): Use $ for inline equations and $$ for block equations. You must keep plain English text outside of the MathJax/LaTeX delimiters wherever possible to allow for standard HTML text wrapping. Never use \\text{...} to wrap long English sentences inside math environments.
   * Bad: $L = \\{w \\in \\{a,b\\}^* \\mid w \\text{ contains an even number of a's...}\\}$
   * Good: $L = \\{w \\in \\{a,b\\}^* \\mid w$ contains an even number of $a$'s and an odd number of $b$'s$\\}$
4. Option Separation: Separate the choices strictly with a space, a single semicolon, and a space ( ; ).
5. Contributor Tag: Always end with CONTRIBUTOR: G4Gate.

Exact Output Template (Do not deviate):
SUBJECT: [Subject]
TYPE: [MCQ/MSQ/NAT]
QUESTION: [Question Text]
OPTIONS: [Option 1] ; [Option 2] ; [Option 3] ; [Option 4]
ANSWER: [Correct Option]
EXPLANATION: [Brief explanation of the solution]
CONTRIBUTOR: G4Gate

---------------------------------------------------
PROVIDED QUESTIONS TO FORMAT:

`;

    const CHUNK_SIZE = 10; 
    const totalChunks = Math.ceil(validQs.length / CHUNK_SIZE);
    
    // Clean up subject/chapter names for a clean filename
    const cleanSubject = subject.replace(/^\d+\.\s*/, '').replace(/[^a-zA-Z0-9]/g, '_');
    const cleanChapter = chapter.replace(/^\d+\.\s*/, '').replace(/[^a-zA-Z0-9]/g, '_');

    showToast(`📦 Preparing ${totalChunks} file(s) for download...`, 'info');

    // Loop through the valid questions in chunks of 20
    for (let i = 0; i < totalChunks; i++) {
      const chunk = validQs.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      let exportText = systemPrompt;
      
      chunk.forEach((q) => {
        // Replaced 'Q{number}.' with just 'Q.' 
        exportText += `Q. ${q.text.trim()}\n`;

        if (q.optA || q.optB || q.optC || q.optD) {
          let opts = [];
          if (q.optA) opts.push(`(A) ${q.optA.trim()}`);
          if (q.optB) opts.push(`(B) ${q.optB.trim()}`);
          if (q.optC) opts.push(`(C) ${q.optC.trim()}`);
          if (q.optD) opts.push(`(D) ${q.optD.trim()}`);
          exportText += `Options: ${opts.join("  ")}\n`;
        } else if (q.natAnswer) {
          exportText += `NAT Answer: ${q.natAnswer.trim()}\n`;
        }
        exportText += `\n`;
      });

      // Create and download the .txt file for this specific chunk
      const blob = new Blob([exportText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Name files sequentially: e.g., AI_Prompt_OS_Part1_of_4.txt
      a.download = `AI_Prompt_${cleanSubject}_${cleanChapter}_Part${i + 1}_of_${totalChunks}.txt`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Add a slight delay (500ms) to prevent the browser from blocking multiple automatic downloads
      if (i < totalChunks - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    showToast(`🤖 Downloaded ${totalChunks} AI Prompt file(s) with ${validQs.length} total questions!`);
  };

  const handleExportYTData = () => {
    const validQs = questions.filter(q => !q.isBlank);
    if (validQs.length === 0) return showToast("❌ No valid questions to export!", "error");
    const ytData = validQs.map((q, index) => {
      let fullText = cleanLatexForYT(q.text);
      const optionsList = [q.optA, q.optB, q.optC, q.optD].map(opt => cleanLatexForYT(opt)).filter(opt => opt && !opt.startsWith('IMG:'));
      if (optionsList.length > 0) fullText += ' ' + optionsList.join(' ');
      const cleanText = fullText.replace(/\s+/g, ' ').trim();
      const cleanSubject = subject.replace(/^\d+\.\s*/, '').trim();
      const cleanChapter = chapter.replace(/^\d+\.\s*/, '').trim();
      return {
        index: index + 1, year: q.year, marks: q.marks, subject: cleanSubject, chapter: cleanChapter,
        video_title: `GATE CSE ${q.year} ${cleanSubject} ${cleanText}`.replace(/\s+/g, ' ').trim(),
        timestamp_title: `GATE CSE ${q.year} ${cleanChapter} ${cleanText}`.replace(/\s+/g, ' ').trim()
      };
    });
    const jsonString = JSON.stringify(ytData, null, 4);
    navigator.clipboard.writeText(jsonString).then(() => showToast("▶️ YT Data copied to clipboard & downloaded!"));
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

  const renderOptionText = (optText, ext, isCode) => {
    if (!optText) return null;
    if (optText.startsWith('IMG:')) {
      const imgPath = `/${subject}/${chapter}/${optText.replace('IMG:', '').trim()}${ext}`;
      const isErr = imageErrors.has(imgPath);
      return `<img src="${imgPath}?t=${imgCacheBuster}" onerror="window.reportImageStatus('${imgPath}', true)" onload="window.reportImageStatus('${imgPath}', false)" style="max-height:60px; vertical-align:middle; border:2px solid ${isErr ? '#f38ba8' : '#45475a'}; border-radius:4px; margin-left:10px;"/>`;
    }
    let text = optText;
    if (isCode) {
      text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    return text.replace(/\n/g, '<br>');
  };

  

  let filterMinIdx = -1;
  let filterMaxIdx = -1;
  if (filterYear !== 'All') {
      const yearIndices = questions.map((q, i) => (q.year === filterYear && !q.isBlank ? i : -1)).filter(i => i !== -1);
      if (yearIndices.length > 0) {
          filterMinIdx = Math.min(...yearIndices);
          filterMaxIdx = Math.max(...yearIndices);
      }
  }

  const jumpToSpecificQuestion = (qNum, type) => {
    const targetEl = document.getElementById(`question-${qNum}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      const card = targetEl.querySelector('.question-card') || targetEl;
      card.style.transition = 'box-shadow 0.3s ease-in-out';
      
      // Use red for issues, yellow for blanks
      card.style.boxShadow = type === 'issue' ? '0 0 15px 5px #f38ba8' : '0 0 15px 5px #f9e2af';
      setTimeout(() => { card.style.boxShadow = 'none'; }, 1500);

      // Close the dropdowns
      setShowMissingDropdown(false);
      setShowBlankDropdown(false);
    } else {
      showToast(`Question ${qNum} is hidden by your active filters.`, "error");
    }
  };

  return (
    <div style={{ maxWidth: '98%', margin: 'auto', padding: '20px' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '30px', right: '30px',
          background: toast.type === 'error' ? '#f38ba8' : toast.type === 'info' ? '#89b4fa' : '#a6e3a1',
          color: '#11111b', padding: '15px 25px', borderRadius: '8px', zIndex: 9999, fontWeight: 'bold', boxShadow: '0 8px 15px rgba(0,0,0,0.5)', transition: 'all 0.3s ease-in-out'
        }}>{toast.message}</div>
      )}
      
      {isReviving && (
        <div style={{
          position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(17, 17, 27, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, backdropFilter: 'blur(4px)'
        }}>
          <div style={{ background: '#1e1e2e', color: '#a6e3a1', padding: '40px 60px', borderRadius: '12px', fontSize: '32px', fontWeight: 'bold', border: '2px solid #a6e3a1', boxShadow: '0 0 30px rgba(166, 227, 161, 0.3)' }}>🔄 Reviving Database...</div>
        </div>
      )}

      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', padding: '15px', position: 'sticky', top: '0', zIndex: '100', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', borderBottom: '2px solid #89b4fa', margin: '-20px -20px 20px -20px', borderRadius: '0 0 8px 8px' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ marginTop: 0 }}>Subject</label>
          <select value={subject} onChange={handleSubjectChange} style={{ cursor: 'pointer', width: '100%' }}>
            {availableSubjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </div>
        
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ marginTop: 0 }}>Chapter</label>
          <select value={chapter} onChange={handleChapterChange} style={{ cursor: 'pointer', width: '100%' }}>
            {GATE_SYLLABUS[subject].map(chap => <option key={chap} value={chap}>{chap}</option>)}
          </select>
        </div>

        <div style={{ flex: '1 1 120px' }}>
          <label style={{ marginTop: 0 }}>Year Filter</label>
          <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} style={{ cursor: 'pointer', width: '100%' }}>
            {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* --- NEW: LOCK VISIBILITY TOGGLES --- */}
        <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '5px', background: '#181825', padding: '5px 10px', borderRadius: '6px', border: '1px solid #45475a' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#cdd6f4', cursor: 'pointer', margin: 0 }}>
            <input type="checkbox" checked={hideBulkLocked} onChange={(e) => setHideBulkLocked(e.target.checked)} />
            Hide Bulk Locked
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#cdd6f4', cursor: 'pointer', margin: 0 }}>
            <input type="checkbox" checked={hidePosLocked} onChange={(e) => setHidePosLocked(e.target.checked)} />
            Hide Pos Locked
          </label>
        </div>

        <div style={{ flex: '1 1 250px', textAlign: 'center', padding: '10px', background: '#181825', borderRadius: '4px', border: `1px solid ${isDirty ? '#f9e2af' : (questions.length > 0 ? '#a6e3a1' : '#45475a')}` }}>
          {questions.length === 0 ? (<span style={{ color: '#6c7086', fontWeight: 'bold' }}>No Questions Found</span>) : isDirty ? (<span style={{ color: '#f9e2af', fontWeight: 'bold' }}>⚠️ {syncedCount}/{questions.length} Synced (Unsaved)</span>) : (<span style={{ color: '#a6e3a1', fontWeight: 'bold' }}>✅ All {questions.length} Synced</span>)}
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap', marginTop: '5px' }}>
              {missingIndices.length > 0 && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      setShowMissingDropdown(prev => !prev);
                      setShowBlankDropdown(false); // Close the other dropdown
                    }}
                    style={{ background: '#f38ba8', color: '#11111b', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                  >
                    ⚠️ {missingIndices.length} Issues ▼
                  </button>

                  {showMissingDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px', background: '#181825', border: '1px solid #45475a', borderRadius: '6px', padding: '8px', width: '170px', maxHeight: '200px', overflowY: 'auto', zIndex: 1000, boxShadow: '0 8px 15px rgba(0,0,0,0.5)' }}>
                      <div style={{ fontSize: '11px', color: '#a6adc8', marginBottom: '8px', textAlign: 'center', fontWeight: 'bold' }}>Jump to Image Issue</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        {missingIndices.map(qNum => (
                          <button 
                            key={`miss-${qNum}`} 
                            onClick={() => jumpToSpecificQuestion(qNum, 'issue')} 
                            style={{ background: '#313244', color: '#f38ba8', border: '1px solid #45475a', borderRadius: '4px', padding: '4px 0', fontSize: '12px', cursor: 'pointer', textAlign: 'center' }}
                          >
                            Q{qNum}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {blankIndices.length > 0 && (
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      setShowBlankDropdown(prev => !prev);
                      setShowMissingDropdown(false); // Close the other dropdown
                    }}
                    style={{ background: '#f9e2af', color: '#11111b', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                  >
                    🔲 {blankIndices.length} Blanks ▼
                  </button>

                  {showBlankDropdown && (
        <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: '8px', background: '#181825', border: '1px solid #45475a', borderRadius: '6px', padding: '12px', width: '320px', maxHeight: '450px', overflowY: 'auto', zIndex: 1000, boxShadow: '0 8px 15px rgba(0,0,0,0.5)' }}>
          
          {/* Quick Paste Area */}
          <div style={{ marginBottom: '15px', borderBottom: '1px solid #45475a', paddingBottom: '15px' }}>
            <div style={{ fontSize: '11px', color: '#a6adc8', marginBottom: '8px', textAlign: 'center', fontWeight: 'bold' }}>⚡ Bulk Fill Blanks (In Order)</div>
            <textarea 
              value={blankBulkText}
              onChange={(e) => setBlankBulkText(e.target.value)}
              placeholder="Paste multiple QUESTION: ... OPTIONS: ... here to fill blanks chronologically."
              style={{ width: '100%', minHeight: '80px', background: '#11111b', color: '#cdd6f4', border: '1px solid #45475a', borderRadius: '4px', padding: '8px', fontSize: '11px', resize: 'vertical', outline: 'none' }}
            />
            <button 
              onClick={handleBulkBlankFill}
              style={{ width: '100%', background: '#a6e3a1', color: '#11111b', fontWeight: 'bold', border: 'none', borderRadius: '4px', padding: '8px', marginTop: '8px', cursor: 'pointer', fontSize: '12px' }}
            >
              ⚡ Fill Available Blanks
            </button>
          </div>

          <div style={{ fontSize: '11px', color: '#a6adc8', marginBottom: '8px', textAlign: 'center', fontWeight: 'bold' }}>Jump to Blank</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {blankIndices.map(qNum => {
               // Check if the question was just filled during this session
               const isFilled = questions[qNum - 1]._justFilled;
               return (
                 <button 
                   key={`blank-${qNum}`} 
                   onClick={() => jumpToSpecificQuestion(qNum, 'blank')} 
                   style={{ 
                     background: isFilled ? '#a6e3a1' : '#313244', 
                     color: isFilled ? '#11111b' : '#f9e2af', 
                     border: `1px solid ${isFilled ? '#a6e3a1' : '#45475a'}`, 
                     borderRadius: '4px', padding: '6px 0', fontSize: '12px', cursor: 'pointer', textAlign: 'center', fontWeight: isFilled ? 'bold' : 'normal'
                   }}
                   title={isFilled ? "Filled! Waiting for Save/Lock" : "Empty Blank"}
                 >
                   Q{qNum}
                 </button>
               );
            })}
          </div>
        </div>
      )}
                </div>
              )}
            </div>
        </div>
        
        <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', padding: '0 10px' }}>
          <label style={{ marginTop: 0, fontSize: '13px', color: '#cdd6f4' }}>Thumbnail Text Width: <strong>{imageTextWidth}%</strong></label>
          <input type="range" min="40" max="100" value={imageTextWidth} onChange={(e) => setImageTextWidth(e.target.value)} style={{ cursor: 'pointer', marginTop: '5px' }} />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-export" style={{ background: '#cba6f7', color: '#11111b', padding: '10px 15px' }} onClick={handleExportPDF}>🚀 Export Full PDF</button>
          <button className="btn-export" style={{ background: '#a6e3a1', color: '#11111b', padding: '10px 15px' }} onClick={() => saveToMongoDB(null, false)}>💾 Save DB</button>
          <button className="btn-export" style={{ background: '#f5c2e7', color: '#11111b', padding: '10px 15px' }} onClick={handleExportYTData}>▶️ Export YT Data</button>
          <button className="btn-export" style={{ background: '#89dceb', color: '#11111b', padding: '10px 15px' }} onClick={handleExportAllImages}>📸 Export All Images (ZIP)</button>
              <button className="btn-export" style={{ background: '#f9e2af', color: '#11111b', padding: '10px 15px', fontWeight: 'bold' }} onClick={handleExportForAI}>🤖 Export for AI</button>

          <button className="btn-clear" style={{ padding: '10px 15px' }} onClick={clearWorkspace}>🗑️ Clear</button>
          <button className="btn-export" style={{ background: history.length > 0 ? '#fab387' : '#45475a', color: history.length > 0 ? '#11111b' : '#6c7086', padding: '10px 15px', cursor: history.length > 0 ? 'pointer' : 'not-allowed' }} onClick={handleUndo} disabled={history.length === 0}>⏪ Undo</button>
          
          <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
            <form onSubmit={handleLock} style={{ display: 'flex', gap: '5px', marginRight: '10px' }}>
              <input type="number" min="0" max={questions.length} ref={lockInputRef} placeholder="Bulk Lock #" title="Bulk lock questions 1 through N" style={{ width: '80px', padding: '8px', borderRadius: '4px', border: '1px solid #f9e2af', background: '#181825', color: '#cdd6f4', textAlign: 'center', outline: 'none' }} />
              <button type="submit" style={{ background: '#f9e2af', color: '#11111b', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🔒 Lock</button>
            </form>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginRight: '10px', background: '#181825', border: '1px solid #74c7ec', borderRadius: '4px', padding: '0 5px' }}>
              <input type="text" placeholder="🔍 Search (Enter)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearchKeyDown} style={{ width: '130px', padding: '8px', border: 'none', background: 'transparent', color: '#cdd6f4', outline: 'none' }} />
              {searchQuery && (<span style={{ fontSize: '12px', color: '#a6adc8', fontWeight: 'bold', minWidth: '35px', textAlign: 'center' }}>{searchResults.length > 0 ? `${currentSearchIndex + 1}/${searchResults.length}` : '0/0'}</span>)}
              {searchResults.length > 0 && (
                <div style={{ display: 'flex', gap: '2px', borderLeft: '1px solid #45475a', paddingLeft: '5px', marginLeft: '2px' }}>
                  <button type="button" onClick={handlePrevMatch} style={{ background: 'transparent', color: '#cdd6f4', border: 'none', cursor: 'pointer', padding: '0 4px', fontSize: '12px' }}>▲</button>
                  <button type="button" onClick={handleNextMatch} style={{ background: 'transparent', color: '#cdd6f4', border: 'none', cursor: 'pointer', padding: '0 4px', fontSize: '12px' }}>▼</button>
                </div>
              )}
              {searchQuery && (<button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); setHasJumped(false); }} style={{ background: 'transparent', color: '#f38ba8', border: 'none', padding: '0 5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', marginLeft: '2px' }}>✕</button>)}
            </div>
            
            <form onSubmit={handleJump} style={{ display: 'flex', gap: '5px', marginRight: '5px' }}>
              <input type="number" min="1" max={questions.length || 1} ref={jumpInputRef} placeholder="Q#" style={{ width: '55px', padding: '8px', borderRadius: '4px', border: '1px solid #45475a', background: '#181825', color: '#cdd6f4', textAlign: 'center', outline: 'none' }} />
              <button type="submit" style={{ background: '#89b4fa', color: '#11111b', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Go</button>
            </form>
            
            <button onClick={forceRefreshPreview} style={{ background: '#a6e3a1', color: '#11111b', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }} title="Force Refresh Preview">🔄</button>
            <button onClick={scrollToTop} style={{ background: '#45475a', color: '#cdd6f4', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>⬆️</button>
            <button onClick={scrollToBottom} style={{ background: '#45475a', color: '#cdd6f4', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>⬇️</button>
          </div>
        </div>
      </div>
      <div>

            <Link href="/scraper" style={{ background: '#3ac04e', color: '#11111b', padding: '10px 15px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', marginTop: '10px' }} target="_blank">Go to scraper</Link>
            <Link href="/status" style={{ background: '#f38ba8', color: '#11111b', padding: '10px 15px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', marginTop: '10px' , marginLeft: '10px'}} target="_blank">Check Status</Link>
            <Link href="/kmap-maker" style={{ background: '#89b4fa', color: '#11111b', padding: '10px 15px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', marginTop: '10px' , marginLeft: '10px'}} target="_blank">K-Map Maker</Link>
      </div>
      
      
      
      <div id="questions_container">
        {questions.map((q, idx) => {
          const qNum = idx + 1;
          const isBulkLocked = idx < lockCount;

          // --- NEW: RENDER FILTER LOGIC ---
          // 1. Check Year Filter
          if (filterYear !== 'All') {
            if (q.isBlank) {
              // ✅ CHANGED: Show blank if it's within (or immediately adjacent to) the filtered year's range.
              // Extending by +/- 1 so a blank right before the first or right after the last question is visible.
              const isNearYear = filterMinIdx !== -1 && (idx >= filterMinIdx - 1 && idx <= filterMaxIdx + 1);
              if (!isNearYear) return null;
            } else if (q.year !== filterYear) {
              return null;
            }
          }
          // 2. Check Lock Filters
          if (hideBulkLocked && isBulkLocked) return null;
          if (hidePosLocked && q.isPosLocked) return null;

          if (q.isBlank) {
            return (
              <div key={q.id} id={`question-${qNum}`} style={{ scrollMarginTop: '160px', opacity: isBulkLocked ? 0.85 : 1 }}>
                <div style={{ textAlign: 'center', margin: '5px 0 10px 0', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                  <button className="btn-autofill" disabled={isBulkLocked} onClick={() => addBlankAt(idx)} style={{ background: '#89b4fa', color: '#11111b', padding: '4px 12px', fontSize: '12px' }}>➕ Insert Blank Above</button>
                </div>
                <div style={{ padding: '15px', border: '2px dashed #a6adc8', background: '#181825', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, color: '#a6adc8' }}>{isBulkLocked || q.isPosLocked ? "🔒 " : ""}Question {qNum} (Blank Placeholder)</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-export" disabled={isBulkLocked} style={{ background: q.isPosLocked ? '#f9e2af' : '#45475a', color: q.isPosLocked ? '#11111b' : '#cdd6f4', padding: '4px 10px', fontSize: '12px' }} onClick={() => togglePosLock(q.id)} title={q.isPosLocked ? "Unlock Position" : "Lock Position"}>
                        {q.isPosLocked ? '🔓 Pos Locked' : '🔒 Lock Pos'}
                      </button>
                      <button className="btn-clear" disabled={isBulkLocked} onClick={() => removeQuestionCompletely(q.id)} title="Deletes completely and shifts everything below UP" style={{ padding: '4px 10px', fontSize: '12px', background: '#f38ba8', color: '#11111b' }}>🗑️ Delete Completely</button>
                    </div>
                  </div>
                  <textarea
                    value={q.tempPaste || ''}
                    onChange={(e) => updateQ(q.id, 'tempPaste', e.target.value)}
                    placeholder="⚡ Quick Paste: Paste QUESTION: ... OPTIONS: ... here to fill this blank"
                    style={{ width: '100%', minHeight: '60px', background: '#11111b', color: '#cdd6f4', border: '1px solid #45475a', padding: '10px', borderRadius: '4px', outline: 'none' }}
                    disabled={isBulkLocked}
                  />
                  <button className="btn-autofill" disabled={isBulkLocked || !q.tempPaste} onClick={() => handleBlankPaste(idx, q.tempPaste)} style={{ marginTop: '10px', padding: '6px 15px', background: '#a6e3a1', color: '#11111b', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: (isBulkLocked || !q.tempPaste) ? 'not-allowed' : 'pointer' }}>
                    ⚡ Extract & Fill Blank
                  </button>
                </div>
              </div>
            );
          }

          const imageList = q.diagram ? q.diagram.split(',').map(s => s.trim()).filter(Boolean) : [];
          const hasOptions = q.optA || q.optB || q.optC || q.optD;
          let formattedText = (q.text || "").replace(/\n/g, '<br>');
          
          imageList.forEach((imgName, i) => {
            const imgPath = `/${subject}/${chapter}/${imgName}${q.ext}`;
            const isErr = imageErrors.has(imgPath);
            const imgTag = `<div style="border:1px dashed ${isErr ? '#f38ba8' : '#74c7ec'}; padding:10px; text-align:center; margin: 10px 0;"><img src="${imgPath}?t=${imgCacheBuster}" onerror="window.reportImageStatus('${imgPath}', true)" onload="window.reportImageStatus('${imgPath}', false)" alt="Missing" style="max-width:100%; max-height:200px;"/><br/><small style="color:${isErr ? '#f38ba8' : '#74c7ec'}">${isErr ? '⚠️ 404 NOT FOUND: ' : ''}${imgPath}</small></div>`;
            if (formattedText.includes(`[IMG_${i + 1}]`)) formattedText = formattedText.replace(`[IMG_${i + 1}]`, imgTag);
            else if (i === 0 && formattedText.includes('[DIAGRAM_PLACEHOLDER]')) formattedText = formattedText.replace('[DIAGRAM_PLACEHOLDER]', imgTag);
            else formattedText += imgTag;
          });

          return (
            <div key={q.id} id={`question-${qNum}`} style={{ scrollMarginTop: '160px', opacity: isBulkLocked ? 0.85 : 1 }}>
              <div style={{ textAlign: 'center', margin: '5px 0 10px 0', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                {activePasteIndex === idx ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: '#181825', padding: '15px', borderRadius: '8px', border: '1px dashed #cba6f7', width: '80%' }}>
                    <textarea value={inlinePasteText} onChange={(e) => setInlinePasteText(e.target.value)} placeholder="Paste QUESTION: ... OPTIONS: ... here to displace and insert at this index" style={{ width: '100%', minHeight: '80px' }}></textarea>
                    <div>
                      <button onClick={() => handleInlinePaste(idx)} style={{ background: '#a6e3a1', padding: '6px 15px', fontWeight: 'bold', color: '#11111b', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>⚡ Extract & Insert Here</button>
                      <button onClick={() => setActivePasteIndex(null)} style={{ background: '#f38ba8', padding: '6px 15px', fontWeight: 'bold', color: '#11111b', borderRadius: '4px', marginLeft: '10px', border: 'none', cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button className="btn-autofill" disabled={isBulkLocked || q.isPosLocked} style={{ padding: '4px 12px', fontSize: '12px', background: '#45475a', color: '#cdd6f4', opacity: (isBulkLocked || q.isPosLocked) ? 0.5 : 1, cursor: (isBulkLocked || q.isPosLocked) ? 'not-allowed' : 'pointer' }} onClick={() => setActivePasteIndex(idx)}>⚡ Quick Paste Flow Here</button>
                    <button className="btn-autofill" disabled={isBulkLocked || q.isPosLocked} onClick={() => addBlankAt(idx)} style={{ background: '#89b4fa', color: '#11111b', padding: '4px 12px', fontSize: '12px', opacity: (isBulkLocked || q.isPosLocked) ? 0.5 : 1, cursor: (isBulkLocked || q.isPosLocked) ? 'not-allowed' : 'pointer' }}>➕ Insert Blank Above</button>
                  </>
                )}
              </div>
              
              <div className="card question-card" style={{
                display: 'flex',
                border: q.needsManualOptionFix ? '2px dashed #f38ba8' : ((isBulkLocked || q.isPosLocked) ? '1px solid #f9e2af' : 'none'),
                backgroundColor: q.needsManualOptionFix ? 'rgba(243, 139, 168, 0.05)' : 'transparent'
              }}>
                <div className="half-width">
                  {q.needsManualOptionFix && (
                    <div style={{ background: '#f38ba8', color: '#11111b', padding: '8px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px', marginBottom: '15px' }}>
                      ⚠️ Detected &gt;4 Semicolons! Kept raw in Box A to prevent cutoff.
                      Change separators to # and Paste it back in Box A to split correctly!
                    </div>
                  )}
                  
                  <div className="q-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, color: (isBulkLocked || q.isPosLocked) ? '#f9e2af' : '#a6e3a1', display: 'inline-block' }}>
                        {(isBulkLocked || q.isPosLocked) && "🔒 "}Question {qNum}
                      </h3>
                      <button className="btn-export" style={{ background: '#f9e2af', color: '#11111b', padding: '4px 10px', marginLeft: '10px', fontSize: '12px' }} onClick={() => copyForYouTube(q)}>📋 Copy for YT</button>
                      <button className="btn-export" disabled={isBulkLocked} style={{ background: '#f5a97f', color: '#11111b', padding: '4px 10px', marginLeft: '10px', fontSize: '12px', opacity: isBulkLocked ? 0.5 : 1, cursor: isBulkLocked ? 'not-allowed' : 'pointer' }} onClick={() => handleFormatSingleLatexSpaces(q.id)} title="Format Math Spacing">✨ Format $ $</button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        className="btn-export"
                        disabled={isBulkLocked}
                        style={{ background: q.isPosLocked ? '#f9e2af' : '#45475a', color: q.isPosLocked ? '#11111b' : '#cdd6f4', padding: '4px 10px', fontSize: '12px', cursor: isBulkLocked ? 'not-allowed' : 'pointer' }}
                        onClick={() => togglePosLock(q.id)}
                        title={q.isPosLocked ? "Unlock Position" : "Lock Position"}
                      >
                        {q.isPosLocked ? '🔓 Pos Locked' : '🔒 Lock Pos'}
                      </button>
                      <input
                        type="number"
                        placeholder="Move to #"
                        onKeyDown={(e) => handleMoveQuestion(idx, e)}
                        disabled={isBulkLocked}
                        title={isBulkLocked ? "Locked" : "Type target Q# and press Enter"}
                        style={{ width: '80px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #89b4fa', background: '#11111b', color: '#cdd6f4', textAlign: 'center', outline: 'none', cursor: isBulkLocked ? 'not-allowed' : 'text' }}
                      />
                      <button className="btn-clear" disabled={isBulkLocked} style={{ padding: '4px 10px', fontSize: '12px', opacity: isBulkLocked ? 0.5 : 1, cursor: isBulkLocked ? 'not-allowed' : 'pointer' }} onClick={() => clearToBlank(q.id)} title="Replace with empty blank, preserving numbering">Clear to Blank</button>
                      <button className="btn-clear" disabled={isBulkLocked} style={{ padding: '4px 10px', fontSize: '12px', background: '#f38ba8', color: '#11111b', opacity: isBulkLocked ? 0.5 : 1, cursor: isBulkLocked ? 'not-allowed' : 'pointer' }} onClick={() => removeQuestionCompletely(q.id)} title="Delete permanently and shift UP">🗑️ Delete</button>
                    </div>
                  </div>
                  
                  <label>Question Text</label>
                  <textarea disabled={isBulkLocked} value={q.text || ""} onChange={(e) => updateQ(q.id, 'text', e.target.value)} className="q-text" />
                  
                  <label>Code Snippet</label>
                  <textarea disabled={isBulkLocked} value={q.code || ""} onChange={(e) => updateQ(q.id, 'code', e.target.value)} className="code-text" />
                  
                  <div className="grid-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px' }}>
                    <div><label>Year</label><select disabled={isBulkLocked} value={q.year} onChange={(e) => updateQ(q.id, 'year', e.target.value)}>{getYearOptions().map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                    <div><label>Marks</label><div className="radio-group" style={{ display: 'flex', gap: '5px' }}><input disabled={isBulkLocked} type="radio" checked={q.marks === "1"} onChange={() => updateQ(q.id, 'marks', "1")} /> 1M <input disabled={isBulkLocked} type="radio" checked={q.marks === "2"} onChange={() => updateQ(q.id, 'marks', "2")} style={{ marginLeft: '10px' }} /> 2M</div></div>
                    <div><label>Images</label><div className="input-group" style={{ display: 'flex' }}><input disabled={isBulkLocked} type="text" value={q.diagram || ""} onChange={(e) => updateQ(q.id, 'diagram', e.target.value)} placeholder="e.g. 1a, 1b" style={{ borderRadius: '4px 0 0 4px' }} /><select disabled={isBulkLocked} value={q.ext} onChange={(e) => updateQ(q.id, 'ext', e.target.value)} style={{ width: '60px' }}><option value=".png">.png</option><option value=".jpg">.jpg</option></select></div></div>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', marginBottom: '5px' }}>
                    <label style={{ color: '#f5c2e7', margin: 0 }}>Options (Paste A;B;C;D in Box A. IMG:filename for images. Blank for NAT)</label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#a6e3a1', cursor: isBulkLocked ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 'bold', background: '#313244', padding: '4px 10px', borderRadius: '4px' }}>
                      <input disabled={isBulkLocked} type="checkbox" checked={q.isCodeOptions || false} onChange={(e) => updateQ(q.id, 'isCodeOptions', e.target.checked)} />
                      🧑‍💻 Format Options as Code
                    </label>
                  </div>
                  
                  <div className="grid-opts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <textarea disabled={isBulkLocked} value={q.optA || ""} onPaste={(e) => handleOptionPaste(q.id, e)} onChange={(e) => updateQ(q.id, 'optA', e.target.value)} placeholder="Option A" style={{ minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #45475a', background: '#181825', color: '#cdd6f4', resize: 'vertical' }} />
                    <textarea disabled={isBulkLocked} value={q.optB || ""} onChange={(e) => updateQ(q.id, 'optB', e.target.value)} placeholder="Option B" style={{ minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #45475a', background: '#181825', color: '#cdd6f4', resize: 'vertical' }} />
                    <textarea disabled={isBulkLocked} value={q.optC || ""} onChange={(e) => updateQ(q.id, 'optC', e.target.value)} placeholder="Option C" style={{ minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #45475a', background: '#181825', color: '#cdd6f4', resize: 'vertical' }} />
                    <textarea disabled={isBulkLocked} value={q.optD || ""} onChange={(e) => updateQ(q.id, 'optD', e.target.value)} placeholder="Option D" style={{ minHeight: '60px', padding: '8px', borderRadius: '4px', border: '1px solid #45475a', background: '#181825', color: '#cdd6f4', resize: 'vertical' }} />
                  </div>
                  
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    {!hasOptions && (
                      <>
                        {!q.isProof && (<input disabled={isBulkLocked} type="text" value={q.natAnswer || ""} onChange={(e) => updateQ(q.id, 'natAnswer', e.target.value)} placeholder="NAT Answer" style={{ border: '1px solid #f38ba8', flex: 1 }} />)}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#bac2de', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                          <input disabled={isBulkLocked} type="checkbox" checked={q.isProof || false} onChange={(e) => updateQ(q.id, 'isProof', e.target.checked)} />
                          {q.isProof ? '📝 Proof/Subjective (NAT Hidden)' : 'Hide NAT'}
                        </label>
                      </>
                    )}
                    {hasOptions && (
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#313244', padding: '6px 12px', borderRadius: '4px' }}>
                        <span style={{ fontSize: '12px', color: '#bac2de', fontWeight: 'bold' }}>Options Layout:</span>
                        <label style={{ fontSize: '12px', color: '#a6e3a1', cursor: isBulkLocked ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input type="radio" disabled={isBulkLocked} checked={!q.optLayout || q.optLayout === 'auto'} onChange={() => updateQ(q.id, 'optLayout', 'auto')} /> Auto
                        </label>
                        <label style={{ fontSize: '12px', color: '#cdd6f4', cursor: isBulkLocked ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input type="radio" disabled={isBulkLocked} checked={q.optLayout === '1col'} onChange={() => updateQ(q.id, 'optLayout', '1col')} /> 1 Column
                        </label>
                        <label style={{ fontSize: '12px', color: '#cdd6f4', cursor: isBulkLocked ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <input type="radio" disabled={isBulkLocked} checked={q.optLayout === '2col'} onChange={() => updateQ(q.id, 'optLayout', '2col')} /> 2 Columns
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                
                <div id={`preview-${q.id}`} className="preview-pane" style={{ paddingLeft: '20px', width: '50%' }}>
                  <div style={{ color: '#a6e3a1', fontWeight: 'bold', marginBottom: '10px' }}>[GATE {q.year} | {q.marks} Mark]</div>
                  <div dangerouslySetInnerHTML={{ __html: q.code && formattedText.includes('[CODE]')
                    ? formattedText.replace('[CODE]', `<div style="background: #181825; padding: 10px; border: 1px solid #45475a; font-family: monospace; white-space: pre-wrap; margin: 10px 0;">${q.code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`)
                    : formattedText
                  }} />
                  
                  {q.code && !formattedText.includes('[CODE]') && <div style={{ background: '#181825', padding: '10px', border: '1px solid #45475a', fontFamily: 'monospace', whiteSpace: 'pre-wrap', margin: '10px 0' }}>{q.code}</div>}
                  
                  <div style={{ marginTop: '15px' }}>
                    {hasOptions ? (() => {
                      const isTwoCol = q.optLayout === '2col' || (q.optLayout !== '1col' && shouldUseTwoCols(q));
                      return (
                        <div style={{
                          display: isTwoCol ? 'grid' : 'block',
                          gridTemplateColumns: isTwoCol ? '1fr 1fr' : 'none',
                          gap: isTwoCol ? '10px 20px' : '0'
                        }}>
                          <div style={{ marginBottom: '8px' }}><strong>(A)</strong> <span style={{ whiteSpace: q.isCodeOptions ? 'pre-wrap' : 'normal', fontFamily: q.isCodeOptions ? 'monospace' : 'inherit', display: q.isCodeOptions ? 'inline-block' : 'inline', verticalAlign: 'top' }} dangerouslySetInnerHTML={{ __html: renderOptionText(q.optA, q.ext, q.isCodeOptions) }} /></div>
                          <div style={{ marginBottom: '8px' }}><strong>(B)</strong> <span style={{ whiteSpace: q.isCodeOptions ? 'pre-wrap' : 'normal', fontFamily: q.isCodeOptions ? 'monospace' : 'inherit', display: q.isCodeOptions ? 'inline-block' : 'inline', verticalAlign: 'top' }} dangerouslySetInnerHTML={{ __html: renderOptionText(q.optB, q.ext, q.isCodeOptions) }} /></div>
                          <div style={{ marginBottom: '8px' }}><strong>(C)</strong> <span style={{ whiteSpace: q.isCodeOptions ? 'pre-wrap' : 'normal', fontFamily: q.isCodeOptions ? 'monospace' : 'inherit', display: q.isCodeOptions ? 'inline-block' : 'inline', verticalAlign: 'top' }} dangerouslySetInnerHTML={{ __html: renderOptionText(q.optC, q.ext, q.isCodeOptions) }} /></div>
                          <div style={{ marginBottom: '8px' }}><strong>(D)</strong> <span style={{ whiteSpace: q.isCodeOptions ? 'pre-wrap' : 'normal', fontFamily: q.isCodeOptions ? 'monospace' : 'inherit', display: q.isCodeOptions ? 'inline-block' : 'inline', verticalAlign: 'top' }} dangerouslySetInnerHTML={{ __html: renderOptionText(q.optD, q.ext, q.isCodeOptions) }} /></div>
                        </div>
                      );
                    })() : !q.isProof ? (
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
        <label style={{ fontSize: '16px' }}>⚡ Bulk Quick Paste (Appends directly to End)</label>
        <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} style={{ minHeight: '120px', marginTop: '10px' }}></textarea>
        <button className="btn-autofill" style={{ marginTop: '15px' }} onClick={parseAllPastedText}>⚡ Extract & Append to End</button>
      </div>
    </div>
  );
}