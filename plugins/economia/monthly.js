import { db } from '../../database/firebase.js'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { formatNumber, randomFromArray } from '../../lib/utils.js'
import { shopItems } from './shop.js'

export default {
  command: 'monthly',
  aliases: ['mensual'],
  description: 'Reclamar recompensa mensual',
  category: 'economia',
  async handler({ sock, message, args, chatId, sender }) {
    const userNumber = sender.split('@')[0]
    
    try {
      const userRef = doc(db, 'users', userNumber)
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        return sock.sendMessage(chatId, { 
          text: 'ꕤ No estás registrado. Usa /register nombre.edad' 
        })
      }

      const userData = userDoc.data()
      const now = Date.now()
      const lastMonthly = userData.lastMonthly || 0
      const cooldownTime = 30 * 24 * 60 * 60 * 1000
      const timeLeft = (lastMonthly + cooldownTime) - now

      if (timeLeft > 0) {
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        
        return sock.sendMessage(chatId, { 
          text: `ꕤ Ya reclamaste tu recompensa mensual\nTiempo restante: ${days} días ${hours} horas` 
        })
      }

      const baseCoins = 20000
      const levelBonus = (userData.level || 1) * 2000
      const loyaltyBonus = Math.floor((now - (userData.registeredAt || now)) / (1000 * 60 * 60 * 24 * 30)) * 5000
      const randomBonus = Math.floor(Math.random() * 10000) + 2000
      
      const totalCoins = baseCoins + levelBonus + loyaltyBonus + randomBonus
      const expReward = 1000 + Math.floor(Math.random() * 1000)
      
      const premiumItems = ['gem', 'ring', 'chest', 'book']
      const guaranteedItems = []
      
      for (let i = 0; i < 2; i++) {
        const randomItem = randomFromArray(premiumItems)
        const quantity = Math.floor(Math.random() * 2) + 1
        guaranteedItems.push({ id: randomItem, quantity })
      }
      
      const bonusItems = []
      const itemKeys = Object.keys(shopItems)
      const numBonusItems = Math.floor(Math.random() * 4) + 2
      
      for (let i = 0; i < numBonusItems; i++) {
        const randomItem = randomFromArray(itemKeys)
        const quantity = Math.floor(Math.random() * 5) + 1
        bonusItems.push({ id: randomItem, quantity })
      }

      const allItems = [...guaranteedItems, ...bonusItems]
      
      const newExp = (userData.exp || 0) + expReward
      let newLevel = userData.level || 1
      let levelUps = 0
      
      while (newExp >= (newLevel * 1000)) {
        newLevel += 1
        levelUps += 1
      }

      const updateData = {
        coins: userData.coins + totalCoins,
        exp: newExp,
        level: newLevel,
        lastMonthly: now
      }

      const currentItems = userData.items || {}
      allItems.forEach(item => {
        const currentQuantity = currentItems[item.id] || 0
        updateData[`items.${item.id}`] = currentQuantity + item.quantity
      })

      await updateDoc(userRef, updateData)

      let rewardText = `RECOMPENSA MENSUAL RECLAMADA\n\n`
      rewardText += `Recompensa base: ${formatNumber(baseCoins)} coins\n`
      rewardText += `Bonus por nivel: ${formatNumber(levelBonus)} coins\n`
      
      if (loyaltyBonus > 0) {
        rewardText += `Bonus lealtad: ${formatNumber(loyaltyBonus)} coins\n`
      }
      
      rewardText += `Bonus aleatorio: ${formatNumber(randomBonus)} coins\n`
      rewardText += `EXP ganada: ${expReward}\n\n`
      rewardText += `TOTAL COINS: ${formatNumber(totalCoins)}\n`
      rewardText += `Coins totales: ${formatNumber(userData.coins + totalCoins)}\n\n`
      
      rewardText += `ITEMS PREMIUM GARANTIZADOS:\n`
      guaranteedItems.forEach(item => {
        const shopItem = shopItems[item.id]
        rewardText += `${shopItem.emoji} ${shopItem.name} x${item.quantity}\n`
      })
      
      rewardText += `\nITEMS BONUS:\n`
      bonusItems.forEach(item => {
        const shopItem = shopItems[item.id]
        rewardText += `${shopItem.emoji} ${shopItem.name} x${item.quantity}\n`
      })
      
      if (levelUps > 0) {
        rewardText += `\n¡SUBISTE ${levelUps} NIVEL(ES)! Ahora eres nivel ${newLevel}`
      }

      await sock.sendMessage(chatId, { text: rewardText })
    } catch (error) {
      console.error('Error en monthly:', error)
      await sock.sendMessage(chatId, { 
        text: 'ꕤ Error al reclamar recompensa mensual'
      })
    }
  }
}