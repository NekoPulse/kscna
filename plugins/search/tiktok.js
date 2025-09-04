import fetch from 'node-fetch'

export const command = 'tiktok'
export const aliases = ['ttk']
export const description = 'Buscar videos en TikTok'
export const category = 'search'

export async function handler({ sock, message, args, chatId }) {
  if (args.length < 1) {
    return sock.sendMessage(chatId, { 
      text: 'ꕤ Uso: /tiktok [texto a buscar]' 
    })
  }

  const query = args.join(' ')
  
  try {
    await sock.sendMessage(chatId, { text: '🎵 Buscando en TikTok...' })
    
    const response = await fetch(`https://dark-core-api.vercel.app/api/search/tiktok?key=api&text=${encodeURIComponent(query)}`, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success || !data.results || data.results.length === 0) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ No se encontraron resultados en TikTok' 
      })
    }

    // Tomar los primeros 3 videos para mostrar como cards
    const videosToShow = data.result.slice(0, 3)
    
    // Enviar cada video como un card individual
    for (const [index, video] of videosToShow.entries()) {
      const cardText = `╭─「 🎵 TIKTOK ${index + 1}/3 」
│ 📱 *${video.title || 'Video de TikTok'}*
│ 👤 *Usuario:* ${video.author || 'N/A'}
│ ❤️ *Likes:* ${video.likes || 'N/A'}
│ 💬 *Comentarios:* ${video.comments || 'N/A'}
╰─────────────────────────────

🔍 *Búsqueda:* ${query}`

      const messageOptions = {
        video: { url: video.url },
        caption: cardText,
        contextInfo: {
          externalAdReply: {
            title: `📱 Ver en TikTok`,
            body: `${video.title || 'Video de TikTok'} • ${video.author || 'TikTok'}`,
            thumbnailUrl: video.cover || video.thumbnail,
            sourceUrl: video.webUrl || video.url,
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: false
          }
        }
      }

      try {
        await sock.sendMessage(chatId, messageOptions)
      } catch (videoError) {
        // Si falla el envío del video, enviar solo el texto con enlace
        await sock.sendMessage(chatId, {
          text: `${cardText}\n\n🔗 *Enlace:* ${video.url}`
        })
      }
    }

  } catch (error) {
    console.error('Error en TikTok:', error)
    await sock.sendMessage(chatId, { 
      text: 'ꕤ Error al buscar en TikTok' 
    })
  }
}