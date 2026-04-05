import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div className="gradient-hero rounded-2xl p-10 md:p-16 text-center shadow-elevated">
          <h2 className="text-3xl md:text-4xl font-display font-700 text-primary-foreground mb-4">
            Ready to Start Meeting?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto mb-8">
            Join thousands of African teams already using Afromeet. 
            No credit card required — start free today.
          </p>
          <Button
            size="lg"
            className="bg-accent text-accent-foreground hover:bg-accent/90 border-0 text-base px-8 shadow-elevated"
          >
            <Video className="w-5 h-5 mr-2" />
            Start Your Free Meeting
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
