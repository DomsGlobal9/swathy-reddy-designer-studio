import type { BoutiqueLeadPayload, BoutiqueMeasurements, DressDetails, LeadSubmissionResult } from '../types/booking';
import { isPortalConfigured, formatBoutiqueErrorMessage } from './scaleezyPortal';

const env = ((import.meta as unknown as { env?: Record<string, string> }).env) || {};

export const BOUTIQUE_LEAD_API: string = (
  env.VITE_BOUTIQUE_LEAD_API ||
  env.VITE_SCALEEZY_BASE_URL ||
  ''
).trim();

export const BOUTIQUE_API_KEY: string = (
  env.VITE_BOUTIQUE_API_KEY ||
  env.VITE_SCALEEZY_PORTAL_KEY ||
  ''
).trim();

/** Checks whether a custom lead API or Scaleezy portal is configured in .env */
export const isLeadApiConfigured = (): boolean => {
  return isPortalConfigured() || Boolean(BOUTIQUE_LEAD_API && BOUTIQUE_API_KEY);
};

/**
 * Formats boutique measurements into an elegant, human-readable summary.
 * Used for both API payload summaries and EmailJS templates.
 */
export function formatMeasurementsSummary(measurements?: BoutiqueMeasurements): string {
  if (!measurements) return 'No measurements provided (to be taken during boutique consultation)';

  const { unit } = measurements;
  const lines: string[] = [];

  lines.push(`Unit: ${unit === 'cm' ? 'Centimeters (cm)' : 'Inches (in)'}`);

  // Torso / Core
  if (measurements.bust) lines.push(`• Bust / Chest: ${measurements.bust} ${unit}`);
  if (measurements.underBust) lines.push(`• Under Bust: ${measurements.underBust} ${unit}`);
  if (measurements.waist) lines.push(`• Waist: ${measurements.waist} ${unit}`);
  if (measurements.hip) lines.push(`• Hip: ${measurements.hip} ${unit}`);
  if (measurements.shoulder) lines.push(`• Shoulder Width: ${measurements.shoulder} ${unit}`);

  // Blouse / Sleeves
  if (measurements.blouseLength) lines.push(`• Blouse / Top Length: ${measurements.blouseLength} ${unit}`);
  if (measurements.armhole) lines.push(`• Armhole: ${measurements.armhole} ${unit}`);
  if (measurements.sleeveLength) lines.push(`• Sleeve Length: ${measurements.sleeveLength} ${unit}`);
  if (measurements.sleeveRound) lines.push(`• Sleeve Round (Bicep): ${measurements.sleeveRound} ${unit}`);
  if (measurements.frontNeckDepth) lines.push(`• Front Neck Depth: ${measurements.frontNeckDepth} ${unit}`);
  if (measurements.backNeckDepth) lines.push(`• Back Neck Depth: ${measurements.backNeckDepth} ${unit}`);

  // Bottom / Skirt
  if (measurements.bottomLength) lines.push(`• Bottom / Skirt Length: ${measurements.bottomLength} ${unit}`);
  if (measurements.waistToFloor) lines.push(`• Waist to Floor: ${measurements.waistToFloor} ${unit}`);

  // Preferences
  if (measurements.fitPreference) {
    const fitLabels: Record<string, string> = {
      snug: 'Snug / Tailored fit',
      standard: 'Standard fit',
      comfort: 'Relaxed / Comfort fit'
    };
    lines.push(`• Fit Preference: ${fitLabels[measurements.fitPreference] || measurements.fitPreference}`);
  }

  if (measurements.hasPadding) {
    const padLabels: Record<string, string> = {
      yes: 'Padded (Bust cups required)',
      no: 'Non-padded',
      'stylist-choice': 'Stylist / Pattern maker discretion'
    };
    lines.push(`• Padding: ${padLabels[measurements.hasPadding] || measurements.hasPadding}`);
  }

  if (measurements.liningPreference) lines.push(`• Lining: ${measurements.liningPreference}`);
  if (measurements.additionalNotes) lines.push(`• Tailoring Notes: ${measurements.additionalNotes}`);

  return lines.length > 1 ? lines.join('\n') : 'No specific measurements entered.';
}

/**
 * Formats dress preferences into a clean multi-line string.
 */
export function formatDressSummary(dress?: DressDetails): string {
  if (!dress || !dress.dressType) return 'General consultation / Undecided piece';

  const lines: string[] = [`• Outfit Type: ${dress.dressType}`];
  if (dress.customDressName) lines.push(`• Specific Piece / Style: ${dress.customDressName}`);
  if (dress.selectedProductTitle) lines.push(`• Selected Studio Piece: ${dress.selectedProductTitle} (${dress.selectedProductCode || 'N/A'})`);
  if (dress.fabricPreference) lines.push(`• Preferred Fabric: ${dress.fabricPreference}`);
  if (dress.embroideryWork) lines.push(`• Craft / Work: ${dress.embroideryWork}`);
  if (dress.specialRequests) lines.push(`• Design Notes: ${dress.specialRequests}`);

  return lines.join('\n');
}

/**
 * Direct fallback lead sender when custom webhook or simple endpoint is used.
 */
export async function sendBoutiqueLead(payload: BoutiqueLeadPayload): Promise<LeadSubmissionResult> {
  if (!isLeadApiConfigured()) {
    console.info(
      '[BoutiqueLead] Scaleezy Portal / Boutique API is in simulation mode. Payload:',
      payload
    );
    await new Promise((resolve) => setTimeout(resolve, 750));
    return {
      success: true,
      simulated: true,
      message: 'Measurements recorded in simulation mode. Configure VITE_SCALEEZY_BASE_URL & VITE_SCALEEZY_PORTAL_KEY in .env for live CRM integration.'
    };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };

    if (BOUTIQUE_API_KEY) {
      headers['X-Portal-Key'] = BOUTIQUE_API_KEY;
      headers.Authorization = `Bearer ${BOUTIQUE_API_KEY}`;
    }

    const res = await fetch(BOUTIQUE_LEAD_API, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      let parsedMessage = '';
      try {
        const parsed = JSON.parse(errText);
        parsedMessage = parsed.message || parsed.error || '';
      } catch {
        // use status text
      }

      return {
        success: false,
        message: formatBoutiqueErrorMessage(parsedMessage || res.status, 'customer')
      };
    }

    const data = await res.json().catch(() => ({}));
    return {
      success: true,
      leadId: data?.leadId || data?.id || data?.data?.id
    };
  } catch (error: unknown) {
    console.error('[BoutiqueLead] Request failed:', error);
    return {
      success: false,
      message: formatBoutiqueErrorMessage(error, 'customer')
    };
  }
}
