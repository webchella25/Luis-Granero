// clean-indexes.js - Script para limpiar índices duplicados
// Ejecutar con: node clean-indexes.js

const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'tu-mongodb-uri-aqui';

async function cleanIndexes() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('projects');

    console.log('\n📋 Índices actuales:');
    const indexes = await collection.indexes();
    indexes.forEach((index) => {
      console.log('  -', index.name, ':', JSON.stringify(index.key));
    });

    // Eliminar todos los índices excepto _id
    console.log('\n🗑️  Eliminando índices duplicados...');
    await collection.dropIndexes();
    console.log('✅ Índices eliminados');

    // Recrear índices correctos
    console.log('\n🔨 Creando índices correctos...');
    
    await collection.createIndex({ slug: 1 }, { unique: true });
    console.log('✅ Índice único en slug creado');
    
    await collection.createIndex({ category: 1 });
    console.log('✅ Índice en category creado');
    
    await collection.createIndex({ isFeatured: 1 });
    console.log('✅ Índice en isFeatured creado');
    
    await collection.createIndex({ orderIndex: 1 });
    console.log('✅ Índice en orderIndex creado');
    
    await collection.createIndex({ isActive: 1 });
    console.log('✅ Índice en isActive creado');

    console.log('\n📋 Índices finales:');
    const newIndexes = await collection.indexes();
    newIndexes.forEach((index) => {
      console.log('  -', index.name, ':', JSON.stringify(index.key));
    });

    console.log('\n✅ ¡Limpieza completada exitosamente!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

cleanIndexes();