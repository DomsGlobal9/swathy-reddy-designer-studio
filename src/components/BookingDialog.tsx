import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  XIcon,
  AlertCircleIcon,
  Loader2Icon,
  ChevronDownIcon,
  CheckIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MailIcon,
  SendIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  ArrowLeftIcon,
  MessageSquareIcon,
  RefreshCwIcon
} from 'lucide-react';
import { setScrollLocked } from '../hooks/useSmoothScroll';
import { easeOut } from '../utils/format';
import { sendAppointmentEmail } from '../lib/email';
import {
  fetchCustomerProfile,
  fetchPortalProducts,
  fetchProductMeasurements,
  fetchProductParts,
  formatBoutiqueErrorMessage,
  normalizeIndianMobile,
  requestWhatsAppOtp,
  submitPortalCustomer,
  submitPortalRequirement,
  verifyWhatsAppOtp
} from '../lib/scaleezyPortal';

import type {
  DressDetails,
  MeasurementUnit,
  PortalCustomerPayload,
  PortalProduct,
  PortalRequirementPayload,
  PortalMeasurementDef,
  PortalPartsResponse
} from '../types/booking';
import { COUNTRY_CODES } from '../data/countryCodes';
import { shrinkPhotos } from '../lib/shrinkPhotos';
import { DesignPhotos } from './DesignPhotos';

type BookingDialogProps = {
  open: boolean;
  onClose: () => void;
};

type FormState = {
  // Step 1: Client & Consultation
  name: string;
  phone: string;
  countryCode: string;
  email: string;
  city: string;
  occasion: string;
  date: string;
  mode: 'boutique' | 'video';
  preferredCommunication: 'WhatsApp' | 'Call' | 'Email';
  notes: string;

  // Step 2: Dress & Outfit (one or more garments, each with its own details)
  garments: Garment[];
  customDressName: string;

  // Step 3: Boutique Measurements (Dynamic, per garment)
  unit: MeasurementUnit;
  
  // General Notes
  additionalNotes: string;

  // Honeypot
  companyWebsite: string;
};

/** One garment in the request. Each goes to the CRM as its own requirement, with its own sizes and photos. */
type Garment = {
  key: string;
  fabric: string;
  craft: string;
  requests: string;
  measurements: Record<string, string>;
  photos: Record<string, File[]>;
};

const newGarment = (key: string): Garment => ({
  key,
  fabric: 'Pure Kanchipuram Silk',
  craft: 'Maggam / Aari Hand Embroidery',
  requests: '',
  measurements: {},
  photos: {}
});

/** The CRM takes inches; a value typed in cm is converted. Empty or non-numeric values are skipped. */
function measurementsInInches(values: Record<string, string>, unit: MeasurementUnit): Record<string, number> | undefined {
  const out: Record<string, number> = {};
  for (const [key, raw] of Object.entries(values)) {
    const n = parseFloat(raw);
    if (Number.isFinite(n)) out[key] = Math.round((unit === 'cm' ? n / 2.54 : n) * 100) / 100;
  }
  return Object.keys(out).length ? out : undefined;
}

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'date', string>>;

const initialForm: FormState = {
  // Client & Consultation
  name: '',
  phone: '',
  countryCode: '+91',
  email: '',
  city: 'Hyderabad',
  occasion: 'Wedding',
  date: '',
  mode: 'boutique',
  preferredCommunication: 'WhatsApp',
  notes: '',

  // Dress & Outfit
  garments: [],
  customDressName: '',

  // Boutique Measurements
  unit: 'in',
  additionalNotes: '',

  // Honeypot
  companyWebsite: ''
};

const occasionOptions = [
  'Wedding',
  'Bridal trousseau',
  'Festive & Pooja',
  'Reception / Sangeet',
  'Everyday luxury wardrobe'
];

const defaultOutfitCategories = [
  { id: 'Bridal Blouse', label: 'Bridal Blouse', desc: 'Handcrafted zardozi, latkans & aari embroidery' },
  { id: 'Designer Lehenga', label: 'Designer Lehenga', desc: 'Custom flared silhouette & ornate blouse' },
  { id: 'Kanchipuram Saree & Blouse', label: 'Kanchi Saree Styling', desc: 'Pure silk drapery & custom tailored blouse' },
  { id: 'Anarkali & Suit', label: 'Anarkali & Suit', desc: 'Bespoke flare, pure dupattas & detailing' },
  { id: 'Couture Gown', label: 'Couture Gown', desc: 'Contemporary draping & rich textures' },
  { id: 'Indo-Western', label: 'Indo-Western', desc: 'Jacket sets, drape skirts & bespoke co-ords' },
  { id: 'Custom Tailoring', label: 'Custom Tailoring', desc: 'Bespoke pattern crafted from your reference' }
];

const fabricOptions = [
  'Pure Kanchipuram Silk',
  'Raw Silk (Mulberry)',
  'Tissue Silk with Metallic Sheen',
  'Rich Brocade / Banarasi',
  'Pure Organza',
  'Georgette / Chiffon',
  'Velvet',
  'Client Providing Own Fabric'
];

const embroideryOptions = [
  'Maggam / Aari Hand Embroidery',
  'Zardozi & Antique Gold Zari Thread',
  'Pearl & Hand-cut Beads',
  'Subtle Resham Thread Work',
  'Cutwork & Scallop Borders',
  'Clean Minimal Border'
];

function getGarmentDescription(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('blouse')) return 'Handcrafted zardozi, latkans & aari embroidery';
  if (lower.includes('lehenga')) return 'Custom flared silhouette & ornate blouse';
  if (lower.includes('saree')) return 'Pure silk drapery & custom tailored blouse';
  if (lower.includes('anarkali') || lower.includes('suit')) return 'Bespoke flare, pure dupattas & detailing';
  if (lower.includes('gown')) return 'Contemporary draping & rich textures';
  if (lower.includes('indo')) return 'Jacket sets, drape skirts & bespoke co-ords';
  return 'Bespoke pattern crafted to your measurements';
}

/* ── Custom Luxury Dropdown (Replaces ugly native <select>) ────────────────────────── */

function LuxurySelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
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
      <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">{label}</span>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-1.5 flex w-full items-center justify-between border-b border-ink/25 bg-transparent py-2.5 text-left text-[14px] text-ink outline-none transition-colors duration-200 hover:border-ink focus:border-ink"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate pr-2">{value || 'Select an option…'}</span>
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-stone transition-transform duration-200 ${
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
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-sm border border-ink/15 bg-ivory shadow-[0_16px_40px_-6px_rgba(29,24,21,0.2)] py-1"
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
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors duration-150 ${
                    selected
                      ? 'bg-ink text-ivory font-medium'
                      : 'text-ink hover:bg-oxblood/10 hover:text-oxblood'
                  }`}
                >
                  <span className="truncate">{option}</span>
                  {selected && <CheckIcon className="h-4 w-4 text-ivory shrink-0 ml-2" strokeWidth={1.75} />}
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
      <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">Preferred Date</span>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`mt-1.5 flex w-full items-center justify-between border-b bg-transparent py-2.5 text-left text-[14px] outline-none transition-colors duration-200 ${
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
          {displayValue || 'Choose appointment date'}
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

              <span className="font-display text-[14px] font-medium text-ink">
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

            <div className="mt-2.5 grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wider text-stone/70">
              {weekdays.map((w) => (
                <div key={w} className="py-1">
                  {w}
                </div>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-1 text-center text-[12px]">
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
                    className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full text-[12px] transition-all duration-150 ${
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

/* ── Main Booking Dialog with Neat Custom UI Throughout ───────────────────────────── */

export function BookingDialog({ open, onClose }: BookingDialogProps) {
  const [portalProducts, setPortalProducts] = useState<PortalProduct[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [activeTab, setActiveTab] = useState<'consultation' | 'dress' | 'measurements'>('consultation');
  const [errors, setErrors] = useState<Errors>({});
  
  // Local Storage Autocomplete state
  const [savedProfiles, setSavedProfiles] = useState<FormState[]>([]);
  const [suggestedProfile, setSuggestedProfile] = useState<FormState | null>(null);
  const [dismissedSuggestion, setDismissedSuggestion] = useState(false);

  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpStatus, setOtpStatus] = useState<'idle' | 'requesting' | 'verifying' | 'error'>('idle');
  const [preparingPhotos, setPreparingPhotos] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<'autofill' | 'submit'>('submit');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpNote, setOtpNote] = useState<string | null>(null);
  const [portalToken, setPortalToken] = useState<string | null>(null);

  const [submittingAction, setSubmittingAction] = useState<'lead' | 'email' | null>(null);
  const [submissionSuccessType, setSubmissionSuccessType] = useState<'lead' | 'email' | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // New Dynamic States
  // What the CRM asks for each garment, loaded once per garment key.
  const [measureDefs, setMeasureDefs] = useState<Record<string, PortalMeasurementDef[]>>({});
  const [partsByKey, setPartsByKey] = useState<Record<string, PortalPartsResponse | null>>({});
  const requestedKeys = useRef(new Set<string>());
  const [activeGarment, setActiveGarment] = useState<string | null>(null);
  // A retry after a partial failure must not resend what the CRM already has.
  const customerSaved = useRef(false);
  const sentGarments = useRef(new Set<string>());

  const firstFieldRef = useRef<HTMLInputElement>(null);
  const otpInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  // Curated Garment silhouettes using ONLY portal categories
  const availableGarments = useMemo(() => {
    if (portalProducts.length > 0) {
      return portalProducts;
    }
    return defaultOutfitCategories.map((c) => ({ key: c.id, name: c.label }));
  }, [portalProducts]);

  // Fetch product catalogue from Scaleezy Portal on mount
  useEffect(() => {
    fetchPortalProducts().then((res) => {
      if (res && res.length > 0) {
        setPortalProducts(res);
        // Start with the first product picked, as before; more can be added.
        setForm(prev => (prev.garments.length ? prev : { ...prev, garments: [newGarment(res[0].key)] }));
      }
    });
    
    // Load saved profiles from localStorage
    try {
      const stored = localStorage.getItem('atelier_saved_profiles');
      if (stored) {
        setSavedProfiles(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  const [, startTransition] = useTransition();
  const [localPhone, setLocalPhone] = useState(form.phone);

  useEffect(() => {
    setLocalPhone(form.phone);
  }, [form.phone]);

  // Check for autocomplete suggestions when phone changes (debounced to avoid blocking main thread)
  useEffect(() => {
    const timer = setTimeout(() => {
      const digits = form.phone.replace(/\D/g, '');
      if (digits.length >= 4 && !dismissedSuggestion) {
        const match = savedProfiles.find(p => p.phone.replace(/\D/g, '').includes(digits));
        if (match && match.phone !== form.phone) {
          startTransition(() => {
            setSuggestedProfile(match);
          });
          return;
        }
      }
      startTransition(() => {
        setSuggestedProfile(null);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [form.phone, savedProfiles, dismissedSuggestion]);

  const handleApplySuggestion = () => {
    if (suggestedProfile) {
      setLocalPhone(suggestedProfile.phone);
      setForm(prev => ({
        ...suggestedProfile,
        date: prev.date,
        occasion: prev.occasion,
        garments: prev.garments,
        customDressName: prev.customDressName,
        mode: prev.mode
      }));
      setSuggestedProfile(null);
    }
  };

  const saveProfileToLocal = () => {
    try {
      const existing = [...savedProfiles];
      const idx = existing.findIndex(p => p.phone === form.phone);
      if (idx >= 0) existing.splice(idx, 1);
      existing.unshift({ ...form, garments: [] }); // Add to front; garments, sizes and photos are per request
      const limited = existing.slice(0, 50); // keep last 50
      localStorage.setItem('atelier_saved_profiles', JSON.stringify(limited));
      setSavedProfiles(limited);
    } catch (e) {}
  };

  // Load each picked garment's measurements and photo parts once.
  useEffect(() => {
    for (const g of form.garments) {
      if (requestedKeys.current.has(g.key)) continue;
      requestedKeys.current.add(g.key);
      fetchProductMeasurements(g.key).then((list) => setMeasureDefs((d) => ({ ...d, [g.key]: list })));
      fetchProductParts(g.key).then((parts) => setPartsByKey((d) => ({ ...d, [g.key]: parts })));
    }
  }, [form.garments]);

  const garmentName = (key: string) => availableGarments.find((p) => p.key === key)?.name ?? key;
  const toggleGarment = (key: string) =>
    setForm((prev) => ({
      ...prev,
      garments: prev.garments.some((g) => g.key === key)
        ? prev.garments.filter((g) => g.key !== key)
        : [...prev.garments, newGarment(key)]
    }));
  const updateGarment = (key: string, patch: Partial<Garment>) =>
    setForm((prev) => ({ ...prev, garments: prev.garments.map((g) => (g.key === key ? { ...g, ...patch } : g)) }));
  const currentGarment = form.garments.find((g) => g.key === activeGarment) ?? form.garments[0];

  // Cooldown countdown timer for OTP resends
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setOtpCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [otpCooldown]);

  useEffect(() => {
    if (!open) return;
    setScrollLocked(true);
    const timer = window.setTimeout(() => firstFieldRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (otpModalOpen) setOtpModalOpen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      setScrollLocked(false);
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose, otpModalOpen]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key in errors) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (submitError) setSubmitError(null);
  };

  const switchTab = (tab: 'consultation' | 'dress' | 'measurements') => {
    setActiveTab(tab);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const validateCoreForm = (): boolean => {
    const next: Errors = {};
    if (!form.name.trim()) next.name = 'Kindly share your name for the salon reservation.';
    const digits = normalizeIndianMobile(form.phone);
    if (digits.length !== 10) next.phone = 'Please provide a 10-digit mobile number so we may reach you on WhatsApp.';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Please check the formatting of your email address (e.g. name@example.com).';
    }
    if (!form.date) next.date = 'Kindly select your preferred consultation date.';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      switchTab('consultation');
      return false;
    }
    return true;
  };

  /** Each garment as the email fallback lists it: details plus the sizes filled for it. */
  const buildEmailOutfits = () =>
    form.garments.map((g) => {
      const defs = measureDefs[g.key] ?? [];
      const sizes = defs
        .filter((d) => (g.measurements[d.key] ?? '').trim())
        .map((d) => `• ${d.label}: ${g.measurements[d.key].trim()} ${form.unit}`);
      const dress: DressDetails = {
        dressType: garmentName(g.key),
        customDressName: form.customDressName.trim() || undefined,
        fabricPreference: g.fabric || undefined,
        embroideryWork: g.craft || undefined,
        specialRequests: g.requests.trim() || undefined
      };
      return { dress, measurements: sizes.length ? sizes.join('\n') : 'To be taken at the boutique' };
    });

  /* ── Trigger WhatsApp OTP Verification for Autofill ────────────────────────────── */
  const handleInitiateAutofill = async () => {
    const digits = normalizeIndianMobile(form.phone);
    if (digits.length !== 10) {
      setErrors((prev) => ({ ...prev, phone: 'Please enter a valid 10-digit mobile number to verify.' }));
      return;
    }

    setOtpPurpose('autofill');
    setOtpStatus('requesting');
    setOtpError(null);
    setOtpModalOpen(true);

    const res = await requestWhatsAppOtp(form.phone);
    if (res.success) {
      setOtpCooldown(60);
      setOtpStatus('idle');
      if (res.simulated) {
        setOtpNote('Simulation mode: Type any 6 digits (e.g. 123456) to verify.');
      } else {
        setOtpNote(null);
      }
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } else {
      setOtpStatus('error');
      setOtpError(formatBoutiqueErrorMessage(res.message, 'otp_request'));
    }
  };

  /* ── Trigger WhatsApp OTP Verification for Lead Submission ─────────────────────── */
  const handleInitiateLeadWithOtp = async () => {
    if (!validateCoreForm()) return;

    if (portalToken) {
      // We already verified the number in Step 1, proceed immediately!
      await executeLeadSubmission(portalToken);
      return;
    }

    setOtpPurpose('submit');
    setOtpStatus('requesting');
    setOtpError(null);
    setOtpModalOpen(true);

    const res = await requestWhatsAppOtp(form.phone);
    if (res.success) {
      setOtpCooldown(60);
      setOtpStatus('idle');
      if (res.simulated) {
        setOtpNote('Simulation mode: Type any 6 digits (e.g. 123456) to verify.');
      } else {
        setOtpNote(null);
      }
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } else {
      setOtpStatus('error');
      setOtpError(formatBoutiqueErrorMessage(res.message, 'otp_request'));
    }
  };

  /* ── Confirm OTP ───────────────────────────────────────────────────────────────── */
  const handleConfirmOtpAndSubmit = async () => {
    // A retry after a partial failure: the code is already used up, so reuse the token it gave.
    // If that token has expired too, drop it so the next try verifies a fresh code.
    if (otpPurpose === 'submit' && portalToken) {
      setOtpStatus('verifying');
      setOtpError(null);
      if (!(await executeLeadSubmission(portalToken))) setPortalToken(null);
      return;
    }

    if (!otpCode.trim() || otpCode.trim().length !== 6) {
      setOtpError('Kindly enter the complete 6-digit code received on your WhatsApp.');
      return;
    }

    setOtpStatus('verifying');
    setOtpError(null);

    // 1. Verify code
    const verifyRes = await verifyWhatsAppOtp(form.phone, otpCode);
    if (!verifyRes.success || !verifyRes.token) {
      setOtpStatus('error');
      setOtpError(formatBoutiqueErrorMessage(verifyRes.message, 'otp_verify'));
      return;
    }

    const token = verifyRes.token;
    setPortalToken(token);

    if (otpPurpose === 'autofill') {
      // 2. Lookup existing profile if any (GET /intake/customer/profile/)
      const profileRes = await fetchCustomerProfile(token);
      if (profileRes.exists && profileRes.profile) {
        if (!form.name && profileRes.profile.first_name) {
          update('name', `${profileRes.profile.first_name} ${profileRes.profile.last_name || ''}`.trim());
        }
        if (!form.email && profileRes.profile.email_address) {
          update('email', profileRes.profile.email_address);
        }
        if (profileRes.profile.city_region) {
          update('city', profileRes.profile.city_region);
        }
      }
      setOtpModalOpen(false);
      setOtpCode('');
      setOtpStatus('idle');
      return;
    }

    // Otherwise, we are in submit mode
    await executeLeadSubmission(token);
  };

  /* ── Execute the Final Lead Submissions (Customer + one Requirement per garment) ── */
  /** Returns whether everything reached the CRM. */
  const executeLeadSubmission = async (token: string): Promise<boolean> => {
    // 3. Customer Submission (POST /intake/customer/) -- once: it uses up the token for details.
    if (!customerSaved.current) {
      const nameParts = form.name.trim().split(/\s+/);
      const customerPayload: PortalCustomerPayload = {
        first_name: nameParts[0] || 'Client',
        last_name: nameParts.slice(1).join(' ') || undefined,
        email_address: form.email.trim() || undefined,
        city_region: form.city.trim() || 'Hyderabad',
        preferred_communication: form.preferredCommunication,
        company_website: '' // Honeypot
      };
      const customerRes = await submitPortalCustomer(token, customerPayload);
      if (!customerRes.success) {
        setOtpStatus('error');
        setOtpError(formatBoutiqueErrorMessage(customerRes.message, 'customer'));
        return false;
      }
      customerSaved.current = true;
    }

    // 4. Requirement Submissions (POST /intake/customer/product/), one per garment; the same token
    // is accepted for all of them within its 15 minutes. No garment picked = one general enquiry.
    const pieces: (Garment | null)[] = form.garments.length ? form.garments : [null];
    const appointment = `Appointment: ${form.date} (${form.mode === 'boutique' ? 'In Boutique' : 'Video'}).`;
    for (const [i, g] of pieces.entries()) {
      const id = g?.key ?? '_general';
      if (sentGarments.current.has(id)) continue;

      const notes = [appointment, pieces.length > 1 ? `Outfit ${i + 1} of ${pieces.length}.` : '', form.notes.trim()]
        .filter(Boolean).join(' ').slice(0, 500);
      const custom = [
        g?.requests.trim() ? `Design: ${g.requests.trim()}` : null,
        form.customDressName ? `Style: ${form.customDressName}` : null,
        form.additionalNotes ? `Notes: ${form.additionalNotes}` : null
      ].filter(Boolean).join(' | ').slice(0, 500);
      const measurements = g ? measurementsInInches(g.measurements, form.unit) : undefined;
      const hasPhotos = !!g && Object.values(g.photos).some((files) => files.length > 0);

      let payload: PortalRequirementPayload | FormData;
      if (g && hasPhotos) {
        const fd = new FormData();
        fd.append('garment_type', g.key);
        fd.append('occasion', form.occasion);
        if (g.craft) fd.append('embellishments', g.craft);
        if (g.fabric) fd.append('pattern_style', g.fabric);
        fd.append('notes', notes);
        if (custom) fd.append('custom_requirements', custom);
        if (measurements) fd.append('measurements', JSON.stringify(measurements)); // JSON text in multipart
        setPreparingPhotos(true);
        const photos = await shrinkPhotos(g.photos).finally(() => setPreparingPhotos(false));
        Object.entries(photos).forEach(([partKey, files]) => files.forEach((file) => fd.append(`images[${partKey}]`, file)));
        payload = fd;
      } else {
        payload = {
          garment_type: g?.key,
          occasion: form.occasion,
          embellishments: g?.craft || undefined,
          pattern_style: g?.fabric || undefined,
          custom_requirements: custom || undefined,
          notes,
          measurements
        };
      }

      const reqRes = await submitPortalRequirement(token, payload);
      if (!reqRes.success) {
        const received = pieces.filter((x) => x && sentGarments.current.has(x.key)).map((x) => garmentName(x!.key));
        setOtpStatus('error');
        setOtpError(
          formatBoutiqueErrorMessage(reqRes.message, 'requirement') +
          (received.length ? ` Your ${received.join(', ')} ${received.length === 1 ? 'request has' : 'requests have'} already reached us.` : '')
        );
        return false;
      }
      sentGarments.current.add(id);
    }

    // Success!
    saveProfileToLocal();
    setOtpModalOpen(false);
    setSubmissionSuccessType('lead');
    return true;
  };

  /* ── ACTION 2: Send as Email (Existing flow via EmailJS) ─────────────────────────── */
  const handleSendEmail = async () => {
    if (!validateCoreForm()) return;

    setSubmittingAction('email');
    setSubmitError(null);

    const result = await sendAppointmentEmail({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      occasion: form.occasion,
      date: form.date,
      mode: form.mode,
      notes: [form.notes.trim(), form.additionalNotes.trim() && `Tailoring notes: ${form.additionalNotes.trim()}`].filter(Boolean).join('\n') || undefined,
      outfits: buildEmailOutfits()
    });

    if (result.success) {
      saveProfileToLocal();
      setSubmissionSuccessType('email');
    } else {
      setSubmitError(formatBoutiqueErrorMessage(result.message, 'email'));
    }
    setSubmittingAction(null);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (activeTab === 'consultation') {
      if (validateCoreForm()) switchTab('dress');
    } else if (activeTab === 'dress') {
      switchTab('measurements');
    } else {
      handleInitiateLeadWithOtp();
    }
  };

  const reset = () => {
    setForm(initialForm);
    setActiveTab('consultation');
    setErrors({});
    setOtpModalOpen(false);
    setOtpCode('');
    setOtpCooldown(0);
    setOtpStatus('idle');
    setOtpError(null);
    setSubmittingAction(null);
    setSubmissionSuccessType(null);
    setSubmitError(null);
    setActiveGarment(null);
    customerSaved.current = false;
    sentGarments.current.clear();
  };

  const fieldCls =
    'mt-1.5 w-full border-b border-ink/25 bg-transparent py-2 text-[14px] text-ink outline-none transition-colors duration-200 placeholder:text-stone/50 focus:border-ink';

  return (
    <AnimatePresence onExitComplete={reset}>
      {open && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
          />

          {/* Drawer Container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            className="absolute inset-y-0 right-0 flex h-full w-full max-w-[640px] flex-col overflow-hidden bg-ivory shadow-[0_20px_60px_-15px_rgba(29,24,21,0.35)]"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: easeOut }}
            data-lenis-prevent
          >
            {/* FIXED ATELIER HEADER */}
            <div className="shrink-0 border-b border-ink/10 bg-ivory/95 px-6 pt-5 pb-3 backdrop-blur-md md:px-9">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-zari">
                    Swathy Reddy · Bespoke Atelier
                  </span>
                  <h2 id="booking-title" className="font-display text-2xl md:text-[26px] font-medium text-ink leading-tight mt-0.5">
                    Private <em>Consultation</em>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-stone hover:text-ink hover:bg-ink/5 transition-colors"
                >
                  <XIcon className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* SLEEK STEP NAVIGATION (Spacious, airy & clickable) */}
              {!submissionSuccessType && (
                <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-3">
                  {[
                    { id: 'consultation', step: '01', title: 'Consultation' },
                    { id: 'dress', step: '02', title: 'The Outfit' },
                    { id: 'measurements', step: '03', title: 'Measurements' }
                  ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => switchTab(tab.id as any)}
                        className={`group relative flex items-center gap-1.5 py-1 px-1 text-left transition-all rounded-xs sm:gap-2 sm:px-2.5 ${
                          isActive
                            ? 'text-ink font-semibold'
                            : 'text-stone/60 hover:text-ink'
                        }`}
                      >
                        <span className={`hidden text-[10px] font-mono tracking-wider sm:inline ${isActive ? 'text-oxblood font-bold' : 'text-stone/60'}`}>
                          {tab.step}
                        </span>
                        <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.16em]">
                          {tab.title}
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="activeTabUnderline"
                            className="absolute -bottom-3 left-0 right-0 h-[2px] bg-oxblood"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SCROLLABLE MAIN BODY */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto overscroll-contain px-6 py-6 md:px-9"
            >
              {/* SUCCESS VIEW */}
              {submissionSuccessType ? (
                <div className="flex min-h-full flex-col justify-center py-6">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-oxblood/10 text-oxblood border border-oxblood/20 shadow-xs">
                    <CheckCircle2Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>

                  <h2 id="booking-title" className="font-display text-4xl leading-[1.08] md:text-5xl">
                    {submissionSuccessType === 'lead' ? (
                      <>
                        Measurements <em>registered.</em>
                      </>
                    ) : (
                      <>
                        Appointment <em>emailed.</em>
                      </>
                    )}
                  </h2>

                  <div className="mt-5 rounded-sm border border-line bg-paper/70 p-5 shadow-xs">
                    <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                      <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-semibold">
                        Consultation & Lead Record
                      </span>
                      <span className="rounded-full bg-ink px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-ivory">
                        {submissionSuccessType === 'lead' ? 'Boutique Intake Active' : 'Email Delivered'}
                      </span>
                    </div>

                    <p className="mt-4 text-[14px] leading-relaxed text-ink">
                      Dear <strong className="font-semibold text-oxblood">{form.name.split(' ')[0]}</strong>, your custom requirement for{' '}
                      <strong className="font-semibold">
                        {form.garments.length ? form.garments.map((g) => garmentName(g.key)).join(', ') : 'your outfit'}
                      </strong>{' '}
                      ({form.occasion.toLowerCase()}) has been recorded for a{' '}
                      <strong>{form.mode === 'boutique' ? 'boutique consultation' : 'video session'}</strong> on{' '}
                      <strong>
                        {form.date
                          ? new Date(form.date + 'T00:00:00').toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })
                          : 'your preferred date'}
                      </strong>
                      .
                    </p>

                    <div className="mt-4 pt-3.5 border-t border-ink/10 text-[12.5px] text-stone space-y-1.5">
                      <p>• Verified WhatsApp: <span className="text-ink font-medium">+91 {normalizeIndianMobile(form.phone)}</span></p>
                      {form.email && <p>• Client Email: <span className="text-ink font-medium">{form.email}</span></p>}
                      {form.garments.map((g) => {
                        const sizes = Object.values(g.measurements).filter((v) => v.trim()).length;
                        const photos = Object.values(g.photos).reduce((n, f) => n + f.length, 0);
                        return (
                          <p key={g.key}>
                            • <span className="text-ink font-medium">{garmentName(g.key)}</span>
                            {' · '}{g.fabric}
                            {sizes > 0 && <> · {sizes} {sizes === 1 ? 'measurement' : 'measurements'}</>}
                            {photos > 0 && <> · {photos} {photos === 1 ? 'photo' : 'photos'}</>}
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  <p className="mt-5 text-[13.5px] leading-relaxed text-stone">
                    {submissionSuccessType === 'lead'
                      ? 'Our master pattern cutter and stylist will review your design requests and measurements prior to your appointment. A dedicated stylist will connect with you via WhatsApp or phone within 24 hours to confirm your private salon slot.'
                      : 'A complete appointment summary and your tailoring specifications have been dispatched to our boutique styling desk. We will contact you shortly to confirm your booking.'}
                  </p>

                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-8 self-start bg-ink px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-oxblood shadow-xs"
                  >
                    Return to Boutique
                  </button>
                </div>
              ) : (
                <form id="booking-dialog-form" onSubmit={handleFormSubmit} noValidate>
                  {/* Honeypot field (hidden from real users) */}
                  <input
                    type="text"
                    name="company_website"
                    value={form.companyWebsite}
                    onChange={(e) => update('companyWebsite', e.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                  />

                  {/* Atelier Consultation Notice (Polite & Softened) */}
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-5 flex items-start gap-3 border border-oxblood/20 bg-oxblood/[0.04] p-3.5 text-[13px] text-oxblood rounded-xs shadow-2xs"
                    >
                      <AlertCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-oxblood" strokeWidth={1.5} />
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-medium text-[14px] text-oxblood leading-tight">Atelier Consultation Notice</p>
                        <p className="mt-1 text-stone text-[12.5px] leading-relaxed">{submitError}</p>
                      </div>
                    </motion.div>
                  )}

                  {/* ────────────────────────────────────────────────────────────── */}
                  {/* TAB 1: CONSULTATION & CONTACT                                  */}
                  {/* ────────────────────────────────────────────────────────────── */}
                  {activeTab === 'consultation' && (
                    <motion.div
                      key="tab-consultation"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-6"
                    >
                      {/* Name & Phone side-by-side */}
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">Your Name *</span>
                          <input
                            ref={firstFieldRef}
                            value={form.name}
                            onChange={(e) => update('name', e.target.value)}
                            className={fieldCls}
                            placeholder="Ananya Rao"
                            aria-invalid={!!errors.name}
                          />
                          {errors.name && <span className="mt-1 block text-[12px] text-oxblood">{errors.name}</span>}
                        </label>

                        <label className="block">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">
                            Mobile (WhatsApp) *
                          </span>
                          <div className="relative flex shadow-xs mt-1.5">
                            <div className="relative shrink-0">
                              <select
                                value={form.countryCode}
                                onChange={(e) => update('countryCode', e.target.value)}
                                className="h-[46px] w-[85px] appearance-none rounded-l-xs border border-r-0 border-ink/20 bg-paper/50 px-3 py-0 text-[13px] text-ink focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink transition-colors"
                              >
                                {COUNTRY_CODES.map((c) => (
                                  <option key={c.iso} value={`+${c.dial}`}>
                                    {c.iso} (+{c.dial})
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-ink/60">
                                <ChevronDownIcon className="h-3.5 w-3.5" />
                              </div>
                            </div>
                            <div className="relative flex-1">
                              <input
                                type="tel"
                                value={localPhone}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setLocalPhone(val);
                                  startTransition(() => {
                                    update('phone', val);
                                  });
                                }}
                                className="w-full h-[46px] rounded-r-xs border border-ink/20 bg-paper/50 px-3.5 py-0 text-[13.5px] text-ink placeholder:text-stone/40 focus:border-ink focus:outline-none focus:ring-1 focus:ring-ink transition-colors pr-[110px]"
                                placeholder="98765 43210"
                                aria-invalid={!!errors.phone}
                              />
                              {form.phone.replace(/\D/g, '').length >= 10 && !portalToken && (
                                <button
                                  type="button"
                                  onClick={handleInitiateAutofill}
                                  className="absolute right-1 top-1 bottom-1 px-2.5 bg-stone/10 hover:bg-stone/20 text-ink text-[9px] font-bold uppercase tracking-wider rounded-sm transition-colors"
                                >
                                  Verify & Autofill
                                </button>
                              )}
                              {portalToken && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-green-700/80 bg-green-500/10 px-2 py-0.5 rounded-sm">
                                  <CheckCircle2Icon className="h-3 w-3" />
                                  <span className="text-[9px] font-bold uppercase tracking-wider">Verified</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {errors.phone && <span className="mt-1 block text-[12px] text-oxblood">{errors.phone}</span>}

                          {/* Local Storage Autocomplete Suggestion UI */}
                          <AnimatePresence>
                            {suggestedProfile && (
                              <motion.div
                                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xs border border-ink/10 bg-ink/[0.02] p-2.5 shadow-2xs overflow-hidden gap-3"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink/10 text-ink">
                                    <RefreshCwIcon className="h-3.5 w-3.5" />
                                  </div>
                                  <div>
                                    <p className="text-[12px] font-semibold text-ink leading-tight">Returning Client?</p>
                                    <p className="text-[11px] text-stone leading-tight mt-0.5">Autofill details for {suggestedProfile.name.split(' ')[0]}</p>
                                  </div>
                                </div>
                                <div className="flex gap-1.5 self-end sm:self-auto shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setDismissedSuggestion(true)}
                                    className="text-[10px] uppercase tracking-wider text-stone hover:text-oxblood font-semibold px-2.5 py-1.5 transition-colors"
                                  >
                                    Ignore
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleApplySuggestion}
                                    className="rounded-sm bg-ink px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-ivory transition-colors hover:bg-oxblood shadow-xs"
                                  >
                                    Autofill
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </label>
                      </div>

                      {/* Consultation Mode */}
                      <div>
                        <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium block mb-2">
                          Consultation Mode
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          {(
                            [
                              ['boutique', 'Atelier Salon Visit', 'Banjara Hills, Hyderabad'],
                              ['video', 'Virtual Video Styling', 'Private online appointment']
                            ] as const
                          ).map(([value, label, sub]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => update('mode', value)}
                              className={`p-3 text-left border rounded-xs transition-all ${
                                form.mode === value
                                  ? 'border-ink bg-ink text-ivory shadow-xs'
                                  : 'border-ink/15 bg-paper/30 text-ink hover:border-ink hover:bg-paper/70'
                              }`}
                            >
                              <p className="text-[12.5px] font-medium leading-tight">{label}</p>
                              <p className={`text-[10.5px] mt-0.5 leading-tight ${form.mode === value ? 'text-ivory/70' : 'text-stone'}`}>
                                {sub}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Date & Occasion */}
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                          <LuxuryDatePicker
                            value={form.date}
                            minDate={today}
                            onChange={(val) => update('date', val)}
                            hasError={!!errors.date}
                          />
                          {errors.date && <span className="mt-1 block text-[12px] text-oxblood">{errors.date}</span>}
                        </div>

                        <LuxurySelect
                          label="Occasion"
                          value={form.occasion}
                          onChange={(val) => update('occasion', val)}
                          options={occasionOptions}
                        />
                      </div>

                      {/* Email & City */}
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">Email (Optional)</span>
                          <input
                            type="email"
                            value={form.email}
                            onChange={(e) => update('email', e.target.value)}
                            className={fieldCls}
                            placeholder="ananya@example.com"
                            aria-invalid={!!errors.email}
                          />
                          {errors.email && <span className="mt-1 block text-[12px] text-oxblood">{errors.email}</span>}
                        </label>

                        <label className="block">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">City / Region</span>
                          <input
                            type="text"
                            value={form.city}
                            onChange={(e) => update('city', e.target.value)}
                            className={fieldCls}
                            placeholder="Hyderabad"
                          />
                        </label>
                      </div>

                      {/* Notes */}
                      <label className="block">
                        <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">
                          Styling Notes / Preferences (Optional)
                        </span>
                        <input
                          type="text"
                          value={form.notes}
                          onChange={(e) => update('notes', e.target.value)}
                          className={fieldCls}
                          placeholder="e.g. Bridal trousseau, looking for warm rose-gold zari silks"
                        />
                      </label>
                    </motion.div>
                  )}

                  {/* ────────────────────────────────────────────────────────────── */}
                  {/* TAB 2: DRESS & OUTFIT SELECTION                                */}
                  {/* ────────────────────────────────────────────────────────────── */}
                  {activeTab === 'dress' && (
                    <motion.div
                      key="tab-dress"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-6"
                    >
                      {/* Curated Silhouette Pills */}
                      <div>
                        <div className="flex items-baseline justify-between mb-2">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">
                            Select Garments
                          </span>
                          <span className="text-[11px] font-semibold text-oxblood">
                            {form.garments.length === 0 ? 'Pick one or more' : `${form.garments.length} selected`}
                          </span>
                        </div>
                        <p className="mb-3 text-[12px] text-stone">Tap every piece you would like made. Each gets its own details and measurements.</p>

                        <div className="flex flex-wrap gap-2">
                          {availableGarments.map((product) => {
                            const isSelected = form.garments.some((g) => g.key === product.key);
                            return (
                              <button
                                key={product.key}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => toggleGarment(product.key)}
                                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-[12px] uppercase tracking-[0.14em] transition-all rounded-xs border ${
                                  isSelected
                                    ? 'border-ink bg-ink text-ivory font-medium shadow-xs ring-1 ring-zari/40'
                                    : 'border-ink/15 bg-paper/30 text-ink hover:border-ink hover:bg-paper/70'
                                }`}
                              >
                                {isSelected && <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />}
                                {product.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* One card per picked garment: its fabric, craft and design notes */}
                      {form.garments.length === 0 ? (
                        <p className="rounded-sm bg-paper/40 px-4 py-3 text-[13px] text-stone">
                          Not sure yet? That is fine. Leave this empty and we will plan the outfit with you at the consultation.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {form.garments.map((g) => (
                            <div key={g.key} className="rounded-xl bg-paper/45 p-4 sm:p-5">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-display text-[19px] leading-tight text-ink">{garmentName(g.key)}</p>
                                  <p className="mt-0.5 text-[11px] italic text-stone">{getGarmentDescription(garmentName(g.key))}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => toggleGarment(g.key)}
                                  aria-label={`Remove ${garmentName(g.key)}`}
                                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-stone transition-colors hover:bg-ink/5 hover:text-ink"
                                >
                                  <XIcon className="h-4 w-4" strokeWidth={1.5} />
                                </button>
                              </div>
                              <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <LuxurySelect
                                  label="Preferred Fabric"
                                  value={g.fabric}
                                  onChange={(val) => updateGarment(g.key, { fabric: val })}
                                  options={fabricOptions}
                                />
                                <LuxurySelect
                                  label="Craft & Embellishment"
                                  value={g.craft}
                                  onChange={(val) => updateGarment(g.key, { craft: val })}
                                  options={embroideryOptions}
                                />
                              </div>
                              <label className="mt-4 block">
                                <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">
                                  Design Requests (Optional)
                                </span>
                                <input
                                  type="text"
                                  value={g.requests}
                                  onChange={(e) => updateGarment(g.key, { requests: e.target.value })}
                                  className={fieldCls}
                                  placeholder="e.g. Boat neck front, deep V back, elbow sleeve length with hand zardozi work"
                                />
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ────────────────────────────────────────────────────────────── */}
                  {/* TAB 3: BOUTIQUE MEASUREMENTS (UNCLUTTERED & OPTIONAL)           */}
                  {/* ────────────────────────────────────────────────────────────── */}
                  {activeTab === 'measurements' && (
                    <motion.div
                      key="tab-measurements"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-6"
                    >
                      {/* Reassurance note & Unit selector */}
                      <div className="flex items-center justify-between border-b border-ink/10 pb-3">
                        <p className="text-[12px] text-stone leading-relaxed max-w-[360px]">
                          Measurements are completely optional. Fill what you know — our master pattern cutter can also measure you during your salon visit.
                        </p>

                        <div className="flex items-center rounded-xs border border-ink/20 bg-ivory p-0.5 shadow-2xs shrink-0">
                          <button
                            type="button"
                            onClick={() => update('unit', 'in')}
                            className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                              form.unit === 'in' ? 'bg-ink text-ivory rounded-xs' : 'text-stone hover:text-ink'
                            }`}
                          >
                            Inches
                          </button>
                          <button
                            type="button"
                            onClick={() => update('unit', 'cm')}
                            className={`px-3 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                              form.unit === 'cm' ? 'bg-ink text-ivory rounded-xs' : 'text-stone hover:text-ink'
                            }`}
                          >
                            CM
                          </button>
                        </div>
                      </div>

                      {/* One tab per garment: each has its own measurements and photo parts */}
                      {form.garments.length > 1 && (
                        <div role="tablist" aria-label="Garment" className="flex flex-wrap gap-2">
                          {form.garments.map((g) => {
                            const isActive = g.key === currentGarment?.key;
                            const filled = Object.values(g.measurements).some((v) => v.trim()) || Object.values(g.photos).some((f) => f.length > 0);
                            return (
                              <button
                                key={g.key}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                onClick={() => setActiveGarment(g.key)}
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                                  isActive ? 'bg-oxblood text-ivory' : 'bg-paper/50 text-ink hover:bg-paper'
                                }`}
                              >
                                {garmentName(g.key)}
                                {filled && <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-ivory' : 'bg-oxblood'}`} aria-label="has details" />}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {currentGarment && (measureDefs[currentGarment.key]?.length ?? 0) > 0 && (
                        <div>
                          <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium block mb-3">
                            {garmentName(currentGarment.key)} Measurements ({form.unit})
                          </span>
                          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                            {measureDefs[currentGarment.key].map(measure => (
                              <label key={measure.key} className="block">
                                <span className="text-[10px] uppercase tracking-[0.16em] text-stone font-medium">{measure.label}</span>
                                <div className="relative mt-1">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={currentGarment.measurements[measure.key] || ''}
                                    onChange={(e) => updateGarment(currentGarment.key, {
                                      measurements: { ...currentGarment.measurements, [measure.key]: e.target.value }
                                    })}
                                    className="w-full border-b border-ink/25 bg-transparent py-1.5 pr-6 text-[14px] text-ink font-medium outline-none focus:border-ink placeholder:text-stone/40"
                                    placeholder={form.unit === 'in' ? String(measure.min || 0) : String((measure.min || 0) * 2.54)}
                                  />
                                  <span className="pointer-events-none absolute right-0 top-1.5 text-[11px] text-stone/50">{form.unit}</span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Photo Uploads for this garment's parts */}
                      {currentGarment && partsByKey[currentGarment.key] && partsByKey[currentGarment.key]!.parts.length > 0 && (
                        <DesignPhotos
                          key={currentGarment.key}
                          parts={partsByKey[currentGarment.key]!.parts}
                          maxPhotos={partsByKey[currentGarment.key]!.max_photos}
                          photos={currentGarment.photos}
                          onChange={(photos) => updateGarment(currentGarment.key, { photos })}
                        />
                      )}

                      {/* Margins */}
                      <label className="block pt-5 border-t border-ink/10 mt-6">
                        <span className="text-[10px] uppercase tracking-[0.16em] text-stone font-medium">
                          Extra Margins / Tailoring Notes
                        </span>
                        <input
                          type="text"
                          value={form.additionalNotes}
                          onChange={(e) => update('additionalNotes', e.target.value)}
                          className={fieldCls}
                          placeholder="e.g. Leave 2-inch inner margin, pure cotton lining, extra hook"
                        />
                      </label>
                    </motion.div>
                  )}
                </form>
              )}
            </div>

            {/* FIXED FOOTER (Serene, uncluttered & intuitive) */}
            {!submissionSuccessType && (
              <div className="shrink-0 border-t border-line/80 bg-ivory/95 px-6 py-4 backdrop-blur-md md:px-9">
                {activeTab === 'consultation' && (
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleSendEmail}
                      disabled={Boolean(submittingAction)}
                      className="text-[11px] uppercase tracking-[0.16em] text-stone hover:text-ink underline transition-colors"
                    >
                      Quick Email Request
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (validateCoreForm()) switchTab('dress');
                      }}
                      className="inline-flex items-center gap-2 bg-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory hover:bg-oxblood transition-colors rounded-xs shadow-xs"
                    >
                      <span>Continue to Outfit</span>
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {activeTab === 'dress' && (
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => switchTab('consultation')}
                      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-stone hover:text-ink transition-colors"
                    >
                      <ArrowLeftIcon className="h-3 w-3" />
                      <span>Back</span>
                    </button>

                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={handleSendEmail}
                        disabled={Boolean(submittingAction)}
                        className="text-[11px] uppercase tracking-[0.16em] text-stone hover:text-ink underline hidden sm:inline-block transition-colors"
                      >
                        Request Consultation
                      </button>

                      <button
                        type="button"
                        onClick={() => switchTab('measurements')}
                        className="inline-flex items-center gap-2 bg-ink px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory hover:bg-oxblood transition-colors rounded-xs shadow-xs"
                      >
                        <span>Add Measurements</span>
                        <ArrowRightIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'measurements' && (
                  <div>
                    <div className="flex items-center justify-between pb-3">
                      <button
                        type="button"
                        onClick={() => switchTab('dress')}
                        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-stone hover:text-ink transition-colors"
                      >
                        <ArrowLeftIcon className="h-3 w-3" />
                        <span>Back to Outfit</span>
                      </button>
                      <span className="text-[10.5px] uppercase tracking-[0.14em] text-stone/80">
                        Submit Request:
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* ACTION 1: SEND VIA WHATSAPP (OTP & CRM INTAKE) */}
                      <button
                        type="button"
                        disabled={Boolean(submittingAction)}
                        onClick={handleInitiateLeadWithOtp}
                        className="flex items-center justify-center gap-2 bg-ink px-4 py-3 text-ivory hover:bg-oxblood transition-all duration-200 rounded-xs shadow-xs group"
                      >
                        <SendIcon className="h-3.5 w-3.5 text-zari transition-transform group-hover:translate-x-0.5" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                          Request Consultation
                        </span>
                      </button>

                      {/* ACTION 2: SEND VIA EMAIL */}
                      <button
                        type="button"
                        disabled={Boolean(submittingAction)}
                        onClick={handleSendEmail}
                        className="flex items-center justify-center gap-2 border border-ink/30 bg-paper/50 px-4 py-3 text-ink hover:border-ink hover:bg-paper transition-all duration-200 rounded-xs"
                      >
                        {submittingAction === 'email' ? (
                          <>
                            <Loader2Icon className="h-3.5 w-3.5 animate-spin text-ink" />
                            <span className="text-[11px] font-medium uppercase tracking-[0.18em]">
                              Sending…
                            </span>
                          </>
                        ) : (
                          <>
                            <MailIcon className="h-3.5 w-3.5 text-oxblood" />
                            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
                              Submit via Email
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* ────────────────────────────────────────────────────────────────── */}
          {/* WHATSAPP OTP VERIFICATION MODAL OVERLAY                            */}
          {/* ────────────────────────────────────────────────────────────────── */}
          <AnimatePresence>
            {otpModalOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-ink/65 backdrop-blur-xs"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-[420px] rounded-sm border border-ink/20 bg-ivory p-6 shadow-2xl"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-ink/10">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <MessageSquareIcon className="h-4 w-4" />
                      </div>
                      <span className="font-display text-[15px] font-semibold tracking-wide text-ink">
                        WhatsApp Verification
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpModalOpen(false)}
                      className="text-stone hover:text-ink transition-colors p-1"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-[13px] leading-relaxed text-stone">
                      A 6-digit verification code has been sent to your WhatsApp at:
                    </p>
                    <p className="mt-1 font-display text-[16px] font-semibold text-ink tracking-wider">
                      +91 {normalizeIndianMobile(form.phone)}
                    </p>
                  </div>

                  {otpNote && (
                    <div className="mt-3.5 rounded-xs border border-zari/30 bg-zari/10 p-2.5 text-[12px] text-stone">
                      <p className="font-medium text-ink">{otpNote}</p>
                    </div>
                  )}

                  {otpError && (
                    <div className="mt-3.5 flex items-start gap-2.5 rounded-xs border border-oxblood/20 bg-oxblood/[0.04] p-3 text-[12px] text-oxblood">
                      <AlertCircleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-oxblood" strokeWidth={1.5} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-oxblood leading-tight">Verification Note</p>
                        <p className="mt-0.5 text-stone text-[11.5px] leading-relaxed">{otpError}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-5">
                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-stone font-semibold">
                        Enter 6-digit Code
                      </span>
                      <input
                        ref={otpInputRef}
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="mt-1.5 w-full border border-ink/30 bg-paper/50 py-2.5 text-center font-mono text-2xl tracking-[0.5em] text-ink outline-none transition-colors focus:border-ink rounded-xs placeholder:text-stone/30"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[12px]">
                    <span className="text-stone/80">Code valid for 5 min</span>
                    {otpCooldown > 0 ? (
                      <span className="text-stone font-medium">Resend in {otpCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleInitiateLeadWithOtp}
                        className="inline-flex items-center gap-1 font-semibold text-oxblood hover:underline"
                      >
                        <RefreshCwIcon className="h-3 w-3" />
                        <span>Resend WhatsApp Code</span>
                      </button>
                    )}
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={otpStatus === 'verifying' || otpCode.length !== 6}
                      onClick={handleConfirmOtpAndSubmit}
                      className="flex w-full items-center justify-center gap-2 bg-ink py-3 text-[12px] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-oxblood disabled:cursor-not-allowed disabled:opacity-50 rounded-xs shadow-xs"
                    >
                      {otpStatus === 'verifying' ? (
                        <>
                          <Loader2Icon className="h-4 w-4 animate-spin text-ivory" />
                          <span>{preparingPhotos ? 'Preparing photos…' : 'Verifying & Recording…'}</span>
                        </>
                      ) : (
                        <span>Verify & Submit to CRM</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setOtpModalOpen(false)}
                      className="py-1 text-center text-[11px] text-stone hover:text-ink transition-colors"
                    >
                      Cancel & Return
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}