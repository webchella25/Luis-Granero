// src/lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongooseInstance) => {
      console.log('✅ MongoDB conectado exitosamente');
      
      // Pre-cargar modelos con imports dinámicos
      try {
        await import('@/models/User');
        await import('@/models/Lead');
        await import('@/models/Appointment');
        await import('@/models/BlogPost');
        await import('@/models/LearningPath');
        console.log('✅ Modelos cargados correctamente');
      } catch (error) {
        console.warn('⚠️ Error cargando modelos:', error.message);
      }
      
      return mongooseInstance.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Error conectando a MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
