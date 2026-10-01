import { ArrowLink } from './ArrowLink';
import { shopHome } from '../../lib/shop';

/** An empty frame the shape of a piece, while the shop is answering. Never a stand-in saree. */
export function PieceFrame({ ratio = '3/4' }: { ratio?: string }) {
  return (
    <div aria-hidden="true" className="flex h-full flex-col">
      <div className="w-full animate-pulse bg-paper" style={{ aspectRatio: ratio.replace('/', ' / ') }} />
      <div className="mt-5 h-5 w-3/4 animate-pulse bg-paper" />
      <div className="mt-2 h-3 w-1/2 animate-pulse bg-paper" />
    </div>
  );
}

/** When the shop cannot be reached (or has nothing to show): offer the shop itself. */
export function ShopInstead({ children = 'See every piece in the shop' }: { children?: string }) {
  return (
    <div className="flex flex-col items-start gap-4 border-t border-ink/10 pt-10">
      <p className="max-w-md text-[15px] leading-relaxed text-stone">
        The pieces could not be shown just now. The whole collection is in the boutique's shop.
      </p>
      <ArrowLink href={shopHome()}>{children}</ArrowLink>
    </div>
  );
}
