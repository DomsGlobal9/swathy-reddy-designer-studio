import type { Product } from '../types/catalog';
import { formatINR } from '../utils/format';

type ProductCardProps = {
  product: Product;
  saved?: boolean;
  onToggleSave?: (id: string) => void;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article id={product.id} className="group flex h-full flex-col">
      <div className="relative z-20 aspect-[3/4] overflow-hidden bg-paper">
        {/* The picture opens the piece on the real shop, as "View piece" does. */}
        <a href={product.href} aria-label={`View ${product.name} in the shop`} className="absolute inset-0 z-0" tabIndex={-1}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover" />
        
        <img
          src={product.hoverImage}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-[1.03] object-cover opacity-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-100 group-hover:opacity-100" />
        </a>
        {product.soldOut ?
        <span className="absolute left-3 top-3 bg-ivory px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-ink">Sold out</span> :
        null}
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className="min-w-0 font-display text-xl line-clamp-2 md:text-2xl" title={product.name}><a href={product.href}>{product.name}</a></h3>
        <p className="whitespace-nowrap text-[15px]">{formatINR(product.price)}</p>
      </div>
      <p className="mt-1 text-[13px] text-stone">{product.fabric}</p>
      <a
        href={product.href}
        className="relative mt-4 inline-block self-start text-[12px] font-medium uppercase tracking-[0.22em]">
        
        View piece
        <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-ink transition-[width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:w-full" />
      </a>
    </article>);

}