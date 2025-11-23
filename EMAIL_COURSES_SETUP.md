# Email Courses - Setup de Automatización

Sistema de cursos por email con envío automático diario usando Brevo.

## 🚀 Arquitectura

### Componentes

1. **Modelos de Base de Datos**
   - `EmailCourse`: Cursos con emails día a día
   - `Subscriber`: Suscriptores con tracking de emails enviados

2. **APIs Públicas**
   - `GET /api/public/email-courses` - Lista de cursos activos
   - `GET /api/public/email-courses/[slug]` - Detalles de un curso
   - `POST /api/subscribe/[courseSlug]` - Suscripción + envío inmediato del email día 1

3. **APIs de Automatización**
   - `GET/POST /api/cron/send-email-courses` - Envío de emails días 2-5
   - `GET /api/unsubscribe/[token]` - Consultar datos de suscriptor
   - `POST /api/unsubscribe/[token]` - Darse de baja

4. **Páginas Frontend**
   - `/cursos` - Listado de todos los cursos
   - `/cursos/[slug]` - Landing page del curso con formulario
   - `/unsubscribe/[token]` - Página de cancelación

## 📧 Flujo de Emails

### 1. Suscripción (Inmediato)
Cuando un usuario se suscribe:
- Se crea registro en `Subscriber`
- Se genera `unsubscribeToken` único
- **Se envía Email Día 1 inmediatamente**
- Se actualiza `currentDay = 1` y `emailsSent.day1.sent = true`

### 2. Emails Días 2-5 (Cron Diario)
El endpoint `/api/cron/send-email-courses` ejecuta cada día:

```javascript
// Busca suscriptores activos con currentDay < 5
const subscribers = await Subscriber.find({
  status: 'active',
  currentDay: { $lt: 5 }
})

// Para cada suscriptor:
// 1. Verificar que han pasado 24h desde último email
// 2. Enviar email del día siguiente
// 3. Actualizar tracking y currentDay
// 4. Si completa día 5, marcar status = 'completed'
```

## ⚙️ Configuración del Cron Job (cron-job.org)

Vercel Free Tier no soporta cron nativo, usamos cron-job.org como trigger externo.

### Paso 1: Crear Cuenta en cron-job.org
1. Ir a https://cron-job.org
2. Crear cuenta gratuita
3. Verificar email

### Paso 2: Crear Cron Job

**Configuración:**
```
Title: Email Courses - Daily Sender
URL: https://luisgranero.com/api/cron/send-email-courses
Schedule: Every day at 09:00 (UTC)
```

**Headers (MUY IMPORTANTE):**
```
Authorization: Bearer TU_CRON_SECRET
```

**Configuración Avanzada:**
- Request method: `GET`
- Request timeout: 120 segundos
- Save responses: ✅ (para debugging)
- Notification email: tu-email@ejemplo.com (para alertas de fallos)

### Paso 3: Variables de Entorno

Asegúrate de tener configuradas en Vercel:

```bash
# Brevo SMTP
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=tu-email@brevo.com
SMTP_PASSWORD=tu-smtp-password
EMAIL_FROM_NAME=Luis Granero

# Seguridad
CRON_SECRET=token-aleatorio-super-seguro-minimo-32-caracteres

# Base URL
NEXTAUTH_URL=https://luisgranero.com
```

Para generar `CRON_SECRET` seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🧪 Testing

### 1. Test Manual del Endpoint

```bash
# Desde tu terminal local
curl -X GET \
  https://luisgranero.com/api/cron/send-email-courses \
  -H "Authorization: Bearer TU_CRON_SECRET"
```

Respuesta esperada:
```json
{
  "success": true,
  "summary": {
    "total": 10,
    "sent": 8,
    "failed": 0,
    "skipped": 2
  },
  "results": [
    {
      "email": "usuario@ejemplo.com",
      "name": "Juan",
      "course": "React en 5 días",
      "day": 2,
      "status": "sent"
    }
  ]
}
```

### 2. Test de Suscripción

```bash
# Suscribirse a un curso
curl -X POST \
  https://luisgranero.com/api/subscribe/react-5-dias \
  -H "Content-Type: application/json" \
  -d '{"email":"test@ejemplo.com","name":"Test User"}'
```

Deberías recibir el email día 1 inmediatamente.

### 3. Verificar en MongoDB

```javascript
// Verificar suscriptor
db.subscribers.findOne({ email: "test@ejemplo.com" })

// Ver todos los emails pendientes
db.subscribers.find({
  status: 'active',
  currentDay: { $lt: 5 }
})
```

## 📊 Monitoreo

### Logs en Vercel

```bash
# Ver logs en tiempo real
vercel logs --follow

# Filtrar por función
vercel logs --follow api/cron/send-email-courses
```

### Métricas a Monitorear

1. **Tasa de envío**: `sent / total` debe ser > 95%
2. **Tasa de cancelación**: Revisar `stats.unsubscribeRate` en cada curso
3. **Tasa de completación**: `completedSubscribers / totalSubscribers`

### Dashboard en MongoDB

```javascript
// Estadísticas generales
db.emailcourses.aggregate([
  {
    $project: {
      title: 1,
      'stats.totalSubscribers': 1,
      'stats.activeSubscribers': 1,
      'stats.completedSubscribers': 1,
      completionRate: {
        $multiply: [
          { $divide: ['$stats.completedSubscribers', '$stats.totalSubscribers'] },
          100
        ]
      }
    }
  }
])
```

## 🔧 Troubleshooting

### Email no se envía

1. Verificar credenciales Brevo en variables de entorno
2. Revisar logs: `vercel logs api/cron/send-email-courses`
3. Verificar que el curso tiene content para ese día:
   ```javascript
   const course = await EmailCourse.findOne({ slug: 'react-5-dias' })
   console.log(course.emails) // Debe tener días 1-5
   ```

### Cron no se ejecuta

1. Verificar que cron-job.org está activo
2. Revisar que el header `Authorization` es correcto
3. Verificar que `CRON_SECRET` en Vercel coincide con el usado en cron-job.org
4. Revisar historial de ejecuciones en cron-job.org

### Emails duplicados

1. Verificar que `emailsSent.dayX.sent` está siendo actualizado correctamente
2. Revisar que el cron no se ejecuta más de una vez al día
3. Comprobar timestamps en `emailsSent.dayX.sentAt`

### Rate Limits de Brevo

Plan gratuito de Brevo: 300 emails/día

Si superas el límite:
1. Upgrade a plan de pago
2. O limitar el número de suscriptores procesados por día:
   ```javascript
   const subscribers = await Subscriber.find({...}).limit(50)
   ```

## 📈 Escalabilidad

### Optimizaciones Futuras

1. **Queue System**: Usar Vercel Queue o Bull para manejar grandes volúmenes
2. **Batch Processing**: Enviar emails en lotes de 50
3. **Retry Logic**: Reintentar emails fallidos con backoff exponencial
4. **Warmup**: Pre-cargar cursos en memoria para reducir queries
5. **Analytics**: Tracking de opens/clicks con pixel tracking

### Métricas de Performance

Objetivo por ejecución del cron:
- Duración total: < 60 segundos
- Emails procesados: ~100/min
- Tasa de error: < 1%

## 🎯 Próximos Pasos

1. ✅ Sistema de envío automático
2. ⏳ Panel de admin para gestionar cursos
3. ⏳ Analytics de opens/clicks
4. ⏳ A/B testing de subject lines
5. ⏳ Segmentación de suscriptores
6. ⏳ Integración con Brevo Lists (alternativa a MongoDB)

## 📝 Variables de Template

Los emails pueden usar estas variables:

- `{{name}}` - Nombre del suscriptor
- `{{email}}` - Email del suscriptor
- `{{unsubscribe_url}}` - Link para darse de baja

Ejemplo:
```html
<h1>Hola {{name}},</h1>
<p>Bienvenido al día 1 del curso.</p>
<p><a href="{{unsubscribe_url}}">Darse de baja</a></p>
```

## 🔐 Seguridad

1. **CRON_SECRET**: Mínimo 32 caracteres aleatorios
2. **Unsubscribe Token**: Generado con crypto.randomBytes(32)
3. **Rate Limiting**: Implementar en el futuro para proteger endpoints públicos
4. **Input Validation**: Emails y nombres son validados
5. **HTTPS Only**: Todos los endpoints requieren HTTPS

---

**Documentación actualizada**: 2024
**Versión**: 1.0.0
