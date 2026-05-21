import React from 'react';

interface Props {
  width: number;
}

export const RedSlash: React.FC<Props> = ({ width }) => (
  <div
    style={{
      width,
      height: 2,
      backgroundColor: '#8B0000',
      boxShadow: '0 0 8px #8B0000',
    }}
  />
);
