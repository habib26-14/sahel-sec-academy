import { writeFileSync } from 'node:fs'
import { generateCertificatePdf } from '../src/lib/certificates'

async function main() {
  const pdf = await generateCertificatePdf({
    learnerName: 'Fatou Ndiaye',
    courseTitle: 'Fondamentaux du Red Teaming — Méthodologie et Outils Essentiels',
    issuedAt: '2026-08-08T10:00:00.000Z',
    verificationCode: 'b8e1f3a2-9c4d-4e6f-8a1b-2c3d4e5f6a7b',
    siteUrl: 'https://sahelsec.academy',
    skills: [
      'Reconnaissance passive (OSINT)',
      'Méthodologie Red Team',
      'Cadre légal et OpSec',
      'Écriture de rapport',
    ],
  })

  writeFileSync('C:/Users/htano/AppData/Local/Temp/opencode/cert-test.pdf', pdf)
  console.log('PDF généré :', pdf.length, 'octets')
}

main()