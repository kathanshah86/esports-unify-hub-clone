import { Link } from "react-router-dom";
import { Calendar, Users, Trophy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tournaments = [
  {
    id: 1,
    title: "BGMI Pro League Season 5",
    game: "BGMI",
    date: "Jan 15, 2025",
    prize: "₹5,00,000",
    teams: 64,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop",
  },
  {
    id: 2,
    title: "Free Fire Champions Cup",
    game: "Free Fire",
    date: "Jan 20, 2025",
    prize: "₹3,00,000",
    teams: 48,
    status: "registration",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=200&fit=crop",
  },
  {
    id: 3,
    title: "Valorant India Invitational",
    game: "Valorant",
    date: "Feb 1, 2025",
    prize: "₹10,00,000",
    teams: 32,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b0c?w=400&h=200&fit=crop",
  },
];

const TournamentPreview = () => {
  return (
    <section className="py-20 bg-card/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
              <span className="text-gradient">Upcoming</span> Tournaments
            </h2>
            <p className="text-muted-foreground">Join the next big competition and prove your worth</p>
          </div>
          <Link to="/tournaments" className="mt-4 md:mt-0">
            <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Tournament Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament, index) => (
            <Card 
              key={tournament.id} 
              className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="p-0">
                <div className="relative h-40 overflow-hidden">
                  <img 
                    src={tournament.image} 
                    alt={tournament.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  <Badge 
                    className={`absolute top-3 right-3 ${
                      tournament.status === "registration" 
                        ? "bg-secondary text-secondary-foreground" 
                        : "bg-primary/80"
                    }`}
                  >
                    {tournament.status === "registration" ? "Open" : "Upcoming"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <Badge variant="outline" className="mb-3 border-primary/50 text-primary">
                  {tournament.game}
                </Badge>
                <h3 className="text-lg font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {tournament.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {tournament.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {tournament.teams} Teams
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0 flex justify-between items-center">
                <div className="flex items-center gap-1 text-secondary font-semibold">
                  <Trophy className="w-4 h-4" />
                  {tournament.prize}
                </div>
                <Link to={`/tournaments/${tournament.id}`}>
                  <Button size="sm" className="bg-gradient-gaming hover:opacity-90">
                    Join Now
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TournamentPreview;
