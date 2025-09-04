import QRCode from 'qrcode'

export const command = 'qrcode'
export const description = 'Genera un código QR'
export const category = 'utils'

export async function handler({ sock, message, args, chatId }) {
  if (args.length < 1) {
    return sock.sendMessage(chatId, { 
      text: '❌ Uso: /qrcode [texto o URL]\nEjemplo: /qrcode https://whatsapp.com\nEjemplo: /qrcode Hola mundo!' 
    })
  }

  const text = args.join(' ')
  
  if (text.length > 500) {
    return sock.sendMessage(chatId, {
      text: '❌ El texto es muy largo (máximo 500 caracteres)'
    })
  }

  try {
    await sock.sendMessage(chatId, { text: '🔲 Generando código QR...' })
    
    const qrBuffer = await QRCode.toBuffer(text, {
      type: 'png',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })

    const caption = `🔲 *CÓDIGO QR GENERADO*

📝 *Contenido:* ${text}
📱 *Escanea con tu cámara para acceder*
🤖 *Generado por Osaka Bot*`

    await sock.sendMessage(chatId, {
      image: qrBuffer,
      caption: caption
    })
  } catch (error) {
    console.error('Error en qrcode:', error)
    await sock.sendMessage(chatId, { 
      text: '❌ Error al generar el código QR' 
    })
  }
}