// scripts/check-cloudinary.js
// Script para verificar que Cloudinary está bien configurado

console.log('\n🔍 === VERIFICANDO CONFIGURACIÓN DE CLOUDINARY ===\n')

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

console.log('📋 Variables de entorno:')
console.log('  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:', cloudName || '❌ NO CONFIGURADO')
console.log('  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:', uploadPreset || '❌ NO CONFIGURADO')

if (!cloudName) {
  console.log('\n❌ ERROR: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME no está configurado')
  console.log('\n📝 Para configurarlo:')
  console.log('1. Crea o edita el archivo .env.local en la raíz del proyecto')
  console.log('2. Añade esta línea:')
  console.log('   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name')
  console.log('\n💡 Obtén tu Cloud Name en: https://cloudinary.com/console')
  process.exit(1)
}

if (!uploadPreset) {
  console.log('\n❌ ERROR: NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET no está configurado')
  console.log('\n📝 Para configurarlo:')
  console.log('1. Ve a https://cloudinary.com/console')
  console.log('2. Settings > Upload > Upload presets')
  console.log('3. Crea un preset con "Signing Mode: Unsigned"')
  console.log('4. Añade en .env.local:')
  console.log('   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=nombre_del_preset')
  process.exit(1)
}

console.log('\n✅ Variables de entorno configuradas correctamente')
console.log('\n🧪 Probando conexión con Cloudinary...')

// Test de conexión
const testUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
console.log('🌐 URL de upload:', testUrl)

// Crear un test con una imagen muy pequeña (1x1 pixel PNG transparente)
const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

async function testUpload() {
  try {
    const blob = await fetch(testImageBase64).then(r => r.blob())
    const formData = new FormData()
    formData.append('file', blob, 'test.png')
    formData.append('upload_preset', uploadPreset)
    formData.append('folder', 'luisgranero-portfolio/test')

    const response = await fetch(testUrl, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.log('\n❌ Error en el test de upload:')
      console.log('   Status:', response.status, response.statusText)
      console.log('   Error:', JSON.stringify(errorData, null, 2))
      
      if (response.status === 401) {
        console.log('\n💡 Posibles causas:')
        console.log('   - El Cloud Name es incorrecto')
        console.log('   - El Upload Preset no existe')
      }
      
      if (response.status === 400) {
        console.log('\n💡 Posibles causas:')
        console.log('   - El Upload Preset no está configurado como "Unsigned"')
        console.log('   - El preset no permite uploads públicos')
        console.log('\n📝 Cómo arreglarlo:')
        console.log('1. Ve a https://cloudinary.com/console')
        console.log('2. Settings > Upload > Upload presets')
        console.log('3. Busca tu preset:', uploadPreset)
        console.log('4. Verifica que "Signing Mode" esté en "Unsigned"')
        console.log('5. Si no existe, créalo con esa configuración')
      }
      
      process.exit(1)
    }

    const data = await response.json()
    console.log('\n✅ ¡Test exitoso! Cloudinary está funcionando correctamente')
    console.log('   Imagen de prueba subida:', data.secure_url)
    console.log('\n🎉 Todo está listo para subir imágenes desde el admin panel')
    
  } catch (err) {
    console.log('\n❌ Error de red:', err.message)
    console.log('\n💡 Verifica tu conexión a internet')
  }
}

testUpload()