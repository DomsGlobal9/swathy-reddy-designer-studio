// After `vite build`: write dist/<page>.html for each page, a copy of dist/index.html with that
// page's own title, description and share image. Link previews (WhatsApp, Facebook) read the raw
// HTML and never run the app, so without this every page would preview as the home page.
// Vercel serves /contact from contact.html (cleanUrls in vercel.json); the app still routes as before.
// Keep in step with src/App.tsx (the pages), public/sitemap.xml and the titles each page sets.
import { readFileSync, writeFileSync } from 'node:fs';

const SITE = 'https://www.labelswathyreddy.com';
const pages = [
  {
    path: 'contact',
    title: 'Contact & Visit | Swathy Reddy Designer Studio, Banjara Hills',
    description: 'Visit the atelier at 4th Cross Road, Naveen Nagar, Banjara Hills, Hyderabad. Open Monday to Saturday, 11am to 8pm. Call or WhatsApp +91 75690 60926, or book a private consultation.',
    image: { url: '/og-image.jpg', width: 1200, height: 630, alt: 'Swathy Reddy Designer Studio, Hyderabad' }
  },
  {
    path: 'men',
    title: 'The Heritage Collection for Men, Coming Soon | Swathy Reddy',
    description: 'Handcrafted kurta sets and festive menswear from the Swathy Reddy atelier in Hyderabad. Coming soon: get notified on WhatsApp.',
    image: { url: '/men_coming_soon.jpg', width: 1121, height: 1403, alt: 'Swathy Reddy Heritage Collection: a man in a black kurta set in a carved heritage interior' }
  },
  {
    path: 'kids',
    title: 'The Heritage Collection for Kids, Coming Soon | Swathy Reddy',
    description: 'Little kurta sets and floral lehengas for every first celebration, handcrafted in Hyderabad. Coming soon: get notified on WhatsApp.',
    image: { url: '/kids_coming_soon.jpg', width: 1121, height: 1403, alt: 'Swathy Reddy Heritage Collection: a boy in a green kurta and a girl in a floral lehenga' }
  }
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const base = readFileSync('dist/index.html', 'utf8');

function set(html, pattern, replacement, what) {
  if (!pattern.test(html)) throw new Error(`seo-pages: could not find ${what} in dist/index.html`);
  return html.replace(pattern, replacement);
}
const meta = (html, attr, key, value) =>
  set(html, new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${esc(value)}$2`, `${attr}="${key}"`);

for (const p of pages) {
  const url = `${SITE}/${p.path}`;
  const img = `${SITE}${p.image.url}`;
  let html = base;
  html = set(html, /<title>[^<]*<\/title>/, `<title>${esc(p.title)}</title>`, '<title>');
  html = set(html, /(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`, 'canonical');
  html = meta(html, 'name', 'description', p.description);
  html = meta(html, 'property', 'og:title', p.title);
  html = meta(html, 'property', 'og:description', p.description);
  html = meta(html, 'property', 'og:url', url);
  html = meta(html, 'property', 'og:image', img);
  html = meta(html, 'property', 'og:image:secure_url', img);
  html = meta(html, 'property', 'og:image:width', p.image.width);
  html = meta(html, 'property', 'og:image:height', p.image.height);
  html = meta(html, 'property', 'og:image:alt', p.image.alt);
  html = meta(html, 'name', 'twitter:title', p.title);
  html = meta(html, 'name', 'twitter:description', p.description);
  html = meta(html, 'name', 'twitter:image', img);
  writeFileSync(`dist/${p.path}.html`, html);
  console.log(`seo-pages: dist/${p.path}.html`);
}
