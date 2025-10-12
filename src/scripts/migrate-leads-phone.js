// src/scripts/migrate-leads-phone.js - NUEVO ARCHIVO
import { config } from 'dotenv';
import mongoose from 'mongoose';

config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI no está definido');
  process.exit(1);
}

async function migrateLeads() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado');

    const Lead = mongoose.model('Lead', new mongoose.Schema({}, { strict: false }));

    // Buscar todos los leads que tienen phone pero no phoneNumbers
    const leadsToMigrate = await Lead.find({
      phone: { $exists: true, $ne: null, $ne: '' },
      $or: [
        { phoneNumbers: { $exists: false } },
        { phoneNumbers: { $size: 0 } }
      ]
    });

    console.log(`📊 Leads a migrar: ${leadsToMigrate.length}`);

    for (const lead of leadsToMigrate) {
      lead.phoneNumbers = [lead.phone];
      
      // Si no tiene location pero tiene address, copiar
      if (!lead.location && lead.address) {
        lead.location = lead.address;
      }
      
      await lead.save();
      console.log(`✅ Migrado: ${lead.name}`);
    }

    console.log(`\n🎉 Migración completada: ${leadsToMigrate.length} leads actualizados`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

migrateLeads();