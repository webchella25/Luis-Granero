// src/app/admin/login/page.js - VERSION SIMPLIFICADA
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: 'luis@luisgranero.com', // Pre-rellenado para testing
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🔍 Login attempt:', credentials.email)

    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false
      })

      console.log('🔍 SignIn result:', result)

      if (result?.error) {
        console.log('❌ Login failed:', result.error)
        setError('Credenciales incorrectas. Verifica email y password.')
      } else if (result?.ok) {
        console.log('✅ Login successful!')
        window.location.href = '/admin' // Forzar redirect completo
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1f2937',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#374151',
        padding: '40px',
        borderRadius: '8px',
        maxWidth: '400px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: 'white', fontSize: '24px', margin: '0 0 10px 0' }}>
            🔐 Admin Panel
          </h1>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            Luis Granero - Developer Dashboard
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#d1d5db', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              Email
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#4b5563',
                border: '1px solid #6b7280',
                borderRadius: '6px',
                color: 'white',
                fontSize: '16px'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#d1d5db', fontSize: '14px', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="Tu password de 14 caracteres"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#4b5563',
                border: '1px solid #6b7280',
                borderRadius: '6px',
                color: 'white',
                fontSize: '16px'
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#6b7280' : '#06b6d4',
              border: 'none',
              borderRadius: '6px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Entrando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center', 
          fontSize: '12px', 
          color: '#9ca3af' 
        }}>
          <p>Credenciales configuradas en Vercel</p>
          <p>Email: luis@luisgranero.com</p>
        </div>
      </div>
    </div>
  )
}