// src/lib/mongodb.ts - Conexión a MongoDB con pre-carga de modelos
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Global interface for caching
declare global {
    var mongoose: {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
    };
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<mongoose.Connection> {
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

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
            console.log('✅ MongoDB conectado exitosamente');

            // 🔥 PRE-CARGAR MODELOS para evitar "Schema hasn't been registered"
            // Esto es crítico en entornos serverless como Vercel
            try {
                // Cargar modelos principales explícitamente

                if (!mongoose.models.Lead) {
                    require('@/models/Lead');
                    console.log('✅ Modelo Lead cargado');
                }

                if (!mongoose.models.Appointment) {
                    require('@/models/Appointment');
                    console.log('✅ Modelo Appointment cargado');
                }

                if (!mongoose.models.BlogPost) {
                    require('@/models/BlogPost');
                    console.log('✅ Modelo BlogPost cargado');
                }

                if (!mongoose.models.LearningPath) {
                    require('@/models/LearningPath');
                    console.log('✅ Modelo LearningPath cargado');
                }

                if (!mongoose.models.MessageTemplate) {
                    require('@/models/MessageTemplate');
                    console.log('✅ Modelo MessageTemplate cargado');
                }

                if (!mongoose.models.User) {
                    require('@/models/User');
                    console.log('✅ Modelo User cargado');
                }

                console.log('✅ Todos los modelos registrados correctamente');
            } catch (error: any) {
                console.warn('⚠️ Advertencia al cargar algunos modelos:', error.message);
                // No lanzar error, solo advertir
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
