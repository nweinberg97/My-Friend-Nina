// "Little moments": a gentle look back. Each day is a bubble in the colour of
// how that day felt; it fills up with the things you did for yourself.
// Empty days are just small open circles, never red or crossed out.
import { useApp } from '../lib/store';
import { addDays, parseLocal, relativeDay } from '../lib/dates';
import { STATE_COLOR, cx } from './ui';
import { Moon } from './Icons';

export function useMoments(days: number) {
  const { data, today } = useApp();
  const list = Array.from({ length: days }, (_, i) => addDays(today, i - (days - 1))).map((d) => ({
    date: d,
    state: data.checkins[d]?.state,
    count: data.completions.filter((c) => c.date === d).length + data.reflections.filter((r) => r.createdAt.slice(0, 10) === d).length,
  }));
  const showedUp = list.filter((x) => x.count > 0 || x.state === 'rest').length;
  return { list, showedUp, today };
}

export function MomentBubbles({ days, showLabels }: { days: number; showLabels?: boolean }) {
  const { list, today } = useMoments(days);
  return (
    <div className={cx('grid gap-x-1.5 gap-y-2', 'grid-cols-7')}>
      {list.map(({ date, state, count }) => {
        const c = state ? STATE_COLOR[state] : undefined;
        const isToday = date === today;
        const size = count === 0 ? 0.42 : Math.min(1, 0.62 + count * 0.1);
        const label = `${relativeDay(date, today)}: ${state === 'rest' && !count ? 'rest day' : `${count} little moment${count === 1 ? '' : 's'}`}`;
        return (
          <div key={date} className="flex flex-col items-center gap-1" title={label}>
            <div className="grid aspect-square w-full max-w-[44px] place-items-center">
              {state === 'rest' && count === 0 ? (
                <span className="grid size-[78%] place-items-center rounded-full text-white" style={{ background: `linear-gradient(150deg, ${STATE_COLOR.rest.solid}, #3E8C86)` }}>
                  <Moon size={15} />
                </span>
              ) : count === 0 ? (
                <span className={cx('rounded-full border-2 border-dashed border-line', isToday && 'border-accent')} style={{ width: `${size * 100}%`, height: `${size * 100}%` }} />
              ) : (
                <span
                  className="grid place-items-center rounded-full text-[12px] font-bold text-white shadow-[0_6px_14px_-8px_rgba(42,26,46,.6)]"
                  style={{ width: `${size * 100}%`, height: `${size * 100}%`, background: `radial-gradient(circle at 30% 25%, ${c?.hi ?? '#FFC93C'}, ${c?.solid ?? '#E6005C'} 70%)` }}
                >
                  {count}
                </span>
              )}
            </div>
            {showLabels && (
              <span className={cx('text-[11px]', isToday ? 'font-bold text-ink' : 'text-muted')}>
                {isToday ? 'today' : parseLocal(date).toLocaleDateString(undefined, { weekday: 'narrow' })}
              </span>
            )}
            <span className="sr-only">{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function MomentLegend() {
  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted" aria-hidden="true">
      {(['high', 'steady', 'low'] as const).map((s) => (
        <span key={s} className="inline-flex items-center gap-1"><span className="size-2.5 rounded-full" style={{ background: STATE_COLOR[s].solid }} />{s === 'high' ? 'high energy' : s === 'low' ? 'low battery' : 'steady'}</span>
      ))}
      <span className="inline-flex items-center gap-1"><span className="size-2.5 rounded-full" style={{ background: STATE_COLOR.rest.solid }} />rest</span>
    </div>
  );
}
