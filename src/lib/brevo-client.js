// src/lib/brevo-client.js
export async function addContactToBrevoList(email, name, listId) {
  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.toLowerCase(),
        attributes: {
          FIRSTNAME: name
        },
        listIds: [parseInt(listId)],
        updateEnabled: true
      })
    })

    if (response.ok) {
      console.log(`✅ Contacto ${email} añadido a Brevo`)
      return { success: true }
    } else {
      const error = await response.json()
      console.error('❌ Error Brevo:', error)
      
      // Si el contacto ya existe, no es un error fatal
      if (error.code === 'duplicate_parameter') {
        return { success: true, message: 'Contacto ya existe' }
      }
      
      return { success: false, error: error.message }
    }
  } catch (error) {
    console.error('❌ Error conectando con Brevo:', error)
    return { success: false, error: error.message }
  }
}