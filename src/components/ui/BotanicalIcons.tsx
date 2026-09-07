// ============================================================
// MindBloom — Botanical SVG Marks (Tier B Enrichment)
// File: src/components/ui/BotanicalIcons.tsx
// Hand-crafted SVG marks replacing raw OS emoji tells
// ============================================================

import React from 'react'

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  className?: string
}

/**
 * MindBloom brand mark: organic seed awakening into double leaf.
 * Clean, serene, geometric curves. Replaces raw "🌱" emoji.
 */
export function MindBloomEmblem({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 21V12" />
      <path d="M12 12C12 7.5 8.5 4 4 4C4 8.5 7.5 12 12 12Z" fill="currentColor" fillOpacity={0.15} />
      <path d="M12 12C12 8 15 5.5 19 6C18.5 10 16 12 12 12Z" fill="currentColor" fillOpacity={0.12} />
      <circle cx="12" cy="21" r="1.25" fill="currentColor" />
    </svg>
  )
}

/**
 * Continuous streak / organic growth mark.
 * Replaces raw "🔥" emoji with a mindful rising vine / sprout.
 */
export function StreakSprout({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M10 17V8" />
      <path d="M10 12C7.5 12 5.5 10 6 7.5C8.5 7.5 10 9.5 10 12Z" fill="currentColor" fillOpacity={0.2} />
      <path d="M10 9C12 9 13.5 7.5 13 5.5C11 5.5 10 7 10 9Z" fill="currentColor" fillOpacity={0.2} />
      <circle cx="10" cy="17" r="1" fill="currentColor" />
    </svg>
  )
}

/**
 * Mindful guidance spark mark.
 * Elegant 4-pointed lotus spark replacing raw "✨" emoji.
 */
export function MindfulSpark({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M10 2C10 6.5 6.5 10 2 10C6.5 10 10 13.5 10 18C10 13.5 13.5 10 18 10C13.5 10 10 6.5 10 2Z" fill="currentColor" fillOpacity={0.16} />
      <circle cx="10" cy="10" r="1.5" fill="currentColor" />
    </svg>
  )
}

/**
 * Journal completion seal mark.
 * Soft rounded seal with organic check replacing raw "✅" emoji.
 */
export function JournalSealCheck({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="10" cy="10" r="7.5" fill="currentColor" fillOpacity={0.12} />
      <path d="M7 10.2L9 12.2L13.5 7.8" />
    </svg>
  )
}

/**
 * Serene Sky: Day Sun Orb mark (replacing raw "☀️" emoji)
 */
export function SunOrb({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity={0.2} />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34" />
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="6.34" y2="17.66" />
      <line x1="17.66" y1="6.34" x2="19.07" y2="4.93" />
    </svg>
  )
}

/**
 * Serene Sky: Night Crescent Moon mark (replacing raw "🌙" emoji)
 */
export function MoonCrescent({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        fill="currentColor"
        fillOpacity={0.2}
      />
    </svg>
  )
}

/**
 * Drifting Cloud mark (replacing raw "☁️" emoji)
 */
export function DriftingCloud({ size = 20, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9z"
        fill="currentColor"
        fillOpacity={0.15}
      />
    </svg>
  )
}

/**
 * Floating Botanical Leaf mark (replacing raw "🍃" emoji)
 */
export function BotanicalLeaf({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M17 3C11 3 5 7 4 15C12 16 16 10 17 3Z"
        fill="currentColor"
        fillOpacity={0.25}
      />
      <path d="M4 15C7 11 11 8 16 4" />
    </svg>
  )
}

/**
 * Floating Botanical Blossom Petal mark (replacing raw "🌸" emoji)
 */
export function BotanicalBlossom({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <circle cx="10" cy="10" r="2.5" fill="currentColor" />
      <path
        d="M10 3.5C11.5 5 11.5 7 10 7.5C8.5 7 8.5 5 10 3.5Z"
        fill="currentColor"
        fillOpacity={0.3}
      />
      <path
        d="M10 16.5C11.5 15 11.5 13 10 12.5C8.5 13 8.5 15 10 16.5Z"
        fill="currentColor"
        fillOpacity={0.3}
      />
      <path
        d="M3.5 10C5 11.5 7 11.5 7.5 10C7 8.5 5 8.5 3.5 10Z"
        fill="currentColor"
        fillOpacity={0.3}
      />
      <path
        d="M16.5 10C15 11.5 13 11.5 12.5 10C13 8.5 15 8.5 16.5 10Z"
        fill="currentColor"
        fillOpacity={0.3}
      />
    </svg>
  )
}

/**
 * Level 1: Seed mark (replacing raw "🌰" emoji)
 */
export function LevelSeedIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <ellipse
        cx="10"
        cy="12"
        rx="5"
        ry="6"
        fill="currentColor"
        fillOpacity={0.2}
      />
      <path d="M10 6C9 8 8 10 8 12" />
      <path d="M10 3V6" strokeWidth={1.5} />
    </svg>
  )
}

/**
 * Level 2: Sprout mark (replacing raw "🌱" emoji)
 */
export function LevelSproutIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M10 17V9" />
      <path
        d="M10 13C6.5 13 4 10 5 7C8 7 10 9.5 10 13Z"
        fill="currentColor"
        fillOpacity={0.25}
      />
      <path
        d="M10 10C12.5 10 15 8 14.5 5.5C12 5.5 10 7.5 10 10Z"
        fill="currentColor"
        fillOpacity={0.2}
      />
    </svg>
  )
}

/**
 * Level 3: Potted Plant mark (replacing raw "🪴" emoji)
 */
export function LevelPlantIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M6 12L7 17H13L14 12" fill="currentColor" fillOpacity={0.15} />
      <path d="M5 12H15" />
      <path d="M10 12V6" />
      <path
        d="M10 8C7.5 8 6 6 7 4C9 4 10 6 10 8Z"
        fill="currentColor"
        fillOpacity={0.25}
      />
      <path
        d="M10 7C12.5 7 14 5 13 3C11 3 10 5 10 7Z"
        fill="currentColor"
        fillOpacity={0.25}
      />
    </svg>
  )
}

/**
 * Level 4: Tree mark (replacing raw "🌳" emoji)
 */
export function LevelTreeIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M10 17V12" />
      <path d="M8 17H12" />
      <circle cx="10" cy="8" r="5.5" fill="currentColor" fillOpacity={0.22} />
      <path d="M7 9C8.5 7 11.5 7 13 9" />
    </svg>
  )
}

/**
 * Level 5: Forest mark (replacing raw "🌲" emoji)
 */
export function LevelForestIcon({ size = 16, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M7 17V13" />
      <path d="M13 17V12" />
      <path d="M7 7L4 13H10L7 7Z" fill="currentColor" fillOpacity={0.18} />
      <path d="M13 5L9.5 12H16.5L13 5Z" fill="currentColor" fillOpacity={0.26} />
    </svg>
  )
}

/**
 * Helper to render level icon dynamically
 */
export function GardenLevelIcon({
  level,
  size = 16,
  className,
}: {
  level: string
  size?: number
  className?: string
}) {
  switch (level) {
    case 'seed':
      return <LevelSeedIcon size={size} className={className} />
    case 'sprout':
      return <LevelSproutIcon size={size} className={className} />
    case 'plant':
      return <LevelPlantIcon size={size} className={className} />
    case 'tree':
      return <LevelTreeIcon size={size} className={className} />
    case 'forest':
      return <LevelForestIcon size={size} className={className} />
    default:
      return <LevelSeedIcon size={size} className={className} />
  }
}
