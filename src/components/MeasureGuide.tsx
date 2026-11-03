import { useEffect } from 'react';
import { XIcon } from 'lucide-react';

/*
 * "How to measure" drawings for the booking form's size boxes. One outline figure (head to feet, in a
 * 200 × 300 box) with the tape drawn in maroon where the measurement goes, front or back view, and a
 * sentence on how to take it. A size field with no guide here simply shows no icon.
 *
 * Shapes: `round` is a tape around the body at height y, between x1 and x2; `line` is a straight
 * measurement from one point to another, with end ticks.
 */

type Shape =
  | { kind: 'round'; y: number; x1: number; x2: number; tilt?: number }
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number };
type Guide = { view: 'Front' | 'Back'; shapes: Shape[]; how: string };

const round = (y: number, x1: number, x2: number, tilt = 0): Shape => ({ kind: 'round', y, x1, x2, tilt });
const line = (x1: number, y1: number, x2: number, y2: number): Shape => ({ kind: 'line', x1, y1, x2, y2 });

// Shared positions on the figure, so related guides agree.
const SHOULDER = { x: 62, y: 53 };
const NECK_SIDE = { x: 88, y: 50 };
const armLength = (x: number, y: number, how: string): Guide => ({ view: 'Front', shapes: [line(SHOULDER.x, SHOULDER.y, x, y)], how });
const fromNeck = (y: number, how: string, view: 'Front' | 'Back' = 'Front'): Guide => ({ view, shapes: [line(NECK_SIDE.x, NECK_SIDE.y, NECK_SIDE.x, y)], how });
// Beside the figure, clear of the right hand (which reaches x 163).
const beside = (y1: number, y2: number, how: string): Guide => ({ view: 'Front', shapes: [line(176, y1, 176, y2)], how });

const BODY: Record<string, Guide> = {
  bust: { view: 'Front', shapes: [round(90, 68, 132)], how: 'Around the fullest part of the bust, tape level all the way round.' },
  upper_chest: { view: 'Front', shapes: [round(76, 70, 130)], how: 'Around the chest just under the arms, above the bust.' },
  underbust: { view: 'Front', shapes: [round(104, 71, 129)], how: 'Around the ribcage, just under the bust.' },
  high_waist: { view: 'Front', shapes: [round(116, 74, 126)], how: 'Around the body between the underbust and the waist.' },
  waist: { view: 'Front', shapes: [round(126, 76, 124)], how: 'Around the narrowest part of the waist, usually just above the navel. Keep one finger under the tape.' },
  high_round: { view: 'Front', shapes: [round(142, 71, 129)], how: 'Around the top of the hips, between the waist and the hip.' },
  hip: { view: 'Front', shapes: [round(156, 67, 133)], how: 'Around the fullest part of the hips and seat, feet together.' },
  thigh: { view: 'Front', shapes: [round(188, 70, 99)], how: 'Around the fullest part of one thigh, near the top.' },
  knee: { view: 'Front', shapes: [round(226, 75, 96)], how: 'Around the knee, leg straight.' },
  calf: { view: 'Front', shapes: [round(250, 77, 96)], how: 'Around the fullest part of the calf.' },
  ankle: { view: 'Front', shapes: [round(280, 81, 97)], how: 'Around the ankle, just above the ankle bone.' },
  neck: { view: 'Front', shapes: [round(42, 92, 108)], how: 'Around the base of the neck, where a collar sits.' },
  armhole: { view: 'Front', shapes: [{ kind: 'round', y: 66, x1: 58, x2: 74, tilt: -70 }], how: 'Around the arm where it joins the shoulder, over the shoulder point and under the arm.' },
  bicep: { view: 'Front', shapes: [round(96, 50, 65, 18)], how: 'Around the fullest part of the upper arm, arm relaxed.' },
  short_sleeve_round: { view: 'Front', shapes: [round(86, 52, 67, 18)], how: 'Around the arm where a short sleeve should end, mid upper arm.' },
  elbow: { view: 'Front', shapes: [round(124, 45, 60, 16)], how: 'Around the elbow, arm slightly bent.' },
  three_quarter_round: { view: 'Front', shapes: [round(146, 42, 56, 14)], how: 'Around the forearm where a 3/4 sleeve should end.' },
  wrist: { view: 'Front', shapes: [round(166, 39, 52, 12)], how: 'Around the wrist bone, where a full sleeve ends.' },
  shoulder: { view: 'Back', shapes: [line(62, 53, 138, 53)], how: 'Across the back, from the edge of one shoulder to the other.' },
  front_shoulder: { view: 'Front', shapes: [line(62, 55, 138, 55)], how: 'Across the front, from one shoulder point to the other.' },
  back_shoulder: { view: 'Back', shapes: [line(62, 55, 138, 55)], how: 'Across the back, from one shoulder point to the other.' },
  across_chest: { view: 'Front', shapes: [line(71, 80, 129, 80)], how: 'Across the front of the chest, armpit to armpit.' },
  across_back: { view: 'Back', shapes: [line(71, 80, 129, 80)], how: 'Across the back, from one arm crease to the other.' },
  short_sleeve_length: armLength(54, 88, 'From the shoulder point down the arm to where a short sleeve should end.'),
  bicep_length: armLength(52, 98, 'From the shoulder point down to the fullest part of the upper arm.'),
  elbow_length: armLength(46, 124, 'From the shoulder point down to the elbow.'),
  three_quarter_length: armLength(43, 146, 'From the shoulder point down to where a 3/4 sleeve should end.'),
  full_sleeve_length: armLength(40, 167, 'From the shoulder point down the arm to the wrist, arm straight.'),
  blouse_length: fromNeck(112, 'From the highest point of the shoulder, by the neck, straight down to where the blouse should end.'),
  back_length: fromNeck(112, 'At the back, from the shoulder by the neck down to where the blouse should end.', 'Back'),
  shoulder_to_bust: { view: 'Front', shapes: [line(NECK_SIDE.x, NECK_SIDE.y, 86, 90)], how: 'From the shoulder by the neck down to the tip of the bust.' },
  shoulder_to_waist: fromNeck(126, 'From the shoulder by the neck straight down to the waist.'),
  shoulder_to_hip: fromNeck(156, 'From the shoulder by the neck straight down to the hip.'),
  garment_length: fromNeck(196, 'From the shoulder by the neck straight down to where the garment should end.'),
  front_neck_depth: { view: 'Front', shapes: [line(100, 44, 100, 70)], how: 'From the base of the neck at the front down to how low the neckline should go.' },
  back_neck_depth: { view: 'Back', shapes: [line(100, 44, 100, 64)], how: 'From the base of the neck at the back down to how low the back neckline should go.' },
  neck_width: { view: 'Front', shapes: [line(91, 46, 109, 46)], how: 'Across the front neckline, from one side to the other, as wide as you want it.' },
  back_neck_width: { view: 'Back', shapes: [line(91, 46, 109, 46)], how: 'Across the back neckline, from one side to the other.' },
  collar_height: { view: 'Front', shapes: [line(110, 36, 110, 46)], how: 'How tall the collar should stand, from the base of the neck up.' },
  collar_width: { view: 'Front', shapes: [line(92, 39, 108, 39)], how: 'How wide the collar should be across the front.' },
  shoulder_to_floor: beside(53, 290, 'From the shoulder by the neck straight down to the floor, standing straight, barefoot.'),
  waist_to_floor: beside(126, 290, 'From the waist straight down to the floor, barefoot (or in the heels you will wear).'),
  waist_to_hip: beside(126, 156, 'From the waist down to the fullest part of the hips.'),
  waist_to_knee: beside(126, 226, 'From the waist down to the knee.'),
  waist_to_ankle: beside(126, 282, 'From the waist down to the ankle bone.'),
  waist_to_mid_thigh: beside(126, 205, 'From the waist down to where the shorts should end.'),
  height: { view: 'Front', shapes: [line(190, 9, 190, 292)], how: 'Standing straight against a wall, barefoot, from the top of the head to the floor.' },
  inseam: { view: 'Front', shapes: [line(99, 180, 97, 282)], how: 'Inside the leg, from the crotch down to the ankle.' },
  crotch: { view: 'Front', shapes: [line(100, 126, 100, 178)], how: 'From the front waist down between the legs to the crotch.' },
  back_rise: { view: 'Back', shapes: [line(100, 126, 100, 178)], how: 'From the back waist down to the crotch.' }
};

/** CRM and form field names that share one drawing. */
const SAME_AS: Record<string, string> = {
  chest: 'bust', upper_thigh: 'thigh', ankle_round: 'ankle', bottom_opening: 'ankle', neck_circumference: 'neck',
  collar_neck: 'neck', hip_round: 'hip', pant_waist: 'waist', lehenga_waist: 'waist', bicep_round: 'bicep',
  upper_arm: 'bicep', upper_arm_circumference: 'bicep', elbow_round: 'elbow', elbow_circumference: 'elbow',
  full_sleeves_round: 'wrist', sleeve_opening: 'wrist', cuff: 'wrist', arm_length: 'full_sleeve_length',
  sleeve_length: 'full_sleeve_length', front_length: 'blouse_length', bodice_length: 'blouse_length',
  full_length: 'garment_length', length: 'garment_length', shirt_length: 'garment_length', top_length: 'garment_length',
  jacket_length: 'garment_length', finished_length: 'garment_length', floor_length: 'waist_to_floor',
  lehenga_length: 'waist_to_floor', bottom_full_length: 'waist_to_floor', pant_length: 'waist_to_ankle',
  trouser_length: 'waist_to_ankle', outseam: 'waist_to_ankle', side_length: 'waist_to_ankle', ankle_length: 'waist_to_ankle',
  knee_length: 'waist_to_knee', crotch_length: 'crotch', front_rise: 'crotch'
};

/*
 * The CRM uses one name ("length", "full_length") for different lengths: shoulder down on a top, waist
 * down on a bottom. For these garments a plain length is read from the waist.
 */
const LENGTH_FROM_WAIST: Record<string, string> = {
  trouser: 'waist_to_ankle', jeans: 'waist_to_ankle', bottom_wear: 'waist_to_ankle', mens_bottom_wear: 'waist_to_ankle',
  petticoat: 'waist_to_floor', lehenga: 'waist_to_floor', shorts: 'waist_to_mid_thigh'
};
const PLAIN_LENGTHS = new Set(['full_length', 'length', 'finished_length']);

/** The guide for a size box on a garment, looked up by the form's field id first, then the CRM's field name. */
export function guideFor(garment: string, ...keys: (string | undefined)[]): Guide | null {
  for (const k of keys) {
    if (!k) continue;
    if (PLAIN_LENGTHS.has(k) && LENGTH_FROM_WAIST[garment]) return BODY[LENGTH_FROM_WAIST[garment]];
    const g = BODY[k] ?? BODY[SAME_AS[k] ?? ''];
    if (g) return g;
  }
  return null;
}

/** The outline: head, neck, torso, arms and legs, in thin lines. */
function Figure() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={100} cy={22} r={13} />
      <path d="M93 34 L93 47 L62 53 C57 56 56 62 57 70 L70 78 L69 92 C69 100 73 106 73 112 L76 126 C72 136 67 146 67 156 L70 178 L76 226 L82 282 L78 291 L97 291 L97 282 L96 226 L100 180 L104 226 L103 282 L103 291 L122 291 L118 282 L124 226 L130 178 L133 156 C133 146 128 136 124 126 L127 112 C127 106 131 100 131 92 L130 78 L143 70 C144 62 143 56 138 53 L107 47 L107 34" />
      {/* Arms */}
      <path d="M57 70 L50 96 L45 124 L39 166 L37 180 M70 78 L64 98 L60 124 L52 166 L49 180" />
      <path d="M143 70 L150 96 L155 124 L161 166 L163 180 M130 78 L136 98 L140 124 L148 166 L151 180" />
    </g>
  );
}

function Mark({ shape }: { shape: Shape }) {
  if (shape.kind === 'round') {
    const cx = (shape.x1 + shape.x2) / 2;
    const rx = (shape.x2 - shape.x1) / 2 + 2;
    return <ellipse cx={cx} cy={shape.y} rx={rx} ry={3.6} transform={shape.tilt ? `rotate(${shape.tilt} ${cx} ${shape.y})` : undefined} />;
  }
  const { x1, y1, x2, y2 } = shape;
  // Short ticks across each end of the line.
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = (-(y2 - y1) / len) * 4;
  const ny = ((x2 - x1) / len) * 4;
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <line x1={x1 - nx} y1={y1 - ny} x2={x1 + nx} y2={y1 + ny} />
      <line x1={x2 - nx} y1={y2 - ny} x2={x2 + nx} y2={y2 + ny} />
    </>
  );
}

/** The guide window: drawing plus how-to. Sits over the booking form; the form keeps what was typed. */
export function MeasureGuide({ label, guide, onClose }: { label: string; guide: Guide; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/60 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`How to measure: ${label}`}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] rounded-sm border border-ink/15 bg-ivory p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10.5px] font-medium uppercase tracking-[0.22em] text-zari">How to measure</p>
            <p className="mt-1 font-display text-[22px] leading-tight text-ink">{label}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1 text-stone transition-colors hover:text-ink">
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="relative mt-3 rounded-sm bg-paper/60 py-3">
          <span className="absolute left-3 top-2 text-[10px] font-medium uppercase tracking-[0.2em] text-stone">{guide.view} view</span>
          <svg viewBox="0 0 200 300" className="mx-auto h-[260px] w-auto" aria-hidden="true">
            <g className="text-stone/45"><Figure /></g>
            <g fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" className="text-oxblood">
              {guide.shapes.map((sh, i) => <Mark key={i} shape={sh} />)}
            </g>
          </svg>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-ink">{guide.how}</p>
        <p className="mt-2 text-[11.5px] text-stone">Use a soft tape, snug but not tight. Not sure? Leave it empty and we will measure you.</p>
      </div>
    </div>
  );
}
