import { getText, extractCommand, isGroup, getGroupMetadata, isAdmin, isOwner } from './utils.js'
import { getGroup } from './database.js'
import { executeCommand } from './commands.js'
import { config } from './config.js'

export function registerHandlers(sock) {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages?.[0]
    if (!msg?.message) return

    const from = msg.key.remoteJid
    if (!from || from === 'status@broadcast') return

    const sender = msg.key.participant || msg.key.remoteJid
    const text = getText(msg.message)
    if (!text) return

    if (isGroup(from) && /(https?:\/\/|www\.|chat\.whatsapp\.com\/)/i.test(text)) {
      const settings = getGroup(from)
      if (settings.antilink) {
        const metadata = await getGroupMetadata(sock, from)
        if (!isAdmin(metadata, sender) && !isOwner(sender)) {
          try {
            await sock.sendMessage(from, { delete: msg.key })
            await sock.sendMessage(from, {
              text: `⚠️ @${sender.split('@')[0]}\n\nLinks are not allowed in this group.`,
              mentions: [sender]
            })
          } catch (error) {
            console.error('Antilink error:', error)
          }
          return
        }
      }
    }

    const { command, args } = extractCommand(text, config.prefix)
    if (!command) return

    try {
      await executeCommand({ sock, msg, command, args, sender, from })
    } catch (error) {
      console.error(`Command ${command} error:`, error)
      await sock.sendMessage(from, { text: `❌ ${error.message || 'Something went wrong.'}` })
    }
  })

  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    if (!isGroup(id)) return
    const settings = getGroup(id)

    if (action === 'add' && settings.welcome) {
      for (const participant of participants) {
        await sock.sendMessage(id, {
          text: `╭━━〔 WELCOME 〕━━╮\n\n👋 Welcome @${participant.split('@')[0]}!\n🎉 Enjoy your stay.\n\n╰━━━━━━━━━━━━━━╯`,
          mentions: [participant]
        })
      }
    }

    if (action === 'remove' && settings.goodbye) {
      for (const participant of participants) {
        await sock.sendMessage(id, {
          text: `👋 Goodbye @${participant.split('@')[0]}!\n\nThanks for being part of the group.`,
          mentions: [participant]
        })
      }
    }
  })
}
