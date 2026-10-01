import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useShopData } from '../../context/ShopData';
import { PieceFrame, ShopInstead } from '../ui/ShopStates';
import { ProductCard } from '../ProductCard';
import { ChapterMark } from '../ui/ChapterMark';
import { FadeUp } from '../ui/FadeUp';
import { DriftingMotif } from '../ui/DriftingMotif';

type SignatureEditProps = {
  wishlist: string[];
  onToggleSave: (id: string) => void;
};

export function SignatureEdit({ wishlist, onToggleSave }: SignatureEditProps) {
  /* The shop's newest pieces, live. */
  const { products, status } = useShopData();
  const nothing = status === 'offline' || (status === 'live' && products.length === 0);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateEdges = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setCanPrev(track.scrollLeft > 4);
    setCanNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateEdges();
  }, [products, updateEdges]);

  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, [updateEdges]);

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('[data-card]');
    const step = card ? card.offsetWidth + 32 : track.clientWidth * 0.8;
    track.scrollBy({ left: step * direction, behavior: 'smooth' });
  };

  return (
    <section id="edit" className="relative bg-ivory py-24 md:py-36">
      <span data-thread-anchor aria-hidden="true" className="absolute left-[30%] top-6 h-px w-px" />
      <DriftingMotif motif="jasmine" tone="zari" className="right-[18%] top-[2%] w-[200px] md:w-[280px]" opacity={0.32} drift={90} sway={50} />
      <DriftingMotif motif="needle" className="-left-8 bottom-[8%] hidden w-[240px] md:block" opacity={0.16} drift={70} spin={10} />
      <div className="relative mx-auto max-w-[1440px] px-5 md:px-10">
        <FadeUp className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <ChapterMark numeral="v" label="The edit" />
            <h2 className="mt-6 font-display text-[2.8rem] leading-[1] tracking-[-0.02em] md:text-7xl">
              The signature <em>edit</em>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              disabled={!canPrev}
              aria-label="Previous pieces"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/30 text-ink transition-colors duration-200 hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/30">
              
              <ArrowLeftIcon className="h-4 w-4" strokeWidth={1.25} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              disabled={!canNext}
              aria-label="Next pieces"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/30 text-ink transition-colors duration-200 hover:border-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ink/30">
              
              <ArrowRightIcon className="h-4 w-4" strokeWidth={1.25} />
            </button>
          </div>
        </FadeUp>
      </div>

      <div
        ref={trackRef}
        onScroll={updateEdges}
        className="no-scrollbar relative mt-14 flex snap-x snap-mandatory gap-8 overflow-x-auto scroll-px-5 px-5 pb-4 md:mt-20 md:scroll-px-10 md:px-10"
        aria-label="Signature edit pieces">
        
        {status === 'loading' ?
        Array.from({ length: 4 }, (_, i) =>
        <div key={i} className="w-[76vw] shrink-0 sm:w-[44vw] lg:w-[27vw] xl:w-[24vw]"><PieceFrame /></div>
        ) :
        products.map((product) =>
        <div key={product.id} data-card className="w-[76vw] shrink-0 snap-start sm:w-[44vw] lg:w-[27vw] xl:w-[24vw]">
            <ProductCard product={product} saved={wishlist.includes(product.id)} onToggleSave={onToggleSave} />
          </div>
        )}
      </div>
      {nothing ?
      <div className="mx-auto max-w-[1440px] px-5 md:px-10"><ShopInstead /></div> :
      null}
      <span data-thread-anchor aria-hidden="true" className="absolute bottom-6 left-[62%] h-px w-px" />
    </section>);

}