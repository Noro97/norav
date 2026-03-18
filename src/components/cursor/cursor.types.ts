export type CursorState = 'default' | 'play' | 'target' | 'text' | 'link' | 'drag'

export interface CursorConfig {
  size: number
  label?: string
  blendMode?: string
}
