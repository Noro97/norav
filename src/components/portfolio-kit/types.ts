import type { FC, ReactNode } from 'react';

export type AccentProps = {
  accent: string;
  /**
   * The section's copy, from the CMS.
   *
   * Optional because the sections are converted a folder at a time: one that
   * has been promoted to a block of its own reads this and falls back to its
   * `DEFAULTS`, and one that has not takes only the accent, exactly as it
   * arrived. Untyped here — each section's shape is stated by its own schema in
   * `@norav/content-schema`, and the barrel exists to hide the .jsx, not to
   * restate fifty-three content types.
   */
  content?: unknown;
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
