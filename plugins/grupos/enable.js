import { isGroupAdmin, createChannelButton } from '../../lib/handler.js'
import { dbManager } from '../../lib/database.js'

export const command = 'enable'
export const description = 'Activa funciones del grupo'
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

    if (args.length === 0) {
      return sock.sendMessage(chatId, {
        text: `ꕤ Debes especificar qué activar
        
🔧 *Opciones disponibles:*
• \`antilink\` - Detecta y elimina enlaces
• \`welcome\` - Mensajes de bienvenida

📝 *Uso:* /enable [opción]
📝 *Ejemplo:* /enable antilink`
      })
    }

    const option = args[0].toLowerCase()
    const validOptions = ['antilink', 'welcome']
    
    if (!validOptions.includes(option)) {
      return sock.sendMessage(chatId, {
        text: `ꕤ Opción inválida. Opciones disponibles: ${validOptions.join(', ')}`
      })
    }

    const groupSettings = await dbManager.getGroupSettings(chatId)
    
    if (groupSettings[option] === true) {
      return sock.sendMessage(chatId, {
        text: `ꕥ La función \`${option}\` ya está activada`
      })
    }

    const updates = {}
    updates[option] = true
    
    await dbManager.updateGroupSettings(chatId, updates)
    
    const optionNames = {
      antilink: 'Anti-Enlaces',
      welcome: 'Bienvenidas'
    }

    await sock.sendMessage(chatId, {
      text: `ꕥ Función \`${optionNames[option]}\` activada correctamente`
    })
  } catch (error) {
    console.error('Error en enable:', error)
    await sock.sendMessage(chatId, { 
      text: 'ꕤ Error al activar la función' 
    })
  }
}