import { dbManager } from '../../lib/database.js'

export default {
  command: 'register',
  description: 'Registrarse en el sistema de economía',
  category: 'economia',
  async handler({ sock, message, args, chatId, sender }) {
    // Add validation for sender
    if (!sender) {
      console.error('Sender is undefined in register command')
      return sock.sendMessage(chatId, {
        text: 'ꕤ Error: No se pudo identificar al usuario.'
      })
    }

    // Additional validation to ensure sender has the expected format
    if (typeof sender !== 'string' || !sender.includes('@')) {
      console.error('Invalid sender format:', sender)
      return sock.sendMessage(chatId, {
        text: 'ꕤ Error: Formato de usuario inválido.'
      })
    }

    const userNumber = sender.split('@')[0];
    console.log(`[REGISTER] Processing registration for: ${userNumber} (from ${sender})`);
   
    if (args.length < 1) {
      return sock.sendMessage(chatId, {
        text: 'ꕤ Uso: /register nombre.edad\nEjemplo: /register delta.19'
      })
    }
    
    const [name, age] = args[0].split('.')
    if (!name || !age || isNaN(age)) {
      return sock.sendMessage(chatId, {
        text: 'ꕤ Formato inválido. Usa: /register nombre.edad'
      })
    }
    
    try {
      console.log(`[REGISTER] Checking if user exists: ${userNumber}`);
      const existingUser = await dbManager.getUser(userNumber)
     
      if (existingUser) {
        console.log(`[REGISTER] User already exists: ${userNumber}`);
        return sock.sendMessage(chatId, {
          text: 'ꕤ Ya estás registrado en el sistema'
        })
      }
      
      const userData = {
        name,
        age: parseInt(age),
        coins: 1000,
        bank: 0,
        level: 1,
        exp: 0,
        lastWork: 0,
        lastDaily: 0,
        lastWeekly: 0,
        lastMonthly: 0,
        registeredAt: Date.now(),
        items: {}
      }
      
      console.log(`[REGISTER] Creating user: ${userNumber}`);
      const result = await dbManager.createUser(userNumber, userData)
      
      if (result) {
        console.log(`[REGISTER] User created successfully: ${userNumber}`);
        await sock.sendMessage(chatId, {
          text: `ꕥ ¡Registro exitoso!\n👤 Nombre: ${name}\n🎂 Edad: ${age}\n💰 Coins iniciales: 1,000`
        })
      } else {
        throw new Error('Failed to create user in database');
      }
    } catch (error) {
      console.error(`[REGISTER] Error en registro para ${userNumber}:`, error)
      await sock.sendMessage(chatId, {
        text: 'ꕤ Error al registrarse. Intenta de nuevo.'
      })
    }
  }
}