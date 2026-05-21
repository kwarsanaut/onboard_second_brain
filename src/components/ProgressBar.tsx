import { cn } from '@/lib/utils';

interface Props {
  value: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function ProgressBar({ value, showLabel = true, size = 'md' }: Props) {
  const color = value >= 100 ? 'bg-emerald-500' : value >= 60 ? 'bg-orange-500' : value >= 30 ? 'bg-orange-400' : 'bg-stone-200';
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-stone-400">Progress</span>
          <span className="font-bold text-stone-600">{value}%</span>
        </div>
      )}
      <div className={cn('w-full bg-stone-100 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2')}>
        <div className={cn('rounded-full transition-all duration-500 ease-out', color)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
