import fetch from 'node-fetch'

export const command = 'pinterest'
export const description = 'Buscar imágenes en Pinterest'
export const category = 'search'

export async function handler({ sock, message, args, chatId }) {
  if (args.length < 1) {
    return sock.sendMessage(chatId, { 
      text: 'ꕤ Uso: /pinterest [texto a buscar]' 
    })
  }

  const query = args.join(' ')
  
  try {
    await sock.sendMessage(chatId, { text: '🔍 Buscando en Pinterest...' })
    
    const response = await fetch(`https://pinscrapper.vercel.app/api/pinterest/search?q=${encodeURIComponent(query)}&limit=10`, {
      timeout: 30000, // 30 segundos de timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const data = await response.json()
    
    if (!data.success || !data.images || data.images.length === 0) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ No se encontraron resultados en Pinterest' 
      })
    }

    // Tomar las primeras 6 imágenes para mostrar como cards
    const imagesToShow = data.images.slice(0, 6)
    
    // Enviar cada imagen como un card individual
    for (const [index, image] of imagesToShow.entries()) {
      const cardText = `╭─「 🖼️ PINTEREST ${index + 1}/6 」
│ 🎨 *${image.title || 'Sin título'}*
│ 👤 *Autor:* @${image.author}
│ 📐 *Dimensiones:* ${image.width}x${image.height}
╰─────────────────────────────

🔍 *Búsqueda:* ${query}`

      const messageOptions = {
        image: { url: image.imageUrl },
        caption: cardText,
        contextInfo: {
          externalAdReply: {
            title: `📌 Ver en Pinterest`,
            body: `${image.title || 'Imagen Pinterest'} • @${image.author}`,
            thumbnailUrl: image.imageUrl,
            sourceUrl: image.originalUrl,
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: false
          }
        }
      }

      await sock.sendMessage(chatId, messageOptions)
    }


  } catch (error) {
    console.error('Error en Pinterest:', error)
    await sock.sendMessage(chatId, { 
      text: 'ꕤ Error al buscar en Pinterest' 
    })
  }
}