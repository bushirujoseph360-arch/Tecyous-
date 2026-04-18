import React from 'react';
import { Team, Match } from '../types';
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
    const groupMatches = matches.filter(m => m.group === group && m.status === 'Finished');

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {GROUPS.map((group, index) => {
        const standings = calculateStandings(group);
        if (standings.length === 0) return null;

        return (
          <motion.div
            key={group}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="group"
          >
            <Card className="border-none glass-dark overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-500 group-hover:translate-y-[-4px] group-hover:bg-white/[0.03]">
              <CardHeader className="bg-white/[0.03] py-5 px-8 border-b border-white/5">
                <CardTitle className="text-lg font-black uppercase tracking-[0.2em] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-xl italic">
                      {group}
                    </div>
                    <span className="text-zinc-200">Groupe {group}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-primary font-black tracking-[0.3em]">CLASSEMENT</span>
                    <span className="text-[8px] text-zinc-500 font-bold tracking-widest">QUALIFICATION TOP 2</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-black/40">
                    <TableRow className="hover:bg-transparent border-white/5">
                      <TableHead className="w-14 text-center text-[10px] uppercase font-black tracking-widest text-zinc-500">Pos</TableHead>
                      <TableHead className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Équipe</TableHead>
                      <TableHead className="text-center text-[10px] uppercase font-black tracking-widest text-zinc-500">J</TableHead>
                      <TableHead className="text-center text-[10px] uppercase font-black tracking-widest text-zinc-500">G</TableHead>
                      <TableHead className="text-center text-[10px] uppercase font-black tracking-widest text-zinc-500">N</TableHead>
                      <TableHead className="text-center text-[10px] uppercase font-black tracking-widest text-zinc-500">P</TableHead>
                      <TableHead className="text-center text-[10px] uppercase font-black tracking-widest text-zinc-500">Diff</TableHead>
                      <TableHead className="text-center text-[10px] uppercase font-black tracking-widest text-primary">Pts</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standings.map((stat, i) => {
                      const isQualified = i < 2;
                      return (
                        <TableRow key={stat.team.id} className={`border-white/5 hover:bg-white/[0.04] transition-all duration-300 group/row ${isQualified ? 'bg-primary/[0.02]' : ''}`}>
                          <TableCell className="text-center">
                            <div className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-xs font-black ${isQualified ? 'bg-primary text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]' : 'bg-white/5 text-zinc-500'}`}>
                              {i + 1}
                            </div>
                          </TableCell>
                          <TableCell className="py-5">
                            <div className="flex items-center gap-4">
                              <span className="text-2xl transform group-hover/row:scale-125 transition-transform duration-300">
                                {stat.team.flag}
                              </span>
                              <div className="flex flex-col">
                                <span className="font-black text-xs uppercase tracking-widest text-zinc-200 group-hover/row:text-white transition-colors">
                                  {stat.team.name}
                                </span>
                                {isQualified && (
                                  <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest">Qualifié</span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-xs font-bold text-zinc-400">{stat.played}</TableCell>
                          <TableCell className="text-center text-xs font-bold text-zinc-400">{stat.won}</TableCell>
                          <TableCell className="text-center text-xs font-bold text-zinc-400">{stat.drawn}</TableCell>
                          <TableCell className="text-center text-xs font-bold text-zinc-400">{stat.lost}</TableCell>
                          <TableCell className={`text-center text-xs font-black ${stat.gd > 0 ? 'text-primary' : stat.gd < 0 ? 'text-red-400' : 'text-zinc-500'}`}>
                            {stat.gd > 0 ? `+${stat.gd}` : stat.gd}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm font-black text-primary drop-shadow-[0_0_10px_rgba(163,230,53,0.2)]">
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
  );
};
