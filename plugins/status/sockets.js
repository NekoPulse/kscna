export const command = 'sockets'
export const description = 'Muestra información sobre las conexiones WebSocket'
export const category = 'status'

export async function handler({ sock, message, args, chatId }) {
  try {
    const socketInfo = `🔌 *INFORMACIÓN DE SOCKETS*

⚠️ *Aviso:* Esta función no está disponible por el momento en el sistema de sockets.

📡 *Estado de Conexión:*
• WebSocket: ✅ Conectado
• Estado: ${sock.ws?.readyState === 1 ? 'Activo' : 'Inactivo'}
• Protocolo: WhatsApp WebSocket

🔄 *Próximamente se añadirá más información detallada sobre:*
• Número de sockets activos
• Latencia de conexión  
• Estadísticas de mensajes
• Estado de reconexiones automáticas

💡 *Nota:* Para obtener información básica del sistema, usa /status`

    await sock.sendMessage(chatId, {
      text: socketInfo
    })
  } catch (error) {
    console.error('Error en sockets:', error)
    await sock.sendMessage(chatId, { 
      text: '❌ Error al obtener información de sockets' 
    })
  }
}