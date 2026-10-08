export type MeasurementUnit = 'in' | 'cm';

export type BoutiqueMeasurements = {
  unit: MeasurementUnit;
  // Core / Torso
  bust?: string;
  underBust?: string;
  waist?: string;
  hip?: string;
  shoulder?: string;

  // Upper / Blouse / Top
  blouseLength?: string;
  armhole?: string;
  sleeveLength?: string;
  sleeveRound?: string;
  frontNeckDepth?: string;
  backNeckDepth?: string;

  // Lower / Bottom / Skirt
  bottomLength?: string;
  waistToFloor?: string;

  // Tailoring notes & preferences
  fitPreference?: 'snug' | 'standard' | 'comfort';
  hasPadding?: 'yes' | 'no' | 'stylist-choice';
  liningPreference?: string;
  additionalNotes?: string;
};

export type DressDetails = {
  dressType: string;
  customDressName?: string;
  selectedProductCode?: string;
  selectedProductTitle?: string;
  fabricPreference?: string;
  embroideryWork?: string;
  specialRequests?: string;
};

export type ConsultationDetails = {
  name: string;
  phone: string;
  email?: string;
  occasion: string;
  date: string;
  mode: 'boutique' | 'video';
  notes?: string;
};

export type BoutiqueLeadPayload = {
  source: 'website_booking_dialog';
  timestamp: string;
  client: {
    name: string;
    phone: string;
    email?: string;
  };
  appointment: {
    occasion: string;
    date: string;
    mode: 'boutique' | 'video';
    modeLabel: string;
    notes?: string;
  };
  dress?: DressDetails;
  measurements?: BoutiqueMeasurements;
};

export type LeadSubmissionResult = {
  success: boolean;
  simulated?: boolean;
  message?: string;
  leadId?: string;
  customerCreated?: boolean;
};

/* ── Scaleezy Customer Portal API Types (from Developer Documentation) ────────── */

export type PortalProduct = {
  key: string;
  name: string;
};

export type PortalCustomerProfile = {
  first_name: string;
  last_name: string;
  email_address: string;
  address: string;
  city_region: string;
  gender: string;
  date_of_birth: string;
  occupation: string;
  preferred_communication: string;
};

export type PortalMeasurementDef = {
  key: string;
  label: string;
  unit: string;
  group: string | null;
  min: number;
  max: number;
  step: number;
  help_text: string;
};

export type PortalProductPart = {
  key: string;
  label: string;
};

export type PortalPartsResponse = {
  product: { key: string; name: string };
  parts: PortalProductPart[];
  max_photos: number;
};

export type PortalCustomerPayload = {
  first_name: string;
  last_name?: string;
  email_address?: string;
  address?: string;
  city_region?: string;
  gender?: 'Female' | 'Male' | 'Other' | '';
  date_of_birth?: string;
  occupation?: string;
  preferred_communication?: 'WhatsApp' | 'Call' | 'Email';
  company_website?: string; // Honeypot (must be empty)
};

export type PortalRequirementPayload = {
  garment_type?: string;
  occasion?: string;
  neckline_style?: string;
  sleeve_style?: string;
  back_style?: string;
  length_preference?: string;
  silhouette?: string;
  embellishments?: string;
  pattern_style?: string;
  custom_requirements?: string;
  notes?: string;
  reference_links?: string[];
  company_website?: string; // Honeypot (must be empty)
  measurements?: Record<string, string>;
};
