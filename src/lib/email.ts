import emailjs from '@emailjs/browser';
import type { BoutiqueMeasurements, DressDetails } from '../types/booking';
import { formatDressSummary, formatMeasurementsSummary } from './boutiqueLead';

/**
 * Configuration for EmailJS appointment booking.
 * 
 * Set these in your .env or hosting environment:
 *   VITE_EMAILJS_SERVICE_ID
 *   VITE_EMAILJS_TEMPLATE_ID
 *   VITE_EMAILJS_PUBLIC_KEY
 */

const env = ((import.meta as unknown as { env?: Record<string, string> }).env) || {};

export const EMAILJS_SERVICE_ID: string = env.VITE_EMAILJS_SERVICE_ID || '';
export const EMAILJS_TEMPLATE_ID: string = env.VITE_EMAILJS_TEMPLATE_ID || '';
export const EMAILJS_PUBLIC_KEY: string = env.VITE_EMAILJS_PUBLIC_KEY || '';
export const BOUTIQUE_EMAIL = 'label.swathyreddy12@gmail.com';

export type BookingData = {
  name: string;
  phone: string;
  email?: string;
  occasion: string;
  date: string;
  mode: 'boutique' | 'video';
  notes?: string;
  dress?: DressDetails;
  measurements?: BoutiqueMeasurements;
};

export type BookingResult = {
  success: boolean;
  simulated?: boolean;
  message?: string;
};

/** Checks whether EmailJS credentials are provided in the environment */
export const isEmailConfigured = (): boolean => {
  return Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
};

/**
 * Sends the booking details through EmailJS.
 * If credentials are not configured, it logs a warning
 * and resolves simulated success so the interface doesn't fail.
 */
export async function sendAppointmentEmail(data: BookingData): Promise<BookingResult> {
  if (!isEmailConfigured()) {
    console.info(
      '[EmailJS] Missing VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, or VITE_EMAILJS_PUBLIC_KEY. Simulating appointment booking request.'
    );
    // Simulate brief network latency for realistic feedback
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true, simulated: true };
  }

  const formattedDate = data.date
    ? new Date(data.date + 'T00:00:00').toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : data.date;

  const modeLabel = data.mode === 'boutique' ? 'In the boutique' : 'Video call';
  const dressSummary = formatDressSummary(data.dress);
  const measurementsSummary = formatMeasurementsSummary(data.measurements);

  const templateParams: Record<string, string> = {
    // Boutique / recipient email for delivery
    to_email: BOUTIQUE_EMAIL,
    recipient_email: BOUTIQUE_EMAIL,
    boutique_email: BOUTIQUE_EMAIL,
    to_name: 'Swathy Reddy Designer Studio',

    // Client details with common aliases
    name: data.name,
    from_name: data.name,
    client_name: data.name,
    phone: data.phone,
    client_phone: data.phone,
    email: data.email || 'Not provided',
    reply_to: data.email || BOUTIQUE_EMAIL,
    client_email: data.email || '',

    // Appointment metadata
    occasion: data.occasion,
    date: data.date,
    formatted_date: formattedDate,
    mode: modeLabel,
    appointment_type: modeLabel,
    notes: data.notes || '',

    // Dress & measurement specifics
    dress_type: data.dress?.dressType || 'Not specified',
    dress_summary: dressSummary,
    measurements_summary: measurementsSummary,

    // Formatted multi-line summary message containing full details
    message: [
      `A new styling appointment and measurement request has been received:`,
      `Client: ${data.name}`,
      `Phone: ${data.phone}`,
      `Email: ${data.email || 'Not provided'}`,
      `Occasion: ${data.occasion}`,
      `Date: ${formattedDate} (${data.date})`,
      `Consultation Mode: ${modeLabel}`,
      data.notes ? `Styling Notes: ${data.notes}` : null,
      data.dress?.dressType ? `\n--- DRESS & OUTFIT REQUEST ---\n${dressSummary}` : null,
      data.measurements ? `\n--- BOUTIQUE MEASUREMENTS ---\n${measurementsSummary}` : null
    ]
      .filter(Boolean)
      .join('\n')
  };

  try {
    const res = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    if (res.status === 200 || res.text === 'OK') {
      return { success: true };
    }

    return {
      success: false,
      message: 'We were unable to deliver your booking email at this instant. Please reach out to our concierge via WhatsApp or phone (+91 99888 77665) and we will immediately reserve your slot.'
    };
  } catch (error: unknown) {
    console.error('[EmailJS] Booking request failed:', error);
    return {
      success: false,
      message: 'We were unable to deliver your booking email at this instant. Please reach out to our concierge via WhatsApp or phone (+91 99888 77665) and we will immediately reserve your slot.'
    };
  }
}
