import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import ScrollTopButton from "@/components/base/ScrollTopButton";
import AboutHero from "@/pages/about/components/AboutHero";
import AboutMission from "@/pages/about/components/AboutMission";
import AboutStory from "@/pages/about/components/AboutStory";
import AboutTeam from "@/pages/about/components/AboutTeam";

export default function AboutPage() {
  return (
    <div className="min-h-screen w-full bg-background-50">
      <Navbar />
      <main>
        <AboutHero />
        <AboutMission />
        <AboutStory />
        <AboutTeam />
      </main>
      <Footer />
      <ScrollTopButton />
    </div>
  );
}