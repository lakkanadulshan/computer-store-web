import HeroSection from "../components/HeroSection";
import CategoryGrid from "../components/CategoryGrid";

export default function LandingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <HeroSection />
      <CategoryGrid />
    </div>
  );
}
