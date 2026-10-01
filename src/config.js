import 'dotenv/config'

export const config = {
  botName: process.env.BOT_NAME || 'ARCEUS XD MINI',
  prefix: process.env.PREFIX || '.',
  ownerNumber: (process.env.OWNER_NUMBER || '917602624961').replace(/\D/g, ''),
  ownerName: process.env.OWNER_NAME || 'Owner',
  pairingNumber: (process.env.PAIRING_NUMBER || '917602624961').replace(/\D/g, ''),
  port: Number(process.env.PORT || 3000)
}
