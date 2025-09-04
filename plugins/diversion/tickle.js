import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  command: 'tickle',
  description: 'Hace cosquillas a un usuario',
  category: 'diversion',
  async handler({ sock, message, args, chatId, sender }) {
    const mentionedUsers = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
    
    if (!mentionedUsers || mentionedUsers.length === 0) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ Debes mencionar a alguien para hacerle cosquillas\nEjemplo: /tickle @usuario' 
      })
    }

    const targetUser = mentionedUsers[0]
    const senderName = `@${sender.split('@')[0]}`
    const targetName = `@${targetUser.split('@')[0]}`

    try {
      const gifsPath = path.join(__dirname, 'gifs.json')
      const gifsData = JSON.parse(fs.readFileSync(gifsPath, 'utf8'))
      const tickleGifs = gifsData.tickle || []
      
      if (tickleGifs.length === 0) {
        return sock.sendMessage(chatId, { 
          text: `🤭 ${senderName} le hace cosquillas a ${targetName} 😂 ¡Jajajaja!`,
          mentions: [sender, targetUser]
        })
      }

      const randomGif = tickleGifs[Math.floor(Math.random() * tickleGifs.length)]
      
      await sock.sendMessage(chatId, {
        video: { url: randomGif },
        caption: `🤭 ${senderName} le hace cosquillas a ${targetName} 😂 ¡Jajajaja!`,
        mentions: [sender, targetUser],
        gifPlayback: true
      })
    } catch (error) {
      console.error('Error en tickle:', error)
      await sock.sendMessage(chatId, { 
        text: `🤭 ${senderName} le hace cosquillas a ${targetName} 😂 ¡Jajajaja!`,
        mentions: [sender, targetUser]
      })
    }
  }
}