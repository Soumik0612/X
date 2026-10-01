import 'dotenv/config'

export const config = {
  botName: process.env.BOT_NAME || 'ARCEUS XD MINI',
  prefix: process.env.PREFIX || '.',
  ownerNumber: (process.env.OWNER_NUMBER || '').replace(/\D/g, ''),
  ownerName: process.env.OWNER_NAME || 'Owner',
  pairingNumber: (process.env.PAIRING_NUMBER || '').replace(/\D/g, ''),
  port: Number(process.env.PORT || 3000)
}
