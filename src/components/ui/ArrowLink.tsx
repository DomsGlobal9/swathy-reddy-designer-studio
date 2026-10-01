import React from 'react';
import { ArrowRightIcon } from 'lucide-react';

type ArrowLinkProps = {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  tone?: 'ink' | 'ivory';
  className?: string;
  external?: boolean;
};

export function ArrowLink({ children, onClick, href, tone = 'ink', className = '', external }: ArrowLinkProps) {
  const text = tone === 'ivory' ? 'text-ivory' : 'text-ink';
  const bar = tone === 'ivory' ? 'bg-ivory' : 'bg-ink';
  const cls = `group inline-flex items-center gap-3 whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.22em] ${text} focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 ${className}`;
  const content =
  <>
      <span className="relative">
        {children}
        <span
        className={`absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-[0.3] ${bar} transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-x-100`} />
      
      </span>
      <ArrowRightIcon
      className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1"
      strokeWidth={1.25} />
    
    </>;

  if (href) {
    return (
      <a href={href} className={cls} {...external ? { target: '_blank', rel: 'noreferrer' } : {}}>
        {content}
      </a>);

  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {content}
    </button>);

}