// scripts/migrate-studio-multicanal.ts
// Run: npx ts-node --project tsconfig.json scripts/migrate-studio-multicanal.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SYSTEM_PROMPT_ALMAS_CORRUPTAS = `Eres un guionista experto en contenido de divulgación histórica para YouTube.
Escribes guiones para vídeos faceless narrados en voz en off, en español de España.

Reglas de escritura:
- Español de España (vosotros, castellano peninsular estándar)
- Sin emojis, sin asteriscos de markdown
- Frases cortas y contundentes, ritmo ágil
- Optimizado para ser narrado en voz en off (nada de "a continuación veremos" o lenguaje de texto)
- Tiempo verbal: pasado preferentemente, presente histórico para dramatismo
- Nunca uses "En conclusión" ni "Para finalizar"
- Cada sección debe fluir naturalmente hacia la siguiente
- Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes ni después

Formato de respuesta obligatorio:
{
  "sections": [
    { "title": "título de la sección", "content": "texto completo de la sección" },
    ...
  ]
}`;

const SYSTEM_PROMPT_SABORES_SALUDABLES = `Eres un experto en nutrición y cocina saludable.
Generas guiones para vídeos de YouTube sobre recetas sanas,
consejos nutricionales y alimentación equilibrada. El tono es
cercano, motivador y accesible. Los guiones están en español
de España, sin tecnicismos innecesarios.`;

async function main() {
  const mongoUri = process.env.MONGODB_URI;
  const studioPassword = process.env.STUDIO_PASSWORD;

  if (!mongoUri) {
    console.error('ERROR: MONGODB_URI is not set');
    process.exit(1);
  }

  if (!studioPassword) {
    console.error('ERROR: STUDIO_PASSWORD is not set');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri);
  console.log('Connected.');

  const db = mongoose.connection.db!;

  // ── Step 1: Idempotency check ──────────────────────────────────────────────
  const existingWorkspace = await db
    .collection('studioworkspaces')
    .findOne({ nombre: 'Luis Granero' });

  if (existingWorkspace) {
    console.warn('WARNING: Workspace "Luis Granero" already exists. Migration already applied. Exiting.');
    await mongoose.disconnect();
    process.exit(0);
  }

  // ── Step 2: Create workspace ───────────────────────────────────────────────
  console.log('Creating workspace "Luis Granero"...');
  const passwordHash = await bcrypt.hash(studioPassword, 12);

  const workspaceResult = await db.collection('studioworkspaces').insertOne({
    nombre: 'Luis Granero',
    password_hash: passwordHash,
    activo: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const workspaceId = workspaceResult.insertedId;
  console.log(`  Workspace created: ${workspaceId}`);

  // ── Step 3: Read existing YouTube tokens from studioconfigs ───────────────
  console.log('Reading existing YouTube tokens from studioconfigs...');
  const youtubeConfig = await db
    .collection('studioconfigs')
    .findOne({ key: 'youtube_oauth' });

  const youtubeTokens = youtubeConfig?.value ?? null;
  if (youtubeTokens) {
    console.log('  Found existing YouTube OAuth tokens — will migrate to Almas Corruptas.');
  } else {
    console.log('  No existing YouTube tokens found.');
  }

  // ── Step 4: Read TTS config ────────────────────────────────────────────────
  console.log('Reading TTS config from studioconfigs...');
  const ttsConfigDoc = await db
    .collection('studioconfigs')
    .findOne({ key: 'tts_config' });
  const ttsConfig = ttsConfigDoc?.value ?? null;
  if (ttsConfig) {
    console.log('  Found TTS config — will migrate to Almas Corruptas canal.');
  }

  // ── Step 5: Read image engine config ──────────────────────────────────────
  console.log('Reading image_engine_config from studioconfigs...');
  const imageEngineConfigDoc = await db
    .collection('studioconfigs')
    .findOne({ key: 'image_engine_config' });
  const imageEngineConfig = imageEngineConfigDoc?.value ?? null;
  if (imageEngineConfig) {
    console.log('  Found image_engine_config — will migrate to Almas Corruptas canal.');
  }

  // ── Step 6: Create canal "Almas Corruptas" ────────────────────────────────
  console.log('Creating canal "Almas Corruptas"...');
  const almasCorruptasDoc: Record<string, unknown> = {
    workspace_id: workspaceId,
    nombre: 'Almas Corruptas',
    nicho: 'true crime',
    tono: 'dramatico, historico, divulgativo',
    system_prompt: SYSTEM_PROMPT_ALMAS_CORRUPTAS,
    activo: true,
    config: {} as Record<string, unknown>,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const config = almasCorruptasDoc.config as Record<string, unknown>;

  if (youtubeTokens) {
    config.youtube_tokens = youtubeTokens;
  }
  if (ttsConfig) {
    config.voz_motor = ttsConfig;
  }
  if (imageEngineConfig) {
    config.imagen_motor = imageEngineConfig;
  }

  const almasResult = await db.collection('studiocanals').insertOne(almasCorruptasDoc);
  const almasCanalId = almasResult.insertedId;
  console.log(`  Canal "Almas Corruptas" created: ${almasCanalId}`);

  // ── Step 7: Create canal "Sabores Saludables" ─────────────────────────────
  console.log('Creating canal "Sabores Saludables"...');
  const saboresResult = await db.collection('studiocanals').insertOne({
    workspace_id: workspaceId,
    nombre: 'Sabores Saludables',
    nicho: 'nutricion y cocina saludable',
    tono: 'cercano, motivador, accesible',
    system_prompt: SYSTEM_PROMPT_SABORES_SALUDABLES,
    activo: true,
    config: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  console.log(`  Canal "Sabores Saludables" created: ${saboresResult.insertedId}`);

  // ── Step 8: Update existing docs without canal_id ─────────────────────────
  const collectionsToMigrate = [
    'studioscripts',
    'studiocalendarios',
    'studiocartels',
    'studiofondos',
  ];

  for (const collName of collectionsToMigrate) {
    console.log(`Updating ${collName} (adding canal_id where missing)...`);
    const result = await db.collection(collName).updateMany(
      { canal_id: { $exists: false } },
      {
        $set: {
          canal_id: almasCanalId,
          updatedAt: new Date(),
        },
      }
    );
    console.log(`  ${result.modifiedCount} document(s) updated in ${collName}.`);
  }

  // ── Step 9: Update studiodjs without workspace_id ─────────────────────────
  console.log('Updating studiodjs (adding workspace_id where missing)...');
  const djsResult = await db.collection('studiodjs').updateMany(
    { workspace_id: { $exists: false } },
    {
      $set: {
        workspace_id: workspaceId,
        updatedAt: new Date(),
      },
    }
  );
  console.log(`  ${djsResult.modifiedCount} document(s) updated in studiodjs.`);

  // ── Done ───────────────────────────────────────────────────────────────────
  console.log('\nMigration completed successfully.');
  console.log(`  Workspace ID : ${workspaceId}`);
  console.log(`  Canal "Almas Corruptas" ID : ${almasCanalId}`);
  console.log(`  Canal "Sabores Saludables" ID : ${saboresResult.insertedId}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('Migration failed:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
