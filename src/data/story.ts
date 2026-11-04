import { images } from './images';
import type { ThreadStage, Occasion, LookbookItem, NavLink } from '../types/catalog';

export const navigation: NavLink[] = [
{ label: 'Women', target: 'about' },
{ label: 'Men', target: '/men' },
{ label: 'Kids', target: '/kids' },
{ label: 'Lookbook', target: 'lookbook' },
{ label: 'Contact', target: '/contact' }];


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
  alt: 'Roja gaaru in a custom-made royal purple pattu Anarkali with antique gold zari work by Label Swathy Reddy',
  caption: 'Custom pattu Anarkali for Roja gaaru.',
  placement: 'w-[82%] ml-auto md:ml-[44%] md:w-[30%]',
  aspect: 'aspect-[3/4]'
},
{
  id: 'look-02',
  image: images.lookbook2,
  video: images.lookbook2Video,
  alt: 'Handcrafted bridal couture in motion with delicate hand embroidery and shimmer by Label Swathy Reddy',
  caption: 'Handcrafted bridal couture in motion.',
  placement: 'w-[78%] mt-10 md:ml-[6%] md:w-[32%] md:-mt-[18%]',
  aspect: 'aspect-[9/16]'
},
{
  id: 'look-03',
  image: images.lookbook3,
  video: images.lookbook3Video,
  alt: 'Magenta bridal lehenga gown with zardozi embroidery and delicate draping by Label Swathy Reddy',
  caption: 'Magenta zardozi couture in the spotlight.',
  placement: 'w-[78%] ml-auto mt-10 md:ml-[64%] md:w-[30%] md:-mt-[8%]',
  aspect: 'aspect-[9/16]'
},
{
  id: 'look-04',
  image: images.lookbook4,
  alt: 'Black and silver mirrorwork couture lehenga with embellished neckline and antique silver jewelry by Label Swathy Reddy',
  caption: 'Midnight noir mirrorwork couture.',
  placement: 'w-[74%] mt-10 md:ml-[22%] md:w-[28%] md:-mt-[20%]',
  aspect: 'aspect-[9/16]'
}];
