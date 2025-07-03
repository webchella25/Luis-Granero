// src/app/api/debug-env/route.js
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasMongoUri: !!process.env.MONGODB_URI,
    mongoUriDatabase: process.env.MONGODB_URI?.split('/')[3]?.split('?')[0],
    hasAdminEmail: !!process.env.ADMIN_EMAIL,
    adminEmail: process.env.ADMIN_EMAIL,
    hasAdminPassword: !!process.env.ADMIN_PASSWORD,
    adminPasswordLength: process.env.ADMIN_PASSWORD?.length,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('ADMIN') || 
      key.includes('MONGO') || 
      key.includes('NEXTAUTH')
    )
  })
}