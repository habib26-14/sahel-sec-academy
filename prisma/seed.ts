/**
 * Seed de démonstration : crée l'instructeur, l'étudiant et un cours complet.
 *
 * Usage :
 *   1. Renseigner .env (voir .env.example) — Supabase doit être provisionnée :
 *      DATABASE_URL, DIRECT_URL + SUPABASE_SERVICE_ROLE_KEY.
 *   2. Appliquer d'abord les migrations SQL Supabase (0001, 0002, 0003)
 *      puis `npx prisma migrate deploy`.
 *   3. `npm run db:seed`
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
const STUDENT_EMAIL = 'etudiant@sahelsec.academy'
// Mot de passe de démo via variable d'environnement : ne jamais committer
// de secret en dur (audit de sécurité — section secrets).
const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? 'SahelSec!2026'

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
    update: { fullName: fullName, role },
    create: {
      id: userId,
      email: '',
      fullName: fullName,
      role,
    },
  })
}

async function seedCourse(authorId: string) {
  await prisma.course.upsert({
    where: { slug: 'decouverte-cybersecurite' },
    update: {},
    create: {
      slug: 'decouverte-cybersecurite',
      title: 'Découverte de la cybersécurité',
      description:
        'Comprendre les bases : menaces, mots de passe, phishing et hygiène numérique. Le point de départ idéal, zéro prérequis.',
      level: 'DECOUVERTE',
      status: 'PUBLISHED',
      estimatedHours: 1,
      authorId: authorId,
    },
  })
  return prisma.course.findUniqueOrThrow({
    where: { slug: 'decouverte-cybersecurite' },
  })
}

async function seedModule(
  courseId: string,
  title: string,
  order: number,
  lessons: Array<{
    title: string
    body: string
    quiz?: {
      passScore: number
      questions: Array<{
        question: string
        choices: string[]
        correctIndex: number
        explanation?: string
      }>
    }
  }>,
) {
  let module = await prisma.module.findFirst({ where: { courseId: courseId, title } })
  if (!module) {
    module = await prisma.module.create({ data: { courseId: courseId, title, order } })
  } else {
    await prisma.module.update({ where: { id: module.id }, data: { order } })
  }

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i]
    let existing = await prisma.lesson.findFirst({
      where: { moduleId: module.id, title: lesson.title },
    })
    if (!existing) {
      existing = await prisma.lesson.create({
        data: {
          moduleId: module.id,
          title: lesson.title,
          order: i + 1,
          contentType: 'TEXT',
          contentBody: lesson.body,
          durationMin: 5,
        },
      })
    }

    if (lesson.quiz) {
      const quiz = await prisma.quiz.upsert({
        where: { lessonId: existing.id },
        update: {},
        create: {
          lessonId: existing.id,
          passingScore: lesson.quiz.passScore,
        },
      })
      await prisma.quizQuestion.deleteMany({ where: { quizId: quiz.id } })
      for (let q = 0; q < lesson.quiz.questions.length; q++) {
        const item = lesson.quiz.questions[q]
        await prisma.quizQuestion.create({
          data: {
            quizId: quiz.id,
            order: q + 1,
            question: item.question,
            choices: item.choices,
            correctIndex: item.correctIndex,
          },
        })
      }
    }
  }
}

async function main() {
  console.log('🎓 Sahel Sec Academy — seed de démonstration')

  const instructor = await findOrCreateUser(INSTRUCTOR_EMAIL, DEMO_PASSWORD)
  await upsertProfile(instructor.id, 'CyberVice — Instructeur', 'INSTRUCTOR')

  const student = await findOrCreateUser(STUDENT_EMAIL, DEMO_PASSWORD)
  await upsertProfile(student.id, 'Étudiante Sahel Sec', 'STUDENT')

  const intro = await seedCourse(instructor.id)

  await seedModule(intro.id, 'Bien débuter', 1, [
    {
      title: 'Pourquoi la cybersécurité ?',
      body: '## Pourquoi la cybersécurité ?\n\nLa cybersécurité protège nos données et nos appareils contre les attaques. En 2025, beaucoup d’attaques commencent par un simple clic : un faux e-mail, un faux SMS ou un mot de passe faible.\n\n### Les trois piliers (C.I.A.)\n\n- **Confidentialité** : seuls les bonnes personnes accèdent aux données.\n- **Intégrité** : les données ne sont pas modifiées en douce.\n- **Disponibilité** : les services restent accessibles.\n\n### Ce que vous allez apprendre\n\nDans cette première leçon, vous comprendrez pourquoi la cybersécurité concerne tout le monde — même depuis un téléphone.\n',
      quiz: {
        passScore: 70,
        questions: [
          {
            question: 'Qu’est-ce qu’un mot de passe robuste ?',
            choices: [
              'Une courte suite de chiffres',
              'Une longue phrase inédite et difficile à deviner',
              'Le nom de mon animal suivi d’un chiffre',
            ],
            correctIndex: 1,
          },
          {
            question: 'Comment réagir face à un e-mail suspect ?',
            choices: [
              'Cliquer sur le lien pour vérifier',
              'Renvoyer l’e-mail à toute ma liste de contacts',
              'Ne pas cliquer et signaler l’e-mail',
            ],
            correctIndex: 2,
          },
          {
            question: 'Les mises à jour d’applications servent surtout à…',
            choices: [
              'Corriger des failles de sécurité',
              'Rendre l’application plus lente',
              'Vendre mes données',
            ],
            correctIndex: 0,
          },
        ],
      },
    },
  ])
}

main()
  .then(() => {
    console.log('✅ Seed terminé :')
    console.log(`   Instructeur : ${INSTRUCTOR_EMAIL} / ${DEMO_PASSWORD}`)
    console.log(`   Étudiant    : ${STUDENT_EMAIL} / ${DEMO_PASSWORD}`)
    console.log('   Connectez-vous et rendez-vous sur /admin pour gérer le contenu.')
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())