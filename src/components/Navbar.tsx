import React from 'react';
import { motion } from 'motion/react';
import { auth, googleProvider, signInWithPopup, signOut } from '../firebase';
import { useAuth } from './FirebaseProvider';
import { Button } from './ui/button';
import { Trophy, LogIn, LogOut, User, ShieldCheck, Menu, Calendar, Users, BarChart3, Settings, Download, Share2, Wifi, WifiOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { toast } from 'sonner';

interface NavbarProps {
  onTabChange?: (tab: string) => void;
  activeTab?: string;
  onInstall?: () => void;
  canInstall?: boolean;
  isLive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onTabChange, activeTab, onInstall, canInstall, isLive }) => {
  const { user, isAdmin } = useAuth();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Connexion rétablie. Mode en ligne activé.");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Vous êtes déconnecté. Passage en mode hors-ligne.");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'FIFA World Cup 2026™ United',
      text: '⚽ Suivez le Mondial 2026 en direct : calendrier complet, groupes et scores en temps réel. Fonctionne même hors-ligne !',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        toast.success("Lien copié dans le presse-papier !");
      }
    } catch (error: any) {
      if (error.name !== 'AbortError' && !error.message?.includes('cancel')) {
        console.error("Error sharing", error);
        toast.error("Erreur lors du partage");
      }
    }
  };

  const navItems = [
    { id: 'calendar', label: 'Calendrier', icon: Calendar },
    { id: 'bracket', label: 'Bracket', icon: Trophy },
    { id: 'standings', label: 'Classement', icon: BarChart3 },
    { id: 'cities', label: 'Villes Hôtes', icon: User },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin', icon: Settings }] : []),
  ];

  return (
    <nav className="border-b border-white/[0.08] glass sticky top-0 z-50 shadow-2xl backdrop-blur-3xl">
      <div className="container mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="bg-primary p-2.5 rounded-2xl shadow-2xl shadow-primary/30 relative transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
              <Trophy className="h-6 w-6 text-black" />
              {isLive && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-600 rounded-full border-2 border-black animate-pulse shadow-[0_0_15px_rgba(220,38,38,0.6)]" />
              )}
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-2xl tracking-tighter uppercase italic group-hover:text-primary transition-colors duration-500">United 2026</span>
              <div className="flex items-center gap-2.5 mt-1">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">FIFA World Cup™</span>
                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/5 bg-white/5 transition-all duration-500 ${isOnline ? 'text-green-500/50' : 'text-amber-500 bg-amber-500/10'}`}>
                  {isOnline ? <Wifi className="h-2.5 w-2.5" /> : <WifiOff className="h-2.5 w-2.5" />}
                  <span className="text-[7px] font-black uppercase tracking-tight">
                    {isOnline ? 'Global Ready' : 'Offline Access'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onTabChange?.(item.id)}
                className={`text-[10px] font-black uppercase tracking-[0.2em] px-5 h-12 rounded-xl transition-all duration-500 relative group/nav ${
                  activeTab === item.id ? 'text-primary' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {activeTab === item.id && (
                  <motion.div
                    layoutId="navPill"
                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 z-0"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center">
                  <item.icon className={`mr-2.5 h-3.5 w-3.5 transition-transform group-hover/nav:scale-110 ${activeTab === item.id ? 'text-primary' : ''}`} />
                  {item.label}
                  {item.id === 'calendar' && isLive && (
                    <span className="absolute -top-1 -right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-black shadow-lg" />
                  )}
                </span>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="hidden md:flex text-[10px] font-black uppercase tracking-[0.2em] px-5 h-12 rounded-xl text-zinc-500 hover:text-primary transition-all group"
          >
            <Share2 className="mr-2.5 h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
            Partager
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="md:hidden h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
              <Menu className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass border-white/10">
              <div className="p-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Menu</div>
              {navItems.map((item) => (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => onTabChange?.(item.id)}
                  className={`flex items-center gap-3 py-3 px-4 cursor-pointer relative ${
                    activeTab === item.id ? 'text-primary bg-white/5' : ''
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="font-bold text-sm">{item.label}</span>
                  {item.id === 'calendar' && isLive && (
                    <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </DropdownMenuItem>
              ))}
              {canInstall && (
                <DropdownMenuItem
                  onClick={onInstall}
                  className="flex items-center gap-3 py-3 px-4 cursor-pointer text-primary"
                >
                  <Download className="h-4 w-4" />
                  <span className="font-bold text-sm">Installer l'App</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={handleShare}
                className="flex items-center gap-3 py-3 px-4 cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span className="font-bold text-sm">Partager l'App</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5" />
              {!user && (
                <DropdownMenuItem onClick={handleLogin} className="flex items-center gap-3 py-3 px-4 cursor-pointer">
                  <LogIn className="h-4 w-4" />
                  <span className="font-bold text-sm">Se connecter</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-10 w-10 rounded-full overflow-hidden hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring border border-transparent">
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass border-white/10">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.displayName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuItem className="cursor-default">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                  {isAdmin && <ShieldCheck className="ml-auto h-4 w-4 text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleLogin} variant="default" size="sm" className="hidden md:flex bg-primary text-black font-black uppercase tracking-widest">
              <LogIn className="mr-2 h-4 w-4" />
              Se connecter
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};
