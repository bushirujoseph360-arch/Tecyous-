import React, { useState } from 'react';
import { db, collection, addDoc, updateDoc, doc, deleteDoc } from '../firebase';
import { Match, Team } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { VENUES, STAGES, GROUPS } from '../constants';
import { Plus, Pencil, Trash2, Save, X, Database, Users, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface AdminPanelProps {
  matches: Match[];
  teams: Team[];
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ matches, teams }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Match>>({
    homeTeamId: '',
    awayTeamId: '',
    date: new Date().toISOString().slice(0, 16),
    venue: VENUES[0],
    stage: 'Group' as any,
    group: GROUPS[0],
    status: 'Scheduled' as any,
    homeScore: 0,
    awayScore: 0
  });

  const [newTeam, setNewTeam] = useState({ name: '', flag: '', group: GROUPS[0] });

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      homeTeamId: '',
      awayTeamId: '',
      date: new Date().toISOString().slice(0, 16),
      venue: VENUES[0],
      stage: 'Group' as any,
      group: GROUPS[0],
      status: 'Scheduled' as any,
      homeScore: 0,
      awayScore: 0
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const homeTeam = teams.find(t => t.id === formData.homeTeamId);
    const awayTeam = teams.find(t => t.id === formData.awayTeamId);

    if (!homeTeam || !awayTeam) {
      toast.error("Veuillez sélectionner les deux équipes");
      return;
    }

    const matchData = {
      ...formData,
      homeTeamName: homeTeam.name,
      awayTeamName: awayTeam.name,
      id: editingId || crypto.randomUUID()
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'matches', editingId), matchData);
        toast.success("Match mis à jour");
      } else {
        await addDoc(collection(db, 'matches'), matchData);
        toast.success("Match ajouté");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving match", error);
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name || !newTeam.flag) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      await addDoc(collection(db, 'teams'), {
        ...newTeam,
        id: crypto.randomUUID()
      });
      toast.success(`Équipe ${newTeam.name} ajoutée !`);
      setNewTeam({ name: '', flag: '', group: GROUPS[0] });
    } catch (error) {
      toast.error("Erreur lors de l'ajout de l'équipe");
    }
  };

  const handleEdit = (match: Match) => {
    setEditingId(match.id);
    setFormData({
      ...match,
      date: new Date(match.date).toISOString().slice(0, 16)
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce match ?")) {
      try {
        await deleteDoc(doc(db, 'matches', id));
        toast.success("Match supprimé");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer cette équipe ?")) {
      try {
        await deleteDoc(doc(db, 'teams', id));
        toast.success("Équipe supprimée");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const updateMatchScore = async (match: Match, homeDelta: number, awayDelta: number) => {
    try {
      await updateDoc(doc(db, 'matches', match.id), {
        homeScore: Math.max(0, (match.homeScore || 0) + homeDelta),
        awayScore: Math.max(0, (match.awayScore || 0) + awayDelta)
      });
    } catch (error) {
      toast.error("Erreur mise à jour score");
    }
  };

  const updateMatchStatus = async (id: string, status: Match['status']) => {
    try {
      await updateDoc(doc(db, 'matches', id), { status });
      toast.success(`Match passé en ${status}`);
    } catch (error) {
      toast.error("Erreur mise à jour statut");
    }
  };

  const simulateLiveMatch = async () => {
    const scheduledMatches = matches.filter(m => m.status === 'Scheduled');
    if (scheduledMatches.length === 0) {
      toast.error("Aucun match à venir à simuler");
      return;
    }
    const randomMatch = scheduledMatches[Math.floor(Math.random() * scheduledMatches.length)];
    try {
      await updateDoc(doc(db, 'matches', randomMatch.id), {
        status: 'Live',
        homeScore: Math.floor(Math.random() * 2),
        awayScore: Math.floor(Math.random() * 2)
      });
      toast.success(`Simulation lancée : ${randomMatch.homeTeamName} vs ${randomMatch.awayTeamName}`);
    } catch (error) {
      toast.error("Erreur simulation");
    }
  };

  return (
    <div className="space-y-12 pb-32">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Match Form */}
        <Card className="lg:col-span-2 border-none glass-dark rounded-[2.5rem] shadow-2xl overflow-hidden">
          <CardHeader className="bg-white/[0.03] p-8 border-b border-white/5">
            <CardTitle className="text-2xl font-black uppercase tracking-[0.2em] flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                <Database className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span>{editingId ? 'Modifier Match' : 'Nouveau Match'}</span>
                <span className="text-[10px] text-zinc-500 font-bold tracking-[0.3em]">CONFIGURATION OFFICIELLE</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 ml-1">Équipe Domicile</Label>
                    <Select 
                      value={formData.homeTeamId} 
                      onValueChange={(val) => setFormData({...formData, homeTeamId: val})}
                    >
                      <SelectTrigger className="bg-white/[0.03] border-white/5 h-14 rounded-2xl focus:ring-primary/50">
                        <SelectValue placeholder="Choisir une équipe" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id} className="py-3">
                            <span className="flex items-center gap-3 font-bold">
                              <span className="text-lg">{team.flag}</span>
                              {team.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 ml-1">Équipe Extérieur</Label>
                    <Select 
                      value={formData.awayTeamId} 
                      onValueChange={(val) => setFormData({...formData, awayTeamId: val})}
                    >
                      <SelectTrigger className="bg-white/[0.03] border-white/5 h-14 rounded-2xl focus:ring-primary/50">
                        <SelectValue placeholder="Choisir une équipe" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id} className="py-3">
                            <span className="flex items-center gap-3 font-bold">
                              <span className="text-lg">{team.flag}</span>
                              {team.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 ml-1">Score Dom.</Label>
                      <Input 
                        type="number" 
                        className="bg-white/[0.03] border-white/5 h-14 rounded-2xl font-black text-center text-2xl focus:ring-primary/50"
                        value={formData.homeScore} 
                        onChange={(e) => setFormData({ ...formData, homeScore: parseInt(e.target.value) })} 
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 ml-1">Score Ext.</Label>
                      <Input 
                        type="number" 
                        className="bg-white/[0.03] border-white/5 h-14 rounded-2xl font-black text-center text-2xl focus:ring-primary/50"
                        value={formData.awayScore} 
                        onChange={(e) => setFormData({ ...formData, awayScore: parseInt(e.target.value) })} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 ml-1">Date et Heure</Label>
                    <Input 
                      type="datetime-local" 
                      className="bg-white/[0.03] border-white/5 h-14 rounded-2xl focus:ring-primary/50 font-bold"
                      value={formData.date} 
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 ml-1">Stade / Ville</Label>
                    <Select 
                      value={formData.venue} 
                      onValueChange={(val) => setFormData({ ...formData, venue: val })}
                    >
                      <SelectTrigger className="bg-white/[0.03] border-white/5 h-14 rounded-2xl focus:ring-primary/50">
                        <SelectValue placeholder="Choisir un stade" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/10">
                        {VENUES.map(v => (
                          <SelectItem key={v} value={v} className="py-3 font-bold">{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 ml-1">Phase</Label>
                      <Select 
                        value={formData.stage} 
                        onValueChange={(val) => setFormData({ ...formData, stage: val as any })}
                      >
                        <SelectTrigger className="bg-white/[0.03] border-white/5 h-14 rounded-2xl focus:ring-primary/50">
                          <SelectValue placeholder="Phase" />
                        </SelectTrigger>
                        <SelectContent className="glass border-white/10">
                          {STAGES.map(s => (
                            <SelectItem key={s} value={s} className="py-3 font-bold">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 ml-1">Statut</Label>
                      <Select 
                        value={formData.status} 
                        onValueChange={(val) => setFormData({ ...formData, status: val as any })}
                      >
                        <SelectTrigger className="bg-white/[0.03] border-white/5 h-14 rounded-2xl focus:ring-primary/50">
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent className="glass border-white/10">
                          <SelectItem value="Scheduled" className="py-3 font-bold">À venir</SelectItem>
                          <SelectItem value="Live" className="py-3 font-bold text-primary">En direct</SelectItem>
                          <SelectItem value="Finished" className="py-3 font-bold text-zinc-500">Terminé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                {editingId && (
                  <Button type="button" variant="ghost" onClick={resetForm} className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest hover:bg-white/5">
                    <X className="mr-3 h-4 w-4" /> Annuler
                  </Button>
                )}
                <Button type="submit" className="bg-primary text-black font-black uppercase tracking-[0.2em] px-14 h-14 rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all active:scale-95">
                  {editingId ? <Save className="mr-3 h-5 w-5" /> : <Plus className="mr-3 h-5 w-5" />}
                  {editingId ? 'Mettre à jour' : 'Enregistrer Match'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Team Management */}
        <Card className="border-none glass-dark rounded-[2.5rem] shadow-2xl overflow-hidden h-fit">
          <CardHeader className="bg-white/[0.03] p-8 border-b border-white/5">
            <CardTitle className="text-xl font-black uppercase tracking-[0.2em] flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Users className="h-5 w-5" />
              </div>
              <span>Nouvelle Équipe</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleAddTeam} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Nom du Pays</Label>
                <Input 
                  placeholder="Ex: France" 
                  className="bg-white/[0.03] border-white/5 h-12 rounded-xl"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Drapeau (Emoji)</Label>
                <Input 
                  placeholder="Ex: 🇫🇷" 
                  className="bg-white/[0.03] border-white/5 h-12 rounded-xl text-2xl text-center"
                  value={newTeam.flag}
                  onChange={(e) => setNewTeam({ ...newTeam, flag: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Groupe</Label>
                <Select 
                  value={newTeam.group} 
                  onValueChange={(val) => setNewTeam({ ...newTeam, group: val })}
                >
                  <SelectTrigger className="bg-white/[0.03] border-white/5 h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10">
                    {GROUPS.map(g => (
                      <SelectItem key={g} value={g} className="font-bold">Groupe {g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-white/5 hover:bg-primary hover:text-black text-white font-black uppercase tracking-widest h-12 rounded-xl transition-all">
                Ajouter l'Équipe
              </Button>
            </form>

            <div className="mt-10 space-y-4">
              <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500 ml-1">Équipes Existantes</Label>
              <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {teams.sort((a,b) => a.name.localeCompare(b.name)).map(team => (
                  <div key={team.id} className="flex items-center justify-between p-3 glass rounded-xl group/team">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{team.flag}</span>
                      <span className="text-xs font-bold uppercase tracking-tight">{team.name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteTeam(team.id)}
                      className="h-8 w-8 rounded-lg opacity-0 group-hover/team:opacity-100 hover:bg-destructive hover:text-white transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Matches List */}
      <Card className="border-none glass-dark rounded-[2.5rem] shadow-2xl overflow-hidden">
        <CardHeader className="bg-white/[0.03] p-8 border-b border-white/5 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-black uppercase tracking-[0.2em]">Liste des Rencontres</CardTitle>
          <Button 
            variant="outline" 
            onClick={simulateLiveMatch}
            className="h-10 rounded-xl border-primary/20 bg-primary/5 hover:bg-primary hover:text-black text-primary font-black uppercase tracking-widest text-[10px] transition-all"
          >
            <Trophy className="mr-2 h-4 w-4" /> Simuler un Direct
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-black/40">
                  <th className="px-8 py-5 text-left text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500">Match</th>
                  <th className="px-8 py-5 text-left text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500">Date & Lieu</th>
                  <th className="px-8 py-5 text-left text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500">Phase</th>
                  <th className="px-8 py-5 text-right text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {matches.map(match => (
                  <tr key={match.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="font-black text-sm uppercase italic tracking-tight">
                            {match.homeTeamName} <span className="text-primary mx-2">vs</span> {match.awayTeamName}
                          </span>
                          <div className="flex items-center gap-2 mt-2">
                            {match.status === 'Live' && (
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-6 w-6 rounded-md bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-black"
                                  onClick={() => updateMatchScore(match, 1, 0)}
                                >
                                  +
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-6 w-6 rounded-md bg-primary/10 border-primary/20 text-primary hover:bg-primary hover:text-black"
                                  onClick={() => updateMatchScore(match, 0, 1)}
                                >
                                  +
                                </Button>
                              </div>
                            )}
                            <span className={`bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full border border-primary/20 ${match.status === 'Live' ? 'animate-pulse' : ''}`}>
                              {match.homeScore} - {match.awayScore}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-zinc-300 font-bold text-xs">
                          {new Date(match.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{match.venue}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg border w-fit ${
                          match.status === 'Live' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' : 'bg-white/5 text-zinc-400 border-white/10'
                        }`}>
                          {match.status === 'Live' ? 'En Direct' : match.status === 'Finished' ? 'Terminé' : 'À venir'}
                        </span>
                        <div className="flex gap-1">
                          {match.status === 'Scheduled' && (
                            <Button variant="ghost" className="h-6 px-2 text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary hover:bg-primary hover:text-black" onClick={() => updateMatchStatus(match.id, 'Live')}>
                              Lancer
                            </Button>
                          )}
                          {match.status === 'Live' && (
                            <Button variant="ghost" className="h-6 px-2 text-[8px] font-black uppercase tracking-widest bg-zinc-500/10 text-zinc-400 hover:bg-zinc-500 hover:text-white" onClick={() => updateMatchStatus(match.id, 'Finished')}>
                              Terminer
                            </Button>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(match)} className="h-10 w-10 rounded-xl hover:bg-primary hover:text-black transition-all">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-destructive hover:text-white transition-all" onClick={() => handleDelete(match.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
