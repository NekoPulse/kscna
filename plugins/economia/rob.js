import { dbManager } from '../../lib/database.js'
import { formatNumber } from '../../lib/utils.js'

export default {
  command: 'rob',
  description: 'Intenta robar coins a otro usuario',
  category: 'economia',
  async handler({ sock, message, args, chatId, sender }) {
    const userNumber = sender.split('@')[0]
    
    if (args.length < 1) {
      return sock.sendMessage(chatId, {
        text: 'ꕤ Uso: */rob @usuario*\nEjemplo: /rob @usuario'
      })
    }

    const mentionedUsers = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
    if (!mentionedUsers || mentionedUsers.length === 0) {
      return sock.sendMessage(chatId, {
        text: 'ꕤ Debes mencionar al usuario que quieres robar'
      })
    }

    const targetUser = mentionedUsers[0]
    const targetNumber = targetUser.split('@')[0]

    if (targetNumber === userNumber) {
      return sock.sendMessage(chatId, {
        text: 'ꕤ No puedes robarte a ti mismo... aunque sería interesante 🤔'
      })
    }

    try {
      const robber = await dbManager.getUser(userNumber)
      const victim = await dbManager.getUser(targetNumber)

      if (!robber) {
        return sock.sendMessage(chatId, {
          text: 'ꕤ No estás registrado. Usa /register nombre.edad'
        })
      }

      if (!victim) {
        return sock.sendMessage(chatId, {
          text: `ꕤ @${targetNumber} no está registrado en el sistema`,
          mentions: [targetUser]
        })
      }

      // Cooldown de 6 horas para robar
      const now = Date.now()
      const lastRob = robber.lastRob || 0
      const cooldownTime = 6 * 60 * 60 * 1000 // 6 horas
      
      if (now - lastRob < cooldownTime) {
        const remaining = cooldownTime - (now - lastRob)
        const hours = Math.floor(remaining / (60 * 60 * 1000))
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
        
        return sock.sendMessage(chatId, {
          text: `⏰ Debes esperar ${hours}h ${minutes}m antes de robar de nuevo`
        })
      }

      // La víctima debe tener al menos 500 coins para ser robada
      if (victim.coins < 500) {
        return sock.sendMessage(chatId, {
          text: `ꕤ @${targetNumber} está muy pobre para robar (menos de 500 coins)`,
          mentions: [targetUser]
        })
      }

      // Probabilidad de éxito (70% base, modificado por nivel)
      const levelBonus = (robber.level - victim.level) * 5 // +/-5% por nivel de diferencia
      const successChance = Math.max(30, Math.min(85, 70 + levelBonus))
      const isSuccess = Math.random() * 100 < successChance

      // Actualizar último robo
      await dbManager.updateUser(userNumber, { lastRob: now })

      if (isSuccess) {
        // Robo exitoso: 10-25% de los coins de la víctima (max 50,000)
        const maxSteal = Math.min(victim.coins, 50000)
        const stealPercentage = 0.1 + (Math.random() * 0.15) // 10-25%
        const stolenAmount = Math.floor(maxSteal * stealPercentage)

        await dbManager.transferCoins(targetNumber, userNumber, stolenAmount)

        const successMessages = [
          `🥷 ¡Robo exitoso! Lograste robar ${formatNumber(stolenAmount)} coins`,
          `🎭 ¡Como un ninja! Robaste ${formatNumber(stolenAmount)} coins sin ser detectado`,
          `💰 ¡Éxito! Te llevaste ${formatNumber(stolenAmount)} coins de forma sigilosa`,
          `🗝️ ¡Perfecto! Conseguiste ${formatNumber(stolenAmount)} coins con tu habilidad`
        ]

        const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)]

        const robText = `${randomMessage}\n\n👤 *Ladrón:* @${userNumber}\n👤 *Víctima:* @${targetNumber}\n💰 *Cantidad robada:* ${formatNumber(stolenAmount)} coins\n📊 *Probabilidad:* ${successChance.toFixed(1)}%\n\n💰 *Tu nuevo balance:* ${formatNumber(robber.coins + stolenAmount)} coins\n💸 *Balance de la víctima:* ${formatNumber(victim.coins - stolenAmount)} coins\n\n💡 *Tip:* Usa /bank para proteger tus coins`

        await sock.sendMessage(chatId, {
          text: robText,
          mentions: [sender, targetUser]
        })
      } else {
        // Robo fallido: pierdes coins como multa
        const fine = Math.min(robber.coins, Math.floor(100 + Math.random() * 400)) // 100-500 coins
        
        if (fine > 0) {
          await dbManager.removeCoins(userNumber, fine)
        }

        const failMessages = [
          `🚨 ¡Te atraparon! Pagaste una multa de ${formatNumber(fine)} coins`,
          `👮‍♂️ ¡Fallaste! La policía te multó con ${formatNumber(fine)} coins`,
          `😅 ¡Te descubrieron! Perdiste ${formatNumber(fine)} coins como castigo`,
          `🚫 ¡Robo fallido! Tuviste que pagar ${formatNumber(fine)} coins de multa`
        ]

        const randomMessage = failMessages[Math.floor(Math.random() * failMessages.length)]

        const failText = `${randomMessage}\n\n👤 *Ladrón:* @${userNumber}\n👤 *Víctima:* @${targetNumber}\n💸 *Multa pagada:* ${formatNumber(fine)} coins\n📊 *Probabilidad era:* ${successChance.toFixed(1)}%\n\n💰 *Tu nuevo balance:* ${formatNumber(robber.coins - fine)} coins\n\n🛡️ *Consejo:* Sube de nivel para tener más probabilidad de éxito`

        await sock.sendMessage(chatId, {
          text: failText,
          mentions: [sender, targetUser]
        })
      }

    } catch (error) {
      console.error('Error en rob:', error)
      await sock.sendMessage(chatId, {
        text: 'ꕤ Error al intentar robar'
      })
    }
  }
}