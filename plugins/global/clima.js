import fetch from 'node-fetch'

export default {
  command: 'clima',
  description: 'Obtener información del clima de una ciudad',
  category: 'global',
  async handler({ sock, message, args, chatId }) {
    if (args.length < 1) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ Uso: */clima [ciudad]*\nEjemplo: /clima Bogotá'
      })
    }

    const ciudad = args.join(' ')
    
    try {
      await sock.sendMessage(chatId, { text: '🌤️ Obteniendo información del clima...' })
      
      const response = await fetch(`https://masha.sylphy.xyz/clima?q=${encodeURIComponent(ciudad)}&apikey=84a3ff6634fac3c8e64dc60a2db5fd96`)
      const data = await response.json()
      
      if (!data.result) {
        return sock.sendMessage(chatId, { 
          text: 'ꕤ No se encontró información del clima para esa ciudad'
        })
      }

      const weather = data.result
      
      const climaEmojis = {
        'clear': '☀️',
        'sunny': '☀️',
        'partly cloudy': '⛅',
        'cloudy': '☁️',
        'overcast': '☁️',
        'rain': '🌧️',
        'light rain': '🌦️',
        'heavy rain': '⛈️',
        'snow': '❄️',
        'thunderstorm': '⛈️',
        'fog': '🌫️',
        'mist': '🌫️'
      }
      
      const weatherEmoji = climaEmojis[weather.condition?.toLowerCase()] || '🌤️'
      
      const climaText = `${weatherEmoji} *CLIMA EN ${weather.location?.toUpperCase() || ciudad.toUpperCase()}*

🌡️ *Temperatura:* ${weather.temperature}°C
🌡️ *Sensación térmica:* ${weather.feels_like}°C
📊 *Condición:* ${weather.condition}
💧 *Humedad:* ${weather.humidity}%
🌬️ *Viento:* ${weather.wind_speed} km/h
👁️ *Visibilidad:* ${weather.visibility} km
🔽 *Presión:* ${weather.pressure} hPa

📅 *Fecha:* ${new Date().toLocaleDateString()}
🕐 *Hora:* ${new Date().toLocaleTimeString()}`

      await sock.sendMessage(chatId, {
        text: climaText
      })
    } catch (error) {
      console.error('Error en clima:', error)
      await sock.sendMessage(chatId, { 
        text: 'ꕤ Error al obtener información del clima'
      })
    }
  }
}