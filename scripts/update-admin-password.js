// scripts/update-admin-password.js
import mongoose from 'mongoose'
import User from '../src/models/User.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

async function updateAdminPassword() {
  try {
    console.log('🔗 Conectando a MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✅ Conectado a MongoDB')

    const adminEmail = 'luis@luisgranero.com'
    const newPassword = 'Admin2025Pass' // Sin caracteres especiales problemáticos

    const admin = await User.findOne({ email: adminEmail })

    if (!admin) {
      console.log('❌ No se encontró el usuario administrador')
      await mongoose.disconnect()
      return
    }

    admin.password = newPassword
    await admin.save()

    console.log('✅ Contraseña actualizada exitosamente')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Nueva contraseña:', newPassword)
    console.log('')
    console.log('🌐 Puedes iniciar sesión en:')
    console.log('   https://www.luisgranero.com/admin/login')

    await mongoose.disconnect()
    console.log('✅ Desconectado de MongoDB')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

updateAdminPassword()
