"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [bulkText, setBulkText] = useState("");
  const [subject, setSubject] = useState("digital-logic");
  const [chapter, setChapter] = useState("chapter-1");
  const [availableChapters, setAvailableChapters] = useState([]);

  // Load MathJax Script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js";
    script.async = true;
    document.head.appendChild(script);

    window.MathJax = {
      tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']]
      },
      startup: { typeset: false }
    };
  }, []);

  useEffect(() => {
    fetch('/api/chapters')
      .then(async res => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(`API Error ${res.status}: ${text}`);
        }
        return res.json();
      })
      .then(data => {
        if (data && data.success) setAvailableChapters(data.data);
      })
      .catch(err => {
        console.error("Failed to load chapters on startup:", err);
      });
  }, []);

  useEffect(() => {
    if (window.MathJax && window.MathJax.typesetPromise) {
      window.MathJax.typesetPromise().catch((err) => console.log(err));
    }
  }, [questions, subject, chapter]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getYearOptions = () => {
    let opts = [];
    for (let y = 2026; y >= 1990; y--) opts.push(y);
    return opts;
  };

  // --- PARSER LOGIC ---
  const parseAllPastedText = () => {
    if (!bulkText.trim()) return;
    let parts = bulkText.split(/QUESTION:\s*/i);
    let newQuestions = [];

    parts.forEach(part => {
      if (!part.trim()) return;

      let qText = part;
      let codeText = "";
      let optionsText = "";

      let optMatch = qText.match(/OPTIONS:\s*(.*)/is);
      if (optMatch) {
        optionsText = optMatch[1].trim();
        qText = qText.replace(/OPTIONS:\s*(.*)/is, '').trim();
      }

      let codeMatch = qText.match(/CODE:\s*(.*)/is);
      if (codeMatch) {
        codeText = codeMatch[1].trim();
        qText = qText.replace(/CODE:\s*(.*)/is, '').trim();
      }

      qText = qText.replace(/^([Q]?[\d\.]+)\s*/i, '');

      const metaRegex = /\[\s*(\d{4})[^:]*:\s*(\d+)\s*M\s*\]/i;
      const metaMatch = qText.match(metaRegex);
      let year = "2026";
      let marks = "1";
      if (metaMatch) {
        year = metaMatch[1];
        marks = metaMatch[2];
        qText = qText.replace(metaMatch[0], '').trim();
      }

      let hasDiagram = qText.includes('[DIAGRAM_PLACEHOLDER]') || qText.includes('[IMG_1]');
      
      let rawOptionsArray = optionsText.split(';');
      let optA = rawOptionsArray[0] ? rawOptionsArray[0].trim() : "";
      let optB = rawOptionsArray[1] ? rawOptionsArray[1].trim() : "";
      let optC = rawOptionsArray[2] ? rawOptionsArray[2].trim() : "";
      let optD = rawOptionsArray[3] ? rawOptionsArray[3].trim() : "";

      newQuestions.push({
        id: generateId(),
        text: qText.trim(),
        code: codeText,
        year,
        marks,
        diagram: hasDiagram ? "auto" : "", 
        ext: ".png",
        optA, optB, optC, optD,
        natAnswer: "" 
      });
    });

    newQuestions = newQuestions.map((q, idx) => ({
      ...q,
      diagram: q.diagram === "auto" ? (questions.length + idx + 1).toString() : q.diagram
    }));

    setQuestions([...questions, ...newQuestions]);
    setBulkText("");
    
    // Auto-scroll to the bottom after pasting so you can see the new questions
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  // --- CRUD OPERATIONS ---
  const updateQ = (id, field, value) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const insertQuestionAt = (index) => {
    const newQ = { id: generateId(), text: "", code: "", year: "2026", marks: "1", diagram: "", ext: ".png", optA: "", optB: "", optC: "", optD: "", natAnswer: "" };
    const updated = [...questions];
    updated.splice(index, 0, newQ);
    setQuestions(updated);
  };

  const handleOptionPaste = (id, e) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.includes(';')) {
      e.preventDefault();
      const parts = pastedText.split(';');
      setQuestions(questions.map(q => {
        if (q.id === id) {
          return {
            ...q,
            optA: parts[0]?.trim() || "",
            optB: parts[1]?.trim() || "",
            optC: parts[2]?.trim() || "",
            optD: parts[3]?.trim() || "",
            natAnswer: ""
          };
        }
        return q;
      }));
    }
  };

  // --- DATABASE, FILE HANDLING & EXPORT ---
  const saveToMongoDB = async () => {
    if (questions.length === 0) return alert("No questions to save!");
    try {
      const res = await fetch('/api/chapters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, chapter, questions })
      });
      const data = await res.json();
      if (data.success) {
        alert(`${questions.length} questions saved to MongoDB (${subject} -> ${chapter})!`);
        const fetchRes = await fetch('/api/chapters');
        const fetchInfo = await fetchRes.json();
        if (fetchInfo.success) setAvailableChapters(fetchInfo.data);
      } else {
         alert("Error saving to DB: " + data.error);
      }
    } catch (error) {
      alert("Error connecting to database");
    }
  };

  const loadFromMongoDB = async () => {
    try {
      const res = await fetch(`/api/chapters?subject=${subject}&chapter=${chapter}`);
      const data = await res.json();
      if (data.success && data.data) {
        setQuestions(data.data.questions);
        alert(`Loaded ${data.data.questions.length} questions from DB!`);
      } else {
        alert("No saved data found for this subject and chapter.");
      }
    } catch (error) {
      alert("Error loading from DB");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedQuestions = JSON.parse(event.target.result);
        const sanitizedQuestions = importedQuestions.map((q) => ({
          ...q,
          id: q.id || generateId(),
          optA: q.options?.A || q.optA || "",
          optB: q.options?.B || q.optB || "",
          optC: q.options?.C || q.optC || "",
          optD: q.options?.D || q.optD || "",
          natAnswer: q.nat_answer || q.natAnswer || "",
          diagram: q.diagram_path ? q.diagram_path.replace('images/','').split('.')[0] : (q.diagram || ""),
          ext: q.diagram_path ? '.' + q.diagram_path.split('.').pop() : (q.ext || ".png"),
          text: q.question_text || q.text || "",
          code: q.code_snippet || q.code || "",
          year: q.gate_year || q.year || "2026",
          marks: q.marks || "1"
        }));
        setQuestions(sanitizedQuestions);
        alert(`Successfully imported ${sanitizedQuestions.length} questions!`);
      } catch (err) {
        alert("Error reading JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  // The missing JSON Export Function for the Python Script
  const exportToJSON = () => {
    if (questions.length === 0) {
        alert("No questions to export!");
        return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 4));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "gate_pyq_bulk_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const clearWorkspace = () => {
    if (confirm("Clear screen? (Make sure you saved to DB first!)")) {
      setQuestions([]);
    }
  };

  // --- RENDERING HELPERS ---
  const renderOptionText = (optText, ext) => {
    if (!optText) return null;
    if (optText.startsWith('IMG:')) {
      const imgName = optText.replace('IMG:', '').trim();
      const imgUrl = `/${subject}/${chapter}/${imgName}${ext}`;
      return `<img src="${imgUrl}" alt="Opt Image" style="max-height:60px; vertical-align:middle; border:1px solid #45475a; border-radius:4px; margin-left:10px;"/>`;
    }
    return optText;
  };

  return (
    <div style={{ maxWidth: '98%', margin: 'auto', padding: '20px' }}>
      
      {/* HEADER / NAVIGATION */}
      <div className="card" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', padding: '15px' }}>
        <div style={{ flex: 1 }}>
          <label>Subject Folder Name</label>
          <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. digital-logic" />
        </div>
        <div style={{ flex: 1 }}>
          <label>Chapter Folder Name</label>
          <input type="text" value={chapter} onChange={e => setChapter(e.target.value)} placeholder="e.g. chapter-1" />
        </div>
        
        {/* ACTION BUTTONS (Added Export Button Here) */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '25px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-autofill" onClick={loadFromMongoDB}>📥 Revive</button>
          <button className="btn-export" style={{ background: '#a6e3a1', color: '#11111b' }} onClick={saveToMongoDB}>💾 Save DB</button>
          
          <label style={{ margin: 0, cursor: 'pointer', background: '#89b4fa', color: '#11111b', padding: '12px 20px', borderRadius: '4px', fontWeight: 'bold' }}>
            📂 Import
            <input type="file" accept=".json" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          
          {/* THE RETURN OF THE EXPORT BUTTON */}
          <button className="btn-export" style={{ background: '#f9e2af', color: '#11111b' }} onClick={exportToJSON}>
            📤 Export JSON (For Python)
          </button>

          <button className="btn-clear" onClick={clearWorkspace}>🗑️ Clear</button>
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
            const imgTag = `<div style="border:1px dashed #74c7ec; padding:10px; text-align:center; margin: 10px 0;">
                              <img src="${imgPath}" alt="Missing in Public folder" style="max-width:100%; max-height:200px;"/>
                              <br/><small style="color:#74c7ec">${imgPath}</small>
                            </div>`;
            
            if (formattedText.includes(`[IMG_${i+1}]`)) {
              formattedText = formattedText.replace(`[IMG_${i+1}]`, imgTag);
            } else if (i === 0 && formattedText.includes('[DIAGRAM_PLACEHOLDER]')) {
              formattedText = formattedText.replace('[DIAGRAM_PLACEHOLDER]', imgTag);
            } else {
              formattedText += imgTag; 
            }
          });

          return (
            <div key={q.id}>
              <div style={{ textAlign: 'center', margin: '-10px 0 10px 0' }}>
                <button className="btn-autofill" style={{ width: 'auto', padding: '4px 12px', fontSize: '12px', background: '#45475a', color: '#cdd6f4' }} onClick={() => insertQuestionAt(idx)}>
                  + Insert Question Here
                </button>
              </div>

              <div className="card question-card" style={{ display: 'flex' }}>
                {/* LEFT EDITOR */}
                <div className="half-width">
                  <div className="q-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3 style={{ margin: 0, color: '#a6e3a1' }}>Question {qNum}</h3>
                    <button className="btn-clear" style={{ padding: '4px 10px' }} onClick={() => removeQuestion(q.id)}>Remove</button>
                  </div>

                  <label>Question Text (Use [IMG_1], [IMG_2] to position multiple images)</label>
                  <textarea value={q.text} onChange={(e) => updateQ(q.id, 'text', e.target.value)} className="q-text" />

                  <label>Code Snippet (Optional)</label>
                  <textarea value={q.code} onChange={(e) => updateQ(q.id, 'code', e.target.value)} className="code-text" />

                  <div className="grid-meta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '10px' }}>
                    <div>
                      <label>GATE Year</label>
                      <select value={q.year} onChange={(e) => updateQ(q.id, 'year', e.target.value)}>
                        {getYearOptions().map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label>Marks</label>
                      <div className="radio-group" style={{ display: 'flex', gap: '5px' }}>
                        <input type="radio" checked={q.marks === "1"} onChange={() => updateQ(q.id, 'marks', "1")} /> 1M
                        <input type="radio" checked={q.marks === "2"} onChange={() => updateQ(q.id, 'marks', "2")} style={{ marginLeft: '10px'}}/> 2M
                      </div>
                    </div>
                    <div>
                      <label>Images (Comma Separated)</label>
                      <div className="input-group" style={{ display: 'flex' }}>
                        <span style={{ fontSize: '12px', padding: '10px 5px' }}>/{chapter}/</span>
                        <input type="text" value={q.diagram} onChange={(e) => updateQ(q.id, 'diagram', e.target.value)} placeholder="e.g. 1a, 1b" />
                        <select value={q.ext} onChange={(e) => updateQ(q.id, 'ext', e.target.value)} style={{ width: '60px' }}>
                          <option value=".png">.png</option>
                          <option value=".jpg">.jpg</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <label style={{ color: '#f5c2e7' }}>Options (Paste A;B;C;D in Box A. For images, type IMG:filename. Leave blank for NAT)</label>
                  <div className="grid-opts" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <input type="text" value={q.optA} onPaste={(e) => handleOptionPaste(q.id, e)} onChange={(e) => updateQ(q.id, 'optA', e.target.value)} placeholder="Option A" />
                    <input type="text" value={q.optB} onChange={(e) => updateQ(q.id, 'optB', e.target.value)} placeholder="Option B" />
                    <input type="text" value={q.optC} onChange={(e) => updateQ(q.id, 'optC', e.target.value)} placeholder="Option C" />
                    <input type="text" value={q.optD} onChange={(e) => updateQ(q.id, 'optD', e.target.value)} placeholder="Option D" />
                  </div>

                  {!hasOptions && (
                    <div style={{ marginTop: '10px' }}>
                      <input type="text" value={q.natAnswer || ""} onChange={(e) => updateQ(q.id, 'natAnswer', e.target.value)} placeholder="NAT Answer (Evaluated because Options are blank)" style={{ border: '1px solid #f38ba8' }} />
                    </div>
                  )}
                </div>

                {/* RIGHT PREVIEW */}
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
                    ) : (
                      <div style={{ color: '#f38ba8' }}>
                        <strong>NAT Answer:</strong> {q.natAnswer ? q.natAnswer : '_________________'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK PASTE (MOVED TO THE BOTTOM) */}
      <div className="card" id="paste_section" style={{ marginTop: '20px', border: '2px solid #89b4fa' }}>
        <label style={{ fontSize: '16px' }}>⚡ Quick Paste & Auto-Fill (Paste ALL new questions here)</label>
        <textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} style={{ minHeight: '120px', marginTop: '10px' }} placeholder="Paste raw AI output here..."></textarea>
        <button className="btn-autofill" style={{ marginTop: '15px' }} onClick={parseAllPastedText}>⚡ Extract & Append Questions</button>
      </div>

    </div>
  );
}