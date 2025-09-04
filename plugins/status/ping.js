export const command = 'ping'
export const aliases = ['p']
export const description = 'Muestra la latencia del bot'
export const category = 'status'

export async function handler({ sock, message, args, chatId }) {
  const start = Date.now()
  
  const sent = await sock.sendMessage(chatId, { text: '🏓 Calculando latencia...' })
  const end = Date.now()
  
  const latencia = end - start
  let emoji = '🟢'
  let status = 'Excelente'
  
  if (latencia > 1000) {
    emoji = '🔴'
    status = 'Lenta'
  } else if (latencia > 500) {
    emoji = '🟡'
    status = 'Regular'
  }

  await sock.sendMessage(chatId, { 
    text: `${emoji} *Pong!*\n⏱️ Latencia: ${latencia}ms\n📶 Estado: ${status}`,
    edit: sent.key 
  })
}