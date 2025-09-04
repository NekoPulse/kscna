import { isGroupAdmin, createChannelButton } from '../../lib/handler.js'

export const command = 'link'
export const description = 'Obtiene el enlace de invitación del grupo'
export const category = 'grupos'

export async function handler({ sock, message, args, chatId, sender, isGroup, botNumber }) {
  if (!isGroup) return

  try {
    const groupMetadata = await sock.groupMetadata(chatId)
    const participants = groupMetadata.participants
    
    const isBotAdmin = isGroupAdmin(participants, botNumber)
    if (!isBotAdmin) {
      return sock.sendMessage(chatId, createChannelButton(
        "૮₍˃̵֊ ˂̵ ₎ա Lo siento, no soy administrador en este grupo."
      ))
    }

    const isUserAdmin = isGroupAdmin(participants, sender)
    if (!isUserAdmin) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ Solo los administradores pueden usar este comando' 
      })
    }

    const inviteCode = await sock.groupInviteCode(chatId)
    const groupLink = `https://chat.whatsapp.com/${inviteCode}`

    await sock.sendMessage(chatId, {
      text: `🔗 *ENLACE DEL GRUPO*

👥 *Grupo:* ${groupMetadata.subject}
🔗 *Enlace:* ${groupLink}

⚠️ *Advertencia:* Usa este enlace con cuidado y compártelo solo con personas de confianza.`
    })
  } catch (error) {
    console.error('Error en link:', error)
    await sock.sendMessage(chatId, { 
      text: 'ꕤ Error al obtener el enlace del grupo' 
    })
  }
}