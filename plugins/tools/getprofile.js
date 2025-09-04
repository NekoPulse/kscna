export const command = 'getprofile'
export const aliases = ['pfp']
export const description = 'Obtiene la foto de perfil de un usuario'
export const category = 'tools'

export async function handler({ sock, message, args, chatId, sender }) {
  try {
    let targetUser = sender
    
    const mentionedUsers = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
    if (mentionedUsers && mentionedUsers.length > 0) {
      targetUser = mentionedUsers[0]
    }

    const userName = targetUser.split('@')[0]
    
    try {
      const profilePicUrl = await sock.profilePictureUrl(targetUser, 'image')
      
      await sock.sendMessage(chatId, {
        image: { url: profilePicUrl },
        caption: `📸 *FOTO DE PERFIL*\n\n👤 Usuario: @${userName}\n🔗 URL: ${profilePicUrl}`,
        mentions: [targetUser]
      })
    } catch (ppError) {
      if (ppError.output?.statusCode === 404) {
        await sock.sendMessage(chatId, {
          text: `❌ @${userName} no tiene foto de perfil`,
          mentions: [targetUser]
        })
      } else {
        throw ppError
      }
    }
  } catch (error) {
    console.error('Error en getprofile:', error)
    await sock.sendMessage(chatId, { 
      text: '❌ Error al obtener la foto de perfil' 
    })
  }
}