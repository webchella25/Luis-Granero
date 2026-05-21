import React from 'react';
import { useCurrentFrame } from 'remotion';

interface Props {
  opacity?: number;
  animated?: boolean;
}

// Genera ruido pseudoaleatorio como SVG feTurbulence
export const Noise: React.FC<Props> = ({ opacity = 0.05, animated = false }) => {
  const frame = useCurrentFrame();
  const seed = animated ? (frame * 7) % 999 : 42;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
    >
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <filter id={`noise-${seed}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            seed={seed}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#noise-${seed})`} />
      </svg>
    </div>
  );
};
