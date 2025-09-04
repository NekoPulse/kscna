import fetch from 'node-fetch'
import FormData from 'form-data'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

export const command = 'upload'
export const aliases = ['up']
export const description = 'Sube un archivo a Osaka Cloud Storage'
export const category = 'tools'

export async function handler({ sock, message, args, chatId }) {
  try {
    const quoted = message.message?.extendedTextMessage?.contextInfo?.quotedMessage
    let mediaMessage = null
    let mediaType = null
    
    if (quoted?.documentMessage) {
      mediaMessage = quoted.documentMessage
      mediaType = 'document'
    } else if (quoted?.imageMessage) {
      mediaMessage = quoted.imageMessage
      mediaType = 'image'
    } else if (quoted?.videoMessage) {
      mediaMessage = quoted.videoMessage
      mediaType = 'video'
    } else if (quoted?.audioMessage) {
      mediaMessage = quoted.audioMessage
      mediaType = 'audio'
    } else if (message.message?.documentMessage) {
      mediaMessage = message.message.documentMessage
      mediaType = 'document'
    } else if (message.message?.imageMessage) {
      mediaMessage = message.message.imageMessage
      mediaType = 'image'
    } else if (message.message?.videoMessage) {
      mediaMessage = message.message.videoMessage
      mediaType = 'video'
    } else if (message.message?.audioMessage) {
      mediaMessage = message.message.audioMessage
      mediaType = 'audio'
    }
    
    if (!mediaMessage) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ Uso: /upload [responder a un archivo o enviar archivo]\n\n📁 Soportados: Documentos, Imágenes, Videos, Audio\n⚠️ Límite: 10 MB' 
      })
    }

    const fileSize = mediaMessage.fileLength || 0
    const maxSize = 10 * 1024 * 1024

    if (fileSize > maxSize) {
      return sock.sendMessage(chatId, {
        text: `ꕤ Archivo muy grande (${(fileSize / (1024 * 1024)).toFixed(2)} MB)\nLímite máximo: 10 MB`
      })
    }

    await sock.sendMessage(chatId, { text: '☁️ Subiendo archivo...' })

    try {
      // Usar downloadContentFromMessage correctamente
      const stream = await downloadContentFromMessage(mediaMessage, mediaType)
      
      // Convertir stream a buffer
      const buffer = Buffer.concat(await streamToBuffer(stream))
      
      if (!buffer || buffer.length === 0) {
        throw new Error('No se pudo descargar el archivo')
      }

      const form = new FormData()
      const fileName = mediaMessage.fileName || `file_${Date.now()}.${getExtension(mediaMessage.mimetype)}`
      
      form.append('UPLOADCARE_PUB_KEY', '2d155bd1f643e98aa7dd')
      form.append('file', buffer, {
        filename: fileName,
        contentType: mediaMessage.mimetype || 'application/octet-stream'
      })

      const uploadResponse = await fetch('https://upload.uploadcare.com/base/', {
        method: 'POST',
        body: form,
        timeout: 30000
      })

      const uploadResult = await uploadResponse.json()

      if (uploadResult.file) {
        const fileUrl = `https://ucarecdn.com/${uploadResult.file}/`
        
        const resultText = `╭─「 ☁️ OSAKA CLOUD 」
│ ✅ *Archivo subido exitosamente*
│
│ 📁 *Nombre:* ${fileName}
│ 📊 *Tamaño:* ${(fileSize / 1024).toFixed(2)} KB
│ 🆔 *ID:* ${uploadResult.file}
╰─────────────────────────

🔗 *URL:* ${fileUrl}

💾 Para descargar: /download ${fileUrl}
🗑️ Para eliminar: /delete ${uploadResult.file}`

        await sock.sendMessage(chatId, {
          text: resultText
        })
      } else {
        throw new Error('Error en la respuesta del servidor')
      }
    } catch (uploadError) {
      console.error('Error subiendo archivo:', uploadError)
      await sock.sendMessage(chatId, { 
        text: 'ꕤ Error al subir el archivo' 
      })
    }
  } catch (error) {
    console.error('Error en upload:', error)
    await sock.sendMessage(chatId, { 
      text: 'ꕤ Error al procesar el archivo' 
    })
  }
}

// Función helper para convertir stream a buffer
async function streamToBuffer(stream) {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('end', () => resolve(chunks))
    stream.on('error', reject)
  })
}

function getExtension(mimetype) {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/avi': 'avi',
    'audio/mpeg': 'mp3',
    'audio/ogg': 'ogg',
    'audio/wav': 'wav',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'application/zip': 'zip',
    'application/rar': 'rar'
  }
  return extensions[mimetype] || 'bin'
}