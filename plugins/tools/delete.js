import fetch from 'node-fetch'

export const command = 'delete'
export const aliases = ['del']
export const description = 'Elimina un archivo de Osaka Cloud Storage'
export const category = 'tools'

export async function handler({ sock, message, args, chatId }) {
  if (args.length < 1) {
    return sock.sendMessage(chatId, { 
      text: '❌ Uso: /delete [ID del archivo]\nEjemplo: /delete abc123-def456' 
    })
  }

  const fileId = args[0]

  if (!fileId.match(/^[a-f0-9-]+$/)) {
    return sock.sendMessage(chatId, {
      text: '❌ ID de archivo inválido\n\n✅ Formato válido: abc123-def456'
    })
  }

  try {
    await sock.sendMessage(chatId, { text: '🗑️ Eliminando archivo...' })

    const deleteResponse = await fetch(`https://api.uploadcare.com/files/${fileId}/storage/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Uploadcare.Simple 2d155bd1f643e98aa7dd:d837e999fbd7e956f0db`
      }
    })

    if (deleteResponse.status === 200) {
      await sock.sendMessage(chatId, {
        text: `✅ *Archivo eliminado exitosamente*\n🗑️ ID: ${fileId}\n\n⚠️ Este archivo ya no estará disponible para descarga.`
      })
    } else if (deleteResponse.status === 404) {
      await sock.sendMessage(chatId, {
        text: '❌ Archivo no encontrado o ya fue eliminado'
      })
    } else {
      throw new Error(`Error ${deleteResponse.status}`)
    }
  } catch (error) {
    console.error('Error en delete:', error)
    await sock.sendMessage(chatId, { 
      text: '❌ Error al eliminar el archivo' 
    })
  }
}