import fs from 'fs'
import path from 'path'

const DATA_DIR = path.resolve('data')
const DB_FILE = path.join(DATA_DIR, 'database.json')

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

const defaultDB = { groups: {} }
let db

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2))
}

try {
  db = fs.existsSync(DB_FILE)
    ? JSON.parse(fs.readFileSync(DB_FILE, 'utf8'))
    : structuredClone(defaultDB)
  if (!db.groups) db.groups = {}
  saveDB()
} catch (error) {
  console.error('Database load error:', error)
  db = structuredClone(defaultDB)
  saveDB()
}

export function getGroup(jid) {
  if (!db.groups[jid]) {
    db.groups[jid] = { antilink: false, welcome: false, goodbye: false }
    saveDB()
  }
  return db.groups[jid]
}

export function setGroup(jid, key, value) {
  const group = getGroup(jid)
  group[key] = value
  saveDB()
  return group
}
