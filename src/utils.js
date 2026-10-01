import { config } from './config.js'

export function jidToNumber(jid = '') {
  return jid.split('@')[0].replace(/\D/g, '')
}

export function isOwner(sender = '') {
  return Boolean(config.ownerNumber) && jidToNumber(sender) === config.ownerNumber
}

export function isGroup(jid = '') {
  return jid.endsWith('@g.us')
}

export async function getGroupMetadata(sock, jid) {
  try {
    return await sock.groupMetadata(jid)
  } catch {
    return null
  }
}

export function getAdmins(metadata) {
  return metadata?.participants?.filter(p => p.admin)?.map(p => p.id) || []
}

export function isAdmin(metadata, sender) {
  return Boolean(metadata?.participants?.some(p => p.id === sender && Boolean(p.admin)))
}

export function getText(message) {
  if (!message) return ''
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    message.videoMessage?.caption ||
    message.documentMessage?.caption ||
    ''
  )
}

export function extractCommand(text, prefix) {
  if (!text.startsWith(prefix)) return { command: '', args: [], text }
  const body = text.slice(prefix.length).trim()
  if (!body) return { command: '', args: [], text }
  const parts = body.split(/\s+/)
  const command = parts.shift().toLowerCase()
  return { command, args: parts, text: parts.join(' ') }
}

export function mentionText(numbers) {
  return numbers.map(n => `@${jidToNumber(n)}`).join(' ')
}
