import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Collection, Product } from '../types/catalog';
import {
  getProducts, getShop, inStock, listUrl, photosOf, pieceUrl, priceOf,
  type Facet, type ShopProduct
} from '../lib/shop';

/**
 * The shop's pieces and collections, read fresh on every visit, for the whole page.
 *
 * Two rules, both from the owner:
 *
 * 1. ONLY WHAT IS IN THE SHOP. Nothing here is typed in or kept from a previous visit: a piece that
 *    is removed or changed in ScaleEzy is gone or changed on the next load (the shop's API tells
 *    browsers not to cache it). While the shop is answering, the sections show empty frames; if it
 *    cannot be reached, they offer the shop itself -- never a made-up saree standing in for a real
 *    one, which is what the designed placeholders would have been.
 *
 * 2. NOTHING TWICE. A saree, and a photograph, appears once on the whole page. The signature edit
 *    takes its pieces first; each collection then takes covers from pieces nobody has used yet --
 *    one for the grid and a DIFFERENT one for the scrolling showcase, which otherwise showed the
 *    same four photographs one screen apart. A piece that belongs to two collections (a silk saree
 *    with zari work is both) is spent by whichever claims it first.
 */

export type ShopStatus = 'loading' | 'live' | 'offline';

type ShopData = {
  status: ShopStatus;
  products: Product[];
  collections: Collection[];
};

const Ctx = createContext<ShopData>({ status: 'loading', products: [], collections: [] });
export const useShopData = () => useContext(Ctx);

/* How many pieces the signature edit carries, and how many collections the page can hold. */
const EDIT_SIZE = 10;
const MAX_COLLECTIONS = 4;
/* How many of a collection's pieces are looked through for covers nobody else has used. */
const COVER_POOL = 40;

/*
 * Words for the collections the boutique actually has. Names, counts, photographs and links all
 * come from the shop; only these lines are written here, because a tagline is copy, not data. A
 * collection with no words of its own gets honest generic ones.
 */
const WORDS: Record<string, { tagline: string; description: string }> = {
  silk: { tagline: 'Timeless. Elegant. Personal.', description: 'Pure silk, chosen loom by loom and ready to try in the boutique.' },
  'kanchi pattu': { tagline: 'Woven in Kanchipuram.', description: 'Temple borders and old-gold zari: the saree for every day that matters.' },
  'zari woven': { tagline: 'Lit from within.', description: 'Real zari worked through the weave, catching every lamp in the room.' },
  'tissue weave': { tagline: 'Light as a promise.', description: 'Tissue silks with a soft metallic shimmer, quiet until the light finds them.' },
  woven: { tagline: 'Made on the loom.', description: 'Handwoven pieces with the character only a loom leaves behind.' },
  brocade: { tagline: 'For the day you remember.', description: 'Rich brocade, heavy with pattern, made for the occasion.' }
};
const wordsFor = (name: string, count: number) =>
  WORDS[name.toLowerCase()] ?? {
    tagline: 'In the boutique now.',
    description: `${count} ${count === 1 ? 'piece' : 'pieces'}, each one in the shop and ready to order.`
  };

/** Keeps the page's one-of-each promise: a piece, and each of its photographs, used once. */
class Ledger {
  private pieces = new Set<string>();
  private photos = new Set<string>();
  usedPiece = (code: string) => this.pieces.has(code);
  usedPhoto = (url: string) => this.photos.has(url);
  take(code: string, urls: (string | null | undefined)[]) {
    this.pieces.add(code);
    urls.forEach(u => { if (u) this.photos.add(u); });
  }
}

const toProduct = (p: ShopProduct): Product | null => {
  const { main, second } = photosOf(p);
  const price = priceOf(p);
  if (!main || price == null) return null;
  return {
    id: p.productCode,
    name: p.title,
    fabric: [p.fabric, p.craft].filter(Boolean).join(' · ') || (p.dressType ?? ''),
    price,
    image: main,
    // Its own second photograph on hover; the same one again if it has only one -- still that
    // piece, never another's.
    hoverImage: second ?? main,
    href: pieceUrl(p.productCode),
    soldOut: !inStock(p)
  };
};

/** A cover from pieces nobody has used, preferring ones that can be bought. */
function takeCover(pool: ShopProduct[], ledger: Ledger): string | null {
  const ordered = [...pool.filter(inStock), ...pool.filter(p => !inStock(p))];
  for (const p of ordered) {
    const { main } = photosOf(p);
    if (!main || ledger.usedPiece(p.productCode) || ledger.usedPhoto(main)) continue;
    ledger.take(p.productCode, (p.images ?? []).map(i => i.url));
    return main;
  }
  return null;
}

export function ShopDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ShopData>({ status: 'loading', products: [], collections: [] });

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const [shop, newest] = await Promise.all([
          getShop(ac.signal),
          getProducts({ sort: 'NEW', limit: EDIT_SIZE * 3 }, ac.signal)
        ]);
        const ledger = new Ledger();

        /* The edit: newest first, in stock before sold out, no piece or photograph twice. */
        const ordered = [...newest.products.filter(inStock), ...newest.products.filter(p => !inStock(p))];
        const products: Product[] = [];
        for (const p of ordered) {
          if (products.length >= EDIT_SIZE) break;
          const card = toProduct(p);
          if (!card || ledger.usedPiece(card.id) || ledger.usedPhoto(card.image)) continue;
          ledger.take(card.id, (p.images ?? []).map(i => i.url));
          products.push(card);
        }

        /* Collections: the shop's fabrics first (how a saree buyer thinks), then its crafts. */
        const facets = shop.facets ?? {};
        const picks: { kind: 'fabric' | 'craft'; f: Facet }[] = [
          ...(facets.fabrics ?? []).filter(f => f.value && f.count > 0).map(f => ({ kind: 'fabric' as const, f })),
          ...(facets.crafts ?? []).filter(f => f.value && f.count > 0).map(f => ({ kind: 'craft' as const, f }))
        ].slice(0, MAX_COLLECTIONS);

        const pools = await Promise.all(picks.map(({ kind, f }) =>
          getProducts({ [kind]: f.value, sort: 'NEW', limit: COVER_POOL }, ac.signal)
            .then(r => r.products)
            .catch(() => [] as ShopProduct[])
        ));

        /* Grid covers for every collection first, then the showcase's, so a small collection is
           not left without a cover because a big one took two before it had one. */
        const grid = pools.map(pool => takeCover(pool, ledger));
        const showcase = pools.map(pool => takeCover(pool, ledger));

        const collections: Collection[] = picks
          .map(({ kind, f }, i) => ({
            id: `${kind}-${f.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            name: f.value,
            ...wordsFor(f.value, f.count),
            image: grid[i] ?? '',
            showcaseImage: showcase[i] ?? null,
            pieces: f.count,
            href: listUrl({ [kind]: f.value })
          }))
          // A collection with no photograph left to show is left out rather than shown with a
          // repeat or an empty frame.
          .filter(c => c.image);

        if (ac.signal.aborted) return;
        setData({ status: 'live', products, collections });
      } catch (e: any) {
        if (e?.name === 'AbortError') return;
        setData({ status: 'offline', products: [], collections: [] });
      }
    })();
    return () => ac.abort();
  }, []);

  return <Ctx.Provider value={data}>{children}</Ctx.Provider>;
}
