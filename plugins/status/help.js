export const command = 'help'
export const aliases = ['menu']
export const description = 'Muestra el menú de ayuda'
export const category = 'status'

export async function handler({ sock, message, args, chatId }) {
  try {
    const helpText = `╔═❖═《 🤍 Osaka 🤍 》═❖═╗
║ ☄ Powered By Starkness
╟──────────────────────╢
║ ✧ Total Cmds: 70
║ ✧ Tiempo Online: Undefined
║ ✧ Registros: 0
║ ✧ Modo: Bot Official | wa.me/573143224157
║ ✧ Creador: wa.me/3115424166
╚══════════════════════╝

[👥 GRUPOS]
> */ban* + _[ @user ]_
╰┈➤ *_Banea a un usuario del grupo_*

> */groupinfo* 
╰┈➤ *_Muestra informacion del grupo_*

> */kick* + _[ @user ]_ 
╰┈➤ *_Expulsa a un usuario del grupo_*

> */promote* › */demote* + _[ @user ]_
╰┈➤

> */tag* › */hidetag* + _[ texto ]_
╰┈➤ *_Etiqueta a todos los usuarios del grupo con un texto_*

> */enable* › */disable* + _[ antilink | welcome ]_
╰┈➤ *_Activa o desactiva una opcion_*

> */link*
╰┈➤ *_Muestra el link del grupo_*

[📊 STATUS]
> */ping* › */p*
╰┈➤ *_Muestra cuanto tarda el bot_*

> */status*
╰┈➤ Muestra el estado del sistema

> */sockets*
╰┈➤ *_Muestra el numero de sockets conectados_*

> */help* › */menu*
╰┈➤ *_Muestra el menu principal_*

[🔎 Search]
> */pinterest* + _[ texto ]_
╰┈➤ *_Busca una imagen en pinterest_*

> */spotify* + _[ texto ]_
╰┈➤ *_Busca una cancion en spotify_*

> */ytsearch* + _[ texto ]_
╰┈➤ *_Busca un video en Youtube_*

> */tiktok* › */ttk* + _[ texto ]_
╰┈➤ *_Busca un video en tiktok_*

> */google* + _[ texto ]_
╰┈➤ *_Busca informacion en Google_*

> */apksearch* + _[ texto ]_
╰┈➤ *_Busca una aplicacion en apdoide_*

[🌍 GLOBAL]
> */clima* + _[ ciudad ]_
╰┈➤ *_Mira el clima en tu ciudad y/o pais_*

> */news*
╰┈➤ *_Mira noticias recientes_*

[⚒️ TOOLS]
> */getprofile* › */pfp* + _[ @user ]_
╰┈➤ *_Obtiene la foto de perfil de un usuario_*

> */sticker* › */s* + _[ imagen ]_
╰┈➤ *_Convierte una imagen en sticker_*

> */upload* › */up* + _[ archivo ]_
╰┈➤ *_Sube un archivo a Osaka Cloud Storage_* *(MAX: 10 MB)*

> */download* › */dl* + _[ enlace ]_
╰┈➤ *_Descarga un archivo de Osaka Cloud Storage_*

> */delete* › */del* + _[ enlace ]_
╰┈➤ *_Elimina un archivo de Osaka Cloud Storage_*

> */list* › */ls*
╰┈➤ *_Muestra la lista de archivos en Osaka Cloud Storage_*

> */info* › */i*
╰┈➤ *_Muestra informacion del archivo_*

> */get* + _[ enlace ]_
╰┈➤ *_Realiza solicitudes get a paginas_*


[✍️ UTILS]
> */translate* + _[ texto ]_
╰┈➤ *_Traduce un texto_*

> */qrcode* + _[ texto ]_
╰┈➤ *_Genera un codigo QR_*

> */report* + _[ error ]_
╰┈➤ *_Reporte un error al staff_*

> */suggest* + _[ sugerencia ]_
╰┈➤ *_Sugiere una nueva funcionalidad_*

> */donate*
╰┈➤ *_Donar al bot_*

[🎭 DIVERSIÓN]

> */hug* + _[ @user ]_
╰┈➤ *_Abraza a un usuario_*

> */kiss* + _[ @user ]_
╰┈➤ *_Besos a un usuario_*

> */pat* + _[ @user ]_
╰┈➤ *_Patada a un usuario_*

> */slap* + _[ @user ]_
╰┈➤ *_Da una cachetada a un usuario_*

> */tickle* + _[ @user ]_
╰┈➤ *_Haz cosquillas a un usuario_*

> */wink* + _[ @user ]_
╰┈➤ *_Guiña a un usuario_*

[💸 ECONOMIA]
> */work* › */w* 
╰┈➤ *_Trabaja para ganar coins_*

> */balance* › */bal* 
╰┈➤ *_Muestra tu balance_*

> */pay* + _[ @user | coins ]_
╰┈➤ *_Paga a un usuario_*

> */rob* + _[ @user ]_
╰┈➤ *_Roba coins a un usuario_*

> */shop* › */s* 
╰┈➤ *_Muestra la tienda_*

> */buy* + _[ item ]_
╰┈➤ *_Compra un item_*

> */sell* + _[ item ]_
╰┈➤ *_Vende un item_*

> */leaderboard* › */lb* 
╰┈➤ *_Muestra el leaderboard_*

> */daily* › */d* 
╰┈➤ *_Recibe coins diarios_*

> */weekly* › */w* 
╰┈➤ *_Recibe coins semanales_*

> */monthly* › */m* 
╰┈➤ *_Recibe coins mensuales_*

> */bank* + _[ guardar | retirar | ver ]_
╰┈➤ *_Gestiona tu dinero o guardalo para que no te lo roben_*

*✦ 𝑶𝒔𝒂𝒌𝒂 𝑩𝒐𝒕 ✦*`

    const messageOptions = {
      text: helpText,
      contextInfo: {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: 'ᯓStᥲrknᥱss',
          newsletterJid: "120363158701337904@newsletter",
        },
        externalAdReply: {
          title: "🤍 Osaka | Main 🤍",
          body: "Nah, i'd Win | By Starkness Softworks",
          thumbnailUrl: "https://rogddqelmxyuvhpjvxbf.supabase.co/storage/v1/object/public/files/igq1z44n9bn.jpg",
          sourceUrl: "https://whatsapp.com/channel/0029VbB9SA10rGiQvM2DMi2p",
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: true
        }
      }
    }

    await sock.sendMessage(chatId, messageOptions)
  } catch (error) {
    console.error('Error en help:', error)
    await sock.sendMessage(chatId, { 
      text: '❌ Error al mostrar el menú de ayuda' 
    })
  }
}