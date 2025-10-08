// src/app/admin/login/page.js - Ya lo tienes bien, solo verifica
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({
    email: 'luis@luisgranero.com',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false
      })

      if (result?.error) {
        setError('Credenciales incorrectas. Verifica email y password.')
      } else if (result?.ok) {
        window.location.href = '/admin'
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
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        padding: '40px',
        borderRadius: '12px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '32px'
          }}>
            🔐
          </div>
          <h1 style={{ 
            color: 'white', 
            fontSize: '28px', 
            fontWeight: 'bold',
            margin: '0 0 8px 0' 
          }}>
            Admin Panel
          </h1>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '14px' }}>
            Luis Granero - Developer Dashboard
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              color: '#cbd5e1', 
              fontSize: '14px', 
              fontWeight: '500',
              display: 'block', 
              marginBottom: '8px' 
            }}>
              Email
            </label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#334155',
                border: '2px solid #475569',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
              onBlur={(e) => e.target.style.borderColor = '#475569'}
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              color: '#cbd5e1', 
              fontSize: '14px', 
              fontWeight: '500',
              display: 'block', 
              marginBottom: '8px' 
            }}>
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              placeholder="Tu password"
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: '#334155',
                border: '2px solid #475569',
                borderRadius: '8px',
                color: 'white',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
              onBlur={(e) => e.target.style.borderColor = '#475569'}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#64748b' : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(6, 182, 212, 0.4)'
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {loading ? '⏳ Entrando...' : '🚀 Iniciar Sesión'}
          </button>
        </form>

        <div style={{ 
          marginTop: '24px', 
          paddingTop: '24px',
          borderTop: '1px solid #334155',
          textAlign: 'center', 
          fontSize: '13px', 
          color: '#64748b' 
        }}>
          <p style={{ margin: '0 0 4px 0' }}>Email: luis@luisgranero.com</p>
          <p style={{ margin: 0 }}>Vercel Environment Variables</p>
        </div>
      </div>
    </div>
  )
}