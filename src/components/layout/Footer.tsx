import { Link } from "react-router-dom";
import { Gamepad2, Twitter, Youtube, MessageCircle, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-gaming flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-gradient">
                Battle Mitra
              </span>
            </Link>
            <p className="text-muted-foreground text-sm">
              India's premier esports tournament platform. Join the battle, claim your glory.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tournaments" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Tournaments
                </Link>
              </li>
              <li>
                <Link to="/live" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Live Matches
                </Link>
              </li>
              <li>
                <Link to="/leaderboards" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Leaderboards
                </Link>
              </li>
              <li>
                <Link to="/announcements" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Announcements
                </Link>
              </li>
            </ul>
          </div>

          {/* Games */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Games</h3>
            <ul className="space-y-2">
              <li className="text-muted-foreground text-sm">BGMI</li>
              <li className="text-muted-foreground text-sm">Free Fire</li>
              <li className="text-muted-foreground text-sm">Valorant</li>
              <li className="text-muted-foreground text-sm">Call of Duty Mobile</li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 Battle Mitra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
