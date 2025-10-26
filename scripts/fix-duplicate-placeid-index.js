// scripts/fix-duplicate-placeid-index.js
// SCRIPT PARA ELIMINAR Y RECREAR EL ÍNDICE DE PLACEID

import { config } from 'dotenv';
import mongoose from 'mongoose';

config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function fixPlaceIdIndex() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('leads');

    // 1. Ver índices actuales
    console.log('\n📋 Índices actuales:');
    const indexes = await collection.indexes();
    indexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key), 
                  index.sparse ? '(sparse)' : '(NO sparse)');
    });

    // 2. Buscar el índice problemático de placeId
    const placeIdIndex = indexes.find(idx => 
      idx.key.placeId && !idx.sparse
    );

    if (placeIdIndex) {
      console.log('\n🔍 Encontrado índice problemático:', placeIdIndex.name);
      console.log('   Este índice NO es sparse, causando errores de duplicados');
      
      // 3. Eliminar el índice antiguo
      console.log('\n🗑️  Eliminando índice antiguo...');
      await collection.dropIndex(placeIdIndex.name);
      console.log('✅ Índice eliminado');
      
      // 4. Crear nuevo índice con sparse: true
      console.log('\n🔨 Creando nuevo índice con sparse: true...');
      await collection.createIndex({ placeId: 1 }, { sparse: true });
      console.log('✅ Nuevo índice creado correctamente');
      
    } else {
      console.log('\n✅ El índice de placeId ya es sparse, no es necesario hacer cambios');
    }

    // 5. Verificar índices finales
    console.log('\n📋 Índices finales:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach(index => {
      console.log(`  - ${index.name}:`, JSON.stringify(index.key), 
                  index.sparse ? '(sparse)' : '');
    });

    // 6. Verificar cuántos leads tienen placeId: null
    const nullPlaceIdCount = await collection.countDocuments({ placeId: null });
    console.log(`\n📊 Leads con placeId: null: ${nullPlaceIdCount}`);
    console.log('   (Ahora pueden coexistir sin problemas gracias al índice sparse)');

    console.log('\n✅ FIX COMPLETADO');
    console.log('\n💡 Ahora puedes importar leads de Instagram sin errores de duplicados');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Desconectado de MongoDB');
  }
}

fixPlaceIdIndex();
