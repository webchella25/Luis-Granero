// scripts/publish-project.js
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function publishProject() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
    
    // Actualizar TODOS los proyectos para añadir isPublished: true
    const result = await mongoose.connection.db.collection('projects').updateMany(
      {},
      { $set: { isPublished: true } }
    );
    
    console.log(`✅ ${result.modifiedCount} proyectos actualizados`);
    console.log('✅ Todos los proyectos ahora tienen isPublished: true');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

publishProject();