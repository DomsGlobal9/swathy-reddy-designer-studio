/**
 * The boutique's contact details, in one place. The contact page, the boutique section on the
 * home page and the footer all read from here, so they can never disagree.
 */
export const contact = {
  name: 'Swathy Reddy Designer Studio',
  street: '4th Cross Road, Naveen Nagar',
  area: 'Banjara Hills',
  city: 'Banjara Hills, Hyderabad, Telangana 500034',
  email: 'label.swathyreddy12@gmail.com',
  /** With country code. Call and WhatsApp buttons appear only when it is set. */
  phone: '+91 75690 60926',
  /** The boutique's own Google listing ("Label Swathy Reddy"). */
  mapsLink: 'https://maps.app.goo.gl/S86WdNa27eyp7WbG9',
  /** The listing's exact pin, so the map shows the shop itself and not a search with other boutiques. */
  lat: 17.4146531,
  lng: 78.4512897
};

export const mapsUrl = contact.mapsLink;
export const mapEmbedUrl = `https://www.google.com/maps?q=${contact.lat},${contact.lng}&z=17&output=embed`;
export const phoneDigits = contact.phone.replace(/\D/g, '');

/** Opening hours by JavaScript weekday (0 = Sunday), as [open, close] in 24-hour time; null = closed. */
export const hours: (readonly [number, number] | null)[] = [
  null, [11, 20], [11, 20], [11, 20], [11, 20], [11, 20], [11, 20]
];
export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const formatHour = (h: number) => {
  const whole = Math.floor(h);
  const mins = Math.round((h - whole) * 60);
  const h12 = whole % 12 || 12;
  return `${h12}${mins ? `:${String(mins).padStart(2, '0')}` : ''}${whole < 12 ? 'am' : 'pm'}`;
};

/** Today's weekday and time in Hyderabad, whatever the visitor's own time zone. */
export function hyderabadNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23'
  }).formatToParts(now);
  const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
  return {
    day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
    time: Number(get('hour')) + Number(get('minute')) / 60
  };
}

/** "Open now · until 8pm", "Opens today at 11am" or "Closed · opens Tuesday at 11am". */
export function openStatus(now = new Date()): { open: boolean; text: string } {
  const { day, time } = hyderabadNow(now);
  const today = hours[day];
  if (today && time >= today[0] && time < today[1]) return { open: true, text: `Open now · until ${formatHour(today[1])}` };
  if (today && time < today[0]) return { open: false, text: `Opens today at ${formatHour(today[0])}` };
  for (let i = 1; i <= 7; i++) {
    const next = hours[(day + i) % 7];
    if (next) return { open: false, text: `Closed · opens ${i === 1 ? 'tomorrow' : dayNames[(day + i) % 7]} at ${formatHour(next[0])}` };
  }
  return { open: false, text: 'Closed' };
}
