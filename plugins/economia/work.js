import { dbManager } from '../../lib/database.js'
import { formatNumber } from '../../lib/utils.js'

export default {
  command: 'work',
  aliases: ['w'],
  description: 'Trabaja para ganar coins',
  category: 'economia',
  async handler({ sock, message, args, chatId, sender }) {
    console.log(`[WORK] Starting work command for ${sender}`);
    
    // Add validation for sender
    if (!sender) {
      console.error('[WORK] Sender is undefined in work command')
      return sock.sendMessage(chatId, {
        text: 'ꕤ Error: No se pudo identificar al usuario.'
      })
    }

    // Additional validation to ensure sender has the expected format
    if (typeof sender !== 'string' || !sender.includes('@')) {
      console.error('[WORK] Invalid sender format:', sender)
      return sock.sendMessage(chatId, {
        text: 'ꕤ Error: Formato de usuario inválido.'
      })
    }

    const userNumber = sender.split('@')[0]
    console.log(`[WORK] Processing work for user: ${userNumber}`);
   
    try {
      const user = await dbManager.getUser(userNumber)
      console.log(`[WORK] User data:`, user ? 'found' : 'not found');
     
      if (!user) {
        console.log(`[WORK] User not registered: ${userNumber}`);
        return sock.sendMessage(chatId, {
          text: 'ꕤ No estás registrado. Usa */register nombre.edad* para registrarte'
        })
      }
      
      const now = Date.now()
      const cooldownTime = 4 * 60 * 60 * 1000 // 4 horas
      const timeSinceLastWork = now - (user.lastWork || 0)
      
      console.log(`[WORK] Time since last work: ${timeSinceLastWork}ms, cooldown: ${cooldownTime}ms`);
     
      if (timeSinceLastWork < cooldownTime) {
        const remainingTime = cooldownTime - timeSinceLastWork
        const hours = Math.floor(remainingTime / (60 * 60 * 1000))
        const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000))
        
        console.log(`[WORK] User on cooldown: ${hours}h ${minutes}m remaining`);
        
        return sock.sendMessage(chatId, {
          text: `⏰ Debes esperar ${hours}h ${minutes}m antes de trabajar de nuevo`
        })
      }
      
      const jobs = [
        { name: 'Programador', emoji: '💻', min: 800, max: 1500 },
        { name: 'Chef', emoji: '👨‍🍳', min: 600, max: 1200 },
        { name: 'Médico', emoji: '⚕️', min: 1000, max: 1800 },
        { name: 'Artista', emoji: '🎨', min: 400, max: 1100 },
        { name: 'Músico', emoji: '🎵', min: 500, max: 1000 },
        { name: 'Escritor', emoji: '📝', min: 300, max: 900 },
        { name: 'Fotógrafo', emoji: '📸', min: 450, max: 950 },
        { name: 'Ingeniero', emoji: '⚙️', min: 700, max: 1400 },
        { name: 'Profesor', emoji: '👨‍🏫', min: 550, max: 1050 },
        { name: 'Diseñador', emoji: '🎯', min: 400, max: 1200 }
      ]
      
      const randomJob = jobs[Math.floor(Math.random() * jobs.length)]
      const earnings = Math.floor(Math.random() * (randomJob.max - randomJob.min + 1)) + randomJob.min
      
      console.log(`[WORK] Selected job: ${randomJob.name}, earnings: ${earnings}`);
     
      // Bonus por nivel
      const levelBonus = Math.floor(earnings * (user.level * 0.1))
      const totalEarnings = earnings + levelBonus
      
      console.log(`[WORK] Level bonus: ${levelBonus}, total earnings: ${totalEarnings}`);
     
      // Actualizar datos del usuario
      const newBalance = await dbManager.addCoins(userNumber, totalEarnings)
      console.log(`[WORK] New balance after adding coins: ${newBalance}`);
      
      const updateResult = await dbManager.updateUser(userNumber, {
        lastWork: now,
        exp: (user.exp || 0) + 25
      })
      console.log(`[WORK] Update user result: ${updateResult}`);
      
      // Sistema de niveles
      const newExp = (user.exp || 0) + 25
      const newLevel = Math.floor(newExp / 1000) + 1
      let levelUpText = ''
      
      console.log(`[WORK] New exp: ${newExp}, new level: ${newLevel}, current level: ${user.level}`);
     
      if (newLevel > user.level) {
        await dbManager.updateUser(userNumber, { level: newLevel })
        levelUpText = `\n\n🎉 ¡SUBISTE DE NIVEL! Nivel ${user.level} → ${newLevel}`
        console.log(`[WORK] User leveled up: ${user.level} -> ${newLevel}`);
      }
      
      // Prepare the message
      const workText = `💼 TRABAJO COMPLETADO

${randomJob.emoji} Trabajaste como: ${randomJob.name}
💰 Ganaste: ${formatNumber(earnings)} coins
⭐ Bonus de nivel: +${formatNumber(levelBonus)} coins
💎 Total recibido: ${formatNumber(totalEarnings)} coins
📊 Saldo actual: ${formatNumber(newBalance)} coins
🔮 EXP ganada: +25 (${newExp}/1000)
📈 Nivel: ${newLevel}${levelUpText}

⏰ Próximo trabajo: 4 horas`;
      
      console.log(`[WORK] Sending message to ${chatId}`);
      console.log(`[WORK] Message length: ${workText.length}`);
      console.log(`[WORK] Sock object exists: ${!!sock}`);
      console.log(`[WORK] SendMessage function exists: ${typeof sock.sendMessage}`);
      
      const messageResult = await sock.sendMessage(chatId, {
        text: workText
      });
      
      console.log(`[WORK] Message sent successfully, result:`, messageResult);
      console.log(`[WORK] Command completed successfully`);
      
    } catch (error) {
      console.error('[WORK] Error en work:', error)
      console.error('[WORK] Error stack:', error.stack);
      
      try {
        await sock.sendMessage(chatId, {
          text: 'ꕤ Error al trabajar. Intenta de nuevo.'
        })
      } catch (sendError) {
        console.error('[WORK] Error sending error message:', sendError);
      }
    }
  }
}