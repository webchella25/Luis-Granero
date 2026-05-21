// src/app/sobre-mi/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Sobre Luis Granero - Desarrollador Web Freelance España';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  const skills = ['React', 'Next.js', 'TypeScript', 'Node.js'];

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
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
        {/* Avatar placeholder */}
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #06b6d4, #22c55e)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '30px',
            fontSize: 48,
          }}
        >
          LG
        </div>

        {/* Name */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 'bold',
            marginBottom: '10px',
          }}
        >
          Luis Granero
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 28,
            color: '#22d3ee',
            marginBottom: '30px',
          }}
        >
          Desarrollador Full Stack Freelance
        </div>

        {/* Location */}
        <div
          style={{
            fontSize: 20,
            color: '#9ca3af',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>📍</span> España • +10 años de experiencia
        </div>

        {/* Skills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          {skills.map((skill, index) => (
            <div
              key={index}
              style={{
                background: 'rgba(34, 211, 238, 0.15)',
                border: '2px solid rgba(34, 211, 238, 0.4)',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: 18,
                color: '#22d3ee',
              }}
            >
              {skill}
            </div>
          ))}
        </div>

        {/* Website */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: 20,
            color: '#6b7280',
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
