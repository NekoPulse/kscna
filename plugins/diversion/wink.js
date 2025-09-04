import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default {
  command: 'wink',
  description: 'Guiña el ojo a un usuario',
  category: 'diversion',
  async handler({ sock, message, args, chatId, sender }) {
    const mentionedUsers = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
    
    if (!mentionedUsers || mentionedUsers.length === 0) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ Debes mencionar a alguien para guiñarle el ojo\nEjemplo: /wink @usuario'
      })
    }

    const targetUser = mentionedUsers[0]
    const senderName = `@${sender.split('@')[0]}`
    const targetName = `@${targetUser.split('@')[0]}`

    try {
      const gifsPath = path.join(__dirname, 'gifs.json')
      const gifsData = JSON.parse(fs.readFileSync(gifsPath, 'utf8'))
      const winkGifs = gifsData.wink || []
      
      if (winkGifs.length === 0) {
        return sock.sendMessage(chatId, { 
          text: `😉 ${senderName} le guiña el ojo a ${targetName} ✨`,
          mentions: [sender, targetUser]
        })
      }

      const randomGif = winkGifs[Math.floor(Math.random() * winkGifs.length)]
      
      await sock.sendMessage(chatId, {
        video: { url: randomGif },
        caption: `😉 ${senderName} le guiña el ojo a ${targetName} ✨`,
        mentions: [sender, targetUser],
        gifPlayback: true
      })
    } catch (error) {
      console.error('Error en wink:', error)
      await sock.sendMessage(chatId, { 
        text: `😉 ${senderName} le guiña el ojo a ${targetName} ✨`,
        mentions: [sender, targetUser]
      })
    }
  }
}