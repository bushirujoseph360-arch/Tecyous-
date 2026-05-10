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

const exportToCalendar = (match: Match) => {
  const date = new Date(match.date);
  const endDate = new Date(date.getTime() + 105 * 60000); // 105 mins approx
  
  const formatDateICS = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${formatDateICS(date)}`,
    `DTEND:${formatDateICS(endDate)}`,
    `SUMMARY:⚽ ${match.homeTeamName} vs ${match.awayTeamName} - FIFA World Cup 2026™`,
    `DESCRIPTION:Suivez le match en direct sur United 2026. Stage: ${match.stage}`,
    `LOCATION:${match.venue}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute('download', `match-${match.id}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  toast.success("Match ajouté à votre calendrier !");
};

import { MatchTimeline } from './MatchTimeline';
import { MatchStatsView } from './MatchStatsView';
import { MatchLineupsView } from './MatchLineupsView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface MatchCardProps {
  match: Match;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  timezone?: string;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, isFavorite, onToggleFavorite, timezone }) => {
  const isFinished = match.status === 'Finished';
  const isLive = match.status === 'Live';

  const formatMatchTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (!timezone || timezone === 'local') {
      return format(date, 'HH:mm');
    }
    return new Intl.DateTimeFormat('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone === 'UTC' ? 'UTC' : timezone,
      hour12: false
    }).format(date);
  };

  const formatMatchDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (!timezone || timezone === 'local') {
      return format(date, 'PPP', { locale: fr });
    }
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: timezone === 'UTC' ? 'UTC' : timezone
    }).format(date);
  };

  // Sample data for demo if not present in match object
  const hasDetails = !!(match.events || match.stats || match.lineups);
  
  const handleShareMatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = (isFinished || isLive) ? `\n Score: ${match.homeScore} - ${match.awayScore}` : '';
    const statusText = isLive ? '🔴 EN DIRECT' : isFinished ? '✅ TERMINÉ' : '🕒 À VENIR';
    
    const text = `🏆 FIFA WORLD CUP 2026™\n--------------------------\n${statusText}\n⚽ ${match.homeTeamName} vs ${match.awayTeamName}${result}\n📅 ${format(new Date(match.date), 'PPP p', { locale: fr })}\n📍 ${match.venue}\n\n📲 Suivez tous les scores sur United 2026 :`;
    const url = window.location.origin;

    if (navigator.share) {
      navigator.share({
        title: `Match: ${match.homeTeamName} vs ${match.awayTeamName}`,
        text: text,
        url: url
      }).catch((error) => {
        if (error.name !== 'AbortError' && !error.message?.includes('cancel')) {
          console.error("Error sharing", error);
        }
      });
    } else {
      navigator.clipboard.writeText(`${text}\n${url}`);
      toast.success("Annonce de match copiée dans le presse-papier !");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="overflow-hidden border-none glass-card group relative cursor-pointer rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700" />
          
          <CardContent className="p-0 relative z-10">
            <div className="bg-white/[0.02] px-6 py-4 flex justify-between items-center border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-white/20'}`} />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                  {isLive ? 'Live Match' : isFinished ? 'Final Result' : 'Upcoming'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleShareMatch}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite?.();
                  }}
                  className={`transition-all duration-300 hover:scale-125 ${isFavorite ? 'text-primary fill-primary' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            
            <div className="p-8 space-y-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 flex flex-col items-center gap-4 group/team">
                  <div className="w-20 h-20 glass rounded-[2.5rem] flex items-center justify-center text-3xl font-black shadow-2xl border border-white/10 group-hover:border-primary/50 transition-all duration-500 group-hover:rotate-[-8deg] group-hover:scale-110 bg-gradient-to-br from-white/10 to-transparent">
                    {match.homeTeamName.substring(0, 3).toUpperCase()}
                  </div>
                  <span className="font-black text-[10px] uppercase tracking-[0.25em] text-zinc-400 group-hover:text-white transition-colors text-center">{match.homeTeamName}</span>
                </div>

                <div className="flex flex-col items-center gap-4 px-2">
                  {isFinished || isLive ? (
                    <div className="text-6xl font-black tracking-tighter flex items-center gap-3 italic">
                      <span className={isLive ? 'text-primary text-glow-primary' : 'text-white'}>{match.homeScore ?? 0}</span>
                      <span className="text-white/10">:</span>
                      <span className={isLive ? 'text-primary text-glow-primary' : 'text-white'}>{match.awayScore ?? 0}</span>
                    </div>
                  ) : (
                    <div className="text-[10px] font-black text-primary/30 bg-white/[0.02] px-6 py-2 rounded-full border border-white/5 tracking-[0.4em] italic mb-2">
                      VS
                    </div>
                  )}
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">{formatMatchTime(match.date)}</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center gap-4 group/team">
                  <div className="w-20 h-20 glass rounded-[2.5rem] flex items-center justify-center text-3xl font-black shadow-2xl border border-white/10 group-hover:border-primary/50 transition-all duration-500 group-hover:rotate-[8deg] group-hover:scale-110 bg-gradient-to-br from-white/10 to-transparent">
                    {match.awayTeamName.substring(0, 3).toUpperCase()}
                  </div>
                  <span className="font-black text-[10px] uppercase tracking-[0.25em] text-zinc-400 group-hover:text-white transition-colors text-center">{match.awayTeamName}</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-3 pt-4 border-t border-white/[0.03]">
                <div className="flex items-center gap-2 text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                  <MapPin className="h-3 w-3 text-primary/60" />
                  {match.venue}
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">{match.stage}</span>
                  {match.group && <span className="w-1 h-1 rounded-full bg-white/10" />}
                  {match.group && <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Group {match.group}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>

      <DialogContent className="glass-dark border-white/10 p-0 overflow-hidden sm:rounded-[3rem] max-w-2xl max-h-[90vh] flex flex-col">
        <div className="relative h-48 shrink-0 bg-gradient-to-br from-primary/30 via-primary/5 to-transparent flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://picsum.photos/seed/stadium-details/1200/400')] bg-cover bg-center grayscale" />
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="bg-primary/20 text-primary px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">
              {match.stage}
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Informations Match</h2>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="p-8 pb-4 shrink-0">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl border border-white/10">
                  {match.homeTeamName.substring(0, 3).toUpperCase()}
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest text-center">{match.homeTeamName}</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="text-5xl font-black tracking-tighter italic flex items-center gap-4">
                  <span>{match.homeScore ?? 0}</span>
                  <span className="text-zinc-800 opacity-30 italic">-</span>
                  <span>{match.awayScore ?? 0}</span>
                </div>
                <Badge variant={isLive ? "destructive" : isFinished ? "secondary" : "outline"} className={`text-[9px] h-5 font-black px-3 rounded-full ${isLive ? 'animate-pulse' : ''}`}>
                  {isLive ? 'En Direct' : isFinished ? 'Match Terminé' : 'Match à Venir'}
                </Badge>
              </div>

              <div className="flex-1 flex flex-col items-center gap-3">
                <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl border border-white/10">
                  {match.awayTeamName.substring(0, 3).toUpperCase()}
                </div>
                <span className="font-black text-[10px] uppercase tracking-widest text-center">{match.awayTeamName}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="w-full grid grid-cols-4 bg-white/5 border border-white/5 p-1 rounded-2xl h-12 mb-8">
                <TabsTrigger value="info" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">Infos</TabsTrigger>
                <TabsTrigger value="timeline" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">Direct</TabsTrigger>
                <TabsTrigger value="stats" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">Stats</TabsTrigger>
                <TabsTrigger value="lineups" className="rounded-xl text-[9px] font-black uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-black">Compo</TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Informations</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500 uppercase font-bold">Date</span>
                        <span className="font-bold">{formatMatchDate(match.date)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500 uppercase font-bold">Heure</span>
                        <span className="font-bold">{formatMatchTime(match.date)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-zinc-500 uppercase font-bold">Phase</span>
                        <span className="font-bold">{match.stage}</span>
                      </div>
                    </div>
                  </div>

                  <div className="glass p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3 text-primary">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Stade</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase leading-tight">{match.venue}</p>
                      <p className="text-[9px] text-zinc-500">Mondial 2026 - États-Unis / Canada / Mexique</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex gap-4">
                    <Button 
                      onClick={onToggleFavorite}
                      className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isFavorite ? 'bg-primary text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
                    >
                      <Star className={`mr-2 h-4 w-4 ${isFavorite ? 'fill-black' : ''}`} />
                      {isFavorite ? 'Favori' : 'Suivre'}
                    </Button>
                    <Button 
                      onClick={handleShareMatch}
                      variant="outline"
                      className="h-12 px-6 rounded-xl border-white/5 bg-white/5 hover:bg-white/10"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => exportToCalendar(match)}
                    className="w-full h-12 rounded-xl border-white/5 bg-white/5 hover:bg-primary/10 hover:text-primary text-[9px] font-black uppercase tracking-widest"
                  >
                    <Calendar className="mr-3 h-4 w-4" />
                    Ajouter à mon Agenda
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="mt-0">
                <MatchTimeline 
                  events={match.events || []} 
                  homeTeamId={match.homeTeamId} 
                  awayTeamId={match.awayTeamId} 
                />
              </TabsContent>

              <TabsContent value="stats" className="mt-0">
                <MatchStatsView stats={match.stats} />
              </TabsContent>

              <TabsContent value="lineups" className="mt-0">
                <MatchLineupsView 
                  lineups={match.lineups} 
                  homeTeamName={match.homeTeamName} 
                  awayTeamName={match.awayTeamName} 
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
