import { db } from '../../database/firebase.js'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { shopItems } from './shop.js'
import { formatNumber } from '../../lib/utils.js'

export default {
  command: 'buy',
  aliases: ['comprar'],
  description: 'Comprar items de la tienda',
  category: 'economia',
  async handler({ sock, message, args, chatId, sender }) {
    const userNumber = sender.split('@')[0]
    
    if (args.length < 1) {
      return sock.sendMessage(chatId, { 
        text: 'Uso: /buy [item] [cantidad]\nEjemplo: /buy potion 3\n\nVer tienda: /shop' 
      })
    }

    try {
      const userRef = doc(db, 'users', userNumber)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        return sock.sendMessage(chatId, { 
          text: 'No estás registrado. Usa /register nombre.edad'
        })
      }

      const userData = userDoc.data()
      const itemId = args[0].toLowerCase()
      const quantity = parseInt(args[1]) || 1
      
      const item = shopItems[itemId]
      if (!item) {
        return sock.sendMessage(chatId, { 
          text: 'Item no encontrado. Usa /shop para ver items disponibles'
        })
      }

      if (quantity <= 0 || quantity > 100) {
        return sock.sendMessage(chatId, { 
          text: 'La cantidad debe ser entre 1 y 100'
        })
      }

      const totalCost = item.price * quantity
      
      if (userData.coins < totalCost) {
        return sock.sendMessage(chatId, { 
          text: `No tienes suficientes coins\nCosto total: ${formatNumber(totalCost)} coins\nTienes: ${formatNumber(userData.coins)} coins\nNecesitas: ${formatNumber(totalCost - userData.coins)} coins más` 
        })
      }

      const currentItems = userData.items || {}
      const currentQuantity = currentItems[itemId] || 0
      
      await updateDoc(userRef, {
        coins: userData.coins - totalCost,
        [`items.${itemId}`]: currentQuantity + quantity
      })

      await sock.sendMessage(chatId, { 
        text: `Compra exitosa!\n\n${item.emoji} ${item.name}\nCantidad: ${quantity}\nCosto total: ${formatNumber(totalCost)} coins\nCoins restantes: ${formatNumber(userData.coins - totalCost)}\n\nAhora tienes ${currentQuantity + quantity} ${item.name}` 
      })
    } catch (error) {
      console.error('Error en buy:', error)
      await sock.sendMessage(chatId, { 
        text: 'Error al realizar la compra'
      })
    }
  }
}