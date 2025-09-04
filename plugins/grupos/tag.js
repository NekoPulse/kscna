import { isGroupAdmin, createChannelButton } from '../../lib/handler.js'

export const command = 'tag'
export const description = 'Etiqueta a todos los miembros del grupo'
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

    const text = args.length > 0 ? args.join(' ') : 'Etiquetando a todos los miembros'
    
    let mentions = []
    let tagText = `📢 *${text}*\n\n`
    
    participants.forEach((participant, index) => {
      const number = participant.id.split('@')[0]
      tagText += `${index + 1}. @${number}\n`
      mentions.push(participant.id)
    })
    
    tagText += `\n👥 Total: ${participants.length} miembros`

    await sock.sendMessage(chatId, {
      text: tagText,
      mentions: mentions
    })
  } catch (error) {
    console.error('Error en tag:', error)
    await sock.sendMessage(chatId, { 
      text: 'ꕤ Error al etiquetar usuarios' 
    })
  }
}