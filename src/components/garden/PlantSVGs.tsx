// ============================================================
// MindBloom — Plant SVG Components
// File: src/components/garden/PlantSVGs.tsx
// All 10 plant types × 5 growth stages
// ============================================================

'use client'

import { motion } from 'framer-motion'
import type { PlantType, PlantStage } from '@/types/garden'

interface PlantSVGProps {
  type:      PlantType
  stage:     PlantStage
  isNew?:    boolean
  isRare?:   boolean
  size?:     number
}

// ── Shared animation ──────────────────────────────────────────
const growIn = {
  initial:  { scale: 0, opacity: 0, y: 10 },
  animate:  { scale: 1, opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
}

const sway = {
  animate: {
    rotate: [-1, 1, -1],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
  },
}

// ── Sunflower (happy/excited) ─────────────────────────────────
function SunflowerSVG({ stage, size = 60 }: { stage: PlantStage; size?: number }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Stem */}
      <line x1="30" y1="55" x2="30" y2={stage === 'seed' ? 50 : stage === 'sprout' ? 40 : 28} stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Leaves */}
      {(stage === 'growing' || stage === 'bloom' || stage === 'full') && (
        <>
          <ellipse cx="22" cy="38" rx="7" ry="4" fill="#22C55E" transform="rotate(-30 22 38)"/>
          <ellipse cx="38" cy="40" rx="7" ry="4" fill="#22C55E" transform="rotate(30 38 40)"/>
        </>
      )}
      {/* Seed */}
      {stage === 'seed' && <ellipse cx="30" cy="50" rx="4" ry="3" fill="#A16207"/>}
      {/* Sprout */}
      {stage === 'sprout' && (
        <>
          <ellipse cx="25" cy="40" rx="5" ry="3" fill="#4ADE80" transform="rotate(-20 25 40)"/>
          <ellipse cx="35" cy="42" rx="5" ry="3" fill="#4ADE80" transform="rotate(20 35 42)"/>
        </>
      )}
      {/* Petals */}
      {(stage === 'bloom' || stage === 'full') && (
        <>
          {[0,45,90,135,180,225,270,315].map((angle, i) => (
            <ellipse key={i} cx={30 + 12 * Math.cos(angle * Math.PI/180)}
              cy={20 + 12 * Math.sin(angle * Math.PI/180)}
              rx="5" ry="3" fill="#FCD34D"
              transform={`rotate(${angle} ${30 + 12 * Math.cos(angle * Math.PI/180)} ${20 + 12 * Math.sin(angle * Math.PI/180)})`}/>
          ))}
          {/* Center */}
          <circle cx="30" cy="20" r="7" fill="#92400E"/>
          <circle cx="30" cy="20" r="4" fill="#78350F"/>
        </>
      )}
      {/* Full — extra leaves */}
      {stage === 'full' && (
        <>
          <ellipse cx="19" cy="32" rx="7" ry="3.5" fill="#15803D" transform="rotate(-40 19 32)"/>
          <ellipse cx="41" cy="34" rx="7" ry="3.5" fill="#15803D" transform="rotate(40 41 34)"/>
        </>
      )}
    </svg>
  )
}

// ── Lotus (calm) ──────────────────────────────────────────────
function LotusSVG({ stage, size = 60 }: { stage: PlantStage; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Water */}
      <ellipse cx="30" cy="52" rx="18" ry="4" fill="#BAE6FD" opacity="0.7"/>
      {/* Pad */}
      {stage !== 'seed' && <ellipse cx="30" cy="50" rx="14" ry="5" fill="#4ADE80"/>}
      {stage === 'seed' && <circle cx="30" cy="50" r="4" fill="#A16207"/>}
      {/* Stem */}
      {stage !== 'seed' && <line x1="30" y1="50" x2="30" y2="38" stroke="#15803D" strokeWidth="2"/>}
      {/* Petals by stage */}
      {stage === 'sprout' && (
        <ellipse cx="30" cy="36" rx="5" ry="8" fill="#FDA4AF"/>
      )}
      {(stage === 'growing' || stage === 'bloom' || stage === 'full') && (
        <>
          <ellipse cx="30" cy="34" rx="5" ry="9" fill="#FECDD3"/>
          <ellipse cx="22" cy="37" rx="4" ry="8" fill="#FDA4AF" transform="rotate(-25 22 37)"/>
          <ellipse cx="38" cy="37" rx="4" ry="8" fill="#FDA4AF" transform="rotate(25 38 37)"/>
        </>
      )}
      {(stage === 'bloom' || stage === 'full') && (
        <>
          <ellipse cx="16" cy="40" rx="4" ry="7" fill="#F9A8D4" transform="rotate(-45 16 40)"/>
          <ellipse cx="44" cy="40" rx="4" ry="7" fill="#F9A8D4" transform="rotate(45 44 40)"/>
          <circle cx="30" cy="30" r="5" fill="#FDE68A"/>
        </>
      )}
      {stage === 'full' && (
        <>
          <ellipse cx="10" cy="43" rx="4" ry="6" fill="#FBCFE8" transform="rotate(-60 10 43)"/>
          <ellipse cx="50" cy="43" rx="4" ry="6" fill="#FBCFE8" transform="rotate(60 50 43)"/>
          <circle cx="30" cy="30" r="4" fill="#FCD34D"/>
        </>
      )}
    </svg>
  )
}

// ── Rose (gratitude) ──────────────────────────────────────────
function RoseSVG({ stage, size = 60 }: { stage: PlantStage; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {stage === 'seed' && <ellipse cx="30" cy="52" rx="4" ry="3" fill="#7C2D12"/>}
      {stage !== 'seed' && (
        <>
          <line x1="30" y1="56" x2="30" y2={stage === 'sprout' ? 44 : 30} stroke="#15803D" strokeWidth="2.5" strokeLinecap="round"/>
          <ellipse cx="23" cy="42" rx="7" ry="3.5" fill="#16A34A" transform="rotate(-35 23 42)"/>
          {(stage !== 'sprout') && <ellipse cx="37" cy="38" rx="7" ry="3.5" fill="#16A34A" transform="rotate(35 37 38)"/>}
        </>
      )}
      {stage === 'sprout' && <ellipse cx="30" cy="42" rx="5" ry="7" fill="#FCA5A5"/>}
      {stage === 'growing' && (
        <>
          <circle cx="30" cy="26" r="10" fill="#FCA5A5"/>
          <ellipse cx="30" cy="22" rx="7" ry="9" fill="#F87171"/>
        </>
      )}
      {(stage === 'bloom' || stage === 'full') && (
        <>
          <circle cx="30" cy="24" r="13" fill="#FECACA"/>
          <circle cx="30" cy="24" r="10" fill="#FCA5A5"/>
          <circle cx="30" cy="24" r="7"  fill="#F87171"/>
          <circle cx="30" cy="24" r="4"  fill="#DC2626"/>
          <circle cx="30" cy="24" r="2"  fill="#991B1B"/>
        </>
      )}
      {stage === 'full' && (
        <>
          <ellipse cx="17" cy="34" rx="7" ry="3.5" fill="#15803D" transform="rotate(-50 17 34)"/>
          <ellipse cx="43" cy="32" rx="7" ry="3.5" fill="#15803D" transform="rotate(50 43 32)"/>
        </>
      )}
    </svg>
  )
}

// ── Fern (anxious / resilient) ────────────────────────────────
function FernSVG({ stage, size = 60 }: { stage: PlantStage; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {stage === 'seed' && <ellipse cx="30" cy="52" rx="3" ry="2" fill="#166534"/>}
      {stage === 'sprout' && (
        <>
          <line x1="30" y1="56" x2="30" y2="44" stroke="#15803D" strokeWidth="2"/>
          <ellipse cx="25" cy="44" rx="6" ry="2.5" fill="#4ADE80" transform="rotate(-30 25 44)"/>
          <ellipse cx="35" cy="46" rx="6" ry="2.5" fill="#4ADE80" transform="rotate(30 35 46)"/>
        </>
      )}
      {(stage === 'growing' || stage === 'bloom' || stage === 'full') && (
        <>
          <line x1="30" y1="56" x2="22" y2="30" stroke="#15803D" strokeWidth="2" strokeLinecap="round"/>
          <line x1="30" y1="56" x2="38" y2="28" stroke="#15803D" strokeWidth="2" strokeLinecap="round"/>
          <line x1="30" y1="56" x2="30" y2="26" stroke="#15803D" strokeWidth="2" strokeLinecap="round"/>
          {[32,36,40,44,48].map((y, i) => (
            <g key={i}>
              <ellipse cx={22 - (y-30)*0.3} cy={y - (52-y)*0.5} rx="5" ry="2" fill="#22C55E" transform={`rotate(-70 ${22-(y-30)*0.3} ${y-(52-y)*0.5})`}/>
              <ellipse cx={38 + (y-30)*0.3} cy={y - (52-y)*0.5} rx="5" ry="2" fill="#22C55E" transform={`rotate(70 ${38+(y-30)*0.3} ${y-(52-y)*0.5})`}/>
            </g>
          ))}
        </>
      )}
      {stage === 'full' && (
        <>
          <line x1="30" y1="56" x2="15" y2="24" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="30" y1="56" x2="45" y2="22" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round"/>
        </>
      )}
    </svg>
  )
}

// ── Bamboo (streak) ───────────────────────────────────────────
function BambooSVG({ stage, size = 60 }: { stage: PlantStage; size?: number }) {
  const segments = stage === 'seed' ? 0 : stage === 'sprout' ? 1 : stage === 'growing' ? 2 : stage === 'bloom' ? 3 : 4
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {stage === 'seed' && <circle cx="30" cy="52" r="3" fill="#15803D"/>}
      {segments > 0 && Array.from({ length: segments }).map((_, i) => {
        const y1 = 56 - i * 14
        const y2 = y1 - 12
        return (
          <g key={i}>
            <rect x="27" y={y2} width="6" height="12" rx="2" fill={i % 2 === 0 ? '#4ADE80' : '#22C55E'}/>
            <line x1="27" y1={y1} x2="33" y2={y1} stroke="#15803D" strokeWidth="1.5"/>
            {i === segments - 1 && (
              <>
                <ellipse cx="24" cy={y2 + 3} rx="8" ry="2.5" fill="#86EFAC" transform={`rotate(-30 24 ${y2+3})`}/>
                <ellipse cx="36" cy={y2 + 5} rx="8" ry="2.5" fill="#86EFAC" transform={`rotate(30 36 ${y2+5})`}/>
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ── Cactus (stressed) ─────────────────────────────────────────
function CactusSVG({ stage, size = 60 }: { stage: PlantStage; size?: number }) {
  const isBloom = stage === 'bloom' || stage === 'full'
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {stage === 'seed' && <ellipse cx="30" cy="52" rx="4" ry="3" fill="#78716C"/>}
      {stage !== 'seed' && (
        <>
          <rect x="25" y={stage === 'sprout' ? 44 : 28} width="10" height={stage === 'sprout' ? 12 : 28} rx="5" fill="#4ADE80"/>
          {stage !== 'sprout' && (
            <>
              <rect x="17" y="36" width="8" height="14" rx="4" fill="#4ADE80"/>
              <rect x="35" y="40" width="8" height="12" rx="4" fill="#4ADE80"/>
              <line x1="25" y1="38" x2="17" y2="38" stroke="#15803D" strokeWidth="2"/>
              <line x1="35" y1="42" x2="43" y2="42" stroke="#15803D" strokeWidth="2"/>
            </>
          )}
          {/* Spines */}
          {[32,38,44,50].map(y => (
            <g key={y}>
              <line x1="24" y1={y} x2="20" y2={y-2} stroke="#A16207" strokeWidth="1"/>
              <line x1="36" y1={y} x2="40" y2={y-2} stroke="#A16207" strokeWidth="1"/>
            </g>
          ))}
          {/* Bloom on top when healed */}
          {isBloom && (
            <>
              <circle cx="30" cy="26" r="5" fill="#F9A8D4"/>
              <ellipse cx="30" cy="22" rx="3" ry="5" fill="#EC4899"/>
              <ellipse cx="25" cy="24" rx="3" ry="4" fill="#F472B6" transform="rotate(-30 25 24)"/>
              <ellipse cx="35" cy="24" rx="3" ry="4" fill="#F472B6" transform="rotate(30 35 24)"/>
            </>
          )}
        </>
      )}
    </svg>
  )
}

// ── Lavender (self-compassion) ────────────────────────────────
function LavenderSVG({ stage, size = 60 }: { stage: PlantStage; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {stage === 'seed' && <ellipse cx="30" cy="52" rx="3" ry="2" fill="#7C3AED"/>}
      {stage !== 'seed' && (
        <>
          {[26, 30, 34].map((x, i) => {
            const height = stage === 'sprout' ? 10 : stage === 'growing' ? 16 : stage === 'bloom' ? 20 : 24
            const topY = 56 - height
            return (
              <g key={i}>
                <line x1={x} y1="56" x2={x + (i===0?-3:i===2?3:0)} y2={topY} stroke="#15803D" strokeWidth="1.5" strokeLinecap="round"/>
                {(stage === 'bloom' || stage === 'full') && (
                  <>
                    {[0,3,6,9].map((dy, j) => (
                      <ellipse key={j}
                        cx={x + (i===0?-3:i===2?3:0)}
                        cy={topY + dy}
                        rx="2.5" ry="1.5"
                        fill={j % 2 === 0 ? '#A78BFA' : '#7C3AED'}
                      />
                    ))}
                  </>
                )}
                {stage === 'growing' && (
                  <ellipse cx={x + (i===0?-3:i===2?3:0)} cy={topY} rx="3" ry="5" fill="#C4B5FD"/>
                )}
              </g>
            )
          })}
          <ellipse cx="20" cy="45" rx="7" ry="2.5" fill="#22C55E" transform="rotate(-40 20 45)"/>
          <ellipse cx="40" cy="47" rx="7" ry="2.5" fill="#22C55E" transform="rotate(40 40 47)"/>
        </>
      )}
    </svg>
  )
}

// ── Sakura (rare — achievement) ───────────────────────────────
function SakuraSVG({ stage, size = 60 }: { stage: PlantStage; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Trunk */}
      <rect x="27" y="40" width="6" height="18" rx="3" fill="#92400E"/>
      {/* Branches */}
      <line x1="30" y1="42" x2="15" y2="28" stroke="#78350F" strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="44" x2="45" y2="30" stroke="#78350F" strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="40" x2="30" y2="20" stroke="#78350F" strokeWidth="3" strokeLinecap="round"/>
      {/* Bloom cloud */}
      {(stage === 'bloom' || stage === 'full') && (
        <>
          {[
            [30,14,14],[18,22,11],[42,24,10],[24,10,9],[36,10,9],[30,24,10]
          ].map(([cx,cy,r],i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="#FBCFE8" opacity="0.9"/>
          ))}
          {/* Petals falling */}
          {[
            [15,35,10,12],[45,38,50,15],[8,42,20,20],[50,45,40,18]
          ].map(([cx,cy,x,y],i)=>(
            <ellipse key={i} cx={cx} cy={cy} rx="3" ry="2" fill="#F9A8D4" transform={`rotate(${x} ${cx} ${cy})`}/>
          ))}
        </>
      )}
      {stage === 'growing' && (
        <circle cx="30" cy="20" r="12" fill="#FDE7F0"/>
      )}
      {stage === 'sprout' && (
        <>
          <circle cx="30" cy="28" r="8" fill="#FCE7F3"/>
        </>
      )}
      {/* Sparkle for rare */}
      <text x="46" y="12" fontSize="10" fill="#EF9F27">✨</text>
    </svg>
  )
}

// ── Willow (tired/emotional) ──────────────────────────────────
function WillowSVG({ stage, size = 60 }: { stage: PlantStage; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {stage === 'seed' && <ellipse cx="30" cy="52" rx="3" ry="2" fill="#6B7280"/>}
      {stage !== 'seed' && (
        <>
          <rect x="28" y="30" width="4" height="26" rx="2" fill="#92400E"/>
          {stage !== 'sprout' && (
            <>
              <line x1="30" y1="32" x2="20" y2="26" stroke="#78350F" strokeWidth="2" strokeLinecap="round"/>
              <line x1="30" y1="34" x2="40" y2="28" stroke="#78350F" strokeWidth="2" strokeLinecap="round"/>
            </>
          )}
          {/* Drooping branches */}
          {(stage === 'growing' || stage === 'bloom' || stage === 'full') && (
            <>
              {[-12,-8,-4,0,4,8,12].map((dx, i) => {
                const startX = 30 + dx * 0.8
                const endX   = 30 + dx * 1.5
                const startY = 28 - Math.abs(dx) * 0.3
                return (
                  <path key={i}
                    d={`M ${startX} ${startY} Q ${endX - dx*0.3} ${startY + 12} ${endX} ${startY + 24}`}
                    stroke={i % 2 === 0 ? '#4ADE80' : '#22C55E'}
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                )
              })}
            </>
          )}
          {stage === 'sprout' && (
            <>
              <path d="M 30 28 Q 24 36 22 44" stroke="#4ADE80" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M 30 28 Q 36 36 38 44" stroke="#4ADE80" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </>
          )}
        </>
      )}
    </svg>
  )
}

// ── Bonsai (rare — high level) ────────────────────────────────
function BonsaiSVG({ stage, size = 60 }: { stage: PlantStage; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Pot */}
      <rect x="22" y="50" width="16" height="8" rx="2" fill="#92400E"/>
      <rect x="20" y="49" width="20" height="3" rx="1" fill="#78350F"/>
      {/* Trunk */}
      <path d="M 28 50 Q 26 40 30 30 Q 32 22 28 14" stroke="#78350F" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
      {/* Branches */}
      {(stage !== 'seed') && (
        <>
          <path d="M 30 32 Q 18 28 14 20" stroke="#92400E" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          <path d="M 29 26 Q 42 22 44 14" stroke="#92400E" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <path d="M 28 20 Q 20 14 18 8"  stroke="#78350F"  strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </>
      )}
      {/* Foliage clouds */}
      {(stage === 'bloom' || stage === 'full') && (
        <>
          <circle cx="14" cy="18" r="7"  fill="#15803D" opacity="0.9"/>
          <circle cx="22" cy="14" r="8"  fill="#16A34A"/>
          <circle cx="30" cy="10" r="7"  fill="#15803D"/>
          <circle cx="38" cy="14" r="7"  fill="#4ADE80" opacity="0.9"/>
          <circle cx="44" cy="12" r="6"  fill="#16A34A"/>
          <circle cx="18" cy="8"  r="5"  fill="#4ADE80"/>
        </>
      )}
      {stage === 'growing' && (
        <>
          <circle cx="14" cy="18" r="6" fill="#15803D"/>
          <circle cx="30" cy="10" r="7" fill="#16A34A"/>
          <circle cx="44" cy="12" r="6" fill="#15803D"/>
        </>
      )}
      {stage === 'sprout' && (
        <circle cx="28" cy="16" r="8" fill="#22C55E"/>
      )}
      {/* Rare sparkles */}
      <text x="44" y="8" fontSize="8" fill="#EF9F27">✦</text>
      <text x="4"  y="14" fontSize="6" fill="#7C3AED">✦</text>
    </svg>
  )
}

// ── Main dispatcher ───────────────────────────────────────────
export function PlantSVG({ type, stage, isNew = false, isRare = false, size = 60 }: PlantSVGProps) {
  const MotionWrapper = isNew ? motion.div : 'div'
  const motionProps   = isNew ? { ...growIn, style: { display: 'inline-block', transformOrigin: 'bottom center' } } : {}

  const plantMap: Record<PlantType, React.ReactNode> = {
    sunflower: <SunflowerSVG stage={stage} size={size} />,
    lotus:     <LotusSVG     stage={stage} size={size} />,
    rose:      <RoseSVG      stage={stage} size={size} />,
    fern:      <FernSVG      stage={stage} size={size} />,
    bamboo:    <BambooSVG    stage={stage} size={size} />,
    cactus:    <CactusSVG    stage={stage} size={size} />,
    lavender:  <LavenderSVG  stage={stage} size={size} />,
    sakura:    <SakuraSVG    stage={stage} size={size} />,
    willow:    <WillowSVG    stage={stage} size={size} />,
    bonsai:    <BonsaiSVG    stage={stage} size={size} />,
  }

  return (
    // @ts-ignore — conditional motion props
    <MotionWrapper {...motionProps} className="relative inline-block">
      {plantMap[type] ?? plantMap.fern}
      {/* Rare sparkle */}
      {isRare && stage !== 'seed' && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-1 -top-1 text-xs"
          aria-hidden="true"
        >✨</motion.div>
      )}
    </MotionWrapper>
  )
}
