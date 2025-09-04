import fetch from 'node-fetch'

export default {
  command: 'news',
  description: 'Obtener noticias recientes',
  category: 'global',
  async handler({ sock, message, args, chatId }) {
    try {
      await sock.sendMessage(chatId, { text: '📰 Obteniendo noticias recientes...' })
      
      const apiKey = '4e549578843944158ff24ce5bfe91056'
      const response = await fetch(`https://newsapi.org/v2/top-headlines?country=us&pageSize=5&apiKey=${apiKey}`)
      const data = await response.json()
      
      if (data.status !== 'ok' || !data.articles || data.articles.length === 0) {
        return sock.sendMessage(chatId, { 
          text: 'ꕤ No se pudieron obtener noticias en este momento'
        })
      }

      let newsText = `📰 *NOTICIAS RECIENTES*\n\n`
      
      data.articles.forEach((article, index) => {
        const publishedDate = new Date(article.publishedAt).toLocaleDateString()
        
        newsText += `${index + 1}. 📄 *${article.title}*\n`
        newsText += `📝 ${article.description || 'Sin descripción disponible'}\n`
        newsText += `📰 Fuente: ${article.source.name}\n`
        newsText += `📅 Fecha: ${publishedDate}\n`
        newsText += `🔗 ${article.url}\n\n`
      })

      newsText += `🕐 Última actualización: ${new Date().toLocaleString()}`

      await sock.sendMessage(chatId, {
        text: newsText
      })

      if (data.articles[0].urlToImage) {
        try {
          await sock.sendMessage(chatId, {
            image: { url: data.articles[0].urlToImage },
            caption: `🖼️ Imagen destacada: ${data.articles[0].title}`
          })
        } catch (imageError) {
          console.error('Error cargando imagen de noticia:', imageError)
        }
      }
    } catch (error) {
      console.error('Error en news:', error)
      try {
        await sock.sendMessage(chatId, { 
          text: `ꕤ Error: ${error.message || 'Error desconocido al obtener noticias'}` 
        })
      } catch (sendError) {
        console.error('Error al enviar mensaje de error:', sendError)
      }
    }
  }
}