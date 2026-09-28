import { Maximize2, Minus, Plus, ScanLine } from 'lucide-react';
import { LEGEND } from './graphStyles';
import type { GraphLayoutName } from './toElements';

export function GraphLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted" aria-label="Graph legend">
      {LEGEND.map((l) => (
        <li key={l.label} className="flex items-center gap-1.5">
          {l.shape === 'circle'
            ? <span className="inline-block h-3 w-3 rounded-full border-2" style={{ backgroundColor: l.color, borderColor: l.border }} aria-hidden />
            : <span className="inline-block h-0.5 w-4" style={{ backgroundColor: l.color }} aria-hidden />}
          {l.label}
        </li>
      ))}
      <li className="flex items-center gap-1.5"><span className="inline-block h-0.5 w-4 bg-risk-high" aria-hidden />Loop (cycle) transfer</li>
      <li className="flex items-center gap-1.5"><span className="inline-block h-0 w-4 border-t-2 border-dashed border-purple-600" aria-hidden />Employee link</li>
    </ul>
  );
}

interface Props {
  layout: GraphLayoutName;
  onLayout: (l: GraphLayoutName) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onFullscreen: () => void;
  fullscreenSupported: boolean;
}

export function GraphToolbar({ layout, onLayout, onZoomIn, onZoomOut, onFit, onFullscreen, fullscreenSupported }: Props) {
  const btn = 'flex h-8 w-8 items-center justify-center rounded-md border border-line bg-surface text-ink hover:bg-page disabled:opacity-40';
  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1.5 text-xs text-muted">
        Layout:
        <select aria-label="Layout" value={layout} onChange={(e) => onLayout(e.target.value as GraphLayoutName)} className="h-8 rounded-md border border-line bg-surface px-2 text-xs text-ink">
          <option value="preset">Hierarchical</option>
          <option value="cose">Force</option>
          <option value="circle">Circle</option>
        </select>
      </label>
      <button type="button" aria-label="Zoom in" className={btn} onClick={onZoomIn}><Plus size={14} /></button>
      <button type="button" aria-label="Zoom out" className={btn} onClick={onZoomOut}><Minus size={14} /></button>
      <button type="button" aria-label="Fit to view" className={btn} onClick={onFit}><ScanLine size={14} /></button>
      <button type="button" aria-label="Fullscreen" className={btn} disabled={!fullscreenSupported} title={fullscreenSupported ? undefined : 'Fullscreen is not supported in this browser'} onClick={onFullscreen}><Maximize2 size={14} /></button>
    </div>
  );
}
