import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

/** Modal on the native <dialog>: browser-managed focus trap, Esc to close, focus restored on close. */
export function Modal({ open, title, onClose, children, footer, width = 'max-w-md' }: {
  open: boolean; title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; width?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      opener.current = document.activeElement;
      if (typeof d.showModal === 'function') d.showModal();
      else d.setAttribute('open', '');
    } else if (!open && d.open) {
      if (typeof d.close === 'function') d.close();
      else d.removeAttribute('open');
      (opener.current as HTMLElement | null)?.focus?.();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      className={`m-auto w-full ${width} rounded-lg border border-line bg-surface p-0 text-ink shadow-xl`}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); onClose(); } }}
    >
      {open ? (
        <div>
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <h2 id="modal-title" className="text-base font-semibold">{title}</h2>
            <button type="button" aria-label="Close dialog" className="rounded p-1 text-muted hover:bg-page" onClick={onClose}><X size={16} /></button>
          </div>
          <div className="px-5 py-4">{children}</div>
          {footer ? <div className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}
