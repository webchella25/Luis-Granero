// src/app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og';
import { notFound } from 'next/navigation';

export const runtime = 'edge';

export const alt = 'Artículo de Blog';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

async function getPostBySlug(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/public/blog/${slug}`, {
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
  const post = await getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  // Truncar título si es muy largo
  const title = post.title.length > 60 ? post.title.substring(0, 57) + '...' : post.title;

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
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: 24,
              color: '#06b6d4',
              fontWeight: 'bold',
            }}
          >
            📝 BLOG
          </div>
          {post.category && (
            <div
              style={{
                background: 'rgba(6, 182, 212, 0.2)',
                border: '2px solid #06b6d4',
                borderRadius: '8px',
                padding: '6px 16px',
                fontSize: 20,
                color: '#06b6d4',
              }}
            >
              {post.category}
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 'bold',
            lineHeight: 1.2,
            color: 'white',
            maxWidth: '100%',
            display: '-webkit-box',
          }}
        >
          {title}
        </div>

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
              gap: '15px',
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
            {post.readingTime && (
              <div
                style={{
                  fontSize: 20,
                  color: '#9ca3af',
                }}
              >
                • {post.readingTime} min lectura
              </div>
            )}
          </div>
          <div
            style={{
              fontSize: 22,
              color: '#9ca3af',
            }}
          >
            luisgranero.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
