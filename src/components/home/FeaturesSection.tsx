import { Gamepad2, Shield, Zap, Trophy, Users, Tv } from "lucide-react";

const features = [
  {
    icon: Trophy,
    title: "Daily Tournaments",
    description: "Compete in daily tournaments across multiple games and win exciting prizes",
  },
  {
    icon: Users,
    title: "Team Management",
    description: "Create and manage your esports team with our powerful team tools",
  },
  {
    icon: Tv,
    title: "Live Streaming",
    description: "Watch live matches and streams directly on our platform",
  },
  {
    icon: Gamepad2,
    title: "Multiple Games",
    description: "Support for BGMI, Free Fire, Valorant, COD Mobile and more",
  },
  {
    icon: Shield,
    title: "Anti-Cheat",
    description: "Fair play guaranteed with our advanced anti-cheat system",
  },
  {
    icon: Zap,
    title: "Instant Payouts",
    description: "Win and withdraw your earnings instantly to your account",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Why Choose <span className="text-gradient">Battle Mitra</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We provide everything you need to take your esports journey to the next level
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={feature.title}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-gaming flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
