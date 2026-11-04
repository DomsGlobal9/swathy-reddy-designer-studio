import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  SearchIcon,
  XIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  ClockIcon,
  LayoutGridIcon,
  ListIcon,
  CalendarIcon
} from 'lucide-react';
import { blogs, blogCategories, type BlogPost } from '../data/blogs';
import { SiteHeader } from '../components/SiteHeader';
import { SiteFooter } from '../components/SiteFooter';
import { BookingDialog } from '../components/BookingDialog';
import { useSmoothScroll } from '../hooks/useSmoothScroll';
import { DriftingMotif } from '../components/ui/DriftingMotif';

export function BlogIndex() {
  const reduce = useReducedMotion();
  useSmoothScroll(!reduce);

  const [bookingOpen, setBookingOpen] = useState(false);
  const openBooking = useCallback(() => setBookingOpen(true), []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Stories');
  const [viewMode, setViewMode] = useState<'grid' | 'digest'>('grid');

  useEffect(() => {
    document.title = 'Journal & Boutique Notes | Label Swathy Reddy';
  }, []);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesCategory =
        selectedCategory === 'All Stories' || blog.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        blog.title.toLowerCase().includes(q) ||
        blog.excerpt.toLowerCase().includes(q) ||
        blog.primaryKeyword.toLowerCase().includes(q) ||
        blog.secondaryKeywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [search, selectedCategory]);

  const featured = blogs[0];
  const listBlogs =
    selectedCategory === 'All Stories' && !search.trim()
      ? filteredBlogs.slice(1)
      : filteredBlogs;

  return (
    <div className="min-h-screen w-full bg-[#FAF7F2] font-sans text-ink selection:bg-oxblood selection:text-ivory">
      <SiteHeader onBook={openBooking} />

      <main className="relative overflow-x-clip pt-20 sm:pt-24 md:pt-28">
        {/* Subtle artisanal background motif */}
        <DriftingMotif
          motif="jasmine"
          tone="zari"
          className="pointer-events-none absolute right-[3%] top-16 w-[160px] md:w-[220px]"
          opacity={0.16}
          drift={90}
          sway={20}
        />
        <DriftingMotif
          motif="peacock"
          className="pointer-events-none absolute left-[2%] top-[35%] hidden w-[200px] md:block"
          opacity={0.08}
          drift={100}
          spin={6}
        />

        {/* Editorial Masthead */}
        <header className="relative mx-auto max-w-[1400px] px-5 sm:px-6 md:px-10">
          <div className="border-b border-[#C9A45C]/30 pb-5 md:pb-6">
            {/* Masthead Eyebrow */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold uppercase tracking-[0.26em] text-stone">
              <span className="flex items-center gap-1.5 text-oxblood">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-oxblood" />
                Banjara Hills Boutique
              </span>
              <span>The Boutique Journal · Vol. I</span>
              <span className="hidden sm:inline text-[#A67C2E]">20 Curated Chapters</span>
            </div>

            {/* Main Publication Title */}
            <div className="mt-4 text-center md:mt-6">
              <h1 className="font-display text-[2.6rem] font-light leading-[1.04] tracking-[-0.025em] text-ink sm:text-[3.8rem] md:text-[4.8rem]">
                Stories in Silk, Craft &amp; <span className="font-serif italic font-normal text-oxblood">Couture</span>
              </h1>
              <p className="mx-auto mt-2.5 max-w-2xl text-[13.5px] leading-relaxed text-stone sm:text-[15px]">
                A master collection of bridal consultations, heritage handlooms, measurement guides, and global bespoke couture from Hyderabad.
              </p>
            </div>
          </div>
        </header>

        {/* Featured Cover Story (visible when viewing All Stories without active search) */}
        {selectedCategory === 'All Stories' && !search.trim() && featured && (
          <section className="mx-auto mt-6 max-w-[1400px] px-5 sm:px-6 md:px-10 md:mt-8">
            <article className="group relative overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-xs transition-all duration-300 hover:border-[#C9A45C]/50 hover:shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-12 md:items-stretch">
                {/* Image Container with controlled landscape aspect ratio */}
                <div className="relative h-56 sm:h-64 md:h-auto md:max-h-[340px] w-full overflow-hidden bg-paper md:col-span-7">
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute left-3.5 top-3.5 flex items-center gap-2">
                    <span className="rounded-full bg-oxblood px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory shadow-xs">
                      Cover Story
                    </span>
                    <span className="rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-ivory/90 backdrop-blur-xs">
                      № 01
                    </span>
                  </div>
                </div>

                {/* Content Container - well balanced, no empty white space */}
                <div className="flex flex-col justify-between p-5 sm:p-6 md:col-span-5 md:p-8">
                  <div>
                    <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.2em] text-[#A67C2E]">
                      <span>{featured.category}</span>
                      <span className="text-stone/40">·</span>
                      <span className="flex items-center gap-1 text-stone">
                        <ClockIcon className="h-3 w-3" />
                        {featured.readTime}
                      </span>
                    </div>

                    <h2 className="mt-3 font-display text-[20px] font-medium leading-[1.24] text-ink transition-colors group-hover:text-oxblood sm:text-[24px] md:text-[27px]">
                      <a href={`/blog/${featured.slug}`} className="focus:outline-hidden">
                        {featured.title}
                      </a>
                    </h2>

                    <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-stone">
                      {featured.excerpt}
                    </p>

                    {/* Curated Tags */}
                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      {featured.secondaryKeywords.slice(0, 3).map((kw, i) => (
                        <span
                          key={i}
                          className="rounded-md border border-ink/8 bg-[#FAF7F2] px-2.5 py-0.5 text-[10px] font-medium text-stone/80"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-ink/8 pt-3.5">
                    <span className="text-[11.5px] text-stone">By Swathy Reddy Boutique</span>
                    <a
                      href={`/blog/${featured.slug}`}
                      className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.18em] text-oxblood transition-colors group-hover:text-ink"
                    >
                      <span>Read Cover Story</span>
                      <ArrowUpRightIcon className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Editorial Navigation Toolbar: Categories, Search & View Modes */}
        <section className="relative z-10 mx-auto mt-6 max-w-[1400px] px-5 sm:px-6 md:px-10 md:mt-8">
          <div className="flex flex-col gap-3 rounded-2xl border border-ink/8 bg-white/80 p-3 sm:p-3.5 shadow-xs backdrop-blur-xs lg:flex-row lg:items-center lg:justify-between">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar sm:gap-1.5">
              {blogCategories.map((cat) => {
                const count =
                  cat === 'All Stories'
                    ? blogs.length
                    : blogs.filter((b) => b.category === cat).length;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] font-medium transition-all duration-200 ${
                      isSelected
                        ? 'bg-oxblood text-ivory shadow-xs'
                        : 'text-stone hover:bg-white hover:text-ink'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`ml-1 text-[10px] ${
                        isSelected ? 'text-ivory/80' : 'text-stone/60'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input & View Toggle */}
            <div className="flex items-center gap-2.5">
              <div className="relative min-w-[180px] flex-1 sm:w-60 sm:flex-initial">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone/60" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search chapters..."
                  className="w-full rounded-full border border-ink/12 bg-white py-1.5 pl-8 pr-7 text-[12px] text-ink placeholder:text-stone/50 transition-all focus:border-oxblood focus:outline-hidden focus:ring-1 focus:ring-oxblood/20"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-stone hover:text-ink"
                    aria-label="Clear search"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                )}
              </div>

              {/* View Switcher */}
              <div className="hidden items-center rounded-full border border-ink/10 bg-[#FAF7F2] p-0.5 sm:flex">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`rounded-full p-1.5 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-oxblood text-ivory shadow-xs'
                      : 'text-stone hover:text-ink'
                  }`}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <LayoutGridIcon className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('digest')}
                  className={`rounded-full p-1.5 transition-colors ${
                    viewMode === 'digest'
                      ? 'bg-oxblood text-ivory shadow-xs'
                      : 'text-stone hover:text-ink'
                  }`}
                  aria-label="Digest list view"
                  title="Digest list view"
                >
                  <ListIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stories Listing */}
        <section className="relative mx-auto mt-6 max-w-[1400px] px-5 pb-14 sm:px-6 md:px-10 md:pb-20">
          <div className="mb-5 flex items-center justify-between text-[11.5px] text-stone">
            <span className="font-serif italic">
              {selectedCategory === 'All Stories'
                ? 'Curated Boutique Notes'
                : selectedCategory}
            </span>
            <span>
              {listBlogs.length} {listBlogs.length === 1 ? 'Chapter' : 'Chapters'}
            </span>
          </div>

          {listBlogs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink/20 bg-white/60 p-10 text-center">
              <p className="font-display text-lg text-ink">
                No chapters found matching &ldquo;{search}&rdquo;
              </p>
              <p className="mt-1.5 text-[12.5px] text-stone">
                Try searching for keywords like bridal, kanchipuram, measurements, or NRI shipping.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All Stories');
                }}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-oxblood px-4 py-1.5 text-[11.5px] font-semibold text-ivory hover:bg-ink"
              >
                Reset filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* COMPACT EDITORIAL GRID - 3 columns, snug proportions, zero dead whitespace */
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listBlogs.map((blog) => {
                const chapterNum = String(blog.id).replace(/\D/g, '').padStart(2, '0');
                return (
                  <article
                    key={blog.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-xl border border-ink/8 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A45C]/40 hover:shadow-md"
                  >
                    <a href={`/blog/${blog.slug}`} className="block">
                      {/* Compact Image Container */}
                      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-paper">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                        <span className="absolute left-2.5 top-2.5 rounded-md bg-black/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-ivory/95 backdrop-blur-xs">
                          № {chapterNum}
                        </span>
                      </div>

                      {/* Compact Card Content */}
                      <div className="p-4 sm:p-5">
                        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em]">
                          <span className="text-[#A67C2E] truncate max-w-[170px]">{blog.category}</span>
                          <span className="text-stone/60">{blog.readTime}</span>
                        </div>

                        <h3 className="mt-2 font-display text-[17px] font-normal leading-[1.3] text-ink transition-colors group-hover:text-oxblood line-clamp-2">
                          {blog.title}
                        </h3>

                        <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-stone/85">
                          {blog.excerpt}
                        </p>
                      </div>
                    </a>

                    {/* Clean Minimal Footnote */}
                    <div className="border-t border-ink/6 px-4 py-2.5 sm:px-5 flex items-center justify-between text-[11px] text-stone">
                      <span>{blog.publishedAt}</span>
                      <a
                        href={`/blog/${blog.slug}`}
                        className="inline-flex items-center gap-1 font-semibold uppercase tracking-[0.16em] text-oxblood transition-colors group-hover:text-ink"
                      >
                        Read
                        <ArrowUpRightIcon className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            /* CURATED DIGEST LIST (Horizontal magazine layout) */
            <div className="divide-y divide-ink/8 border-y border-ink/8 bg-white/70 rounded-xl overflow-hidden shadow-xs">
              {listBlogs.map((blog) => {
                const chapterNum = String(blog.id).replace(/\D/g, '').padStart(2, '0');
                return (
                  <article
                    key={blog.id}
                    className="group flex flex-col gap-4 p-4 transition-colors hover:bg-white sm:flex-row sm:items-center sm:justify-between sm:p-4.5"
                  >
                    <div className="flex items-start gap-3.5 sm:items-center sm:gap-5">
                      {/* Story Number */}
                      <span className="font-serif text-[17px] text-stone/40 sm:text-[20px] min-w-[34px]">
                        № {chapterNum}
                      </span>

                      {/* Small Thumbnail */}
                      <a
                        href={`/blog/${blog.slug}`}
                        className="relative h-18 w-24 shrink-0 overflow-hidden rounded-lg bg-paper sm:h-20 sm:w-28"
                      >
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      </a>

                      {/* Story Title & Meta */}
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A67C2E]">
                          <span>{blog.category}</span>
                          <span className="text-stone/40">·</span>
                          <span className="text-stone">{blog.readTime}</span>
                        </div>

                        <h3 className="mt-1 font-display text-[16px] font-normal leading-[1.28] text-ink transition-colors group-hover:text-oxblood sm:text-[17.5px]">
                          <a href={`/blog/${blog.slug}`}>{blog.title}</a>
                        </h3>

                        <p className="mt-0.5 line-clamp-1 text-[12px] text-stone hidden md:block">
                          {blog.excerpt}
                        </p>
                      </div>
                    </div>

                    {/* Read Link */}
                    <div className="flex items-center justify-between sm:justify-end gap-3.5 shrink-0">
                      <span className="text-[11px] text-stone hidden sm:inline">{blog.publishedAt}</span>
                      <a
                        href={`/blog/${blog.slug}`}
                        className="inline-flex items-center gap-1 rounded-full border border-ink/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-oxblood transition-all group-hover:border-oxblood group-hover:bg-oxblood group-hover:text-ivory"
                      >
                        Read
                        <ArrowRightIcon className="h-3 w-3" />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Bespoke Boutique VIP Consultation Strip */}
        <section className="mx-auto max-w-[1400px] px-5 pb-16 sm:px-6 md:px-10">
          <div className="relative overflow-hidden rounded-2xl border border-[#C9A45C]/40 bg-[#25120E] p-7 text-ivory shadow-lg sm:p-9 md:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#C9A45C]/10 blur-3xl" />

            <div className="relative z-10 max-w-2xl">
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#E8C980]">
                Banjara Hills Boutique · Worldwide Consultations
              </span>
              <h2 className="mt-2 font-display text-[24px] font-light leading-[1.14] sm:text-[32px] md:text-[36px]">
                Planning a wedding or milestone celebration?
              </h2>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-ivory/80 sm:text-[14.5px]">
                Connect directly with designer Swathy Reddy for bespoke couture, fabric selection, and precise measurement guidance anywhere in the world.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={openBooking}
                  className="inline-flex items-center gap-2 rounded-full bg-ivory px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-ink transition-all hover:bg-[#E8C980] active:scale-95 shadow-md"
                >
                  Book Consultation
                </button>
                <a
                  href="https://wa.me/917569060926?text=Hello%20Swathy%20Reddy%20Designer%20Studio%2C%20I%20would%20like%20to%20discuss%20a%20custom%20order."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-ivory/30 px-5 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.16em] text-ivory transition-all hover:bg-white/10"
                >
                  WhatsApp Boutique
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <BookingDialog open={bookingOpen} onClose={closeBooking} />
    </div>
  );
}
