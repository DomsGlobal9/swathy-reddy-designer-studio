type ChapterMarkProps = {
  label: string;
  tone?: 'oxblood' | 'ivory';
  className?: string;
};

export function ChapterMark({ label, tone = 'oxblood', className = '' }: ChapterMarkProps) {
  const color = tone === 'ivory' ? 'text-ivory/80' : 'text-oxblood';
  return (
    <p className={`font-display text-base md:text-lg ${color} ${className}`}>
      {label}
    </p>);

}
