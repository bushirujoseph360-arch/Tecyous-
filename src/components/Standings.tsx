import React from 'react';
import { Team, Match } from '../types';
import { Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { GROUPS } from '../constants';
import { motion } from 'motion/react';

interface StandingsProps {
  teams: Team[];
  matches: Match[];
}

interface TeamStats {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

export const Standings: React.FC<StandingsProps> = ({ teams, matches }) => {
  const calculateStandings = (group: string): TeamStats[] => {
    const groupTeams = teams.filter(t => t.group === group);
    const groupMatches = matches.filter(m => m.group === group && (m.status === 'Finished' || m.status === 'Live'));

    const stats: Record<string, TeamStats> = groupTeams.reduce((acc, team) => {
      acc[team.id] = {
        team,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        pts: 0
      };
      return acc;
    }, {} as Record<string, TeamStats>);

    groupMatches.forEach(match => {
      const home = stats[match.homeTeamId];
      const away = stats[match.awayTeamId];

      if (home && away) {
        home.played++;
        away.played++;
        home.gf += match.homeScore || 0;
        home.ga += match.awayScore || 0;
        away.gf += match.awayScore || 0;
        away.ga += match.homeScore || 0;

        if ((match.homeScore || 0) > (match.awayScore || 0)) {
          home.won++;
          home.pts += 3;
          away.lost++;
        } else if ((match.homeScore || 0) < (match.awayScore || 0)) {
          away.won++;
          away.pts += 3;
          home.lost++;
        } else {
          home.drawn++;
          away.drawn++;
          home.pts += 1;
          away.pts += 1;
        }
      }
    });

    return Object.values(stats)
      .map(s => ({ ...s, gd: s.gf - s.ga }))
      .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  };

  const allThirdPlaced = GROUPS.map(group => {
    const standings = calculateStandings(group);
    return standings[2]; // 3rd team
  }).filter(Boolean);

  const bestThirds = allThirdPlaced.sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf).slice(0, 8);

  return (
    <div className="space-y-24 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {GROUPS.map((group, index) => {
          const standings = calculateStandings(group);
          if (standings.length === 0) return null;

          return (
            <motion.div
              key={group}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.6 }}
              className="group"
            >
              <Card className="border-none glass-dark overflow-hidden rounded-[2.5rem] shadow-2xl transition-all duration-500 group-hover:translate-y-[-4px] group-hover:bg-white/[0.03]">
                <CardHeader className="bg-white/[0.04] py-8 px-10 border-b border-white/5">
                  <CardTitle className="text-xl font-black uppercase tracking-[0.2em] flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary text-2xl italic font-black shadow-inner">
                        {group}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-zinc-200 tracking-tighter uppercase italic">Groupe {group}</span>
                        <span className="text-[8px] text-zinc-500 font-bold tracking-[0.4em] uppercase">Classement Officiel</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end opacity-40">
                      <Trophy className="h-5 w-5 text-zinc-500" />
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-white/[0.02]">
                      <TableRow className="hover:bg-transparent border-white/5 h-14">
                        <TableHead className="w-16 text-center text-[9px] uppercase font-black tracking-[0.2em] text-zinc-500">Pos</TableHead>
                        <TableHead className="text-[9px] uppercase font-black tracking-[0.2em] text-zinc-500 italic">Nation</TableHead>
                        <TableHead className="text-center text-[9px] uppercase font-black tracking-[0.2em] text-zinc-500">PL</TableHead>
                        <TableHead className="text-center text-[9px] uppercase font-black tracking-[0.2em] text-zinc-500">GD</TableHead>
                        <TableHead className="text-center text-[9px] uppercase font-black tracking-[0.2em] text-primary">PTS</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {standings.map((stat, i) => {
                        const isDirectlyQualified = i < 2;
                        const isBestThird = i === 2 && bestThirds.some(bt => bt.team.id === stat.team.id);
                        const isQualified = isDirectlyQualified || isBestThird;

                        return (
                          <TableRow key={stat.team.id} className={`border-white/[0.03] hover:bg-white/[0.04] transition-all duration-300 group/row ${isQualified ? 'bg-primary/[0.01]' : ''}`}>
                            <TableCell className="text-center py-6">
                              <div className={`w-8 h-8 mx-auto rounded-xl flex items-center justify-center text-[10px] font-black transition-all duration-500 ${isQualified ? 'bg-primary text-black shadow-[0_0_20px_rgba(163,230,53,0.3)] scale-110' : 'bg-white/5 text-zinc-600'}`}>
                                {String(i + 1).padStart(2, '0')}
                              </div>
                            </TableCell>
                            <TableCell className="py-6">
                              <div className="flex items-center gap-5">
                                <span className="text-3xl grayscale group-hover/row:grayscale-0 transition-all duration-500 transform group-hover/row:scale-125">
                                  {stat.team.flag}
                                </span>
                                <div className="flex flex-col">
                                  <span className="font-black text-sm uppercase tracking-tight text-zinc-200 group-hover/row:text-primary transition-colors italic">
                                    {stat.team.name}
                                  </span>
                                  {isQualified && (
                                    <span className="text-[7px] font-black text-primary/40 uppercase tracking-[0.3em] mt-0.5">
                                      {isDirectlyQualified ? 'Qualifié Direct' : 'Meilleur 3e'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-xs font-bold text-zinc-500">{stat.played}</TableCell>
                            <TableCell className={`text-center text-xs font-black ${stat.gd > 0 ? 'text-primary' : stat.gd < 0 ? 'text-red-500' : 'text-zinc-600'}`}>
                              {stat.gd > 0 ? `+${stat.gd}` : stat.gd}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="text-base font-black text-primary text-glow-primary">
                                {stat.pts}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {allThirdPlaced.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex flex-col items-center gap-6 mb-12 text-center">
             <h3 className="text-3xl font-black uppercase tracking-tighter italic">Classement des Meilleurs 3es</h3>
             <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em]">Les 8 premières nations rejoindront les 16es de finale</p>
          </div>

          <Card className="border-none glass-card overflow-hidden rounded-[3rem]">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-white/[0.04] h-16">
                  <TableRow className="hover:bg-transparent border-white/10">
                    <TableHead className="w-20 text-center text-[10px] uppercase font-black tracking-widest text-zinc-400">Position</TableHead>
                    <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-400 italic">Equipe</TableHead>
                    <TableHead className="text-center text-[10px] uppercase font-black tracking-widest text-zinc-400">Groupe</TableHead>
                    <TableHead className="text-center text-[10px] uppercase font-black tracking-widest text-zinc-400">MJ</TableHead>
                    <TableHead className="text-center text-[10px] uppercase font-black tracking-widest text-zinc-400">DB</TableHead>
                    <TableHead className="text-center text-[10px] uppercase font-black tracking-widest text-primary">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allThirdPlaced
                    .sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
                    .map((stat, i) => {
                      const isQualified = i < 8;
                      return (
                        <TableRow key={stat.team.id} className={`border-white/5 transition-all duration-300 ${isQualified ? 'bg-primary/5' : 'opacity-40'}`}>
                          <TableCell className="text-center py-6">
                            <div className={`w-8 h-8 mx-auto rounded-xl flex items-center justify-center text-[10px] font-black ${isQualified ? 'bg-primary text-black' : 'bg-white/5 text-zinc-600'}`}>
                              {i + 1}
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">{stat.team.flag}</span>
                              <span className="font-black text-sm uppercase italic tracking-tight">{stat.team.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-black text-zinc-400">{stat.team.group}</TableCell>
                          <TableCell className="text-center font-bold text-zinc-500">{stat.played}</TableCell>
                          <TableCell className="text-center font-black text-zinc-400">{stat.gd > 0 ? `+${stat.gd}` : stat.gd}</TableCell>
                          <TableCell className="text-center">
                            <span className="text-lg font-black text-primary italic">{stat.pts}</span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};
