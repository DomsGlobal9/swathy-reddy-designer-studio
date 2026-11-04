// After `vite build`: write dist/<page>.html for each page, a copy of dist/index.html with that
// page's own title, description and share image. Link previews (WhatsApp, Facebook) read the raw
// HTML and never run the app, so without this every page would preview as the home page.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const SITE = 'https://www.labelswathyreddy.com';
const pages = [
  {
    path: 'contact',
    title: 'Contact & Visit | Swathy Reddy Designer Studio, Banjara Hills',
    description: 'Visit the boutique at 4th Cross Road, Naveen Nagar, Banjara Hills, Hyderabad. Open Monday to Saturday, 11am to 7pm. Call or WhatsApp +91 75690 60926, or book a private consultation.',
    image: { url: '/og-image.jpg', width: 1200, height: 630, alt: 'Swathy Reddy Designer Studio, Hyderabad' }
  },
  {
    path: 'men',
    title: 'The Heritage Collection for Men, Coming Soon | Swathy Reddy',
    description: 'Handcrafted kurta sets and festive menswear from the Swathy Reddy boutique in Hyderabad. Coming soon: get notified on WhatsApp.',
    image: { url: '/men_coming_soon.jpg', width: 1121, height: 1403, alt: 'Swathy Reddy Heritage Collection: a man in a black kurta set in a carved heritage interior' }
  },
  {
    path: 'kids',
    title: 'The Heritage Collection for Kids, Coming Soon | Swathy Reddy',
    description: 'Little kurta sets and floral lehengas for every first celebration, handcrafted in Hyderabad. Coming soon: get notified on WhatsApp.',
    image: { url: '/kids_coming_soon.jpg', width: 1121, height: 1403, alt: 'Swathy Reddy Heritage Collection: a boy in a green kurta and a girl in a floral lehenga' }
  },
  {
    path: 'blog',
    title: 'Journal & Boutique Notes | Label Swathy Reddy',
    description: 'Guides on bridal couture, bespoke craftsmanship, fabric care, and international ordering from our Banjara Hills boutique in Hyderabad.',
    image: { url: '/blogs/blog-1.jpg', width: 1200, height: 630, alt: 'Label Swathy Reddy Boutique Journal' }
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

// Standard static pages
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

// 20 SEO Blog Posts
const blogs = JSON.parse(readFileSync('src/data/blogs.json', 'utf8'));
mkdirSync('dist/blog', { recursive: true });

for (const b of blogs) {
  const url = `${SITE}/blog/${b.slug}`;
  const img = `${SITE}${b.image}`;
  let html = base;
  html = set(html, /<title>[^<]*<\/title>/, `<title>${esc(b.metaTitle)}</title>`, '<title>');
  html = set(html, /(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`, 'canonical');
  html = meta(html, 'name', 'description', b.metaDescription);
  html = meta(html, 'property', 'og:title', b.metaTitle);
  html = meta(html, 'property', 'og:description', b.metaDescription);
  html = meta(html, 'property', 'og:url', url);
  html = meta(html, 'property', 'og:image', img);
  html = meta(html, 'property', 'og:image:secure_url', img);
  html = meta(html, 'property', 'og:image:width', 1200);
  html = meta(html, 'property', 'og:image:height', 630);
  html = meta(html, 'property', 'og:image:alt', b.title);
  html = meta(html, 'name', 'twitter:title', b.metaTitle);
  html = meta(html, 'name', 'twitter:description', b.metaDescription);
  html = meta(html, 'name', 'twitter:image', img);

  // Injects JSON-LD BlogPosting schema directly into pre-rendered static HTML
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: b.title,
    description: b.metaDescription,
    image: img,
    datePublished: '2026-10-15T00:00:00+05:30',
    dateModified: '2026-11-04T00:00:00+05:30',
    author: {
      '@type': 'Person',
      name: 'Swathy Reddy',
      jobTitle: 'Founder & Principal Designer',
      url: `${SITE}/#about`
    },
    publisher: {
      '@type': 'Organization',
      name: 'Label Swathy Reddy',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    keywords: [b.primaryKeyword, ...b.secondaryKeywords].join(', ')
  };

  html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script></head>`);

  // Write both dist/blog/<slug>.html and dist/blog/<slug>/index.html
  writeFileSync(`dist/blog/${b.slug}.html`, html);
  mkdirSync(`dist/blog/${b.slug}`, { recursive: true });
  writeFileSync(`dist/blog/${b.slug}/index.html`, html);
  console.log(`seo-pages: dist/blog/${b.slug}.html`);
}
