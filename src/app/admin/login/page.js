// src/app/admin/login/page.js - SIN usar el layout admin
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔍 Attempting login with:', email)
      
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      })

      console.log('🔍 Login result:', result)

      if (result?.error) {
        setError('Credenciales incorrectas')
      } else if (result?.ok) {
        console.log('✅ Login successful, redirecting...')
        router.push('/admin')
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      setError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h1 className="text-2xl text-white mb-6 text-center">🔐 Admin Login</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-700 text-white rounded"
            required
          />
          
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-cyan-600 text-white rounded hover:bg-cyan-700 disabled:bg-gray-600"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-sm text-gray-400">
          <p>Credenciales configuradas en Vercel Environment Variables</p>
        </div>
      </div>
    </div>
  )
}