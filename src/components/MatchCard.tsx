import React from 'react';
import { Match } from '../types';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Star, Share2, Info, Trophy, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from './ui/button';
import { toast } from 'sonner';

interface MatchCardProps {
  match: Match;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, isFavorite, onToggleFavorite }) => {
  const isFinished = match.status === 'Finished';
  const isLive = match.status === 'Live';

  const handleShareMatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `🏆 Mondial 2026 : ${match.homeTeamName} vs ${match.awayTeamName}\n📅 ${format(new Date(match.date), 'PPP p', { locale: fr })}\n📍 ${match.venue}\n\nSuivez le match ici : ${window.location.href}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Mondial 2026',
        text: text,
        url: window.location.href
      }).catch((error) => {
        if (error.name !== 'AbortError') {
          console.error("Error sharing", error);
        }
      });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Détails du match copiés !");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden border-none glass shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.04] group relative cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <CardContent className="p-0 relative z-10">
            <div className="bg-white/[0.03] p-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-primary/50'}`} />
                <Calendar className="h-3.5 w-3.5 text-primary/70" />
                {format(new Date(match.date), 'PPP p', { locale: fr })}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleShareMatch}
                  className="text-zinc-600 hover:text-white transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.();
                  }}
                  className={`transition-all duration-300 hover:scale-125 ${isFavorite ? 'text-primary fill-primary' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  <Star className="h-4 w-4" />
                </button>
                <Badge variant={isLive ? "destructive" : isFinished ? "secondary" : "outline"} className={`text-[9px] h-5 font-black px-3 rounded-full border-white/10 ${isLive ? 'animate-pulse bg-red-500/20 text-red-400 border-red-500/30' : ''}`}>
                  {isLive ? 'EN DIRECT' : isFinished ? 'TERMINÉ' : 'À VENIR'}
                </Badge>
              </div>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 flex flex-col items-center text-center gap-4">
                  <div className="w-20 h-20 glass rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-2xl border border-white/10 group-hover:border-primary/40 transition-all duration-500 group-hover:rotate-[-5deg] group-hover:scale-110 bg-gradient-to-br from-white/5 to-transparent">
                    {match.homeTeamName.substring(0, 3).toUpperCase()}
                  </div>
                  <span className="font-black text-xs uppercase tracking-[0.15em] text-zinc-300 group-hover:text-white transition-colors">{match.homeTeamName}</span>
                </div>

                <div className="flex flex-col items-center gap-4">
                  {isFinished || isLive ? (
                    <div className="text-5xl font-black tracking-tighter flex items-center gap-5 italic">
                      <span className={isLive ? 'text-primary drop-shadow-[0_0_15px_rgba(163,230,53,0.4)]' : 'text-white'}>{match.homeScore ?? 0}</span>
                      <span className="text-zinc-800 opacity-30">:</span>
                      <span className={isLive ? 'text-primary drop-shadow-[0_0_15px_rgba(163,230,53,0.4)]' : 'text-white'}>{match.awayScore ?? 0}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] font-black text-primary/40 bg-white/[0.03] px-5 py-2 rounded-full border border-white/5 tracking-[0.3em] italic">
                      VS
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase font-black tracking-[0.3em] text-primary/70">
                      {match.stage}
                    </span>
                    {match.group && (
                      <span className="text-[9px] uppercase font-bold text-zinc-600 tracking-widest">
                        Poule {match.group}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center text-center gap-4">
                  <div className="w-20 h-20 glass rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-2xl border border-white/10 group-hover:border-primary/40 transition-all duration-500 group-hover:rotate-[5deg] group-hover:scale-110 bg-gradient-to-br from-white/5 to-transparent">
                    {match.awayTeamName.substring(0, 3).toUpperCase()}
                  </div>
                  <span className="font-black text-xs uppercase tracking-[0.15em] text-zinc-300 group-hover:text-white transition-colors">{match.awayTeamName}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 text-[10px] font-black text-zinc-500 bg-black/40 py-3 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all">
                <MapPin className="h-3.5 w-3.5 text-primary/60" />
                <span className="uppercase tracking-[0.2em]">{match.venue}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="glass-dark border-white/10 rounded-[2.5rem] max-w-2xl p-0 overflow-hidden">
        <div className="relative h-48 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/seed/stadium/1200/400')] bg-cover bg-center grayscale" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className="bg-primary/20 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
              {match.stage}
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter italic">Détails du Match</h2>
          </div>
        </div>

        <div className="p-10 space-y-10">
          <div className="flex items-center justify-between gap-8">
            <div className="flex-1 flex flex-col items-center gap-4">
              <div className="w-24 h-24 glass rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl border border-white/10">
                {match.homeTeamName.substring(0, 3).toUpperCase()}
              </div>
              <span className="font-black text-sm uppercase tracking-widest">{match.homeTeamName}</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="text-6xl font-black tracking-tighter italic flex items-center gap-6">
                <span>{match.homeScore ?? 0}</span>
                <span className="text-zinc-800 opacity-30">-</span>
                <span>{match.awayScore ?? 0}</span>
              </div>
              <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isLive ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-white/5 text-zinc-500'}`}>
                {isLive ? 'En Direct' : isFinished ? 'Terminé' : 'À venir'}
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-4">
              <div className="w-24 h-24 glass rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl border border-white/10">
                {match.awayTeamName.substring(0, 3).toUpperCase()}
              </div>
              <span className="font-black text-sm uppercase tracking-widest">{match.awayTeamName}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <Clock className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Informations</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Date</span>
                  <span className="text-xs font-bold">{format(new Date(match.date), 'PPP', { locale: fr })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Heure</span>
                  <span className="text-xs font-bold">{format(new Date(match.date), 'p', { locale: fr })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Phase</span>
                  <span className="text-xs font-bold">{match.stage}</span>
                </div>
              </div>
            </div>

            <div className="glass p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-3 text-primary">
                <MapPin className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Lieu</span>
              </div>
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-black uppercase tracking-tight">{match.venue}</span>
                  <span className="text-[10px] text-zinc-500 font-medium">États-Unis / Canada / Mexique</span>
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-white/5 bg-white/5 hover:bg-white/10">
                    Voir sur la carte
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={onToggleFavorite}
              className={`flex-1 h-14 rounded-2xl font-black uppercase tracking-widest transition-all ${isFavorite ? 'bg-primary text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
            >
              <Star className={`mr-3 h-5 w-5 ${isFavorite ? 'fill-black' : ''}`} />
              {isFavorite ? 'Favori' : 'Ajouter aux favoris'}
            </Button>
            <Button 
              onClick={handleShareMatch}
              variant="outline"
              className="h-14 px-8 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
