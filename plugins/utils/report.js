export const command = 'report'
export const description = 'Reporta un error al staff'
export const category = 'utils'

export async function handler({ sock, message, args, chatId, sender }) {
  if (args.length < 1) {
    return sock.sendMessage(chatId, { 
      text: '❌ Uso: /report _[descripción del error]_\nEjemplo: /report El comando /ping no funciona correctamente' 
    })
  }

  const reportText = args.join(' ')
  const userNumber = sender.split('@')[0]
  const reportId = Date.now().toString().slice(-6)
  
  try {
    console.log(`📋 NUEVO REPORTE #${reportId}`)
    console.log(`👤 Usuario: ${userNumber}`)
    console.log(`💬 Chat: ${chatId}`)
    console.log(`📝 Descripción: ${reportText}`)
    console.log(`⏰ Fecha: ${new Date().toLocaleString()}`)
    console.log('─'.repeat(50))

    const confirmationText = `📋 *REPORTE ENVIADO*

🆔 *ID del reporte:* #${reportId}
👤 *Usuario:* @${userNumber}
📝 *Descripción:* ${reportText}
⏰ *Fecha:* ${new Date().toLocaleString()}

✅ Tu reporte ha sido enviado al equipo de desarrollo. Nos pondremos en contacto contigo si necesitamos más información.

💡 *Consejos para futuros reportes:*
• Describe el problema claramente
• Menciona qué comando no funciona
• Incluye el mensaje de error si aparece
• Indica en qué situación ocurrió

📞 *Staff:* wa.me/3115424166`

    await sock.sendMessage(chatId, {
      text: confirmationText,
      mentions: [sender]
    })

    const ownerNumber = '3115424166@s.whatsapp.net'
    try {
      await sock.sendMessage(ownerNumber, {
        text: `🚨 *NUEVO REPORTE* #${reportId}

👤 *Usuario:* @${userNumber}
💬 *Chat:* ${chatId}
📝 *Descripción:* ${reportText}
⏰ *Fecha:* ${new Date().toLocaleString()}

🔧 Revisa y responde al usuario si es necesario.`,
        mentions: [sender]
      })
    } catch (ownerError) {
      console.log('No se pudo enviar notificación al owner:', ownerError.message)
    }
  } catch (error) {
    console.error('Error en report:', error)
    await sock.sendMessage(chatId, { 
      text: '❌ Error al enviar el reporte. Intenta de nuevo más tarde.' 
    })
  }
}