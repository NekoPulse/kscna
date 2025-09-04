import fetch from 'node-fetch'

export const command = 'ytsearch'
export const description = 'Buscar videos en YouTube'
export const category = 'search'

export async function handler({ sock, message, args, chatId }) {
  if (args.length < 1) {
    return sock.sendMessage(chatId, { 
      text: 'ꕤ Uso: /ytsearch [texto a buscar]' 
    })
  }

  const query = args.join(' ')
  
  try {
    await sock.sendMessage(chatId, { text: '🔍 Buscando en YouTube...' })
    
    const response = await fetch(`https://masha.sylphy.xyz/ytsearch?q=${encodeURIComponent(query)}&apikey=84a3ff6634fac3c8e64dc60a2db5fd96`, {
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const data = await response.json()
    
    if (!data.success || !data.videos || data.videos.length === 0) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ No se encontraron resultados en YouTube' 
      })
    }

    // Tomar los primeros 5 videos para mostrar como cards
    const videosToShow = data.videos.slice(0, 5)
    
    // Enviar cada video como un card individual
    for (const [index, video] of videosToShow.entries()) {
      const views = video.views ? video.views.replace(/,/g, '') : 'N/A'
      
      const cardText = `╭─「 📹 YOUTUBE ${index + 1}/5 」
│ 🎬 *${video.title}*
│ 👤 *Canal:* ${video.channel.name}
│ ⏰ *Duración:* ${video.duration}
│ 👀 *Vistas:* ${views}
╰─────────────────────────────

🔍 *Búsqueda:* ${query}`

      const messageOptions = {
        image: { url: video.thumbnail },
        caption: cardText,
        contextInfo: {
          externalAdReply: {
            title: `▶️ Ver en YouTube`,
            body: `${video.title} • ${video.channel.name}`,
            thumbnailUrl: video.thumbnail,
            sourceUrl: video.url,
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: false
          }
        }
      }

      await sock.sendMessage(chatId, messageOptions)
    }

  } catch (error) {
    console.error('Error en YouTube:', error)
    await sock.sendMessage(chatId, { 
      text: 'ꕤ Error al buscar en YouTube' 
    })
  }
}