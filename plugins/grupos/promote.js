import { isGroupAdmin, createChannelButton } from '../../lib/handler.js'

export const command = 'promote'
export const description = 'Promociona a un usuario a administrador'
export const category = 'grupos'

export async function handler({ sock, message, args, chatId, sender, isGroup, botNumber }) {
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
        text: 'ꕤ Debes mencionar a un usuario para promocionarlo\nEjemplo: /promote @usuario' 
      })
    }

    const userToPromote = mentionedUsers[0]
    
    if (isGroupAdmin(participants, userToPromote)) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ El usuario ya es administrador' 
      })
    }

    await sock.groupParticipantsUpdate(chatId, [userToPromote], 'promote')
    
    await sock.sendMessage(chatId, { 
      text: `👑 @${userToPromote.split('@')[0]} ha sido promocionado a administrador`,
      mentions: [userToPromote]
    })
  } catch (error) {
    console.error('Error en promote:', error)
    await sock.sendMessage(chatId, { 
      text: 'ꕤ Error al promocionar usuario' 
    })
  }
}