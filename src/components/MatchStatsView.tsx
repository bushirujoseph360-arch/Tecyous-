import React from 'react';
import { MatchStats } from '../types';

interface MatchStatsViewProps {
  stats?: MatchStats;
}

export const MatchStatsView: React.FC<MatchStatsViewProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-zinc-500 opacity-50">
        <p className="text-xs font-black uppercase tracking-widest">Statistiques bientôt disponibles</p>
      </div>
    );
  }

  const StatItem = ({ label, home, away, format = (v: number) => v.toString() }: any) => {
    const total = home + away;
    const homePercent = total > 0 ? (home / total) * 100 : 50;

    return (
      <div className="space-y-3 group/stat">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-2xl font-black italic tracking-tighter text-white transition-all duration-500 group-hover/stat:text-primary leading-none">{format(home)}</span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-1">{label}</span>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-black italic tracking-tighter text-white transition-all duration-500 group-hover/stat:text-primary leading-none">{format(away)}</span>
          </div>
        </div>
        <div className="h-1 w-full bg-white/[0.03] rounded-full overflow-hidden flex relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10 z-10" />
          <div 
            className="h-full bg-primary/80 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(163,230,53,0.3)]" 
            style={{ width: `${homePercent}%` }}
          />
          <div 
            className="h-full bg-white/10 transition-all duration-1000 ease-out" 
            style={{ width: `${100 - homePercent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 p-4">
      <StatItem 
        label="Possession" 
        home={stats.possession.home} 
        away={stats.possession.away} 
        format={(v: number) => `${v}%`} 
      />
      <StatItem 
        label="Tirs" 
        home={stats.shots.home} 
        away={stats.shots.away} 
      />
      <StatItem 
        label="Tirs Cadrés" 
        home={stats.shotsOnTarget.home} 
        away={stats.shotsOnTarget.away} 
      />
      <StatItem 
        label="Corners" 
        home={stats.corners.home} 
        away={stats.corners.away} 
      />
      <StatItem 
        label="Fautes" 
        home={stats.fouls.home} 
        away={stats.fouls.away} 
      />
    </div>
  );
};
