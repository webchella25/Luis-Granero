// scripts/create-admin.js
import mongoose from 'mongoose'
import User from '../src/models/User.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function createAdmin() {
  try {
    console.log('🔗 Conectando a MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Conectado a MongoDB')

    const adminEmail = process.env.ADMIN_EMAIL || 'luis@luisgranero.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminLuis2025!'

    // Verificar si ya existe un admin
    const existingAdmin = await User.findOne({ email: adminEmail })

    if (existingAdmin) {
      console.log('⚠️  El usuario administrador ya existe:', adminEmail)
      console.log('Usuario ID:', existingAdmin._id)
      console.log('Rol:', existingAdmin.role)

      // Actualizar a admin si no lo es
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin'
        await existingAdmin.save()
        console.log('✅ Rol actualizado a admin')
      }

      await mongoose.disconnect()
      return
    }

    // Crear usuario administrador
    console.log('👤 Creando usuario administrador...')
    const admin = await User.create({
      username: 'luisgranero',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      profile: {
        firstName: 'Luis',
        lastName: 'Granero',
        bio: 'Desarrollador Full Stack y fundador de LuisGranero.com'
      },
      emailVerified: true,
      isActive: true,
      studentProfile: {
        totalXP: 0,
        level: 1,
        achievements: [],
        coursesEnrolled: 0,
        coursesCompleted: 0,
        totalStudyTime: 0,
        streak: {
          current: 0,
          longest: 0
        }
      },
      subscription: {
        plan: 'lifetime',
        status: 'active'
      }
    })

    console.log('✅ Usuario administrador creado exitosamente')
    console.log('📧 Email:', admin.email)
    console.log('👤 Username:', admin.username)
    console.log('🔑 ID:', admin._id)
    console.log('👑 Rol:', admin.role)
    console.log('')
    console.log('🔐 Credenciales de acceso:')
    console.log('   Email:', adminEmail)
    console.log('   Password:', adminPassword)
    console.log('')
    console.log('🌐 Acceso al panel:')
    console.log('   https://www.luisgranero.com/admin/login')

    await mongoose.disconnect()
    console.log('✅ Desconectado de MongoDB')
  } catch (error) {
    console.error('❌ Error:', error.message)
    if (error.code === 11000) {
      console.log('⚠️  Error: El email o username ya está en uso')
    }
    process.exit(1)
  }
}

createAdmin()
