import type {
  PortalCustomerPayload,
  PortalCustomerProfile,
  PortalProduct,
  PortalRequirementPayload
} from '../types/booking';
import { contact } from '../data/contact';

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

export const getPortalBaseUrl = (): string => {
  // Always use relative path '' in browser so requests route through
  // Vite proxy (on localhost) or Vercel rewrites (in production).
  // This guarantees zero CORS blocking since requests are same-origin to the browser.
  if (typeof window !== 'undefined') {
    return '';
  }
  return SCALEEZY_BASE_URL || 'https://crm-b-ry43.onrender.com';
};

// The portal key lives on the server (api/proxy.js, vite.config.ts), so the browser can't
// see whether it is set; VITE_SCALEEZY_DEMO=true switches to the offline demo instead.
export const isPortalConfigured = (): boolean => {
  return env.VITE_SCALEEZY_DEMO !== 'true';
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

  // An email failure is always explained as one: its own text mentions WhatsApp, which the
  // checks below would read as a failed WhatsApp code.
  if (context === 'email') {
    return `We could not send the email just now. Please WhatsApp or call us on ${contact.phone} and we will book you in.`;
  }

  // 1. Invalid or incorrect OTP code
  if (
    lower.includes('code is not valid') ||
    lower.includes('invalid code') ||
    lower.includes('wrong code') ||
    lower.includes('not valid') ||
    lower.includes('incorrect') ||
    lower.includes('not match')
  ) {
    return 'That code does not match. Please check the code on WhatsApp, or tap “Resend code”.';
  }

  // 2. Expired code
  if (lower.includes('expired') || lower.includes('timeout')) {
    return 'That code has expired. Please tap “Resend code” for a new one.';
  }

  // 3. Rate limiting / Too many attempts (429)
  if (
    lower.includes('too many') ||
    lower.includes('rate limit') ||
    lower.includes('429') ||
    lower.includes('attempts') ||
    lower.includes('frequent')
  ) {
    return 'Too many tries. Please wait a minute and try again.';
  }

  // 4. WhatsApp delivery / service unavailable (503 / provider issue)
  if (
    lower.includes('unavailable') ||
    lower.includes('503') ||
    lower.includes('whatsapp') ||
    lower.includes('provider') ||
    lower.includes('gateway')
  ) {
    return `We could not send a WhatsApp code just now. Please use “Email it instead”, or call us on ${contact.phone}.`;
  }

  // 5. Network / connection / fetch failures
  if (
    lower.includes('failed to fetch') ||
    lower.includes('network') ||
    lower.includes('connection') ||
    lower.includes('offline') ||
    lower.includes('econnrefused')
  ) {
    return 'We could not reach the boutique just now. Please check your internet connection and try again, or use “Email it instead”.';
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
    return `Online booking is not available just now. Please use “Email it instead”, or call us on ${contact.phone}.`;
  }

  // 7. Context-specific graceful fallbacks (zero tech jargon)
  if (context === 'otp_request') {
    return 'We could not send a code to this number. Please check the number and try again.';
  }

  if (context === 'otp_verify') {
    return 'We could not confirm that code. Please try again, or tap “Resend code”.';
  }

  if (context === 'customer' || context === 'requirement') {
    return `We could not send your request just now. Please try again, use “Email it instead”, or call us on ${contact.phone}.`;
  }

  return `Something went wrong on our side. Please try again in a moment, or call us on ${contact.phone}.`;
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
      `[ScaleezyPortal Simulation] WhatsApp OTP code requested for mobile: ${normalized}. (VITE_SCALEEZY_DEMO=true is set; remove it for live delivery).`
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
      message: 'Please enter all 6 digits of the code.'
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
