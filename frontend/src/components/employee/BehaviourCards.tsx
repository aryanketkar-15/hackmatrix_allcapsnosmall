import { Clock3, FolderOutput, ShieldAlert, Gauge } from 'lucide-react';
import { Tooltip } from '../ui';
import type { EmployeeT } from '../../types/contract';
import { SIGNAL_DISCLAIMER } from './signalDefinitions';

const OVERALL_TONE = { Low: 'border-green-200 bg-green-50 text-green-800', Medium: 'border-orange-200 bg-orange-50 text-orange-900', High: 'border-red-200 bg-red-50 text-red-800' };

export function BehaviourCards({ employee }: { employee: EmployeeT }) {
  const b = employee.behaviour;
  const cards = [
    { icon: Clock3, title: 'Unusual Time Activity', text: b.unusualTime, tone: 'border-red-200 bg-red-50 text-red-800' },
    { icon: FolderOutput, title: 'Access Outside Portfolio', text: b.outsidePortfolio, tone: 'border-orange-200 bg-orange-50 text-orange-900' },
    { icon: ShieldAlert, title: 'High-Risk Actions', text: b.highRisk, tone: 'border-red-200 bg-red-50 text-red-800' },
  ];
  return (
    <section aria-label="Behavioural analysis">
      <h3 className="mb-2 text-sm font-semibold">Behavioural Analysis</h3>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map(({ icon: Icon, title, text, tone }) => (
          <div key={title} className={`flex items-start gap-2.5 rounded-lg border p-3 ${tone}`}>
            <Icon size={18} aria-hidden />
            <div><p className="text-xs font-semibold">{title}</p><p className="text-[11px]">{text}</p></div>
          </div>
        ))}
        <div className={`flex items-start gap-2.5 rounded-lg border p-3 ${OVERALL_TONE[b.overall]}`}>
          <Gauge size={18} aria-hidden />
          <div>
            <p className="flex items-center gap-1 text-xs font-semibold">Overall Risk <Tooltip text={SIGNAL_DISCLAIMER}><span className="cursor-help text-[10px] underline">?</span></Tooltip></p>
            <p className="text-sm font-bold">{b.overall}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
