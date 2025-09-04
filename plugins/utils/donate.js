export const command = 'donate'
export const description = 'Información sobre donaciones'
export const category = 'utils'

export async function handler({ sock, message, args, chatId }) {
  try {
    const donateText = `💖 *APOYA A OSAKA BOT*

¡Hola! Si Osaka Bot te ha sido útil y quieres apoyar su desarrollo, puedes hacer una donación. Tu contribución nos ayuda a:

🔧 *Mantener el bot funcionando 24/7*
⚡ *Mejorar la velocidad y estabilidad*
🆕 *Desarrollar nuevas funcionalidades*
🛠️ *Corregir errores y mejorar comandos*
☁️ *Mantener servicios en la nube*

💝 *Formas de donar:*

☕ **Ko-fi (Recomendado)**
🔗 ko-fi.com/drexelcito

💳 **Otras opciones disponibles en Ko-fi:**
• PayPal
• Tarjetas de crédito/débito
• Donaciones recurrentes

🎁 *¿Qué obtienes al donar?*
• Nuestro eterno agradecimiento ❤️
• Prioridad en sugerencias y reportes
• Acceso temprano a nuevas funciones
• Reconocimiento como supporter

✨ *Cada donación, sin importar la cantidad, es muy apreciada y nos motiva a seguir mejorando el bot para todos.*

🤝 *¿No puedes donar?*
¡No hay problema! También puedes ayudar:
• Reportando errores con /report
• Sugiriendo mejoras con /suggest
• Compartiendo el bot con amigos
• Dando feedback sobre los comandos

💌 *Mensaje del creador:*
"Gracias por usar Osaka Bot. Vuestro apoyo hace posible que este proyecto siga creciendo y mejorando cada día."

📞 *Contacto:* wa.me/3115424166
🤍 *Con amor, el equipo de Osaka Bot*`

    await sock.sendMessage(chatId, {
      text: donateText,
      contextInfo: {
        externalAdReply: {
          title: "💖 Donar a Osaka Bot",
          body: "Apoya el desarrollo del bot",
          thumbnailUrl: "https://rogddqelmxyuvhpjvxbf.supabase.co/storage/v1/object/public/files/igq1z44n9bn.jpg",
          sourceUrl: "https://ko-fi.com/drexelcito",
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: true
        }
      }
    })
  } catch (error) {
    console.error('Error en donate:', error)
    await sock.sendMessage(chatId, { 
      text: '❌ Error al mostrar información de donaciones' 
    })
  }
}