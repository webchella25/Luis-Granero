// src/app/servicios/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Servicios de Desarrollo Web - Luis Granero';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const services = [
    { icon: '💻', name: 'Desarrollo Web' },
    { icon: '🛒', name: 'E-commerce' },
    { icon: '⚛️', name: 'React / Next.js' },
    { icon: '📱', name: 'Apps Responsivas' },
  ];

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)',
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
              background: 'linear-gradient(90deg, #06b6d4, #22c55e)',
              padding: '8px 24px',
              borderRadius: '50px',
              fontSize: 20,
              fontWeight: 'bold',
              color: 'black',
            }}
          >
            FREELANCE ESPAÑA
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: '40px',
            background: 'linear-gradient(90deg, #ffffff, #06b6d4)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Servicios de Desarrollo Web
        </div>

        {/* Services Grid */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          {services.map((service, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '24px 32px',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: 36 }}>{service.icon}</span>
              <span style={{ fontSize: 16, color: '#e5e7eb' }}>{service.name}</span>
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
            +10 años de experiencia
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
