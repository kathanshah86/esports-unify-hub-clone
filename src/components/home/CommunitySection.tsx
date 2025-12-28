import { Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Users, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const CommunitySection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-gaming flex items-center justify-center mx-auto mb-8 animate-float">
            <Users className="w-10 h-10 text-primary-foreground" />
          </div>

          {/* Content */}
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">
            Join the <span className="text-gradient">Battle Mitra</span> Community
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with thousands of gamers, find teammates, share strategies, and stay updated on the latest esports news.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mb-12">
            <div className="p-6 rounded-xl bg-card/50 border border-border">
              <Gamepad2 className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">10K+</div>
              <div className="text-sm text-muted-foreground">Active Gamers</div>
            </div>
            <div className="p-6 rounded-xl bg-card/50 border border-border">
              <MessageCircle className="w-8 h-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">50K+</div>
              <div className="text-sm text-muted-foreground">Discord Members</div>
            </div>
            <div className="p-6 rounded-xl bg-card/50 border border-border">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-foreground">1K+</div>
              <div className="text-sm text-muted-foreground">Teams Created</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://discord.gg/battlemitra" target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-gradient-gaming hover:opacity-90 text-lg px-8">
                <MessageCircle className="w-5 h-5 mr-2" />
                Join Discord
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <Link to="/auth?mode=signup">
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 text-lg px-8">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
