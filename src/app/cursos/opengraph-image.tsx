// src/app/cursos/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Cursos de Desarrollo Web - Luis Granero';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const features = [
    { icon: '⚛️', name: 'React' },
    { icon: '▲', name: 'Next.js' },
    { icon: '📘', name: 'TypeScript' },
    { icon: '🎨', name: 'CSS/Tailwind' },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #0c0a1d 0%, #1a1333 50%, #2d1f4e 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '60px',
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '30px',
          }}
        >
          <div
            style={{
              background: 'linear-gradient(90deg, #a855f7, #6366f1)',
              padding: '8px 24px',
              borderRadius: '50px',
              fontSize: 20,
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            🎓 FORMACIÓN ONLINE
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: '20px',
            background: 'linear-gradient(90deg, #ffffff, #a855f7)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Cursos de Desarrollo Web
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: '#d1d5db',
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          Aprende React, Next.js y desarrollo web moderno
        </div>

        {/* Technologies Grid */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '16px',
                padding: '24px 32px',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: 36 }}>{feature.icon}</span>
              <span style={{ fontSize: 16, color: '#d8b4fe' }}>{feature.name}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 'bold',
              color: '#a855f7',
            }}
          >
            Luis Granero
          </div>
          <div
            style={{
              width: '2px',
              height: '24px',
              background: '#4b5563',
            }}
          />
          <div
            style={{
              fontSize: 20,
              color: '#9ca3af',
            }}
          >
            Cursos gratuitos y premium
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
