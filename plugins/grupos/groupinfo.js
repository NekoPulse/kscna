export const command = 'groupinfo'
export const aliases = ['infogrupo', 'ginfo', 'infogroup']
export const description = 'Muestra información detallada del grupo'

export async function handler(sock, message, args) {
  const chatId = message.key.remoteJid
  
  if (!message.isGroup) {
    return sock.sendMessage(chatId, { 
      text: 'ꕤ Este comando solo funciona en grupos' 
    })
  }

  try {
    const groupMetadata = await sock.groupMetadata(chatId)
    const participants = groupMetadata.participants
    
    const totalMembers = participants.length
    const admins = participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin')
    const normalMembers = participants.filter(p => !p.admin)
    const superAdmins = participants.filter(p => p.admin === 'superadmin')
    const regularAdmins = participants.filter(p => p.admin === 'admin')
    
    const creationDate = new Date(groupMetadata.creation * 1000)
    const creationFormatted = creationDate.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const groupAge = Math.floor((Date.now() - (groupMetadata.creation * 1000)) / (1000 * 60 * 60 * 24))
    
    let infoText = `INFORMACIÓN DEL GRUPO\n\n`
    infoText += `Nombre: ${groupMetadata.subject}\n`
    infoText += `ID: ${groupMetadata.id}\n`
    infoText += `Creado: ${creationFormatted}\n`
    infoText += `Antigüedad: ${groupAge} días\n\n`
    
    infoText += `ESTADÍSTICAS DE MIEMBROS\n`
    infoText += `Total de miembros: ${totalMembers}\n`
    infoText += `Propietarios: ${superAdmins.length}\n`
    infoText += `Administradores: ${regularAdmins.length}\n`
    infoText += `Miembros normales: ${normalMembers.length}\n\n`
    
    if (groupMetadata.desc) {
      infoText += `DESCRIPCIÓN\n${groupMetadata.desc}\n\n`
    }
    
    infoText += `CONFIGURACIÓN\n`
    infoText += `Solo admins pueden enviar: ${groupMetadata.announce ? 'Sí' : 'No'}\n`
    infoText += `Solo admins pueden editar info: ${groupMetadata.restrict ? 'Sí' : 'No'}\n`
    
    if (groupMetadata.inviteCode) {
      infoText += `Código de invitación: ${groupMetadata.inviteCode}\n`
    }

    if (admins.length > 0) {
      infoText += `\nADMINISTRADORES\n`
      
      if (superAdmins.length > 0) {
        infoText += `Propietarios:\n`
        superAdmins.forEach((admin, index) => {
          if (index < 5) {
            infoText += `• @${admin.id.split('@')[0]}\n`
          }
        })
        if (superAdmins.length > 5) {
          infoText += `• y ${superAdmins.length - 5} más...\n`
        }
      }
      
      if (regularAdmins.length > 0) {
        infoText += `Administradores:\n`
        regularAdmins.forEach((admin, index) => {
          if (index < 5) {
            infoText += `• @${admin.id.split('@')[0]}\n`
          }
        })
        if (regularAdmins.length > 5) {
          infoText += `• y ${regularAdmins.length - 5} más...\n`
        }
      }
    }

    const allMentions = [...superAdmins.slice(0, 5), ...regularAdmins.slice(0, 5)].map(admin => admin.id)

    await sock.sendMessage(chatId, {
      text: infoText,
      mentions: allMentions
    })

  } catch (error) {
    console.error('Error en groupinfo:', error)
    await sock.sendMessage(chatId, { 
      text: 'ꕤ Error al obtener la información del grupo' 
    })
  }
}