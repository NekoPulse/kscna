import { dbManager } from '../../lib/database.js'
import { formatNumber } from '../../lib/utils.js'

function getTimeRemaining(lastUsed, cooldownHours) {
  const now = Date.now()
  const cooldownMs = cooldownHours * 60 * 60 * 1000
  const elapsed = now - lastUsed
  
  if (elapsed >= cooldownMs) {
    return 'Disponible'
  }
  
  const remaining = cooldownMs - elapsed
  const hours = Math.floor(remaining / (60 * 60 * 1000))
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

export default {
  command: 'balance',
  aliases: ['bal'],
  description: 'Muestra tu balance económico',
  category: 'economia',
  async handler({ sock, message, args, chatId, sender }) {
    const userNumber = sender.split('@')[0]
    
    try {
      let targetUser = userNumber
      let targetSender = sender
      
      // Verificar si se mencionó a otro usuario
      const mentionedUsers = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
      if (mentionedUsers && mentionedUsers.length > 0) {
        targetSender = mentionedUsers[0]
        targetUser = targetSender.split('@')[0]
      }
      
      const user = await dbManager.getUser(targetUser)
      
      if (!user) {
        const isOwnBalance = targetUser === userNumber
        return sock.sendMessage(chatId, {
          text: isOwnBalance 
            ? 'ꕤ No estás registrado. Usa */register nombre.edad* para registrarte'
            : `ꕤ @${targetUser} no está registrado en el sistema`,
          mentions: isOwnBalance ? [] : [targetSender]
        })
      }

      const registeredDate = new Date(user.registeredAt).toLocaleDateString()
      const totalWealth = user.coins + user.bank
      
      // Calcular rango basado en el total de riqueza
      let rank = '🥉 Bronce'
      if (totalWealth >= 1000000) rank = '👑 Leyenda'
      else if (totalWealth >= 500000) rank = '💎 Diamante'
      else if (totalWealth >= 250000) rank = '🏆 Platino'
      else if (totalWealth >= 100000) rank = '🥇 Oro'
      else if (totalWealth >= 50000) rank = '🥈 Plata'

      const isOwnBalance = targetUser === userNumber
      const userName = isOwnBalance ? 'Tu' : `${user.name}'s`
      const userMention = isOwnBalance ? '' : `\n👤 *Usuario:* @${targetUser}`

      const balanceText = `💰 *${userName.toUpperCase()} BALANCE ECONÓMICO*${userMention}

👤 *Nombre:* ${user.name}
🎂 *Edad:* ${user.age} años
📅 *Registrado:* ${registeredDate}

💎 **FINANZAS:**
💰 *Efectivo:* ${formatNumber(user.coins)} coins
🏦 *Banco:* ${formatNumber(user.bank)} coins
💎 *Patrimonio total:* ${formatNumber(totalWealth)} coins

📊 **ESTADÍSTICAS:**
📈 *Nivel:* ${user.level}
🔮 *EXP:* ${user.exp || 0}/1000
🏅 *Rango:* ${rank}

⏰ **COOLDOWNS:**
💼 *Trabajo:* ${user.lastWork ? getTimeRemaining(user.lastWork, 4) : 'Disponible'}
🎁 *Daily:* ${user.lastDaily ? getTimeRemaining(user.lastDaily, 24) : 'Disponible'}
📦 *Weekly:* ${user.lastWeekly ? getTimeRemaining(user.lastWeekly, 168) : 'Disponible'}
📅 *Monthly:* ${user.lastMonthly ? getTimeRemaining(user.lastMonthly, 720) : 'Disponible'}`

      if (Object.keys(user.items || {}).length > 0) {
        let itemsText = '\n\n🎒 **INVENTARIO:**'
        for (const [item, quantity] of Object.entries(user.items)) {
          itemsText += `\n• ${item}: ${quantity}`
        }
        balanceText += itemsText
      }

      await sock.sendMessage(chatId, {
        text: balanceText + '\n\n💡 *Tip:* Usa /bank para guardar tus coins y evitar robos',
        mentions: isOwnBalance ? [] : [targetSender]
      })
    } catch (error) {
      console.error('Error en balance:', error)
      await sock.sendMessage(chatId, { 
        text: 'ꕤ Error al obtener el balance' 
      })
    }
  }
}