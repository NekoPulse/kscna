import { isGroupAdmin, createChannelButton } from '../../lib/handler.js'

export default {
  command: 'demote',
  description: 'Degrada a un administrador a usuario normal',
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
          text: 'ꕤ Debes mencionar a un usuario para degradarlo\nEjemplo: /demote @usuario'
        })
      }

      const userToDemote = mentionedUsers[0]
      
      if (!isGroupAdmin(participants, userToDemote)) {
        return sock.sendMessage(chatId, { 
          text: 'ꕤ El usuario no es administrador'
        })
      }

      await sock.groupParticipantsUpdate(chatId, [userToDemote], 'demote')
      
      await sock.sendMessage(chatId, { 
        text: `ꕥ @${userToDemote.split('@')[0]} ha sido degradado a usuario normal`,
        mentions: [userToDemote]
      })
    } catch (error) {
      console.error('Error en demote:', error)
      await sock.sendMessage(chatId, { 
        text: 'ꕤ Error al degradar usuario'
      })
    }
  }
}