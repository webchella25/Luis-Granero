import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import SiteConfig from '@/models/SiteConfig'

export async function GET() {
  try {
    await dbConnect()
    const config = await SiteConfig.findOne({ key: 'site_info' }).lean()
    const social = config?.value?.social || {}
    return NextResponse.json(social, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' }
    })
  } catch {
    return NextResponse.json({})
  }
}
