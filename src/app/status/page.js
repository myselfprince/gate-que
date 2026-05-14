"use client";

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

// Optional: Pre-fill the targets you provided so you don't have to type them manually
const INITIAL_TARGETS = {
  "1. Discrete Maths|1. Mathematical Logic": 59,
  "1. Discrete Maths|2. Set Theory and Algebra": 100,
  "1. Discrete Maths|3. Combinatorics": 42,
  "1. Discrete Maths|4. Graph Theory": 65,
};

export default function StatusPage() {
  const [actualCounts, setActualCounts] = useState({});
  const [targetCounts, setTargetCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (data.success) {
        setActualCounts(data.actualCounts || {});
        // Merge DB targets with our hardcoded initials if DB is empty for that chapter
        const mergedTargets = { ...INITIAL_TARGETS, ...data.targetCounts };
        setTargetCounts(mergedTargets);
      }
    } catch (error) {
      showToast("❌ Error loading status data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTargetChange = (subject, chapter, value) => {
    const key = `${subject}|${chapter}`;
    setTargetCounts(prev => ({ ...prev, [key]: value }));
  };

  const saveTarget = async (subject, chapter) => {
    const key = `${subject}|${chapter}`;
    const count = targetCounts[key] || 0;
    
    try {
      const res = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, chapter, targetCount: count })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ Target saved for ${chapter}`);
      } else {
        showToast("❌ Failed to save target", "error");
      }
    } catch (error) {
      showToast("❌ Network error saving target", "error");
    }
  };

  if (loading) {
    return <div style={{ color: '#a6e3a1', padding: '50px', textAlign: 'center', fontSize: '24px' }}>Loading DB Status...</div>;
  }

  let grandTotalTarget = 0;
  let grandTotalAdded = 0;

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px', color: '#cdd6f4', fontFamily: 'sans-serif' }}>
      
      {toast && (
        <div style={{
          position: 'fixed', bottom: '30px', right: '30px',
          background: toast.type === 'error' ? '#f38ba8' : '#a6e3a1',
          color: '#11111b', padding: '15px 25px', borderRadius: '8px',
          zIndex: 9999, fontWeight: 'bold', boxShadow: '0 8px 15px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease-in-out'
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #89b4fa', paddingBottom: '15px', marginBottom: '30px' }}>
        <h1 style={{ color: '#89b4fa', margin: 0 }}>📊 Database Progress Tracker</h1>
        <Link href="/" style={{ background: '#45475a', color: '#cdd6f4', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          ⬅ Back to Editor
        </Link>
      </div>

      {Object.entries(GATE_SYLLABUS).map(([subject, chapters]) => {
        let subjectTotalTarget = 0;
        let subjectTotalAdded = 0;

        const chapterRows = chapters.map(chapter => {
          const key = `${subject}|${chapter}`;
          const target = parseInt(targetCounts[key]) || 0;
          const added = actualCounts[key] || 0;
          const remaining = target > 0 ? target - added : 0;
          
          subjectTotalTarget += target;
          subjectTotalAdded += added;

          let statusText = "";
          let statusColor = "";

          if (added === 0) {
            statusText = "Not added yet";
            statusColor = "#f38ba8"; // Red
          } else if (added >= target && target > 0) {
            statusText = "Completed 🎉";
            statusColor = "#a6e3a1"; // Green
          } else {
            statusText = "In Progress";
            statusColor = "#f9e2af"; // Yellow
          }

          return (
            <tr key={chapter} style={{ borderBottom: '1px solid #313244', background: '#181825' }}>
              <td style={{ padding: '12px', fontWeight: 'bold', color: '#bac2de' }}>{chapter}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <input 
                  type="number" 
                  min="0"
                  value={targetCounts[key] || ''} 
                  onChange={(e) => handleTargetChange(subject, chapter, e.target.value)}
                  onBlur={() => saveTarget(subject, chapter)}
                  placeholder="0"
                  style={{ width: '70px', padding: '6px', background: '#11111b', color: '#cdd6f4', border: '1px solid #45475a', borderRadius: '4px', textAlign: 'center' }}
                />
              </td>
              <td style={{ padding: '12px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold', color: added > 0 ? '#89b4fa' : '#6c7086' }}>
                {added}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#cba6f7' }}>
                {remaining > 0 ? remaining : 0}
              </td>
              <td style={{ padding: '12px', textAlign: 'center', color: statusColor, fontWeight: 'bold' }}>
                {statusText}
              </td>
            </tr>
          );
        });

        grandTotalTarget += subjectTotalTarget;
        grandTotalAdded += subjectTotalAdded;

        return (
          <div key={subject} style={{ background: '#1e1e2e', borderRadius: '10px', padding: '20px', marginBottom: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
            <h2 style={{ color: '#f5c2e7', marginTop: 0, display: 'flex', justifyContent: 'space-between' }}>
              <span>{subject}</span>
              <span style={{ fontSize: '18px', color: '#a6adc8' }}>
                {subjectTotalAdded} / {subjectTotalTarget} Added
              </span>
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
              <thead>
                <tr style={{ background: '#313244', color: '#cdd6f4', textAlign: 'left' }}>
                  <th style={{ padding: '12px', borderRadius: '6px 0 0 0' }}>Chapter</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Total Qs (Target)</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Added to DB</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Left</th>
                  <th style={{ padding: '12px', textAlign: 'center', borderRadius: '0 6px 0 0' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {chapterRows}
              </tbody>
            </table>
          </div>
        );
      })}

      <div style={{ position: 'sticky', bottom: '20px', background: '#313244', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.8)', border: '2px solid #a6e3a1' }}>
        <h2 style={{ margin: 0, color: '#cdd6f4' }}>Grand Total Progress:</h2>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#a6e3a1' }}>
          {grandTotalAdded} / {grandTotalTarget} Questions Synced
        </div>
      </div>

    </div>
  );
}