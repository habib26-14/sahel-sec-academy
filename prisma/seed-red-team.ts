/**
 * Seed du cours « Ingénierie red team — concepts fondamentaux ».
 *
 * Contenu original rédigé pour Sahel Sec Academy : il couvre les concepts
 * généraux de la sécurité offensive (cadre légal, développement d'outils,
 * accès initial, progression, communications) sans reprendre le texte d'un
 * ouvrage tiers.
 *
 * Usage :
 *   1. Renseigner .env — Supabase doit être provisionnée (mêmes variables que
 *      prisma/seed.ts).
 *   2. `npx tsx prisma/seed-red-team.ts`
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
// Mot de passe de démo via variable d'environnement : ne jamais commer
// de secret en dur (audit de sécurité — section secrets).
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

type LessonSeed = {
  title: string
  body: string
  quiz?: {
    passScore: number
    questions: Array<{
      question: string
      choices: string[]
      correctIndex: number
    }>
  }
}

async function seedModule(
  courseId: string,
  title: string,
  order: number,
  lessons: LessonSeed[],
) {
  let module = await prisma.module.findFirst({ where: { courseId, title } })
  if (!module) {
    module = await prisma.module.create({ data: { courseId, title, order } })
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
          durationMin: 6,
        },
      })
    }

    if (lesson.quiz) {
      const quiz = await prisma.quiz.upsert({
        where: { lessonId: existing.id },
        update: {},
        create: { lessonId: existing.id, passingScore: lesson.quiz.passScore },
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
  console.log('🎓 Sahel Sec Academy — seed du cours Red Team')

  const instructor = await findOrCreateUser(INSTRUCTOR_EMAIL, DEMO_PASSWORD)
  await upsertProfile(instructor.id, 'CyberVice — Instructeur', 'INSTRUCTOR')

  const course = await prisma.course.upsert({
    where: { slug: 'ingenierie-red-team' },
    update: {},
    create: {
      slug: 'ingenierie-red-team',
      title: 'Ingénierie red team — concepts fondamentaux',
      description:
        'Découvrir la discipline du red teaming : cadre de mission, développement d’outils, accès initial, progression latérale et communications — dans un cadre strictement autorisé.',
      level: 'SPECIALISATION',
      status: 'PUBLISHED',
      estimatedHours: 8,
      authorId: instructor.id,
    },
  })

  await seedModule(course.id, 'Cadre d’une campagne', 1, [
    {
      title: 'De quoi parle le red teaming ?',
      body:
        '## De quoi parle le red teaming ?\n\nLe red teaming est une discipline de sécurité offensive réalisée ' +
        'avec l’accord explicite de l’organisation : une équipe « attaquante » éprouve les défenses (réseaux, ' +
        'systèmes, applications, personnel) de manière réaliste, au-delà des seules vulnérabilités connues.\n\n' +
        '### Différences avec un test d’intrusion classique\n\n- **On ne scanne pas, on simule** : l’équipe ' +
        'poursuit des objectifs métier précis (accéder à des données, prendre le contrôle d’un poste), jamais ' +
        'au-delà du périmètre autorisé.\n- **On évalue aussi la détection** : le red teaming déclenche l’équipe ' +
        'de défense (SOC) pour mesurer sa capacité à repérer et réagir.\n- **Le livrable est un rapport** : ' +
        'preuves d’exploitation, journal des actions, recommandations de remédiation.\n\nDans ce cours, on ' +
        'étudie les concepts et la démarche — sans produire d’outillage malveillant prêt à l’emploi.\n',
    },
    {
      title: 'Objectifs, périmètre et règles d’engagement',
      body:
        '## Objectifs, périmètre et règles d’engagement\n\nAvant la moindre action technique, un cadre ' +
        'contractuel est obligatoire.\n\n- **Périmètre** : liste précise des hôtes, domaines, applications et ' +
        'horaires pendant lesquels les tests sont autorisés.\n- **Règles d’engagement (RoE)** : actions ' +
        'interdites (ne pas toucher à des tiers, ne pas exfiltrer de vraies données sensibles, gérer les ' +
        'alertes du SOC).\n- **Traçabilité** : chaque action est journalisée pour prouver, corriger et ' +
        'restituer.\n- **Points de contact** : canal direct avec le client et l’équipe bleue pour désamorcer ' +
        'toute situation critique.\n\n### Pourquoi commencer par là\n\nTous les chapitres qui suivent supposent ' +
        'ce cadre : sans autorisation écrite, la démarche sort de l’ingénierie offensive pour devenir un délit. ' +
        'La méthodologie (reconnaissance, accès, progression) reste la même, mais c’est le cadre qui la rend légale.\n',
    },
    {
      title: 'Contrôle des compétences — module 1',
      body:
        '## Contrôle des compétences — module 1\n\nVérifions les bases du cadre : mission, portée et règles ' +
        'd’engagement d’une campagne red team.\n',
      quiz: {
        passScore: 70,
        questions: [
          {
            question: 'Quelle est la différence principale entre un red teaming et un audit de conformité ?',
            choices: [
              'Aucune : ce sont les mêmes activités',
              'Le red teaming simule un adversaire complet pour jauger la détection et la réaction',
              'Le red teaming se limite à scanner les ports ouverts',
            ],
            correctIndex: 1,
          },
          {
            question: 'Que définissent les règles d’engagement (RoE) ?',
            choices: [
              'Uniquement le montant du contrat',
              'Le périmètre autorisé, les actions interdites et les points de contact',
              'L’organigramme du SOC',
            ],
            correctIndex: 1,
          },
          {
            question: 'Pourquoi chaque action doit-elle être journalisée pendant la mission ?',
            choices: [
              'Pour ralentir l’attaque',
              'Pour pouvoir prouver, corriger et améliorer les défenses',
              'Pour enrichir les e-mails de rapport',
            ],
            correctIndex: 1,
          },
        ],
      },
    },
  ])

  await seedModule(course.id, 'Conception d’outils', 2, [
    {
      title: 'Penser comme un développeur offensif',
      body:
        '## Penser comme un développeur offensif\n\nUn outil offensif est avant tout un logiciel : il a un ' +
        'cycle de vie, des dépendances et des erreurs à gérer.\n\n### Qualités attendues\n\n' +
        '- **Modularité** : chaque capacité (collecte, communication, exécution) est isolée et réutilisable.\n' +
        '- **Robustesse** : l’outil gère les imprévus (réseau instable, service absent) sans planter.\n' +
        '- **Discrétion** : limiter les artefacts écrits sur disque, éviter les signatures évidentes.\n' +
        '- **Testabilité** : un environnement de laboratoire reproduit la cible avant la mission.\n\n' +
        '### Éviter le sur-développement\n\nPlus le code est complexe et copié, plus il contient de bugs et ' +
        'plus il est difficile à maintenir. On privilégie des composants petits, testés, réutilisables, ' +
        'adaptés à des scénarios réalistes.\n',
    },
    {
      title: 'Cycle de vie d’un outil : de l’idée au déploiement',
      body:
        '## Cycle de vie d’un outil : de l’idée au déploiement\n\n### 1. Spécifier\nDéfinir un objectif ' +
        'mesurable, l’environnement visé (Windows / Linux, sur site / cloud) et les limites du mandat.\n\n' +
        '### 2. Prototyper\nMettre au point la version la plus simple qui démontre la capacité, dans un ' +
        'environnement de test autorisé.\n\n### 3. Tester et durcir\nContrôler les signatures (antivirus, ' +
        'EDR), le bruit réseau et les journaux générés, puis ajuster.\n\n### 4. Documenter et livrer\n' +
        'Fournir mode d’emploi, dépendances et limites de la démonstration, pour une restitution reproductible.\n\n' +
        'Ce cycle évite de déployer des outils fragiles et non testés — et facilite la reproductibilité exigée ' +
        'par les rapports de mission.\n',
    },
    {
      title: 'Contrôle des compétences — module 2',
      body:
        '## Contrôle des compétences — module 2\n\nQuelques questions pour valider la démarche de conception ' +
        'd’un outil offensif.\n',
      quiz: {
        passScore: 70,
        questions: [
          {
            question: 'Pourquoi privilégier des composants petits et réutilisables plutôt qu’un outil géant ?',
            choices: [
              'Parce qu’ils sont plus rapides à exécuter',
              'Parce qu’ils sont plus faciles à maintenir, tester et documenter',
              'Parce qu’ils fonctionnent sur des systèmes anciens',
            ],
            correctIndex: 1,
          },
          {
            question: 'À quelle étape du cycle de vie vérifie-t-on la détection par antivirus / EDR ?',
            choices: [
              'À la spécification',
              'À l’étape de test et de durcissement',
              'Après la remise du rapport final',
            ],
            correctIndex: 1,
          },
          {
            question: 'Quelle est la première étape de la conception d’un outil ?',
            choices: [
              'Écrire immédiatement le code en production',
              'Définir un objectif mesurable et l’environnement visé',
              'Supprimer les traces du code source',
            ],
            correctIndex: 1,
          },
        ],
      },
    },
  ])

  await seedModule(course.id, 'Accès initial et progression', 3, [
    {
      title: 'Obtenir un accès initial',
      body:
        '## Obtenir un accès initial\n\nL’accès initial est la première brèche dans la zone autorisée. Les ' +
        'vecteurs sont variés :\n\n- **Phishing et ingénierie sociale** : l’élément humain reste un vecteur ' +
        'important (courriels ciblés, faux portails de connexion).\n- **Services exposés** : applications web ' +
        'présentant des vulnérabilités connues (API mal sécurisées, mises à jour manquantes).\n- **Supports ' +
        'amovibles et partages** : moins fréquent aujourd’hui, mais toujours testé dans certaines missions.\n\n' +
        'L’important est de procéder de manière maîtrisée, strictement dans le périmètre, puis d’enchaîner sur ' +
        'une reconnaissance locale (utilisateurs, services, fichiers de configuration) avant d’aller plus loin.\n',
    },
    {
      title: 'Après l’accès : consolider sans casser',
      body:
        '## Après l’accès : consolider sans casser\n\nLe pire pour une campagne est de perdre l’accès à un poste ' +
        'après l’avoir compromis. Quelques réflexes :\n\n- **Observer d’abord** : environnement, connexions ' +
        'réseau, sessions actives, données accessibles.\n- **Modifier le minimum** : chaque changement augmente ' +
        'le bruit visible par l’équipe bleue.\n- **Prévoir un repli** : un point de sortie minimal et discret, ' +
        'toujours dans le cadre autorisé.\n\nCette discipline distingue une équipe professionnelle d’un outil ' +
        'jetable : on ne joue pas sa campagne sur une seule voie d’accès.\n',
    },
    {
      title: 'Contrôle des compétences — module 3',
      body:
        '## Contrôle des compétences — module 3\n\nValidation des concepts d’accès initial et d’hygiène ' +
        'post-compromission.\n',
      quiz: {
        passScore: 70,
        questions: [
          {
            question: 'Quel est le premier réflexe après avoir obtenu un accès ?',
            choices: [
              'Déclencher immédiatement toutes les capacités',
              'Observer l’environnement et prévoir un repli sûr',
              'Éteindre la machine cible',
            ],
            correctIndex: 1,
          },
          {
            question: 'Le phishing reste un vecteur important car…',
            choices: [
              'il élimine tout besoin de cliquer',
              'il cible l’attention humaine et contourne les protections purement techniques',
              'il échappe aux pare-feux entrants',
            ],
            correctIndex: 1,
          },
          {
            question: 'Pourquoi ne réaliser que le minimum de modifications sur la machine visée ?',
            choices: [
              'Pour réduire les coûts de licence',
              'Pour réduire le bruit et l’empreinte visibles par l’équipe de défense',
              'Pour aller plus vite',
            ],
            correctIndex: 1,
          },
        ],
      },
    },
  ])

  await seedModule(course.id, 'Mouvement latéral et communications', 4, [
    {
      title: 'Élévation de privilèges et mouvement latéral',
      body:
        '## Élévation de privilèges et mouvement latéral\n\nUne fois présent sur une première machine, la ' +
        'campagne progresse par :\n\n- **Élévation de privilèges** : passer d’un compte local à un compte plus ' +
        'privilégié (services mal configurés, identifiants stockés, protections faibles).\n- **Mouvement ' +
        'latéral** : utiliser les protocoles d’administration et les identifiants trouvés pour étendre la ' +
        'portée de façon contrôlée, sans dégrader les services.\n- **Pivot réseau** : tunneliser le trafic ' +
        'pour atteindre des réseaux internes, en respectant strictement le périmètre autorisé.\n\nÀ chaque pas, ' +
        'on choisit le chemin le plus simple qui rapproche de l’objectif — la complexité n’est jamais une fin.\n',
    },
    {
      title: 'Communications et commandement : un canal discret',
      body:
        '## Communications et commandement : un canal discret\n\nPour piloter plusieurs machines sans se faire ' +
        'repérer, on s’appuie sur :\n\n- un **agent léger** présent sur la machine et un serveur extérieur qui ' +
        'relaie les ordres ;\n- du **chiffrement en transit** et des fenêtres d’inactivité (sommeil) pour ' +
        'éviter un trafic constant et suspect ;\n- de la **redondance** pour que la perte d’un serveur ne ' +
        'détruise pas toute l’opération.\n\nLe canal de commandement doit toujours prévoir un recours : un canal ' +
        'primaire plus une voie de secours, testés avant le début de la mission.\n',
    },
    {
      title: 'Contrôle des compétences — final',
      body:
        '## Contrôle des compétences — module final\n\nQuestions finales : élévation de privilèges, mouvement ' +
        'latéral et communications discrètes.\n',
      quiz: {
        passScore: 70,
        questions: [
          {
            question: 'Qu’appelle-t-on un « mouvement latéral » ?',
            choices: [
              'Circuler entre plusieurs machines et services pour étendre la portée',
              'Passer d’un réseau privé à l’internet',
              'Percer les pare-feux entrants',
            ],
            correctIndex: 0,
          },
          {
            question: 'Pourquoi prévoir au moins deux canaux de contrôle ?',
            choices: [
              'Pour désorienter les équipes de défense',
              'Pour garantir un recours si le canal principal tombe',
              'Pour satisfaire une norme de conformité',
            ],
            correctIndex: 1,
          },
          {
            question: 'Comment doit-on procéder lors d’une élévation de privilèges ?',
            choices: [
              'Tenter tous les exploits disponibles en parallèle',
              'Observer la configuration, choisir le chemin le plus simple et documenter',
              'Désactiver la journalisation de la machine cible',
            ],
            correctIndex: 1,
          },
        ],
      },
    },
  ])

  console.log('✅ Cours créé / mis à jour :')
  console.log('   Lien : /cours/ingenierie-red-team')
  console.log('   Auteur : ' + INSTRUCTOR_EMAIL)
}

main()
  .then(() => console.log('\n✅ Seed « Ingenierie red team » terminé.'))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())