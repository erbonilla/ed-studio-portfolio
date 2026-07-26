import { IntroLoader } from "@/components/intro/IntroLoader";
import { PortfolioHero } from "@/components/hero/PortfolioHero";
import { AboutSection } from "@/components/about/AboutSection";
import { PortfolioNavigation } from "@/components/navigation/PortfolioNavigation";
import { WorkSection } from "@/components/work/WorkSection";

export default function Home() {
  return (
    <main>
      <IntroLoader />
      <PortfolioNavigation />
      <PortfolioHero />
      <AboutSection />
      <WorkSection />
    </main>
  );
}
