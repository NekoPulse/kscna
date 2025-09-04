import os from 'os'

export const command = 'status'
export const description = 'Muestra el estado del sistema'
export const category = 'status'

export async function handler({ sock, message, args, chatId }) {
  try {
    const uptime = process.uptime()
    const hours = Math.floor(uptime / 3600)
    const minutes = Math.floor((uptime % 3600) / 60)
    const seconds = Math.floor(uptime % 60)
    
    const totalMemory = os.totalmem()
    const freeMemory = os.freemem()
    const usedMemory = totalMemory - freeMemory
    
    const memoryUsage = process.memoryUsage()
    
    const formatBytes = (bytes) => {
      const sizes = ['B', 'KB', 'MB', 'GB']
      if (bytes === 0) return '0 B'
      const i = Math.floor(Math.log(bytes) / Math.log(1024))
      return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
    }
    
    const statusText = `📊 *ESTADO DEL SISTEMA*

⏰ *Tiempo Online:* ${hours}h ${minutes}m ${seconds}s
🖥️ *Plataforma:* ${os.platform()} ${os.arch()}
💻 *Node.js:* ${process.version}
🏠 *Hostname:* ${os.hostname()}

💾 *Memoria del Sistema:*
• Total: ${formatBytes(totalMemory)}
• Usada: ${formatBytes(usedMemory)}
• Libre: ${formatBytes(freeMemory)}
• Uso: ${((usedMemory / totalMemory) * 100).toFixed(1)}%

🔧 *Memoria del Bot:*
• RSS: ${formatBytes(memoryUsage.rss)}
• Heap Total: ${formatBytes(memoryUsage.heapTotal)}
• Heap Usado: ${formatBytes(memoryUsage.heapUsed)}
• Externa: ${formatBytes(memoryUsage.external)}

🖥️ *CPU:*
• Núcleos: ${os.cpus().length}
• Modelo: ${os.cpus()[0].model}
• Velocidad: ${os.cpus()[0].speed} MHz

📈 *Estado:* ✅ Operativo`

    await sock.sendMessage(chatId, {
      text: statusText
    })
  } catch (error) {
    console.error('Error en status:', error)
    await sock.sendMessage(chatId, { 
      text: 'ꕤ Error al obtener el estado del sistema' 
    })
  }
}