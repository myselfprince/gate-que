"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';

// Helper to generate Gray codes dynamically
const getGrayCodes = (bits) => {
  if (bits === 0) return [''];
  if (bits === 1) return ['0', '1'];
  const prev = getGrayCodes(bits - 1);
  return [...prev.map(c => '0' + c), ...prev.reverse().map(c => '1' + c)];
};

// Configuration for row/col bit sizes
const getMapConfig = (numVars) => {
  switch (numVars) {
    case 2: return { rowBits: 1, colBits: 1 };
    case 3: return { rowBits: 1, colBits: 2 };
    case 4: return { rowBits: 2, colBits: 2 };
    case 5: return { rowBits: 2, colBits: 3 };
    case 6: return { rowBits: 3, colBits: 3 };
    default: return { rowBits: 2, colBits: 2 };
  }
};

// Auto-split the single variable string based on the number of variables
// Preserves whatever casing the user typed
const getLabels = (numVars, varStr) => {
  const v = (varStr + "ABCDEF").substring(0, numVars); 
  switch (numVars) {
    case 2: return { rowLabel: v.slice(0, 1), colLabel: v.slice(1, 2) };
    case 3: return { rowLabel: v.slice(0, 1), colLabel: v.slice(1, 3) };
    case 4: return { rowLabel: v.slice(0, 2), colLabel: v.slice(2, 4) };
    case 5: return { rowLabel: v.slice(0, 2), colLabel: v.slice(2, 5) };
    case 6: return { rowLabel: v.slice(0, 3), colLabel: v.slice(3, 6) };
    default: return { rowLabel: v.slice(0, 2), colLabel: v.slice(2, 4) };
  }
};

const getDefaultVarString = (n) => "ABCDEF".substring(0, n);

export default function KMapPage() {
  const [numVars, setNumVars] = useState(4);
  const [varString, setVarString] = useState("ABCD");
  const [fileName, setFileName] = useState("8");
  const [cellData, setCellData] = useState({});
  const [activeTool, setActiveTool] = useState('cycle'); // 'cycle', '1', '0', 'X', 'erase'
  const [showVarExpr, setShowVarExpr] = useState(false); // Toggle for expressions vs 00/01
  const [toast, setToast] = useState(null);
  const mapRef = useRef(null);

  const config = getMapConfig(numVars);
  const labels = getLabels(numVars, varString);
  const rowCodes = getGrayCodes(config.rowBits);
  const colCodes = getGrayCodes(config.colBits);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Global Keyboard Listener for Paint Tools
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ignore if the user is typing inside an input box
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      const key = e.key.toUpperCase();
      if (key === '1') setActiveTool('1');
      else if (key === '0') setActiveTool('0');
      else if (key === 'X') setActiveTool('X');
      else if (key === 'C') setActiveTool('cycle');
      else if (key === 'E' || key === 'BACKSPACE' || key === 'DELETE') setActiveTool('erase');
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleNumVarsChange = (e) => {
    const newVal = parseInt(e.target.value);
    setNumVars(newVal);
    setVarString(getDefaultVarString(newVal));
    setCellData({});
  };

  const handleCellClick = (rCode, cCode) => {
    const key = `${rCode}-${cCode}`;
    setCellData((prev) => {
      if (activeTool === 'cycle') {
        const current = prev[key] || '';
        let nextState = '1';
        if (current === '1') nextState = '0';
        else if (current === '0') nextState = 'X';
        else if (current === 'X') nextState = '';
        return { ...prev, [key]: nextState };
      } else if (activeTool === 'erase') {
        return { ...prev, [key]: '' };
      } else {
        return { ...prev, [key]: activeTool };
      }
    });
  };

  const handleCellKeyDown = (e, rCode, cCode) => {
    const key = `${rCode}-${cCode}`;
    const val = e.key.toUpperCase();
    
    if (['1', '0', 'X', 'BACKSPACE', 'DELETE'].includes(val)) {
      e.preventDefault(); 
    }

    if (val === '1' || val === '0' || val === 'X') {
      setCellData(prev => ({ ...prev, [key]: val }));
      setActiveTool(val); 
    } else if (val === 'BACKSPACE' || val === 'DELETE') {
      setCellData(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleFillEmptyWithZeros = () => {
    setCellData(prev => {
      const newData = { ...prev };
      let filledCount = 0;
      rowCodes.forEach(r => {
        colCodes.forEach(c => {
          const key = `${r}-${c}`;
          if (!newData[key]) {
            newData[key] = '0';
            filledCount++;
          }
        });
      });
      
      if (filledCount > 0) {
        showToast(`Filled ${filledCount} empty boxes with 0`, "info");
      } else {
        showToast("No empty boxes left to fill", "info");
      }
      return newData;
    });
  };

  const handleClear = () => {
    setCellData({});
    showToast("Grid cleared", "info");
  };

  const handleDownload = async () => {
    if (!mapRef.current) return;

    const defaultName = `KMap_${numVars}Var`;
    let requestedName = window.prompt("Enter a name for your K-Map image:", fileName || defaultName);

    if (requestedName === null) return; 

    let finalName = requestedName.trim() || defaultName;
    if (!finalName.toLowerCase().endsWith('.png')) {
      finalName += '.png';
    }
    
    if (document.activeElement) document.activeElement.blur();

    showToast("Generating high-res PNG...", "info");
    
    try {
      const canvas = await html2canvas(mapRef.current, {
        scale: 3, 
        backgroundColor: '#ffffff',
        logging: false,
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = finalName;
      link.click();
      showToast(`✅ Downloaded as ${finalName}`);
    } catch (error) {
      console.error("Export Error:", error);
      showToast("❌ Failed to download image", "error");
    }
  };

  // Helper function to render expressions vs binary codes
  const renderHeader = (code, vars) => {
    if (!showVarExpr) return code;
    return (
      <div style={{ display: 'flex' }}>
        {code.split('').map((bit, i) => {
          const v = vars[i] || '';
          return (
            <span 
              key={i} 
              style={{ 
                textDecoration: bit === '0' ? 'overline' : 'none',
                // Adjust margin slightly if you want them tightly grouped or slightly spaced
                marginRight: '1px' 
              }}
            >
              {v}
            </span>
          );
        })}
      </div>
    );
  };

  const CELL_SIZE = 75; 
  const HEADER_W = 60;
  const HEADER_H = 50;

  const getToolBtnStyle = (toolName) => ({
    padding: '6px 12px',
    borderRadius: '4px',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    transition: '0.2s',
    background: activeTool === toolName ? '#cba6f7' : 'transparent',
    color: activeTool === toolName ? '#11111b' : '#bac2de',
  });

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px', color: '#cdd6f4', fontFamily: 'sans-serif' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '30px', right: '30px',
          background: toast.type === 'error' ? '#f38ba8' : toast.type === 'info' ? '#89b4fa' : '#a6e3a1',
          color: '#11111b', padding: '15px 25px', borderRadius: '8px', zIndex: 9999, fontWeight: 'bold',
          boxShadow: '0 8px 15px rgba(0,0,0,0.5)', transition: 'all 0.3s ease-in-out'
        }}>
          {toast.message}
        </div>
      )}

      {/* Control Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #89b4fa', paddingBottom: '15px', marginBottom: '30px' }}>
        <h1 style={{ color: '#89b4fa', margin: 0 }}>📐 LaTeX-Style K-Map Generator</h1>
        <Link href="/" style={{ background: '#45475a', color: '#cdd6f4', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          ⬅ Back to Editor
        </Link>
      </div>

      {/* Main Configuration Toolbar */}
      <div style={{ background: '#1e1e2e', padding: '20px', borderRadius: '10px', display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)', flexWrap: 'wrap' }}>
        
        {/* Variable Count Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontWeight: 'bold', color: '#bac2de' }}>Variables:</label>
          <select 
            value={numVars} 
            onChange={handleNumVarsChange}
            style={{ padding: '8px 12px', borderRadius: '4px', background: '#11111b', color: '#cdd6f4', border: '1px solid #45475a', outline: 'none', cursor: 'pointer' }}
          >
            {[2, 3, 4, 5, 6].map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Single String Variables Editor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', borderLeft: '1px solid #45475a', paddingLeft: '20px' }}>
          <label style={{ fontWeight: 'bold', color: '#bac2de', marginRight: '5px' }}>Vars:</label>
          <input
            type="text"
            maxLength={numVars}
            value={varString}
            // Only alphanumeric allowed, but casing is preserved
            onChange={(e) => setVarString(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
            placeholder={getDefaultVarString(numVars)}
            style={{ 
              width: '80px', 
              padding: '8px', 
              textAlign: 'center', 
              borderRadius: '4px', 
              background: '#11111b', 
              color: '#a6e3a1', 
              border: '1px solid #45475a', 
              outline: 'none',
              fontWeight: 'bold',
              letterSpacing: '2px'
            }}
          />
        </div>

        {/* Toggle for Expressions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: 'auto', borderLeft: '1px solid #45475a', paddingLeft: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#bac2de', userSelect: 'none' }}>
            <input 
              type="checkbox" 
              checked={showVarExpr} 
              onChange={(e) => setShowVarExpr(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            Show Variable Expressions
          </label>
        </div>

        {/* Filename Editor */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', borderLeft: '1px solid #45475a', paddingLeft: '20px' }}>
          <label style={{ fontWeight: 'bold', color: '#bac2de', marginRight: '5px' }}>Default Name:</label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            style={{ 
              width: '80px', 
              padding: '8px', 
              borderRadius: '4px', 
              background: '#11111b', 
              color: '#cdd6f4', 
              border: '1px solid #45475a', 
              outline: 'none',
            }}
          />
        </div>
        
        {/* Action Buttons */}
        <button onClick={handleFillEmptyWithZeros} style={{ background: '#89dceb', color: '#11111b', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }} title="Fill all empty boxes with 0">
          0️⃣ Fill Empty with 0
        </button>

        <button onClick={handleClear} style={{ background: '#f38ba8', color: '#11111b', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          🗑️ Clear
        </button>
        
        <button onClick={handleDownload} style={{ background: '#a6e3a1', color: '#11111b', padding: '8px 16px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          📸 Download PNG
        </button>
      </div>

      {/* Tool Selection Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div style={{ background: '#181825', border: '1px solid #45475a', padding: '6px', borderRadius: '8px', display: 'flex', gap: '5px', alignItems: 'center' }}>
          <span style={{ color: '#6c7086', fontWeight: 'bold', fontSize: '14px', marginRight: '10px', marginLeft: '5px' }}>Active Paint Tool:</span>
          <button onClick={() => setActiveTool('cycle')} style={getToolBtnStyle('cycle')} title="Press 'C' - Click to cycle 1 -> 0 -> X">🔄 Cycle (C)</button>
          <div style={{ width: '1px', height: '20px', background: '#45475a', margin: '0 5px' }}></div>
          <button onClick={() => setActiveTool('1')} style={getToolBtnStyle('1')} title="Press '1'">🖌️ Paint 1</button>
          <button onClick={() => setActiveTool('0')} style={getToolBtnStyle('0')} title="Press '0'">🖌️ Paint 0</button>
          <button onClick={() => setActiveTool('X')} style={getToolBtnStyle('X')} title="Press 'X'">🖌️ Paint X</button>
          <div style={{ width: '1px', height: '20px', background: '#45475a', margin: '0 5px' }}></div>
          <button onClick={() => setActiveTool('erase')} style={getToolBtnStyle('erase')} title="Press 'E' or Backspace">🧽 Erase (E)</button>
        </div>
      </div>

      {/* The Export Wrapper - Forced pure white background */}
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', background: '#181825', borderRadius: '10px', overflowX: 'auto' }}>
        
        <div 
          ref={mapRef} 
          style={{ 
            backgroundColor: '#ffffff', 
            padding: '40px', 
            display: 'inline-block',
            fontFamily: '"Times New Roman", Times, serif', 
            color: '#000000'
          }}
        >
          <div style={{ display: 'flex' }}>
            
            {/* Left Column: Top-Left Diagonal Box + Row Headers */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              
              {/* Top-Left Diagonal Cell */}
              <div style={{ width: `${HEADER_W}px`, height: `${HEADER_H}px`, position: 'relative' }}>
                <svg width="100%" height="100%" style={{ position: 'absolute', overflow: 'visible' }}>
                  <line x1={HEADER_W} y1={HEADER_H} x2={10} y2={10} stroke="black" strokeWidth="1.5" />
                </svg>
                <div style={{ position: 'absolute', bottom: '-5px', left: '0px', color: '#008000', fontWeight: 'bold', fontSize: '20px' }}>
                  {labels.rowLabel}
                </div>
                <div style={{ position: 'absolute', top: '-5px', right: '-15px', color: '#008000', fontWeight: 'bold', fontSize: '20px' }}>
                  {labels.colLabel}
                </div>
              </div>

              {/* Floating Row Headers */}
              {rowCodes.map(r => (
                <div key={r} style={{ width: `${HEADER_W}px`, height: `${CELL_SIZE}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '22px' }}>
                  {renderHeader(r, labels.rowLabel)}
                </div>
              ))}
            </div>

            {/* Right Column: Column Headers + Main Grid */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              
              {/* Floating Column Headers */}
              <div style={{ display: 'flex', height: `${HEADER_H}px` }}>
                {colCodes.map(c => (
                  <div key={c} style={{ width: `${CELL_SIZE}px`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '10px', fontWeight: 'bold', fontSize: '22px' }}>
                    {renderHeader(c, labels.colLabel)}
                  </div>
                ))}
              </div>

              {/* Main Grid */}
              <div style={{ 
                borderTop: '1.5px solid black', 
                borderLeft: '1.5px solid black', 
                display: 'inline-flex', 
                flexDirection: 'column' 
              }}>
                {rowCodes.map(r => (
                  <div key={r} style={{ display: 'flex' }}>
                    {colCodes.map(c => {
                      const key = `${r}-${c}`;
                      const val = cellData[key] || '';
                      return (
                        <div
                          key={c}
                          tabIndex={0}
                          onClick={() => handleCellClick(r, c)}
                          onKeyDown={(e) => handleCellKeyDown(e, r, c)}
                          style={{
                            width: `${CELL_SIZE}px`, 
                            height: `${CELL_SIZE}px`,
                            borderRight: '1.5px solid black', 
                            borderBottom: '1.5px solid black',
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '42px', 
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            userSelect: 'none',
                            outlineColor: '#89b4fa' 
                          }}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}