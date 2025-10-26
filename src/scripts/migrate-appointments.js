// scripts/migrate-appointments.js
const mongoose = require('mongoose');
const path = require('path');

// ✅ Cargar .env desde la raíz del proyecto
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Verificar que existe MONGODB_URI
if (!process.env.MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI no está definida en .env');
  console.log('\n📝 Asegúrate de tener en tu .env:');
  console.log('MONGODB_URI=mongodb+srv://...');
  process.exit(1);
}

// Esquema simplificado de Appointment (solo para migración)
const AppointmentSchema = new mongoose.Schema({
  leadId: mongoose.Schema.Types.ObjectId,
  token: String,
  name: String,
  phone: String,
  email: String,
  scheduledDate: Date,
  scheduledTime: String,
  status: String,
  notes: String,
  callNotes: String,
  duration: {
    planned: Number,
    actual: Number,
    startedAt: Date,
    endedAt: Date
  },
  callResult: {
    converted: Boolean,
    interest: String,
    nextSteps: String,
    budgetDiscussed: String,
    closingProbability: Number
  },
  remindersSent: [{
    type: String,
    sentAt: Date,
    opened: Boolean,
    openedAt: Date
  }],
  tokenExpiresAt: Date,
  source: String,
  cancellationReason: String,
  cancellationNotes: String
}, { timestamps: true });

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', AppointmentSchema);

async function migrateAppointments() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');
    
    // Contar citas existentes
    const totalAppointments = await Appointment.countDocuments();
    console.log(`📊 Total de citas en la base de datos: ${totalAppointments}`);
    
    if (totalAppointments === 0) {
      console.log('\n⚠️  No hay citas para migrar.');
      console.log('   La migración se ejecutará automáticamente cuando crees nuevas citas.\n');
      process.exit(0);
    }
    
    // Encontrar citas sin los campos nuevos
    const appointmentsToMigrate = await Appointment.find({
      $or: [
        { callNotes: { $exists: false } },
        { duration: { $exists: false } },
        { callResult: { $exists: false } },
        { remindersSent: { $exists: false } }
      ]
    });
    
    console.log(`🔄 Citas que necesitan migración: ${appointmentsToMigrate.length}\n`);
    
    if (appointmentsToMigrate.length === 0) {
      console.log('✅ Todas las citas ya tienen los campos nuevos.\n');
      process.exit(0);
    }
    
    console.log('⏳ Migrando citas...');
    
    // Migrar cada cita
    let migrated = 0;
    let errors = 0;
    
    for (const appointment of appointmentsToMigrate) {
      try {
        const updates = {};
        
        // Añadir callNotes si no existe
        if (!appointment.callNotes) {
          updates.callNotes = '';
        }
        
        // Añadir duration si no existe
        if (!appointment.duration) {
          updates.duration = {
            planned: 30,
            actual: null,
            startedAt: null,
            endedAt: null
          };
        }
        
        // Añadir callResult si no existe
        if (!appointment.callResult) {
          updates.callResult = {
            converted: null,
            interest: null,
            nextSteps: '',
            budgetDiscussed: '',
            closingProbability: null
          };
        }
        
        // Añadir remindersSent si no existe
        if (!appointment.remindersSent) {
          updates.remindersSent = [];
        }
        
        // Añadir source si no existe
        if (!appointment.source) {
          updates.source = 'manual';
        }
        
        // Actualizar la cita
        await Appointment.findByIdAndUpdate(appointment._id, { $set: updates });
        
        migrated++;
        
        if (migrated % 10 === 0) {
          console.log(`   ✓ ${migrated}/${appointmentsToMigrate.length} citas migradas...`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error migrando cita ${appointment._id}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 RESULTADO DE LA MIGRACIÓN:');
    console.log(`   ✅ Migradas exitosamente: ${migrated}`);
    console.log(`   ❌ Errores: ${errors}`);
    console.log(`   📈 Total procesadas: ${appointmentsToMigrate.length}\n`);
    
    // Verificar que la migración fue exitosa
    const remainingToMigrate = await Appointment.find({
      $or: [
        { callNotes: { $exists: false } },
        { duration: { $exists: false } },
        { callResult: { $exists: false } }
      ]
    });
    
    if (remainingToMigrate.length === 0) {
      console.log('🎉 ¡Migración completada exitosamente!');
      console.log('   Todas las citas ahora tienen los campos nuevos.\n');
    } else {
      console.log(`⚠️  Aún quedan ${remainingToMigrate.length} citas sin migrar.`);
      console.log('   Ejecuta el script nuevamente.\n');
    }
    
    // Mostrar ejemplo de una cita migrada
    const sampleAppointment = await Appointment.findOne({ callNotes: { $exists: true } });
    if (sampleAppointment) {
      console.log('📋 Ejemplo de cita migrada:');
      console.log(`   ID: ${sampleAppointment._id}`);
      console.log(`   Nombre: ${sampleAppointment.name}`);
      console.log(`   Tiene callNotes: ${sampleAppointment.callNotes !== undefined ? '✅' : '❌'}`);
      console.log(`   Tiene duration: ${sampleAppointment.duration !== undefined ? '✅' : '❌'}`);
      console.log(`   Tiene callResult: ${sampleAppointment.callResult !== undefined ? '✅' : '❌'}`);
      console.log(`   Tiene remindersSent: ${sampleAppointment.remindersSent !== undefined ? '✅' : '❌'}`);
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
    process.exit(0);
  }
}

// Ejecutar migración
console.log('🚀 Iniciando migración de appointments...\n');
migrateAppointments();