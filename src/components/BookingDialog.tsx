import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
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
  BoutiqueMeasurements,
  DressDetails,
  MeasurementUnit,
  PortalCustomerPayload,
  PortalProduct,
  PortalRequirementPayload,
  PortalMeasurementDef,
  PortalPartsResponse
} from '../types/booking';
import { COUNTRY_CODES } from '../data/countryCodes';

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

  // Step 2: Dress & Outfit
  dressType: string;
  customDressName: string;
  fabricPreference: string;
  embroideryWork: string;
  specialRequests: string;

  // Step 3: Boutique Measurements (Dynamic)
  unit: MeasurementUnit;
  dynamicMeasurements: Record<string, string>;
  
  // Photos (Dynamic)
  photos: Record<string, File[]>;
  
  // General Notes
  additionalNotes: string;

  // Honeypot
  companyWebsite: string;
};

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
  dressType: '',
  customDressName: '',
  fabricPreference: 'Pure Kanchipuram Silk',
  embroideryWork: 'Maggam / Aari Hand Embroidery',
  specialRequests: '',

  // Boutique Measurements
  unit: 'in',
  dynamicMeasurements: {},
  photos: {},
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
  const [otpPurpose, setOtpPurpose] = useState<'autofill' | 'submit'>('submit');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpNote, setOtpNote] = useState<string | null>(null);
  const [portalToken, setPortalToken] = useState<string | null>(null);

  const [submittingAction, setSubmittingAction] = useState<'lead' | 'email' | null>(null);
  const [submissionSuccessType, setSubmissionSuccessType] = useState<'lead' | 'email' | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // New Dynamic States
  const [portalMeasurements, setPortalMeasurements] = useState<PortalMeasurementDef[]>([]);
  const [portalParts, setPortalParts] = useState<PortalPartsResponse | null>(null);

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
        // Auto-select the first product if none selected
        if (!form.dressType) {
          setForm(prev => ({ ...prev, dressType: res[0].key }));
        }
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

  // Check for autocomplete suggestions when phone changes
  useEffect(() => {
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length >= 4 && !dismissedSuggestion) {
      const match = savedProfiles.find(p => p.phone.replace(/\D/g, '').includes(digits));
      if (match && match.phone !== form.phone) {
        setSuggestedProfile(match);
      } else {
        setSuggestedProfile(null);
      }
    } else {
      setSuggestedProfile(null);
    }
  }, [form.phone, savedProfiles, dismissedSuggestion]);

  const handleApplySuggestion = () => {
    if (suggestedProfile) {
      setForm(prev => ({
        ...suggestedProfile,
        date: prev.date,
        occasion: prev.occasion,
        dressType: prev.dressType,
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
      existing.unshift({ ...form, dynamicMeasurements: {}, photos: {} }); // Add to front, clearing new ones
      const limited = existing.slice(0, 50); // keep last 50
      localStorage.setItem('atelier_saved_profiles', JSON.stringify(limited));
      setSavedProfiles(limited);
    } catch (e) {}
  };

  // Fetch measurements and parts when dressType changes
  useEffect(() => {
    if (form.dressType) {
      fetchProductMeasurements(form.dressType).then(setPortalMeasurements);
      fetchProductParts(form.dressType).then(setPortalParts);
    } else {
      setPortalMeasurements([]);
      setPortalParts(null);
    }
  }, [form.dressType]);

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

  const buildDressDetails = (): DressDetails => ({
    dressType: form.dressType,
    customDressName: form.customDressName.trim() || undefined,
    selectedProductCode: undefined, // removed feature
    selectedProductTitle: undefined, // removed feature
    fabricPreference: form.fabricPreference || undefined,
    embroideryWork: form.embroideryWork || undefined,
    specialRequests: form.specialRequests.trim() || undefined
  });

  const buildBoutiqueMeasurements = (): BoutiqueMeasurements => ({
    unit: form.unit,
    bust: form.dynamicMeasurements['bust'] || form.dynamicMeasurements['chest'] || undefined,
    underBust: form.dynamicMeasurements['under_bust'] || undefined,
    waist: form.dynamicMeasurements['waist'] || undefined,
    hip: form.dynamicMeasurements['hip'] || undefined,
    shoulder: form.dynamicMeasurements['shoulder'] || undefined,
    blouseLength: form.dynamicMeasurements['blouse_length'] || undefined,
    armhole: form.dynamicMeasurements['armhole'] || undefined,
    sleeveLength: form.dynamicMeasurements['sleeve_length'] || undefined,
    sleeveRound: form.dynamicMeasurements['sleeve_round'] || undefined,
    frontNeckDepth: form.dynamicMeasurements['front_neck_depth'] || undefined,
    backNeckDepth: form.dynamicMeasurements['back_neck_depth'] || undefined,
    bottomLength: form.dynamicMeasurements['bottom_length'] || undefined,
    waistToFloor: form.dynamicMeasurements['waist_to_floor'] || undefined,
    fitPreference: 'standard', // not collected explicitly anymore unless added to dynamic
    hasPadding: 'stylist-choice',
    liningPreference: undefined,
    additionalNotes: form.additionalNotes.trim() || undefined
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

  /* ── Execute the Final Lead Submissions (Customer + Requirement) ──────────────── */
  const executeLeadSubmission = async (token: string) => {
    // Split name
    const nameParts = form.name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Client';
    const lastName = nameParts.slice(1).join(' ') || '';

    // 3. Customer Submission (POST /intake/customer/)
    const customerPayload: PortalCustomerPayload = {
      first_name: firstName,
      last_name: lastName || undefined,
      email_address: form.email.trim() || undefined,
      city_region: form.city.trim() || 'Hyderabad',
      preferred_communication: form.preferredCommunication,
      company_website: '' // Honeypot
    };

    const customerRes = await submitPortalCustomer(token, customerPayload);
    if (!customerRes.success) {
      setOtpStatus('error');
      setOtpError(formatBoutiqueErrorMessage(customerRes.message, 'customer'));
      return;
    }

    // 4. Product Requirement Submission (POST /intake/customer/product/)
    const hasPhotos = Object.values(form.photos).some(files => files.length > 0);
    const measurementsPayload = Object.keys(form.dynamicMeasurements).length > 0 ? form.dynamicMeasurements : undefined;
    
    let payload: PortalRequirementPayload | FormData;
    const customReqNotes = [
      form.customDressName ? `Design: ${form.customDressName}` : null,
      form.additionalNotes ? `Notes: ${form.additionalNotes}` : null
    ].filter(Boolean).join(' | ');

    if (hasPhotos) {
      const fd = new FormData();
      if (form.dressType) fd.append('garment_type', form.dressType);
      fd.append('occasion', form.occasion);
      if (form.embroideryWork) fd.append('embellishments', form.embroideryWork);
      if (form.fabricPreference) fd.append('pattern_style', form.fabricPreference);
      fd.append('notes', `Appointment: ${form.date} (${form.mode === 'boutique' ? 'In Boutique' : 'Video'}). ${form.notes || ''}`.trim().slice(0, 500));
      
      if (customReqNotes) fd.append('custom_requirements', customReqNotes.slice(0, 500));
      
      if (measurementsPayload) {
        // Must send as JSON string when multipart
        fd.append('measurements', JSON.stringify(measurementsPayload));
      }

      Object.entries(form.photos).forEach(([partKey, files]) => {
        files.forEach(file => {
          fd.append(`images[${partKey}]`, file);
        });
      });
      payload = fd;
    } else {
      payload = {
        garment_type: form.dressType || undefined,
        occasion: form.occasion,
        embellishments: form.embroideryWork || undefined,
        pattern_style: form.fabricPreference || undefined,
        custom_requirements: customReqNotes.slice(0, 500) || undefined,
        notes: `Appointment: ${form.date} (${form.mode === 'boutique' ? 'In Boutique' : 'Video'}). ${form.notes || ''}`.trim().slice(0, 500),
        measurements: measurementsPayload
      };
    }

    const reqRes = await submitPortalRequirement(token, payload);
    if (!reqRes.success) {
      setOtpStatus('error');
      setOtpError(formatBoutiqueErrorMessage(reqRes.message, 'requirement'));
      return;
    }

    // Success!
    saveProfileToLocal();
    setOtpModalOpen(false);
    setSubmissionSuccessType('lead');
  };

  /* ── ACTION 2: Send as Email (Existing flow via EmailJS) ─────────────────────────── */
  const handleSendEmail = async () => {
    if (!validateCoreForm()) return;

    setSubmittingAction('email');
    setSubmitError(null);

    const dress = buildDressDetails();
    const measurements = buildBoutiqueMeasurements();

    const result = await sendAppointmentEmail({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      occasion: form.occasion,
      date: form.date,
      mode: form.mode,
      notes: form.notes.trim() || undefined,
      dress,
      measurements
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
                        className={`group relative flex items-center gap-2 py-1 px-2.5 text-left transition-all rounded-xs ${
                          isActive
                            ? 'text-ink font-semibold'
                            : 'text-stone/60 hover:text-ink'
                        }`}
                      >
                        <span className={`text-[10px] font-mono tracking-wider ${isActive ? 'text-oxblood font-bold' : 'text-stone/60'}`}>
                          {tab.step}
                        </span>
                        <span className="text-[11px] uppercase tracking-[0.16em]">
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
                      <strong className="font-semibold">{form.dressType}</strong> ({form.occasion.toLowerCase()}) has been recorded for a{' '}
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
                      <p>• Garment Type: <span className="text-ink font-medium">{form.dressType}</span></p>
                      {form.fabricPreference && <p>• Preferred Fabric: <span className="text-ink font-medium">{form.fabricPreference}</span></p>}
                      {Object.keys(form.dynamicMeasurements).length > 0 && (
                        <p>• Measurements: <span className="text-ink font-medium">{Object.keys(form.dynamicMeasurements).length} recorded ({form.unit})</span></p>
                      )}
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
                                value={form.phone}
                                onChange={(e) => update('phone', e.target.value)}
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
                            Select Silhouette / Garment
                          </span>
                          <span className="text-[11px] font-semibold text-oxblood italic">
                            {form.dressType}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {availableGarments.map((product) => {
                            const isSelected = form.dressType === product.key;
                            return (
                              <button
                                key={product.key}
                                type="button"
                                onClick={() => update('dressType', product.key)}
                                className={`px-3.5 py-2 text-[12px] uppercase tracking-[0.14em] transition-all rounded-xs border ${
                                  isSelected
                                    ? 'border-ink bg-ink text-ivory font-medium shadow-xs ring-1 ring-zari/40'
                                    : 'border-ink/15 bg-paper/30 text-ink hover:border-ink hover:bg-paper/70'
                                }`}
                              >
                                {product.name}
                              </button>
                            );
                          })}
                        </div>

                        <p className="mt-2 text-[11px] text-stone italic">
                          {getGarmentDescription(form.dressType)}
                        </p>
                      </div>



                      {/* Fabric & Handcraft */}
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <LuxurySelect
                          label="Preferred Fabric"
                          value={form.fabricPreference}
                          onChange={(val) => update('fabricPreference', val)}
                          options={fabricOptions}
                        />

                        <LuxurySelect
                          label="Craft & Embellishment"
                          value={form.embroideryWork}
                          onChange={(val) => update('embroideryWork', val)}
                          options={embroideryOptions}
                        />
                      </div>

                      {/* Custom Silhouette Notes */}
                      <label className="block">
                        <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">
                          Specific Silhouette & Design Requests (Optional)
                        </span>
                        <input
                          type="text"
                          value={form.specialRequests}
                          onChange={(e) => update('specialRequests', e.target.value)}
                          className={fieldCls}
                          placeholder="e.g. Boat neck front, deep V back, elbow sleeve length with hand zardozi work"
                        />
                      </label>
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

                      {/* Dynamic Measurements */}
                      {portalMeasurements.length > 0 && (
                        <div>
                          <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium block mb-3">
                            Essential Measurements ({form.unit})
                          </span>
                          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                            {portalMeasurements.map(measure => (
                              <label key={measure.key} className="block">
                                <span className="text-[10px] uppercase tracking-[0.16em] text-stone font-medium">{measure.label}</span>
                                <div className="relative mt-1">
                                  <input
                                    type="text"
                                    value={form.dynamicMeasurements[measure.key] || ''}
                                    onChange={(e) => {
                                      const newMeasurements = { ...form.dynamicMeasurements };
                                      newMeasurements[measure.key] = e.target.value;
                                      update('dynamicMeasurements', newMeasurements);
                                    }}
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

                      {/* Photo Uploads for Parts */}
                      {portalParts && portalParts.parts.length > 0 && (
                        <div className="pt-5 border-t border-ink/10">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium block mb-4">
                            Design Inspiration Photos (Max {portalParts.max_photos})
                          </span>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {portalParts.parts.map(part => (
                              <div key={part.key} className="border border-ink/10 p-4 rounded-sm bg-ivory/40 hover:bg-paper/40 transition-colors shadow-2xs">
                                <span className="text-[11px] uppercase tracking-[0.16em] text-stone font-medium mb-3 flex items-center justify-between">
                                  {part.label}
                                  {form.photos[part.key]?.length > 0 && (
                                    <span className="bg-oxblood text-ivory rounded-xs px-1.5 py-0.5 text-[9px] shadow-xs">
                                      {form.photos[part.key].length} selected
                                    </span>
                                  )}
                                </span>
                                <label className="flex flex-col items-center justify-center w-full h-24 border border-dashed border-ink/20 rounded-xs cursor-pointer bg-white/50 hover:bg-white hover:border-ink/40 transition-all group">
                                  <div className="flex flex-col items-center justify-center">
                                    <svg className="w-5 h-5 mb-1.5 text-stone/40 group-hover:text-ink/60 transition-colors" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                    </svg>
                                    <p className="text-[10px] text-stone"><span className="font-medium text-ink uppercase tracking-wider">Click to browse</span></p>
                                  </div>
                                  <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/webp"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files) {
                                        const newPhotos = { ...form.photos };
                                        newPhotos[part.key] = Array.from(e.target.files).slice(0, portalParts.max_photos);
                                        update('photos', newPhotos);
                                      }
                                    }}
                                  />
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
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
                          <span>Verifying & Recording…</span>
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