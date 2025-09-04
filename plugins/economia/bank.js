import { db } from '../../database/firebase.js'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { formatNumber } from '../../lib/utils.js'

export default {
  command: 'bank',
  aliases: ['banco'],
  description: 'Sistema bancario - depositar, retirar o ver balance',
  category: 'economia',
  async handler({ sock, message, args, chatId, sender }) {
    if (args.length < 1) {
      return sock.sendMessage(chatId, { 
        text: 'Uso del banco:\n/bank deposit [cantidad] - Depositar\n/bank withdraw [cantidad] - Retirar\n/bank balance - Ver balance bancario' 
      })
    }

    try {
      const userRef = doc(db, 'users', sender.split('@')[0])
      const userDoc = await getDoc(userRef)
      
      if (!userDoc.exists()) {
        return sock.sendMessage(chatId, { 
          text: 'No estás registrado. Usa /register nombre.edad' 
        })
      }

      const userData = userDoc.data()
      const action = args[0].toLowerCase()

      switch (action) {
        case 'deposit':
        case 'depositar':
          if (args.length < 2) {
            return sock.sendMessage(chatId, { 
              text: 'Especifica la cantidad a depositar\nEjemplo: /bank deposit 1000' 
            })
          }

          const depositAmount = parseInt(args[1])
          if (isNaN(depositAmount) || depositAmount <= 0) {
            return sock.sendMessage(chatId, { 
              text: 'La cantidad debe ser un número positivo' 
            })
          }

          if (userData.coins < depositAmount) {
            return sock.sendMessage(chatId, { 
              text: `No tienes suficientes coins\nTienes: ${formatNumber(userData.coins)} coins` 
            })
          }

          await updateDoc(userRef, {
            coins: userData.coins - depositAmount,
            bank: (userData.bank || 0) + depositAmount
          })

          await sock.sendMessage(chatId, { 
            text: `Depósito exitoso\nDepositado: ${formatNumber(depositAmount)} coins\nBalance bancario: ${formatNumber((userData.bank || 0) + depositAmount)} coins\nCoins disponibles: ${formatNumber(userData.coins - depositAmount)} coins` 
          })
          break

        case 'withdraw':
        case 'retirar':
          if (args.length < 2) {
            return sock.sendMessage(chatId, { 
              text: 'Especifica la cantidad a retirar\nEjemplo: /bank withdraw 1000' 
            })
          }

          const withdrawAmount = parseInt(args[1])
          if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            return sock.sendMessage(chatId, { 
              text: 'La cantidad debe ser un número positivo' 
            })
          }

          if ((userData.bank || 0) < withdrawAmount) {
            return sock.sendMessage(chatId, { 
              text: `No tienes suficiente dinero en el banco\nBalance bancario: ${formatNumber(userData.bank || 0)} coins` 
            })
          }

          await updateDoc(userRef, {
            coins: userData.coins + withdrawAmount,
            bank: (userData.bank || 0) - withdrawAmount
          })

          await sock.sendMessage(chatId, { 
            text: `Retiro exitoso\nRetirado: ${formatNumber(withdrawAmount)} coins\nBalance bancario: ${formatNumber((userData.bank || 0) - withdrawAmount)} coins\nCoins disponibles: ${formatNumber(userData.coins + withdrawAmount)} coins` 
          })
          break

        case 'balance':
        case 'bal':
          await sock.sendMessage(chatId, { 
            text: `Balance Bancario\nEn banco: ${formatNumber(userData.bank || 0)} coins\nDisponible: ${formatNumber(userData.coins)} coins\nTotal: ${formatNumber((userData.bank || 0) + userData.coins)} coins` 
          })
          break

        default:
          await sock.sendMessage(chatId, { 
            text: 'Acción no válida. Usa: deposit, withdraw o balance'
          })
      }
    } catch (error) {
      console.error('Error en bank:', error)
      await sock.sendMessage(chatId, { 
        text: 'Error en el sistema bancario'
      })
    }
  }
}