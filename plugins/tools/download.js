import fetch from 'node-fetch'

export const command = 'download'
export const aliases = ['dl']
export const description = 'Descarga un archivo de Osaka Cloud Storage'
export const category = 'tools'

export async function handler({ sock, message, args, chatId }) {
  if (args.length < 1) {
    return sock.sendMessage(chatId, { 
      text: '❌ Uso: /download [URL o ID del archivo]\nEjemplo: /download https://ucarecdn.com/abc123-def456/\nEjemplo: /download abc123-def456' 
    })
  }

  const input = args.join(' ')
  let fileId = null
  let fileUrl = null

  if (input.includes('ucarecdn.com/')) {
    const match = input.match(/ucarecdn\.com\/([^\/]+)/)
    if (match) {
      fileId = match[1]
      fileUrl = input
    }
  } else if (input.match(/^[a-f0-9-]+$/)) {
    fileId = input
    fileUrl = `https://ucarecdn.com/${fileId}/`
  } else {
    return sock.sendMessage(chatId, {
      text: '❌ URL o ID de archivo inválido\n\n✅ Formatos válidos:\n• https://ucarecdn.com/abc123-def456/\n• abc123-def456'
    })
  }

  try {
    await sock.sendMessage(chatId, { text: '📥 Descargando archivo...' })

    const infoResponse = await fetch(`https://api.uploadcare.com/files/${fileId}/`, {
      headers: {
        'Authorization': `Uploadcare.Simple 2d155bd1f643e98aa7dd:d837e999fbd7e956f0db`
      }
    })

    if (!infoResponse.ok) {
      return sock.sendMessage(chatId, {
        text: '❌ Archivo no encontrado o inaccesible'
      })
    }

    const fileInfo = await infoResponse.json()
    const fileSize = fileInfo.size || 0
    const maxSize = 10 * 1024 * 1024

    if (fileSize > maxSize) {
      return sock.sendMessage(chatId, {
        text: `❌ El archivo es muy grande (${(fileSize / (1024 * 1024)).toFixed(2)} MB)\n📏 Límite para descarga: 10 MB`
      })
    }

    const downloadResponse = await fetch(fileUrl)
    
    if (!downloadResponse.ok) {
      return sock.sendMessage(chatId, {
        text: '❌ Error al descargar el archivo'
      })
    }

    const buffer = await downloadResponse.buffer()
    const fileName = fileInfo.original_filename || `file_${fileId}`
    const mimeType = fileInfo.mime_type || 'application/octet-stream'

    if (mimeType.startsWith('image/')) {
      await sock.sendMessage(chatId, {
        image: buffer,
        caption: `📥 *Archivo descargado*\n📁 ${fileName}\n📊 ${(fileSize / 1024).toFixed(2)} KB`
      })
    } else if (mimeType.startsWith('video/')) {
      await sock.sendMessage(chatId, {
        video: buffer,
        caption: `📥 *Archivo descargado*\n📁 ${fileName}\n📊 ${(fileSize / 1024).toFixed(2)} KB`
      })
    } else if (mimeType.startsWith('audio/')) {
      await sock.sendMessage(chatId, {
        audio: buffer,
        mimetype: mimeType,
        fileName: fileName
      })
    } else {
      await sock.sendMessage(chatId, {
        document: buffer,
        fileName: fileName,
        mimetype: mimeType
      })
    }

    await sock.sendMessage(chatId, {
      text: `✅ *Archivo descargado exitosamente*\n📁 ${fileName}\n📊 ${(fileSize / 1024).toFixed(2)} KB`
    })
  } catch (error) {
    console.error('Error en download:', error)
    await sock.sendMessage(chatId, { 
      text: '❌ Error al descargar el archivo' 
    })
  }
}