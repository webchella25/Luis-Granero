// src/app/admin/status/page.js
'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminStatus() {
  // // useSession() // TODO: Auth manual // TODO: Auth manual
  const session = null; const status = "unauthenticated"
  const router = useRouter()

  useEffect(() => {
    console.log('Session status:', status)
    console.log('Session data:', session)
  }, [session, status])

  const goToLogin = () => {
    router.push('/admin/login')
  }

  const testInit = async () => {
    try {
      const res = await fetch('/api/admin/init')
      const data = await res.json()
      console.log('Init result:', data)
      alert(JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Init error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl mb-6">🔍 Admin Status Debug</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg text-cyan-400 mb-2">NextAuth Status:</h3>
          <p>Status: <span className="text-yellow-400">{status}</span></p>
          <p>Authenticated: <span className="text-yellow-400">{session ? 'YES' : 'NO'}</span></p>
          {session && (
            <p>User: <span className="text-yellow-400">{session.user?.email}</span></p>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg text-cyan-400 mb-2">Current URL:</h3>
          <p className="text-yellow-400">{typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
        </div>

        <div className="space-y-2">
          <button 
            onClick={goToLogin}
            className="block w-full bg-blue-600 text-white p-3 rounded"
          >
            🔐 Ir a Login Manual
          </button>
          
          <button 
            onClick={testInit}
            className="block w-full bg-green-600 text-white p-3 rounded"
          >
            🔄 Test Admin Init
          </button>
          
          <a 
            href="/api/admin/check"
            target="_blank"
            className="block w-full bg-purple-600 text-white p-3 rounded text-center"
          >
            👤 Check Admin User
          </a>
        </div>
      </div>
    </div>
  )
}