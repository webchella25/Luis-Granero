import React from 'react';

interface Props {
  opacity?: number;
}

export const ScanLines: React.FC<Props> = ({ opacity = 0.07 }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      opacity,
      pointerEvents: 'none',
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)',
    }}
  />
);
