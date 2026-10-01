import { useShopData } from '../../context/ShopData';
import { PieceFrame, ShopInstead } from '../ui/ShopStates';
import { FadeUp } from '../ui/FadeUp';
import { DriftingMotif } from '../ui/DriftingMotif';

export function CollectionGrid() {
  /* The shop's own collections: its fabrics and crafts, with real counts. */
  const { collections, status } = useShopData();
  return (
    <section id="collections" className="relative bg-ivory px-5 py-28 md:px-10 md:py-44">
      <span data-thread-anchor aria-hidden="true" className="absolute left-1/2 top-8 h-px w-px" />
      <DriftingMotif motif="kolam" className="right-[4%] top-[10%] w-[180px] md:w-[260px]" opacity={0.22} drift={100} spin={20} />
      <DriftingMotif motif="paisley" tone="zari" className="-left-16 top-[48%] hidden w-[320px] md:block" opacity={0.26} drift={160} spin={14} />
      <DriftingMotif motif="lotus" className="bottom-[3%] right-[10%] hidden w-[240px] md:block" opacity={0.14} drift={70} sway={30} />
      <div className="relative mx-auto max-w-[1320px]">
        <FadeUp className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <h2 className="font-display text-[2.8rem] leading-[1] tracking-[-0.02em] md:text-7xl">
            Explore <em>collections</em>
          </h2>
          <p className="max-w-xs text-[15px] leading-relaxed text-stone">
            {({ 2: 'Two worlds', 3: 'Three worlds', 4: 'Four worlds' } as Record<number, string>)[collections.length] ?? 'Every world'}, one sensibility. Each piece is in the boutique and ready to try.
          </p>
        </FadeUp>

        <div className="relative mt-16 grid grid-cols-1 gap-x-10 gap-y-16 md:mt-24 md:grid-cols-2 md:gap-x-20 lg:gap-x-28">
          <span data-thread-anchor aria-hidden="true" className="absolute left-1/2 top-[30%] hidden h-px w-px md:block" />
          <span data-thread-anchor aria-hidden="true" className="absolute left-1/2 top-[72%] hidden h-px w-px md:block" />
          {status === 'loading' ?
          Array.from({ length: 4 }, (_, i) =>
          <div key={i} className={i % 2 === 1 ? 'md:mt-40' : ''}><PieceFrame ratio="4/5" /></div>
          ) : null}
          {collections.map((collection, i) =>
          <a
            key={collection.id}
            id={collection.id}
            href={collection.href}
            className={`group block focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-8 ${
            i % 2 === 1 ? 'md:mt-40' : ''}`
            }>
            
              <div className="relative z-20 aspect-[4/5] overflow-hidden bg-paper">
                <img
                src={collection.image}
                alt={`${collection.name} collection`}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.04]" />
              
              </div>
              <div className="mt-6 flex items-baseline justify-between gap-4">
                <h3 className="translate-y-2 font-display text-3xl transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-y-0 md:text-4xl">
                  {collection.name}
                </h3>
                <span className="whitespace-nowrap text-[13px] text-stone">{collection.pieces} pieces</span>
              </div>
              <span className="relative mt-4 inline-block text-[12px] font-medium uppercase tracking-[0.22em]">
                Explore
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-ink transition-[width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-full" />
              </span>
            </a>
          )}
        </div>
        {status === 'offline' || (status === 'live' && collections.length === 0) ?
        <div className="mt-16"><ShopInstead>Explore the collection in the shop</ShopInstead></div> :
        null}
      </div>
    </section>);

}