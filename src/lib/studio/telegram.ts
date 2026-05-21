const TELEGRAM_API = 'https://api.telegram.org';

export async function sendTelegramAlert(mensaje: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  await callTelegramAPI(token, chatId, mensaje);
}

export async function sendTelegramAlertForCanal(
  mensaje: string,
  botToken?: string,
  chatId?: string
): Promise<void> {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  const chat = chatId || process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  await callTelegramAPI(token, chat, mensaje);
}

async function callTelegramAPI(token: string, chatId: string, mensaje: string): Promise<void> {
  try {
    await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: mensaje, parse_mode: 'HTML' }),
    });
  } catch (err) {
    console.error('[telegram] Error enviando mensaje:', err);
  }
}
