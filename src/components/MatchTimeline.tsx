import React from 'react';
import { MatchEvent } from '../types';
import { Trophy, Clock, AlertTriangle, Repeat } from 'lucide-react';

interface MatchTimelineProps {
  events: MatchEvent[];
  homeTeamId: string;
  awayTeamId: string;
}

export const MatchTimeline: React.FC<MatchTimelineProps> = ({ events, homeTeamId, awayTeamId }) => {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500 opacity-50">
        <Clock className="h-8 w-8 mb-4" />
        <p className="text-xs font-black uppercase tracking-widest">Aucun événement pour le moment</p>
      </div>
    );
  }

  const sortedEvents = [...events].sort((a, b) => b.minute - a.minute);

  return (
    <div className="space-y-4 relative py-4">
      <div className="absolute left-[50%] top-0 bottom-0 w-px bg-white/[0.05] hidden md:block" />
      {sortedEvents.map((event) => {
        const isHome = event.teamId === homeTeamId;
        
        return (
          <div key={event.id} className={`flex items-center gap-6 ${isHome ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row group/event`}>
            <div className={`flex-1 hidden md:flex ${isHome ? 'justify-end text-right' : 'justify-start text-left'} flex-col`}>
              {isHome && (
                <div className="space-y-0.5 transform group-hover/event:translate-x-[-4px] transition-transform duration-300">
                  <span className="text-sm font-black text-white italic">{event.player}</span>
                  <div className="flex items-center gap-2 justify-end">
                    {event.assist && <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Assist: {event.assist}</span>}
                    {event.playerOut && <span className="text-[9px] font-black uppercase tracking-widest text-red-500/50">Out: {event.playerOut}</span>}
                  </div>
                </div>
              )}
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-12 h-12 rounded-[1.25rem] flex items-center justify-center glass border border-white/10 transition-all duration-500 group-hover/event:scale-110 group-hover/event:border-primary/50 ${event.type === 'goal' ? 'bg-primary/20 text-primary shadow-[0_0_20px_rgba(163,230,53,0.2)]' : 'bg-white/5 text-white'}`}>
                {event.type === 'goal' && <Trophy className="h-5 w-5" />}
                {event.type === 'yellow_card' && <div className="w-3.5 h-5 bg-yellow-400 rounded-sm shadow-[0_0_15px_rgba(250,204,21,0.3)]" />}
                {event.type === 'red_card' && <div className="w-3.5 h-5 bg-red-600 rounded-sm shadow-[0_0_15px_rgba(220,38,38,0.3)]" />}
                {event.type === 'substitution' && <Repeat className="h-5 w-5 text-green-400" />}
              </div>
              <div className="absolute -bottom-6 flex flex-col items-center">
                <span className="text-[10px] font-black text-primary text-glow-primary">{event.minute}'</span>
              </div>
            </div>

            <div className={`flex-1 flex ${!isHome ? 'md:justify-end md:text-right' : 'justify-start text-left'} flex-col py-6`}>
              {!isHome && (
                <div className="space-y-0.5 transform group-hover/event:translate-x-[4px] transition-transform duration-300">
                  <span className="text-sm font-black text-white italic">{event.player}</span>
                  <div className="flex items-center gap-2 md:justify-end">
                    {event.assist && <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Assist: {event.assist}</span>}
                    {event.playerOut && <span className="text-[9px] font-black uppercase tracking-widest text-red-500/50">Out: {event.playerOut}</span>}
                  </div>
                </div>
              )}
              {isHome && (
                <div className="md:hidden space-y-0.5">
                  <span className="text-sm font-black text-white italic">{event.player}</span>
                  <div className="flex items-center gap-2">
                    {event.assist && <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">Assist: {event.assist}</span>}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
