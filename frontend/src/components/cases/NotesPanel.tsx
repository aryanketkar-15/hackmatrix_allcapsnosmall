import { useState } from 'react';
import { Button, Card, CardHeader, EmptyState } from '../ui';
import { useStore } from '../../data/store';
import { useCaseActions } from './useCaseActions';
import { NOTE_MAX } from './caseMachine';
import { formatDateTimeIST } from '../../lib/format';
import type { TabViewProps } from '../alerts/tabViews';

export function NotesTab({ alert }: TabViewProps) {
  const { state } = useStore();
  const { addNote } = useCaseActions();
  const [text, setText] = useState('');
  const notes = state.notes.filter((n) => n.alertId === alert.id);
  const log = state.activity.filter((a) => a.alertId === alert.id);
  const c = state.cases.find((x) => x.alertId === alert.id);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">
      <Card>
        <CardHeader title="Notes" />
        <form className="px-4 pb-3" onSubmit={(e) => { e.preventDefault(); if (addNote(alert.id, text)) setText(''); }}>
          <label htmlFor="note" className="sr-only">Add a note</label>
          <textarea id="note" value={text} maxLength={NOTE_MAX} onChange={(e) => setText(e.target.value)} rows={3}
            placeholder="Add an investigation note…" className="w-full rounded-md border border-line p-2 text-sm" />
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[11px] text-muted">{text.length}/{NOTE_MAX}</span>
            <Button type="submit" size="sm">Add note</Button>
          </div>
        </form>
        {notes.length === 0 ? <EmptyState title="No notes yet" /> : (
          <ul className="divide-y divide-line px-4 pb-3" aria-label="Notes">
            {[...notes].reverse().map((n) => (
              <li key={n.id} className="py-2.5 text-sm">
                <p className="text-[11px] text-muted">{n.author} · {formatDateTimeIST(n.at)}</p>
                <p className="whitespace-pre-wrap break-words">{n.text}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader title="Activity log" />
        <div className="px-4 pb-2 text-xs text-muted">{c ? `${c.id} · ${c.assignedTo ?? 'unassigned'}` : 'No case yet: assign the alert to open one.'}</div>
        {log.length === 0 ? <EmptyState title="No activity yet" /> : (
          <ol className="space-y-2 px-4 pb-4" aria-label="Activity log">
            {log.map((a) => (
              <li key={a.id} className="border-l-2 border-primary/40 pl-3 text-xs">
                <p>{a.text}</p><p className="text-[11px] text-muted">{a.actor} · {formatDateTimeIST(a.at)}</p>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
