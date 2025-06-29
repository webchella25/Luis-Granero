// src/app/api/public/homepage/route.js
import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Page from '@/models/Page'

export async function GET() {
  try {
    await dbConnect()
    
    const homepage = await Page.findOne({ 
      slug: 'homepage', 
      isPublished: true 
    }).select('content updatedAt')
    
    if (!homepage) {
      // Datos por defecto
      const { homepageSchema } = await import('@/lib/pageData')
      return NextResponse.json({ content: homepageSchema })
    }
    
    return NextResponse.json(homepage, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    })
    
  } catch (error) {
    console.error('Error fetching homepage:', error)
    const { homepageSchema } = await import('@/lib/pageData')
    return NextResponse.json({ content: homepageSchema })
  }
}
export default async function AboutPage() {
  const aboutData = await getAboutData();
  const content = aboutData?.content;

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <AboutHero data={content?.hero} />
      <AboutStory data={content?.story} />
      <ExperienceTimeline data={content?.experience} />
      <SkillsDetail data={content?.skills} />
      <Methodology data={content?.methodology} />
      <Values data={content?.values} />
      <Footer />
    </main>
  );
}