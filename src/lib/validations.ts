import { z } from 'zod'

// ---------------------------------------------------------------------------
// Authentification
// ---------------------------------------------------------------------------

export const emailSchema = z.string().trim().toLowerCase().email('Adresse email invalide')

export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128, 'Mot de passe trop long')

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerSchema = loginSchema.extend({
  fullName: z
    .string()
    .trim()
    .min(2, 'Nom complet requis (2 caractères minimum)')
    .max(100, 'Nom trop long'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Les deux mots de passe ne correspondent pas',
})

export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Les deux mots de passe ne correspondent pas',
  })

// ---------------------------------------------------------------------------
// Gestion de contenu
// ---------------------------------------------------------------------------

export const courseSchema = z.object({
  title: z.string().trim().min(3, 'Titre requis').max(160, 'Titre trop long'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Slug requis')
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug invalide (lettres minuscules, chiffres, tirets)'),
  description: z.string().trim().min(20, 'Description trop courte (20 caractères minimum)').max(5000),
  prerequisites: z.union([z.string().trim().max(2000, 'Prérequis trop longs').optional(), z.literal('')]),
  level: z.enum(['DECOUVERTE', 'FONDAMENTAUX', 'SPECIALISATION']),
  estimatedHours: z.coerce.number().int().min(1).max(1000),
  coverImageUrl: z.union([z.string().trim().url('URL de couverture invalide').optional(), z.literal('')]),
})

export const courseStatusSchema = z.enum(['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED'])

export const moduleSchema = z.object({
  title: z.string().trim().min(3, 'Titre du module requis').max(160),
})

export const lessonSchema = z.object({
  title: z.string().trim().min(3, 'Titre requis').max(200),
  contentType: z.enum(['TEXT', 'VIDEO', 'LAB']),
  contentBody: z.string().trim().min(1, 'Contenu requis').max(100_000),
  videoUrl: z.union([z.string().trim().url('URL vidéo invalide').optional(), z.literal('')]),
  transcript: z.union([z.string().trim().optional(), z.literal('')]),
  durationMin: z.coerce.number().int().min(1).max(600),
})

export const quizQuestionSchema = z
  .object({
    id: z.string().optional(),
    question: z.string().trim().min(5, 'Question trop courte').max(500),
    choices: z
      .array(z.string().trim().min(1, 'Choix vide'))
      .min(2, 'Deux choix minimum')
      .max(8, 'Huit choix maximum'),
    correctIndex: z.coerce.number().int().min(0),
    order: z.coerce.number().int().min(0),
  })
  .refine((q) => q.correctIndex < q.choices.length, {
    path: ['correctIndex'],
    message: 'L’indice de la bonne réponse doit pointer vers un choix existant',
  })

export const quizSchema = z.object({
  passingScore: z.coerce.number().int().min(0).max(100),
  questions: z.array(quizQuestionSchema).min(1, 'Au moins une question'),
})

// ---------------------------------------------------------------------------
// Quiz — soumission apprenant
// ---------------------------------------------------------------------------

export const quizSubmissionSchema = z.object({
  answers: z
    .record(z.string(), z.number().int().min(0))
    .refine((a) => Object.keys(a).length <= 100, {
      message: 'Trop de réponses envoyées',
    }),
})