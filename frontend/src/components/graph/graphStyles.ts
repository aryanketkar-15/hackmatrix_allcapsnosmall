import type { StylesheetStyle } from 'cytoscape';

export const GRAPH_STYLE: StylesheetStyle[] = [
  { selector: 'node', style: { 'transition-property': 'border-color, border-width, opacity, background-color', 'transition-duration': 220, 'transition-timing-function': 'ease-out', label: 'data(label)', 'font-family': 'Inter, sans-serif', 'font-size': 11, 'text-wrap': 'wrap', color: '#111827', 'text-valign': 'bottom', 'text-margin-y': 6, width: 46, height: 46, 'border-width': 2 } },
  { selector: 'node.account', style: { width: 88, height: 88, 'background-color': '#2563eb', 'border-color': '#1d4ed8', color: '#ffffff', 'text-valign': 'center', 'text-margin-y': 0, 'font-weight': 700, 'font-size': 12 } },
  { selector: 'node.customer', style: { 'background-color': '#dcfce7', 'border-color': '#16a34a' } },
  { selector: 'node.employee', style: { 'background-color': '#fee2e2', 'border-color': '#dc2626' } },
  { selector: 'node.beneficiary', style: { 'background-color': '#ede9fe', 'border-color': '#7c3aed' } },
  { selector: 'edge', style: { 'transition-property': 'line-color, target-arrow-color, opacity, width', 'transition-duration': 220, 'transition-timing-function': 'ease-out', width: 2, 'curve-style': 'bezier', 'line-color': '#94a3b8', 'target-arrow-color': '#94a3b8', 'target-arrow-shape': 'triangle', label: 'data(label)', 'font-size': 10, color: '#334155', 'text-background-color': '#ffffff', 'text-background-opacity': 0.9, 'text-background-padding': '2px', 'text-rotation': 'autorotate' } },
  { selector: 'edge.cycle', style: { width: 3, 'line-color': '#dc2626', 'target-arrow-color': '#dc2626', color: '#b91c1c' } },
  { selector: 'edge.blocked', style: { 'line-style': 'dashed', 'line-color': '#9ca3af', 'target-arrow-color': '#9ca3af' } },
  { selector: 'edge.owner', style: { 'line-style': 'dotted', 'line-color': '#cbd5e1', 'target-arrow-shape': 'none', label: '' } },
  { selector: 'edge.link', style: { 'line-style': 'dashed', 'line-color': '#7c3aed', 'target-arrow-color': '#7c3aed', color: '#6d28d9', width: 2 } },
  { selector: 'edge.context', style: { 'line-color': '#a8a29e', 'target-arrow-color': '#a8a29e', color: '#78716c' } },
  { selector: '.picked', style: { 'border-color': '#f59e0b', 'border-width': 4, 'line-color': '#f59e0b', 'target-arrow-color': '#f59e0b', 'z-index': 10 } },
  { selector: '.muted', style: { opacity: 0.3 } },
];

export const LEGEND: { label: string; color: string; border: string; shape: 'circle' | 'line' }[] = [
  { label: 'Customer', color: '#dcfce7', border: '#16a34a', shape: 'circle' },
  { label: 'Account', color: '#2563eb', border: '#1d4ed8', shape: 'circle' },
  { label: 'Employee', color: '#fee2e2', border: '#dc2626', shape: 'circle' },
  { label: 'Beneficiary', color: '#ede9fe', border: '#7c3aed', shape: 'circle' },
  { label: 'Transaction', color: '#94a3b8', border: '#94a3b8', shape: 'line' },
];
