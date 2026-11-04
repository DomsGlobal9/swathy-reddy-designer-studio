import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ClockIcon,
  CalendarIcon,
  ChevronRightIcon,
  Share2Icon,
  CheckIcon,
  BookmarkIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  HelpCircleIcon
} from 'lucide-react';
import { blogs, type BlogPost } from '../data/blogs';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { BookingDialog } from '../components/BookingDialog';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { NotFound } from './NotFound';

type BlogPostPageProps = {
  slug: string;
};

export function BlogPostPage({ slug }: BlogPostPageProps) {
  const reduce = useReducedMotion();
  useSmoothScroll(!reduce);

  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = useCallback(() => setBookingOpen(true), []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  const [copied, setCopied] = useState(false);

  const blog = useMemo(() => {
    return blogs.find((b) => b.slug === slug);
  }, [slug]);

  useEffect(() => {
    if (blog) {
      document.title = blog.metaTitle;
      
      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', blog.metaDescription);
      }
    }
  }, [blog]);

  const relatedBlogs = useMemo(() => {
    if (!blog) return [];
    return blogs
      .filter((b) => b.id !== blog.id)
      .sort((a, b) => (a.category === blog.category ? -1 : 1))
      .slice(0, 3);
  }, [blog]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog?.title,
        text: blog?.excerpt,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!blog) {
    return <NotFound />;
  }

  // Schema.org JSON-LD
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    description: blog.metaDescription,
    image: `https://www.labelswathyreddy.com${blog.image}`,
    datePublished: '2026-10-15T00:00:00+05:30',
    dateModified: '2026-11-04T00:00:00+05:30',
    author: {
      '@type': 'Person',
      name: 'Swathy Reddy',
      jobTitle: 'Founder & Principal Designer',
      url: 'https://www.labelswathyreddy.com/#about'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Label Swathy Reddy',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.labelswathyreddy.com/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.labelswathyreddy.com/blog/${blog.slug}`
    },
    keywords: [blog.primaryKeyword, ...blog.secondaryKeywords].join(', ')
  };

  const faqSchemaData = blog.faqs && blog.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: blog.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  } : null;

  return (
    <div className="min-h-screen w-full bg-ivory font-sans text-ink selection:bg-oxblood selection:text-ivory">
      {/* JSON-LD injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      {faqSchemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchemaData) }}
        />
      )}

      <SiteHeader onBook={openBooking} />

      <main className="relative overflow-x-clip pt-24 sm:pt-28 md:pt-36">
        {/* Breadcrumb Navigation */}
        <div className="mx-auto max-w-[1040px] px-5 sm:px-6 md:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[12px] text-stone">
            <a href="/" className="transition-colors hover:text-oxblood">Home</a>
            <ChevronRightIcon className="h-3 w-3 text-stone/50" />
            <a href="/blog" className="transition-colors hover:text-oxblood">Journal</a>
            <ChevronRightIcon className="h-3 w-3 text-stone/50" />
            <span className="truncate text-ink font-medium">{blog.title}</span>
          </nav>
        </div>

        {/* Article Header */}
        <header className="mx-auto mt-6 max-w-[1040px] px-5 sm:px-6 md:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-oxblood px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ivory shadow-xs">
              {blog.category}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-stone">
              <ClockIcon className="h-3.5 w-3.5" />
              {blog.readTime}
            </span>
            <span className="text-stone/40">·</span>
            <span className="inline-flex items-center gap-1.5 text-[12px] text-stone">
              <CalendarIcon className="h-3.5 w-3.5" />
              {blog.publishedAt}
            </span>
          </div>

          <h1 className="mt-5 font-display text-[30px] font-medium leading-[1.14] tracking-[-0.02em] text-ink sm:text-[44px] md:text-[54px]">
            {blog.title}
          </h1>

          <p className="mt-4 text-[16px] leading-relaxed text-stone sm:text-[18px]">
            {blog.excerpt}
          </p>

          <div className="mt-6 flex items-center justify-between border-y border-ink/10 py-3.5">
            <div className="flex items-center gap-3">
              <img
                src="/sr-logo-mark.png"
                alt="Label Swathy Reddy"
                className="h-9 w-9 rounded-full border border-[#C9A45C]/40 bg-white p-1 object-contain"
              />
              <div>
                <p className="text-[13px] font-semibold text-ink">Label Swathy Reddy Boutique</p>
                <p className="text-[11px] text-stone">Banjara Hills, Hyderabad · Bespoke Designer Boutique</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-white/80 px-3.5 py-1.5 text-[12px] font-medium text-ink shadow-xs transition-all hover:border-oxblood hover:bg-white active:scale-95"
            >
              {copied ? (
                <>
                  <CheckIcon className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2Icon className="h-3.5 w-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Hero Featured Photo - Full Image Display */}
        <div className="mx-auto mt-8 max-w-[960px] px-5 sm:px-6 md:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-white p-2.5 sm:p-4 shadow-md">
            <img
              src={blog.image}
              alt={blog.title}
              className="mx-auto max-h-[580px] sm:max-h-[680px] w-auto rounded-xl object-contain"
              loading="eager"
            />
            <div className="mt-3 flex items-center justify-between border-t border-ink/6 pt-2.5 text-[11px] text-stone">
              <span className="font-serif italic">{blog.category} · Boutique Notes</span>
              <span className="text-[#A67C2E] font-medium">{blog.primaryKeyword}</span>
            </div>
          </div>
        </div>

        {/* Article Body Content */}
        <article className="mx-auto mt-10 max-w-[820px] px-5 sm:px-6 md:px-8">
          <div className="space-y-7 text-[16px] leading-[1.8] text-ink/90 sm:text-[17px]">
            {blog.content.map((block, idx) => {
              if (block.type === 'intro') {
                return (
                  <p key={idx} className="font-serif text-[19px] italic leading-relaxed text-ink/90 sm:text-[21px]">
                    {block.text}
                  </p>
                );
              }

              if (block.type === 'heading') {
                return (
                  <h2 key={idx} className="pt-4 font-display text-[24px] font-semibold tracking-[-0.01em] text-ink sm:text-[30px]">
                    {block.title}
                  </h2>
                );
              }

              if (block.type === 'paragraph') {
                return (
                  <p key={idx} className="text-stone/90">
                    {block.text}
                  </p>
                );
              }

              if (block.type === 'list') {
                return (
                  <ul key={idx} className="space-y-3.5 pl-2">
                    {block.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-oxblood" />
                        <span className="text-stone/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }

              if (block.type === 'tips') {
                return (
                  <div key={idx} className="my-8 rounded-xl border border-[#C9A45C]/40 bg-[#FAF7F2] p-5 sm:p-6 shadow-xs">
                    <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#A67C2E]">
                      <BookmarkIcon className="h-3.5 w-3.5 text-[#C9A45C]" />
                      <span>{block.title}</span>
                    </div>
                    <ul className="mt-3.5 space-y-2.5">
                      {block.items.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-[14.5px] leading-relaxed text-ink/90">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A67C2E]" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }

              if (block.type === 'callout') {
                return (
                  <div key={idx} className="my-8 rounded-2xl border-l-4 border-oxblood bg-[#FAF5EE] p-6 shadow-sm">
                    <h3 className="font-display text-[18px] font-bold text-ink">
                      {block.title}
                    </h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-stone">
                      {block.text}
                    </p>
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* FAQs Section if present */}
          {blog.faqs && blog.faqs.length > 0 && (
            <section className="mt-14 border-t border-ink/10 pt-10">
              <div className="flex items-center gap-2">
                <HelpCircleIcon className="h-5 w-5 text-oxblood" />
                <h3 className="font-display text-[24px] font-bold text-ink sm:text-[28px]">
                  Frequently Asked Questions
                </h3>
              </div>

              <div className="mt-6 space-y-4">
                {blog.faqs.map((faq, i) => (
                  <div key={i} className="rounded-2xl border border-ink/10 bg-white p-5 shadow-xs">
                    <h4 className="font-display text-[16px] font-semibold text-ink sm:text-[17px]">
                      {faq.question}
                    </h4>
                    <p className="mt-2 text-[14px] leading-relaxed text-stone">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Boutique Consultation Callout */}
          <div className="my-14 rounded-3xl border-2 border-[#C9A45C]/60 bg-gradient-to-br from-[#23120E] to-[#3A1B14] p-8 text-ivory shadow-xl sm:p-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#E8C980]">
              Label Swathy Reddy Boutique
            </span>
            <h3 className="mt-2.5 font-display text-[26px] font-light leading-[1.18] sm:text-[34px]">
              Ready to design your bespoke outfit?
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-ivory/80">
              Work directly with designer Swathy Reddy to curate your custom bridal lehenga, saree, or festive family ensemble. Video consultations and international delivery available worldwide.
            </p>
            <div className="mt-6 flex flex-wrap gap-3.5">
              <button
                type="button"
                onClick={openBooking}
                className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink shadow-md transition-all hover:bg-[#E8C980] hover:scale-105 active:scale-95"
              >
                Book Consultation
              </button>
              <a
                href={`https://wa.me/917569060926?text=${encodeURIComponent(`Hello Swathy Reddy Designer Studio, I read your article "${blog.title}" and would like to discuss a custom outfit.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-ivory/30 px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.16em] text-ivory transition-all hover:bg-white/10"
              >
                Inquire on WhatsApp
              </a>
            </div>
          </div>
        </article>

        {/* Related Stories */}
        {relatedBlogs.length > 0 && (
          <section className="border-t border-ink/10 bg-white/40 py-16">
            <div className="mx-auto max-w-[1040px] px-5 sm:px-6 md:px-8">
              <div className="flex items-center justify-between pb-6">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#C9A45C]">
                    More from the Boutique
                  </span>
                  <h3 className="mt-1 font-display text-[24px] font-semibold text-ink sm:text-[30px]">
                    Related Journal Guides
                  </h3>
                </div>
                <a
                  href="/blog"
                  className="hidden sm:inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-oxblood hover:text-ink"
                >
                  View all stories <ArrowRightIcon className="h-3.5 w-3.5" />
                </a>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {relatedBlogs.map((rel) => (
                  <article
                    key={rel.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-xl border border-ink/8 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A45C]/40 hover:shadow-md"
                  >
                    <a href={`/blog/${rel.slug}`} className="block">
                      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-paper">
                        <img
                          src={rel.image}
                          alt={rel.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-ivory/95 backdrop-blur-xs">
                          № {String(rel.id).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em]">
                          <span className="text-[#A67C2E] truncate max-w-[140px]">{rel.category}</span>
                          <span className="text-stone/60">{rel.readTime}</span>
                        </div>
                        <h4 className="mt-2 font-display text-[15.5px] font-normal leading-[1.3] text-ink transition-colors group-hover:text-oxblood line-clamp-2">
                          {rel.title}
                        </h4>
                      </div>
                    </a>
                    <div className="border-t border-ink/6 px-4 py-2.5 flex items-center justify-between text-[11px] text-stone">
                      <span>{rel.publishedAt}</span>
                      <a
                        href={`/blog/${rel.slug}`}
                        className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.16em] text-oxblood transition-colors group-hover:text-ink"
                      >
                        Read
                        <ArrowUpRightIcon className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-8 text-center sm:hidden">
                <a
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/20 bg-white px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink"
                >
                  View all 20 guides <ArrowRightIcon className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
      <BookingDialog open={bookingOpen} onClose={closeBooking} />
    </div>
  );
}
