import fetch from 'node-fetch'

export const command = 'spotify'
export const description = 'Buscar canciones en Spotify'
export const category = 'search'

export async function handler({ sock, message, args, chatId }) {
  if (args.length < 1) {
    return sock.sendMessage(chatId, { 
      text: 'ꕤ Uso: /spotify [nombre de la canción]' 
    })
  }

  const query = args.join(' ')
  
  try {
    await sock.sendMessage(chatId, { text: '🎵 Buscando en Spotify...' })
    
    const response = await fetch(`https://spotify-searchable.vercel.app/api/spotify/search?q=${encodeURIComponent(query)}&limit=3`, {
      timeout: 30000, // 30 segundos de timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })
    const data = await response.json()
    
    if (!data.items || data.items.length === 0) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ No se encontraron resultados en Spotify' 
      })
    }

    // Enviar cada canción con su imagen y botón
    for (const [index, track] of data.items.entries()) {
      const artists = track.artists.join(', ')
      const duration = `${Math.floor(track.duration_ms / 60000)}:${Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')}`
      
      const trackText = `╭─「 🎵 CANCIÓN ${index + 1}/3 」
│ 🎧 *${track.name}*
│ 👤 *Artista:* ${artists}
│ 💿 *Álbum:* ${track.album.name}
│ ⏰ *Duración:* ${duration}
╰─────────────────────────────

🎶 *Encontrado en Spotify*`

      // Obtener imagen del álbum (la más grande disponible)
      const albumImage = track.album.images && track.album.images.length > 0 
        ? track.album.images[0].url 
        : "https://rogddqelmxyuvhpjvxbf.supabase.co/storage/v1/object/public/files/spotify-default.png"

      const messageOptions = {
        image: { url: albumImage },
        caption: trackText,
        contextInfo: {
          externalAdReply: {
            title: `🎵 Escuchar en Spotify`,
            body: `${track.name} - ${artists}`,
            thumbnailUrl: albumImage,
            sourceUrl: track.external_url,
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: false
          }
        }
      }

      await sock.sendMessage(chatId, messageOptions)
    }

    // Mensaje final con botón para abrir Spotify
    const finalMessage = {
      text: `🎉 *Búsqueda completada para:* ${query}\n\n💡 *¿Te gustaron las canciones?*\n• Toca los botones para escuchar\n• Busca más música en Spotify\n• Comparte tus favoritas\n\n🎵 *¡Disfruta la música!*`,
      contextInfo: {
        externalAdReply: {
          title: "🎵 Abrir Spotify Web",
          body: "Buscar más música en Spotify",
          thumbnailUrl: "https://rogddqelmxyuvhpjvxbf.supabase.co/storage/v1/object/public/files/spotify-logo.png",
          sourceUrl: `https://open.spotify.com/search/${encodeURIComponent(query)}`,
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: false
        }
      }
    }

    await sock.sendMessage(chatId, finalMessage)
  } catch (error) {
    console.error('Error en Spotify:', error)
    await sock.sendMessage(chatId, { 
      text: 'ꕤ Error al buscar en Spotify' 
    })
  }
}