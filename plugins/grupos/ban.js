import { isGroupAdmin, createChannelButton } from '../../lib/handler.js'

export default {
  command: 'ban',
  description: 'Banea a un usuario del grupo',
  category: 'grupos',
  async handler({ sock, message, args, chatId, sender, isGroup, botNumber }) {
    if (!isGroup) return

    try {
      const groupMetadata = await sock.groupMetadata(chatId)
      const participants = groupMetadata.participants
      
      const isBotAdmin = isGroupAdmin(participants, botNumber)
      if (!isBotAdmin) {
        return sock.sendMessage(chatId, createChannelButton(
          "૮₍˃̵֊ ˂̵ ₎ა Lo siento, no soy administrador en este grupo."
        ))
      }

      const isUserAdmin = isGroupAdmin(participants, sender)
      if (!isUserAdmin) {
        return sock.sendMessage(chatId, { 
          text: 'ꕤ Solo los administradores pueden usar este comando'
        })
      }

      const mentionedUsers = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
      if (!mentionedUsers || mentionedUsers.length === 0) {
        return sock.sendMessage(chatId, { 
          text: 'ꕤ Debes mencionar a un usuario para banearlo\nEjemplo: /ban @usuario'
        })
      }

      const userToBan = mentionedUsers[0]
      
      if (isGroupAdmin(participants, userToBan)) {
        return sock.sendMessage(chatId, { 
          text: 'ꕤ No puedo banear a un administrador'
        })
      }

      await sock.groupParticipantsUpdate(chatId, [userToBan], 'remove')
      
      await sock.sendMessage(chatial, { 
        text: `🔨 Usuario @${userToBan.split('@')[0]} ha sido baneado del grupo`,
        mentions: [userToBan]
      })
    } catch (error) {
      console.error('Error en ban:', error)
      await sock.sendMessage(chatial, { 
        text: 'ꕤ Error al banear usuario'
      })
    }
  }
}