// src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Luis Granero - Desarrollador Full Stack';
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
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
          padding: '60px',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(circle at 20% 30%, rgba(6, 182, 212, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          {/* Name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #06b6d4, #10b981)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: '20px',
            }}
          >
            Luis Granero
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 36,
              color: '#e5e7eb',
              textAlign: 'center',
              marginBottom: '30px',
            }}
          >
            Desarrollador Full Stack
          </div>

          {/* Tech tags */}
          <div
            style={{
              display: 'flex',
              gap: '15px',
              marginTop: '20px',
            }}
          >
            {['React', 'Next.js', 'Node.js', 'TypeScript'].map((tech) => (
              <div
                key={tech}
                style={{
                  background: 'rgba(6, 182, 212, 0.2)',
                  border: '2px solid #06b6d4',
                  borderRadius: '8px',
                  padding: '8px 20px',
                  fontSize: 24,
                  color: '#06b6d4',
                }}
              >
                {tech}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            fontSize: 24,
            color: '#9ca3af',
          }}
        >
          luisgranero.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
