import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

interface ToastItem { id: number; message: string; tone: 'info' | 'error' | 'success' }
interface ToastApi { push: (message: string, tone?: ToastItem['tone']) => void }

const Ctx = createContext<ToastApi>({ push: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const push = useCallback((message: string, tone: ToastItem['tone'] = 'info') => {
    const id = nextId.current++;
    setItems((cur) => [...cur, { id, message, tone }]);
    setTimeout(() => setItems((cur) => cur.filter((t) => t.id !== id)), 3500);
  }, []);
  const api = useMemo(() => ({ push }), [push]);
  const tone = { info: 'bg-ink', error: 'bg-risk-high', success: 'bg-risk-explained' };
  return (
    <Ctx.Provider value={api}>
      {children}
      <div aria-live="polite" className="no-print fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {items.map((t) => (
          <div key={t.id} role="status" className={`animate-slide-in rounded-md px-3.5 py-2 text-sm text-white shadow-lg ${tone[t.tone]}`}>{t.message}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
