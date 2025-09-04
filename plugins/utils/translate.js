import fetch from 'node-fetch'

export const command = 'translate'
export const description = 'Traduce texto usando Google Translate'
export const category = 'utils'

export async function handler({ sock, message, args, chatId }) {
  if (args.length < 1) {
    return sock.sendMessage(chatId, { 
      text: '❌ Uso: /translate [texto a traducir]\nEjemplo: /translate Hello world\n\n💡 Se detecta automáticamente el idioma y se traduce al español.' 
    })
  }

  const text = args.join(' ')
  
  try {
    await sock.sendMessage(chatId, { text: '🌐 Traduciendo texto...' })
    
    const response = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=' + encodeURIComponent(text))
    const data = await response.json()
    
    if (!data || !data[0] || !data[0][0]) {
      return sock.sendMessage(chatId, { 
        text: '❌ No se pudo traducir el texto' 
      })
    }

    let translatedText = ''
    data[0].forEach(item => {
      if (item[0]) {
        translatedText += item[0]
      }
    })

    const detectedLang = data[2] || 'desconocido'
    const languageNames = {
      'en': 'Inglés',
      'es': 'Español', 
      'fr': 'Francés',
      'de': 'Alemán',
      'it': 'Italiano',
      'pt': 'Portugués',
      'ru': 'Ruso',
      'ja': 'Japonés',
      'ko': 'Coreano',
      'zh': 'Chino',
      'ar': 'Árabe',
      'hi': 'Hindi'
    }

    const sourceLangName = languageNames[detectedLang] || detectedLang

    const resultText = `🌐 *TRADUCCIÓN*

📝 *Texto original:*
${text}

🔄 *Traducción:*
${translatedText}

🏷️ *Idioma detectado:* ${sourceLangName} → Español
🤖 *Traducido por:* Google Translate`

    await sock.sendMessage(chatId, {
      text: resultText
    })
  } catch (error) {
    console.error('Error en translate:', error)
    await sock.sendMessage(chatId, { 
      text: '❌ Error al traducir el texto' 
    })
  }
}