import { images } from './images';
import type { Fabric } from '../types/catalog';

/*
 * Pieces and collections are NOT here any more: they come live from the boutique's shop
 * (context/ShopData.tsx), so the page can never show a saree the shop does not have.
 */
export const fabrics: Fabric[] = [
{ name: 'Kanjivaram silk', origin: 'Woven in Kanchipuram', image: images.fabricSilk },
{ name: 'Banarasi zari', origin: 'Woven in Varanasi', image: images.fabricZari },
{ name: 'Zardozi & aari', origin: 'Embroidered in our Hyderabad atelier', image: images.fabricEmbroidery }];