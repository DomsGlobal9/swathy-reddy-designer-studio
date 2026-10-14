import { useEffect, useState } from 'react';
import { openStatus } from '../../data/contact';

/** The live open/closed line, refreshed every minute. */
export function OpenNow() {
  const [status, setStatus] = useState(() => openStatus());
  useEffect(() => {
    const t = setInterval(() => setStatus(openStatus()), 60_000);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="inline-flex items-center gap-3 rounded-full border border-ivory/30 bg-ink/30 px-4 py-2 text-[12px] font-medium uppercase tracking-[0.18em] text-ivory backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        {status.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9FD3A8] opacity-70 motion-reduce:animate-none" />}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${status.open ? 'bg-[#9FD3A8]' : 'bg-[#F9DE84]'}`} />
      </span>
      {status.text}
    </p>
  );
}
