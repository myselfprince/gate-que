'use client';

import { useState, useEffect, useRef } from 'react';

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
  
  const [syncedCount, setSyncedCount] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [imgCacheBuster, setImgCacheBuster] = useState(Date.now());
  const [imageErrors, setImageErrors] = useState(new Set());
  const [missingFocusIndex, setMissingFocusIndex] = useState(0);
  const [activePasteIndex, setActivePasteIndex] = useState(null);
  const [inlinePasteText, setInlinePasteText] = useState("");
  const [imageTextWidth, setImageTextWidth] = useState(70); // Defaulting to 70% for YT

  // New states for Toast and Auto-Revive
  const [toast, setToast] = useState(null);
  const [isReviving, setIsReviving] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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

  const loadFromMongoDB = async (sub, chap) => {
    setIsReviving(true);
    try {
      const res = await fetch(`/api/chapters?subject=${encodeURIComponent(sub)}&chapter=${encodeURIComponent(chap)}`);
      const data = await res.json();
      if (data.success && data.data && data.data.questions && data.data.questions.length > 0) {
        setQuestions(data.data.questions); 
        setSyncedCount(data.data.questions.length); 
        setIsDirty(false);
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
    loadFromMongoDB(selectedSubject, defaultChapter); // Auto-revive
  };

  const handleChapterChange = (e) => {
    const selectedChapter = e.target.value;
    setChapter(selectedChapter);
    syncPreferences(subject, selectedChapter);
    loadFromMongoDB(subject, selectedChapter); // Auto-revive
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
      localStorage.setItem(draftKey, JSON.stringify({ questions, syncedCount, isDirty }));
    } else {
      localStorage.removeItem(draftKey);
    }
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

      const h2cScript = document.createElement("script");
      h2cScript.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      h2cScript.async = true;
      document.head.appendChild(h2cScript);
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

  const forceRefreshPreview = () => {
    setImgCacheBuster(Date.now());
    setImageErrors(new Set());
    showToast("🔄 Previews refreshed", "info");
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

  const handleJump = (e) => {
    e.preventDefault();
    const jumpValue = jumpInputRef.current?.value;
    if (!jumpValue) return;
    const target = document.getElementById(`question-${jumpValue}`);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
    else showToast(`❌ Question ${jumpValue} not found.`, "error");
    jumpInputRef.current.value = "";
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
      setTimeout(() => { targetEl.children[1].style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)'; }, 1500);
    }
    setMissingFocusIndex(prev => prev + 1);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const getYearOptions = () => { let opts = []; for (let y = 2026; y >= 1990; y--) opts.push(y); return opts; };

  const processExtractedQuestions = (textStr, startIndexOffset = 0) => {
    if (!textStr.trim()) return [];
    
    // Clean double dollar signs and remove blank lines (replace multiple newlines with single newline)
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

  const parseAllPastedText = () => {
    const newQs = processExtractedQuestions(bulkText, 0);
    setQuestions([...questions, ...newQs]);
    setIsDirty(true);
    setBulkText("");
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    showToast(`Parsed ${newQs.length} questions from text!`);
  };

  const handleInlinePaste = (index) => {
    const newQs = processExtractedQuestions(inlinePasteText, index);
    const updated = [...questions];
    updated.splice(index, 0, ...newQs);
    setQuestions(updated);
    setIsDirty(true);
    setInlinePasteText("");
    setActivePasteIndex(null);
    showToast(`Inserted ${newQs.length} questions inline!`);
  };

  // Modified updateQ to enforce $$ -> $ and remove blank lines real-time
  const updateQ = (id, field, value) => { 
    let finalValue = value;
    if (typeof value === 'string' && ['text', 'optA', 'optB', 'optC', 'optD', 'natAnswer'].includes(field)) {
      finalValue = value.replace(/\$\$/g, '$').replace(/\n(?:\s*\n)+/g, '\n');
    }
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: finalValue } : q)); 
    setIsDirty(true); 
  };
  
  const removeQuestion = (id) => { setQuestions(questions.filter(q => q.id !== id)); setIsDirty(true); showToast("Question removed", "info"); };

  const handleOptionPaste = (id, e) => {
    let pastedText = e.clipboardData.getData('text');
    if (pastedText.includes(';')) {
      e.preventDefault(); 
      // Clean before parsing
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

  const saveToMongoDB = async () => {
    if (!confirm(`🚨 DATABASE OVERWRITE CONFIRMATION 🚨\n\nAre you sure you want to SAVE to DB?\n\nThis will permanently overwrite the database for "${subject} - ${chapter}" with the ${questions.length} questions currently on your screen.`)) {
      return;
    }

    try {
      showToast("Saving to DB...", "info");
      const res = await fetch('/api/chapters', {
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

  const handleExportPDF = async () => {
    if (questions.length === 0) return showToast("❌ No questions to compile!", "error");
    showToast("🚀 Compiling LaTeX to PDF...", "info");
    try {
      const response = await fetch('/api/export-pdf', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, chapter, questions })
      });
      if (!response.ok) throw new Error("PDF generation failed.");
      
      const blob = await response.blob(); const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${subject}_${chapter}_PYQs.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      showToast("✅ PDF Exported Successfully!");
    } catch (error) { showToast("❌ Error generating PDF. Make sure you are running locally.", "error"); }
  };

 const cleanLatexForYT = (text) => {
    if (!text) return "";

    // Remove HTML tags but KEEP the content inside them
    let cleaned = text.replace(/<[^>]+>/g, ' ');

    // Remove MathJax delimiters
    cleaned = cleaned.replace(/\$/g, '');
    cleaned = cleaned.replace(/\\\[/g, '');
    cleaned = cleaned.replace(/\\\]/g, '');

    // LaTeX to Windows/YouTube safe keyboard symbols & text
    const map = {
      '\\Rightarrow': ' implies ', '\\Leftarrow': ' is implied by ', '\\Leftrightarrow': ' if and only if ',
      '\\neg': ' not ', '\\vee': ' or ', '\\wedge': ' and ', '\\oplus': ' xor ',
      '\\rightarrow': ' to ', '\\leftarrow': ' from ', '\\ge': ' greater equal ', '\\le': ' less equal ',
      '\\neq': ' != ', '\\approx': ' ~ ', '\\equiv': ' = ', '\\times': ' x ', '\\div': ' div ',
      '\\pm': ' +- ', '\\infty': ' infinity ', '\\forall': ' for all ', '\\exists': ' exists ',
      '\\in ': ' in ', '\\notin ': ' not in ', '\\cup': ' union ', '\\cap': ' intersection ',
      '\\emptyset': ' empty set '
    };

    for (const [key, value] of Object.entries(map)) {
      cleaned = cleaned.replaceAll(key, value);
    }

    // Handle standard math symbols
    cleaned = cleaned.replace(/=>/g, ' implies ');
    cleaned = cleaned.replace(/<=/g, ' less equal ');
    cleaned = cleaned.replace(/<=>/g, ' if and only if ');

    // Remove remaining backslash latex commands (e.g., \frac, \text)
    cleaned = cleaned.replace(/\\[a-zA-Z]+/g, ' ');

    // CRITICAL FIX: Only remove curly braces { }. PRESERVE ( ) and [ ]
    cleaned = cleaned.replace(/[{}]/g, ' ');

    // STRIP ALL Windows & YouTube forbidden characters: < > : " / \ | ? *
    cleaned = cleaned.replace(/[<>:"/\\|?*]/g, ' ');

    return cleaned.replace(/\s+/g, ' ').trim();
  };

  const copyForYouTube = (q, index) => {
    // Clean subject and chapter names by removing prefix numbers
    const cleanSubject = subject.replace(/^\d+\.\s*/, '').trim();
    const cleanChapter = chapter.replace(/^\d+\.\s*/, '').trim();

    // ==========================================
    // 1. ORIGINAL FORMAT (Continuous Manner)
    // ==========================================
    // Using commas instead of hyphens or pipes
    let ytText = `[GATE ${q.year}, ${q.marks} Mark, ${cleanSubject}, ${cleanChapter}]\n\n`;
    ytText += `${cleanLatexForYT(q.text)}\n`;
    
    if (q.code) {
      let safeCode = q.code.replace(/[<>]/g, ' ');
      ytText += `\nCode:\n${safeCode}\n\n`;
    }
    
    if (q.optA || q.optB || q.optC || q.optD) {
      if (q.optA) ytText += `(A) ${cleanLatexForYT(q.optA)}\n`;
      if (q.optB) ytText += `(B) ${cleanLatexForYT(q.optB)}\n`;
      if (q.optC) ytText += `(C) ${cleanLatexForYT(q.optC)}\n`;
      if (q.optD) ytText += `(D) ${cleanLatexForYT(q.optD)}\n\n`;
    } else if (q.natAnswer) {
      ytText += `Answer: ${cleanLatexForYT(q.natAnswer)}\n\n`;
    }

    ytText += `--------------------------------------------------------\n\n`;

    // ==========================================
    // 2. NEW SEO FORMAT (Without Emojis)
    // ==========================================
    // Using commas instead of hyphens or pipes
    ytText += `GATE CSE ${q.year} PYQ, ${cleanSubject}, ${cleanChapter}\n`;
    ytText += `Marks: ${q.marks} Mark\n\n`;

    ytText += `Question:\n${cleanLatexForYT(q.text)}\n\n`;

    if (q.code) {
      let safeCode = q.code.replace(/[<>]/g, ' ');
      ytText += `Code Snippet:\n${safeCode}\n\n`;
    }

    if (q.optA || q.optB || q.optC || q.optD) {
      ytText += `Options:\n`;
      if (q.optA) ytText += `(A) ${cleanLatexForYT(q.optA)}\n`;
      if (q.optB) ytText += `(B) ${cleanLatexForYT(q.optB)}\n`;
      if (q.optC) ytText += `(C) ${cleanLatexForYT(q.optC)}\n`;
      if (q.optD) ytText += `(D) ${cleanLatexForYT(q.optD)}\n\n`;
    } else if (q.natAnswer) {
      ytText += `Answer: ${cleanLatexForYT(q.natAnswer)}\n\n`;
    }

    // SEO Friendly Description Paragraph
    ytText += `Prepare for GATE Computer Science Engineering (CSE) with detailed previous year questions (PYQs). `;
    ytText += `This specific problem belongs to the ${cleanSubject} subject, focusing on the ${cleanChapter} topic.\n\n`;

    // Dynamic SEO Hashtags
    const subjectTag = cleanSubject.replace(/[^a-zA-Z0-9]/g, '');
    const chapterTag = cleanChapter.replace(/[^a-zA-Z0-9]/g, '');
    ytText += `#GATECSE #GATE${q.year} #${subjectTag} #${chapterTag} #GATEPreparation #GATECSEPYQ #ComputerScience #GATEExam`;

    // Copy to clipboard
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
      
      if (optionsList.length > 0) {
        fullText += ' ' + optionsList.join(' ');
      }
      
      const cleanText = fullText.replace(/\s+/g, ' ').trim();
      const cleanSubject = subject.replace(/^\d+\.\s*/, '').trim();
      const cleanChapter = chapter.replace(/^\d+\.\s*/, '').trim();
      
      const videoTitle = `GATE CSE ${q.year} ${cleanSubject} ${cleanText}`.replace(/\s+/g, ' ').trim();
      const timestampTitle = `GATE CSE ${q.year} ${cleanChapter} ${cleanText}`.replace(/\s+/g, ' ').trim();
      
      return {
        index: index + 1,
        year: q.year,
        marks: q.marks,
        subject: cleanSubject,
        chapter: cleanChapter,
        video_title: videoTitle,
        timestamp_title: timestampTitle
      };
    });
    
    const jsonString = JSON.stringify(ytData, null, 4);
    navigator.clipboard.writeText(jsonString).then(() => {
      showToast("▶️ YT Data copied to clipboard & downloaded!");
    }).catch(err => {
      console.error("Clipboard write failed", err);
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
    return optText;
  };

  const handleExportAllImages = async () => {
    if (questions.length === 0) return showToast("❌ No questions to export!", "error");
      showToast("📸 Generating Image ZIP... Please wait.", "info");
      try {
        const baseUrl = window.location.origin;
        const response = await fetch('/api/export-images-zip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // 👇 Update the body to include contentWidth
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
    } catch (error) {
      console.error(error);
      showToast("❌ Error generating Image ZIP.", "error");
    }
  };

  return (
    <div style={{ maxWidth: '98%', margin: 'auto', padding: '20px' }}>

      {/* OVERLAY: Toast Notifications */}
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

      {/* OVERLAY: Auto-Reviving Loader */}
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

        {/* Add this right before the <div> containing the buttons */}
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
          <button className="btn-export" style={{ background: '#cba6f7', color: '#11111b', padding: '10px 15px' }} onClick={handleExportPDF}>🚀 Export Full PDF</button>
          <button className="btn-export" style={{ background: '#a6e3a1', color: '#11111b', padding: '10px 15px' }} onClick={saveToMongoDB}>💾 Save DB</button>
          <button className="btn-export" style={{ background: '#f5c2e7', color: '#11111b', padding: '10px 15px' }} onClick={handleExportYTData}>▶️ Export YT Data</button>
          <button className="btn-export" style={{ background: '#89dceb', color: '#11111b', padding: '10px 15px' }} onClick={handleExportAllImages}>📸 Export All Images (ZIP)</button>
          <button className="btn-clear" style={{ padding: '10px 15px' }} onClick={clearWorkspace}>🗑️ Clear</button>
          
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

      <div id="questions_container">
        {questions.map((q, idx) => {
          const qNum = idx + 1;
          const imageList = q.diagram ? q.diagram.split(',').map(s => s.trim()).filter(Boolean) : [];
          const hasOptions = q.optA || q.optB || q.optC || q.optD;
          
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
            <div key={q.id} id={`question-${qNum}`} style={{ scrollMarginTop: '160px' }}>
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
                  <button className="btn-autofill" style={{ width: 'auto', padding: '4px 12px', fontSize: '12px', background: '#45475a', color: '#cdd6f4' }} onClick={() => setActivePasteIndex(idx)}>⚡ Quick Paste Here</button>
                )}
              </div>
              
              <div className="card question-card" style={{ display: 'flex' }}>
                <div className="half-width">
                  <div className="q-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#a6e3a1', display: 'inline-block' }}>Question {qNum}</h3>
                      <button className="btn-export" style={{ background: '#f9e2af', color: '#11111b', padding: '4px 10px', marginLeft: '10px', fontSize: '12px' }} onClick={() => copyForYouTube(q, idx)}>📋 Copy for YT</button>
                    </div>
                    <button className="btn-clear" style={{ padding: '4px 10px' }} onClick={() => removeQuestion(q.id)}>Remove</button>
                  </div>
                  
                  <label>Question Text</label>
                  <textarea value={q.text} onChange={(e) => updateQ(q.id, 'text', e.target.value)} className="q-text" />
                  
                  <label>Code Snippet</label>
                  <textarea value={q.code} onChange={(e) => updateQ(q.id, 'code', e.target.value)} className="code-text" />
                  
                  <div className="grid-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px' }}>
                    <div><label>Year</label><select value={q.year} onChange={(e) => updateQ(q.id, 'year', e.target.value)}>{getYearOptions().map(y => <option key={y} value={y}>{y}</option>)}</select></div>
                    <div><label>Marks</label><div className="radio-group" style={{ display: 'flex', gap: '5px' }}><input type="radio" checked={q.marks === "1"} onChange={() => updateQ(q.id, 'marks', "1")} /> 1M <input type="radio" checked={q.marks === "2"} onChange={() => updateQ(q.id, 'marks', "2")} style={{ marginLeft: '10px' }} /> 2M</div></div>
                    <div><label>Images</label><div className="input-group" style={{ display: 'flex' }}><input type="text" value={q.diagram} onChange={(e) => updateQ(q.id, 'diagram', e.target.value)} placeholder="e.g. 1a, 1b" style={{ borderRadius: '4px 0 0 4px' }} /><select value={q.ext} onChange={(e) => updateQ(q.id, 'ext', e.target.value)} style={{ width: '60px' }}><option value=".png">.png</option><option value=".jpg">.jpg</option></select></div></div>
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
                    ) : (<div style={{ color: '#f38ba8' }}><strong>NAT Answer:</strong> {q.natAnswer ? q.natAnswer : '_________________'}</div>)}
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