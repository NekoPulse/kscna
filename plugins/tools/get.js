import fetch from 'node-fetch'

export const command = 'get'
export const description = 'Realiza solicitudes GET a páginas web'
export const category = 'tools'

export async function handler({ sock, message, args, chatId }) {
  if (args.length < 1) {
    return sock.sendMessage(chatId, { 
      text: '❌ Uso: /get [URL]\nEjemplo: /get https://api.github.com/users/octocat' 
    })
  }

  let url = args.join(' ')
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }

  try {
    new URL(url)
  } catch {
    return sock.sendMessage(chatId, {
      text: '❌ URL inválida\n\n✅ Ejemplos válidos:\n• https://example.com\n• api.github.com\n• www.google.com'
    })
  }

  try {
    await sock.sendMessage(chatId, { text: '🌐 Realizando solicitud GET...' })

    const startTime = Date.now()
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Osaka-Bot/1.0'
      },
      timeout: 10000
    })
    const endTime = Date.now()

    const responseTime = endTime - startTime
    const contentLength = response.headers.get('content-length')
    const contentType = response.headers.get('content-type')
    
    let responseText = `🌐 *RESPUESTA HTTP GET*

🔗 *URL:* ${url}
📊 *Código:* ${response.status} ${response.statusText}
⏱️ *Tiempo:* ${responseTime}ms
📏 *Tamaño:* ${contentLength ? `${(contentLength / 1024).toFixed(2)} KB` : 'N/A'}
🏷️ *Tipo:* ${contentType || 'N/A'}`

    if (response.ok) {
      try {
        const text = await response.text()
        
        if (contentType?.includes('application/json')) {
          try {
            const json = JSON.parse(text)
            const jsonPreview = JSON.stringify(json, null, 2).substring(0, 800)
            responseText += `\n\n📄 *Contenido JSON:*\n\`\`\`json\n${jsonPreview}${text.length > 800 ? '\n...(truncado)' : ''}\n\`\`\``
          } catch {
            responseText += `\n\n📄 *Contenido:*\n\`\`\`\n${text.substring(0, 500)}${text.length > 500 ? '\n...(truncado)' : ''}\n\`\`\``
          }
        } else if (contentType?.includes('text/')) {
          responseText += `\n\n📄 *Contenido:*\n\`\`\`\n${text.substring(0, 800)}${text.length > 800 ? '\n...(truncado)' : ''}\n\`\`\``
        } else {
          responseText += `\n\n📄 *Contenido:* Datos binarios (${contentType})`
        }
      } catch (textError) {
        responseText += `\n\n❌ Error al leer el contenido de la respuesta`
      }
    } else {
      responseText += `\n\n❌ *Error:* La solicitud falló`
    }

    responseText += `\n\n📋 *Headers principales:*`
    const importantHeaders = ['server', 'cache-control', 'content-encoding', 'location']
    importantHeaders.forEach(header => {
      const value = response.headers.get(header)
      if (value) {
        responseText += `\n• ${header}: ${value}`
      }
    })

    if (responseText.length > 4000) {
      responseText = responseText.substring(0, 4000) + '\n\n...(respuesta truncada)'
    }

    await sock.sendMessage(chatId, {
      text: responseText
    })
  } catch (error) {
    console.error('Error en get:', error)
    
    let errorMessage = '❌ Error al realizar la solicitud'
    if (error.code === 'ENOTFOUND') {
      errorMessage += '\n🔍 No se pudo encontrar el servidor'
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage += '\n🚫 Conexión rechazada'
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage += '\n⏰ Tiempo de espera agotado'
    } else if (error.message.includes('timeout')) {
      errorMessage += '\n⏰ La solicitud tardó demasiado'
    }
    
    await sock.sendMessage(chatId, { text: errorMessage })
  }
}