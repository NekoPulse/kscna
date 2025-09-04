import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  command: 'pat',
  description: 'Acaricia a un usuario',
  category: 'diversion',
  async handler({ sock, message, args, chatId, sender }) {
    const mentionedUsers = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
    
    if (!mentionedUsers || mentionedUsers.length === 0) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ Debes mencionar a alguien para acariciarlo\nEjemplo: /pat @usuario'
      })
    }

    const targetUser = mentionedUsers[0]
    const senderName = `@${sender.split('@')[0]}`
    const targetName = `@${targetUser.split('@')[0]}`

    try {
      const gifsPath = path.join(__dirname, 'gifs.json')
      const gifsData = JSON.parse(fs.readFileSync(gifsPath, 'utf8'))
      const patGifs = gifsData.pat || []
      
      if (patGifs.length === 0) {
        return sock.sendMessage(chatId, { 
          text: `🤲 ${senderName} acaricia tiernamente a ${targetName} ✨`,
          mentions: [sender, targetUser]
        })
      }

      const randomGif = patGifs[Math.floor(Math.random() * patGifs.length)]
      
      await sock.sendMessage(chatId, {
        video: { url: randomGif },
        caption: `🤲 ${senderName} acaricia tiernamente a ${targetName} ✨`,
        mentions: [sender, targetUser],
        gifPlayback: true
      })
    } catch (error) {
      console.error('Error en pat:', error)
      await sock.sendMessage(chatId, { 
        text: `🤲 ${senderName} acaricia tiernamente a ${targetName} ✨`,
        mentions: [sender, targetUser]
      })
    }
  }
}