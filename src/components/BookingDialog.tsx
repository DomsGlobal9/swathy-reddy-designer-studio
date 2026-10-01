import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  XIcon,
  AlertCircleIcon,
  Loader2Icon,
  ChevronDownIcon,
  CheckIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from 'lucide-react';
import { setScrollLocked } from '../hooks/useSmoothScroll';
import { easeOut } from '../utils/format';
import { sendAppointmentEmail } from '../lib/email';

type BookingDialogProps = {
  open: boolean;
  onClose: () => void;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  occasion: string;
  date: string;
  mode: 'boutique' | 'video';
  notes: string;
};

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'date', string>>;

const initialForm: FormState = {
  name: '',
  phone: '',
  email: '',
  occasion: 'Wedding',
  date: '',
  mode: 'boutique',
  notes: ''
};

const occasionOptions = ['Wedding', 'Bridal trousseau', 'Festive', 'Everyday wardrobe'];

/* ── Custom Luxury Dropdown ───────────────────────────────────────────────────────── */

function LuxuryOccasionSelect({
  value,
  onChange,
  options
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', onOutsideClick);
    }
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [open]);

  return (
    <div ref={containerRef} className="relative block">
      <span className="text-[12px] uppercase tracking-[0.2em] text-stone">Occasion</span>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-2 flex w-full items-center justify-between border-b border-ink/25 bg-transparent py-2.5 text-left text-[15px] text-ink outline-none transition-colors duration-200 hover:border-ink focus:border-ink"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{value}</span>
        <ChevronDownIcon
          className={`h-4 w-4 text-stone transition-transform duration-200 ${
            open ? 'rotate-180 text-ink' : ''
          }`}
          strokeWidth={1.5}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-sm border border-ink/15 bg-ivory shadow-[0_12px_32px_-4px_rgba(29,24,21,0.15)]"
          >
            {options.map((option) => {
              const selected = option === value;
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-[14px] transition-colors duration-150 ${
                    selected
                      ? 'bg-ink text-ivory font-medium'
                      : 'text-ink hover:bg-oxblood/10 hover:text-oxblood'
                  }`}
                >
                  <span>{option}</span>
                  {selected && <CheckIcon className="h-4 w-4 text-ivory shrink-0" strokeWidth={1.75} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Custom Luxury Calendar Date Picker ───────────────────────────────────────────── */

function LuxuryDatePicker({
  value,
  minDate,
  onChange,
  hasError
}: {
  value: string;
  minDate: string;
  onChange: (dateStr: string) => void;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );

  useEffect(() => {
    const onOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', onOutsideClick);
    }
    return () => document.removeEventListener('mousedown', onOutsideClick);
  }, [open]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const min = minDate ? new Date(minDate + 'T00:00:00') : new Date();
  min.setHours(0, 0, 0, 0);

  const prevDisabled = new Date(year, month, 1) <= new Date(min.getFullYear(), min.getMonth(), 1);

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      })
    : '';

  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div ref={containerRef} className="relative block">
      <span className="text-[12px] uppercase tracking-[0.2em] text-stone">Date</span>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`mt-2 flex w-full items-center justify-between border-b bg-transparent py-2.5 text-left text-[15px] outline-none transition-colors duration-200 ${
          hasError
            ? 'border-oxblood text-oxblood'
            : open
            ? 'border-ink text-ink'
            : 'border-ink/25 text-ink hover:border-ink focus:border-ink'
        }`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={displayValue ? 'text-ink' : 'text-stone/60'}>
          {displayValue || 'Choose date'}
        </span>
        <CalendarIcon className="h-4 w-4 text-stone" strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full z-50 mt-2 w-[285px] rounded-sm border border-ink/15 bg-ivory p-3.5 shadow-[0_16px_36px_-6px_rgba(29,24,21,0.18)]"
          >
            {/* Header: Month Year + Prev/Next buttons */}
            <div className="flex items-center justify-between border-b border-ink/10 pb-2.5">
              <button
                type="button"
                onClick={prevMonth}
                disabled={prevDisabled}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5 disabled:pointer-events-none disabled:opacity-20"
                aria-label="Previous month"
              >
                <ChevronLeftIcon className="h-4 w-4" strokeWidth={1.5} />
              </button>

              <span className="font-display text-[15px] font-medium text-ink">
                {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </span>

              <button
                type="button"
                onClick={nextMonth}
                className="flex h-7 w-7 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
                aria-label="Next month"
              >
                <ChevronRightIcon className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Weekdays */}
            <div className="mt-2.5 grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wider text-stone/70">
              {weekdays.map((w) => (
                <div key={w} className="py-1">
                  {w}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="mt-1 grid grid-cols-7 gap-1 text-center text-[13px]">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const thisDate = new Date(year, month, day);
                thisDate.setHours(0, 0, 0, 0);

                const isDisabled = thisDate < min;
                const isSelected = dStr === value;

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => {
                      onChange(dStr);
                      setOpen(false);
                    }}
                    className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-[13px] transition-all duration-150 ${
                      isSelected
                        ? 'bg-ink font-medium text-ivory shadow-xs'
                        : isDisabled
                        ? 'cursor-not-allowed text-stone/30'
                        : 'text-ink hover:bg-oxblood/10 hover:text-oxblood'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Booking Dialog ──────────────────────────────────────────────────────────── */

export function BookingDialog({ open, onClose }: BookingDialogProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (!open) return;
    setScrollLocked(true);
    const timer = window.setTimeout(() => firstFieldRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      setScrollLocked(false);
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (status === 'error') setStatus('idle');
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!form.name.trim()) next.name = 'Please tell us your name.';
    if (!/^[+\d][\d\s-]{9,}$/.test(form.phone.trim())) next.phone = 'Enter a valid phone number.';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Enter a valid email address.';
    }
    if (!form.date) next.date = 'Choose a preferred date.';
    setErrors(next);
    if (Object.keys(next).length) return;

    setStatus('submitting');
    setSubmitError(null);

    const result = await sendAppointmentEmail({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      occasion: form.occasion,
      date: form.date,
      mode: form.mode,
      notes: form.notes.trim() || undefined
    });

    if (result.success) {
      setIsSimulated(Boolean(result.simulated));
      setStatus('success');
    } else {
      setStatus('error');
      setSubmitError(result.message || "Please try again in a moment, or reach out to us directly via phone or WhatsApp.");
    }
  };

  const reset = () => {
    setForm(initialForm);
    setErrors({});
    setStatus('idle');
    setSubmitError(null);
    setIsSimulated(false);
  };

  const fieldCls =
    'mt-2 w-full border-b border-ink/25 bg-transparent py-2.5 text-[15px] text-ink outline-none transition-colors duration-200 placeholder:text-stone/60 focus:border-ink';

  return (
    <AnimatePresence onExitComplete={reset}>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-ink/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col overflow-y-auto overflow-x-hidden bg-ivory px-6 py-6 md:px-10 md:py-8"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.28, ease: easeOut }}
            data-lenis-prevent
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img src="/sr-logo.png" alt="SR" className="h-6 w-auto object-contain" />
                <p className="font-display text-base italic text-oxblood">Personal styling</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close booking"
                className="text-ink transition-colors hover:text-oxblood"
              >
                <XIcon className="h-5 w-5" strokeWidth={1.25} />
              </button>
            </div>

            {status === 'success' ? (
              <div className="flex flex-1 flex-col justify-center py-10">
                <h2 id="booking-title" className="font-display text-5xl leading-[1]">
                  Thank you,
                  <br />
                  <em>{form.name.split(' ')[0]}.</em>
                </h2>
                <p className="mt-6 text-[15px] leading-relaxed text-stone">
                  We've received your request for a {form.mode === 'boutique' ? 'boutique visit' : 'video call'} for{' '}
                  {form.occasion.toLowerCase()} on{' '}
                  {new Date(form.date + 'T00:00:00').toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                  . A stylist will call{' '}
                  <strong className="font-medium text-ink">{form.phone}</strong> within 24 hours to confirm your time.
                </p>
                {form.email && (
                  <p className="mt-3 text-[13px] text-stone">
                    A booking summary has also been addressed to{' '}
                    <span className="text-ink underline">{form.email}</span>.
                  </p>
                )}
                {isSimulated && (
                  <div className="mt-6 rounded border border-stone/20 bg-stone/5 p-3 text-[12px] text-stone">
                    <strong>Note:</strong> Set your EmailJS keys in <code>.env</code> to deliver live emails directly to your inbox.
                  </div>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-10 self-start bg-ink px-7 py-4 text-[12px] font-medium uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-oxblood"
                >
                  Back to the story
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="mt-10 flex flex-1 flex-col">
                <h2 id="booking-title" className="font-display text-4xl leading-[1.05] md:text-5xl">
                  Book an <em>appointment</em>
                </h2>
                <p className="mt-4 text-[14px] leading-relaxed text-stone">
                  Tell us a little about the occasion. We'll prepare a rail of pieces before you arrive.
                </p>

                {status === 'error' && (
                  <div className="mt-6 flex items-start gap-3 border border-oxblood/30 bg-oxblood/5 p-3.5 text-[13px] text-oxblood">
                    <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0" />
                    <div>
                      <p className="font-medium">Can't send email right now</p>
                      <p className="mt-0.5 text-stone">
                        {submitError || "Please try again in a moment, or reach out to us directly via phone or WhatsApp."}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-8 space-y-6">
                  <label className="block">
                    <span className="text-[12px] uppercase tracking-[0.2em] text-stone">Your name</span>
                    <input
                      ref={firstFieldRef}
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      className={fieldCls}
                      placeholder="Ananya Rao"
                      aria-invalid={!!errors.name}
                    />
                    {errors.name && <span className="mt-1.5 block text-[13px] text-oxblood">{errors.name}</span>}
                  </label>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-[12px] uppercase tracking-[0.2em] text-stone">Phone</span>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        className={fieldCls}
                        placeholder="+91 98765 43210"
                        aria-invalid={!!errors.phone}
                      />
                      {errors.phone && <span className="mt-1.5 block text-[13px] text-oxblood">{errors.phone}</span>}
                    </label>

                    <label className="block">
                      <span className="text-[12px] uppercase tracking-[0.2em] text-stone">Email (optional)</span>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        className={fieldCls}
                        placeholder="ananya@example.com"
                        aria-invalid={!!errors.email}
                      />
                      {errors.email && <span className="mt-1.5 block text-[13px] text-oxblood">{errors.email}</span>}
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <LuxuryOccasionSelect
                      value={form.occasion}
                      onChange={(val) => update('occasion', val)}
                      options={occasionOptions}
                    />

                    <div>
                      <LuxuryDatePicker
                        value={form.date}
                        minDate={today}
                        onChange={(val) => update('date', val)}
                        hasError={!!errors.date}
                      />
                      {errors.date && <span className="mt-1.5 block text-[13px] text-oxblood">{errors.date}</span>}
                    </div>
                  </div>

                  <fieldset>
                    <legend className="text-[12px] uppercase tracking-[0.2em] text-stone">Where</legend>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {(
                        [
                          ['boutique', 'In the boutique'],
                          ['video', 'Video call']
                        ] as const
                      ).map(([value, label]) => (
                        <label
                          key={value}
                          className={`cursor-pointer border px-4 py-3 text-center text-[14px] transition-colors duration-200 ${
                            form.mode === value ? 'border-ink bg-ink text-ivory' : 'border-ink/25 text-ink hover:border-ink'
                          }`}
                        >
                          <input
                            type="radio"
                            name="mode"
                            value={value}
                            checked={form.mode === value}
                            onChange={() => update('mode', value)}
                            className="sr-only"
                          />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <label className="block">
                    <span className="text-[12px] uppercase tracking-[0.2em] text-stone">
                      Styling notes / preferences (optional)
                    </span>
                    <input
                      type="text"
                      value={form.notes}
                      onChange={(e) => update('notes', e.target.value)}
                      className={fieldCls}
                      placeholder="e.g. looking for soft pastel Kanchipuram silks"
                    />
                  </label>
                </div>

                <div className="min-h-[2rem] flex-1" aria-hidden="true" />
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="flex w-full items-center justify-center gap-2 bg-ink px-7 py-4 text-[12px] font-medium uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-oxblood disabled:cursor-wait disabled:opacity-70"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                      <span>Sending request…</span>
                    </>
                  ) : (
                    <span>Request appointment</span>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}