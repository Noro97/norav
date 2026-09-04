import type { FC, ReactNode } from 'react';

export type AccentProps = {
  accent: string;
};

export type Tweaks = {
  accent: string;
  density: number;
  headlineMode: 'bold' | 'poetic' | 'direct';
  lightMode: boolean;
};

export type AccentComponent = FC<AccentProps>;

export type HeroProps = AccentProps & {
  density: number;
  headlineMode: Tweaks['headlineMode'];
};

export type RevealProps = {
  children: ReactNode;
  className?: string;
};

export type SectionId =
  | 'hero'
  | 'work'
  | 'about'
  | 'services'
  | 'pricing'
  | 'press'
  | 'contact';
