import type { FC, ReactNode } from 'react';
import * as P from './tweaks-panel';

export type TweaksPanelProps = { title?: string; children: ReactNode };
export type TweakSectionProps = { label: string; children?: ReactNode };
export type TweakColorProps = { label: string; value: string; onChange: (v: string) => void };
export type TweakSliderProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
};
export type TweakToggleProps = { label: string; value: boolean; onChange: (v: boolean) => void };
export type TweakRadioProps<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
};

export const TweaksPanel = P.TweaksPanel as FC<TweaksPanelProps>;
export const TweakSection = P.TweakSection as FC<TweakSectionProps>;
export const TweakColor = P.TweakColor as FC<TweakColorProps>;
export const TweakSlider = P.TweakSlider as FC<TweakSliderProps>;
export const TweakToggle = P.TweakToggle as FC<TweakToggleProps>;
export const TweakRadio = P.TweakRadio as <T extends string>(props: TweakRadioProps<T>) => ReturnType<FC>;
