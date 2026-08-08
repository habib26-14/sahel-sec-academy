/**
 * Applique les fichiers SQL de `supabase/migrations` sur le projet Supabase
 * (Storage, RLS, triggers). Utilise la connexion DIRECT_URL (session pooler).
 *
 * Usage : npm run db:migrate:supabase
 */
import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { Client } from 'pg'

if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env')
  } catch {}
}

const DIRECT_URL = process.env.DIRECT_URL
if (!DIRECT_URL) {
  console.error('❌ Variable manquante : DIRECT_URL')
  process.exit(1)
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const migrationsDir = resolve(root, 'supabase/migrations')
// Découverte automatique : tous les fichiers .sql, triés par ordre croissant.
const files = (await readdir(migrationsDir))
  .filter((f) => f.endsWith('.sql'))
  .sort()

// Outil de dev local uniquement (s'execute sur la machine du développeur).
// Le pooler Supabase passe par une inspection TLS locale : on désactive la
// vérification du certificat ICI uniquement. En production rien ne lit ce script.
const client = new Client({
  connectionString: DIRECT_URL,
  ssl: { rejectUnauthorized: false },
})

await client.connect()

let failed = 0
for (const file of files) {
  process.stdout.write(`▶ ${file} ... `)
  try {
    const sql = await readFile(resolve(root, 'supabase/migrations', file), 'utf8')
    await client.query(sql)
    console.log('✓')
  } catch (err) {
    failed++
    console.log('✗')
    console.log(String(err.message).split('\n')[0])
    if (typeof err.position === 'string' && Number.isFinite(Number(err.position))) {
      const pos = Number(err.position)
      const sqlPath = resolve(root, 'supabase/migrations', file)
      const original = await readFile(sqlPath, 'utf8').catch(() => '')
      if (original) {
        const ctx = original.slice(Math.max(0, pos - 160), pos + 100)
        console.log(`  Contexte : …${ctx.replace(/\s+/g, ' ').trim()}…`)
      }
    }
  }
}

await client.end()

if (failed > 0) {
  console.log(`❌ ${failed} fichier(s) en erreur — corrigez puis relancez.`)
  process.exit(1)
}
console.log('✅ Configuration Supabase complète (buckets, RLS, triggers).')