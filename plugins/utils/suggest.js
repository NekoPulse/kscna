export const command = 'suggest'
export const description = 'Sugiere una nueva funcionalidad'
export const category = 'utils'

export async function handler({ sock, message, args, chatId, sender }) {
  if (args.length < 1) {
    return sock.sendMessage(chatId, { 
      text: '❌ Uso: /suggest [tu sugerencia]\nEjemplo: /suggest Añadir un comando para crear memes' 
    })
  }

  const suggestionText = args.join(' ')
  const userNumber = sender.split('@')[0]
  const suggestionId = Date.now().toString().slice(-6)
  
  try {
    console.log(`💡 NUEVA SUGERENCIA #${suggestionId}`)
    console.log(`👤 Usuario: ${userNumber}`)
    console.log(`💬 Chat: ${chatId}`)
    console.log(`📝 Sugerencia: ${suggestionText}`)
    console.log(`⏰ Fecha: ${new Date().toLocaleString()}`)
    console.log('─'.repeat(50))

    const confirmationText = `💡 *SUGERENCIA ENVIADA*

🆔 *ID de sugerencia:* #${suggestionId}
👤 *Usuario:* @${userNumber}
📝 *Sugerencia:* ${suggestionText}
⏰ *Fecha:* ${new Date().toLocaleString()}

✅ Tu sugerencia ha sido enviada al equipo de desarrollo. Si es viable, la consideraremos para futuras actualizaciones.

💡 *Ideas que siempre son bienvenidas:*
• Nuevos comandos útiles
• Mejoras en comandos existentes
• Funciones de entretenimiento
• Herramientas de productividad
• Integraciones con nuevas APIs

🙏 ¡Gracias por ayudar a mejorar Osaka Bot!

📞 *Staff:* wa.me/3115424166`

    await sock.sendMessage(chatId, {
      text: confirmationText,
      mentions: [sender]
    })

    const ownerNumber = '3115424166@s.whatsapp.net'
    try {
      await sock.sendMessage(ownerNumber, {
        text: `💡 *NUEVA SUGERENCIA* #${suggestionId}

👤 *Usuario:* @${userNumber}
💬 *Chat:* ${chatId}
📝 *Sugerencia:* ${suggestionText}
⏰ *Fecha:* ${new Date().toLocaleString()}

🤔 Evalúa si es factible implementar esta funcionalidad.`,
        mentions: [sender]
      })
    } catch (ownerError) {
      console.log('No se pudo enviar notificación al owner:', ownerError.message)
    }
  } catch (error) {
    console.error('Error en suggest:', error)
    await sock.sendMessage(chatId, { 
      text: '❌ Error al enviar la sugerencia. Intenta de nuevo más tarde.' 
    })
  }
}