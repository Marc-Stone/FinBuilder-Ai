import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import Reveal from "@/components/base/Reveal";
import ScrollTopButton from "@/components/base/ScrollTopButton";
import Hero from "@/pages/home/components/Hero";
import DashboardPreview from "@/pages/home/components/DashboardPreview";
import SolutionSection from "@/pages/home/components/SolutionSection";
import FeaturesSection from "@/pages/home/components/FeaturesSection";
import ProfileSection from "@/pages/home/components/ProfileSection";
import ProjectsSection from "@/pages/home/components/ProjectsSection";
import AiSection from "@/pages/home/components/AiSection";
import TestimonialsSection from "@/pages/home/components/TestimonialsSection";
import FaqSection from "@/pages/home/components/FaqSection";
import CtaSection from "@/pages/home/components/CtaSection";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-background-50">
      <Navbar />
      <main>
        <Hero />
        <div className="surface-halo w-full bg-background-50 pb-4 pt-10 md:pt-14">
          <DashboardPreview />
          <Reveal delay={120} distance={14} className="shell mt-6">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-foreground-500">
              <span className="inline-flex items-center gap-1.5">
                <i className="ri-lock-line text-sm text-primary-600" />
                Chaque compte est cloisonné
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="ri-refresh-line text-sm text-primary-600" />
                Synchronisation instantanée
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="ri-smartphone-line text-sm text-primary-600" />
                Pensé mobile d'abord
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="ri-file-list-3-line text-sm text-primary-600" />
                Historique paginé, 20 lignes par page
              </span>
            </div>
          </Reveal>
        </div>
        <SolutionSection />
        <FeaturesSection />
        <ProfileSection />
        <ProjectsSection />
        <AiSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
      <ScrollTopButton />
    </div>
  );
}