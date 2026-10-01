import {
  jidToNumber,
  isOwner,
  isGroup,
  getGroupMetadata,
  getAdmins,
  isAdmin,
  mentionText
} from './utils.js'
import { getGroup, setGroup } from './database.js'
import { config } from './config.js'

export async function executeCommand({ sock, msg, command, args, sender, from }) {
  const group = isGroup(from)
  const metadata = group ? await getGroupMetadata(sock, from) : null
  const senderIsOwner = isOwner(sender)
  const senderIsAdmin = group && isAdmin(metadata, sender)

  const requireGroup = () => {
    if (!group) throw new Error('This command can only be used in groups.')
    if (!metadata) throw new Error('Unable to read group information.')
  }

  const requireAdmin = () => {
    requireGroup()
    if (!senderIsAdmin && !senderIsOwner) {
      throw new Error('Only group admins can use this command.')
    }
  }

  switch (command) {
    case 'ping':
      await sock.sendMessage(from, { text: '🏓 Pong!' })
      break

    case 'alive':
      await sock.sendMessage(from, {
        text: `╭━━〔 ${config.botName} 〕━━╮
│
│ 🟢 Bot is online
│ ⚡ Status: Active
│ 🔧 Version: 1.0.0
│ 📦 Baileys: v7.0.0-rc.14
│
╰━━━━━━━━━━━━━━━━━━━━╯`
      })
      break

    case 'menu':
    case 'help':
      await sock.sendMessage(from, {
        text: `╭━━〔 ${config.botName} 〕━━╮

│ GENERAL
│ ${config.prefix}ping
│ ${config.prefix}alive
│ ${config.prefix}menu
│ ${config.prefix}owner
│ ${config.prefix}groupinfo

│ GROUP ADMIN
│ ${config.prefix}tagall
│ ${config.prefix}antilink on/off
│ ${config.prefix}welcome on/off
│ ${config.prefix}goodbye on/off
│ ${config.prefix}delete
│ ${config.prefix}kick
│ ${config.prefix}promote
│ ${config.prefix}demote

╰━━━━━━━━━━━━━━━━━━━━╯`
      })
      break

    case 'owner': {
      if (!config.ownerNumber) throw new Error('OWNER_NUMBER is not configured.')
      await sock.sendMessage(from, {
        contacts: {
          displayName: config.ownerName,
          contacts: [{
            vcard: `BEGIN:VCARD
VERSION:3.0
FN:${config.ownerName}
TEL;type=CELL;type=VOICE;waid=${config.ownerNumber}:+${config.ownerNumber}
END:VCARD`
          }]
        }
      })
      break
    }

    case 'groupinfo':
      requireGroup()
      await sock.sendMessage(from, {
        text: `╭━━〔 GROUP INFO 〕━━╮
│ 📝 Name:
│ ${metadata.subject}
│ 👥 Members: ${metadata.participants.length}
│ 👑 Admins: ${getAdmins(metadata).length}
│ 🆔 JID: ${from}
╰━━━━━━━━━━━━━━━━━━╯`
      })
      break

    case 'tagall': {
      requireAdmin()
      const participants = metadata.participants.map(p => p.id)
      const message = args.length ? args.join(' ') : 'Attention everyone!'
      await sock.sendMessage(from, {
        text: `📢 ${message}\n\n${mentionText(participants)}`,
        mentions: participants
      })
      break
    }

    case 'antilink':
    case 'welcome':
    case 'goodbye': {
      requireAdmin()
      const key = command
      const option = args[0]?.toLowerCase()
      if (!['on', 'off'].includes(option)) {
        const settings = getGroup(from)
        await sock.sendMessage(from, { text: `${key} is currently: ${settings[key] ? 'ON' : 'OFF'}` })
        break
      }
      setGroup(from, key, option === 'on')
      await sock.sendMessage(from, { text: `✅ ${key} ${option === 'on' ? 'enabled' : 'disabled'}.` })
      break
    }

    case 'delete':
    case 'del': {
      requireAdmin()
      const context = msg.message?.extendedTextMessage?.contextInfo
      const quotedId = context?.stanzaId
      const participant = context?.participant
      if (!quotedId) {
        await sock.sendMessage(from, { text: '❌ Reply to a message to delete it.' })
        break
      }
      await sock.sendMessage(from, {
        delete: { remoteJid: from, fromMe: false, id: quotedId, participant }
      })
      break
    }

    case 'kick':
    case 'promote':
    case 'demote': {
      requireAdmin()
      const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || []
      if (!mentions.length) {
        await sock.sendMessage(from, { text: '❌ Mention the user first.' })
        break
      }
      const targets = mentions.filter(jid => jid !== sock.user?.id)
      if (targets.length) await sock.groupParticipantsUpdate(from, targets, command === 'kick' ? 'remove' : command)
      await sock.sendMessage(from, { text: `✅ ${command} completed.` })
      break
    }

    default:
      return false
  }
  return true
}
