import { Client } from 'pg'
if (process.loadEnvFile) {
  try { process.loadEnvFile('.env') } catch {}
}
// TLS vérifié : le pooler Supabase sert des certificats valides.
const client = new Client({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: true },
})
await client.connect()

const stmts = [
  `drop policy if exists "certificates owner read" on storage.objects`,
  `drop policy if exists "certificates owner delete" on storage.objects`,
  `create policy "certificates owner read" on storage.objects for select to authenticated using (bucket_id = 'certificates' and (storage.foldername(name))[1] = auth.uid()::text)`,
]
for (const s of stmts) {
  try {
    await client.query(s)
    console.log('OK   :', s.slice(0, 60))
  } catch (e) {
    console.log('FAIL :', s.slice(0, 60))
    console.log('      ', e.message)
    if (e.detail) console.log('      detail:', e.detail)
  }
}

const policies = await client.query(
  `select policyname, tablename, cmd from pg_policies where schemaname = 'storage' order by policyname`,
)
console.log('POLICIES STORAGE :')
for (const r of policies.rows) console.log(' -', r.policyname, `(${r.cmd})`, 'sur', r.tablename)

await client.end()