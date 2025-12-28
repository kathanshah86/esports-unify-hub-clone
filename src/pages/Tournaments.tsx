import { useState } from "react";
import { Search, Filter, Calendar, Users, Trophy, Gamepad2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const allTournaments = [
  {
    id: 1,
    title: "BGMI Pro League Season 5",
    game: "BGMI",
    date: "Jan 15, 2025",
    prize: "₹5,00,000",
    teams: 64,
    registered: 42,
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
    registered: 35,
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
    registered: 28,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b0c?w=400&h=200&fit=crop",
  },
  {
    id: 4,
    title: "COD Mobile Championship",
    game: "COD Mobile",
    date: "Feb 10, 2025",
    prize: "₹2,50,000",
    teams: 32,
    registered: 18,
    status: "registration",
    image: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=400&h=200&fit=crop",
  },
  {
    id: 5,
    title: "BGMI Squad Showdown",
    game: "BGMI",
    date: "Feb 15, 2025",
    prize: "₹1,00,000",
    teams: 100,
    registered: 67,
    status: "registration",
    image: "https://images.unsplash.com/photo-1493711662062-fa541f7f897a?w=400&h=200&fit=crop",
  },
  {
    id: 6,
    title: "Free Fire Solo Legends",
    game: "Free Fire",
    date: "Feb 20, 2025",
    prize: "₹50,000",
    teams: 50,
    registered: 12,
    status: "upcoming",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=200&fit=crop",
  },
];

const games = ["All", "BGMI", "Free Fire", "Valorant", "COD Mobile"];

const Tournaments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGame, setSelectedGame] = useState("All");
  const [activeTab, setActiveTab] = useState("all");

  const filteredTournaments = allTournaments.filter((tournament) => {
    const matchesSearch = tournament.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGame = selectedGame === "All" || tournament.game === selectedGame;
    const matchesStatus = activeTab === "all" || 
      (activeTab === "open" && tournament.status === "registration") ||
      (activeTab === "upcoming" && tournament.status === "upcoming");
    return matchesSearch && matchesGame && matchesStatus;
  });

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">Tournaments</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Browse and join exciting esports tournaments. Compete with the best and win amazing prizes.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {games.map((game) => (
                <Button
                  key={game}
                  variant={selectedGame === game ? "default" : "outline"}
                  onClick={() => setSelectedGame(game)}
                  className={selectedGame === game ? "bg-gradient-gaming" : "border-border hover:border-primary/50"}
                >
                  {game}
                </Button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="bg-card border border-border">
              <TabsTrigger value="all">All Tournaments</TabsTrigger>
              <TabsTrigger value="open">Open Registration</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Tournament Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament, index) => (
              <Card 
                key={tournament.id} 
                className="bg-card border-border overflow-hidden hover:border-primary/50 transition-all duration-300 group animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
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
                  <div className="flex items-center gap-2 mb-3">
                    <Gamepad2 className="w-4 h-4 text-primary" />
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      {tournament.game}
                    </Badge>
                  </div>
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
                      {tournament.registered}/{tournament.teams}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-5 pt-0 flex justify-between items-center">
                  <div className="flex items-center gap-1 text-secondary font-semibold">
                    <Trophy className="w-4 h-4" />
                    {tournament.prize}
                  </div>
                  <Button size="sm" className="bg-gradient-gaming hover:opacity-90">
                    {tournament.status === "registration" ? "Register" : "View Details"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredTournaments.length === 0 && (
            <div className="text-center py-20">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No tournaments found</h3>
              <p className="text-muted-foreground">Try adjusting your filters or search query</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Tournaments;
