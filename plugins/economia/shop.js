import { formatNumber } from '../../lib/utils.js'

const shopItems = {
  'potion': {
    name: 'Poción de Salud',
    price: 500,
    description: 'Restaura salud en batallas',
    emoji: '🧪'
  },
  'sword': {
    name: 'Espada Básica',
    price: 1500,
    description: 'Aumenta tu ataque en batallas',
    emoji: '⚔️'
  },
  'shield': {
    name: 'Escudo Básico',
    price: 1200,
    description: 'Aumenta tu defensa',
    emoji: '🛡️'
  },
  'gem': {
    name: 'Gema Preciosa',
    price: 2500,
    description: 'Item raro y valioso',
    emoji: '💎'
  },
  'key': {
    name: 'Llave Misteriosa',
    price: 800,
    description: 'Abre cofres especiales',
    emoji: '🔑'
  },
  'book': {
    name: 'Libro de Sabiduría',
    price: 1000,
    description: 'Aumenta la experiencia ganada',
    emoji: '📚'
  },
  'ring': {
    name: 'Anillo de Fortuna',
    price: 3000,
    description: 'Aumenta las ganancias de trabajo',
    emoji: '💍'
  },
  'chest': {
    name: 'Cofre del Tesoro',
    price: 5000,
    description: 'Contiene items aleatorios',
    emoji: '📦'
  }
}

// Export for other commands to use
export { shopItems }

export default {
  command: 'shop',
  aliases: ['tienda', 'store'],
  description: 'Ver la tienda de items',

  async handler({ sock, message, args, chatId }) {
    if (args.length > 0) {
      const itemId = args[0].toLowerCase()
      const item = shopItems[itemId]
      
      if (item) {
        await sock.sendMessage(chatId, { 
          text: `${item.emoji} ${item.name}\nPrecio: ${formatNumber(item.price)} coins\nDescripción: ${item.description}\n\nPara comprar usa: /buy ${itemId}` 
        })
      } else {
        await sock.sendMessage(chatId, { 
          text: 'ꕤ Item no encontrado en la tienda' 
        })
      }
      return
    }

    let shopText = 'TIENDA OFICIAL\n\n'
    
    for (const [id, item] of Object.entries(shopItems)) {
      shopText += `${item.emoji} ${item.name}\n`
      shopText += `Precio: ${formatNumber(item.price)} coins\n`
      shopText += `ID: ${id}\n\n`
    }
    
    shopText += 'Para ver detalles: /shop [id]\n'
    shopText += 'Para comprar: /buy [id] [cantidad]'
    
    await sock.sendMessage(chatId, { text: shopText })
  }
}
