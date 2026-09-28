import { useCallback } from 'react';
import { useStore } from '../../data/store';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../ui';
import { NOTE_MAX, canTransition, transitionError } from './caseMachine';
import { DECISION_LABEL, type AlertStatusT, type AlertT, type CaseT, type DecisionTypeT } from '../../types/contract';

let seq = 0;
const nextCaseId = (cases: CaseT[]) => `CASE-${String(Math.max(0, ...cases.map((c) => Number(c.id.slice(5)))) + 1).padStart(3, '0')}`;
const priorityOf = (a: AlertT): CaseT['priority'] => (a.level === 'HIGH' ? 'High' : a.level === 'MEDIUM' ? 'Medium' : 'Low');

/**
 * Case workflow actions. All state is in memory (a reload resets it, by design in this prototype) and timestamps use the
 * fixture as-of time so the demo is deterministic.
 */
export function useCaseActions() {
  const { state, dispatch } = useStore();
  const { user } = useAuth();
  const { push } = useToast();
  const now = state.core?.meta.asOf ?? '2024-04-30T18:00:00+05:30';
  const actor = user?.name ?? 'Unknown user';

  const log = useCallback((alertId: string, text: string) => {
    seq += 1;
    dispatch({ type: 'LOG', entry: { id: `act-${seq}`, alertId, at: now, actor, text } });
  }, [dispatch, now, actor]);

  const find = (alertId: string) => state.alerts.find((a) => a.id === alertId);

  const assign = useCallback((alertId: string, assignee: string, title?: string): boolean => {
    const alert = state.alerts.find((a) => a.id === alertId);
    if (!alert) return false;
    if (alert.status === 'CLOSED') { push('This case is closed and cannot be reassigned.', 'error'); return false; }
    if (!assignee) { push('Choose an investigator.', 'error'); return false; }
    const existing = state.cases.find((c) => c.alertId === alertId);
    if (!existing) {
      const created: CaseT = {
        id: nextCaseId(state.cases), alertId, title: title?.trim() || alert.title, priority: priorityOf(alert),
        status: 'ASSIGNED', assignedTo: assignee, createdAt: now, decision: null,
      };
      dispatch({ type: 'UPSERT_CASE', case: created });
      dispatch({ type: 'UPDATE_ALERT', id: alertId, patch: { assignedTo: assignee, status: canTransition(alert.status, 'ASSIGNED') ? 'ASSIGNED' : alert.status } });
      log(alertId, `${created.id} created and assigned to ${assignee}`);
      push(`${created.id} created and assigned to ${assignee}`, 'success');
    } else {
      dispatch({ type: 'UPSERT_CASE', case: { ...existing, assignedTo: assignee } });
      dispatch({ type: 'UPDATE_ALERT', id: alertId, patch: { assignedTo: assignee } });
      log(alertId, `Reassigned from ${existing.assignedTo ?? 'nobody'} to ${assignee}`);
      push(`Reassigned to ${assignee}`, 'success');
    }
    return true;
  }, [state.alerts, state.cases, dispatch, push, log, now]);

  const setStatus = useCallback((alertId: string, to: AlertStatusT): boolean => {
    const alert = find(alertId);
    if (!alert) return false;
    const err = transitionError(alert.status, to);
    if (err) { push(err, 'error'); return false; }
    if (to === 'DECIDED') { push('Record a decision with a rationale to decide a case.', 'error'); return false; }
    const c = state.cases.find((x) => x.alertId === alertId);
    if (!c && to !== 'UNDER_REVIEW') { push('Assign the alert to an investigator first.', 'error'); return false; }
    dispatch({ type: 'UPDATE_ALERT', id: alertId, patch: { status: to, closedAt: to === 'CLOSED' ? now : alert.closedAt } });
    if (c) dispatch({ type: 'UPSERT_CASE', case: { ...c, status: to } });
    log(alertId, `Status changed from ${alert.status} to ${to}`);
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.alerts, state.cases, dispatch, push, log, now]);

  const decide = useCallback((alertId: string, type: DecisionTypeT, rationale: string): boolean => {
    const alert = find(alertId);
    const c = state.cases.find((x) => x.alertId === alertId);
    if (!alert || !c) { push('Assign the alert to an investigator first.', 'error'); return false; }
    if (!rationale.trim()) { push('A decision needs a rationale.', 'error'); return false; }
    const err = transitionError(alert.status, 'DECIDED');
    if (err) { push(err, 'error'); return false; }
    dispatch({ type: 'UPDATE_ALERT', id: alertId, patch: { status: 'DECIDED' } });
    dispatch({ type: 'UPSERT_CASE', case: { ...c, status: 'DECIDED', decision: { type, rationale: rationale.trim(), at: now, by: actor } } });
    log(alertId, `Decision recorded: ${DECISION_LABEL[type]}`);
    push(`Decision recorded: ${DECISION_LABEL[type]}`, 'success');
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.alerts, state.cases, dispatch, push, log, now, actor]);

  const addNote = useCallback((alertId: string, text: string): boolean => {
    const t = text.trim();
    if (!t) { push('A note cannot be empty.', 'error'); return false; }
    if (t.length > NOTE_MAX) { push(`A note can be at most ${NOTE_MAX} characters.`, 'error'); return false; }
    seq += 1;
    dispatch({ type: 'ADD_NOTE', note: { id: `note-${seq}`, alertId, author: actor, at: now, text: t } });
    log(alertId, 'Note added');
    return true;
  }, [dispatch, push, log, now, actor]);

  return { assign, setStatus, decide, addNote, actor };
}
