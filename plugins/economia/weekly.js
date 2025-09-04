import { db } from '../../database/firebase.js'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { formatNumber, randomFromArray } from '../../lib/utils.js'
import { shopItems } from './shop.js'

export default {
  command: 'weekly',
  aliases: ['semanal'],
  description: 'Reclamar recompensa semanal',
  category: 'economia',
  async handler({ sock, message, args, chatId, sender }) {
    const userNumber = sender.split('@')[0]
    
    try {
      const userRef = doc(db, 'users', userNumber)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        return sock.sendMessage(chatId, { 
          text: 'ꕤ No estás registrado. Usa */register nombre.edad*'
        })
      }

      const userData = userDoc.data()
      const now = Date.now()
      const lastWeekly = userData.lastWeekly || 0
      const cooldownTime = 7 * 24 * 60 * 60 * 1000
      const timeLeft = (lastWeekly + cooldownTime) - now

      if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
        
        return sock.sendMessage(chatId, { 
          text: `ꕤ Ya reclamaste tu recompensa semanal\nTiempo restante: ${days}d ${hours}h ${minutes}m`
        })
      }

      const baseCoins = 5000
      const levelBonus = (userData.level || 1) * 500
      const randomBonus = Math.floor(Math.random() * 2000) + 500
      
      const totalCoins = baseCoins + levelBonus + randomBonus
      const expReward = 200 + Math.floor(Math.random() * 200)
      
      const itemKeys = Object.keys(shopItems)
      const randomItems = []
      const numItems = Math.floor(Math.random() * 3) + 1
      
      for (let i = 0; i < numItems; i++) {
        const randomItem = randomFromArray(itemKeys)
        const quantity = Math.floor(Math.random() * 3) + 1
        randomItems.push({ id: randomItem, quantity })
      }

      const newExp = (userData.exp || 0) + expReward
      let newLevel = userData.level || 1
      const expNeeded = newLevel * 1000
      if (newExp >= expNeeded) {
        newLevel += 1
      }

      const updateData = {
        coins: userData.coins + totalCoins,
        exp: newExp,
        level: newLevel,
        lastWeekly: now
      }

      const currentItems = userData.items || {}
      randomItems.forEach(item => {
        const currentQuantity = currentItems[item.id] || 0
        updateData[`items.${item.id}`] = currentQuantity + item.quantity
      })

      await updateDoc(userRef, updateData)

      let rewardText = `RECOMPENSA SEMANAL RECLAMADA\n\n`
      rewardText += `Recompensa base: ${formatNumber(baseCoins)} coins\n`
      rewardText += `Bonus por nivel: ${formatNumber(levelBonus)} coins\n`
      rewardText += `Bonus aleatorio: ${formatNumber(randomBonus)} coins\n`
      rewardText += `EXP ganada: ${expReward}\n\n`
      rewardText += `Total coins: ${formatNumber(totalCoins)}\n`
      rewardText += `Coins totales: ${formatNumber(userData.coins + totalCoins)}\n\n`
      
      rewardText += `ITEMS OBTENIDOS:\n`
      randomItems.forEach(item => {
        const shopItem = shopItems[item.id]
        rewardText += `${shopItem.emoji} ${shopItem.name} x${item.quantity}\n`
      })
      
      if (newLevel > (userData.level || 1)) {
        rewardText += `\n¡NIVEL SUBIDO! Ahora eres nivel ${newLevel}`
      }

      await sock.sendMessage(chatId, { text: rewardText })
    } catch (error) {
      console.error('Error en weekly:', error)
      await sock.sendMessage(chatId, { 
        text: 'Error al reclamar recompensa semanal'
      })
    }
  }
}