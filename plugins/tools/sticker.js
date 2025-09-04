import fetch from 'node-fetch'
import sharp from 'sharp'

export const command = 'sticker'
export const aliases = ['s']
export const description = 'Convierte una imagen en sticker'
export const category = 'tools'

export async function handler({ sock, message, args, chatId }) {
  try {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
    let imageMessage = null
    
    if (quoted?.imageMessage) {
      imageMessage = quoted.imageMessage
    } else if (message.message?.imageMessage) {
      imageMessage = message.message.imageMessage
    }
    
    if (!imageMessage) {
      return sock.sendMessage(chatId, { 
        text: '❌ Debes enviar una imagen o responder a una imagen con /sticker' 
      })
    }

    await sock.sendMessage(chatId, { text: '🎨 Creando sticker...' })

    try {
      const buffer = await sock.downloadMediaMessage(
        quoted ? { message: { imageMessage } } : message
      )
      
      if (!buffer) {
        throw new Error('No se pudo descargar la imagen')
      }

      const stickerBuffer = await sharp(buffer)
        .resize(512, 512, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .webp({ quality: 80 })
        .toBuffer()

      await sock.sendMessage(chatId, {
        sticker: stickerBuffer
      })
    } catch (processError) {
      console.error('Error procesando imagen:', processError)
      await sock.sendMessage(chatId, { 
        text: '❌ Error al procesar la imagen. Asegúrate de que sea una imagen válida.' 
      })
    }
  } catch (error) {
    console.error('Error en sticker:', error)
    await sock.sendMessage(chatId, { 
      text: '❌ Error al crear el sticker' 
    })
  }
}