'use client';

import { memo, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { GRID, SYMBOLS, MATH_SYMBOLS, clone, contentBounds, createEdge, createNode, duplicateItems, edgeGeometry, emptyDiagram, isState, nodeBounds, nodePorts, portPosition, removeItems, resizeNode, snap, uid, validateDiagram } from '@/lib/diagram-model.mjs';
import { diagramPalette, edgeSvg, nodeSvg } from '@/lib/diagram-svg.mjs';
import { exportDiagram } from '@/lib/diagram-export.mjs';
import { DIAGRAM_TEMPLATES, makeTemplate } from '@/lib/diagram-templates.mjs';
import DiagramInspector from './DiagramInspector';
import styles from './diagram.module.css';
const STORAGE_KEY = 'gate-diagram-current-v1',
  LIBRARY_KEY = 'gate-diagram-library-v1';
const TOOLS = [['select', '↖', 'Select', 'V'], ['connect', '⌁', 'Connect', 'C'], ['hand', '✥', 'Pan', 'H'], ['pen', '✎', 'Draw', 'P'], ['rectangle', '▭', 'Box', 'R'], ['ellipse', '○', 'Ellipse', 'O'], ['line', '╱', 'Line', 'L'], ['arrow', '↗', 'Arrow', 'A'], ['text', 'T', 'Text', 'T'], ['erase', '⌫', 'Erase', 'E']];
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const typing = target => ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target?.tagName) || target?.isContentEditable;
const NodeArtwork = memo(function NodeArtwork({ node, theme }) {
  return <g dangerouslySetInnerHTML={{ __html: nodeSvg(node, diagramPalette(theme)) }} />;
});
export default function DiagramEditor() {
  const [project, setProject] = useState(() => emptyDiagram());
  const projectRef = useRef(project),
    undoRef = useRef([]),
    redoRef = useRef([]),
    dragRef = useRef(null),
    clipboardRef = useRef(null),
    spaceRef = useRef(false),
    fileRef = useRef(null),
    toastTimer = useRef(null),
    svgRef = useRef(null),
    canvasRef = useRef(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const [historyCounts, setHistoryCounts] = useState({
    undo: 0,
    redo: 0
  });
  const [selected, setSelected] = useState([]),
    [tool, setTool] = useState('select'),
    [snapping, setSnapping] = useState(true),
    [showGrid, setShowGrid] = useState(true);
  const [view, setView] = useState({
      x: -80,
      y: -60,
      zoom: .65
    }),
    [size, setSize] = useState({
      width: 900,
      height: 650
    });
  const [libraryTab, setLibraryTab] = useState('symbols'),
    [query, setQuery] = useState(''),
    [category, setCategory] = useState('All');
  const [connection, setConnection] = useState(null),
    [pointer, setPointer] = useState({
      x: 0,
      y: 0
    }),
    [marquee, setMarquee] = useState(null);
  const [ready, setReady] = useState(false),
    [saveStatus, setSaveStatus] = useState('Restoring browser draft…'),
    [projects, setProjects] = useState([]),
    [toast, setToast] = useState('');
  const [modal, setModal] = useState(null),
    [exportOptions, setExportOptions] = useState({
      crop: true,
      background: 'theme',
      scale: 2
    }),
    [exportBusy, setExportBusy] = useState(false);
  const [showLibrary, setShowLibrary] = useState(true),
    [showProperties, setShowProperties] = useState(true),
    [penColor, setPenColor] = useState('#315fd1'),
    [penWidth, setPenWidth] = useState(3);
  const palette = diagramPalette(project.theme);
  function notify(message) {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 4000);
  }
  function syncHistory() {
    setHistoryVersion(value => value + 1);
    setHistoryCounts({
      undo: undoRef.current.length,
      redo: redoRef.current.length
    });
  }
  function stage(next) {
    projectRef.current = next;
    setProject(next);
    setSaveStatus('Saving browser draft…');
  }
  function remember(previous) {
    undoRef.current = [...undoRef.current, clone(previous)].slice(-60);
    redoRef.current = [];
    syncHistory();
  }
  function apply(next) {
    remember(projectRef.current);
    stage(next);
  }
  function updateProject(patch) {
    apply({
      ...projectRef.current,
      ...patch
    });
  }
  function undo() {
    const previous = undoRef.current.pop();
    if (!previous) return;
    redoRef.current.push(clone(projectRef.current));
    stage(previous);
    setSelected([]);
    setConnection(null);
    syncHistory();
  }
  function redo() {
    const next = redoRef.current.pop();
    if (!next) return;
    undoRef.current.push(clone(projectRef.current));
    stage(next);
    setSelected([]);
    setConnection(null);
    syncHistory();
  }
  function fit(doc = projectRef.current) {
    const bounds = doc.nodes.length ? contentBounds(doc, 70) : {
      x: 0,
      y: 0,
      width: doc.width,
      height: doc.height
    };
    const rect = canvasRef.current?.getBoundingClientRect() || {
      width: 900,
      height: 650
    };
    const zoom = clamp(Math.min((rect.width - 40) / bounds.width, (rect.height - 40) / bounds.height), .08, 3);
    setView({
      x: bounds.x + (bounds.width - rect.width / zoom) / 2,
      y: bounds.y + (bounds.height - rect.height / zoom) / 2,
      zoom
    });
  }
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const transfer = new URLSearchParams(window.location.search).get('import') === 'kmap' ? sessionStorage.getItem('gate-diagram-transfer') : null;
        const saved = transfer || localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const doc = validateDiagram(JSON.parse(saved));
          stage(doc);
          fit(doc);
          if (transfer) sessionStorage.removeItem('gate-diagram-transfer');
        }
        const library = JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]');
        if (Array.isArray(library)) setProjects(library);
      } catch {
        notify('Saved diagram could not be restored. You can import a project JSON backup.');
      }
      setReady(true);
    }, 0);
    return () => {
      clearTimeout(timer);
      clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
        setSaveStatus('Saved in this browser');
      } catch {
        setSaveStatus('Browser storage full · download JSON to save');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [project, ready]);
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      const rect = entries[0].contentRect;
      setSize({
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height)
      });
    });
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const wheel = event => {
      event.preventDefault();
      const rect = svg.getBoundingClientRect(),
        x = event.clientX - rect.left,
        y = event.clientY - rect.top;
      setView(previous => {
        if (event.shiftKey) return {
          ...previous,
          x: previous.x + event.deltaY / previous.zoom,
          y: previous.y + event.deltaX / previous.zoom
        };
        const zoom = clamp(previous.zoom * Math.exp(-event.deltaY * .0015), .08, 4);
        return {
          x: previous.x + x / previous.zoom - x / zoom,
          y: previous.y + y / previous.zoom - y / zoom,
          zoom
        };
      });
    };
    svg.addEventListener('wheel', wheel, {
      passive: false
    });
    return () => svg.removeEventListener('wheel', wheel);
  }, []);
  useEffect(() => {
    const down = event => {
      if (event.key === 'Escape') {
        setConnection(null);
        setModal(null);
        if (dragRef.current?.base) stage(dragRef.current.base);
        dragRef.current = null;
        setMarquee(null);
        return;
      }
      if (typing(event.target) || modal) return;
      const command = event.ctrlKey || event.metaKey;
      if (event.code === 'Space') {
        event.preventDefault();
        spaceRef.current = true;
        return;
      }
      if (command && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();else undo();
        return;
      }
      if (command && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
        return;
      }
      if (command && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setSelected(projectRef.current.nodes.map(node => node.id));
        return;
      }
      if (command && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        duplicate();
        return;
      }
      if (command && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        copySelection();
        return;
      }
      if (command && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        pasteSelection();
        return;
      }
      if (command && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveProject();
        return;
      }
      if (['Delete', 'Backspace'].includes(event.key)) {
        event.preventDefault();
        remove();
        return;
      }
      const delta = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1]
      }[event.key];
      if (delta && selected.length) {
        event.preventDefault();
        const step = event.shiftKey ? 20 : snapping ? GRID : 1;
        apply({
          ...projectRef.current,
          nodes: projectRef.current.nodes.map(node => selected.includes(node.id) ? {
            ...node,
            x: node.x + delta[0] * step,
            y: node.y + delta[1] * step
          } : node)
        });
        return;
      }
      if (!command && !event.altKey) {
        const next = TOOLS.find(item => item[3].toLowerCase() === event.key.toLowerCase());
        if (next) {
          event.preventDefault();
          setTool(next[0]);
          setConnection(null);
        }
      }
    };
    const up = event => {
      if (event.code === 'Space') spaceRef.current = false;
    };
    const blur = () => {
      spaceRef.current = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
    };
  });
  function point(event) {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return {
      x: 0,
      y: 0
    };
    const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return {
      x: p.x,
      y: p.y
    };
  }
  function capture(event) {
    event.target.setPointerCapture(event.pointerId);
  }
  function nearestPort(p, exclude) {
    let candidate = null,
      distance = 22 / view.zoom;
    for (const node of projectRef.current.nodes) for (const port of nodePorts(node)) {
      if (exclude?.nodeId === node.id && exclude?.portId === port.id) continue;
      const position = portPosition(node, port.id),
        d = Math.hypot(position.x - p.x, position.y - p.y);
      if (d < distance) {
        candidate = {
          nodeId: node.id,
          portId: port.id
        };
        distance = d;
      }
    }
    return candidate;
  }
  function connectTo(target) {
    if (!connection) return;
    const doc = projectRef.current,
      sourceNode = doc.nodes.find(node => node.id === connection.nodeId),
      targetNode = doc.nodes.find(node => node.id === target.nodeId);
    if (!sourceNode || !targetNode) return;
    if (sourceNode.id === targetNode.id && !isState(sourceNode)) {
      notify('For a wire loop, add a junction or bend between pins.');
      return;
    }
    const reverse = doc.edges.some(edge => edge.source.nodeId === target.nodeId && edge.target.nodeId === connection.nodeId);
    const edge = createEdge(connection, target, doc.nodes, reverse && isState(sourceNode) ? {
      bend: 70
    } : {});
    apply({
      ...doc,
      edges: [...doc.edges, edge]
    });
    setSelected([edge.id]);
    setConnection(null);
    setTool('select');
  }
  function startPort(event, node, port) {
    event.preventDefault();
    event.stopPropagation();
    const source = {
      nodeId: node.id,
      portId: port.id
    };
    if (connection) {
      connectTo(source);
      return;
    }
    setConnection(source);
    setPointer(portPosition(node, port.id));
    dragRef.current = {
      kind: 'wire',
      start: point(event),
      source
    };
    capture(event);
  }
  function nodeDown(event, node) {
    if (event.button === 1 || spaceRef.current || tool === 'hand') return;
    if (tool === 'erase') {
      event.stopPropagation();
      apply(removeItems(projectRef.current, [node.id]));
      setSelected([]);
      return;
    }
    if (tool === 'connect' || connection) {
      event.stopPropagation();
      const ports = nodePorts(node);
      if (!ports.length) {
        notify('Use a symbol with connection pins.');
        return;
      }
      const port = isState(node) ? 'auto' : connection ? (ports.find(p => p.side === 'left') || ports[0]).id : (ports.find(p => p.side === 'right') || ports[0]).id;
      if (connection) connectTo({
        nodeId: node.id,
        portId: port
      });else {
        setConnection({
          nodeId: node.id,
          portId: port
        });
        setPointer(point(event));
      }
      return;
    }
    if (tool !== 'select') return;
    event.stopPropagation();
    const ids = event.shiftKey ? selected.includes(node.id) ? selected.filter(id => id !== node.id) : [...selected, node.id] : selected.includes(node.id) ? selected : [node.id];
    setSelected(ids);
    dragRef.current = {
      kind: 'nodes',
      start: point(event),
      base: clone(projectRef.current),
      ids
    };
    capture(event);
  }
  function canvasDown(event) {
    if (event.button === 2) return;
    const p = point(event);
    setPointer(p);
    if (event.button === 1 || spaceRef.current || tool === 'hand') {
      event.preventDefault();
      dragRef.current = {
        kind: 'pan',
        start: {
          x: event.clientX,
          y: event.clientY
        },
        view: {
          ...view
        }
      };
      capture(event);
      return;
    }
    if (connection) {
      setConnection(null);
      return;
    }
    if (tool === 'select') {
      setSelected([]);
      dragRef.current = {
        kind: 'marquee',
        start: p,
        add: event.shiftKey ? selected : []
      };
      setMarquee({
        x: p.x,
        y: p.y,
        width: 0,
        height: 0
      });
      capture(event);
      return;
    }
    if (tool === 'connect' || tool === 'erase') return;
    if (tool === 'text') {
      const node = addSymbol('text', p);
      if (node) setModal({
        kind: 'label',
        id: node.id,
        value: node.label
      });
      setTool('select');
      return;
    }
    const type = tool === 'pen' ? 'freehand' : tool;
    if (['freehand', 'rectangle', 'ellipse', 'line', 'arrow'].includes(type)) {
      const node = createNode(type, p.x, p.y, {
        width: 8,
        height: 8,
        label: '',
        color: type === 'freehand' ? penColor : '',
        strokeWidth: penWidth,
        points: ['freehand', 'line', 'arrow'].includes(type) ? [{
          x: 0,
          y: 0
        }] : undefined
      });
      const base = clone(projectRef.current);
      stage({
        ...base,
        nodes: [...base.nodes, node]
      });
      setSelected([node.id]);
      dragRef.current = {
        kind: 'draw',
        type,
        start: p,
        base,
        node,
        points: [p]
      };
      capture(event);
    }
  }
  function pointerMove(event) {
    const p = point(event);
    setPointer(p);
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.kind === 'pan') {
      setView({
        ...drag.view,
        x: drag.view.x - (event.clientX - drag.start.x) / drag.view.zoom,
        y: drag.view.y - (event.clientY - drag.start.y) / drag.view.zoom
      });
      return;
    }
    if (drag.kind === 'wire') return;
    if (drag.kind === 'nodes') {
      const dx = snap(p.x - drag.start.x, snapping),
        dy = snap(p.y - drag.start.y, snapping);
      drag.changed = dx !== 0 || dy !== 0;
      stage({
        ...drag.base,
        nodes: drag.base.nodes.map(node => drag.ids.includes(node.id) ? {
          ...node,
          x: node.x + dx,
          y: node.y + dy
        } : node)
      });
      return;
    }
    if (drag.kind === 'marquee') {
      const rect = {
        x: Math.min(p.x, drag.start.x),
        y: Math.min(p.y, drag.start.y),
        width: Math.abs(p.x - drag.start.x),
        height: Math.abs(p.y - drag.start.y)
      };
      setMarquee(rect);
      setSelected([...new Set([...drag.add, ...projectRef.current.nodes.filter(node => {
        const b = nodeBounds(node);
        return b.x >= rect.x && b.y >= rect.y && b.x + b.width <= rect.x + rect.width && b.y + b.height <= rect.y + rect.height;
      }).map(node => node.id)])]);
      return;
    }
    if (drag.kind === 'resize') {
      const node = drag.node,
        angle = node.rotation * Math.PI / 180,
        dx = p.x - drag.start.x,
        dy = p.y - drag.start.y;
      const changed = resizeNode(node, snap(node.width + dx * Math.cos(angle) + dy * Math.sin(angle), snapping), snap(node.height - dx * Math.sin(angle) + dy * Math.cos(angle), snapping));
      stage({
        ...drag.base,
        nodes: drag.base.nodes.map(item => item.id === node.id ? changed : item)
      });
      drag.changed = true;
      return;
    }
    if (drag.kind === 'bend' || drag.kind === 'label') {
      const doc = projectRef.current;
      stage({
        ...doc,
        edges: doc.edges.map(edge => {
          if (edge.id !== drag.id) return edge;
          if (drag.kind === 'label') return {
            ...edge,
            labelX: drag.labelX + p.x - drag.start.x,
            labelY: drag.labelY + p.y - drag.start.y
          };
          return {
            ...edge,
            points: edge.points.map((pt, index) => index === drag.index ? {
              x: snap(p.x, snapping),
              y: snap(p.y, snapping)
            } : pt)
          };
        })
      });
      drag.changed = true;
      return;
    }
    if (drag.kind === 'draw') {
      if (drag.type === 'freehand' && Math.hypot(p.x - drag.points.at(-1).x, p.y - drag.points.at(-1).y) > 2 / view.zoom) drag.points.push(p);
      const points = drag.type === 'freehand' ? drag.points : [drag.start, p],
        x = Math.min(...points.map(pt => pt.x)),
        y = Math.min(...points.map(pt => pt.y)),
        width = Math.max(8, Math.max(...points.map(pt => pt.x)) - x),
        height = Math.max(8, Math.max(...points.map(pt => pt.y)) - y);
      const node = {
        ...drag.node,
        x,
        y,
        width,
        height,
        ...(['freehand', 'line', 'arrow'].includes(drag.type) ? {
          points: points.map(pt => ({
            x: pt.x - x,
            y: pt.y - y
          }))
        } : {})
      };
      stage({
        ...drag.base,
        nodes: [...drag.base.nodes, node]
      });
      drag.changed = true;
    }
  }
  function pointerUp(event) {
    const drag = dragRef.current;
    if (!drag) return;
    if (drag.kind === 'wire') {
      const p = point(event),
        target = nearestPort(p, drag.source);
      if (target && Math.hypot(p.x - drag.start.x, p.y - drag.start.y) > 5 / view.zoom) connectTo(target);
    } else if (drag.base && drag.changed) remember(drag.base);else if (drag.kind === 'draw') stage(drag.base);
    dragRef.current = null;
    setMarquee(null);
    if (svgRef.current?.hasPointerCapture(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
  }
  function addSymbol(type, position) {
    if (projectRef.current.nodes.length >= 500) {
      notify('This canvas supports 500 symbols. Start another project for more.');
      return;
    }
    const center = position || {
      x: view.x + size.width / view.zoom / 2 - 60 + projectRef.current.nodes.length % 5 * 20,
      y: view.y + size.height / view.zoom / 2 - 50 + projectRef.current.nodes.length % 5 * 20
    };
    const node = createNode(type, snap(center.x, snapping), snap(center.y, snapping));
    if (isState(node)) node.label = `q${projectRef.current.nodes.filter(isState).length}`;
    apply({
      ...projectRef.current,
      nodes: [...projectRef.current.nodes, node]
    });
    setSelected([node.id]);
    setTool('select');
    return node;
  }
  function remove() {
    if (!selected.length) return;
    apply(removeItems(projectRef.current, selected));
    setSelected([]);
    setConnection(null);
  }
  function duplicate() {
    if (!selected.length) return;
    const result = duplicateItems(projectRef.current, selected);
    apply(result.project);
    setSelected(result.ids);
  }
  function copySelection() {
    const nodes = projectRef.current.nodes.filter(node => selected.includes(node.id));
    if (!nodes.length) return notify('Select symbols to copy.');
    clipboardRef.current = {
      ...emptyDiagram(),
      nodes: clone(nodes),
      edges: clone(projectRef.current.edges.filter(edge => nodes.some(n => n.id === edge.source.nodeId) && nodes.some(n => n.id === edge.target.nodeId)))
    };
    notify('Selection copied. Use Paste or Ctrl/Cmd + V in this canvas.');
  }
  function pasteSelection() {
    const data = clipboardRef.current;
    if (!data) return notify('Copy a selection in this canvas first.');
    const result = duplicateItems(data, data.nodes.map(node => node.id));
    apply({
      ...projectRef.current,
      nodes: [...projectRef.current.nodes, ...result.project.nodes.filter(node => result.ids.includes(node.id))],
      edges: [...projectRef.current.edges, ...result.project.edges.filter(edge => result.ids.includes(edge.source.nodeId))]
    });
    setSelected(result.ids);
  }
  function updateNode(patch) {
    const id = selected[0],
      doc = projectRef.current,
      previous = doc.nodes.find(node => node.id === id);
    if (!previous) return;
    let next = {
      ...previous,
      ...patch
    };
    if (patch.width !== undefined || patch.height !== undefined) {
      const resized = resizeNode(previous, patch.width ?? previous.width, patch.height ?? previous.height);
      next = {
        ...resized,
        ...patch,
        width: resized.width,
        height: resized.height
      };
    }
    const nodes = doc.nodes.map(node => node.id === id ? next : node),
      validEndpoint = endpoint => endpoint.nodeId !== id || endpoint.portId === 'auto' || nodePorts(next).some(port => port.id === endpoint.portId);
    const edges = doc.edges.filter(edge => validEndpoint(edge.source) && validEndpoint(edge.target));
    apply({
      ...doc,
      nodes,
      edges
    });
    if (edges.length < doc.edges.length) notify('Connections to removed pins were removed. Undo restores them.');
  }
  function updateEdge(patch) {
    const id = selected[0],
      doc = projectRef.current;
    if (patch.addBend) {
      const edge = doc.edges.find(edge => edge.id === id);
      if (!edge) return;
      const {
        label
      } = edgeGeometry(edge, doc.nodes);
      patch = {
        points: [...(edge.points || []), {
          x: snap(label.x),
          y: snap(label.y + 12)
        }]
      };
    }
    apply({
      ...doc,
      edges: doc.edges.map(edge => edge.id === id ? {
        ...edge,
        ...patch
      } : edge)
    });
  }
  function arrange(kind) {
    const doc = projectRef.current,
      nodes = doc.nodes.filter(node => selected.includes(node.id));
    if (!nodes.length) return;
    if (kind === 'front' || kind === 'back') {
      const others = doc.nodes.filter(node => !selected.includes(node.id));
      apply({
        ...doc,
        nodes: kind === 'front' ? [...others, ...nodes] : [...nodes, ...others]
      });
      return;
    }
    const minX = Math.min(...nodes.map(n => n.x)),
      minY = Math.min(...nodes.map(n => n.y)),
      maxX = Math.max(...nodes.map(n => n.x + n.width)),
      maxY = Math.max(...nodes.map(n => n.y + n.height));
    const sorted = [...nodes].sort((a, b) => a.x - b.x),
      gap = nodes.length > 1 ? (maxX - minX - nodes.reduce((sum, node) => sum + node.width, 0)) / (nodes.length - 1) : 0;
    let cursor = minX;
    const positions = new Map(sorted.map(node => {
      const x = cursor;
      cursor += node.width + gap;
      return [node.id, x];
    }));
    apply({
      ...doc,
      nodes: doc.nodes.map(node => !selected.includes(node.id) ? node : {
        ...node,
        ...(kind === 'left' ? {
          x: minX
        } : kind === 'top' ? {
          y: minY
        } : kind === 'center' ? {
          x: (minX + maxX - node.width) / 2
        } : kind === 'middle' ? {
          y: (minY + maxY - node.height) / 2
        } : {
          x: positions.get(node.id)
        })
      })
    });
  }
  function loadTemplate(id) {
    const doc = makeTemplate(id);
    apply(doc);
    setSelected([]);
    setConnection(null);
    setTool('select');
    fit(doc);
    notify('Template loaded. Undo returns to your previous canvas.');
  }
  function edit(node) {
    setModal(node.type === 'table' ? {
      kind: 'table',
      id: node.id,
      cells: clone(node.cells || [['A', 'B'], ['0', '1']])
    } : {
      kind: 'label',
      id: node.id,
      value: node.label
    });
  }
  function saveModal() {
    if (!modal?.id) return;
    const patch = modal.kind === 'table' ? {
      cells: modal.cells,
      width: Math.max(120, modal.cells[0].length * 100),
      height: Math.max(60, modal.cells.length * 40)
    } : {
      label: modal.value
    };
    const doc = projectRef.current;
    apply({
      ...doc,
      nodes: doc.nodes.map(node => node.id === modal.id ? {
        ...node,
        ...patch
      } : node)
    });
    setModal(null);
  }
  function insertSymbol(symbol) {
    if (selected.length === 1) {
      const node = projectRef.current.nodes.find(n => n.id === selected[0]);
      if (node) {
        updateNode({
          label: (node.label + symbol).slice(0, 2000)
        });
        return;
      }
      const edge = projectRef.current.edges.find(e => e.id === selected[0]);
      if (edge) {
        updateEdge({
          label: (edge.label + symbol).slice(0, 300)
        });
        return;
      }
    }
    const node = addSymbol('text');
    if (node) {
      const doc = projectRef.current;
      stage({
        ...doc,
        nodes: doc.nodes.map(item => item.id === node.id ? {
          ...item,
          label: symbol,
          width: 70
        } : item)
      });
    }
  }
  function saveProject() {
    try {
      const entry = {
          id: uid(),
          title: projectRef.current.title,
          date: new Date().toISOString(),
          project: clone(projectRef.current)
        },
        next = [entry, ...projects].slice(0, 20);
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
      setProjects(next);
      notify('Snapshot saved in My projects. Download JSON for a portable backup.');
    } catch {
      notify('Browser storage is full. Export JSON to save your diagram.');
    }
  }
  async function importFile(file) {
    if (!file) return;
    try {
      if (file.size > 6 * 1024 * 1024) throw Error('Project JSON must be smaller than 6 MB.');
      const doc = validateDiagram(JSON.parse(await file.text()));
      apply(doc);
      setSelected([]);
      setConnection(null);
      fit(doc);
      notify('Project imported. Undo restores your previous canvas.');
    } catch (error) {
      notify(error.message || 'This file could not be imported.');
    }
  }
  async function download(kind) {
    setExportBusy(true);
    try {
      await exportDiagram(validateDiagram(projectRef.current), kind, exportOptions);
      notify(kind === 'clipboard' ? 'PNG copied. Paste it into your document or editor.' : `${kind.toUpperCase()} downloaded.`);
    } catch (error) {
      notify(error.message);
    } finally {
      setExportBusy(false);
    }
  }
  const selectedNode = selected.length === 1 ? project.nodes.find(node => node.id === selected[0]) : null;
  const selectedEdge = selected.length === 1 ? project.edges.find(edge => edge.id === selected[0]) : null;
  const connectionNode = connection ? project.nodes.find(node => node.id === connection.nodeId) : null;
  const connectionStart = connectionNode ? portPosition(connectionNode, connection.portId) || {
    x: connectionNode.x + connectionNode.width / 2,
    y: connectionNode.y + connectionNode.height / 2
  } : null;
  const categories = ['All', ...new Set(SYMBOLS.map(symbol => symbol.category))];
  const visibleSymbols = SYMBOLS.filter(symbol => (category === 'All' || symbol.category === category) && `${symbol.label} ${symbol.category}`.toLowerCase().includes(query.toLowerCase()));
  const cursor = tool === 'hand' ? 'grab' : ['connect', 'pen', 'rectangle', 'ellipse', 'line', 'arrow'].includes(tool) ? 'crosshair' : tool === 'erase' ? 'not-allowed' : tool === 'text' ? 'text' : 'default';
  return <main className={styles.workspace}>
    <header className={styles.heading}><div><p className={styles.eyebrow}>G4Gate · Diagram workspace</p><h1>Build the diagram in your head.</h1><p>Circuits, automata, tables, graphs and freehand notes. Every connection stays attached.</p></div><nav className={styles.nav}><Link href="/">← Question editor</Link><Link href="/kmap-maker">K-Map studio ↗</Link></nav></header>
    <div className={styles.toolbar}>
      <input className={styles.titleInput} aria-label="Diagram name" maxLength={100} value={project.title} onChange={e => updateProject({
        title: e.target.value
      })} />
      <span className={styles.saveStatus} role="status">{saveStatus}</span>
      <button className={styles.secondary} disabled={!historyCounts.undo} onClick={undo} title="Ctrl/Cmd + Z">↶ Undo</button><button className={styles.secondary} disabled={!historyCounts.redo} onClick={redo} title="Ctrl/Cmd + Shift + Z">↷ Redo</button>
      <button className={styles.secondary} onClick={copySelection}>Copy</button><button className={styles.secondary} onClick={pasteSelection}>Paste</button><button className={styles.secondary} onClick={saveProject} disabled={!ready}>Save project</button>
      <button className={styles.secondary} onClick={() => fileRef.current?.click()}>Import JSON</button><input hidden ref={fileRef} type="file" accept="application/json,.json" onChange={e => {
        importFile(e.target.files?.[0]);
        e.target.value = '';
      }} />
      <button className={styles.primary} onClick={() => setModal({
        kind: 'export'
      })}>Export / copy image ↗</button>
    </div>
    <div className={styles.mobilePanelButtons}><button className={styles.secondary} onClick={() => setShowLibrary(!showLibrary)}>{showLibrary ? 'Hide' : 'Show'} symbols</button><button className={styles.secondary} onClick={() => setShowProperties(!showProperties)}>{showProperties ? 'Hide' : 'Show'} properties</button></div>
    <div className={styles.body} data-history={historyVersion}>
      <aside className={styles.library} aria-label="Symbol library" hidden={!showLibrary}>
        <div className={styles.panelHeading}><h2>Your building blocks</h2><span>{SYMBOLS.length} symbols</span></div>
        <div className={styles.libraryTabs}>{[['symbols', 'Symbols'], ['templates', 'Templates'], ['math', 'Math / ε'], ['projects', 'My projects']].map(([id, label]) => <button key={id} aria-pressed={libraryTab === id} onClick={() => setLibraryTab(id)}>{label}</button>)}</div>
        {libraryTab === 'symbols' && <><input aria-label="Search symbols" placeholder="Search gates, MUX, states…" value={query} onChange={e => setQuery(e.target.value)} /><select aria-label="Symbol category" value={category} onChange={e => setCategory(e.target.value)}>{categories.map(item => <option key={item}>{item}</option>)}</select><p className={styles.muted}>Drag onto the canvas, or click to add.</p>{categories.slice(1).filter(item => visibleSymbols.some(symbol => symbol.category === item)).map(category => <section key={category}><h3 className={styles.categoryTitle}>{category}</h3><div className={styles.symbolGrid}>{visibleSymbols.filter(symbol => symbol.category === category).map(symbol => <button key={symbol.type} className={styles.symbol} aria-label={`Add ${symbol.label}`} draggable onDragStart={event => {
                event.dataTransfer.setData('application/x-gate-symbol', symbol.type);
                event.dataTransfer.effectAllowed = 'copy';
              }} onClick={() => addSymbol(symbol.type)}><svg viewBox="-45 -10 200 170" aria-hidden="true" dangerouslySetInnerHTML={{
                  __html: nodeSvg(createNode(symbol.type, 0, 0, {
                    fontSize: 15
                  }), diagramPalette('dark'))
                }} /><span>{symbol.label}</span></button>)}</div></section>)}</>}
        {libraryTab === 'templates' && <><p className={styles.muted}>Load a ready layout, then edit everything. Undo keeps your previous canvas.</p>{DIAGRAM_TEMPLATES.map(item => <button className={styles.template} key={item.id} onClick={() => loadTemplate(item.id)} aria-label={`Load ${item.title} template`}><strong>{item.title}</strong><span>{item.description}</span></button>)}</>}
        {libraryTab === 'math' && <><p className={styles.muted}>Append a symbol to the selected label, or add it as text when nothing is selected.</p>{Object.entries(MATH_SYMBOLS).map(([group, symbols]) => <section key={group}><h3 className={styles.categoryTitle}>{group}</h3><div className={styles.mathGrid}>{symbols.map(symbol => <button key={symbol} title={`Insert ${symbol}`} aria-label={`Insert ${symbol}`} onClick={() => insertSymbol(symbol)}>{symbol}</button>)}</div></section>)}</>}
        {libraryTab === 'projects' && <><button className={styles.primary} onClick={saveProject}>Save current snapshot</button><p className={styles.muted}>Last 20 snapshots in this browser. Use JSON export for backups and moving between devices.</p>{projects.map(item => <div className={styles.projectRow} key={item.id}><button className={styles.secondary} onClick={() => {
              try {
                const doc = validateDiagram(item.project);
                apply(doc);
                fit(doc);
                setSelected([]);
                notify('Saved snapshot opened.');
              } catch (error) {
                notify(error.message);
              }
            }}>{item.title}<br /><small>{new Date(item.date).toLocaleDateString()}</small></button><button className={styles.danger} aria-label={`Remove saved ${item.title}`} onClick={() => {
              const next = projects.filter(p => p.id !== item.id);
              try {
                localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
                setProjects(next);
              } catch {
                notify('Saved project could not be removed.');
              }
            }}>×</button></div>)}</>}
      </aside>
      <section className={styles.canvasColumn} aria-label="Diagram canvas area">
        <div className={styles.tools}>{TOOLS.map(([id, icon, label, key]) => <button key={id} aria-label={`${label} tool`} aria-pressed={tool === id} title={`${label} (${key})`} onClick={() => {
            setTool(id);
            setConnection(null);
          }}>{icon} {label}</button>)}<span className={styles.separator} /><label className={styles.check} style={{
            margin: 0,
            fontSize: 11,
            color: '#9fb4ce'
          }}><input type="checkbox" checked={snapping} onChange={e => setSnapping(e.target.checked)} />Snap</label><label className={styles.check} style={{
            margin: 0,
            fontSize: 11,
            color: '#9fb4ce'
          }}><input type="checkbox" checked={showGrid} onChange={e => setShowGrid(e.target.checked)} />Grid</label><button aria-label="Toggle canvas theme" onClick={() => updateProject({
            theme: project.theme === 'light' ? 'dark' : 'light'
          })}>{project.theme === 'light' ? '☀' : '☾'}</button></div>
        {tool === 'pen' && <div className={styles.tools}><label className={styles.check} style={{
            margin: 0,
            fontSize: 11
          }}>Pen colour <input aria-label="Pen colour" type="color" value={penColor} onChange={e => setPenColor(e.target.value)} /></label><label className={styles.check} style={{
            margin: 0,
            fontSize: 11
          }}>Width <input aria-label="Pen width" type="range" min="1" max="10" value={penWidth} onChange={e => setPenWidth(Number(e.target.value))} />{penWidth}px</label></div>}
        <div className={styles.canvas} ref={canvasRef} style={{
          background: project.theme === 'dark' ? '#0e1520' : '#e8edf3'
        }}>
          <svg ref={svgRef} aria-label="Interactive diagram canvas" role="application" tabIndex={0} viewBox={`${view.x} ${view.y} ${size.width / view.zoom} ${size.height / view.zoom}`} style={{
            cursor
          }} onPointerDown={canvasDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onDoubleClick={event => {
            if (tool !== 'select') return;
            const p = point(event),
              node = [...projectRef.current.nodes].reverse().find(node => {
                const b = nodeBounds(node);
                return p.x >= b.x && p.x <= b.x + b.width && p.y >= b.y && p.y <= b.y + b.height;
              });
            if (node) {
              setSelected([node.id]);
              edit(node);
            }
          }} onPointerCancel={event => {
            if (dragRef.current?.base) stage(dragRef.current.base);
            dragRef.current = null;
            setMarquee(null);
            if (svgRef.current.hasPointerCapture(event.pointerId)) svgRef.current.releasePointerCapture(event.pointerId);
          }} onContextMenu={e => e.preventDefault()} onDragOver={e => e.preventDefault()} onDrop={event => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/x-gate-symbol');
            if (SYMBOLS.some(item => item.type === type)) addSymbol(type, point(event));
          }}>
            <defs><pattern id="diagram-grid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill={palette.grid} /></pattern></defs>
            <rect x="0" y="0" width={project.width} height={project.height} fill={palette.paper} stroke={palette.grid} />
            {showGrid && <rect x={view.x} y={view.y} width={size.width / view.zoom} height={size.height / view.zoom} fill="url(#diagram-grid)" pointerEvents="none" />}
            {project.edges.map(edge => {
              const geometry = edgeGeometry(edge, project.nodes);
              return <g key={edge.id} className={styles.wire} data-edge-id={edge.id} onPointerDown={event => {
                if (spaceRef.current || tool === 'hand' || event.button === 1) return;
                event.stopPropagation();
                if (tool === 'erase') {
                  apply(removeItems(projectRef.current, [edge.id]));
                  return;
                }
                setSelected(event.shiftKey ? [...new Set([...selected, edge.id])] : [edge.id]);
              }} onDoubleClick={event => {
                event.stopPropagation();
                const p = point(event);
                apply({
                  ...projectRef.current,
                  edges: projectRef.current.edges.map(item => item.id === edge.id ? {
                    ...item,
                    points: [...(item.points || []), {
                      x: snap(p.x, snapping),
                      y: snap(p.y, snapping)
                    }]
                  } : item)
                });
                setSelected([edge.id]);
              }}>
              {selected.includes(edge.id) && <path d={geometry.path} stroke="#62a8ff" strokeWidth={8} fill="none" opacity=".25" />}<g pointerEvents="none" dangerouslySetInnerHTML={{
                  __html: edgeSvg(edge, project.nodes, palette)
                }} /><path d={geometry.path} stroke="transparent" strokeWidth={16 / view.zoom} fill="none" />
            </g>;
            })}
            {project.nodes.map(node => {
              const bounds = nodeBounds(node),
                chosen = selected.includes(node.id);
              return <g key={node.id} className={`${styles.node} ${chosen ? styles.selected : ''} ${tool === 'connect' || connection ? styles.connecting : ''}`} data-node-id={node.id} role="button" aria-label={`${SYMBOLS.find(symbol => symbol.type === node.type)?.label || node.type}: ${node.label}`} tabIndex={0} onPointerDown={event => nodeDown(event, node)} onDoubleClick={event => {
                event.stopPropagation();
                setSelected([node.id]);
                edit(node);
              }} onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  event.stopPropagation();
                  setSelected([node.id]);
                  edit(node);
                }
              }}>
              <NodeArtwork node={node} theme={project.theme} />
              {chosen && <rect x={bounds.x - 7} y={bounds.y - 7} width={bounds.width + 14} height={bounds.height + 14} rx="5" fill="none" stroke="#4d92ee" strokeWidth={1.5 / view.zoom} strokeDasharray={`${5 / view.zoom} ${3 / view.zoom}`} pointerEvents="none" />}
              {nodePorts(node).map(port => {
                  const p = portPosition(node, port.id);
                  return <circle key={port.id} className={styles.port} cx={p.x} cy={p.y} r={6 / view.zoom} fill={connection?.nodeId === node.id && connection?.portId === port.id ? '#76e0c9' : palette.paper} stroke="#438beb" strokeWidth={1.7 / view.zoom} role="button" tabIndex={0} aria-label={`${node.label || node.type} pin ${port.label || port.id}`} data-port={`${node.id}:${port.id}`} onPointerDown={event => startPort(event, node, port)} onKeyDown={event => {
                    if (['Enter', ' '].includes(event.key)) {
                      event.preventDefault();
                      event.stopPropagation();
                      if (connection) connectTo({
                        nodeId: node.id,
                        portId: port.id
                      });else {
                        setConnection({
                          nodeId: node.id,
                          portId: port.id
                        });
                        setPointer(p);
                      }
                    }
                  }} />;
                })}
            </g>;
            })}
            {selectedNode && (() => {
              const b = nodeBounds(selectedNode);
              return <rect className={styles.resize} aria-label="Resize selected symbol" x={b.x + b.width - 4 / view.zoom} y={b.y + b.height - 4 / view.zoom} width={9 / view.zoom} height={9 / view.zoom} fill="#4d92ee" stroke={palette.paper} onPointerDown={event => {
                event.stopPropagation();
                dragRef.current = {
                  kind: 'resize',
                  start: point(event),
                  node: clone(selectedNode),
                  base: clone(projectRef.current)
                };
                capture(event);
              }} />;
            })()}
            {selectedEdge && <>{(selectedEdge.points || []).map((p, index) => <circle key={index} className={styles.handle} aria-label={`Wire bend ${index + 1}`} cx={p.x} cy={p.y} r={6 / view.zoom} fill="#4d92ee" stroke={palette.paper} onPointerDown={event => {
                event.stopPropagation();
                dragRef.current = {
                  kind: 'bend',
                  id: selectedEdge.id,
                  index,
                  base: clone(projectRef.current)
                };
                capture(event);
              }} />)}{(() => {
                const p = edgeGeometry(selectedEdge, project.nodes).label;
                return <circle className={styles.handle} aria-label="Move wire label" cx={p.x} cy={p.y} r={5 / view.zoom} fill="#85d6c6" stroke="#1a6557" onPointerDown={event => {
                  event.stopPropagation();
                  dragRef.current = {
                    kind: 'label',
                    id: selectedEdge.id,
                    start: point(event),
                    labelX: selectedEdge.labelX || 0,
                    labelY: selectedEdge.labelY || 0,
                    base: clone(projectRef.current)
                  };
                  capture(event);
                }} />;
              })()}</>}
            {connectionStart && <><path d={`M ${connectionStart.x} ${connectionStart.y} L ${pointer.x} ${pointer.y}`} stroke="#268fe4" strokeWidth="2" strokeDasharray="7 5" fill="none" pointerEvents="none" /><circle cx={pointer.x} cy={pointer.y} r={8 / view.zoom} fill="none" stroke="#268fe4" pointerEvents="none" /></>}
            {marquee && <rect {...marquee} fill="#4d92ee22" stroke="#4d92ee" strokeWidth={1 / view.zoom} pointerEvents="none" />}
          </svg>
          {!project.nodes.length && <div className={styles.canvasEmpty}><div>⌁ ⊕ →</div><h2>A blank canvas. Plenty of possibilities.</h2><p>Drag a symbol from the library, choose a ready template, or pick the pen to start drawing.</p></div>}
        </div>
        <div className={styles.footer}><span>{connection ? 'Connecting… click a pin / destination. Esc cancels.' : `${project.nodes.length} symbols · ${project.edges.length} wires · Wheel: zoom · Space + drag: pan`}</span><div className={styles.zoom}><button aria-label="Zoom out" onClick={() => setView({
              ...view,
              zoom: clamp(view.zoom / 1.2, .08, 4)
            })}>−</button><span>{Math.round(view.zoom * 100)}%</span><button aria-label="Zoom in" onClick={() => setView({
              ...view,
              zoom: clamp(view.zoom * 1.2, .08, 4)
            })}>+</button><button onClick={() => fit()}>Fit diagram</button><button onClick={() => setView({
              ...view,
              zoom: 1
            })}>100%</button></div></div>
      </section>
      <div hidden={!showProperties}><DiagramInspector project={project} selected={selected} updateNode={updateNode} updateEdge={updateEdge} remove={remove} duplicate={duplicate} edit={edit} arrange={arrange} /></div>
    </div>
    {toast && <div className={styles.toast} role="status">{toast}</div>}
    {modal && <div className={styles.modalBackdrop} onPointerDown={event => {
      if (event.target === event.currentTarget && !exportBusy) setModal(null);
    }}><section className={styles.modal} role="dialog" aria-modal="true" aria-label={modal.kind === 'export' ? 'Export diagram' : modal.kind === 'table' ? 'Edit table cells' : 'Edit symbol label'}>
      {modal.kind === 'label' && <><h2>Edit label</h2><p className={styles.muted}>Unicode and multiple lines are supported. Use the Math / ε library for exam symbols.</p><textarea aria-label="Edit label text" autoFocus rows={5} maxLength={2000} value={modal.value} onChange={e => setModal({
            ...modal,
            value: e.target.value
          })} /><div className={styles.modalActions}><button className={styles.secondary} onClick={() => setModal(null)}>Cancel</button><button className={styles.primary} onClick={saveModal}>Apply label</button></div></>}
      {modal.kind === 'table' && <><h2>Edit table cells</h2><p className={styles.muted}>First row is styled as a header. Resize the table on the canvas after editing.</p><div className={styles.buttonRow}><button className={styles.secondary} disabled={modal.cells.length >= 40} onClick={() => setModal({
              ...modal,
              cells: [...modal.cells, Array(modal.cells[0].length).fill('')]
            })}>+ Row</button><button className={styles.secondary} disabled={modal.cells[0].length >= 20} onClick={() => setModal({
              ...modal,
              cells: modal.cells.map(row => [...row, ''])
            })}>+ Column</button><button className={styles.secondary} disabled={modal.cells.length <= 1} onClick={() => setModal({
              ...modal,
              cells: modal.cells.slice(0, -1)
            })}>− Row</button><button className={styles.secondary} disabled={modal.cells[0].length <= 1} onClick={() => setModal({
              ...modal,
              cells: modal.cells.map(row => row.slice(0, -1))
            })}>− Column</button></div><div className={styles.tableEditor} style={{
            gridTemplateColumns: `repeat(${modal.cells[0].length},100px)`
          }}>{modal.cells.flatMap((row, r) => row.map((cell, c) => <input key={`${r}-${c}`} aria-label={`Table row ${r + 1} column ${c + 1}`} value={cell} maxLength={200} onChange={e => setModal({
              ...modal,
              cells: modal.cells.map((row, ri) => row.map((value, ci) => ri === r && ci === c ? e.target.value : value))
            })} />))}</div><label>Paste a table (tab-separated columns)<textarea aria-label="Paste table data" rows={3} placeholder="A↹B↹Y" onPaste={event => {
              const value = event.clipboardData.getData('text');
              if (!value.includes('\t')) return;
              event.preventDefault();
              const cells = value.trim().split(/\r?\n/).slice(0, 40).map(row => row.split('\t').slice(0, 20).map(cell => cell.slice(0, 200))),
                cols = Math.max(...cells.map(row => row.length));
              setModal({
                ...modal,
                cells: cells.map(row => Array.from({
                  length: cols
                }, (_, c) => row[c] || ''))
              });
            }} /></label><div className={styles.modalActions}><button className={styles.secondary} onClick={() => setModal(null)}>Cancel</button><button className={styles.primary} onClick={saveModal}>Apply table</button></div></>}
      {modal.kind === 'export' && <><h2>Take your diagram anywhere.</h2><p className={styles.muted}>SVG stays editable and sharp. PNG works in the question editor, slides and documents. JSON keeps every symbol and connection for later editing.</p><div className={styles.exportOptions}><label>Export area<select aria-label="Diagram export area" value={exportOptions.crop ? 'content' : 'page'} onChange={e => setExportOptions({
                ...exportOptions,
                crop: e.target.value === 'content'
              })}><option value="content">Fit diagram contents</option><option value="page">Full artboard · {project.width} × {project.height}</option></select></label><label>Background<select aria-label="Diagram export background" value={exportOptions.background} onChange={e => setExportOptions({
                ...exportOptions,
                background: e.target.value
              })}><option value="theme">Canvas theme</option><option value="white">White</option><option value="transparent">Transparent</option></select></label><label>PNG scale<select aria-label="Diagram PNG scale" value={exportOptions.scale} onChange={e => setExportOptions({
                ...exportOptions,
                scale: Number(e.target.value)
              })}>{[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}× resolution</option>)}</select></label></div><div className={styles.buttonRow}>{[['svg', 'Download SVG'], ['png', 'Download PNG'], ['clipboard', 'Copy PNG'], ['json', 'Save editable JSON']].map(([kind, label]) => <button key={kind} disabled={exportBusy} className={kind === 'png' ? styles.primary : styles.secondary} onClick={() => download(kind)}>{exportBusy ? 'Working…' : label}</button>)}</div><div className={styles.twoCols}><label>Artboard width<input type="number" min="200" max="6000" value={project.width} onChange={e => {
                const n = Number(e.target.value);
                if (n >= 200 && n <= 6000) updateProject({
                  width: n
                });
              }} /></label><label>Artboard height<input type="number" min="200" max="6000" value={project.height} onChange={e => {
                const n = Number(e.target.value);
                if (n >= 200 && n <= 6000) updateProject({
                  height: n
                });
              }} /></label></div><p className={styles.muted}>Only artwork is exported. Grid dots, selection handles and editing controls are omitted.</p><div className={styles.modalActions}><button className={styles.secondary} disabled={exportBusy} onClick={() => setModal(null)}>Done</button></div></>}
    </section></div>}
  </main>;
}
