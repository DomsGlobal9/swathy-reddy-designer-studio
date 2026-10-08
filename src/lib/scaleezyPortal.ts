import type {
  PortalCustomerPayload,
  PortalCustomerProfile,
  PortalProduct,
  PortalRequirementPayload
} from '../types/booking';

/**
 * Scaleezy Boutique CRM Customer Portal API Client
 *
 * Implements the official Scaleezy Customer Portal API:
 * - Identified by X-Portal-Key header
 * - Authenticated via WhatsApp OTP (Bearer token)
 * - Endpoints at root: /intake/...
 * - Zero storage of tokens in localStorage/cookies (in-memory only)
 */

const env = ((import.meta as unknown as { env?: Record<string, string> }).env) || {};

export const SCALEEZY_BASE_URL: string = (
  env.VITE_SCALEEZY_BASE_URL ||
  env.VITE_BOUTIQUE_LEAD_API ||
  ''
).replace(/\/+$/, '').replace(/\/api$/, '');

export const SCALEEZY_PORTAL_KEY: string = (
  env.VITE_SCALEEZY_PORTAL_KEY ||
  env.VITE_BOUTIQUE_API_KEY ||
  ''
).trim();

export const getPortalBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return '';
  }
  return SCALEEZY_BASE_URL || 'https://crm-b-ry43.onrender.com';
};

export const isPortalConfigured = (): boolean => {
  return Boolean(SCALEEZY_PORTAL_KEY);
};

export const normalizeIndianMobile = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
};

export const DEFAULT_PORTAL_PRODUCTS: PortalProduct[] = [
  { key: 'bridal_blouse', name: 'Bridal Blouse' },
  { key: 'lehenga', name: 'Designer Lehenga' },
  { key: 'saree_blouse', name: 'Kanchipuram Saree & Blouse' },
  { key: 'anarkali', name: 'Anarkali & Suit' },
  { key: 'gown', name: 'Couture Gown' },
  { key: 'indo_western', name: 'Indo-Western' },
  { key: 'custom', name: 'Custom Tailoring' }
];

/**
 * Sanitizes and softens any raw error from the backend, network, or third-party service
 * into a gracious, luxury boutique communication.
 * No direct technical strings, status codes, or blunt errors are ever exposed to visitors.
 */
export function formatBoutiqueErrorMessage(
  rawError: unknown,
  context: 'otp_request' | 'otp_verify' | 'profile' | 'customer' | 'requirement' | 'email' | 'general' = 'general'
): string {
  const errStr = typeof rawError === 'string'
    ? rawError
    : typeof rawError === 'number'
    ? String(rawError)
    : (rawError as any)?.message || (rawError as any)?.error || '';

  const lower = errStr.toLowerCase();

  // 1. Invalid or incorrect OTP code
  if (
    lower.includes('code is not valid') ||
    lower.includes('invalid code') ||
    lower.includes('wrong code') ||
    lower.includes('not valid') ||
    lower.includes('incorrect') ||
    lower.includes('not match')
  ) {
    return 'The 6-digit verification code did not match. Please verify the code on your WhatsApp or request a fresh one.';
  }

  // 2. Expired code
  if (lower.includes('expired') || lower.includes('timeout')) {
    return 'This verification code has expired. Please tap “Resend WhatsApp Code” to receive a fresh code.';
  }

  // 3. Rate limiting / Too many attempts (429)
  if (
    lower.includes('too many') ||
    lower.includes('rate limit') ||
    lower.includes('429') ||
    lower.includes('attempts') ||
    lower.includes('frequent')
  ) {
    return 'For your security, please wait a brief moment before requesting another code.';
  }

  // 4. WhatsApp delivery / service unavailable (503 / provider issue)
  if (
    lower.includes('unavailable') ||
    lower.includes('503') ||
    lower.includes('whatsapp') ||
    lower.includes('provider') ||
    lower.includes('gateway')
  ) {
    return 'Our instant WhatsApp verification is momentarily busy. You may submit your details using the “Send Email” option or reach our styling concierge directly.';
  }

  // 5. Network / connection / fetch failures
  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('connection') ||
    lower.includes('offline') ||
    lower.includes('econnrefused')
  ) {
    return 'We were unable to connect to our salon server just now. Please check your internet connection or use “Send Email” to book.';
  }

  // 6. Portal disabled or maintenance (404 / 401 / 403)
  if (
    lower.includes('404') ||
    lower.includes('401') ||
    lower.includes('403') ||
    lower.includes('not found') ||
    lower.includes('unauthorized') ||
    lower.includes('disabled')
  ) {
    return 'Online booking is temporarily undergoing maintenance. Please use “Send Email” or contact our atelier directly.';
  }

  // 7. Context-specific graceful fallbacks (zero tech jargon)
  if (context === 'otp_request') {
    return 'We were unable to send your WhatsApp verification code just now. Please check your mobile number or try again in a moment.';
  }

  if (context === 'otp_verify') {
    return 'The verification code could not be confirmed at this time. Please check your WhatsApp or request a new code.';
  }

  if (context === 'customer' || context === 'requirement') {
    return 'We were unable to record your measurements in the salon database just now. Please use the “Send Email” option or contact our styling desk.';
  }

  if (context === 'email') {
    return 'We were unable to deliver your booking email at this instant. Please reach out to our concierge via WhatsApp or phone (+91 99888 77665) and we will immediately reserve your slot.';
  }

  return 'Our atelier concierge is momentarily taking a breath. Please try again in a moment or contact our studio directly.';
}

/* ── 1. Product Catalogue (GET /intake/products/) ─────────────────────────────────── */

export async function fetchPortalProducts(): Promise<PortalProduct[]> {
  if (!isPortalConfigured()) {
    return DEFAULT_PORTAL_PRODUCTS;
  }

  try {
    const res = await fetch(`${getPortalBaseUrl()}/intake/products/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Portal-Key': SCALEEZY_PORTAL_KEY
      }
    });

    if (!res.ok) {
      console.warn(`[ScaleezyPortal] GET /intake/products/ answered ${res.status}. Using defaults.`);
      return DEFAULT_PORTAL_PRODUCTS;
    }

    const data = await res.json();
    if (Array.isArray(data?.products) && data.products.length > 0) {
      return data.products;
    }
    return DEFAULT_PORTAL_PRODUCTS;
  } catch (err) {
    console.warn('[ScaleezyPortal] Unable to fetch product catalogue, using defaults:', err);
    return DEFAULT_PORTAL_PRODUCTS;
  }
}

/* ── 1a. Product Measurements (GET /intake/products/<key>/measurements/) ───────────── */
export async function fetchProductMeasurements(productKey: string) {
  if (!isPortalConfigured() || !productKey) return [];
  try {
    const res = await fetch(`${getPortalBaseUrl()}/intake/products/${productKey}/measurements/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Portal-Key': SCALEEZY_PORTAL_KEY
      }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.measurements || [];
  } catch (err) {
    console.warn(`[ScaleezyPortal] Unable to fetch measurements for ${productKey}:`, err);
    return [];
  }
}

/* ── 1b. Product Parts (GET /intake/products/<key>/parts/) ────────────────────────── */
export async function fetchProductParts(productKey: string) {
  if (!isPortalConfigured() || !productKey) return null;
  try {
    const res = await fetch(`${getPortalBaseUrl()}/intake/products/${productKey}/parts/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Portal-Key': SCALEEZY_PORTAL_KEY
      }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn(`[ScaleezyPortal] Unable to fetch parts for ${productKey}:`, err);
    return null;
  }
}

/* ── 2. Request WhatsApp OTP (POST /intake/customer/verify/request/) ──────────────── */

export type OtpRequestResult = {
  success: boolean;
  message?: string;
  expiresIn?: number;
  simulated?: boolean;
};

export async function requestWhatsAppOtp(mobileNumber: string): Promise<OtpRequestResult> {
  const normalized = normalizeIndianMobile(mobileNumber);
  if (normalized.length !== 10) {
    return {
      success: false,
      message: 'Please provide a valid 10-digit mobile number for WhatsApp verification.'
    };
  }

  if (!isPortalConfigured()) {
    console.info(
      `[ScaleezyPortal Simulation] WhatsApp OTP code requested for mobile: ${normalized}. (Configure VITE_SCALEEZY_BASE_URL and VITE_SCALEEZY_PORTAL_KEY for live delivery).`
    );
    await new Promise((r) => setTimeout(r, 600));
    return {
      success: true,
      expiresIn: 300,
      simulated: true,
      message: 'Demo mode: A test code (any 6 digits, e.g. 123456) will verify.'
    };
  }

  try {
    const res = await fetch(`${getPortalBaseUrl()}/intake/customer/verify/request/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Portal-Key': SCALEEZY_PORTAL_KEY
      },
      body: JSON.stringify({
        mobile_number: normalized,
        company_website: '' // Honeypot (leave empty)
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: formatBoutiqueErrorMessage(data?.error || res.status, 'otp_request')
      };
    }

    return {
      success: true,
      expiresIn: data?.expires_in || 300
    };
  } catch (err) {
    console.error('[ScaleezyPortal] OTP request failed:', err);
    return {
      success: false,
      message: formatBoutiqueErrorMessage(err, 'otp_request')
    };
  }
}

/* ── 3. Verify OTP (POST /intake/customer/verify/) ─────────────────────────────────── */

export type OtpVerifyResult = {
  success: boolean;
  token?: string;
  message?: string;
  simulated?: boolean;
};

export async function verifyWhatsAppOtp(
  mobileNumber: string,
  code: string
): Promise<OtpVerifyResult> {
  const normalized = normalizeIndianMobile(mobileNumber);
  const cleanCode = code.trim();

  if (!cleanCode || cleanCode.length !== 6) {
    return {
      success: false,
      message: 'Kindly enter the complete 6-digit code received on your WhatsApp.'
    };
  }

  if (!isPortalConfigured()) {
    await new Promise((r) => setTimeout(r, 500));
    return {
      success: true,
      token: `sim_token_${Date.now()}`,
      simulated: true
    };
  }

  try {
    const res = await fetch(`${getPortalBaseUrl()}/intake/customer/verify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Portal-Key': SCALEEZY_PORTAL_KEY
      },
      body: JSON.stringify({
        mobile_number: normalized,
        code: cleanCode
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: formatBoutiqueErrorMessage(data?.error || res.status, 'otp_verify')
      };
    }

    if (data?.verified && data?.token) {
      return {
        success: true,
        token: data.token
      };
    }

    return {
      success: false,
      message: formatBoutiqueErrorMessage('Verification failed', 'otp_verify')
    };
  } catch (err) {
    console.error('[ScaleezyPortal] OTP verification failed:', err);
    return {
      success: false,
      message: formatBoutiqueErrorMessage(err, 'otp_verify')
    };
  }
}

/* ── 4. Customer Profile / Autofill (GET /intake/customer/profile/) ────────────────── */

export async function fetchCustomerProfile(
  token: string
): Promise<{ exists: boolean; profile: PortalCustomerProfile | null }> {
  if (!isPortalConfigured() || token.startsWith('sim_token_')) {
    return { exists: false, profile: null };
  }

  try {
    const res = await fetch(`${getPortalBaseUrl()}/intake/customer/profile/`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Portal-Key': SCALEEZY_PORTAL_KEY,
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) return { exists: false, profile: null };

    const data = await res.json().catch(() => ({}));
    return {
      exists: Boolean(data?.exists),
      profile: data?.profile || null
    };
  } catch (err) {
    console.warn('[ScaleezyPortal] Profile lookup error:', err);
    return { exists: false, profile: null };
  }
}

/* ── 5. Customer Submission (POST /intake/customer/) ──────────────────────────────── */

export async function submitPortalCustomer(
  token: string,
  customerData: PortalCustomerPayload
): Promise<{ success: boolean; created?: boolean; message?: string; simulated?: boolean }> {
  if (!isPortalConfigured() || token.startsWith('sim_token_')) {
    await new Promise((r) => setTimeout(r, 400));
    return { success: true, created: true, simulated: true };
  }

  try {
    const res = await fetch(`${getPortalBaseUrl()}/intake/customer/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Portal-Key': SCALEEZY_PORTAL_KEY,
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        ...customerData,
        company_website: '' // Honeypot
      })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: formatBoutiqueErrorMessage(data?.error || res.status, 'customer')
      };
    }

    return {
      success: true,
      created: Boolean(data?.created)
    };
  } catch (err) {
    console.error('[ScaleezyPortal] Customer submit error:', err);
    return {
      success: false,
      message: formatBoutiqueErrorMessage(err, 'customer')
    };
  }
}

/* ── 6. Product Requirement Submission (POST /intake/customer/product/) ───────────── */

export async function submitPortalRequirement(
  token: string,
  requirement: PortalRequirementPayload | FormData
): Promise<{ success: boolean; message?: string; simulated?: boolean }> {
  if (!isPortalConfigured() || token.startsWith('sim_token_')) {
    await new Promise((r) => setTimeout(r, 500));
    return { success: true, simulated: true };
  }

  try {
    const isFormData = requirement instanceof FormData;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'X-Portal-Key': SCALEEZY_PORTAL_KEY,
      Authorization: `Bearer ${token}`
    };
    
    // Do NOT set Content-Type if it's FormData (browser sets it with boundary)
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    } else {
      // Append honeypot to FormData
      (requirement as FormData).append('company_website', '');
    }

    const body = isFormData 
      ? requirement 
      : JSON.stringify({
          ...requirement,
          company_website: '' // Honeypot
        });

    const res = await fetch(`${getPortalBaseUrl()}/intake/customer/product/`, {
      method: 'POST',
      headers,
      body
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        success: false,
        message: formatBoutiqueErrorMessage(data?.error || res.status, 'requirement')
      };
    }

    return { success: true };
  } catch (err) {
    console.error('[ScaleezyPortal] Requirement submit error:', err);
    return {
      success: false,
      message: formatBoutiqueErrorMessage(err, 'requirement')
    };
  }
}
