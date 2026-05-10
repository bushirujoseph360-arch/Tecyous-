import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star } from 'lucide-react';

interface BracketNodeProps {
  label: string;
  isCompleted?: boolean;
  winner?: string;
  team1?: string;
  team2?: string;
  score1?: number;
  score2?: number;
}

const BracketMatch: React.FC<BracketNodeProps> = ({ label, team1, team2, score1, score2, winner }) => (
  <div className="flex flex-col gap-2 w-48">
    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-1">{label}</span>
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden glass-card">
      <div className={`p-3 flex justify-between items-center ${winner === team1 ? 'bg-primary/5' : ''}`}>
        <span className={`text-[10px] font-black uppercase tracking-wider ${winner === team1 ? 'text-primary' : 'text-zinc-400'}`}>{team1 || 'À Déterminer'}</span>
        <span className="text-xs font-black italic">{score1 ?? '-'}</span>
      </div>
      <div className="h-px bg-white/5" />
      <div className={`p-3 flex justify-between items-center ${winner === team2 ? 'bg-primary/5' : ''}`}>
        <span className={`text-[10px] font-black uppercase tracking-wider ${winner === team2 ? 'text-primary' : 'text-zinc-400'}`}>{team2 || 'À Déterminer'}</span>
        <span className="text-xs font-black italic">{score2 ?? '-'}</span>
      </div>
    </div>
  </div>
);

export const Bracket: React.FC = () => {
  return (
    <div className="py-8 space-y-12 overflow-x-auto pb-12">
      <div className="flex flex-col items-center gap-4 text-center mb-12">
        <h2 className="text-4xl font-black uppercase tracking-tighter italic">Phase Éliminatoire</h2>
        <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">Le chemin vers la finale - MetLife Stadium</span>
        </div>
      </div>

      <div className="flex gap-16 min-w-max px-8 items-center">
        {/* Round of 32 */}
        <div className="flex flex-col gap-8">
          <BracketMatch label="Match 1" team1="Gagnant A" team2="3e C/D/E" />
          <BracketMatch label="Match 2" team1="Gagnant B" team2="3e A/F/G" />
          <BracketMatch label="Match 3" team1="Gagnant C" team2="3e B/H/I" />
          <BracketMatch label="Match 4" team1="Gagnant D" team2="3e J/K/L" />
        </div>

        {/* Lines */}
        <div className="hidden lg:flex flex-col gap-[144px]">
          <div className="w-8 h-px bg-white/10" />
          <div className="w-8 h-px bg-white/10" />
        </div>

        {/* Round of 16 */}
        <div className="flex flex-col gap-16">
          <BracketMatch label="Huitièmes 1" />
          <BracketMatch label="Huitièmes 2" />
        </div>

        {/* Quarter Finals */}
        <div className="flex flex-col gap-32">
          <BracketMatch label="Quarts 1" />
        </div>

        {/* Center / Final */}
        <div className="flex flex-col items-center gap-8 px-12">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] animate-pulse" />
            <div className="relative w-48 h-48 rounded-full glass border border-primary/30 flex flex-col items-center justify-center gap-4">
              <Trophy className="w-16 h-16 text-primary drop-shadow-[0_0_20px_rgba(163,230,53,0.5)]" />
              <div className="text-center">
                <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500">Finale</p>
                <p className="text-xs font-black uppercase text-white tracking-widest mt-1">19 JUIL 2026</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side for other path... simplified for demo */}
      </div>

      <div className="mt-24 p-8 glass border border-white/5 rounded-[3rem] max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center shrink-0">
            <Star className="w-10 h-10 text-primary" />
          </div>
          <div className="space-y-4">
            <h4 className="text-xl font-black uppercase italic tracking-tight">Le nouveau format à 48 équipes</h4>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Pour la première fois, la Coupe du Monde passera à 48 nations. Les 12 vainqueurs de groupe, les 12 deuxièmes et les 8 meilleurs troisièmes se qualifieront pour les 16es de finale, créant un tableau de phase finale encore plus compétitif et imprévisible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
