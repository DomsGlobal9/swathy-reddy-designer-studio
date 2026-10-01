import { images } from './images';
import type { ThreadStage, Occasion, LookbookItem, NavLink } from '../types/catalog';

export const navigation: NavLink[] = [
{ label: 'Collections', target: 'collections' },
{ label: 'About', target: 'about' },
{ label: 'Lookbook', target: 'lookbook' },
{ label: 'Boutique', target: 'boutique' }];


export const threadStages: ThreadStage[] = [
{
  title: 'Fabric',
  description: 'Every piece begins as a length of cloth — silk, organza, cotton — chosen by hand, by touch.',
  sketch: images.sketchFabric
},
{
  title: 'Craft',
  description: 'Weavers and karigars give it weeks, sometimes months. We know most of them by name.',
  sketch: images.sketchCraft
},
{
  title: 'Detail',
  description: 'A border, a butti, a single line of zari. The small things are where a garment becomes yours.',
  sketch: images.sketchDetail
},
{
  title: 'Silhouette',
  description: 'Draped, pleated, fitted. Each piece is shaped around the way you move.',
  sketch: images.sketchSilhouette
},
{
  title: 'Her style',
  description: 'And then it leaves the atelier, and becomes part of your story.',
  sketch: images.sketchHer
}];


export const occasions: Occasion[] = [
{
  id: 'wedding',
  name: 'Wedding',
  description: 'Bridal silks, trousseau and the family around her.',
  image: images.occasionWedding
},
{
  id: 'festive',
  name: 'Festive',
  description: 'Diwali, Sankranti, Bathukamma — evenings lit by lamps.',
  image: images.occasionFestive
},
{
  id: 'everyday',
  name: 'Everyday',
  description: 'Handloom for the office, the lunch, the long walk home.',
  image: images.occasionEveryday
}];


export const lookbook: LookbookItem[] = [
{
  id: 'look-01',
  image: images.lookbook1,
  alt: 'Woman in a dusty rose organza saree walking through a sunlit colonnade',
  caption: 'Dusty rose organza, walking the colonnade.',
  placement: 'w-[82%] ml-auto md:ml-[44%] md:w-[30%]',
  aspect: 'aspect-[2/3]'
},
{
  id: 'look-02',
  image: images.lookbook2,
  alt: 'Woman in a black and gold silk saree seated by a window',
  caption: 'Black and gold silk, by the window.',
  placement: 'w-[72%] mt-16 md:ml-[6%] md:w-[30%] md:-mt-[18%]',
  aspect: 'aspect-[4/5]'
},
{
  id: 'look-03',
  image: images.lookbook4,
  alt: 'Woman in a teal and copper saree on a rooftop at dusk',
  caption: 'Teal and copper, a rooftop at dusk.',
  placement: 'w-[78%] ml-auto mt-16 md:ml-[64%] md:w-[28%] md:-mt-[8%]',
  aspect: 'aspect-[2/3]'
},
{
  id: 'look-04',
  image: images.lookbook3,
  alt: 'Hands settling a gold zari pallu over the shoulder',
  caption: 'The pallu, settled on the shoulder.',
  placement: 'w-[64%] mt-16 md:ml-[22%] md:w-[24%] md:-mt-[22%]',
  aspect: 'aspect-[3/4]'
}];