import fetch from 'node-fetch'

export default {
  command: 'info',
  aliases: ['i'],
  description: 'Muestra información detallada del archivo',
  category: 'tools',
  handler: async ({ sock, message, args, chatId }) => {
    if (args.length < 1) {
      return sock.sendMessage(chatId, { 
        text: '❌ Uso: /info [ID del archivo]\nEjemplo: /info abc123-def456' 
      })
    }

    const fileId = args[0]

    if (!fileId.match(/^[a-f0-9-]+$/)) {
      return sock.sendMessage(chatId, {
        text: '❌ ID de archivo inválido\n\n✅ Formato válido: abc123-def456'
      })
    }

    try {
      await sock.sendMessage(chatId, { text: 'ℹ️ Obteniendo información del archivo...' })

      const response = await fetch(`https://api.uploadcare.com/files/${fileId}/`, {
        headers: {
          'Authorization': `Uploadcare.Simple 2d155bd1f643e98aa7dd:d837e999fbd7e956f0db`
        }
      })

      if (!response.ok) {
        if (response.status === 404) {
          return sock.sendMessage(chatId, {
            text: '❌ Archivo no encontrado'
          })
        }
        throw new Error(`Error ${response.status}`)
      }

      const fileInfo = await response.json()
      
      const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B'
        const k = 1024
        const sizes = ['B', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
      }

      const uploadDate = new Date(fileInfo.datetime_uploaded).toLocaleString()
      const fileSize = formatBytes(fileInfo.size)
      
      let infoText = `ℹ️ *INFORMACIÓN DEL ARCHIVO*

📁 *Nombre:* ${fileInfo.original_filename || 'Sin nombre'}
🆔 *ID:* ${fileInfo.uuid}
📊 *Tamaño:* ${fileSize}
🏷️ *Tipo MIME:* ${fileInfo.mime_type || 'N/A'}
📅 *Subido:* ${uploadDate}
🌐 *URL:* https://ucarecdn.com/${fileInfo.uuid}/`

      if (fileInfo.image_info) {
        infoText += `\n\n🖼️ *Información de Imagen:*`
        infoText += `\n📏 Dimensiones: ${fileInfo.image_info.width}x${fileInfo.image_info.height}px`
        infoText += `\n🎨 Formato: ${fileInfo.image_info.format}`
        
        if (fileInfo.image_info.color_mode) {
          infoText += `\n🎨 Modo de color: ${fileInfo.image_info.color_mode}`
        }
      }

      if (fileInfo.video_info) {
        infoText += `\n\n🎥 *Información de Video:*`
        infoText += `\n📏 Dimensiones: ${fileInfo.video_info.video.width}x${fileInfo.video_info.video.height}px`
        infoText += `\n⏱️ Duración: ${Math.round(fileInfo.video_info.video.duration)}s`
        infoText += `\n🎬 Bitrate: ${Math.round(fileInfo.video_info.video.bitrate / 1000)} kbps`
        infoText += `\n📹 Codec: ${fileInfo.video_info.video.codec}`
      }

      infoText += `\n\n💡 *Acciones disponibles:*`
      infoText += `\n📥 /download ${fileInfo.uuid}`
      infoText += `\n🗑️ /delete ${fileInfo.uuid}`

      await sock.sendMessage(chatId, {
        text: infoText
      })
    } catch (error) {
      console.error('Error en info:', error)
      await sock.sendMessage(chatId, { 
        text: '❌ Error al obtener información del archivo' 
      })
    }
  }
}