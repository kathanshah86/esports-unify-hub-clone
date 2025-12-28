import { useState } from "react";
import { Trophy, Medal, Star, TrendingUp, Crown, Gamepad2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const leaderboardData = {
  overall: [
    { rank: 1, name: "ProGamer123", avatar: "https://i.pravatar.cc/150?u=1", points: 15420, wins: 48, earnings: "₹2,50,000", game: "BGMI" },
    { rank: 2, name: "ShadowSlayer", avatar: "https://i.pravatar.cc/150?u=2", points: 14850, wins: 45, earnings: "₹2,00,000", game: "Valorant" },
    { rank: 3, name: "NightFury", avatar: "https://i.pravatar.cc/150?u=3", points: 13990, wins: 42, earnings: "₹1,75,000", game: "Free Fire" },
    { rank: 4, name: "StormBreaker", avatar: "https://i.pravatar.cc/150?u=4", points: 12750, wins: 38, earnings: "₹1,50,000", game: "BGMI" },
    { rank: 5, name: "CyberNinja", avatar: "https://i.pravatar.cc/150?u=5", points: 11800, wins: 35, earnings: "₹1,25,000", game: "COD Mobile" },
    { rank: 6, name: "PhoenixRise", avatar: "https://i.pravatar.cc/150?u=6", points: 10950, wins: 33, earnings: "₹1,00,000", game: "Valorant" },
    { rank: 7, name: "DragonSlayer", avatar: "https://i.pravatar.cc/150?u=7", points: 10200, wins: 30, earnings: "₹90,000", game: "BGMI" },
    { rank: 8, name: "VenomStrike", avatar: "https://i.pravatar.cc/150?u=8", points: 9650, wins: 28, earnings: "₹80,000", game: "Free Fire" },
    { rank: 9, name: "ThunderBolt", avatar: "https://i.pravatar.cc/150?u=9", points: 9100, wins: 27, earnings: "₹70,000", game: "BGMI" },
    { rank: 10, name: "GhostRider", avatar: "https://i.pravatar.cc/150?u=10", points: 8750, wins: 25, earnings: "₹65,000", game: "Valorant" },
  ],
};

const games = ["Overall", "BGMI", "Free Fire", "Valorant", "COD Mobile"];

const Leaderboards = () => {
  const [selectedGame, setSelectedGame] = useState("Overall");

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50";
      case 3:
        return "bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600/50";
      default:
        return "bg-card border-border hover:border-primary/50";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">Leaderboards</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              See who's dominating the competition. Climb the ranks and earn your place among legends.
            </p>
          </div>

          {/* Game Filter */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 justify-center">
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

          {/* Top 3 Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* 2nd Place */}
            <div className="md:order-1 md:mt-8">
              <Card className={`${getRankStyles(2)} border transition-all duration-300`}>
                <CardContent className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-20 h-20 border-4 border-gray-400">
                      <AvatarImage src={leaderboardData.overall[1].avatar} />
                      <AvatarFallback>{leaderboardData.overall[1].name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-background font-bold">
                      2
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{leaderboardData.overall[1].name}</h3>
                  <Badge variant="outline" className="mt-2 border-primary/50 text-primary">{leaderboardData.overall[1].game}</Badge>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Points</div>
                      <div className="font-bold text-foreground">{leaderboardData.overall[1].points.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Earnings</div>
                      <div className="font-bold text-secondary">{leaderboardData.overall[1].earnings}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 1st Place */}
            <div className="md:order-2">
              <Card className={`${getRankStyles(1)} border transition-all duration-300`}>
                <CardContent className="p-6 text-center">
                  <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-24 h-24 border-4 border-yellow-500">
                      <AvatarImage src={leaderboardData.overall[0].avatar} />
                      <AvatarFallback>{leaderboardData.overall[0].name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-background font-bold text-lg">
                      1
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{leaderboardData.overall[0].name}</h3>
                  <Badge variant="outline" className="mt-2 border-primary/50 text-primary">{leaderboardData.overall[0].game}</Badge>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Points</div>
                      <div className="font-bold text-foreground">{leaderboardData.overall[0].points.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Earnings</div>
                      <div className="font-bold text-secondary">{leaderboardData.overall[0].earnings}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 3rd Place */}
            <div className="md:order-3 md:mt-8">
              <Card className={`${getRankStyles(3)} border transition-all duration-300`}>
                <CardContent className="p-6 text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-20 h-20 border-4 border-amber-600">
                      <AvatarImage src={leaderboardData.overall[2].avatar} />
                      <AvatarFallback>{leaderboardData.overall[2].name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-background font-bold">
                      3
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{leaderboardData.overall[2].name}</h3>
                  <Badge variant="outline" className="mt-2 border-primary/50 text-primary">{leaderboardData.overall[2].game}</Badge>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Points</div>
                      <div className="font-bold text-foreground">{leaderboardData.overall[2].points.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Earnings</div>
                      <div className="font-bold text-secondary">{leaderboardData.overall[2].earnings}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Full Leaderboard */}
          <Card className="bg-card border-border">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-muted-foreground font-medium">Rank</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Player</th>
                      <th className="text-left p-4 text-muted-foreground font-medium">Game</th>
                      <th className="text-right p-4 text-muted-foreground font-medium">Points</th>
                      <th className="text-right p-4 text-muted-foreground font-medium">Wins</th>
                      <th className="text-right p-4 text-muted-foreground font-medium">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboardData.overall.slice(3).map((player, index) => (
                      <tr 
                        key={player.rank}
                        className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="p-4">
                          {getRankIcon(player.rank)}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={player.avatar} />
                              <AvatarFallback>{player.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{player.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="border-primary/50 text-primary">
                            {player.game}
                          </Badge>
                        </td>
                        <td className="p-4 text-right font-medium text-foreground">
                          {player.points.toLocaleString()}
                        </td>
                        <td className="p-4 text-right text-muted-foreground">
                          {player.wins}
                        </td>
                        <td className="p-4 text-right font-medium text-secondary">
                          {player.earnings}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboards;
