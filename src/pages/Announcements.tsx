import { Calendar, Clock, ArrowRight, Bell, Megaphone, Trophy, Zap } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const announcements = [
  {
    id: 1,
    title: "BGMI Pro League Season 5 Registration Open!",
    description: "Get ready for the biggest BGMI tournament of the year. Prize pool of ₹5,00,000! Registration closes on January 10, 2025. Don't miss your chance to compete with the best.",
    date: "Dec 28, 2024",
    time: "10:00 AM",
    category: "Tournament",
    priority: "high",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=300&fit=crop",
  },
  {
    id: 2,
    title: "New Anti-Cheat System Deployed",
    description: "We've upgraded our anti-cheat system to ensure fair play across all tournaments. Cheaters will be permanently banned. Play fair, play hard!",
    date: "Dec 27, 2024",
    time: "2:00 PM",
    category: "Update",
    priority: "medium",
  },
  {
    id: 3,
    title: "Weekend Special: Double XP Event",
    description: "Earn double XP on all matches this weekend. Level up faster and unlock exclusive rewards. Event runs from Saturday 12 AM to Sunday 11:59 PM.",
    date: "Dec 26, 2024",
    time: "12:00 AM",
    category: "Event",
    priority: "medium",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&h=300&fit=crop",
  },
  {
    id: 4,
    title: "Valorant India Invitational Announced",
    description: "Mark your calendars! The Valorant India Invitational kicks off on February 1, 2025. Prize pool of ₹10,00,000 awaits the champions.",
    date: "Dec 25, 2024",
    time: "6:00 PM",
    category: "Tournament",
    priority: "high",
  },
  {
    id: 5,
    title: "Platform Maintenance - January 5",
    description: "Scheduled maintenance on January 5, 2025 from 2:00 AM to 6:00 AM IST. The platform will be temporarily unavailable during this time.",
    date: "Dec 24, 2024",
    time: "11:00 AM",
    category: "Maintenance",
    priority: "low",
  },
  {
    id: 6,
    title: "New Referral Program Launch",
    description: "Invite your friends and earn rewards! For every friend who signs up and participates in a tournament, you'll both receive ₹100 in tournament credits.",
    date: "Dec 23, 2024",
    time: "3:00 PM",
    category: "Feature",
    priority: "medium",
  },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Tournament":
      return Trophy;
    case "Update":
      return Zap;
    case "Event":
      return Bell;
    case "Maintenance":
      return Clock;
    default:
      return Megaphone;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Tournament":
      return "bg-primary/20 text-primary border-primary/50";
    case "Update":
      return "bg-secondary/20 text-secondary border-secondary/50";
    case "Event":
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
    case "Maintenance":
      return "bg-orange-500/20 text-orange-500 border-orange-500/50";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case "high":
      return "border-l-4 border-l-destructive";
    case "medium":
      return "border-l-4 border-l-primary";
    default:
      return "border-l-4 border-l-muted";
  }
};

const Announcements = () => {
  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">Announcements</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest news, tournament updates, and platform announcements.
            </p>
          </div>

          {/* Featured Announcement */}
          <Card className="bg-card border-border overflow-hidden mb-12 hover:border-primary/50 transition-all duration-300">
            <div className="grid md:grid-cols-2">
              <div className="relative h-64 md:h-auto">
                <img 
                  src={announcements[0].image} 
                  alt={announcements[0].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-card via-card/50 to-transparent md:bg-gradient-to-r" />
              </div>
              <CardContent className="p-8 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getCategoryColor(announcements[0].category)}>
                    <Trophy className="w-3 h-3 mr-1" />
                    {announcements[0].category}
                  </Badge>
                  <Badge variant="destructive">Featured</Badge>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {announcements[0].title}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {announcements[0].description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {announcements[0].date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {announcements[0].time}
                  </div>
                </div>
                <Button className="bg-gradient-gaming hover:opacity-90 w-fit">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </div>
          </Card>

          {/* All Announcements */}
          <div className="space-y-6">
            {announcements.slice(1).map((announcement, index) => {
              const Icon = getCategoryIcon(announcement.category);
              return (
                <Card 
                  key={announcement.id}
                  className={`bg-card border-border ${getPriorityStyles(announcement.priority)} hover:border-primary/50 transition-all duration-300 animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {announcement.image && (
                        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={announcement.image} 
                            alt={announcement.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={getCategoryColor(announcement.category)}>
                            <Icon className="w-3 h-3 mr-1" />
                            {announcement.category}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer">
                          {announcement.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {announcement.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {announcement.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {announcement.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Announcements;
