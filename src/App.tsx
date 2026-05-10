import React, { useEffect, useState } from 'react';
import { db, collection, onSnapshot, query, orderBy, setDoc, doc } from './firebase';
import { Match, Team } from './types';
import { FirebaseProvider, useAuth } from './components/FirebaseProvider';
import { Navbar } from './components/Navbar';
import { MatchCard } from './components/MatchCard';
import { AdminPanel } from './components/AdminPanel';
import { Bracket } from './components/Bracket';
import { HostCities } from './components/HostCities';
import { Standings } from './components/Standings';
import { Countdown } from './components/Countdown';
import { SkeletonMatch, SkeletonGroup } from './components/Skeletons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Toaster, toast } from 'sonner';
import { Trophy, Calendar as CalendarIcon, Settings, Database, Users, Search, Filter, BarChart3, Download, Info, Share2, Smartphone, Star, MapPin, Globe } from 'lucide-react';
import { STAGES } from './constants';
import { motion, AnimatePresence } from 'motion/react';

const AppContent: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('calendar');
  const [userTimezone, setUserTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (matchId: string) => {
    setFavorites(prev => 
      prev.includes(matchId) 
        ? prev.filter(id => id !== matchId) 
        : [...prev, matchId]
    );
    toast.success(favorites.includes(matchId) ? "Retiré des favoris" : "Ajouté aux favoris");
  };

  useEffect(() => {
    // Handle PWA share target and start_url params
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source');
    const shareTitle = urlParams.get('title');
    const shareText = urlParams.get('text');
    const shareUrl = urlParams.get('url');

    if (source === 'pwa') {
      console.log('App launched from PWA');
    }

    if (shareTitle || shareText || shareUrl) {
      toast.info(`Contenu partagé reçu : ${shareTitle || shareText || ''}`);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      toast.success("Application installée avec succès !");
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const hasLiveMatches = matches.some(m => m.status === 'Live');

  useEffect(() => {
    const qMatches = query(collection(db, 'matches'), orderBy('date', 'asc'));
    const unsubscribeMatches = onSnapshot(qMatches, (snapshot) => {
      const matchesData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Match));
      setMatches(matchesData);
      setLoading(false);
    });

    const qTeams = query(collection(db, 'teams'), orderBy('name', 'asc'));
    const unsubscribeTeams = onSnapshot(qTeams, (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Team));
      setTeams(teamsData);
    });

    return () => {
      unsubscribeMatches();
      unsubscribeTeams();
    };
  }, []);

  const filteredMatches = matches.filter(match => {
    const matchesSearch = 
      match.homeTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.awayTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.venue.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStage = filterStage === 'all' ? true : filterStage === 'live' ? match.status === 'Live' : match.stage === filterStage;
    const matchesFavorite = !showOnlyFavorites || favorites.includes(match.id);
    
    return matchesSearch && matchesStage && matchesFavorite;
  });

  const seedTeams = async () => {
    const initialTeams: Team[] = [
      // Group A
      { id: 'mex', name: 'Mexique', flag: '🇲🇽', group: 'A' },
      { id: 'rsa', name: 'Afrique du Sud', flag: '🇿🇦', group: 'A' },
      { id: 'kor', name: 'Corée du Sud', flag: '🇰🇷', group: 'A' },
      { id: 'cze', name: 'Tchéquie', flag: '🇨🇿', group: 'A' },
      // Group B
      { id: 'can', name: 'Canada', flag: '🇨🇦', group: 'B' },
      { id: 'bih', name: 'Bosnie-Herzégovine', flag: '🇧🇦', group: 'B' },
      { id: 'qat', name: 'Qatar', flag: '🇶🇦', group: 'B' },
      { id: 'sui', name: 'Suisse', flag: '🇨🇭', group: 'B' },
      // Group C
      { id: 'bra', name: 'Brésil', flag: '🇧🇷', group: 'C' },
      { id: 'mar', name: 'Maroc', flag: '🇲🇦', group: 'C' },
      { id: 'hai', name: 'Haïti', flag: '🇭🇹', group: 'C' },
      { id: 'sco', name: 'Écosse', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C' },
      // Group D
      { id: 'usa', name: 'États-Unis', flag: '🇺🇸', group: 'D' },
      { id: 'par', name: 'Paraguay', flag: '🇵🇾', group: 'D' },
      { id: 'aus', name: 'Australie', flag: '🇦🇺', group: 'D' },
      { id: 'tur', name: 'Turquie', flag: '🇹🇷', group: 'D' },
      // Group E
      { id: 'ger', name: 'Allemagne', flag: '🇩🇪', group: 'E' },
      { id: 'cuw', name: 'Curaçao', flag: '🇨🇼', group: 'E' },
      { id: 'civ', name: 'Côte d\'Ivoire', flag: '🇨🇮', group: 'E' },
      { id: 'ecu', name: 'Équateur', flag: '🇪🇨', group: 'E' },
      // Group F
      { id: 'ned', name: 'Pays-Bas', flag: '🇳🇱', group: 'F' },
      { id: 'jpn', name: 'Japon', flag: '🇯🇵', group: 'F' },
      { id: 'swe', name: 'Suède', flag: '🇸🇪', group: 'F' },
      { id: 'tun', name: 'Tunisie', flag: '🇹🇳', group: 'F' },
      // Group G
      { id: 'bel', name: 'Belgique', flag: '🇧🇪', group: 'G' },
      { id: 'egy', name: 'Égypte', flag: '🇪🇬', group: 'G' },
      { id: 'irn', name: 'Iran', flag: '🇮🇷', group: 'G' },
      { id: 'nzl', name: 'Nouvelle-Zélande', flag: '🇳🇿', group: 'G' },
      // Group H
      { id: 'esp', name: 'Espagne', flag: '🇪🇸', group: 'H' },
      { id: 'cpv', name: 'Cap-Vert', flag: '🇨🇻', group: 'H' },
      { id: 'ksa', name: 'Arabie saoudite', flag: '🇸🇦', group: 'H' },
      { id: 'uru', name: 'Uruguay', flag: '🇺🇾', group: 'H' },
      // Group I
      { id: 'fra', name: 'France', flag: '🇫🇷', group: 'I' },
      { id: 'sen', name: 'Sénégal', flag: '🇸🇳', group: 'I' },
      { id: 'irq', name: 'Irak', flag: '🇮🇶', group: 'I' },
      { id: 'nor', name: 'Norvège', flag: '🇳🇴', group: 'I' },
      // Group J
      { id: 'arg', name: 'Argentine', flag: '🇦🇷', group: 'J' },
      { id: 'alg', name: 'Algérie', flag: '🇩🇿', group: 'J' },
      { id: 'aut', name: 'Autriche', flag: '🇦🇹', group: 'J' },
      { id: 'jor', name: 'Jordanie', flag: '🇯🇴', group: 'J' },
      // Group K
      { id: 'por', name: 'Portugal', flag: '🇵🇹', group: 'K' },
      { id: 'cod', name: 'RD Congo', flag: '🇨🇩', group: 'K' },
      { id: 'uzb', name: 'Ouzbékistan', flag: '🇺🇿', group: 'K' },
      { id: 'col', name: 'Colombie', flag: '🇨🇴', group: 'K' },
      // Group L
      { id: 'eng', name: 'Angleterre', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'L' },
      { id: 'cro', name: 'Croatie', flag: '🇭🇷', group: 'L' },
      { id: 'gha', name: 'Ghana', flag: '🇬🇭', group: 'L' },
      { id: 'pan', name: 'Panama', flag: '🇵🇦', group: 'L' },
    ];

    for (const team of initialTeams) {
      await setDoc(doc(db, 'teams', team.id), team);
    }
    toast.success("Équipes initialisées avec succès !");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Trophy className="h-12 w-12 text-primary animate-bounce" />
          <p className="text-muted-foreground font-medium animate-pulse">Chargement du Mondial 2026...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground selection:bg-primary/20">
      <Navbar 
        onTabChange={setActiveTab} 
        activeTab={activeTab} 
        onInstall={handleInstallApp}
        canInstall={!!deferredPrompt}
        isLive={hasLiveMatches}
      />
      
      {hasLiveMatches && (
        <div className="bg-red-600/10 border-y border-red-500/20 py-2 overflow-hidden whitespace-nowrap relative">
          <div className="flex animate-marquee items-center gap-12">
            {matches.filter(m => m.status === 'Live').map(match => (
              <div key={match.id} className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500">En Direct</span>
                </span>
                <span className="text-xs font-black uppercase tracking-widest">
                  {match.homeTeamName} {match.homeScore} - {match.awayScore} {match.awayTeamName}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold">{match.venue}</span>
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {matches.filter(m => m.status === 'Live').map(match => (
              <div key={`${match.id}-dup`} className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-500">En Direct</span>
                </span>
                <span className="text-xs font-black uppercase tracking-widest">
                  {match.homeTeamName} {match.homeScore} - {match.awayScore} {match.awayTeamName}
                </span>
                <span className="text-[10px] text-zinc-500 font-bold">{match.venue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <header className="mb-24 text-center space-y-8 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[160px] rounded-full -z-10 animate-pulse-subtle" />
          
          <div className="flex flex-col items-center">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-5 py-1.5 glass rounded-full mb-8 shadow-2xl ring-1 ring-white/10"
            >
              <Trophy className="h-3.5 w-3.5 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/80">FIFA World Cup 2026™</span>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <h1 className="text-7xl md:text-[12rem] font-black tracking-tighter uppercase italic leading-[0.75] mb-2">
                United <br />
                <span className="text-primary italic text-glow-primary">2026</span>
              </h1>
              <div className="absolute -right-4 -bottom-4 md:-right-12 md:-bottom-8 hidden md:block">
                <span className="text-[10px] font-black uppercase tracking-[1em] text-white/20 rotate-90 origin-left block">Tournament</span>
              </div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="text-zinc-500 text-lg md:text-2xl mt-12 max-w-3xl mx-auto font-light leading-relaxed tracking-tight"
            >
              Experience the largest World Cup in history across <span className="text-white font-medium">16 Host Cities</span> and <span className="text-white font-medium">48 Nations</span>.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="pt-12"
          >
            <div className="flex flex-col items-center gap-4 mb-8">
              <span className="text-[9px] font-black uppercase tracking-[0.6em] text-primary animate-pulse">Official Countdown</span>
              <Countdown />
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-16">
              <Button 
                onClick={async () => {
                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: 'FIFA World Cup 2026™ United',
                        text: '⚽ Follow the 2026 World Cup live: full schedule, groups, and real-time scores!',
                        url: window.location.origin
                      });
                    } else {
                      await navigator.clipboard.writeText(window.location.origin);
                      toast.success("Link copied!");
                    }
                  } catch (error: any) {
                    if (error.name !== 'AbortError' && !error.message?.includes('cancel')) {
                      console.error("Error sharing", error);
                      toast.error("Sharing failed");
                    }
                  }
                }}
                className="h-14 rounded-2xl px-12 bg-white text-black font-black uppercase tracking-widest shadow-2xl hover:bg-primary transition-all duration-300 hover:scale-105 group"
              >
                <Share2 className="h-4 w-4 mr-3 group-hover:rotate-12 transition-transform" /> Share Experience
              </Button>
            </div>
          </motion.div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <TabsContent value="calendar" className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-6 rounded-3xl border border-white/5">
              <div className="flex flex-col gap-4 w-full md:max-w-md">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <Input 
                    placeholder="Equipe, ville ou stade..." 
                    className="pl-12 h-14 rounded-2xl bg-black/40 border-white/5 focus:border-primary/50 transition-all text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-zinc-500 ml-2" />
                  <Select value={userTimezone} onValueChange={setUserTimezone}>
                    <SelectTrigger className="h-10 bg-black/20 border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                      <SelectValue placeholder="Timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC (FIFA Standard)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (NY/NJ)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (Mexico City/Dallas)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time (LA/Vancouver)</SelectItem>
                      <SelectItem value="local">Ma Position ({Intl.DateTimeFormat().resolvedOptions().timeZone})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                {hasLiveMatches && (
                  <Button 
                    variant={filterStage === 'live' ? "destructive" : "outline"}
                    onClick={() => setFilterStage(filterStage === 'live' ? 'all' : 'live')}
                    className={`h-14 rounded-2xl px-6 font-black uppercase tracking-widest transition-all ${filterStage === 'live' ? 'bg-red-500 text-white animate-pulse' : 'bg-black/20 border-white/5 text-red-500 hover:text-red-400'}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse" />
                    Direct
                  </Button>
                )}
                <Button 
                  variant={showOnlyFavorites ? "default" : "outline"}
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className={`h-14 rounded-2xl px-6 font-black uppercase tracking-widest transition-all ${showOnlyFavorites ? 'bg-primary text-black' : 'bg-black/20 border-white/5 text-zinc-400 hover:text-white'}`}
                >
                  <Star className={`mr-2 h-4 w-4 ${showOnlyFavorites ? 'fill-black' : ''}`} />
                  Suivis
                </Button>
                <div className="w-px h-10 bg-white/5 mx-2" />
                <Select value={filterStage} onValueChange={setFilterStage}>
                  <SelectTrigger className="w-full md:w-[220px] h-14 rounded-2xl bg-black/20 border-white/5 font-black uppercase tracking-widest text-[10px]">
                    <SelectValue placeholder="Phase" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tout le tournoi</SelectItem>
                    <SelectItem value="Group">Phase de Groupes</SelectItem>
                    <SelectItem value="Round of 32">Seizièmes de finale</SelectItem>
                    <SelectItem value="Round of 16">Huitièmes de finale</SelectItem>
                    <SelectItem value="Final">Finale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map(i => <SkeletonMatch key={i} />)}
                </div>
              ) : filteredMatches.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-20 bg-muted/30 rounded-[3rem] border-2 border-dashed border-white/5"
                >
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Aucun match trouvé</p>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {filteredMatches.map((match, index) => (
                    <motion.div
                      key={match.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <MatchCard 
                        match={match} 
                        isFavorite={favorites.includes(match.id)}
                        onToggleFavorite={() => toggleFavorite(match.id)}
                        timezone={userTimezone === 'local' ? undefined : userTimezone}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="bracket">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <Bracket />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="standings">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-dark rounded-[3rem] h-[400px] animate-pulse bg-white/5" />
                  ))}
                </div>
              ) : (
                <Standings teams={teams} matches={matches} />
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="cities">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <HostCities />
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <AdminPanel matches={matches} teams={teams} />
              </motion.div>
            </TabsContent>
          )}
        </Tabs>
      </main>

      <footer className="border-t py-12 mt-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex justify-center items-center gap-6 opacity-50">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="text-sm font-bold uppercase tracking-widest">Mondial 2026</span>
            </div>
            <div className="flex items-center gap-2 border-l border-white/10 pl-6 text-primary">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Hébergé 24h/24 Google Cloud</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Application de Calendrier Coupe du Monde. Tous droits réservés.
          </p>
        </div>
      </footer>
      <Toaster position="top-center" />
    </div>
  );
};

export default function App() {
  return (
    <FirebaseProvider>
      <AppContent />
    </FirebaseProvider>
  );
}
