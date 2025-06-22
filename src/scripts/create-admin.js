// scripts/create-admin.js
import dbConnect from '../lib/mongodb.js'
import User from '../models/User.js'

async function createAdmin() {
  await dbConnect()
  
  const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL })
  
  if (!adminExists) {
    const admin = new User({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      name: 'Luis Granero',
      role: 'admin'
    })
    
    await admin.save()
    console.log('Admin user created successfully!')
  } else {
    console.log('Admin user already exists')
  }
  
  process.exit(0)
}

createAdmin()