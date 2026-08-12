import { createClient } from '@/lib/supabase/server'
import type { CourseRow } from '@/lib/types'
import Hero from '@/components/home/hero'
import Pillars from '@/components/home/pillars'
import PathSection from '@/components/home/path-section'
import TrainingsSection from '@/components/home/trainings'
import LabsSection from '@/components/home/labs'
import CertificateSection from '@/components/home/certificate'
import ImpactSection from '@/components/home/impact'
import CyberViceSection from '@/components/home/cybervice'
import Testimonials from '@/components/home/testimonials'
import FinalCta from '@/components/home/final-cta'

export default async function HomePage() {
  const supabase = createClient()
  let courses: CourseRow[] = []
  try {
    const { data } = await supabase
      .from('courses')
      .select('*')
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false })
      .returns<CourseRow[]>()
    courses = data ?? []
  } catch {
    courses = []
  }

  return (
    <div>
      <Hero />
      <Pillars />
      <PathSection />
      <TrainingsSection courses={courses} />
      <LabsSection />
      <CertificateSection />
      <ImpactSection />
      <CyberViceSection />
      <Testimonials />
      <FinalCta />
    </div>
  )
}