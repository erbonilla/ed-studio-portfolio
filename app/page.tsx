import { IntroLoader } from "@/components/intro/IntroLoader";
import { PortfolioHero } from "@/components/hero/PortfolioHero";
import { AboutSection } from "@/components/about/AboutSection";
import { PortfolioNavigation } from "@/components/navigation/PortfolioNavigation";
import { WorkMarquee } from "@/components/work/WorkMarquee";
import { WorkSection } from "@/components/work/WorkSection";
import { ContactSection } from "@/components/contact/ContactSection";

export default function Home() {
  return (
    <main>
      <IntroLoader />
      <PortfolioNavigation />
      <PortfolioHero />
      <AboutSection />
      <WorkMarquee />
      <WorkSection />
      <ContactSection />
    </main>
  );
}
