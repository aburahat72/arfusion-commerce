import Hero from "../../components/home/Hero";
import ServiceMarquee from "../../components/home/ServiceMarquee";
import CategorySection from "../../components/home/CategorySection";
import FeaturedProducts from "../../components/home/FeaturedProducts";
import DealOfTheDay from "../../components/home/DealOfTheDay";
import PromotionalBanners from "../../components/home/PromotionalBanners";
import HomeCTA from "../../components/home/HomeCTA";

function Home() {
  return (
    <div className="bg-background">
      <Hero />
      <ServiceMarquee />
      <CategorySection />
      <FeaturedProducts />
      <DealOfTheDay />
      <PromotionalBanners />
      <HomeCTA />
    </div>
  );
}

export default Home;
