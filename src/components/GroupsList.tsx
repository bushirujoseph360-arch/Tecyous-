import React, { useState } from 'react';
import { Team } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { GROUPS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Trash2, Plus, Flag, Users, Database, Pencil, X } from 'lucide-react';
import { db, collection, addDoc, deleteDoc, doc, setDoc, updateDoc } from '../firebase';
import { toast } from 'sonner';

interface GroupsListProps {
  teams: Team[];
  isAdmin?: boolean;
  onSeedTeams?: () => Promise<void>;
}

const GROUP_COLORS: Record<string, string> = {
  A: 'border-l-emerald-500',
  B: 'border-l-rose-500',
  C: 'border-l-orange-500',
  D: 'border-l-blue-500',
  E: 'border-l-purple-500',
  F: 'border-l-lime-400',
  G: 'border-l-pink-500',
  H: 'border-l-cyan-400',
  I: 'border-l-violet-600',
  J: 'border-l-sky-500',
  K: 'border-l-red-600',
  L: 'border-l-indigo-700',
};

const GROUP_BG_ACCENTS: Record<string, string> = {
  A: 'bg-emerald-500',
  B: 'bg-rose-500',
  C: 'bg-orange-500',
  D: 'bg-blue-500',
  E: 'bg-purple-500',
  F: 'bg-lime-400',
  G: 'bg-pink-500',
  H: 'bg-cyan-400',
  I: 'bg-violet-600',
  J: 'bg-sky-500',
  K: 'bg-red-600',
  L: 'bg-indigo-700',
};

export const GroupsList: React.FC<GroupsListProps> = ({ teams, isAdmin, onSeedTeams }) => {
  const [newTeam, setNewTeam] = useState({ name: '', flag: '', group: GROUPS[0] });
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);

  const teamsByGroup = GROUPS.reduce((acc, group) => {
    acc[group] = teams.filter(team => team.group === group);
    return acc;
  }, {} as Record<string, Team[]>);

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name || !newTeam.flag) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      const teamId = newTeam.name.toLowerCase().replace(/\s+/g, '-');
      await setDoc(doc(db, 'teams', teamId), {
        ...newTeam,
        id: teamId
      });
      setNewTeam({ name: '', flag: '', group: newTeam.group });
      toast.success(`${newTeam.name} ajouté au Groupe ${newTeam.group}`);
    } catch (error) {
      console.error("Error adding team", error);
      toast.error("Erreur lors de l'ajout de l'équipe");
    }
  };

  const handleClearTeams = async () => {
    if (confirm("Voulez-vous vraiment supprimer TOUTES les équipes ? Cette action est irréversible.")) {
      try {
        const deletePromises = teams.map(team => deleteDoc(doc(db, 'teams', team.id)));
        await Promise.all(deletePromises);
        toast.success("Toutes les équipes ont été supprimées");
      } catch (error) {
        console.error("Error clearing teams", error);
        toast.error("Erreur lors de la suppression des équipes");
      }
    }
  };

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (confirm(`Supprimer ${teamName} ?`)) {
      try {
        await deleteDoc(doc(db, 'teams', teamId));
        toast.success(`${teamName} supprimé`);
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleUpdateGroup = async (team: Team, newGroup: string) => {
    try {
      await updateDoc(doc(db, 'teams', team.id), { group: newGroup });
      setEditingTeamId(null);
      toast.success(`${team.name} déplacé vers le Groupe ${newGroup}`);
    } catch (error) {
      console.error("Error updating group", error);
      toast.error("Erreur lors du changement de groupe");
    }
  };

  return (
    <div className="space-y-16">
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <Card className="lg:col-span-2 border-none glass-dark rounded-[2rem] shadow-2xl overflow-hidden">
            <CardHeader className="bg-white/[0.03] p-6 border-b border-white/5">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-400">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                  <Plus className="h-4 w-4" />
                </div>
                Enregistrer un nouveau pays
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleAddTeam} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Nom du Pays</Label>
                  <Input 
                    placeholder="Ex: France" 
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                    className="bg-white/[0.03] border-white/5 h-12 rounded-xl focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Drapeau (Emoji)</Label>
                  <Input 
                    placeholder="Ex: 🇫🇷" 
                    value={newTeam.flag}
                    onChange={(e) => setNewTeam({...newTeam, flag: e.target.value})}
                    className="bg-white/[0.03] border-white/5 h-12 rounded-xl text-2xl text-center focus:ring-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Groupe</Label>
                  <Select 
                    value={newTeam.group} 
                    onValueChange={(val) => setNewTeam({...newTeam, group: val})}
                  >
                    <SelectTrigger className="bg-white/[0.03] border-white/5 h-12 rounded-xl focus:ring-primary/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass border-white/10">
                      {GROUPS.map(g => (
                        <SelectItem key={g} value={g} className="font-bold">Groupe {g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="bg-primary text-black font-black uppercase tracking-widest text-[10px] h-12 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                  <Plus className="mr-2 h-4 w-4" /> Enregistrer
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none glass-dark rounded-[2rem] shadow-2xl overflow-hidden">
            <CardHeader className="bg-white/[0.03] p-6 border-b border-white/5">
              <CardTitle className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 text-zinc-400">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500">
                  <Database className="h-4 w-4" />
                </div>
                Zone de Danger
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex flex-col gap-4">
              <Button 
                variant="destructive" 
                onClick={handleClearTeams}
                className="w-full font-black uppercase tracking-widest text-[10px] h-12 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Effacer TOUT
              </Button>
              {onSeedTeams && (
                <Button 
                  variant="outline" 
                  onClick={onSeedTeams}
                  className="w-full font-black uppercase tracking-widest text-[10px] h-12 rounded-xl border-primary/20 hover:bg-primary/10 text-primary transition-all"
                >
                  <Database className="mr-2 h-4 w-4" /> Charger Officiels
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {GROUPS.map((group, index) => {
          const groupTeams = teamsByGroup[group] || [];
          
          return (
            <motion.div
              key={group}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.6 }}
              className="relative group"
            >
              <div className={`absolute -inset-1 bg-gradient-to-br ${GROUP_BG_ACCENTS[group]} opacity-0 group-hover:opacity-10 rounded-[2.5rem] blur-2xl transition duration-700`} />
              
              <Card className={`relative overflow-hidden border-none glass-dark shadow-2xl transition-all duration-700 group-hover:translate-y-[-8px] ${groupTeams.length === 0 ? 'opacity-40' : ''} rounded-[2.5rem]`}>
                <div className="flex h-full min-h-[240px]">
                  <div className={`w-20 flex items-center justify-center text-4xl font-black text-white ${GROUP_BG_ACCENTS[group]} shadow-[8px_0_32px_rgba(0,0,0,0.4)] relative z-10`}>
                    <span className="rotate-[-90deg] tracking-tighter drop-shadow-lg">{group}</span>
                  </div>
                  <CardContent className="flex-1 p-0 bg-gradient-to-br from-white/[0.03] to-transparent">
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">GROUPE {group}</span>
                      <span className="text-[10px] font-black text-primary">{groupTeams.length} ÉQUIPES</span>
                    </div>
                    {groupTeams.length === 0 ? (
                      <div className="h-40 flex items-center justify-center text-[10px] uppercase font-black tracking-[0.4em] text-zinc-800 italic">
                        Vide
                      </div>
                    ) : (
                      <div className="divide-y divide-white/5">
                        {groupTeams.map((team) => (
                          <div key={team.id} className="flex items-center justify-between gap-4 px-8 py-5 hover:bg-white/[0.04] transition-all duration-300 group/item">
                            <div className="flex items-center gap-5">
                              <span className="text-3xl grayscale group-hover/item:grayscale-0 transition-all duration-500 transform group-hover/item:scale-125 group-hover/item:rotate-[-8deg] drop-shadow-md">
                                {team.flag}
                              </span>
                              <span className="text-[12px] font-black uppercase tracking-[0.15em] text-zinc-300 group-hover/item:text-white transition-colors">
                                {team.name}
                              </span>
                            </div>
                            {isAdmin && (
                              <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-all transform translate-x-4 group-hover/item:translate-x-0">
                                {editingTeamId === team.id ? (
                                  <div className="flex items-center gap-2">
                                    <Select 
                                      value={team.group} 
                                      onValueChange={(val) => handleUpdateGroup(team, val)}
                                    >
                                      <SelectTrigger className="h-8 w-24 text-[10px] bg-black/80 border-white/10 rounded-full font-black">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent className="glass border-white/10">
                                        {GROUPS.map(g => (
                                          <SelectItem key={g} value={g} className="text-[10px] font-black">Gr. {g}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => setEditingTeamId(null)}
                                      className="h-8 w-8 hover:bg-white/10 rounded-full"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => setEditingTeamId(team.id)}
                                      className="h-9 w-9 text-zinc-500 hover:text-primary hover:bg-primary/10 transition-all rounded-xl"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      onClick={() => handleDeleteTeam(team.id, team.name)}
                                      className="h-9 w-9 text-zinc-500 hover:text-destructive hover:bg-destructive/10 transition-all rounded-xl"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
