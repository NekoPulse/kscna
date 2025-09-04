// Core Node.js modules
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Third-party dependencies
import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import pkg from 'pino';

// Local modules
import { CommandHandler } from './lib/handler.js';

// Initialize pino logger
const pinoLogger = pkg;

// ES Module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuración del estado de autenticación
async function getAuthState() {
    console.log('🔍 Initializing authentication state...');
    const authDir = './auth_info';
    if (!fs.existsSync(authDir)) {
        console.log('📂 Creating auth directory...');
        fs.mkdirSync(authDir, { recursive: true });
    }
    console.log('🔑 Getting auth state...');
    const authState = await useMultiFileAuthState(authDir);
    console.log('✅ Authentication state initialized');
    return authState;
}

async function startBot() {
    try {
        console.log('🚀 Starting bot initialization...');
        
        // Obtener estado de autenticación
        console.log('🔐 Getting authentication state...');
        let state, saveCreds;
        try {
            const auth = await getAuthState();
            state = auth.state;
            saveCreds = auth.saveCreds;
            console.log('✅ Authentication state retrieved successfully');
        } catch (authError) {
            console.error('❌ Error getting auth state:', authError);
            throw authError;
        }
        
        // Configuración del logger compatible con Baileys
        const logger = {
            level: 'error',
            info: (...args) => console.log('[INFO]', ...args),
            error: (...args) => console.error('[ERROR]', ...args),
            warn: (...args) => console.warn('[WARN]', ...args),
            debug: (...args) => {},
            trace: (...args) => {},
            fatal: (...args) => console.error('[FATAL]', ...args),
            child: () => ({
                info: (...args) => console.log('[INFO]', ...args),
                error: (...args) => console.error('[ERROR]', ...args),
                warn: (...args) => console.warn('[WARN]', ...args),
                debug: (...args) => {},
                trace: (...args) => {},
                fatal: (...args) => console.error('[FATAL]', ...args)
            })
        };

        const sock = makeWASocket({
            auth: state,
            logger: logger,
            browser: ['Osaka Bot', 'Chrome', '1.0.0'],
            syncFullHistory: false,
            markOnlineOnConnect: false,
            generateHighQualityLinkPreview: true,
            defaultQueryTimeoutMs: 60000,
            keepAliveIntervalMs: 30000,
            getMessage: async (key) => {
                try {
                    if (store) {
                        const msg = await store.loadMessage(key.remoteJid, key.id);
                        return msg?.message || undefined;
                    }
                } catch (error) {
                    logger.error('Error loading message:', error);
                }
                return undefined;
            }
        });

        // Inicializar el manejador de comandos
        const commandHandler = new CommandHandler();
        await commandHandler.loadCommands();

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect, qr, isNewLogin } = update;
            
            // Mostrar código QR si está disponible
            if (qr) {
                console.log('🔑 Escanea el código QR con tu WhatsApp:');
                qrcode.generate(qr, { small: true });
            }
            
            if (isNewLogin) {
                console.log('✅ Sesión iniciada exitosamente');
            }
            
            if (connection === 'close') {
                const error = lastDisconnect?.error;
                const statusCode = error?.output?.statusCode;
                
                // No intentar reconectar si el usuario cerró sesión manualmente
                if (statusCode === DisconnectReason.loggedOut) {
                    console.log('❌ Sesión cerrada. Por favor escanea el código QR nuevamente.');
                    process.exit(0);
                }
                
                // Mostrar el error y reconectar
                console.log('⚠️  Conexión cerrada. Error:', error?.message || 'Desconocido');
                console.log('🔄 Intentando reconectar en 5 segundos...');
                setTimeout(() => startBot(), 5000);
                
            } else if (connection === 'open') {
                console.log('✅ Conexión establecida con éxito');
                console.log('🤖 Bot listo para recibir comandos');
            }
        });
        
        // Manejo de errores no capturados
        process.on('uncaughtException', (error) => {
            console.error('⚠️  Error no capturado:', error);
        });
        
        process.on('unhandledRejection', (reason, promise) => {
            console.error('⚠️  Promesa rechazada no manejada:', reason);
        });

        // Manejo de mensajes
        sock.ev.on('messages.upsert', async (m) => {
            console.log('Mensaje recibido (upsert event):', JSON.stringify(m, null, 2));
            try {
                const message = m.messages[0];
                console.log('Mensaje procesado:', JSON.stringify(message, null, 2));
                if (!message) {
                    console.log('Mensaje es nulo o indefinido.');
                    return;
                }
                console.log('Mensaje de mi mismo (fromMe):', message.key.fromMe);
                if (message.key.fromMe) return;
                
                const chatId = message.key.remoteJid;
                const messageText = message.message?.conversation || message.message?.extendedTextMessage?.text || message.message?.imageMessage?.caption || message.message?.videoMessage?.caption || '';
                console.log('Chat ID:', chatId);
                console.log('Texto del mensaje:', messageText);
                console.log('El mensaje empieza con /:', messageText.startsWith('/'));
                
                // Procesar comandos
                if (messageText.startsWith('/')) {
                    await commandHandler.handleMessage(sock, message);
                    return;
                }

            } catch (msgError) {
                console.error('❌ Error procesando mensaje:', msgError.message);
                // No hacer nada más para evitar loops
            }
        });

        // Manejar errores de sesión específicamente
        sock.ev.on('messages.media-update', () => {});
        sock.ev.on('chats.update', () => {});
        sock.ev.on('presence.update', () => {});

        return sock;

    } catch (error) {
        console.error('❌ Error crítico iniciando bot:', error.message);
        console.log('🔄 Reintentando en 5 segundos...');
        setTimeout(() => {
            startBot();
        }, 5000);
    }
}

// Función para limpiar sesión corrupta
function cleanSession() {
    try {
        if (fs.existsSync('./auth_info')) {
            fs.rmSync('./auth_info', { recursive: true, force: true });
            console.log('🧹 Sesión limpiada. Escanea el QR de nuevo.');
        }
    } catch (error) {
        console.error('Error limpiando sesión:', error.message);
    }
}

// Iniciar el bot
console.log('🚀 Iniciando Osaka Bot...');
startBot().catch(err => {
    console.error('💥 Error fatal iniciando bot:', err.message);
    if (err.message.includes('Bad MAC') || err.message.includes('decrypt')) {
        console.log('🔧 Limpiando sesión corrupta...');
        cleanSession();
        setTimeout(() => {
            startBot();
        }, 2000);
    }
});

// Manejo mejorado de errores
process.on('uncaughtException', (err) => {
    console.log('⚠️ Excepción:', err.message);
    
    if (err.message.includes('Bad MAC') || err.message.includes('decrypt')) {
        console.log('🔧 Sesión corrupta detectada, limpiando...');
        cleanSession();
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }
});

process.on('unhandledRejection', (reason) => {
    const errorMsg = String(reason);
    console.log('⚠️ Promesa rechazada:', errorMsg);
    
    if (errorMsg.includes('Bad MAC') || errorMsg.includes('decrypt')) {
        console.log('🔧 Sesión corrupta detectada, limpiando...');
        cleanSession();
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }
});

// Manejo de cierre limpio
process.on('SIGINT', () => {
    console.log('👋 Cerrando Osaka Bot...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('👋 Cerrando Osaka Bot...');
    process.exit(0);
});