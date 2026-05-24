import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModeProvider } from "@/contexts/ModeContext";
import { Component, lazy, Suspense } from "react";
import type { ComponentType, ReactNode } from "react";
import { Loader2 } from "lucide-react";

// Welcome/Landing - eager load for first paint
import Welcome from "./pages/Welcome";

const CHUNK_RELOAD_KEY = "__chunk_reload__";

const isChunkLoadError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /Importing a module script failed|Failed to fetch dynamically imported module|Loading chunk \d+ failed|ChunkLoadError/i.test(message);
};

const lazyWithReload = <T extends { default: ComponentType<any> }>(
  importer: () => Promise<T>
) =>
  lazy(async () => {
    try {
      const module = await importer();
      sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      return module;
    } catch (error) {
      if (isChunkLoadError(error) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
        window.location.reload();
        return new Promise<T>(() => undefined);
      }
      throw error;
    }
  });

class ChunkErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: isChunkLoadError(error) };
  }

  componentDidCatch(error: unknown) {
    if (isChunkLoadError(error) && !sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
      sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground" onClick={() => window.location.reload()}>
            Reload app
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy loaded pages
const Index = lazyWithReload(() => import("./pages/Index"));
const Tournaments = lazyWithReload(() => import("./pages/Tournaments"));
const TournamentDetail = lazyWithReload(() => import("./pages/TournamentDetail"));
const Leaderboards = lazyWithReload(() => import("./pages/Leaderboards"));
const LiveMatches = lazyWithReload(() => import("./pages/LiveMatches"));
const Wallet = lazyWithReload(() => import("./pages/Wallet"));
const Admin = lazyWithReload(() => import("./pages/Admin"));
const Auth = lazyWithReload(() => import("./pages/Auth"));
const Profile = lazyWithReload(() => import("./pages/Profile"));
const NotFound = lazyWithReload(() => import("./pages/NotFound"));

// Sports Mode Pages
const SportsIndex = lazyWithReload(() => import("./pages/sports/SportsIndex"));
const SportsTournaments = lazyWithReload(() => import("./pages/sports/SportsTournaments"));
const SportsTournamentDetail = lazyWithReload(() => import("./pages/sports/SportsTournamentDetail"));
const SportsLeaderboards = lazyWithReload(() => import("./pages/sports/SportsLeaderboards"));
const SportsLiveMatches = lazyWithReload(() => import("./pages/sports/SportsLiveMatches"));
const SportsAdmin = lazyWithReload(() => import("./pages/sports/SportsAdmin"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 5, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ChunkErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Welcome/Multiverse Landing Page */}
                  <Route path="/" element={<Welcome />} />
                  
                  {/* Esports Routes */}
                  <Route path="/esports" element={<Index />} />
                  <Route path="/tournaments" element={<Tournaments />} />
                  <Route path="/tournaments/:id" element={<TournamentDetail />} />
                  <Route path="/leaderboards" element={<Leaderboards />} />
                  <Route path="/live-matches" element={<LiveMatches />} />
                  <Route path="/wallet" element={<Wallet />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />
                  
                  {/* Sports Routes */}
                  <Route path="/sports" element={<SportsIndex />} />
                  <Route path="/sports/tournaments" element={<SportsTournaments />} />
                  <Route path="/sports/tournaments/:id" element={<SportsTournamentDetail />} />
                  <Route path="/sports/leaderboards" element={<SportsLeaderboards />} />
                  <Route path="/sports/live-matches" element={<SportsLiveMatches />} />
                  <Route path="/sports/admin" element={<SportsAdmin />} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </ChunkErrorBoundary>
          </BrowserRouter>
        </TooltipProvider>
      </ModeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
