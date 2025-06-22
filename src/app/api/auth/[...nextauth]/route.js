// src/app/api/auth/[...nextauth]/route.js - Con debug completo
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('=== LOGIN ATTEMPT ===')
        console.log('Email:', credentials?.email)
        console.log('Password received:', !!credentials?.password)
        console.log('Env email:', process.env.ADMIN_EMAIL)
        console.log('Env password set:', !!process.env.ADMIN_PASSWORD)
        
        if (!credentials?.email || !credentials?.password) {
          console.log('Missing credentials')
          return null
        }

        try {
          await dbConnect()
          console.log('DB connected')
          
          const user = await User.findOne({ email: credentials.email })
          console.log('User found:', !!user)
          console.log('User email match:', user?.email === credentials.email)
          
          if (!user) {
            console.log('User not found in database')
            return null
          }

          const isPasswordValid = await user.comparePassword(credentials.password)
          console.log('Password validation result:', isPasswordValid)
          
          if (!isPasswordValid) {
            console.log('Password validation failed')
            return null
          }

          console.log('Login successful for:', user.email)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Activar debug de NextAuth
})

export { handler as GET, handler as POST }