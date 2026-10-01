/**
 * The boutique's real shop, on ScaleEzy.
 *
 * Everything this landing page shows about pieces and collections comes from the shop that the
 * owner runs in ScaleEzy Inventory: add a saree there, change a price, sell one out, and this page
 * follows on its next load. Nothing here is typed in by hand.
 *
 * Two addresses:
 *   SHOP_URL  where a shopper is SENT (the shop's own pages: a piece, a filtered list, the bag)
 *   SHOP_API  where this page READS from (the same shop's public, read-only catalogue)
 *
 * The API is open to any website for reading, carries no key and no cookies, and cannot change
 * anything. Both can be overridden per deployment with VITE_SHOP_URL / VITE_SHOP_API.
 */

const env = (import.meta as any).env ?? {};

export const SHOP_SLUG: string = env.VITE_SHOP_SLUG || 'swathy-reddy-designer-studio';
export const SHOP_URL: string = (env.VITE_SHOP_URL || `https://shop.scaleezy.com/${SHOP_SLUG}`).replace(/\/+$/, '');
export const SHOP_API: string = (env.VITE_SHOP_API || `https://inventory-backend-1-ym8d.onrender.com/shop/${SHOP_SLUG}`).replace(/\/+$/, '');

/* ── Where buttons go ─────────────────────────────────────────────────────────────── */

export const shopHome = () => SHOP_URL;
export const pieceUrl = (productCode: string) => `${SHOP_URL}/p/${encodeURIComponent(productCode)}`;
/** A filtered list on the shop: ?fabric=Silk, ?craft=Zari%20Woven, ?maxPrice=25000 … */
export const listUrl = (filter: Record<string, string | number>) => {
  const q = new URLSearchParams(Object.entries(filter).map(([k, v]) => [k, String(v)]));
  return `${SHOP_URL}?${q.toString()}`;
};

/* ── What the shop says ───────────────────────────────────────────────────────────── */

export type ShopImage = { url: string; isPrimary?: boolean };
export type ShopVariant = { price: number | string; compareAtPrice?: number | string | null; sellable?: boolean; currency?: string };
export type ShopProduct = {
  productCode: string;
  title: string;
  fabric?: string | null;
  craft?: string | null;
  dressType?: string | null;
  images?: ShopImage[];
  variants?: ShopVariant[];
};
export type Facet = { value: string; count: number };
export type ShopInfo = {
  name: string;
  logoUrl?: string | null;
  facets?: { fabrics?: Facet[]; crafts?: Facet[]; dressTypes?: Facet[]; price?: { min: number; max: number } | null; total?: number };
};

async function read<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${SHOP_API}${path}`, { signal, credentials: 'omit' });
  if (!res.ok) throw new Error(`The shop answered ${res.status}`);
  const body = await res.json();
  if (!body?.success) throw new Error('The shop sent something unreadable');
  return body.data as T;
}

export const getShop = (signal?: AbortSignal) => read<ShopInfo>('', signal);

export const getProducts = (query: Record<string, string | number> = {}, signal?: AbortSignal) => {
  const q = new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]));
  return read<{ products: ShopProduct[]; total: number; hasMore: boolean }>(`/products${q.toString() ? `?${q}` : ''}`, signal);
};

/* ── Small readers ────────────────────────────────────────────────────────────────── */

export const photosOf = (p: ShopProduct) => {
  const all = p.images ?? [];
  const first = all.find(i => i.isPrimary) ?? all[0];
  const rest = all.filter(i => i !== first);
  return { main: first?.url ?? null, second: rest[0]?.url ?? first?.url ?? null };
};

export const priceOf = (p: ShopProduct) => {
  const prices = (p.variants ?? []).map(v => Number(v.price)).filter(Number.isFinite);
  return prices.length ? Math.min(...prices) : null;
};

export const inStock = (p: ShopProduct) => (p.variants ?? []).some(v => v.sellable !== false);
