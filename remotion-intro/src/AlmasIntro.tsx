import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  staticFile,
  Easing,
} from 'remotion';
import { Noise } from './components/Noise';
import { ScanLines } from './components/ScanLines';

const GOLD = '#c9a84c';
const DARK_GOLD = '#8a6a1f';
const BG = '#080808';
const RED = '#8B0000';

export interface IntroProps extends Record<string, unknown> {
  nombre: string;
  tagline: string;
}

export const AlmasIntro: React.FC<IntroProps> = ({ nombre, tagline }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const NOISE_END = 18;
  const LOGO_START = 20;
  const LOGO_PEAK = 80;
  const TITLE_START = 60;
  const SUB_START = 100;
  const SLASH_START = 120;
  const HOLD_START = 150;
  const FADE_START = 185;
  const TOTAL = 210;

  const noiseOpacity = interpolate(frame, [0, NOISE_END], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const logoScale = spring({
    frame: frame - LOGO_START,
    fps,
    config: { damping: 14, stiffness: 80, mass: 1 },
    from: 0.35,
    to: 1,
  });

  const logoOpacity = interpolate(frame, [LOGO_START, LOGO_START + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const flickerPhase = Math.sin(frame * 0.4) * 0.03 + Math.sin(frame * 1.1) * 0.02;
  const logoFinalOpacity = frame > LOGO_PEAK
    ? Math.max(0.88, logoOpacity - flickerPhase)
    : logoOpacity;

  const glowIntensity = interpolate(frame, [LOGO_START + 10, LOGO_PEAK, HOLD_START], [0, 28, 18], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.quad),
  });

  const titleProgress = interpolate(frame, [TITLE_START, TITLE_START + 45], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });

  const subOpacity = interpolate(frame, [SUB_START, SUB_START + 25], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const subY = interpolate(frame, [SUB_START, SUB_START + 25], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const slashWidth = interpolate(frame, [SLASH_START, SLASH_START + 20], [0, 240], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });

  const globalOpacity = interpolate(frame, [FADE_START, TOTAL], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.quad),
  });

  // Ajuste de tamaño de fuente según longitud del nombre
  const titleFontSize = nombre.length > 16 ? 68 : nombre.length > 12 ? 80 : 92;

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: globalOpacity }}>

      <Noise opacity={0.055} />

      {frame < NOISE_END + 5 && <Noise opacity={noiseOpacity * 0.85} animated />}

      <AbsoluteFill
        style={{
          background: 'radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.82) 100%)',
          pointerEvents: 'none',
        }}
      />

      {frame >= LOGO_START && (
        <AbsoluteFill
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              transform: `scale(${logoScale})`,
              opacity: logoFinalOpacity,
              filter: glowIntensity > 0
                ? `drop-shadow(0 0 ${glowIntensity}px ${GOLD}) drop-shadow(0 0 ${glowIntensity * 2}px ${DARK_GOLD})`
                : undefined,
              marginBottom: 52,
            }}
          >
            <img
              src={staticFile('logo.png')}
              alt={nombre}
              style={{ width: 220, height: 220, objectFit: 'contain' }}
            />
          </div>

          <div
            style={{
              width: slashWidth,
              height: 2,
              backgroundColor: RED,
              marginBottom: 28,
              boxShadow: `0 0 8px ${RED}`,
            }}
          />

          <div style={{ overflow: 'hidden', clipPath: `inset(0 ${100 - titleProgress}% 0 0)` }}>
            <span
              style={{
                fontFamily: '"Times New Roman", Georgia, serif',
                fontSize: titleFontSize,
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: GOLD,
                textTransform: 'uppercase',
                textShadow: `0 0 30px ${DARK_GOLD}, 0 2px 4px rgba(0,0,0,0.9)`,
                display: 'block',
                whiteSpace: 'nowrap',
              }}
            >
              {nombre}
            </span>
          </div>

          {tagline && (
            <div
              style={{
                opacity: subOpacity,
                transform: `translateY(${subY}px)`,
                marginTop: 18,
              }}
            >
              <span
                style={{
                  fontFamily: '"Courier New", Courier, monospace',
                  fontSize: 22,
                  letterSpacing: '0.32em',
                  color: '#9a8a6a',
                  textTransform: 'uppercase',
                  textShadow: '0 1px 6px rgba(0,0,0,0.8)',
                }}
              >
                {tagline}
              </span>
            </div>
          )}
        </AbsoluteFill>
      )}

      <ScanLines opacity={0.07} />

    </AbsoluteFill>
  );
};
