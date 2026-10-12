import { useEffect, useState } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';

type Part = { key: string; label: string };

/**
 * Design inspiration photos, one slim row per product part (Border, Pallu...).
 * Picking photos adds to the ones already chosen, and the total across all parts is capped at
 * maxPhotos, the same limit the CRM enforces.
 */
export function DesignPhotos({
  parts,
  maxPhotos,
  photos,
  onChange
}: {
  parts: Part[];
  maxPhotos: number;
  photos: Record<string, File[]>;
  onChange: (photos: Record<string, File[]>) => void;
}) {
  const [note, setNote] = useState('');
  const total = Object.values(photos).reduce((n, files) => n + files.length, 0);
  const full = total >= maxPhotos;

  const add = (partKey: string, picked: File[]) => {
    const room = maxPhotos - total;
    setNote(picked.length > room ? `Only ${maxPhotos} photos in total, so ${picked.length - room} ${picked.length - room === 1 ? 'was' : 'were'} left out.` : '');
    if (room > 0) onChange({ ...photos, [partKey]: [...(photos[partKey] ?? []), ...picked.slice(0, room)] });
  };

  const remove = (partKey: string, index: number) => {
    setNote('');
    onChange({ ...photos, [partKey]: photos[partKey].filter((_, i) => i !== index) });
  };

  return (
    <div className="pt-5 border-t border-ink/10">
      <div className="mb-1 flex items-baseline justify-between">
        <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">Design Inspiration Photos</span>
        <span className={`text-[11px] ${full ? 'text-oxblood' : 'text-stone'}`}>{total} of {maxPhotos}</span>
      </div>
      <p className="mb-3 text-[12px] text-stone">Optional. Add photos under the part they show.</p>

      <ul className="divide-y divide-ink/10 border-y border-ink/10">
        {parts.map((part) => {
          const files = photos[part.key] ?? [];
          return (
            <li key={part.key} className="py-2.5">
              <div className="flex items-center gap-3">
                <span className="min-w-0 flex-1 text-[13px] text-ink">{part.label}</span>
                <label
                  aria-disabled={full}
                  className={`flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-sm border border-dashed border-ink/30 px-3 text-[11px] uppercase tracking-wider text-ink transition-colors hover:border-ink/60 hover:bg-white/60 has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-ink ${full ? 'pointer-events-none opacity-40' : ''}`}>
                  <PlusIcon className="h-4 w-4" aria-hidden="true" />
                  <span>Add<span className="sr-only"> {part.label} photo</span></span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    multiple
                    disabled={full}
                    className="sr-only"
                    onChange={(e) => {
                      add(part.key, Array.from(e.target.files ?? []));
                      e.target.value = ''; // lets the same photo be picked again after removing it
                    }}
                  />
                </label>
              </div>
              {files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 pt-1.5">
                  {files.map((file, i) => (
                    <Thumb key={`${file.name}-${file.lastModified}-${i}`} file={file} label={part.label} onRemove={() => remove(part.key, i)} />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {note && <p role="status" className="mt-2 text-[12px] text-oxblood">{note}</p>}
    </div>
  );
}

function Thumb({ file, label, onRemove }: { file: File; label: string; onRemove: () => void }) {
  const [url, setUrl] = useState('');
  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return (
    <div className="relative h-11 w-11">
      {url && <img src={url} alt={`${label} photo`} className="h-full w-full rounded-sm object-cover" />}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} photo`}
        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-ink/20 bg-ivory text-ink shadow-sm hover:bg-oxblood hover:text-ivory">
        <XIcon className="h-3 w-3" aria-hidden="true" />
      </button>
    </div>
  );
}
