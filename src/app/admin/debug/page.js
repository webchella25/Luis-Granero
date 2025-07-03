// src/app/admin/debug/page.js
'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [envInfo, setEnvInfo] = useState(null)
  
  useEffect(() => {
    // Verificar las APIs
    fetch('/api/admin/check')
      .then(res => res.json())
      .then(data => setEnvInfo(data))
      .catch(err => setEnvInfo({ error: err.message }))
  }, [])
  
  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl mb-4">🔍 Debug Panel Vercel</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg text-cyan-400">NextAuth Status:</h3>
          <p>Status: {status}</p>
          <p>Session: {session ? 'Authenticated' : 'Not authenticated'}</p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg text-cyan-400">Environment Check:</h3>
          <pre className="text-sm">
            {envInfo ? JSON.stringify(envInfo, null, 2) : 'Loading...'}
          </pre>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-lg text-cyan-400">Quick Tests:</h3>
          <div className="space-y-2">
            <a 
              href="/api/admin/init"
              className="block bg-blue-600 text-white px-4 py-2 rounded text-center"
            >
              🔄 Initialize Admin
            </a>
            <a 
              href="/admin/login"
              className="block bg-green-600 text-white px-4 py-2 rounded text-center"
            >
              🔐 Go to Login
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}