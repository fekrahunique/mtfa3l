import { IslandNav } from "../components/IslandNav";
import { Footer } from "../components/Footer";
import { Hero } from "../sections/Hero";
import { TaglineReveal } from "../sections/TaglineReveal";
import { Benefits } from "../sections/Benefits";
import { HowItWorks } from "../sections/HowItWorks";
import { JourneyPreview } from "../sections/JourneyPreview";
import { Pricing } from "../sections/Pricing";
import { FAQ } from "../sections/FAQ";
import { FinalCTA } from "../sections/FinalCTA";

export function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <IslandNav />
      <main id="main-content">
        <Hero />
        <TaglineReveal />
        <Benefits />
        <HowItWorks />
        <JourneyPreview />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
