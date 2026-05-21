// src/app/portfolio/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Portfolio de Desarrollo Web - Luis Granero';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const categories = [
    { icon: '🛒', name: 'E-commerce' },
    { icon: '📊', name: 'Dashboards' },
    { icon: '🌐', name: 'Web Apps' },
    { icon: '📱', name: 'Responsive' },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
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
              background: 'linear-gradient(90deg, #22d3ee, #22c55e)',
              padding: '8px 24px',
              borderRadius: '50px',
              fontSize: 20,
              fontWeight: 'bold',
              color: 'black',
            }}
          >
            CASOS DE ÉXITO
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
            background: 'linear-gradient(90deg, #ffffff, #22d3ee)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Portfolio de Desarrollo Web
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: '#9ca3af',
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          Proyectos reales con React, Next.js y tecnologías modernas
        </div>

        {/* Categories Grid */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          {categories.map((category, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(34, 211, 238, 0.1)',
                border: '1px solid rgba(34, 211, 238, 0.3)',
                borderRadius: '16px',
                padding: '24px 32px',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: 36 }}>{category.icon}</span>
              <span style={{ fontSize: 16, color: '#22d3ee' }}>{category.name}</span>
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
              color: '#22d3ee',
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
            Freelance España
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
