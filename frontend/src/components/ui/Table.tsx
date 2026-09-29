import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';

export function Table({ children, className = '', label }: { children: ReactNode; className?: string; label?: string }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border-collapse text-left text-xs" aria-label={label}>{children}</table>
    </div>
  );
}

export function Th({ className = '', children, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th scope="col" className={`whitespace-nowrap border-b border-line px-3 py-2 text-[11px] font-medium text-muted ${className}`} {...rest}>
      {children}
    </th>
  );
}

export function Td({ className = '', children, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={`border-b border-line/70 px-3 py-2.5 align-middle text-ink ${className}`} {...rest}>{children}</td>;
}

export function Tr({ className = '', children, onClick, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`transition-colors duration-150 ${onClick ? 'cursor-pointer hover:bg-primary-soft/60' : ''} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </tr>
  );
}
