import { dbManager } from '../../lib/database.js'
import { formatNumber } from '../../lib/utils.js'

export default {
  command: 'pay',
  description: 'Paga coins a otro usuario',
  category: 'economia',
  async handler({ sock, message, args, chatId, sender }) {
    const userNumber = sender.split('@')[0]
    
    if (args.length < 2) {
      return sock.sendMessage(chatId, {
        text: 'ꕤ Uso: /pay @usuario [cantidad]\nEjemplo: /pay @usuario 500'
      })
    }

    const mentionedUsers = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
    if (!mentionedUsers || mentionedUsers.length === 0) {
      return sock.sendMessage(chatId, {
        text: 'ꕤ Debes mencionar al usuario al que quieres pagar'
      })
    }

    const targetUser = mentionedUsers[0]
    const targetNumber = targetUser.split('@')[0]
    const amount = parseInt(args[1])

    if (targetNumber === userNumber) {
      return sock.sendMessage(chatId, {
        text: 'ꕤ No puedes pagarte a ti mismo'
      })
    }

    if (isNaN(amount) || amount <= 0) {
      return sock.sendMessage(chatId, {
        text: 'ꕤ La cantidad debe ser un número positivo'
      })
    }

    if (amount > 1000000) {
      return sock.sendMessage(chatId, {
        text: 'ꕤ No puedes transferir más de 1,000,000 coins por vez'
      })
    }

    try {
      const sender_user = await dbManager.getUser(userNumber)
      const target_user = await dbManager.getUser(targetNumber)

      if (!sender_user) {
        return sock.sendMessage(chatId, {
          text: 'ꕤ No estás registrado. Usa */register nombre.edad* para registrarte'
        })
      }

      if (!target_user) {
        return sock.sendMessage(chatId, {
          text: `ꕤ @${targetNumber} no está registrado en el sistema`,
          mentions: [targetUser]
        })
      }

      if (sender_user.coins < amount) {
        return sock.sendMessage(chatId, {
          text: `ꕤ No tienes suficientes coins\n💰 Tu balance: ${formatNumber(sender_user.coins)} coins\n💸 Cantidad a pagar: ${formatNumber(amount)} coins`
        })
      }

      // Realizar la transferencia
      const success = await dbManager.transferCoins(userNumber, targetNumber, amount)
      
      if (!success) {
        return sock.sendMessage(chatId, {
          text: 'ꕤ Error al realizar la transferencia. Intenta de nuevo.'
        })
      }

      // Calcular impuesto del 5%
      const tax = Math.floor(amount * 0.05)
      const received = amount - tax

      // Aplicar impuesto
      await dbManager.removeCoins(targetNumber, tax)

      const paymentText = `💸 *PAGO REALIZADO*\n\n👤 *De:* @${userNumber}\n👤 *Para:* @${targetNumber}\n💰 *Cantidad enviada:* ${formatNumber(amount)} coins\n🏛️ *Impuesto (5%):* -${formatNumber(tax)} coins\n💎 *Cantidad recibida:* ${formatNumber(received)} coins\n\n✅ *Transferencia completada exitosamente*\n\n💰 *Nuevo balance de @${userNumber}:* ${formatNumber(sender_user.coins - amount)} coins\n💰 *Nuevo balance de @${targetNumber}:* ${formatNumber(target_user.coins + received)} coins`

      await sock.sendMessage(chatId, {
        text: paymentText,
        mentions: [sender, targetUser]
      })

      // Notificar al receptor (si es un chat privado diferente)
      try {
        if (!chatId.endsWith('@g.us')) {
          await sock.sendMessage(targetUser, {
            text: `ꕥ *PAGO RECIBIDO*\n\n👤 *De:* @${userNumber}\n💰 *Cantidad:* ${formatNumber(received)} coins\n💎 *Tu nuevo balance:* ${formatNumber(target_user.coins + received)} coins`,
            mentions: [sender]
          })
        }
      } catch (notifyError) {
        // No hacer nada si no se puede enviar la notificación
      }
    } catch (error) {
      console.error('Error en pay:', error)
      await sock.sendMessage(chatId, {
        text: 'ꕤ Error al procesar el pago'
      })
    }
  }
}