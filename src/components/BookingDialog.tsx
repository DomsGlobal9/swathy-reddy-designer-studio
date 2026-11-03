import React, { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from 'react';
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
  SendIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
  ArrowLeftIcon,
  MessageSquareIcon,
  RefreshCwIcon,
  InfoIcon,
  RulerIcon,
  CopyIcon,
  StoreIcon,
  SearchIcon,
  VideoIcon,
  PackageIcon,
  TruckIcon
} from 'lucide-react';
import { setScrollLocked } from '../hooks/useSmoothScroll';
import { easeOut } from '../utils/format';
import {
  fetchCustomerProfile,
  fetchPortalProducts,
  fetchProductMeasurements,
  fetchProductParts,
  formatBoutiqueErrorMessage,
  requestWhatsAppOtp,
  submitPortalCustomer,
  submitPortalRequirement,
  verifyWhatsAppOtp
} from '../lib/scaleezyPortal';

import type {
  MeasurementUnit,
  PortalCustomerPayload,
  PortalProduct,
  PortalRequirementPayload,
  PortalMeasurementDef,
  PortalPartsResponse
} from '../types/booking';
import { shrinkPhotos } from '../lib/shrinkPhotos';
import { DesignPhotos } from './DesignPhotos';
import { getShop } from '../lib/shop';
import { contact } from '../data/contact';
import { COUNTRY_CODES } from '../data/countryCodes';
import { MeasureGuide, guideFor } from './MeasureGuide';
import { clearDraft, loadDraft, loadDraftPhotos, saveDraft, saveDraftPhotos, type DraftPhotos } from '../lib/bookingDraft';

type BookingDialogProps = {
  open: boolean;
  onClose: () => void;
};

type FormState = {
  // Step 1: Client & Consultation
  name: string;
  phone: string;
  /** Country of the WhatsApp number (ISO code, e.g. IN, AE). */
  countryIso: string;
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

  // Getting the outfit: picked up at the boutique, or couriered to this address.
  handover: '' | 'collect' | 'courier';
  addrLine: string;
  addrArea: string;
  addrCity: string;
  addrState: string;
  addrPin: string;

  // Honeypot
  companyWebsite: string;
};

/** One garment in the request. Each goes to the CRM as its own requirement, with its own sizes and photos. */
type Garment = {
  key: string;
  fabric: string;
  craft: string;
  requests: string;
  /** Finishing / style picks, e.g. { fall: 'Big', sleeve: 'Puff sleeve' }. */
  choices: Record<string, string>;
  /** The customer chose "Other" and is typing the fabric. */
  fabricOther: boolean;
  measurements: Record<string, string>;
  photos: Record<string, File[]>;
};

const newGarment = (key: string): Garment => ({
  key,
  fabric: '',
  craft: '',
  requests: '',
  choices: {},
  fabricOther: false,
  measurements: {},
  photos: {}
});

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'date' | 'addrLine' | 'addrCity' | 'addrPin', string>>;

/** A typed size that is not a number, or is outside what the CRM accepts for it. */
function badMeasurement(raw: string, def: PortalMeasurementDef, unit: MeasurementUnit): boolean {
  if (!raw.trim()) return false;
  const n = Number(raw.trim());
  if (!Number.isFinite(n) || n <= 0) return true;
  const inches = unit === 'cm' ? n / 2.54 : n;
  return inches < (def.min || 0) || (def.max > 0 && inches > def.max);
}

/*
 * The CRM lists garments without a category, so the form groups them itself. A garment the CRM adds
 * later and this list does not know shows under "Western & everyday" until it is placed here.
 */
const GARMENT_GROUPS: { id: string; label: string; keys: string[] }[] = [
  { id: 'women', label: 'Women', keys: ['saree', 'blouse', 'lehenga', 'lehenga_blouse', 'dupatta', 'kurti', 'anarkali', 'petticoat', 'bottom_wear', 'gown', 'suit', 'bridal_blouse', 'saree_blouse'] },
  { id: 'men', label: 'Men', keys: ['sherwani', 'shirt', 'kurta', 'mens_suit', 'mens_bottom_wear'] },
  { id: 'western', label: 'Western & everyday', keys: [] }
];
const groupOf = (key: string) => GARMENT_GROUPS.find((g) => g.keys.includes(key))?.id ?? 'western';

const NO_PREFERENCE = 'No preference';
const OWN_FABRIC = 'I will bring my own fabric';
const OTHER_FABRIC = 'Other (type it)';

/** One size box. `crm` is the CRM's own field for it; a box without one reaches the CRM as a written note. */
type SizeField = { id: string; label: string; crm?: string };
type SizeGroup = { name: string; fields: SizeField[] };

/*
 * The boutique's own blouse measurements (owner, 31 Oct). The CRM's blouse list is longer and named
 * differently, so the form shows this one. A box listed in two groups (shoulder, upper chest, chest,
 * waist) is one box: typing in either fills both. Boxes the CRM has no field for yet go as notes.
 */
const BLOUSE_SIZES: SizeGroup[] = [
  { name: 'Main measurements', fields: [
    { id: 'blouse_length', label: 'Blouse length', crm: 'blouse_length' },
    { id: 'shoulder', label: 'Shoulder', crm: 'shoulder' },
    { id: 'upper_chest', label: 'Upper chest (upper bust)', crm: 'upper_chest' },
    { id: 'chest', label: 'Chest / bust', crm: 'chest' },
    { id: 'waist', label: 'Waist', crm: 'waist' }
  ] },
  { name: 'Body measurements', fields: [
    { id: 'front_length', label: 'Front blouse length', crm: 'front_length' },
    { id: 'back_length', label: 'Back blouse length', crm: 'back_length' },
    { id: 'shoulder', label: 'Shoulder', crm: 'shoulder' },
    { id: 'front_shoulder', label: 'Front shoulder', crm: 'front_shoulder' },
    { id: 'back_shoulder', label: 'Back shoulder', crm: 'back_shoulder' },
    { id: 'upper_chest', label: 'Upper chest', crm: 'upper_chest' },
    { id: 'chest', label: 'Chest / bust', crm: 'chest' },
    { id: 'waist', label: 'Waist', crm: 'waist' },
    { id: 'shoulder_to_bust', label: 'Shoulder to bust', crm: 'shoulder_to_bust' }
  ] },
  { name: 'Sleeves', fields: [
    { id: 'bicep_length', label: 'Bicep length', crm: 'bicep_length' },
    { id: 'bicep_round', label: 'Bicep round', crm: 'bicep_round' },
    { id: 'short_sleeve_length', label: 'Short sleeve length' },
    { id: 'short_sleeve_round', label: 'Short sleeve round' },
    { id: 'elbow_length', label: 'Elbow sleeve length', crm: 'elbow_length' },
    { id: 'elbow_round', label: 'Elbow round', crm: 'elbow_round' },
    { id: 'three_quarter_length', label: '3/4 sleeve length' },
    { id: 'three_quarter_round', label: '3/4 sleeve round' },
    { id: 'full_sleeve_length', label: 'Full sleeve length' },
    { id: 'full_sleeves_round', label: 'Full sleeve round (wrist)', crm: 'full_sleeves_round' }
  ] },
  { name: 'Neck', fields: [
    { id: 'front_neck_depth', label: 'Front neck depth', crm: 'front_neck_depth' },
    { id: 'back_neck_depth', label: 'Back neck depth', crm: 'back_neck_depth' },
    { id: 'neck_width', label: 'Front neck width', crm: 'neck_width' },
    { id: 'back_neck_width', label: 'Back neck width' },
    { id: 'collar_neck', label: 'Collar', crm: 'collar_neck' }
  ] }
];

/** Garments whose size boxes the form sets itself; an empty list asks none (a saree is finished, not fitted). */
const OWN_SIZES: Record<string, SizeGroup[]> = { blouse: BLOUSE_SIZES, lehenga_blouse: BLOUSE_SIZES, saree: [] };

/** Limits for a box the CRM has no field for: the CRM's own range for its sizes. */
const ANY_SIZE: PortalMeasurementDef = { key: '', label: '', unit: 'inches', group: null, min: 0, max: 120, step: 0.25, help_text: '' };

type ChoiceDef = {
  id: string;
  label: string;
  options: { value: string; hint?: string }[];
  /** A note shown when this answer is picked, e.g. asking for a reference photo. */
  reference?: { when: string; note: string };
};
const SLEEVE_TYPE: ChoiceDef = {
  id: 'sleeve',
  label: 'Sleeve type',
  options: [
    { value: 'Short sleeve', hint: 'Reaches the mid-upper arm' },
    { value: 'Long sleeve', hint: 'All the way to the wrist' },
    { value: 'Cap sleeve', hint: 'Covers just the top of the shoulder' },
    { value: 'Puff sleeve', hint: 'Gathered at the shoulder, puffs out' },
    { value: 'Bell sleeve', hint: 'Fitted at the top, flares out' },
    { value: 'Raglan sleeve', hint: 'One piece up to the collar' },
    { value: 'Sleeveless' }
  ]
};
/** Finishing and style picks per garment (owner, 31 Oct), sent to the CRM as written notes. */
const GARMENT_CHOICES: Record<string, ChoiceDef[]> = {
  saree: [
    { id: 'fall', label: 'Fall', options: [{ value: 'Big' }, { value: 'Small' }, { value: 'No fall' }] },
    { id: 'pico', label: 'Pico', options: [{ value: 'Yes' }, { value: 'No' }] },
    {
      id: 'tassels',
      label: 'Tassels',
      options: [{ value: 'Yes' }, { value: 'No' }],
      reference: { when: 'Yes', note: 'Please add a photo of the tassels you like, under “Pallu Design” below.' }
    },
    { id: 'border', label: 'Border', options: [{ value: 'Yes' }, { value: 'No' }] }
  ],
  blouse: [SLEEVE_TYPE],
  lehenga_blouse: [SLEEVE_TYPE]
};

const initialForm: FormState = {
  // Client & Consultation
  name: '',
  phone: '',
  countryIso: 'IN',
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

  handover: '',
  addrLine: '',
  addrArea: '',
  addrCity: '',
  addrState: 'Telangana',
  addrPin: '',

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

const embroideryOptions = [
  'Maggam / Aari Hand Embroidery',
  'Zardozi & Antique Gold Zari Thread',
  'Pearl & Hand-cut Beads',
  'Subtle Resham Thread Work',
  'Cutwork & Scallop Borders',
  'Clean Minimal Border'
];

/** A note that stands out from the black-and-white form: soft maroon for guidance, strong maroon for a problem. */
function Notice({ tone = 'info', className = '', children }: { tone?: 'info' | 'warn'; className?: string; children: React.ReactNode }) {
  const Icon = tone === 'warn' ? AlertCircleIcon : InfoIcon;
  return (
    <div
      role={tone === 'warn' ? 'alert' : 'note'}
      className={`flex items-start gap-2.5 rounded-xl border-l-[3px] px-3.5 py-3 text-[12.5px] leading-relaxed ${
        tone === 'warn' ? 'border-oxblood bg-oxblood/[0.09] text-oxblood' : 'border-oxblood/45 bg-oxblood/[0.045] text-ink'
      } ${className}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone === 'warn' ? 'text-oxblood' : 'text-oxblood/75'}`} strokeWidth={1.8} aria-hidden="true" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * A choice as a card: soft white, rounded, an optional icon, and a round tick that fills maroon when
 * chosen. The chosen card gets a maroon edge and tint rather than turning solid black.
 */
function ChoiceCard({
  selected, onClick, title, sub, icon
}: { selected: boolean; onClick: () => void; title: string; sub?: string; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={`relative flex w-full items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 ${
        selected
          ? 'border-oxblood bg-oxblood/[0.05] shadow-[0_8px_20px_-12px_rgba(107,28,34,0.55)]'
          : 'border-ink/12 bg-white/45 hover:border-oxblood/35 hover:bg-white/80 hover:shadow-[0_8px_18px_-14px_rgba(29,24,21,0.4)]'
      }`}
    >
      {icon && (
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors [&_svg]:h-4 [&_svg]:w-4 ${
          selected ? 'bg-oxblood text-ivory' : 'bg-paper text-oxblood'
        }`}>
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1 pr-5">
        <span className="block text-[13px] font-medium leading-tight text-ink">{title}</span>
        {sub && <span className="mt-1 block text-[11px] leading-snug text-stone">{sub}</span>}
      </span>
      <span
        aria-hidden="true"
        className={`absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
          selected ? 'border-oxblood bg-oxblood text-ivory' : 'border-ink/25 bg-white'
        }`}
      >
        {selected && <CheckIcon className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
    </button>
  );
}

/** Short answers as a rounded pill toggle; the chosen one is a maroon pill. */
function PillToggle({
  label, options, value, onPick, width = 'w-[66px]'
}: { label: string; options: string[]; value: string; onPick: (v: string) => void; width?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex shrink-0 rounded-full bg-paper p-1 ring-1 ring-ink/10">
      {options.map((o) => {
        const on = value === o;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onPick(o)}
            className={`${width} rounded-full py-1.5 text-center text-[12.5px] font-medium transition-all duration-200 ${
              on ? 'bg-oxblood text-ivory shadow-[0_4px_10px_-4px_rgba(107,28,34,0.6)]' : 'text-ink/70 hover:text-ink'
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

const INDIA = COUNTRY_CODES.find((c) => c.iso === 'IN')!;
/** Countries most of the boutique's customers write from, shown first. */
const POPULAR = ['IN', 'AE', 'US', 'GB', 'SG', 'AU', 'CA', 'SA', 'QA', 'KW', 'OM', 'BH', 'MY', 'NZ'];

/** The country part of the WhatsApp number: a searchable list, India first. */
function CountryPicker({ iso, onPick }: { iso: string; onPick: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const current = COUNTRY_CODES.find((c) => c.iso === iso) ?? INDIA;
  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', away);
    return () => document.removeEventListener('mousedown', away);
  }, [open]);
  const query = q.trim().toLowerCase().replace(/^\+/, '');
  const list = query
    ? COUNTRY_CODES.filter((c) => c.name.toLowerCase().includes(query) || c.iso.toLowerCase() === query || c.dial.startsWith(query))
    : [...POPULAR.map((i) => COUNTRY_CODES.find((c) => c.iso === i)!).filter(Boolean), ...COUNTRY_CODES.filter((c) => !POPULAR.includes(c.iso))];
  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => { setOpen(!open); setQ(''); }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Country code: ${current.name} +${current.dial}`}
        className="flex h-[46px] items-center gap-1.5 rounded-l-xl border border-r-0 border-ink/15 bg-paper/60 px-3 text-[13.5px] text-ink transition-colors hover:bg-paper"
      >
        <span className="text-[11px] font-semibold tracking-wider text-stone">{current.iso}</span>
        <span>+{current.dial}</span>
        <ChevronDownIcon className={`h-3.5 w-3.5 text-stone transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-[280px] rounded-2xl border border-ink/10 bg-ivory p-2 shadow-[0_18px_40px_-12px_rgba(29,24,21,0.3)]">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone" aria-hidden="true" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search country or code"
              aria-label="Search country"
              className="w-full rounded-xl border border-ink/10 bg-white/70 py-2 pl-8 pr-3 text-[13px] outline-none focus:border-oxblood/40 focus:ring-2 focus:ring-oxblood/10"
            />
          </div>
          <div role="listbox" aria-label="Country" className="mt-1.5 max-h-60 overflow-y-auto">
            {list.length === 0 && <p className="px-3 py-2 text-[12.5px] text-stone">No country found.</p>}
            {list.map((c) => (
              <button
                key={c.iso}
                type="button"
                role="option"
                aria-selected={c.iso === current.iso}
                onClick={() => { onPick(c.iso); setOpen(false); }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[13px] transition-colors ${
                  c.iso === current.iso ? 'bg-oxblood/10 font-medium text-oxblood' : 'text-ink hover:bg-oxblood/5'
                }`}
              >
                <span className="truncate pr-2">{c.name}</span>
                <span className="shrink-0 text-stone">+{c.dial}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Custom Luxury Dropdown (Replaces ugly native <select>) ────────────────────────── */

function LuxurySelect({
  label,
  value,
  options,
  onChange,
  allowNone = false
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (val: string) => void;
  /** Adds "No preference" at the top; picking it stores an empty value. */
  allowNone?: boolean;
}) {
  const shown = allowNone ? [NO_PREFERENCE, ...options] : options;
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
        className="mt-1.5 flex w-full items-center justify-between rounded-xl border border-ink/10 bg-white/55 transition-all duration-200 hover:border-ink/20 focus:border-oxblood/45 focus:bg-white/85 focus:ring-2 focus:ring-oxblood/10 px-3.5 py-2.5 text-left text-[14px] text-ink outline-none"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`truncate pr-2 ${value ? '' : 'text-stone'}`}>{value || (allowNone ? NO_PREFERENCE : 'Choose one')}</span>
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
            className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-2xl border border-ink/10 bg-ivory p-1.5 shadow-[0_16px_40px_-6px_rgba(29,24,21,0.2)] py-1"
          >
            {shown.map((option) => {
              const selected = option === value || (option === NO_PREFERENCE && !value);
              return (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(option === NO_PREFERENCE ? '' : option);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] transition-colors duration-150 ${
                    selected
                      ? 'bg-oxblood/10 text-oxblood font-medium'
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

  useEffect(() => {
    if (open) window.setTimeout(() => containerRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 160);
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
    <div ref={containerRef} className="relative block scroll-mb-6">
      <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">Preferred date *</span>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`mt-1.5 flex w-full items-center justify-between rounded-xl border bg-white/55 px-3.5 py-2.5 text-left text-[14px] outline-none transition-all duration-200 ${
          hasError
            ? 'border-oxblood/60 text-oxblood ring-2 ring-oxblood/10'
            : open
            ? 'border-oxblood/45 bg-white/85 text-ink ring-2 ring-oxblood/10'
            : 'border-ink/10 text-ink hover:border-ink/20'
        }`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={displayValue ? 'text-ink' : 'text-stone/60'}>
          {displayValue || 'Choose a date'}
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
            className="mt-2 w-full max-w-[320px] rounded-2xl border border-ink/10 bg-ivory p-3.5 shadow-[0_16px_36px_-6px_rgba(29,24,21,0.18)]"
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

                // The boutique is closed on Sundays.
                const isDisabled = thisDate < min || thisDate.getDay() === 0;
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
                        ? 'bg-oxblood font-medium text-ivory shadow-[0_4px_10px_-4px_rgba(107,28,34,0.6)]'
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
            <p className="mt-2.5 border-t border-ink/10 pt-2 text-[11px] text-stone">We are closed on Sundays.</p>
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
  // True when the form holds a kept draft: shows "We kept what you typed earlier".
  const [restored, setRestored] = useState(false);
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
  // Whether a code really went out, so the window never says "we sent" after a failed send.
  const [codeSent, setCodeSent] = useState(false);
  const [portalToken, setPortalToken] = useState<string | null>(null);

  const [submittingAction, setSubmittingAction] = useState<'lead' | null>(null);
  const [submissionSuccessType, setSubmissionSuccessType] = useState<'lead' | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // New Dynamic States
  // What the CRM asks for each garment, loaded once per garment key.
  const [measureDefs, setMeasureDefs] = useState<Record<string, PortalMeasurementDef[]>>({});
  const [partsByKey, setPartsByKey] = useState<Record<string, PortalPartsResponse | null>>({});
  const requestedKeys = useRef(new Set<string>());
  const [activeGarment, setActiveGarment] = useState<string | null>(null);
  // Which garment group is showing on the outfit step, and which size groups are unfolded.
  const [garmentTab, setGarmentTab] = useState('women');
  // The fabrics the boutique sells in its online shop (ScaleEzy), so the list follows what it stocks.
  const [shopFabrics, setShopFabrics] = useState<string[]>([]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [guideOpen, setGuideOpen] = useState<{ label: string; garment: string; ids: (string | undefined)[] } | null>(null);
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
      if (res && res.length > 0) setPortalProducts(res);
    });
    getShop()
      .then((shop) => setShopFabrics((shop.facets?.fabrics ?? []).filter((f) => f.value && f.count > 0).map((f) => f.value)))
      .catch(() => setShopFabrics([]));
    
    // Load saved profiles from localStorage
    try {
      const stored = localStorage.getItem('atelier_saved_profiles');
      if (stored) {
        setSavedProfiles(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  // Bring back a draft from an earlier visit (a refresh or a closed form), photos included. Photos are
  // not saved until this has finished, or the empty first render would wipe the saved ones.
  const photosRestored = useRef(false);
  useEffect(() => {
    const draft = loadDraft<{ form: FormState; tab: typeof activeTab }>();
    if (!draft?.form) {
      photosRestored.current = true;
      return;
    }
    setForm({
      ...initialForm,
      ...draft.form,
      garments: (draft.form.garments ?? []).map((g) => ({ ...newGarment(g.key), ...g, photos: {} }))
    });
    setActiveTab(draft.tab ?? 'consultation');
    setRestored(true);
    loadDraftPhotos().then((photos) => {
      setForm((prev) => ({ ...prev, garments: prev.garments.map((g) => (photos[g.key] ? { ...g, photos: photos[g.key] } : g)) }));
      photosRestored.current = true;
    });
  }, []);

  const isEmpty = (f: FormState) => f.garments.length === 0 && JSON.stringify({ ...f, garments: [] }) === JSON.stringify(initialForm);

  // Keep the typed details as the customer goes (photos are saved separately, only when they change).
  useEffect(() => {
    if (submissionSuccessType) return;
    const t = window.setTimeout(() => {
      if (isEmpty(form)) clearDraft();
      else saveDraft({ form: { ...form, garments: form.garments.map((g) => ({ ...g, photos: {} })) }, tab: activeTab });
    }, 400);
    return () => window.clearTimeout(t);
  }, [form, activeTab, submissionSuccessType]);

  const photoSignature = form.garments
    .map((g) => `${g.key}:${Object.entries(g.photos).map(([k, fs]) => `${k}=${fs.map((f) => `${f.name}/${f.size}`).join(',')}`).join(';')}`)
    .join('|');
  useEffect(() => {
    if (submissionSuccessType || !photosRestored.current) return;
    const all: DraftPhotos = {};
    for (const g of form.garments) if (Object.values(g.photos).some((fs) => fs.length)) all[g.key] = g.photos;
    void saveDraftPhotos(all);
  }, [photoSignature, submissionSuccessType]);

  // The WhatsApp number: Indian numbers are the CRM's 10 digits, others go in full (+country code).
  const country = COUNTRY_CODES.find((c) => c.iso === form.countryIso) ?? INDIA;
  const isIndia = country.iso === 'IN';
  const phoneDigits = form.phone.replace(/\D/g, '');
  const phoneOk = isIndia ? phoneDigits.length === 10 : phoneDigits.length >= 6 && phoneDigits.length <= 14;
  const fullPhone = isIndia ? phoneDigits : `+${country.dial}${phoneDigits}`;
  const shownPhone = `+${country.dial} ${phoneDigits}`;
  const phoneError = isIndia ? 'Please enter your 10-digit WhatsApp number.' : 'Please enter your WhatsApp number, without the country code.';

  const [, startTransition] = useTransition();
  const [localPhone, setLocalPhone] = useState(form.phone);

  useEffect(() => {
    setLocalPhone(form.phone);
  }, [form.phone]);

  // Check for autocomplete suggestions when phone changes (debounced to avoid blocking main thread)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (phoneOk && !dismissedSuggestion) {
        const match = savedProfiles.find(
          (p) => (p.countryIso ?? 'IN') === form.countryIso && p.phone.replace(/\D/g, '') === phoneDigits && p.name
        );
        if (match && match.name !== form.name) {
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
    if (!form.name.trim()) next.name = 'Please enter your name.';
    if (!phoneOk) next.phone = phoneError;
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = 'Please check your email address, for example name@example.com.';
    }
    if (!form.date) next.date = 'Please choose a date.';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      switchTab('consultation');
      return false;
    }
    return true;
  };

  /** The size boxes shown for a garment: the boutique's own list where it has one, else the CRM's, in the CRM's groups. */
  const sizeGroupsFor = (key: string): SizeGroup[] => {
    if (key in OWN_SIZES) return OWN_SIZES[key];
    const groups: SizeGroup[] = [];
    for (const d of measureDefs[key] ?? []) {
      const name = d.group || 'Main sizes';
      const field = { id: d.key, label: d.label, crm: d.key };
      const found = groups.find((x) => x.name === name);
      if (found) found.fields.push(field); else groups.push({ name, fields: [field] });
    }
    return groups;
  };
  /** Each box once: a box listed in two groups is the same box. */
  const sizeFieldsFor = (key: string): SizeField[] => {
    const seen = new Set<string>();
    return sizeGroupsFor(key).flatMap((g) => g.fields).filter((f) => !seen.has(f.id) && !!seen.add(f.id));
  };
  const limitsFor = (key: string, f: SizeField) => measureDefs[key]?.find((d) => d.key === f.crm) ?? ANY_SIZE;

  /** What one garment sends: sizes the CRM has fields for (in inches), and the rest as note lines. */
  const garmentSpec = (g: Garment) => {
    const measurements: Record<string, number> = {};
    const otherSizes: string[] = [];
    let filled = 0;
    for (const f of sizeFieldsFor(g.key)) {
      const raw = (g.measurements[f.id] ?? '').trim();
      const n = parseFloat(raw);
      if (!raw || !Number.isFinite(n)) continue;
      filled++;
      if (f.crm) measurements[f.crm] = Math.round((form.unit === 'cm' ? n / 2.54 : n) * 100) / 100;
      else otherSizes.push(`${f.label} ${raw} ${form.unit}`);
    }
    const choices = (GARMENT_CHOICES[g.key] ?? []).filter((c) => g.choices[c.id]).map((c) => `${c.label}: ${g.choices[c.id]}`);
    return { measurements: Object.keys(measurements).length ? measurements : undefined, otherSizes, choices, filled };
  };

  /** The first garment with a size that does not make sense, so the send can point the customer to it. */
  const garmentWithBadSize = () =>
    form.garments.find((g) => sizeFieldsFor(g.key).some((f) => badMeasurement(g.measurements[f.id] ?? '', limitsFor(g.key, f), form.unit)));

  const checkSizes = (): boolean => {
    const bad = garmentWithBadSize();
    if (!bad) return true;
    setActiveGarment(bad.key);
    switchTab('measurements');
    setSubmitError(`Some ${garmentName(bad.key)} sizes don't look right. Please correct them or leave them empty.`);
    return false;
  };

  /** With "Courier it to me", the address must be complete enough to post to. */
  const checkDelivery = (): boolean => {
    if (form.handover !== 'courier') return true;
    const next: Errors = {};
    if (!form.addrLine.trim()) next.addrLine = 'Please enter the house or flat and street.';
    if (!form.addrCity.trim()) next.addrCity = 'Please enter the city.';
    if (!/^\d{6}$/.test(form.addrPin)) next.addrPin = 'Please enter the 6-digit pincode.';
    if (Object.keys(next).length === 0) return true;
    setErrors((prev) => ({ ...prev, ...next }));
    switchTab('measurements');
    setSubmitError('Please complete the delivery address, or choose to collect at the boutique.');
    return false;
  };
  const deliveryAddress = () =>
    [form.addrLine, form.addrArea, form.addrCity, form.addrState].map((x) => x.trim()).filter(Boolean).join(', ') +
    (form.addrPin ? ` - ${form.addrPin}` : '');
  const deliveryLine = () =>
    form.handover === 'courier' ? `Delivery: courier to ${deliveryAddress()}` : form.handover === 'collect' ? 'Delivery: collect at the boutique' : '';
  const [copied, setCopied] = useState(false);
  const boutiqueAddress = `${contact.name}, ${contact.street}, ${contact.city}. Phone ${contact.phone}`;

  /** Opens the code window and asks the CRM to send a code on WhatsApp. */
  const requestCode = async (purpose: 'autofill' | 'submit') => {
    setOtpPurpose(purpose);
    setOtpStatus('requesting');
    setOtpError(null);
    setOtpCode('');
    setCodeSent(false);
    setOtpModalOpen(true);

    const res = await requestWhatsAppOtp(fullPhone);
    if (res.success) {
      setCodeSent(true);
      setOtpCooldown(60);
      setOtpStatus('idle');
      setOtpNote(res.simulated ? 'Demo mode: type any 6 digits, for example 123456.' : null);
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } else {
      setOtpStatus('error');
      setOtpError(formatBoutiqueErrorMessage(res.message, 'otp_request'));
    }
  };

  /* ── Verify the number early: fills in name and email the boutique already has ── */
  const handleInitiateAutofill = async () => {
    if (!phoneOk) {
      setErrors((prev) => ({ ...prev, phone: phoneError }));
      return;
    }
    await requestCode('autofill');
  };

  /* ── Send the request: confirm the number by a WhatsApp code first ─────────────── */
  const handleInitiateLeadWithOtp = async () => {
    if (!validateCoreForm() || !checkSizes() || !checkDelivery()) return;

    if (portalToken) {
      // The number was already confirmed on the first step: send straight away.
      setOtpPurpose('submit');
      setOtpStatus('verifying');
      setOtpError(null);
      setOtpModalOpen(true);
      if (!(await executeLeadSubmission(portalToken))) setPortalToken(null);
      return;
    }
    await requestCode('submit');
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
      setOtpError('Please enter all 6 digits of the code.');
      return;
    }

    setOtpStatus('verifying');
    setOtpError(null);

    // 1. Verify code
    const verifyRes = await verifyWhatsAppOtp(fullPhone, otpCode);
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
      setOtpNote(null);
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
        address: form.handover === 'courier' ? deliveryAddress() : undefined,
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

      const spec = g ? garmentSpec(g) : null;
      // Each text field takes 500 characters; what does not fit in the requirement spills into the notes.
      const customFull = [
        spec?.choices.length ? spec.choices.join('; ') : null,
        g?.requests.trim() ? `${g.key === 'saree' ? 'Specifications' : 'Design'}: ${g.requests.trim()}` : null,
        spec?.otherSizes.length ? `Other sizes: ${spec.otherSizes.join(', ')}` : null,
        form.customDressName ? `Style: ${form.customDressName}` : null,
        form.additionalNotes ? `Notes: ${form.additionalNotes}` : null
      ].filter(Boolean).join(' | ');
      const custom = customFull.slice(0, 500);
      const notes = [
        appointment,
        pieces.length > 1 ? `Outfit ${i + 1} of ${pieces.length}.` : '',
        deliveryLine() ? `${deliveryLine()}.` : '',
        form.notes.trim(),
        customFull.length > 500 ? `(continued) ${customFull.slice(500)}` : ''
      ].filter(Boolean).join(' ').slice(0, 500);
      const measurements = spec?.measurements;
      const hasPhotos = !!g && Object.values(g.photos).some((files) => files.length > 0);

      let payload: PortalRequirementPayload | FormData;
      if (g && hasPhotos) {
        const fd = new FormData();
        fd.append('garment_type', g.key);
        fd.append('occasion', form.occasion);
        if (g.craft) fd.append('embellishments', g.craft);
        if (g.fabric.trim()) fd.append('pattern_style', g.fabric.trim());
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
          pattern_style: g?.fabric.trim() || undefined,
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
    clearDraft();
    setOtpModalOpen(false);
    setSubmissionSuccessType('lead');
    return true;
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
    setOtpNote(null);
    setOpenGroups({});
    setGuideOpen(null);
    setGarmentTab('women');
    customerSaved.current = false;
    sentGarments.current.clear();
  };

  /** Closing keeps what was typed (a draft); only a finished booking starts the next one fresh. */
  const afterClose = () => {
    if (submissionSuccessType) {
      reset();
      setRestored(false);
      return;
    }
    setOtpModalOpen(false);
    setOtpCode('');
    setOtpStatus('idle');
    setOtpError(null);
    setGuideOpen(null);
    setErrors({});
    setSubmitError(null);
    setRestored(!isEmpty(form));
  };

  const startOver = () => {
    clearDraft();
    reset();
    setRestored(false);
    setLocalPhone('');
  };

  const fieldCls =
    'mt-1.5 w-full rounded-xl border border-ink/10 bg-white/55 transition-all duration-200 hover:border-ink/20 focus:border-oxblood/45 focus:bg-white/85 focus:ring-2 focus:ring-oxblood/10 px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-stone/45';

  return (
    <AnimatePresence onExitComplete={afterClose}>
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
            className="absolute inset-y-0 right-0 flex h-full w-full max-w-[640px] flex-col overflow-hidden bg-ivory sm:rounded-l-[28px] shadow-[0_20px_60px_-15px_rgba(29,24,21,0.35)]"
            style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: easeOut }}
            data-lenis-prevent
          >
            {/* FIXED ATELIER HEADER */}
            <div className="shrink-0 border-b border-ink/10 bg-ivory px-6 pt-5 pb-3 md:px-9">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-[0.28em] text-zari">
                    Swathy Reddy Designer Studio
                  </span>
                  <h2 id="booking-title" className="font-display text-2xl md:text-[26px] font-medium text-ink leading-tight mt-0.5">
                    Book an <em>appointment</em>
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-stone hover:text-ink hover:bg-ink/5 transition-colors"
                >
                  <XIcon className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* SLEEK STEP NAVIGATION (Spacious, airy & clickable) */}
              {!submissionSuccessType && (
                <div className="mt-4 flex items-center justify-between border-t border-ink/8 pt-3">
                  {[
                    { id: 'consultation', title: 'Your details' },
                    { id: 'dress', title: 'The outfit' },
                    { id: 'measurements', title: 'Sizes & photos' }
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
                        <span className="whitespace-nowrap text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.16em]">
                          {tab.title}
                        </span>
                        {/* A plain underline: the sliding layoutId one kept the closed dialog from ever leaving the page. */}
                        {isActive && <span aria-hidden="true" className="absolute -bottom-3 left-0 right-0 h-[2px] bg-oxblood" />}
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

                  <h2 className="font-display text-4xl leading-[1.08] md:text-5xl">
                    Request <em>received.</em>
                  </h2>

                  <div className="mt-5 rounded-2xl border border-ink/10 bg-white/45 p-5 shadow-[0_12px_30px_-22px_rgba(29,24,21,0.5)]">
                    <p className="text-[14px] leading-relaxed text-ink">
                      Thank you, <strong className="font-semibold text-oxblood">{form.name.trim().split(' ')[0]}</strong>. We have your request for a{' '}
                      <strong>{form.mode === 'boutique' ? 'visit to the boutique' : 'video call'}</strong> on{' '}
                      <strong>
                        {new Date(form.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </strong>
                      {' '}for {form.occasion.toLowerCase()}.
                    </p>

                    <div className="mt-4 space-y-1.5 border-t border-ink/10 pt-3.5 text-[12.5px] text-stone">
                      {form.garments.length === 0 && <p>• Outfit: we will plan it with you at the appointment</p>}
                      {form.garments.map((g) => {
                        const sizes = garmentSpec(g).filled;
                        const photos = Object.values(g.photos).reduce((n, f) => n + f.length, 0);
                        return (
                          <p key={g.key}>
                            • <span className="font-medium text-ink">{garmentName(g.key)}</span>
                            {g.fabric.trim() && <> · {g.fabric.trim()}</>}
                            {sizes > 0 && <> · {sizes} {sizes === 1 ? 'size' : 'sizes'}</>}
                            {photos > 0 && <> · {photos} {photos === 1 ? 'photo' : 'photos'}</>}
                          </p>
                        );
                      })}
                      {form.handover && (
                        <p>
                          • Delivery: <span className="font-medium text-ink">{form.handover === 'courier' ? `Courier to ${deliveryAddress()}` : 'Collect at the boutique'}</span>
                        </p>
                      )}
                      <p>• WhatsApp: <span className="font-medium text-ink">{shownPhone}</span></p>
                      {form.email && <p>• Email: <span className="font-medium text-ink">{form.email}</span></p>}
                    </div>
                  </div>

                  <p className="mt-5 text-[13.5px] leading-relaxed text-stone">
                    We will call or WhatsApp you within a day to confirm the time.
                  </p>

                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-8 self-start rounded-full bg-ink px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.22em] text-ivory transition-colors duration-200 hover:bg-oxblood shadow-xs"
                  >
                    Close
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
                  {restored && (
                    <Notice className="mb-5">
                      We kept what you typed earlier.{' '}
                      <button type="button" onClick={startOver} className="font-medium text-oxblood underline underline-offset-2 hover:text-ink">
                        Start over
                      </button>
                    </Notice>
                  )}
                  {submitError && <Notice tone="warn" className="mb-5">{submitError}</Notice>}

                  {/* ────────────────────────────────────────────────────────────── */}
                  {/* TAB 1: CONSULTATION & CONTACT                                  */}
                  {/* ────────────────────────────────────────────────────────────── */}
                  {/* The step panels fade in only: they are not inside an AnimatePresence of their own, so an
                      `exit` here would never play. */}
                  {activeTab === 'consultation' && (
                    <motion.div
                      key="tab-consultation"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.32, ease: easeOut }}
                      className="space-y-6"
                    >
                      {/* Name & Phone side-by-side */}
                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <label className="block">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">Your name *</span>
                          <input
                            ref={firstFieldRef}
                            autoComplete="name"
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
                            WhatsApp number *
                          </span>
                          <div className="relative mt-1.5 flex">
                            <CountryPicker iso={form.countryIso} onPick={(iso) => update('countryIso', iso)} />
                            <div className="relative flex-1">
                              <input
                                type="tel"
                                value={localPhone}
                                onChange={(e) => {
                                  // Digits only. India: at most 10, a pasted +91 or leading 0 dropped. Elsewhere: up
                                  // to 14 digits, a pasted country code or trunk 0 dropped.
                                  let val = e.target.value.replace(/\D/g, '');
                                  if (isIndia) {
                                    if (val.length > 10 && val.startsWith('91')) val = val.slice(2);
                                    if (val.length > 10 && val.startsWith('0')) val = val.slice(1);
                                    val = val.slice(0, 10);
                                  } else {
                                    if (e.target.value.trim().startsWith('+') && val.startsWith(country.dial)) val = val.slice(country.dial.length);
                                    val = val.replace(/^0+/, '').slice(0, 14);
                                  }
                                  setLocalPhone(val);
                                  startTransition(() => {
                                    update('phone', val);
                                  });
                                }}
                                inputMode="numeric"
                                autoComplete="tel-national"
                                className="w-full h-[46px] rounded-r-xl border border-ink/15 bg-white/50 px-3.5 py-0 text-[13.5px] text-ink placeholder:text-stone/40 focus:border-oxblood/50 focus:outline-none focus:ring-2 focus:ring-oxblood/15 transition-all pr-[92px]"
                                placeholder={isIndia ? '98765 43210' : 'Number without country code'}
                                aria-invalid={!!errors.phone}
                              />
                              {phoneOk && !portalToken && (
                                <button
                                  type="button"
                                  onClick={handleInitiateAutofill}
                                  className="absolute bottom-1.5 right-1.5 top-1.5 rounded-full bg-oxblood/10 px-3.5 text-[11px] font-semibold uppercase tracking-wider text-oxblood transition-colors hover:bg-oxblood hover:text-ivory"
                                >
                                  Verify
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
                          {errors.phone ? (
                            <span className="mt-1 block text-[12px] text-oxblood">{errors.phone}</span>
                          ) : (
                            !portalToken && (
                              <span className="mt-1 block text-[11.5px] text-stone">
                                Been here before? Tap Verify and we will fill in your details.
                              </span>
                            )
                          )}

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
                                    <p className="text-[12px] font-semibold text-ink leading-tight">Welcome back</p>
                                    <p className="text-[11px] text-stone leading-tight mt-0.5">Use the details you gave last time, {suggestedProfile.name.split(' ')[0]}?</p>
                                  </div>
                                </div>
                                <div className="flex gap-1.5 self-end sm:self-auto shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => setDismissedSuggestion(true)}
                                    className="text-[10px] uppercase tracking-wider text-stone hover:text-oxblood font-semibold px-2.5 py-1.5 transition-colors"
                                  >
                                    No
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleApplySuggestion}
                                    className="rounded-sm bg-ink px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-ivory transition-colors hover:bg-oxblood shadow-xs"
                                  >
                                    Use them
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
                          How would you like to meet?
                        </span>
                        <div role="radiogroup" aria-label="How would you like to meet?" className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
                          <ChoiceCard selected={form.mode === 'boutique'} onClick={() => update('mode', 'boutique')} icon={<StoreIcon />} title="Visit the boutique" sub="Banjara Hills, Hyderabad" />
                          <ChoiceCard selected={form.mode === 'video'} onClick={() => update('mode', 'video')} icon={<VideoIcon />} title="Video call" sub="From wherever you are" />
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
                          <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">Email (optional)</span>
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
                          <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">City</span>
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
                          Anything we should know? (optional)
                        </span>
                        <input
                          type="text"
                          value={form.notes}
                          onChange={(e) => update('notes', e.target.value)}
                          className={fieldCls}
                          placeholder="For example: wedding in March, I love rose-gold zari"
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
                      transition={{ duration: 0.32, ease: easeOut }}
                      className="space-y-6"
                    >
                      {/* Garments in groups (the CRM's list has no categories), several can be picked */}
                      <div>
                        <div className="mb-2 flex items-baseline justify-between">
                          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone">
                            What would you like made?
                          </span>
                          {form.garments.length > 0 && (
                            <span className="text-[11px] font-semibold text-oxblood">{form.garments.length} chosen</span>
                          )}
                        </div>
                        <p className="mb-3 text-[12px] text-stone">Pick one or more. Each gets its own sizes and photos on the next step.</p>

                        <div role="tablist" aria-label="Garment group" className="mb-3 flex gap-1 border-b border-ink/10">
                          {GARMENT_GROUPS.filter((grp) => availableGarments.some((x) => groupOf(x.key) === grp.id)).map((grp) => {
                            const picked = form.garments.filter((g) => groupOf(g.key) === grp.id).length;
                            const active = garmentTab === grp.id;
                            return (
                              <button
                                key={grp.id}
                                type="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setGarmentTab(grp.id)}
                                className={`-mb-px border-b-2 px-3 py-2 text-[12px] font-medium transition-colors ${
                                  active ? 'border-oxblood text-ink' : 'border-transparent text-stone hover:text-ink'
                                }`}
                              >
                                {grp.label}
                                {picked > 0 && <span className="ml-1.5 rounded-full bg-oxblood px-1.5 text-[10px] text-ivory">{picked}</span>}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {availableGarments.filter((x) => groupOf(x.key) === garmentTab).map((product) => {
                            const isSelected = form.garments.some((g) => g.key === product.key);
                            return (
                              <button
                                key={product.key}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => toggleGarment(product.key)}
                                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] transition-all duration-200 ${
                                  isSelected
                                    ? 'border-oxblood bg-oxblood font-medium text-ivory shadow-[0_6px_14px_-8px_rgba(107,28,34,0.7)]'
                                    : 'border-ink/15 bg-white/50 text-ink hover:border-oxblood/40 hover:bg-white/80'
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
                        <Notice>Not sure yet? That is fine. Leave this empty and we will plan the outfit with you at the appointment.</Notice>
                      ) : (
                        <div className="space-y-3">
                          {form.garments.map((g) => (
                            <div key={g.key} className="rounded-2xl border border-ink/8 bg-white/40 p-4 shadow-[0_10px_26px_-22px_rgba(29,24,21,0.5)] sm:p-5">
                              <div className="flex items-start justify-between gap-3">
                                <p className="font-display text-[19px] leading-tight text-ink">{garmentName(g.key)}</p>
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
                                <div>
                                  <LuxurySelect
                                    label="Fabric"
                                    value={g.fabricOther ? OTHER_FABRIC : g.fabric}
                                    onChange={(val) =>
                                      val === OTHER_FABRIC
                                        ? updateGarment(g.key, { fabricOther: true, fabric: '' })
                                        : updateGarment(g.key, { fabricOther: false, fabric: val })
                                    }
                                    options={[...shopFabrics, OWN_FABRIC, OTHER_FABRIC]}
                                    allowNone
                                  />
                                  {g.fabricOther && (
                                    <input
                                      type="text"
                                      autoFocus
                                      value={g.fabric}
                                      onChange={(e) => updateGarment(g.key, { fabric: e.target.value })}
                                      className={fieldCls}
                                      placeholder="Type the fabric, for example Chanderi"
                                      aria-label={`${garmentName(g.key)} fabric`}
                                    />
                                  )}
                                </div>
                                <LuxurySelect
                                  label="Embroidery & work"
                                  value={g.craft}
                                  onChange={(val) => updateGarment(g.key, { craft: val })}
                                  options={embroideryOptions}
                                  allowNone
                                />
                              </div>
                              <label className="mt-4 block">
                                <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">
                                  {g.key === 'saree' ? 'Any other specifications (optional)' : 'Design ideas (optional)'}
                                </span>
                                <input
                                  type="text"
                                  value={g.requests}
                                  onChange={(e) => updateGarment(g.key, { requests: e.target.value })}
                                  className={fieldCls}
                                  placeholder={g.key === 'saree' ? 'For example: contrast border, a motif on the pallu' : 'For example: boat neck, deep V back, elbow sleeves'}
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
                      transition={{ duration: 0.32, ease: easeOut }}
                      className="space-y-6"
                    >
                      {/* Reassurance note & Unit selector */}
                      <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-3">
                        <p className="text-[12px] text-stone leading-relaxed max-w-[360px]">
                          {form.mode === 'boutique'
                            ? 'All optional. Fill in what you know; we will measure you at the boutique.'
                            : 'All optional. Fill in what you know; we will guide you through the rest on the video call.'}
                        </p>

                        <PillToggle
                          label="Units"
                          options={['Inches', 'CM']}
                          value={form.unit === 'in' ? 'Inches' : 'CM'}
                          onPick={(v) => update('unit', v === 'CM' ? 'cm' : 'in')}
                          width="w-[64px]"
                        />
                      </div>

                      {/* One tab per garment: each has its own measurements and photo parts */}
                      {form.garments.length > 1 && (
                        <div role="tablist" aria-label="Garment" className="flex flex-wrap gap-2">
                          {form.garments.map((g) => {
                            const isActive = g.key === currentGarment?.key;
                            const filled = Object.values(g.measurements).some((v) => v.trim()) || Object.values(g.choices).some(Boolean) || Object.values(g.photos).some((f) => f.length > 0);
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

                      {form.garments.length === 0 && (
                        <Notice>
                          You have not picked a garment, so there are no sizes to fill. You can send your request as it is,
                          or go back and pick what you would like made.
                        </Notice>
                      )}

                      {currentGarment && (GARMENT_CHOICES[currentGarment.key] ?? []).length > 0 && (
                        <div className="space-y-4">
                          <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-stone">
                            {garmentName(currentGarment.key)} {currentGarment.key === 'saree' ? 'finishing' : 'style'}
                          </span>
                          {(() => {
                            const all = GARMENT_CHOICES[currentGarment.key];
                            const pick = (c: ChoiceDef, value: string) =>
                              updateGarment(currentGarment.key, {
                                choices: { ...currentGarment.choices, [c.id]: currentGarment.choices[c.id] === value ? '' : value }
                              });
                            // Short answers (Yes / No, Big / Small) sit as a tidy table: name left, one joined set of
                            // equal buttons right, so every row lines up. Answers with a description stay as cards.
                            const short = all.filter((c) => c.options.every((o) => !o.hint));
                            const described = all.filter((c) => c.options.some((o) => o.hint));
                            const notes = all.filter((c) => c.reference && currentGarment.choices[c.id] === c.reference.when);
                            return (
                              <>
                                {short.length > 0 && (
                                  <div className="grid grid-cols-1 gap-x-8 border-t border-ink/10 sm:grid-cols-2">
                                    {short.map((c) => (
                                      <div key={c.id} className="flex items-center justify-between gap-4 border-b border-ink/10 py-2.5">
                                        <span className="text-[13px] font-medium text-ink">{c.label}</span>
                                        <PillToggle label={c.label} options={c.options.map((o) => o.value)} value={currentGarment.choices[c.id] ?? ''} onPick={(v) => pick(c, v)} />
                                      </div>
                                    ))}
                                  </div>
                                )}
                                {described.map((c) => (
                                  <div key={c.id}>
                                    <p className="mb-2 text-[12.5px] font-medium text-ink">{c.label}</p>
                                    <div role="radiogroup" aria-label={c.label} className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                      {c.options.map((o) => (
                                        <ChoiceCard key={o.value} selected={currentGarment.choices[c.id] === o.value} onClick={() => pick(c, o.value)} title={o.value} sub={o.hint} />
                                      ))}
                                    </div>
                                  </div>
                                ))}
                                {notes.map((c) => <Notice key={c.id}>{c.reference!.note}</Notice>)}
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {currentGarment && sizeGroupsFor(currentGarment.key).length > 0 && (() => {
                        const groups = sizeGroupsFor(currentGarment.key);
                        return (
                          <div className="space-y-3">
                            <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-stone">
                              {garmentName(currentGarment.key)} sizes ({form.unit === 'in' ? 'inches' : 'cm'})
                            </span>
                            <p className="flex items-center gap-1.5 text-[12px] text-stone">
                              <RulerIcon className="h-3.5 w-3.5 text-zari" strokeWidth={1.8} aria-hidden="true" />
                              Tap the ruler next to a size to see how to measure it.
                            </p>
                            {groups.map((grp, gi) => {
                              const id = `${currentGarment.key}:${grp.name}`;
                              const filled = grp.fields.filter((f) => (currentGarment.measurements[f.id] ?? '').trim()).length;
                              const hasBad = grp.fields.some((f) => badMeasurement(currentGarment.measurements[f.id] ?? '', limitsFor(currentGarment.key, f), form.unit));
                              const isOpen = openGroups[id] ?? (gi === 0 || hasBad);
                              return (
                                <div key={id} className="overflow-hidden rounded-2xl border border-ink/8 bg-white/35">
                                  <button
                                    type="button"
                                    aria-expanded={isOpen}
                                    onClick={() => setOpenGroups((o) => ({ ...o, [id]: !isOpen }))}
                                    className="flex w-full items-center justify-between px-3.5 py-3 text-left"
                                  >
                                    <span className="text-[13px] font-medium text-ink">
                                      {grp.name}
                                      <span className="ml-2 text-[11.5px] font-normal text-stone">
                                        {filled > 0 ? `${filled} of ${grp.fields.length} filled` : `${grp.fields.length} sizes`}
                                      </span>
                                    </span>
                                    <ChevronDownIcon className={`h-4 w-4 text-stone transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                                  </button>
                                  {isOpen && (
                                    <div className="grid grid-cols-2 gap-x-5 gap-y-4 border-t border-ink/10 px-3.5 pb-4 pt-3 sm:grid-cols-3">
                                      {grp.fields.map((measure) => {
                                        const raw = currentGarment.measurements[measure.id] || '';
                                        const limits = limitsFor(currentGarment.key, measure);
                                        const bad = badMeasurement(raw, limits, form.unit);
                                        return (
                                          <div key={measure.id} className="relative">
                                          {/* Labels get room for two lines so boxes side by side line up even when one name wraps. */}
                                          <label className="block">
                                            <span className={`block min-h-[2.6em] text-[10.5px] font-medium uppercase leading-[1.3] tracking-[0.12em] text-stone ${guideFor(currentGarment.key, measure.id, measure.crm) ? 'pr-7' : ''}`}>{measure.label}</span>
                                            <div className="relative mt-1">
                                              <input
                                                type="text"
                                                inputMode="decimal"
                                                value={raw}
                                                aria-invalid={bad}
                                                onChange={(e) => {
                                                  updateGarment(currentGarment.key, {
                                                    measurements: { ...currentGarment.measurements, [measure.id]: e.target.value }
                                                  });
                                                  if (submitError) setSubmitError(null);
                                                }}
                                                className={`w-full rounded-lg border bg-white/60 px-2.5 py-2 pr-8 text-[14px] font-medium text-ink outline-none transition-all duration-200 placeholder:text-stone/40 ${
                                                  bad ? 'border-oxblood/60 ring-2 ring-oxblood/10' : 'border-ink/10 hover:border-ink/20 focus:border-oxblood/45 focus:ring-2 focus:ring-oxblood/10'
                                                }`}
                                              />
                                              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-stone/60">{form.unit}</span>
                                            </div>
                                            {bad && (
                                              <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-oxblood">
                                                <AlertCircleIcon className="h-3 w-3" aria-hidden="true" /> Not a size we expect
                                              </span>
                                            )}
                                            {!bad && limits.help_text && <span className="mt-1 block text-[11px] text-stone">{limits.help_text}</span>}
                                          </label>
                                          {guideFor(currentGarment.key, measure.id, measure.crm) && (
                                            <button
                                              type="button"
                                              onClick={() => setGuideOpen({ label: measure.label, garment: currentGarment.key, ids: [measure.id, measure.crm] })}
                                              aria-label={`How to measure ${measure.label}`}
                                              className="absolute -right-1 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full text-zari transition-colors hover:bg-zari/15 hover:text-oxblood"
                                            >
                                              <RulerIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
                                            </button>
                                          )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}

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
                        <span className="text-[11px] uppercase tracking-[0.2em] text-stone font-medium">
                          Tailoring notes (optional)
                        </span>
                        <input
                          type="text"
                          value={form.additionalNotes}
                          onChange={(e) => update('additionalNotes', e.target.value)}
                          className={fieldCls}
                          placeholder="For example: 2-inch inner margin, cotton lining, extra hooks"
                        />
                      </label>

                      {/* How the finished outfit reaches the customer, and where to post fabric to us. */}
                      <div className="mt-6 space-y-4 border-t border-ink/10 pt-5">
                        <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-stone">Getting your outfit</span>
                        <div role="radiogroup" aria-label="Getting your outfit" className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
                          <ChoiceCard
                            selected={form.handover === 'collect'}
                            onClick={() => update('handover', form.handover === 'collect' ? '' : 'collect')}
                            icon={<PackageIcon />}
                            title="Collect at the boutique"
                            sub="Banjara Hills, Hyderabad"
                          />
                          <ChoiceCard
                            selected={form.handover === 'courier'}
                            onClick={() => update('handover', form.handover === 'courier' ? '' : 'courier')}
                            icon={<TruckIcon />}
                            title="Courier it to me"
                            sub="Anywhere in India"
                          />
                        </div>

                        {form.handover === 'courier' && (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <label className="block sm:col-span-2">
                              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone">House / flat and street *</span>
                              <input
                                value={form.addrLine}
                                onChange={(e) => update('addrLine', e.target.value)}
                                autoComplete="address-line1"
                                className={fieldCls}
                                placeholder="Flat 302, Lakeview Apartments, Road No. 12"
                                aria-invalid={!!errors.addrLine}
                              />
                              {errors.addrLine && <span className="mt-1 block text-[12px] text-oxblood">{errors.addrLine}</span>}
                            </label>
                            <label className="block sm:col-span-2">
                              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone">Area / landmark</span>
                              <input
                                value={form.addrArea}
                                onChange={(e) => update('addrArea', e.target.value)}
                                autoComplete="address-line2"
                                className={fieldCls}
                                placeholder="Near KBR Park, Jubilee Hills"
                              />
                            </label>
                            <label className="block">
                              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone">City *</span>
                              <input
                                value={form.addrCity}
                                onChange={(e) => update('addrCity', e.target.value)}
                                autoComplete="address-level2"
                                className={fieldCls}
                                placeholder="Hyderabad"
                                aria-invalid={!!errors.addrCity}
                              />
                              {errors.addrCity && <span className="mt-1 block text-[12px] text-oxblood">{errors.addrCity}</span>}
                            </label>
                            <label className="block">
                              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone">Pincode *</span>
                              <input
                                value={form.addrPin}
                                onChange={(e) => update('addrPin', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                inputMode="numeric"
                                autoComplete="postal-code"
                                className={fieldCls}
                                placeholder="500033"
                                aria-invalid={!!errors.addrPin}
                              />
                              {errors.addrPin && <span className="mt-1 block text-[12px] text-oxblood">{errors.addrPin}</span>}
                            </label>
                            <label className="block sm:col-span-2">
                              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-stone">State</span>
                              <input
                                value={form.addrState}
                                onChange={(e) => update('addrState', e.target.value)}
                                autoComplete="address-level1"
                                className={fieldCls}
                                placeholder="Telangana"
                              />
                            </label>
                          </div>
                        )}

                        {(form.mode === 'video' || form.handover === 'courier' || form.garments.some((g) => g.fabric === OWN_FABRIC)) && (
                          <Notice>
                            <p className="font-medium">Sending us your fabric or a garment?</p>
                            <p className="mt-1 text-stone">Post it to: {boutiqueAddress}</p>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(boutiqueAddress).then(() => {
                                  setCopied(true);
                                  window.setTimeout(() => setCopied(false), 2000);
                                }).catch(() => {});
                              }}
                              className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-oxblood underline underline-offset-2 hover:text-ink"
                            >
                              <CopyIcon className="h-3.5 w-3.5" aria-hidden="true" />
                              {copied ? 'Copied' : 'Copy address'}
                            </button>
                          </Notice>
                        )}
                      </div>
                    </motion.div>
                  )}
                </form>
              )}
            </div>

            {/* FIXED FOOTER (Serene, uncluttered & intuitive) */}
            {!submissionSuccessType && (
              <div className="shrink-0 border-t border-line/80 bg-ivory px-6 py-4 md:px-9">
                {activeTab === 'consultation' ? (
                  <div>
                    {/* Phones: Book appointment full width on top, the optional extras link under it. */}
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (validateCoreForm()) switchTab('dress');
                        }}
                        className="group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-oxblood/40 bg-white/50 px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-oxblood transition-all duration-200 hover:-translate-y-px hover:border-oxblood hover:bg-oxblood/[0.06] sm:w-auto"
                      >
                        <span>Add outfit &amp; sizes</span>
                        <span className="rounded-full bg-oxblood/10 px-2 py-0.5 text-[9.5px] tracking-[0.12em]">Optional</span>
                        <ArrowRightIcon className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(submittingAction)}
                        onClick={handleInitiateLeadWithOtp}
                        className="group inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-oxblood px-7 py-3.5 text-ivory shadow-[0_12px_26px_-12px_rgba(107,28,34,0.75)] transition-all duration-200 hover:-translate-y-px hover:bg-ink disabled:opacity-60 sm:w-auto"
                      >
                        <SendIcon className="h-3.5 w-3.5 text-zari transition-transform group-hover:translate-x-0.5" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Book appointment</span>
                      </button>
                    </div>
                    <p className="mt-1.5 text-center text-[11px] leading-relaxed text-stone sm:mt-2.5 sm:text-right">
                      You can tell us about the outfit at the appointment.
                    </p>
                  </div>
                ) : activeTab === 'dress' ? (
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => switchTab('consultation')}
                      className="inline-flex items-center gap-1.5 py-2 text-[11px] uppercase tracking-[0.16em] text-stone transition-colors hover:text-ink"
                    >
                      <ArrowLeftIcon className="h-3 w-3" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => switchTab('measurements')}
                      className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-ink px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-ivory shadow-[0_12px_26px_-14px_rgba(29,24,21,0.8)] transition-all duration-200 hover:-translate-y-px hover:bg-oxblood"
                    >
                      <span>Next: sizes &amp; photos</span>
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => switchTab('dress')}
                        className="inline-flex items-center gap-1.5 py-2 text-[11px] uppercase tracking-[0.16em] text-stone transition-colors hover:text-ink"
                      >
                        <ArrowLeftIcon className="h-3 w-3" />
                        <span>Back</span>
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(submittingAction)}
                        onClick={handleInitiateLeadWithOtp}
                        className="group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-oxblood px-7 py-3.5 text-ivory shadow-[0_12px_26px_-12px_rgba(107,28,34,0.75)] transition-all duration-200 hover:-translate-y-px hover:bg-ink disabled:opacity-60"
                      >
                        <SendIcon className="h-3.5 w-3.5 text-zari transition-transform group-hover:translate-x-0.5" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Book appointment</span>
                      </button>
                    </div>
                    <p className="mt-2.5 text-right text-[11px] leading-relaxed text-stone">
                      {portalToken ? 'Your number is verified.' : 'We will send a 6-digit code to your WhatsApp to confirm your number.'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {guideOpen && guideFor(guideOpen.garment, ...guideOpen.ids) && (
            <MeasureGuide label={guideOpen.label} guide={guideFor(guideOpen.garment, ...guideOpen.ids)!} onClose={() => setGuideOpen(null)} />
          )}

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
                  className="w-full max-w-[420px] rounded-3xl border border-ink/10 bg-ivory p-6 shadow-[0_30px_70px_-20px_rgba(29,24,21,0.55)]"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-ink/10">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <MessageSquareIcon className="h-4 w-4" />
                      </div>
                      <span className="font-display text-[15px] font-semibold tracking-wide text-ink">
                        Confirm your number
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpModalOpen(false)}
                      aria-label="Close"
                      className="text-stone hover:text-ink transition-colors p-1"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4">
                    <p className="text-[13px] leading-relaxed text-stone">
                      {otpStatus === 'requesting'
                        ? 'Sending a 6-digit code on WhatsApp to'
                        : otpPurpose === 'submit' && portalToken
                        ? 'Your number is confirmed. Sending your request for'
                        : codeSent
                        ? 'We have sent a 6-digit code on WhatsApp to'
                        : 'We could not send a code to'}
                    </p>
                    <p className="mt-1 font-display text-[16px] font-semibold text-ink tracking-wider">
                      {shownPhone}
                    </p>
                  </div>

                  {otpNote && <Notice className="mt-3.5">{otpNote}</Notice>}

                  {otpError && <Notice tone="warn" className="mt-3.5">{otpError}</Notice>}

                  {!(otpPurpose === 'submit' && portalToken) && (codeSent || otpStatus === 'requesting') && (
                  <div>
                  <div className="mt-5">
                    <label className="block">
                      <span className="text-[11px] uppercase tracking-[0.18em] text-stone font-semibold">
                        6-digit code
                      </span>
                      <input
                        ref={otpInputRef}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="mt-1.5 w-full rounded-2xl border border-ink/15 bg-white/60 py-3 text-center font-mono text-2xl tracking-[0.5em] text-ink outline-none transition-colors focus:border-ink rounded-xs placeholder:text-stone/30"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[12px]">
                    <span className="text-stone/80">No code? <a href={`https://wa.me/${contact.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="font-medium text-ink underline underline-offset-2 hover:text-oxblood">WhatsApp us</a></span>
                    {otpStatus === 'requesting' ? null : otpCooldown > 0 ? (
                      <span className="text-stone font-medium">Resend in {otpCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => requestCode(otpPurpose)}
                        className="inline-flex items-center gap-1 font-semibold text-oxblood hover:underline"
                      >
                        <RefreshCwIcon className="h-3 w-3" />
                        <span>{otpStatus === 'error' && !otpCode ? 'Try again' : 'Resend code'}</span>
                      </button>
                    )}
                  </div>
                  </div>
                  )}

                  <div className="mt-6 flex flex-col gap-2">
                    {!codeSent && otpStatus === 'error' && !(otpPurpose === 'submit' && portalToken) ? (
                      <button
                        type="button"
                        onClick={() => requestCode(otpPurpose)}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-ivory shadow-xs transition-colors hover:bg-oxblood"
                      >
                        <RefreshCwIcon className="h-3.5 w-3.5" />
                        <span>Try again</span>
                      </button>
                    ) : (
                    <button
                      type="button"
                      disabled={otpStatus === 'verifying' || otpStatus === 'requesting' || (!(otpPurpose === 'submit' && portalToken) && otpCode.length !== 6)}
                      onClick={handleConfirmOtpAndSubmit}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-oxblood py-3.5 text-[12px] font-semibold uppercase tracking-[0.2em] text-ivory transition-colors hover:bg-oxblood disabled:cursor-not-allowed disabled:opacity-50 rounded-xs shadow-xs"
                    >
                      {otpStatus === 'verifying' ? (
                        <>
                          <Loader2Icon className="h-4 w-4 animate-spin text-ivory" />
                          <span>{preparingPhotos ? 'Preparing photos…' : otpPurpose === 'autofill' ? 'Checking…' : 'Sending your request…'}</span>
                        </>
                      ) : (
                        <span>{otpPurpose === 'autofill' ? 'Confirm' : otpPurpose === 'submit' && portalToken ? 'Try again' : 'Confirm & send request'}</span>
                      )}
                    </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setOtpModalOpen(false)}
                      className="py-1 text-center text-[11px] text-stone hover:text-ink transition-colors"
                    >
                      Cancel
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