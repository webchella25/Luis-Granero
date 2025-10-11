// scripts/test-cron.js - NUEVO ARCHIVO (OPCIONAL)
async function testCron() {
  const res = await fetch('http://localhost:3000/api/cron/send-scheduled-emails', {
    headers: {
      'Authorization': `Bearer ${process.env.CRON_SECRET}`
    }
  });
  
  const data = await res.json();
  console.log('📧 Resultado del cron:', data);
}

testCron();