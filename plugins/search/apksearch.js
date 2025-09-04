import fetch from 'node-fetch'
import { checkFileSize } from '../../lib/utils.js'

export const command = 'apksearch'
export const description = 'Buscar aplicaciones en Aptoide'
export const category = 'search'

export async function handler({ sock, message, args, chatId }) {
  if (args.length < 1) {
    return sock.sendMessage(chatId, { 
      text: '📱 *Uso correcto:*\n/apksearch [nombre de la app]\n\n*Ejemplo:* /apksearch WhatsApp' 
    })
  }

  const query = args.join(' ')
  
  try {
    await sock.sendMessage(chatId, { 
      text: '🔍 Buscando aplicaciones en Aptoide...' 
    })
    
    const response = await fetch(`https://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(query)}/limit=3`)
    const data = await response.json()
    
    if (!data.datalist || !data.datalist.list || data.datalist.list.length === 0) {
      return sock.sendMessage(chatId, { 
        text: `❌ No se encontraron aplicaciones para: *${query}*\n\n💡 *Sugerencias:*\n• Revisa la ortografía\n• Usa términos más generales\n• Prueba en inglés` 
      })
    }

    const apps = data.datalist.list.slice(0, 3) // Limitar a 3 resultados
    
    for (const [index, app] of apps.entries()) {
      const fileSize = app.size || 0
      const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2)
      const rating = app.stats?.rating?.avg || 0
      const downloads = app.stats?.downloads || 0
      
      // Formatear número de descargas
      const formatDownloads = (num) => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
      }

      const resultText = `╭─「 📱 APP ${index + 1}/3 」
│ 🏷️ *Nombre:* ${app.name}
│ 📦 *Package:* ${app.package}
│ ⭐ *Rating:* ${rating.toFixed(1)}/5.0
│ 📥 *Downloads:* ${formatDownloads(downloads)}
│ 💾 *Tamaño:* ${fileSizeMB} MB
│ 🏪 *Store:* ${app.store?.name || 'Aptoide'}
│ 📋 *Versión:* ${app.file?.vername || 'N/A'}
╰─────────────────────────────

${fileSize > 10 * 1024 * 1024 ? 
  '⚠️ *Archivo muy grande (>10MB)*\nNo se puede enviar por WhatsApp' : 
  '✅ *Disponible para descarga*'}`

      const messageOptions = {
        text: resultText,
        contextInfo: {
          externalAdReply: {
            title: `📱 ${app.name}`,
            body: `⭐ ${rating.toFixed(1)}/5 • 💾 ${fileSizeMB} MB • 📥 ${formatDownloads(downloads)} downloads`,
            thumbnailUrl: app.icon || "https://rogddqelmxyuvhpjvxbf.supabase.co/storage/v1/object/public/files/apk-icon.png",
            sourceUrl: app.file?.path || `https://aptoide.com/search?q=${encodeURIComponent(app.name)}`,
            mediaType: 1,
            showAdAttribution: true,
            renderLargerThumbnail: false
          }
        }
      }

      await sock.sendMessage(chatId, messageOptions)

      // Si el archivo es descargable, enviarlo
      if (app.file?.path && fileSize <= 10 * 1024 * 1024) {
        try {
          const isValidSize = await checkFileSize(app.file.path, 10 * 1024 * 1024)
          if (isValidSize) {
            await sock.sendMessage(chatId, {
              text: `📥 *Descargando:* ${app.name}\n⏳ Por favor espera...`
            })
            
            await sock.sendMessage(chatId, {
              document: { url: app.file.path },
              fileName: `${app.name.replace(/[^\w\s]/gi, '')}_v${app.file?.vername || '1.0'}.apk`,
              mimetype: 'application/vnd.android.package-archive',
              contextInfo: {
                externalAdReply: {
                  title: `✅ ${app.name} descargado`,
                  body: "Toca para instalar • ⚠️ Habilita fuentes desconocidas",
                  thumbnailUrl: app.icon,
                  sourceUrl: app.file.path,
                  mediaType: 1,
                  showAdAttribution: false
                }
              }
            })
          }
        } catch (downloadError) {
          console.error('Error descargando APK:', downloadError)
          await sock.sendMessage(chatId, { 
            text: `❌ *Error al descargar:* ${app.name}\n🔗 Puedes descargarlo manualmente desde Aptoide` 
          })
        }
      }
    }

    // Mensaje final con botón de búsqueda web
    const finalMessage = {
      text: `🎉 *Búsqueda completada para:* ${query}\n\n💡 *¿No encontraste lo que buscabas?*\n• Prueba con otros términos\n• Busca directamente en Aptoide\n• Reporta si hay algún error\n\n⚠️ *Aviso de seguridad:* Solo se envían archivos <10MB`,
      contextInfo: {
        externalAdReply: {
          title: "🌐 Buscar en Aptoide Web",
          body: "Toca para abrir Aptoide en tu navegador",
          thumbnailUrl: "https://rogddqelmxyuvhpjvxbf.supabase.co/storage/v1/object/public/files/aptoide-logo.png",
          sourceUrl: `https://aptoide.com/search?q=${encodeURIComponent(query)}`,
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: false
        }
      }
    }

    await sock.sendMessage(chatId, finalMessage)

  } catch (error) {
    console.error('Error en APKSearch:', error)
    await sock.sendMessage(chatId, { 
      text: `❌ *Error inesperado*\n\n🔧 *Detalles técnicos:*\n${error.message}\n\n💬 *Reporta este error:* /report Error en apksearch: ${error.message}` 
    })
  }
}