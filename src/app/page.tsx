import { HeroSection } from "../components/sections/hero-section"
import { FeaturedProducts } from "../components/sections/featured-products"
import { AboutSection } from "../components/sections/about-section"
import { NewsletterSection } from "../components/sections/newsletter-section"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedProducts />
      <AboutSection />
      <NewsletterSection />
    </>
  )
}
