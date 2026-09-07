// ============================================================
// MindBloom — Procedural Ambient Sound Engine
// File: src/lib/audio/soundEngine.ts
//
// Generates all 6 ambient sounds procedurally using Web Audio
// API — no external audio files needed. Each sound is built
// from filtered noise + LFO modulation for organic texture.
// ============================================================

import type { SoundId } from '@/types/soundscape'

interface SoundNode {
  stop:      () => void
  setVolume: (v: number) => void // 0–1
}

// ── Noise buffer generator ─────────────────────────────────────
function createNoiseBuffer(
  ctx: AudioContext,
  type: 'white' | 'pink' | 'brown',
  durationSec = 4
): AudioBuffer {
  const bufferSize = ctx.sampleRate * durationSec
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)

  if (type === 'white') {
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
  } else if (type === 'pink') {
    // Pink noise via Paul Kellet's refined method
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362
      b6 = white * 0.115926
      data[i] = pink * 0.11
    }
  } else {
    // Brown noise (random walk, integrated white noise)
    let lastOut = 0
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1
      lastOut = (lastOut + 0.02 * white) / 1.02
      data[i] = lastOut * 3.5
    }
  }

  return buffer
}

function createLoopingNoiseSource(
  ctx: AudioContext,
  buffer: AudioBuffer
): AudioBufferSourceNode {
  const src = ctx.createBufferSource()
  src.buffer = buffer
  src.loop = true
  return src
}

// ── LFO helper: modulates a target AudioParam ──────────────────
function createLFO(
  ctx: AudioContext,
  target: AudioParam,
  rateHz: number,
  depth: number,
  baseValue: number
): OscillatorNode {
  const lfo = ctx.createOscillator()
  lfo.frequency.value = rateHz
  lfo.type = 'sine'

  const lfoGain = ctx.createGain()
  lfoGain.gain.value = depth

  lfo.connect(lfoGain)
  lfoGain.connect(target)
  target.value = baseValue

  return lfo
}

// ── Individual sound builders ──────────────────────────────────

function buildRain(ctx: AudioContext, dest: AudioNode): SoundNode {
  const buffer = createNoiseBuffer(ctx, 'white', 4)
  const src    = createLoopingNoiseSource(ctx, buffer)

  const highpass = ctx.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = 1200

  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 7000

  const intensityGain = ctx.createGain()
  intensityGain.gain.value = 0.7
  const lfo = createLFO(ctx, intensityGain.gain, 0.08, 0.15, 0.7)

  const volumeGain = ctx.createGain()
  volumeGain.gain.value = 0.5

  src.connect(highpass)
  highpass.connect(lowpass)
  lowpass.connect(intensityGain)
  intensityGain.connect(volumeGain)
  volumeGain.connect(dest)

  src.start()
  lfo.start()

  return {
    stop: () => { src.stop(); lfo.stop() },
    setVolume: (v) => { volumeGain.gain.value = v * 0.5 },
  }
}

function buildOcean(ctx: AudioContext, dest: AudioNode): SoundNode {
  const buffer = createNoiseBuffer(ctx, 'brown', 6)
  const src    = createLoopingNoiseSource(ctx, buffer)

  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 900

  const waveGain = ctx.createGain()
  const lfo = createLFO(ctx, waveGain.gain, 0.12, 0.35, 0.55)

  const volumeGain = ctx.createGain()
  volumeGain.gain.value = 0.5

  src.connect(lowpass)
  lowpass.connect(waveGain)
  waveGain.connect(volumeGain)
  volumeGain.connect(dest)

  src.start()
  lfo.start()

  return {
    stop: () => { src.stop(); lfo.stop() },
    setVolume: (v) => { volumeGain.gain.value = v * 0.5 },
  }
}

function buildFire(ctx: AudioContext, dest: AudioNode): SoundNode {
  const buffer = createNoiseBuffer(ctx, 'brown', 4)
  const src    = createLoopingNoiseSource(ctx, buffer)

  const bandpass = ctx.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.frequency.value = 350
  bandpass.Q.value = 0.6

  const crackleGain = ctx.createGain()
  crackleGain.gain.value = 0.6

  const volumeGain = ctx.createGain()
  volumeGain.gain.value = 0.5

  src.connect(bandpass)
  bandpass.connect(crackleGain)
  crackleGain.connect(volumeGain)
  volumeGain.connect(dest)

  src.start()

  let crackleTimer: ReturnType<typeof setInterval> | null = setInterval(() => {
    const now = ctx.currentTime
    crackleGain.gain.cancelScheduledValues(now)
    crackleGain.gain.setValueAtTime(crackleGain.gain.value, now)
    crackleGain.gain.linearRampToValueAtTime(1.0, now + 0.03)
    crackleGain.gain.linearRampToValueAtTime(0.6, now + 0.15)
  }, 400 + Math.random() * 600)

  return {
    stop: () => {
      src.stop()
      if (crackleTimer) { clearInterval(crackleTimer); crackleTimer = null }
    },
    setVolume: (v) => { volumeGain.gain.value = v * 0.5 },
  }
}

function buildForest(ctx: AudioContext, dest: AudioNode): SoundNode {
  const buffer = createNoiseBuffer(ctx, 'pink', 5)
  const src    = createLoopingNoiseSource(ctx, buffer)

  const highpass = ctx.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = 600

  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 4500

  const volumeGain = ctx.createGain()
  volumeGain.gain.value = 0.35

  src.connect(highpass)
  highpass.connect(lowpass)
  lowpass.connect(volumeGain)
  volumeGain.connect(dest)

  src.start()

  let birdTimer: ReturnType<typeof setInterval> | null = setInterval(() => {
    if (Math.random() > 0.6) return
    const osc  = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    const baseFreq = 1800 + Math.random() * 1400
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(
      baseFreq * (1 + Math.random() * 0.4),
      ctx.currentTime + 0.08
    )
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02)
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
    osc.connect(gain)
    gain.connect(volumeGain)
    osc.start()
    osc.stop(ctx.currentTime + 0.2)
  }, 1800 + Math.random() * 2500)

  return {
    stop: () => {
      src.stop()
      if (birdTimer) { clearInterval(birdTimer); birdTimer = null }
    },
    setVolume: (v) => { volumeGain.gain.value = v * 0.35 },
  }
}

function buildWind(ctx: AudioContext, dest: AudioNode): SoundNode {
  const buffer = createNoiseBuffer(ctx, 'pink', 5)
  const src    = createLoopingNoiseSource(ctx, buffer)

  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 1500

  const lfo = createLFO(ctx, lowpass.frequency, 0.06, 600, 1500)

  const volumeGain = ctx.createGain()
  volumeGain.gain.value = 0.45

  src.connect(lowpass)
  lowpass.connect(volumeGain)
  volumeGain.connect(dest)

  src.start()
  lfo.start()

  return {
    stop: () => { src.stop(); lfo.stop() },
    setVolume: (v) => { volumeGain.gain.value = v * 0.45 },
  }
}

function buildWhiteNoise(ctx: AudioContext, dest: AudioNode): SoundNode {
  const buffer = createNoiseBuffer(ctx, 'white', 3)
  const src    = createLoopingNoiseSource(ctx, buffer)

  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.value = 9000

  const volumeGain = ctx.createGain()
  volumeGain.gain.value = 0.30

  src.connect(lowpass)
  lowpass.connect(volumeGain)
  volumeGain.connect(dest)

  src.start()

  return {
    stop: () => src.stop(),
    setVolume: (v) => { volumeGain.gain.value = v * 0.30 },
  }
}

const SOUND_BUILDERS: Record<SoundId, (ctx: AudioContext, dest: AudioNode) => SoundNode> = {
  rain:        buildRain,
  ocean:       buildOcean,
  fire:        buildFire,
  forest:      buildForest,
  wind:        buildWind,
  white_noise: buildWhiteNoise,
}

// ════════════════════════════════════════════════════════════
// AMBIENT SOUND ENGINE — public API
// ════════════════════════════════════════════════════════════
export class AmbientSoundEngine {
  private ctx:         AudioContext | null = null
  private masterGain:  GainNode | null = null
  private nodes:       Partial<Record<SoundId, SoundNode>> = {}

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = 1
      this.masterGain.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }
    return this.ctx
  }

  /** Must be called from a user gesture (click/tap) due to browser autoplay policy */
  async unlock(): Promise<void> {
    const ctx = this.ensureContext()
    if (ctx.state === 'suspended') await ctx.resume()
  }

  isPlaying(id: SoundId): boolean {
    return !!this.nodes[id]
  }

  /** Start a sound with fade-in */
  play(id: SoundId, volume: number, fadeMs = 800): void {
    if (this.nodes[id]) return
    const ctx = this.ensureContext()
    if (!this.masterGain) return

    const builder = SOUND_BUILDERS[id]
    const node    = builder(ctx, this.masterGain)
    node.setVolume(0)
    this.nodes[id] = node

    const steps = 20
    const stepMs = fadeMs / steps
    let i = 0
    const fadeIn = setInterval(() => {
      i++
      node.setVolume((i / steps) * (volume / 100))
      if (i >= steps) clearInterval(fadeIn)
    }, stepMs)
  }

  /** Stop a sound with fade-out */
  stop(id: SoundId, fadeMs = 500): void {
    const node = this.nodes[id]
    if (!node) return

    const steps = 15
    const stepMs = fadeMs / steps
    let i = steps
    const fadeOut = setInterval(() => {
      i--
      node.setVolume(i / steps)
      if (i <= 0) {
        clearInterval(fadeOut)
        node.stop()
        delete this.nodes[id]
      }
    }, stepMs)
  }

  setVolume(id: SoundId, volume: number): void {
    const node = this.nodes[id]
    if (node) node.setVolume(volume / 100)
  }

  setMasterVolume(volume: number): void {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(volume / 100, this.ctx.currentTime, 0.05)
    }
  }

  /** Stop everything immediately (cleanup) */
  stopAll(): void {
    Object.keys(this.nodes).forEach((id) => {
      this.nodes[id as SoundId]?.stop()
    })
    this.nodes = {}
  }

  suspend(): void { void this.ctx?.suspend() }
  resume():  void { void this.ctx?.resume() }

  destroy(): void {
    this.stopAll()
    this.ctx?.close()
    this.ctx = null
    this.masterGain = null
  }
}

// Singleton instance — one engine per app session
let engineInstance: AmbientSoundEngine | null = null

export function getSoundEngine(): AmbientSoundEngine {
  if (!engineInstance) engineInstance = new AmbientSoundEngine()
  return engineInstance
}
