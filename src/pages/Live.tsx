import { useState } from "react";
import { Play, Eye, Calendar, Clock, Users, Radio } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const liveMatches = [
  {
    id: 1,
    title: "BGMI Pro League - Grand Finals",
    game: "BGMI",
    team1: "Team SouL",
    team2: "GodLike Esports",
    viewers: 15420,
    startTime: "Live",
    streamUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=340&fit=crop",
  },
  {
    id: 2,
    title: "Free Fire Champions - Semi Finals",
    game: "Free Fire",
    team1: "Total Gaming",
    team2: "Desi Gamers",
    viewers: 8750,
    startTime: "Live",
    streamUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=340&fit=crop",
  },
];

const upcomingMatches = [
  {
    id: 3,
    title: "Valorant India Invitational - Quarter Finals",
    game: "Valorant",
    team1: "Global Esports",
    team2: "Velocity Gaming",
    viewers: 0,
    startTime: "Today, 6:00 PM",
    thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b0c?w=600&h=340&fit=crop",
  },
  {
    id: 4,
    title: "COD Mobile Championship - Group Stage",
    game: "COD Mobile",
    team1: "Revenant Esports",
    team2: "Tribe Gaming",
    viewers: 0,
    startTime: "Tomorrow, 4:00 PM",
    thumbnail: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=600&h=340&fit=crop",
  },
];

const Live = () => {
  const [selectedMatch, setSelectedMatch] = useState(liveMatches[0]);

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/20 border border-destructive/50 mb-4">
              <Radio className="w-4 h-4 text-destructive animate-pulse" />
              <span className="text-sm text-destructive font-medium">Live Now</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">Live Matches</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Watch live esports action. Catch the biggest tournaments and matches in real-time.
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-6">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-card border border-border">
                <iframe
                  src={selectedMatch.streamUrl}
                  title={selectedMatch.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              
              {/* Match Info */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <Badge className="bg-gradient-gaming mb-2">{selectedMatch.game}</Badge>
                    <h2 className="text-xl font-semibold text-foreground">{selectedMatch.title}</h2>
                    <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {selectedMatch.viewers.toLocaleString()} watching
                      </div>
                      <div className="flex items-center gap-1">
                        <Radio className="w-4 h-4 text-destructive" />
                        {selectedMatch.startTime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{selectedMatch.team1}</div>
                      <div className="text-sm text-muted-foreground">Team 1</div>
                    </div>
                    <div className="text-2xl font-bold text-primary">VS</div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-foreground">{selectedMatch.team2}</div>
                      <div className="text-sm text-muted-foreground">Team 2</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Match List */}
            <div className="space-y-6">
              <Tabs defaultValue="live">
                <TabsList className="w-full bg-card border border-border">
                  <TabsTrigger value="live" className="flex-1">Live</TabsTrigger>
                  <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
                </TabsList>
                
                <TabsContent value="live" className="mt-4 space-y-4">
                  {liveMatches.map((match) => (
                    <Card 
                      key={match.id}
                      className={`bg-card border cursor-pointer transition-all duration-300 hover:border-primary/50 ${
                        selectedMatch.id === match.id ? "border-primary" : "border-border"
                      }`}
                      onClick={() => setSelectedMatch(match)}
                    >
                      <CardHeader className="p-0">
                        <div className="relative h-32 overflow-hidden rounded-t-lg">
                          <img 
                            src={match.thumbnail} 
                            alt={match.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded bg-destructive/90 text-destructive-foreground text-xs">
                            <Radio className="w-3 h-3 animate-pulse" />
                            LIVE
                          </div>
                          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded bg-background/80 text-foreground text-xs">
                            <Eye className="w-3 h-3" />
                            {match.viewers.toLocaleString()}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <Badge variant="outline" className="border-primary/50 text-primary text-xs mb-2">
                          {match.game}
                        </Badge>
                        <h3 className="text-sm font-medium text-foreground line-clamp-2">
                          {match.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>{match.team1}</span>
                          <span className="text-primary">vs</span>
                          <span>{match.team2}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="upcoming" className="mt-4 space-y-4">
                  {upcomingMatches.map((match) => (
                    <Card 
                      key={match.id}
                      className="bg-card border border-border"
                    >
                      <CardHeader className="p-0">
                        <div className="relative h-32 overflow-hidden rounded-t-lg">
                          <img 
                            src={match.thumbnail} 
                            alt={match.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded bg-muted text-muted-foreground text-xs">
                            <Clock className="w-3 h-3" />
                            {match.startTime}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <Badge variant="outline" className="border-primary/50 text-primary text-xs mb-2">
                          {match.game}
                        </Badge>
                        <h3 className="text-sm font-medium text-foreground line-clamp-2">
                          {match.title}
                        </h3>
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>{match.team1}</span>
                          <span className="text-primary">vs</span>
                          <span>{match.team2}</span>
                        </div>
                        <Button size="sm" variant="outline" className="w-full mt-3 border-primary/50 hover:bg-primary/10">
                          Set Reminder
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Live;
