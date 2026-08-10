/**
 * Seed du cours « Automatiser l’émulation d’adversaire avec MITRE Caldera ».
 *
 * Leçon vidéo YouTube : « Automating Adversary Emulation with MITRE Caldera »
 * (ThinkInfoSec with Andre Camillo).
 *
 * Usage :
 *   1. Renseigner .env (mêmes variables que prisma/seed.ts).
 *   2. `npx tsx prisma/seed-caldera.ts`
 *
 * Idempotent : peut être relancé sans doublons.
 */
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

if (process.loadEnvFile) {
  try {
    process.loadEnvFile('.env')
  } catch {
    console.warn('⚠️  .env introuvable — variables supposées dans l’environnement.')
  }
}

const DATABASE_URL = process.env.DATABASE_URL
const DIRECT_URL = process.env.DIRECT_URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

for (const [name, value] of Object.entries({
  DATABASE_URL,
  DIRECT_URL,
  SUPABASE_URL: SUPABASE_URL as string | undefined,
  SUPABASE_SERVICE_ROLE_KEY: SUPABASE_SERVICE_ROLE_KEY as string | undefined,
})) {
  if (!value) {
    console.error(`❌ Variable manquante : ${name}`)
    process.exit(1)
  }
}

const prisma = new PrismaClient({
  datasources: { db: { url: DATABASE_URL } },
})

const supabaseAdmin = createClient(
  SUPABASE_URL as string,
  SUPABASE_SERVICE_ROLE_KEY as string,
  { auth: { autoRefreshToken: false, persistSession: false } },
)

const INSTRUCTOR_EMAIL = 'instructeur@sahelsec.academy'
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'SahelSec202626'

async function findOrCreateUser(email: string, password: string) {
  const { data: existing } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  })
  const found = existing?.users.find((u) => u.email === email)
  if (found) return found

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) throw error
  return data.user
}

async function upsertProfile(
  userId: string,
  fullName: string,
  role: 'STUDENT' | 'INSTRUCTOR',
) {
  await prisma.profile.upsert({
    where: { id: userId },
    update: { fullName, role },
    create: { id: userId, email: '', fullName, role },
  })
}

const VIDEO_URL = 'https://www.youtube.com/watch?v=Tq5QKw8VXjQ'
const VIDEO_TITLE = 'Automating Adversary Emulation with MITRE Caldera'

async function main() {
  console.log('🎓 Sahel Sec Academy — seed du cours Caldera')

  const instructor = await findOrCreateUser(INSTRUCTOR_EMAIL, DEMO_PASSWORD)
  await upsertProfile(instructor.id, 'CyberVice — Instructeur', 'INSTRUCTOR')

  const course = await prisma.course.upsert({
    where: { slug: 'emulation-adversaire-mitre-caldera' },
    update: {},
    create: {
      slug: 'emulation-adversaire-mitre-caldera',
      title: 'Automatiser l’émulation d’adversaire avec MITRE Caldera',
      description:
        'Découvrez MITRE Caldera, le framework open source d’émulation d’adversaire : planification, agents, tactiques et techniques inspirées de MITRE ATT&CK, et automatisation de vos exercices red team.',
      level: 'SPECIALISATION',
      status: 'PUBLISHED',
      estimatedHours: 1,
      authorId: instructor.id,
    },
  })

  let module = await prisma.module.findFirst({
    where: { courseId: course.id, title: 'Découverte de Caldera' },
  })
  if (!module) {
    module = await prisma.module.create({
      data: { courseId: course.id, title: 'Découverte de Caldera', order: 1 },
    })
  }

  let lesson = await prisma.lesson.findFirst({
    where: { moduleId: module.id, title: VIDEO_TITLE },
  })
  if (!lesson) {
    lesson = await prisma.lesson.create({
      data: {
        moduleId: module.id,
        title: VIDEO_TITLE,
        order: 1,
        contentType: 'VIDEO',
        contentBody:
          '## Introduction\n\nCette vidéo présente MITRE Caldera et la façon dont il permet ' +
          'd’automatiser l’émulation d’adversaire : déploiement d’agents, planification de ' +
          'campagnes et exécution de techniques inspirées de MITRE ATT&CK, dans un cadre ' +
          'strictement autorisé.\n\nRegardez la vidéo, puis marquez la leçon comme terminée ' +
          'pour poursuivre le cours.',
        videoUrl: VIDEO_URL,
        transcript:
          'Démonstration de ThinkInfoSec (Andre Camillo) : Automating Adversary Emulation ' +
          'with MITRE Caldera. La vidéo couvre l’installation et la prise en main de MITRE ' +
          'Caldera, la création d’agents sur les machines cibles, la construction d’opérations ' +
          'à partir de techniques ATT&CK, ainsi que l’automatisation de campagnes d’émulation ' +
          'd’adversaire pour tester la détection et la réponse de vos défenses.',
        durationMin: 30,
      },
    })
  }

  console.log('✅ Cours créé / mis à jour :')
  console.log('   Lien : /cours/emulation-adversaire-mitre-caldera')
  console.log('   Vidéo : ' + VIDEO_URL)
  console.log('   Auteur : ' + INSTRUCTOR_EMAIL)
}

main()
  .then(() => console.log('\n✅ Seed « MITRE Caldera » terminé.'))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
