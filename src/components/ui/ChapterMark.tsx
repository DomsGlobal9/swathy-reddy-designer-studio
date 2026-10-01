type ChapterMarkProps = {
  numeral: string;
  label: string;
  tone?: 'oxblood' | 'ivory';
  className?: string;
};

export function ChapterMark({ numeral, label, tone = 'oxblood', className = '' }: ChapterMarkProps) {
  const color = tone === 'ivory' ? 'text-ivory/80' : 'text-oxblood';
  return (
    <p className={`font-display text-base italic md:text-lg ${color} ${className}`}>
      {numeral}. <span className="not-italic">{label}</span>
    </p>);

}