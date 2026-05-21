// src/app/cursos/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

export const alt = 'Curso de Desarrollo Web';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

async function getCourseData(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Intentar buscar en email courses primero
  try {
    const emailRes = await fetch(`${baseUrl}/api/public/email-courses/${slug}`, {
      next: { revalidate: 86400 },
    });
    if (emailRes.ok) {
      const data = await emailRes.json();
      return { type: 'email', data: data.course };
    }
  } catch (error) {
    // continuar con learning paths
  }

  // Si no es email course, buscar en learning paths
  try {
    const pathRes = await fetch(`${baseUrl}/api/public/learning-paths/${slug}`, {
      next: { revalidate: 86400 },
    });
    if (pathRes.ok) {
      const data = await pathRes.json();
      return { type: 'learning-path', data: data.path };
    }
  } catch (error) {
    // no encontrado
  }

  return null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const courseData = await getCourseData(resolvedParams.slug);

  if (!courseData) {
    notFound();
  }

  const course = courseData.data;
  const isEmailCourse = courseData.type === 'email';

  // Truncar título si es muy largo
  const title = course.title.length > 50 ? course.title.substring(0, 47) + '...' : course.title;

  // Obtener topics principales (máximo 4)
  const topics = course.topics?.slice(0, 4) || [];

  // Determinar color según nivel
  const levelColors: Record<string, { bg: string; border: string; text: string }> = {
    'Principiante': { bg: 'rgba(34, 197, 94, 0.2)', border: '#22c55e', text: '#22c55e' },
    'Intermedio': { bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', text: '#eab308' },
    'Avanzado': { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#ef4444' },
  };
  const levelStyle = levelColors[course.level] || levelColors['Principiante'];

  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: 'linear-gradient(135deg, #0c0a1d 0%, #1a1333 50%, #0f172a 100%)',
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
              gap: '16px',
            }}
          >
            <div
              style={{
                fontSize: 24,
                color: '#a855f7',
                fontWeight: 'bold',
              }}
            >
              {isEmailCourse ? '📧 CURSO GRATIS' : '🎓 CURSO'}
            </div>
            {course.level && (
              <div
                style={{
                  background: levelStyle.bg,
                  border: `2px solid ${levelStyle.border}`,
                  borderRadius: '8px',
                  padding: '6px 16px',
                  fontSize: 18,
                  color: levelStyle.text,
                }}
              >
                {course.level}
              </div>
            )}
          </div>
          {course.duration && (
            <div
              style={{
                background: 'rgba(139, 92, 246, 0.2)',
                border: '2px solid #8b5cf6',
                borderRadius: '8px',
                padding: '6px 16px',
                fontSize: 18,
                color: '#8b5cf6',
              }}
            >
              {course.duration}
            </div>
          )}
        </div>

        {/* Icon + Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {course.icon && (
            <span style={{ fontSize: 48 }}>{course.icon}</span>
          )}
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              lineHeight: 1.2,
              color: 'white',
              maxWidth: '100%',
            }}
          >
            {title}
          </div>
        </div>

        {/* Topics */}
        {topics.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {topics.map((topic: string, index: number) => (
              <div
                key={index}
                style={{
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: 18,
                  color: '#d8b4fe',
                }}
              >
                {topic}
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
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
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
            {course.articles?.length && (
              <div
                style={{
                  fontSize: 18,
                  color: '#9ca3af',
                }}
              >
                • {course.articles.length} lecciones
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: 20,
              color: '#9ca3af',
            }}
          >
            luisgranero.com/cursos
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
