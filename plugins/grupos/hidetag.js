import { isGroupAdmin, createChannelButton } from '../../lib/handler.js'

export const command = 'hidetag'
export const description = 'Envía un mensaje etiquetando a todos sin mostrar las menciones'
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

    const text = args.length > 0 ? args.join(' ') : '¡ꕤ! Mensaje importante para todos'
    
    let mentions = participants.map(participant => participant.id)

    await sock.sendMessage(chatId, {
      text: text,
      mentions: mentions
    })
  } catch (error) {
    console.error('Error en hidetag:', error)
    await sock.sendMessage(chatId, { 
      text: 'ꕤ Error al enviar mensaje oculto' 
    })
  }
}