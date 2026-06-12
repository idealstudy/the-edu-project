import { homeMetadata } from '@/features/home/metadata';
import { StructuredData } from '@/features/home/structured-data';
import {
  LandingCta,
  LandingFaq,
  LandingHero,
  LandingTreePreview,
  LandingValues,
} from '@/features/home/ui/landing';
import { Footer } from '@/layout/footer';
import { PageViewTracker } from '@/shared/components/analytics';

export const metadata = homeMetadata;

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <PageViewTracker pageName="home" />

      <main className="flex flex-col">
        <LandingHero />
        <LandingTreePreview />
        <LandingValues />
        <LandingFaq />
        <LandingCta />
        <Footer />
      </main>
    </>
  );
}
