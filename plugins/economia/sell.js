import { db } from '../../database/firebase.js'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { shopItems } from './shop.js'
import { formatNumber } from '../../lib/utils.js'

export default {
  command: 'sell',
  aliases: ['vender'],
  description: 'Vender items del inventario',
  category: 'economia',
  async handler({ sock, message, args, chatId, sender }) {
    const userNumber = sender.split('@')[0]
    
    if (args.length < 1) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ Uso: /sell [item] [cantidad]\nEjemplo: /sell potion 2\nPara vender todo: /sell [item] all' 
      })
    }

    try {
      const userRef = doc(db, 'users', userNumber)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        return sock.sendMessage(chatId, { 
          text: 'ꕤ No estás registrado. Usa /register nombre.edad' 
        })
      }

      const userData = userDoc.data()
      const itemId = args[0].toLowerCase()
      const quantityArg = args[1] || '1'
      
      const item = shopItems[itemId]
      if (!item) {
        return sock.sendMessage(chatId, { 
          text: 'ꕤ Item no encontrado'
        })
      }

      const userItems = userData.items || {}
      const currentQuantity = userItems[itemId] || 0
      
      if (currentQuantity <= 0) {
        return sock.sendMessage(chatId, { 
          text: `ꕤ No tienes ${item.name} en tu inventario` 
        })
      }

      let quantity
      if (quantityArg.toLowerCase() === 'all') {
        quantity = currentQuantity
      } else {
        quantity = parseInt(quantityArg)
        if (isNaN(quantity) || quantity <= 0) {
          return sock.sendMessage(chatId, { 
            text: 'ꕤ La cantidad debe ser un número positivo o "all"'
          })
        }
      }

      if (quantity > currentQuantity) {
        return sock.sendMessage(chatId, { 
          text: `ꕤ Solo tienes ${currentQuantity} ${item.name}` 
        })
      }

      const sellPrice = Math.floor(item.price * 0.7)
      const totalEarnings = sellPrice * quantity
      const newQuantity = currentQuantity - quantity
      
      const updateData = {
        coins: userData.coins + totalEarnings
      }

      if (newQuantity <= 0) {
        updateData[`items.${itemId}`] = 0
      } else {
        updateData[`items.${itemId}`] = newQuantity
      }

      await updateDoc(userRef, updateData)

      await sock.sendMessage(chatId, { 
        text: `Venta exitosa!\n\n${item.emoji} ${item.name}\nCantidad vendida: ${quantity}\nPrecio unitario: ${formatNumber(sellPrice)} coins (70% del precio original)\nTotal recibido: ${formatNumber(totalEarnings)} coins\nCoins totales: ${formatNumber(userData.coins + totalEarnings)}\n\nTe quedan ${newQuantity} ${item.name}` 
      })
    } catch (error) {
      console.error('Error en sell:', error)
      await sock.sendMessage(chatId, { 
        text: 'ꕤ Error al vender el item'
      })
    }
  }
}