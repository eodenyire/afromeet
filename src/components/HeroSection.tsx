import heroImg from "@/assets/hero-illustration.jpg";
import { Button } from "@/components/ui/button";
import { Video, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="container grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-sm font-medium text-primary">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse-glow" />
            Now in Beta — Free for everyone
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-800 leading-tight text-foreground">
            Connect Africa,{" "}
            <span className="text-primary">One Meeting</span>{" "}
            at a Time
          </h1>

          <p className="text-lg text-muted-foreground max-w-lg">
            Crystal-clear video calls, instant screen sharing, and reliable connections — 
            built for Africa's bandwidth realities. Meet without limits.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/meeting">
              <Button size="lg" className="gradient-hero border-0 text-base px-6 shadow-elevated">
                <Video className="w-5 h-5 mr-2" />
                Start Free Meeting
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-base px-6">
              Learn More
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            No download required · Up to 100 participants · End-to-end encrypted
          </p>
        </div>

        <div className="animate-slide-in-right" style={{ animationDelay: "0.2s" }}>
          <div className="relative">
            <div className="absolute -inset-4 rounded-2xl gradient-hero opacity-10 blur-2xl" />
            <img
              src={heroImg}
              alt="Afromeet video conferencing"
              className="relative rounded-2xl shadow-elevated w-full"
              width={1280}
              height={720}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
