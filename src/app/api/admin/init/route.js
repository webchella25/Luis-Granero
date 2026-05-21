import { NextResponse } from 'next/server'

export async function GET() {
  return initAdminDisabled()
}

export async function POST() {
  return initAdminDisabled()
}

function initAdminDisabled() {
  return NextResponse.json({
    success: false,
    error: 'Endpoint de inicialización de admin deshabilitado en producción'
  }, { status: 410 })
}
