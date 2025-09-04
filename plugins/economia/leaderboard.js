import { db } from '../../database/firebase.js'
import { collection, getDocs, orderBy, limit, query } from 'firebase/firestore'
import { formatNumber } from '../../lib/utils.js'

export const command = 'leaderboard'
export const aliases = ['lb', 'top', 'ranking']
export const description = 'Ver el ranking de usuarios'

export async function handler(sock, message, args) {
  const chatId = message.key.remoteJid
  const sender = message.key.participant || message.key.remoteJid
  const userNumber = sender.split('@')[0]
  
  const category = args[0] || 'coins'
  
  try {
    let orderField, title, formatter

    switch (category.toLowerCase()) {
      case 'coins':
      case 'money':
        orderField = 'coins'
        title = 'TOP COINS'
        formatter = (val) => `${formatNumber(val)} coins`
        break
      case 'bank':
      case 'banco':
        orderField = 'bank'
        title = 'TOP BANCO'
        formatter = (val) => `${formatNumber(val)} coins`
        break
      case 'level':
      case 'nivel':
        orderField = 'level'
        title = 'TOP NIVEL'
        formatter = (val) => `Nivel ${val}`
        break
      case 'exp':
      case 'experiencia':
        orderField = 'exp'
        title = 'TOP EXPERIENCIA'
        formatter = (val) => `${formatNumber(val)} EXP`
        break
      case 'total':
        orderField = 'coins'
        title = 'TOP RIQUEZA TOTAL'
        formatter = null
        break
      default:
        return sock.sendMessage(chatId, { 
          text: 'Categorías disponibles:\n- coins (dinero)\n- bank (banco)\n- level (nivel)\n- exp (experiencia)\n- total (riqueza total)\n\nEjemplo: /lb coins' 
        })
    }

    const usersRef = collection(db, 'users')
    const q = query(usersRef, orderBy(orderField, 'desc'), limit(10))
    const snapshot = await getDocs(q)
    
    if (snapshot.empty) {
      return sock.sendMessage(chatId, { 
        text: 'ꕤ No hay usuarios registrados aún' 
      })
    }

    let leaderboardText = `${title}\n\n`
    let userPosition = null
    let userFound = false

    snapshot.docs.forEach((doc, index) => {
      const userData = doc.data()
      const userId = doc.id
      const position = index + 1
      
      if (userId === userNumber) {
        userFound = true
        userPosition = position
      }

      let value
      if (category.toLowerCase() === 'total') {
        value = (userData.coins || 0) + (userData.bank || 0)
        value = `${formatNumber(value)} coins`
      } else {
        value = formatter(userData[orderField] || 0)
      }

      const medal = position <= 3 ? ['🥇', '🥈', '🥉'][position - 1] : `${position}.`
      
      leaderboardText += `${medal} ${userData.name}\n${value}\n\n`
    })

    if (!userFound) {
      const allUsersQuery = query(usersRef, orderBy(orderField, 'desc'))
      const allSnapshot = await getDocs(allUsersQuery)
      
      allSnapshot.docs.forEach((doc, index) => {
        if (doc.id === userNumber) {
          userPosition = index + 1
        }
      })
    }

    if (userPosition) {
      leaderboardText += `Tu posición: #${userPosition}`
    }

    await sock.sendMessage(chatId, { text: leaderboardText })
  } catch (error) {
    console.error('Error en leaderboard:', error)
    await sock.sendMessage(chatId, { 
      text: 'ꕤ Error al obtener el ranking' 
    })
  }
}