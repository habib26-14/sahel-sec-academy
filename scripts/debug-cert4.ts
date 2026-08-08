process.loadEnvFile('.env')
import { createClient } from '@supabase/supabase-js'
const { PDFDocument } = require('pdf-lib')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: true, autoRefreshToken: false } },
)
const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
)
// Identifiants pilotés par l'environnement : jamais de secrets en dur
// dans le code source (audit de sécurité — section secrets).
const COURSE = process.env.DEBUG_COURSE_ID ?? ''
const UID = process.env.DEBUG_UID ?? ''
const EMAIL = process.env.DEBUG_EMAIL ?? ''
const PASSWORD = process.env.DEBUG_PASSWORD ?? ''
if (!COURSE || !UID || !EMAIL || !PASSWORD) {
  console.log(
    'Variables manquantes : DEBUG_COURSE_ID, DEBUG_UID, DEBUG_EMAIL, DEBUG_PASSWORD',
  )
  process.exit(1)
}

;(async () => {
  const { error: authErr } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  })
  if (authErr) { console.log('AUTH FAIL', authErr.message); return }

  const lr = await supabase.from('lessons').select('id, modules!inner(course_id)').eq('modules.course_id', COURSE)
  const qr = await supabase.from('quizzes').select('id, lesson_id, lessons!inner(modules!inner(course_id))').eq('lessons.modules.course_id', COURSE)
  const pr = await supabase.from('progress').select('lesson_id').eq('user_id', UID).eq('course_id', COURSE).eq('completed', true)
  const ar = await supabase.from('quiz_attempts').select('quiz_id').eq('user_id', UID).eq('passed', true)
  console.log('lessons err?', lr.error?.message ?? null, 'rows', lr.data?.length ?? 0)
  console.log('quizzes err?', qr.error?.message ?? null, 'rows', qr.data?.length ?? 0)
  console.log('progress count', pr.data?.length ?? 0, 'passed attempts', ar.data?.length ?? 0)
  const quizIds = (qr.data ?? []).map((q) => q.id)
  const done = new Set((pr.data ?? []).map((p) => p.lesson_id))
  const passed = new Set((ar.data ?? []).map((a) => a.quiz_id))
  const total = (lr.data ?? []).length
  const completed = total > 0 && (lr.data ?? []).every((l) => done.has(l.id)) && quizIds.every((id) => passed.has(id))
  console.log('total:', total, 'done:', done.size, 'quizzes:', quizIds.length, 'passed:', passed.size)
  console.log('COMPLETED ===', completed)

  const { PDFDocument } = require('pdf-lib')
  const doc = await PDFDocument.create()
  const page = doc.addPage([842, 595])
  page.drawText('test', { x: 50, y: 500 })
  const bytes = await doc.save()

  const path = `${UID}/cert-probe.pdf`
  const up = await admin.storage.from('certificates').upload(path, bytes, { contentType: 'application/pdf', upsert: true })
  console.log('upload:', up.error ? 'ERR ' + up.error.message : 'OK')
  const cert = await admin.from('certificates').insert({
    user_id: UID, course_id: COURSE, verification_code: 'probe1', pdf_url: path,
  }).select('id').single()
  console.log('insert cert:', cert.error ? 'ERR ' + cert.error.message : 'OK ' + cert.data.id)
  if (cert.data) await admin.from('certificates').delete().eq('id', cert.data.id)
})().then(() => process.exit(0))