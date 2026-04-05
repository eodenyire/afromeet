import { Video, Shield, Users, Monitor, Mic, Globe } from "lucide-react";

const features = [
  {
    icon: Video,
    title: "HD Video Calls",
    desc: "Adaptive video quality that works even on low bandwidth — crystal clear when your network allows it.",
  },
  {
    icon: Users,
    title: "Up to 100 Participants",
    desc: "Host large meetings, webinars, and virtual classrooms with reliable multi-party conferencing.",
  },
  {
    icon: Monitor,
    title: "Screen Sharing",
    desc: "Share your screen, a window, or a specific tab with one click. Present with confidence.",
  },
  {
    icon: Shield,
    title: "End-to-End Encryption",
    desc: "Your conversations stay private. Enterprise-grade security keeps your data protected.",
  },
  {
    icon: Mic,
    title: "Noise Cancellation",
    desc: "AI-powered noise suppression filters out background sounds so your voice comes through clearly.",
  },
  {
    icon: Globe,
    title: "Built for Africa",
    desc: "Optimized for African network conditions with low-latency servers across the continent.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-secondary/50">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-700 text-foreground mb-4">
            Everything You Need to Connect
          </h2>
          <p className="text-muted-foreground text-lg">
            Professional video conferencing tools designed with African teams in mind.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="bg-card rounded-xl p-6 shadow-card hover:shadow-elevated transition-shadow duration-300 animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg gradient-hero flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-display font-600 text-foreground mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
