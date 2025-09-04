import fetch from 'node-fetch'

export const command = 'list'
export const aliases = ['ls']
export const description = 'Muestra la lista de archivos en Osaka Cloud Storage'
export const category = 'tools'

export async function handler({ sock, message, args, chatId }) {
  try {
    await sock.sendMessage(chatId, { text: '📂 Obteniendo lista de archivos...' })

    const response = await fetch('https://api.uploadcare.com/files/?limit=20&ordering=-datetime_uploaded', {
      headers: {
        'Authorization': `Uploadcare.Simple 2d155bd1f643e98aa7dd:d837e999fbd7e956f0db`
      }
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      return sock.sendMessage(chatId, {
        text: '📂 *OSAKA CLOUD STORAGE*\n\n📭 No hay archivos almacenados actualmente.'
      })
    }

    let listText = `📂 *OSAKA CLOUD STORAGE*\n📁 Archivos recientes (${data.results.length}/20)\n\n`
    
    data.results.forEach((file, index) => {
      const uploadDate = new Date(file.datetime_uploaded).toLocaleDateString()
      const fileSize = file.size ? (file.size / 1024).toFixed(2) : 'N/A'
      const fileName = file.original_filename || 'Sin nombre'
      
      listText += `${index + 1}. 📄 *${fileName}*\n`
      listText += `   🆔 ID: ${file.uuid}\n`
      listText += `   📊 Tamaño: ${fileSize} KB\n`
      listText += `   📅 Subido: ${uploadDate}\n`
      listText += `   🔗 https://ucarecdn.com/${file.uuid}/\n\n`
    })

    listText += `\n💡 *Comandos útiles:*\n`
    listText += `📥 /download [ID] - Descargar archivo\n`
    listText += `🗑️ /delete [ID] - Eliminar archivo\n`
    listText += `ℹ️ /info [ID] - Ver información detallada`

    await sock.sendMessage(chatId, {
      text: listText
    })
  } catch (error) {
    console.error('Error en list:', error)
    await sock.sendMessage(chatId, { 
      text: '❌ Error al obtener la lista de archivos' 
    })
  }
}