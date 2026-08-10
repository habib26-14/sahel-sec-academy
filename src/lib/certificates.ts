import { PDFDocument, PDFPage, StandardFonts, rgb } from 'pdf-lib'
import { getAdminClient } from '@/lib/supabase/admin'
import { BUCKET_CERTIFICATES } from '@/lib/constants'

const NAVY = rgb(0.047, 0.137, 0.216) // #0C2340
const TEAL = rgb(0.114, 0.62, 0.459) // #1D9E75
const GREY = rgb(0.35, 0.38, 0.42)
const WHITE = rgb(1, 1, 1)

export interface CertificateParams {
  learnerName: string
  courseTitle: string
  issuedAt: string
  verificationCode: string
  /** Domaine racine affiché dans le footer (ex. https://sahelsec.academy). */
  siteUrl: string
  /** Compétences validées, extraites des titres de modules du cours. */
  skills: string[]
}

const frDate = (iso: string) =>
  new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(iso))

/** Découpe une liste d'items en lignes de texte qui tiennent dans maxWidth. */
function wrapItems(
  font: { widthOfTextAtSize: (t: string, s: number) => number },
  items: string[],
  size: number,
  maxWidth: number,
  separator = ' · ',
): string[] {
  const lines: string[] = []
  let current = ''
  for (const item of items) {
    const candidate = current ? `${current}${separator}${item}` : item
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current)
      current = item
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

/**
 * Dessine le sceau officiel (rosette) : rayons radiaux, double anneau,
 * disque bleu nuit, bouclier teal avec coche blanche.
 * Les rayons sont des lignes radiales (coordonnées PDF natives), évitant
 * les surprises de repère vertical de drawSvgPath.
 */
function drawSeal(page: PDFPage, cx: number, cy: number) {
  // Rosace : 16 rayons entre les rayons 60 et 72
  for (let i = 0; i < 16; i++) {
    const a = ((i + 0.5) / 16) * Math.PI * 2
    page.drawLine({
      start: { x: cx + Math.cos(a) * 60, y: cy + Math.sin(a) * 60 },
      end: { x: cx + Math.cos(a) * 72, y: cy + Math.sin(a) * 72 },
      thickness: 3,
      color: NAVY,
    })
  }

  // Anneau extérieur + disque blanc (pose au-dessus des rayons, les
  // dentelures restent visibles entre les deux).
  page.drawCircle({ x: cx, y: cy, size: 74, borderColor: NAVY, borderWidth: 3 })
  page.drawCircle({ x: cx, y: cy, size: 60, color: WHITE, borderColor: TEAL, borderWidth: 2 })

  // Disque bleu nuit + bouclier teal + coche blanche.
  // NB : le chemin SVG est en repère y-bas (SVG), pdf-lib translate via
  // `y: cy - 9` pour le centrer sur cy (PDF y-haut).
  page.drawCircle({ x: cx, y: cy, size: 42, color: NAVY })
  const shield =
    'M-17.6,-1 L-16.5,-8.8 L-6.6,-14.3 L0,-16.5 L6.6,-14.3 L16.5,-8.8 L17.6,-1 L0,-4.4 Z'
  page.drawSvgPath(shield, { x: cx, y: cy - 9, color: TEAL })

  // Coche blanche, centrée dans le corps du bouclier (PDF : y croissant vers
  // le haut, donc y-… = plus bas sur la page).
  page.drawLine({
    start: { x: cx - 8, y: cy - 8 },
    end: { x: cx - 3, y: cy - 6 },
    thickness: 3.5,
    color: WHITE,
  })
  page.drawLine({
    start: { x: cx - 3, y: cy - 6 },
    end: { x: cx + 9, y: cy + 5 },
    thickness: 3.5,
    color: WHITE,
  })
}

/**
 * Génère le PDF du certificat (A4 paysage, charte Sahel Sec Academy).
 * Aucune police externe : Helvetica (WinAnsi) - petits fichiers, pas de réseau.
 */
export async function generateCertificatePdf(input: CertificateParams): Promise<Uint8Array> {
  const pdf = await PDFDocument.create()
  const page = pdf.addPage([842, 595])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique)
  const centerX = 421

  const drawCentered = (
    text: string,
    size: number,
    y: number,
    f = font,
    color = NAVY,
  ) => {
    const width = f.widthOfTextAtSize(text, size)
    page.drawText(text, { x: centerX - width / 2, y, size, font: f, color })
  }

  // Cadres externe + interne
  page.drawRectangle({ x: 24, y: 24, width: 794, height: 547, borderColor: NAVY, borderWidth: 3 })
  page.drawRectangle({ x: 34, y: 34, width: 774, height: 527, borderColor: TEAL, borderWidth: 1.5 })

  // En-tête
  page.drawText('SAHEL SEC ACADEMY', { x: 56, y: 528, size: 16, font: fontBold, color: NAVY })
  page.drawText('Cybersécurité pour tous', { x: 56, y: 512, size: 10, font, color: GREY })

  drawCentered('CERTIFICAT DE RÉUSSITE', 26, 470, fontBold, NAVY)
  page.drawRectangle({ x: centerX - 90, y: 458, width: 180, height: 3, color: TEAL })

  drawCentered('Ce certificat est décerné à', 15, 420, fontItalic, GREY)
  drawCentered(input.learnerName.toUpperCase(), 26, 386, fontBold, NAVY)
  drawCentered('pour avoir complété avec succès le cours', 15, 352, fontItalic, GREY)
  drawCentered(input.courseTitle, 22, 316, fontBold, TEAL)
  drawCentered(`Délivré le ${frDate(input.issuedAt)}`, 14, 274, font, GREY)

  // Ligne de signature (droite = structure académique, solennité)
  page.drawLine({ start: { x: 56, y: 214 }, end: { x: 200, y: 214 }, thickness: 1, color: TEAL })
  page.drawText('Signature', { x: 108, y: 198, size: 9, font, color: GREY })

  // CODE DE VÉRIFICATION - centré (le lien URL complet a été retiré :
  // la vérification se fait avec le code seul sur le site).
  drawCentered('CODE DE VÉRIFICATION', 11, 176, fontBold, NAVY)
  const codeWidth = font.widthOfTextAtSize(input.verificationCode, 14)
  page.drawText(input.verificationCode, {
    x: centerX - codeWidth / 2,
    y: 156,
    size: 14,
    font: fontBold,
    color: TEAL,
  })

  // Compétences validées (tirées des modules du cours)
  const skillItems = (input.skills ?? []).slice(0, 4)
  if (skillItems.length > 0) {
    const lines = wrapItems(font, skillItems, 11, 560)
    for (let i = 0; i < lines.length; i++) {
      drawCentered(lines[i], 11, 128 - i * 15, font, GREY)
    }
  }

  // Sceau de certification (rosette) - coin inférieur droit
  drawSeal(page, 730, 130)

  // Footer de marque (domaine racine, pas de lien de vérification)
  const year = new Date(input.issuedAt).getFullYear()
  const host = (() => {
    try {
      return new URL(input.siteUrl).hostname
    } catch {
      return input.siteUrl
    }
  })()
  const footer = `© ${year} Sahel Sec Academy - une initiative Sahel Sec × CyberVice · ${host}`
  const footerWidth = font.widthOfTextAtSize(footer, 9)
  page.drawText(footer, { x: centerX - footerWidth / 2, y: 46, size: 9, font, color: GREY })

  return pdf.save({ useObjectStreams: true })
}

/** Chemin de stockage du PDF d'un certificat. */
export function certificateStoragePath(userId: string, courseId: string): string {
  return `${userId}/${courseId}.pdf`
}

/**
 * Téléverse le PDF généré dans le bucket privé `certificates`
 * à l'aide de la clé service_role (bypass RLS, autorisé côté serveur).
 */
export async function uploadCertificatePdf(
  userId: string,
  courseId: string,
  pdfBytes: Uint8Array,
): Promise<string> {
  const admin = getAdminClient()
  const path = certificateStoragePath(userId, courseId)
  const { error } = await admin.storage
    .from(BUCKET_CERTIFICATES)
    .upload(path, pdfBytes, { contentType: 'application/pdf', upsert: true })
  if (error) throw new Error(`Upload certificat : ${error.message}`)
  return path
}

/** Génère une URL signée de téléchargement (bucket privé). */
export async function getCertificateDownloadUrl(
  storagePath: string,
  expiresInSec = 300,
): Promise<string> {
  const admin = getAdminClient()
  const { data, error } = await admin.storage
    .from(BUCKET_CERTIFICATES)
    .createSignedUrl(storagePath, expiresInSec)
  if (error || !data?.signedUrl) throw new Error(`Lien certificat : ${error?.message ?? 'inconnu'}`)
  return data.signedUrl
}