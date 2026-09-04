// Typed barrel re-exports for all page sections.
// The underlying modules are .jsx (migrated from the original Babel-in-browser code)
// but consumers get a strict TypeScript surface here.
//
// Every entry is cast rather than checked: TypeScript reads a .jsx component's
// props off its destructuring pattern, so a section that has been promoted to a
// CMS block — and therefore takes `content` — infers it as required, while the
// shared type has it optional. The cast is what the barrel is for.
import type { AccentComponent, HeroProps } from '../types';
import type { FC } from 'react';

import * as Hero from './hero';
import * as Sections from './sections';
import * as Extra from './extra-sections';
import * as Media from './media-sections';
import * as More from './more-sections';
import * as Interactive from './interactive-sections';
import * as Advanced from './advanced-sections';
import * as Creative from './creative-sections';
import * as Creative2 from './creative-batch-2';

// --- hero ---
export const Hero$: FC<HeroProps> = Hero.Hero as FC<HeroProps>;

// --- core sections (sections.jsx) ---
export const Nav: AccentComponent = Sections.Nav as AccentComponent;
export const SocialProof: FC = Sections.SocialProof as FC;
export const Gallery: AccentComponent = Sections.Gallery as AccentComponent;
export const About: AccentComponent = Sections.About as AccentComponent;
export const Contact: AccentComponent = Sections.Contact as AccentComponent;
export const Footer: AccentComponent = Sections.Footer as AccentComponent;

// --- extra-sections ---
export const StatsMarquee: AccentComponent = Extra.StatsMarquee as AccentComponent;
export const Services: AccentComponent = Extra.Services as AccentComponent;
export const Process: AccentComponent = Extra.Process as AccentComponent;
export const Pricing: AccentComponent = Extra.Pricing as AccentComponent;
export const Press: AccentComponent = Extra.Press as AccentComponent;
export const FAQ: AccentComponent = Extra.FAQ as AccentComponent;
export const CTABanner: AccentComponent = Extra.CTABanner as AccentComponent;

// --- media-sections ---
export const StatPills: AccentComponent = Media.StatPills as AccentComponent;
export const MediaTiles: AccentComponent = Media.MediaTiles as AccentComponent;
export const BentoGrid: AccentComponent = Media.BentoGrid as AccentComponent;
export const MentorshipBlock: AccentComponent = Media.MentorshipBlock as AccentComponent;

// --- more-sections ---
export const Timeline: AccentComponent = More.Timeline as AccentComponent;
export const ToolStack: AccentComponent = More.ToolStack as AccentComponent;
export const CompareTable: AccentComponent = More.CompareTable as AccentComponent;
export const Awards: AccentComponent = More.Awards as AccentComponent;
export const ShowReel: AccentComponent = More.ShowReel as AccentComponent;
export const Writing: AccentComponent = More.Writing as AccentComponent;
export const VisualFeed: AccentComponent = More.VisualFeed as AccentComponent;
export const BigMarquee: AccentComponent = More.BigMarquee as AccentComponent;

// --- interactive-sections ---
export const BriefAssistant: AccentComponent = Interactive.BriefAssistant as AccentComponent;
export const AgentPlan: AccentComponent = Interactive.AgentPlan as AccentComponent;
export const CommandPalette: AccentComponent = Interactive.CommandPalette as AccentComponent;
export const MessageDock: AccentComponent = Interactive.MessageDock as AccentComponent;
export const AnimatedSub: AccentComponent = Interactive.AnimatedSub as AccentComponent;

// --- advanced-sections ---
export const PriorityStack: AccentComponent = Advanced.PriorityStack as AccentComponent;
export const StickyBoard: AccentComponent = Advanced.StickyBoard as AccentComponent;
export const ScrubReel: AccentComponent = Advanced.ScrubReel as AccentComponent;
export const ExpandingCards: AccentComponent = Advanced.ExpandingCards as AccentComponent;
export const LogoWall: AccentComponent = Advanced.LogoWall as AccentComponent;
export const ColorPalette: AccentComponent = Advanced.ColorPalette as AccentComponent;
export const MagneticCTA: AccentComponent = Advanced.MagneticCTA as AccentComponent;

// --- creative-sections ---
export const TypewriterBlock: AccentComponent = Creative.TypewriterBlock as AccentComponent;
export const TiltShowcase: AccentComponent = Creative.TiltShowcase as AccentComponent;
export const FlapCounter: AccentComponent = Creative.FlapCounter as AccentComponent;
export const TypeTester: AccentComponent = Creative.TypeTester as AccentComponent;
export const ChatTestimonials: AccentComponent = Creative.ChatTestimonials as AccentComponent;
export const KeyboardSheet: AccentComponent = Creative.KeyboardSheet as AccentComponent;

// --- creative-batch-2 ---
export const SpotlightSection: AccentComponent = Creative2.SpotlightSection as AccentComponent;
export const ImageTrail: AccentComponent = Creative2.ImageTrail as AccentComponent;
export const HorizontalShelf: AccentComponent = Creative2.HorizontalShelf as AccentComponent;
export const SpinningSticker: AccentComponent = Creative2.SpinningSticker as AccentComponent;
export const NowPlaying: AccentComponent = Creative2.NowPlaying as AccentComponent;
export const HoverPreviewRows: AccentComponent = Creative2.HoverPreviewRows as AccentComponent;
export const GlitchSection: AccentComponent = Creative2.GlitchSection as AccentComponent;
export const AvailabilityCalendar: AccentComponent = Creative2.AvailabilityCalendar as AccentComponent;
export const ScratchReveal: AccentComponent = Creative2.ScratchReveal as AccentComponent;
