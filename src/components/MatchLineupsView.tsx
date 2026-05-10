import React from 'react';
import { Lineups } from '../types';
import { Users } from 'lucide-react';

interface MatchLineupsViewProps {
  lineups?: Lineups;
  homeTeamName: string;
  awayTeamName: string;
}

export const MatchLineupsView: React.FC<MatchLineupsViewProps> = ({ lineups, homeTeamName, awayTeamName }) => {
  if (!lineups) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500 opacity-50">
        <Users className="h-8 w-8 mb-4" />
        <p className="text-xs font-black uppercase tracking-widest">Compositions bientôt disponibles</p>
      </div>
    );
  }

  const TeamLineup = ({ teamName, players }: { teamName: string, players: any }) => (
    <div className="space-y-8">
      <div className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 text-center">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic">{teamName}</span>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4 px-2">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Starting XI</span>
          <div className="h-px bg-white/5 flex-1" />
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {players.starting.map((player: any) => (
            <div key={player.number} className="flex justify-between items-center glass-card p-3 rounded-2xl border border-white/5 group/player">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 flex items-center justify-center bg-white/5 group-hover/player:bg-primary/20 group-hover/player:text-primary rounded-xl text-[10px] font-black transition-all">
                  {player.number}
                </span>
                <span className="text-xs font-black uppercase tracking-tight group-hover/player:text-white transition-colors">{player.name}</span>
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 bg-white/[0.02] px-3 py-1 rounded-full border border-white/5 group-hover/player:border-primary/30 transition-all">
                {player.position}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-4 px-2">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">Substitutes</span>
          <div className="h-px bg-white/5 flex-1" />
        </div>
        <div className="grid grid-cols-1 gap-1.5">
          {players.bench.map((player: any) => (
            <div key={player.number} className="flex justify-between items-center px-4 py-2 hover:bg-white/[0.02] rounded-xl transition-colors opacity-50 hover:opacity-100 group/bench">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 flex items-center justify-center border border-white/10 rounded-lg text-[9px] font-black text-zinc-600">
                  {player.number}
                </span>
                <span className="text-[11px] font-bold text-zinc-400 group-hover/bench:text-zinc-200 transition-colors">{player.name}</span>
              </div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-700">
                {player.position}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-2">
      <TeamLineup teamName={homeTeamName} players={lineups.home} />
      <TeamLineup teamName={awayTeamName} players={lineups.away} />
    </div>
  );
};
