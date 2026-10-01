import makeWASocket, { useMultiFileAuthState, Browsers, DisconnectReason } from '@whiskeysockets/baileys'
import pino from 'pino'
import { registerHandlers } from './handler.js'
import { config } from './config.js'

const logger = pino({ level: 'silent' })
let starting = false

export async function startBot() {
  if (starting) return
  starting = true

  try {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')

    const sock = makeWASocket({
      auth: state,
      logger,
      browser: Browsers.ubuntu(config.botName),
      markOnlineOnConnect: false,
      syncFullHistory: false,
      generateHighQualityLinkPreview: false
    })

    sock.ev.on('creds.update', saveCreds)

    if (!state.creds.registered && config.pairingNumber) {
      try {
        const code = await sock.requestPairingCode(config.pairingNumber)
        console.log(`\nPAIRING CODE: ${code}\n`)
      } catch (error) {
        console.error('Pairing-code error:', error)
      }
    }

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      console.log('[WhatsApp]', connection || 'updating')

      if (connection === 'open') {
        console.log(`✅ ${config.botName} connected`)
        starting = false
      }

      if (connection === 'close') {
        starting = false
        const statusCode = lastDisconnect?.error?.output?.statusCode
        console.log('WhatsApp disconnected. Code:', statusCode)

        if (statusCode !== DisconnectReason.loggedOut) {
          console.log('Reconnecting in 5 seconds...')
          setTimeout(() => startBot().catch(console.error), 5000)
        } else {
          console.log('❌ Session logged out. Delete auth_info and pair again.')
        }
      }
    })

    registerHandlers(sock)
    return sock
  } catch (error) {
    starting = false
    throw error
  }
}
