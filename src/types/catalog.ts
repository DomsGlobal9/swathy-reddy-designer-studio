export type Collection = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  pieces: number;
  /** A different photograph for the scrolling showcase, so the two sections never repeat one. */
  showcaseImage?: string | null;
  /** Where Explore goes: this collection, filtered, on the real shop. */
  href: string;
};

export type Product = {
  id: string;
  name: string;
  fabric: string;
  price: number;
  image: string;
  hoverImage: string;
  /** The piece's own page on the real shop. */
  href: string;
  soldOut?: boolean;
};

export type Fabric = {
  name: string;
  origin: string;
  image: string;
};

export type ThreadStage = {
  title: string;
  description: string;
  sketch: string;
};

export type Occasion = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type LookbookItem = {
  id: string;
  image: string;
  alt: string;
  caption: string;
  placement: string;
  aspect: string;
};

export type MotifName = 'paisley' | 'lotus' | 'peacock' | 'jasmine' | 'needle' | 'kolam';

export type NavLink = {
  label: string;
  target: string;
};