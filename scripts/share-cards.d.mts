/** Types for the share-card renderer, which prerender.mjs and its tests import. */
export interface CardPalette {
  background: string
  ink: string
  accent: string
}

export interface Card {
  title: string
  description?: string
  name: string
  palette: CardPalette
}

export declare const WIDTH: number
export declare const HEIGHT: number
export declare function paletteOf(tokens?: Record<string, string>): CardPalette
export declare function cardTree(card: Card): unknown
export declare function drawCard(card: Card): Promise<Buffer>
