import { Contact } from "./Contact";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { Services } from "./Services";
import { Testimonials } from "./Testimonials";
import { WhyChooseUs } from "./WhyChooseUs";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Hero />
      <Services />
      <WhyChooseUs />
      <HowItWorks />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}
