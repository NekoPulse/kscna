import { db } from '../../database/firebase.js'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { formatNumber } from '../../lib/utils.js'

export default {
  command: 'daily',
  aliases: ['diario'],
  description: 'Reclamar recompensa diaria',
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
      const lastDaily = userData.lastDaily || 0
      const cooldownTime = 24 * 60 * 60 * 1000
      const timeLeft = (lastDaily + cooldownTime) - now

      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60))
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)
        
        return sock.sendMessage(chatId, { 
          text: `ꕤ Ya reclamaste tu recompensa diaria\nTiempo restante: ${hours}h ${minutes}m ${seconds}s`
        })
      }

      const baseReward = 1000
      const levelBonus = (userData.level || 1) * 100
      const streakBonus = Math.min((userData.dailyStreak || 0) * 50, 500)
      const randomBonus = Math.floor(Math.random() * 500) + 100
      
      const totalReward = baseReward + levelBonus + streakBonus + randomBonus
      
      const isConsecutive = (now - lastDaily) <= (25 * 60 * 60 * 1000)
      const newStreak = isConsecutive ? (userData.dailyStreak || 0) + 1 : 1
      
      const expReward = 50 + Math.floor(Math.random() * 50)
      const newExp = (userData.exp || 0) + expReward
      
      let newLevel = userData.level || 1
      const expNeeded = newLevel * 1000
      if (newExp >= expNeeded) {
        newLevel += 1
      }

      await updateDoc(userRef, {
        coins: userData.coins + totalReward,
        exp: newExp,
        level: newLevel,
        lastDaily: now,
        dailyStreak: newStreak
      })

      let rewardText = `RECOMPENSA DIARIA RECLAMADA\n\n`
      rewardText += `Recompensa base: ${formatNumber(baseReward)} coins\n`
      rewardText += `Bonus por nivel: ${formatNumber(levelBonus)} coins\n`
      rewardText += `Bonus racha: ${formatNumber(streakBonus)} coins\n`
      rewardText += `Bonus aleatorio: ${formatNumber(randomBonus)} coins\n`
      rewardText += `EXP ganada: ${expReward}\n\n`
      rewardText += `Total recibido: ${formatNumber(totalReward)} coins\n`
      rewardText += `Coins totales: ${formatNumber(userData.coins + totalReward)}\n`
      rewardText += `Racha diaria: ${newStreak} días\n`
      rewardText += `EXP: ${newExp}/${newLevel * 1000}\n`
      
      if (newLevel > (userData.level || 1)) {
        rewardText += `\n¡NIVEL SUBIDO! Ahora eres nivel ${newLevel}`
      }

      await sock.sendMessage(chatId, { text: rewardText })
    } catch (error) {
      console.error('Error en daily:', error)
      await sock.sendMessage(chatId, { 
        text: 'ꕤ Error al reclamar recompensa diaria'
      })
    }
  }
}