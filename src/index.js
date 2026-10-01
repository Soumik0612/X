import express from 'express'
import { config } from './config.js'
import { startBot } from './connection.js'

const app = express()

app.get('/', (_req, res) => {
  res.json({
    status: 'online',
    bot: config.botName,
    version: '1.0.0',
    baileys: '7.0.0-rc.14'
  })
})

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

app.listen(config.port, '0.0.0.0', () => {
  console.log(`HTTP server running on port ${config.port}`)
})

startBot()
  .then(() => console.log('🚀 WhatsApp bot starting...'))
  .catch(error => {
    console.error('Fatal startup error:', error)
    process.exit(1)
  })

process.on('unhandledRejection', error => console.error('Unhandled rejection:', error))
process.on('uncaughtException', error => console.error('Uncaught exception:', error))
