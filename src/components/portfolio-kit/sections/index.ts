// Typed barrel re-exports for all page sections.
// The underlying modules are .jsx (migrated from the original Babel-in-browser code)
// but consumers get a strict TypeScript surface here.
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
export const Nav: AccentComponent = Sections.Nav;
export const SocialProof: FC = Sections.SocialProof as FC;
export const Gallery: AccentComponent = Sections.Gallery;
export const About: AccentComponent = Sections.About;
export const Contact: AccentComponent = Sections.Contact;
export const Footer: AccentComponent = Sections.Footer;

// --- extra-sections ---
export const StatsMarquee: AccentComponent = Extra.StatsMarquee;
export const Services: AccentComponent = Extra.Services;
export const Process: AccentComponent = Extra.Process;
export const Pricing: AccentComponent = Extra.Pricing;
export const Press: AccentComponent = Extra.Press;
export const FAQ: AccentComponent = Extra.FAQ;
export const CTABanner: AccentComponent = Extra.CTABanner;

// --- media-sections ---
export const StatPills: AccentComponent = Media.StatPills;
export const MediaTiles: AccentComponent = Media.MediaTiles;
export const BentoGrid: AccentComponent = Media.BentoGrid;
export const MentorshipBlock: AccentComponent = Media.MentorshipBlock;

// --- more-sections ---
export const Timeline: AccentComponent = More.Timeline;
export const ToolStack: AccentComponent = More.ToolStack;
export const CompareTable: AccentComponent = More.CompareTable;
export const Awards: AccentComponent = More.Awards;
export const ShowReel: AccentComponent = More.ShowReel;
export const Writing: AccentComponent = More.Writing;
export const VisualFeed: AccentComponent = More.VisualFeed;
export const BigMarquee: AccentComponent = More.BigMarquee;

// --- interactive-sections ---
export const BriefAssistant: AccentComponent = Interactive.BriefAssistant;
export const AgentPlan: AccentComponent = Interactive.AgentPlan;
export const CommandPalette: AccentComponent = Interactive.CommandPalette;
export const MessageDock: AccentComponent = Interactive.MessageDock;
export const AnimatedSub: AccentComponent = Interactive.AnimatedSub;

// --- advanced-sections ---
export const PriorityStack: AccentComponent = Advanced.PriorityStack;
export const StickyBoard: AccentComponent = Advanced.StickyBoard;
export const ScrubReel: AccentComponent = Advanced.ScrubReel;
export const ExpandingCards: AccentComponent = Advanced.ExpandingCards;
export const LogoWall: AccentComponent = Advanced.LogoWall;
export const ColorPalette: AccentComponent = Advanced.ColorPalette;
export const MagneticCTA: AccentComponent = Advanced.MagneticCTA;

// --- creative-sections ---
export const TypewriterBlock: AccentComponent = Creative.TypewriterBlock;
export const TiltShowcase: AccentComponent = Creative.TiltShowcase;
export const FlapCounter: AccentComponent = Creative.FlapCounter;
export const TypeTester: AccentComponent = Creative.TypeTester;
export const ChatTestimonials: AccentComponent = Creative.ChatTestimonials;
export const KeyboardSheet: AccentComponent = Creative.KeyboardSheet;

// --- creative-batch-2 ---
export const SpotlightSection: AccentComponent = Creative2.SpotlightSection;
export const ImageTrail: AccentComponent = Creative2.ImageTrail;
export const HorizontalShelf: AccentComponent = Creative2.HorizontalShelf;
export const SpinningSticker: AccentComponent = Creative2.SpinningSticker;
export const NowPlaying: AccentComponent = Creative2.NowPlaying;
export const HoverPreviewRows: AccentComponent = Creative2.HoverPreviewRows;
export const GlitchSection: AccentComponent = Creative2.GlitchSection;
export const AvailabilityCalendar: AccentComponent = Creative2.AvailabilityCalendar;
export const ScratchReveal: AccentComponent = Creative2.ScratchReveal;
