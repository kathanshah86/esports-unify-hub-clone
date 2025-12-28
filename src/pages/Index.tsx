import Layout from "@/components/layout/Layout";
import HeroSection from "@/components/home/HeroSection";
import TournamentPreview from "@/components/home/TournamentPreview";
import FeaturesSection from "@/components/home/FeaturesSection";
import CommunitySection from "@/components/home/CommunitySection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <TournamentPreview />
      <FeaturesSection />
      <CommunitySection />
    </Layout>
  );
};

export default Index;
