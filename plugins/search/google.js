import fetch from 'node-fetch'

export const command = 'google'
export const description = 'Buscar información en Google'
export const category = 'search'

export async function handler({ sock, message, args, chatId }) {
  if (args.length < 1) {
    return sock.sendMessage(chatId, { 
      text: 'ꕤ Uso: /google [términos de búsqueda]' 
    })
  }

  const query = args.join(' ')
  
  try {
    await sock.sendMessage(chatId, { text: '🔍 Buscando en Google...' })
    
    const response = await fetch(`https://soblendr-api.nekopulsex.workers.dev/?q=${encodeURIComponent(query)}&by=soblend--utf-5`)
    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ No se encontraron resultados en Google' 
      })
    }

    let resultsText = `🔍 *RESULTADOS DE GOOGLE*\n📝 Query: ${query}\n\n`
    
    data.results.slice(0, 5).forEach((result, index) => {
      resultsText += `${index + 1}. 📄 *${result.title}*\n`
      resultsText += `📋 ${result.snippet}\n`
      resultsText += `🔗 ${result.link}\n\n`
    })

    if (data.results.length > 5) {
      resultsText += `\n📊 Se encontraron ${data.results.length} resultados (mostrando los primeros 5)`
    }

    await sock.sendMessage(chatId, {
      text: resultsText
    })
  } catch (error) {
    console.error('Error en Google:', error)
    await sock.sendMessage(chatId, { 
      text: 'ꕤ Error al buscar en Google' 
    })
  }
}