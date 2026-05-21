// src/app/portfolio/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

export const alt = 'Proyecto de Portfolio';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

async function getProjectBySlug(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/projects/${slug}`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const project = await getProjectBySlug(resolvedParams.slug);

  if (!project) {
    notFound();
  }

  // Truncar título si es muy largo
  const title = project.title.length > 50 ? project.title.substring(0, 47) + '...' : project.title;

  // Obtener tecnologías principales (máximo 4)
  const techs = project.technologies?.slice(0, 4) || [];

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
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          color: 'white',
          padding: '60px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                fontSize: 24,
                color: '#22d3ee',
                fontWeight: 'bold',
              }}
            >
              PORTFOLIO
            </div>
            {project.category && (
              <div
                style={{
                  background: 'rgba(34, 211, 238, 0.15)',
                  border: '2px solid #22d3ee',
                  borderRadius: '8px',
                  padding: '6px 16px',
                  fontSize: 18,
                  color: '#22d3ee',
                }}
              >
                {project.category}
              </div>
            )}
          </div>
          {project.status && (
            <div
              style={{
                background: project.status === 'En producción' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                border: `2px solid ${project.status === 'En producción' ? '#22c55e' : '#eab308'}`,
                borderRadius: '8px',
                padding: '6px 16px',
                fontSize: 16,
                color: project.status === 'En producción' ? '#22c55e' : '#eab308',
              }}
            >
              {project.status}
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 52,
            fontWeight: 'bold',
            lineHeight: 1.2,
            color: 'white',
            maxWidth: '100%',
          }}
        >
          {title}
        </div>

        {/* Technologies */}
        {techs.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {techs.map((tech: string, index: number) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: 18,
                  color: '#e5e7eb',
                }}
              >
                {tech}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: '#e5e7eb',
              fontWeight: 'bold',
            }}
          >
            Luis Granero
          </div>
          <div
            style={{
              fontSize: 20,
              color: '#9ca3af',
            }}
          >
            luisgranero.com/portfolio
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
