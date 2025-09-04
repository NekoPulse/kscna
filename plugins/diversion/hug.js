import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  command: 'hug',
  description: 'Abraza a un usuario',
  category: 'diversion',
  handler: async ({ sock, message, args, chatId, sender }) => {
    const mentionedUsers = message.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    
    if (!mentionedUsers || mentionedUsers.length === 0) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ Debes mencionar a alguien para abrazar\nEjemplo: /hug @usuario' 
      });
    }

    const targetUser = mentionedUsers[0];
    const senderName = `@${sender.split('@')[0]}`;
    const targetName = `@${targetUser.split('@')[0]}`;

    try {
      const gifsPath = path.join(__dirname, 'gifs.json');
      const gifsData = JSON.parse(fs.readFileSync(gifsPath, 'utf8'));
      const hugGifs = gifsData.hug || [];
      
      if (hugGifs.length === 0) {
        return sock.sendMessage(chatId, { 
          text: 'ꕤ No hay gifs disponibles en este momento' 
        });
      }

      const randomGif = hugGifs[Math.floor(Math.random() * hugGifs.length)];
      
      await sock.sendMessage(chatId, {
        video: { url: randomGif },
        caption: `🤗 ${senderName} le da un cálido abrazo a ${targetName}`,
        mentions: [sender, targetUser],
        gifPlayback: true
      });
    } catch (error) {
      console.error('Error en hug:', error);
      await sock.sendMessage(chatId, { 
        text: `🤗 ${senderName} le da un cálido abrazo a ${targetName}`,
        mentions: [sender, targetUser]
      });
    }
  }
};
