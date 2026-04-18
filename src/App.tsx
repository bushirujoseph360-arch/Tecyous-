import React, { useEffect, useState } from 'react';
import { db, collection, onSnapshot, query, orderBy, setDoc, doc } from './firebase';
import { Match, Team } from './types';
import { FirebaseProvider, useAuth } from './components/FirebaseProvider';
import { Navbar } from './components/Navbar';
import { MatchCard } from './components/MatchCard';
import { AdminPanel } from './components/AdminPanel';
import { GroupsList } from './components/GroupsList';
import { Standings } from './components/Standings';
import { Countdown } from './components/Countdown';
import { SkeletonMatch, SkeletonGroup } from './components/Skeletons';
import { InstallBanner } from './components/InstallBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Toaster, toast } from 'sonner';
import { Trophy, Calendar as CalendarIcon, Settings, Database, Users, Search, Filter, BarChart3, Download, Info, Share2, Smartphone } from 'lucide-react';
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
    
    const matchesStage = filterStage === 'all' || match.stage === filterStage;
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

      <InstallBanner onInstall={handleInstallApp} canInstall={!!deferredPrompt} />
      
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
        <header className="mb-24 text-center space-y-10 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full -z-10 animate-pulse" />
          
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center px-6 py-2 glass rounded-full mb-4 shadow-2xl ring-1 ring-white/10"
            >
              <Trophy className="h-4 w-4 text-primary mr-3 animate-bounce" />
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">FIFA World Cup 2026™ United</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
              className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85]"
            >
              United <br />
              <span className="text-primary drop-shadow-[0_0_30px_rgba(163,230,53,0.3)]">2026</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-zinc-400 text-xl max-w-2xl mx-auto font-medium leading-relaxed"
            >
              Le calendrier officiel et les groupes de la plus grande Coupe du Monde de l'histoire.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-10"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 mb-8 opacity-60">Coup d'envoi dans</p>
            <Countdown />
          </motion.div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
          <TabsContent value="calendar" className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-2xl">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input 
                  placeholder="Rechercher une équipe ou un stade..." 
                  className="pl-10 bg-black/20 border-white/5 focus:border-primary/50 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button 
                  variant={showOnlyFavorites ? "default" : "outline"}
                  onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  className={`h-14 rounded-2xl px-6 font-black uppercase tracking-widest transition-all ${showOnlyFavorites ? 'bg-primary text-black' : 'bg-black/20 border-white/5 text-zinc-400 hover:text-white'}`}
                >
                  <Trophy className={`mr-2 h-4 w-4 ${showOnlyFavorites ? 'fill-black' : ''}`} />
                  Favoris
                </Button>
                <Filter className="h-4 w-4 text-zinc-500 ml-2" />
                <Select value={filterStage} onValueChange={setFilterStage}>
                  <SelectTrigger className="w-full md:w-[200px] bg-black/20 border-white/5">
                    <SelectValue placeholder="Toutes les phases" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les phases</SelectItem>
                    {STAGES.map(stage => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
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
                  className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed"
                >
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">Aucun match ne correspond à votre recherche.</p>
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
                      />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="groups">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3, 4, 5, 6].map(i => <SkeletonGroup key={i} />)}
                </div>
              ) : (
                <GroupsList teams={teams} isAdmin={isAdmin} onSeedTeams={seedTeams} />
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="standings">
            <AnimatePresence mode="wait">
              {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-dark rounded-[2rem] h-[300px] animate-pulse bg-white/5" />
                  ))}
                </div>
              ) : teams.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed"
                >
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground">Les classements seront disponibles une fois les équipes initialisées.</p>
                </motion.div>
              ) : (
                <Standings teams={teams} matches={matches} />
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="download">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="glass-dark rounded-[3rem] p-12 border border-white/5 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="bg-primary/20 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                        Expérience Mobile
                      </div>
                      <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">
                        FIFA World Cup <br />
                        <span className="text-primary italic">2026™ United</span>
                      </h2>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        Installez l'application sur votre téléphone pour un accès ultra-rapide, des notifications en temps réel et une expérience plein écran.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { title: 'Accès Instantané', desc: 'Lancez l\'app depuis votre écran d\'accueil.' },
                        { title: 'Mode Plein Écran', desc: 'Profitez d\'une interface immersive sans barres de navigation.' },
                        { title: 'Performance', desc: 'Chargement plus rapide et navigation plus fluide.' }
                      ].map((feat, i) => (
                        <div key={i} className="flex gap-4 items-start">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                            <Trophy className="h-3 w-3" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-widest text-white">{feat.title}</h4>
                            <p className="text-[11px] text-zinc-500">{feat.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                          <Smartphone className="h-5 w-5" />
                          <span className="text-xs font-black uppercase tracking-widest">Version Android (APK)</span>
                        </div>
                        
                        <div className="space-y-4">
                          <p className="text-[11px] text-zinc-400 leading-relaxed">
                            Vous souhaitez une véritable application Android (.apk) ? Utilisez l'outil gratuit <span className="text-white font-bold">PWABuilder</span> pour convertir cette plateforme en application native en 2 minutes.
                          </p>
                          
                          <div className="flex flex-col gap-3">
                            <Button 
                              onClick={() => window.open(`https://www.pwabuilder.com/?url=${encodeURIComponent(window.location.origin)}`, '_blank')}
                              className="w-full h-12 bg-white/10 hover:bg-white/20 text-white font-black uppercase tracking-widest rounded-xl border border-white/10 transition-all"
                            >
                              Générer mon APK
                            </Button>
                            <p className="text-[9px] text-zinc-600 text-center italic">
                              Note : Copiez l'URL de cette page avant de cliquer.
                            </p>
                          </div>
                        </div>
                      </div>

                      {deferredPrompt ? (
                        <Button 
                          onClick={handleInstallApp}
                          className="w-full h-14 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
                        >
                          <Download className="mr-3 h-5 w-5" /> Installer l'App (PWA)
                        </Button>
                      ) : (
                        <div className="space-y-6">
                          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                              <Info className="h-5 w-5" />
                              <span className="text-xs font-black uppercase tracking-widest">Installation Rapide</span>
                            </div>
                            <div className="space-y-4">
                              {/iPad|iPhone|iPod/.test(navigator.userAgent) ? (
                                <div className="space-y-3">
                                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    Sur <span className="text-white font-bold">iOS (Safari)</span> :
                                  </p>
                                  <ol className="text-[11px] text-zinc-500 space-y-2 list-decimal ml-4">
                                    <li>Appuyez sur le bouton <span className="text-primary font-bold inline-flex items-center gap-1"><Share2 className="h-3 w-3" /> Partager</span>.</li>
                                    <li>Sélectionnez <span className="text-white font-bold">"Sur l'écran d'accueil"</span>.</li>
                                  </ol>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    Sur <span className="text-white font-bold">Android</span> :
                                  </p>
                                  <ol className="text-[11px] text-zinc-500 space-y-2 list-decimal ml-4">
                                    <li>Appuyez sur les <span className="text-white font-bold">3 points</span> (Chrome).</li>
                                    <li>Sélectionnez <span className="text-white font-bold">"Installer l'application"</span>.</li>
                                  </ol>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full opacity-50" />
                    <div className="relative glass border border-white/10 rounded-[2.5rem] p-4 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700">
                      <img 
                        src="https://picsum.photos/seed/mobileapp/800/1600" 
                        alt="App Preview" 
                        className="rounded-[1.5rem] w-full aspect-[9/19] object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
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
            {deferredPrompt && (
              <button 
                onClick={handleInstallApp}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm font-bold uppercase tracking-widest">Installer l'App</span>
              </button>
            )}
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
