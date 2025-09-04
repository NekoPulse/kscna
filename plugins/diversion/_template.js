const fs = require('fs')
const path = require('path')

module.exports = {
  command: 'command_name',  // Cambiar esto por el nombre del comando (ej: 'kiss', 'pat', etc.)
  description: 'Descripción del comando',  // Cambiar esto
  category: 'diversion',
  handler: async ({ sock, message, args, chatId, sender }) => {
    const mentionedUsers = message.message?.extendedTextMessage?.contextInfo?.mentionedJid
    
    if (!mentionedUsers || mentionedUsers.length === 0) {
      return sock.sendMessage(chatId, { 
        text: `❌ Debes mencionar a alguien para este comando\nEjemplo: /${this.command} @usuario` 
      })
    }

    const targetUser = mentionedUsers[0]
    const senderName = `@${sender.split('@')[0]}`
    const targetName = `@${targetUser.split('@')[0]}`
    const actionText = `acción`  // Cambiar esto (ej: 'besa', 'acaricia', etc.)

    try {
      const gifsPath = path.join(__dirname, 'gifs.json')
      const gifsData = JSON.parse(fs.readFileSync(gifsPath, 'utf8'))
      const commandGifs = gifsData[this.command] || []
      
      if (commandGifs.length === 0) {
        return sock.sendMessage(chatId, { 
          text: '❌ No hay gifs disponibles en este momento' 
        })
      }

      const randomGif = commandGifs[Math.floor(Math.random() * commandGifs.length)]
      
      await sock.sendMessage(chatId, {
        video: { url: randomGif },
        caption: `🤗 ${senderName} ${actionText} a ${targetName}`,
        mentions: [sender, targetUser],
        gifPlayback: true
      })
    } catch (error) {
      console.error(`Error en ${this.command}:`, error)
      await sock.sendMessage(chatId, { 
        text: `🤗 ${senderName} ${actionText} a ${targetName}`,
        mentions: [sender, targetUser]
      })
    }
  }
}
