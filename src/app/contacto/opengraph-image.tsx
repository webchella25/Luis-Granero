// src/app/contacto/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Contacto - Presupuesto Desarrollo Web España';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
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
        {/* Icon */}
        <div
          style={{
            fontSize: 72,
            marginBottom: '30px',
          }}
        >
          💬
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 1.2,
            marginBottom: '20px',
            background: 'linear-gradient(90deg, #ffffff, #22c55e)',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Hablemos de tu Proyecto
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 26,
            color: '#9ca3af',
            textAlign: 'center',
            marginBottom: '40px',
          }}
        >
          Presupuesto gratuito • Respuesta en 24h
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            marginBottom: '40px',
          }}
        >
          {[
            { icon: '✅', text: 'Consulta gratis' },
            { icon: '⚡', text: 'Respuesta rápida' },
            { icon: '🎯', text: 'Sin compromiso' },
          ].map((feature, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '50px',
                padding: '12px 24px',
                fontSize: 18,
                color: '#22c55e',
              }}
            >
              <span>{feature.icon}</span>
              <span>{feature.text}</span>
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
              color: '#22c55e',
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
            Desarrollador Web Freelance España
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
