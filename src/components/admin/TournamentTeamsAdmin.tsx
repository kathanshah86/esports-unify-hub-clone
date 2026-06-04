import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Trash2, Users, UserPlus, UserMinus, ShieldAlert } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Tournament {
  id: string;
  name: string;
  game: string;
  team_size: number | null;
  team_mode: string | null;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  email?: string | null;
  username?: string | null;
  display_name?: string | null;
  phone_number?: string | null;
}

interface Team {
  id: string;
  team_name: string;
  captain_user_id: string;
  current_members: number;
  max_members: number;
  is_full: boolean;
  status: string;
  created_at: string;
  members: TeamMember[];
}

const TournamentTeamsAdmin = () => {
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  const [teamName, setTeamName] = useState('');
  const [captainIdent, setCaptainIdent] = useState('');
  const [membersIdent, setMembersIdent] = useState('');
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const selected = tournaments.find(t => t.id === selectedId);

  useEffect(() => { loadTournaments(); }, []);
  useEffect(() => { if (selectedId) loadTeams(); }, [selectedId]);

  const loadTournaments = async () => {
    const { data, error } = await supabase
      .from('tournaments')
      .select('id, name, game, team_size, team_mode')
      .order('created_at', { ascending: false });
    if (error) {
      toast({ title: 'Error', description: 'Failed to load tournaments', variant: 'destructive' });
      return;
    }
    setTournaments(data || []);
    if (data && data.length > 0 && !selectedId) setSelectedId(data[0].id);
  };

  const loadTeams = async () => {
    setLoading(true);
    try {
      const { data: teamRows, error } = await supabase
        .from('tournament_teams')
        .select('*')
        .eq('tournament_id', selectedId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const teamIds = (teamRows || []).map(t => t.id);
      let memberRows: any[] = [];
      if (teamIds.length > 0) {
        const { data: mRows } = await supabase
          .from('tournament_team_members')
          .select('*')
          .in('team_id', teamIds);
        memberRows = mRows || [];
      }

      const userIds = Array.from(new Set(memberRows.map(m => m.user_id)));
      let profileMap = new Map<string, any>();
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, email, username, display_name, phone_number')
          .in('user_id', userIds);
        profileMap = new Map((profs || []).map(p => [p.user_id, p]));
      }

      const enriched: Team[] = (teamRows || []).map((t: any) => ({
        ...t,
        members: memberRows
          .filter(m => m.team_id === t.id)
          .map(m => ({
            ...m,
            email: profileMap.get(m.user_id)?.email,
            username: profileMap.get(m.user_id)?.username,
            display_name: profileMap.get(m.user_id)?.display_name,
            phone_number: profileMap.get(m.user_id)?.phone_number,
          })),
      }));
      setTeams(enriched);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to load teams', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Lookup a user by email / phone / user_id
  const resolveUserId = async (ident: string): Promise<string | null> => {
    const v = ident.trim();
    if (!v) return null;
    // UUID heuristic
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)) {
      return v;
    }
    if (v.includes('@')) {
      const { data } = await supabase.from('profiles').select('user_id').ilike('email', v).maybeSingle();
      return data?.user_id || null;
    }
    const { data } = await supabase.from('profiles').select('user_id').eq('phone_number', v).maybeSingle();
    return data?.user_id || null;
  };

  // Mirror membership into tournament_registrations
  const upsertRegistration = async (userId: string) => {
    if (!selectedId) return;
    const { data: prof } = await supabase
      .from('profiles')
      .select('display_name, username, email, phone_number')
      .eq('user_id', userId)
      .maybeSingle();
    const playerName = prof?.display_name || prof?.username || prof?.email || 'Admin Added';
    const gameId = prof?.username || prof?.email || prof?.phone_number || userId.slice(0, 8);
    await supabase
      .from('tournament_registrations')
      .upsert(
        {
          tournament_id: selectedId,
          user_id: userId,
          player_name: playerName,
          game_id: gameId,
          status: 'registered',
          payment_status: 'completed',
          payment_amount: 0,
        },
        { onConflict: 'tournament_id,user_id' }
      );
  };

  const removeRegistration = async (userId: string, tournamentId?: string) => {
    const tid = tournamentId || selectedId;
    if (!tid) return;
    await supabase
      .from('tournament_registrations')
      .delete()
      .eq('tournament_id', tid)
      .eq('user_id', userId);
  };

  const handleCreateTeam = async () => {
    if (!selectedId) return;
    if (!teamName.trim() || !captainIdent.trim()) {
      toast({ title: 'Missing fields', description: 'Team name and captain are required', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const captainId = await resolveUserId(captainIdent);
      if (!captainId) {
        toast({ title: 'Captain not found', description: 'No user matches that email / phone / id', variant: 'destructive' });
        setCreating(false);
        return;
      }

      // Create team — captain membership is added automatically by DB trigger
      const { data: newTeam, error: tErr } = await supabase
        .from('tournament_teams')
        .insert({
          tournament_id: selectedId,
          team_name: teamName.trim(),
          captain_user_id: captainId,
          max_members: selected?.team_size || 1,
        } as any)
        .select()
        .single();
      if (tErr) throw tErr;

      // Register captain
      await upsertRegistration(captainId);


      // Add extra members
      const extras = membersIdent
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(Boolean);

      const addedFailures: string[] = [];
      for (const ident of extras) {
        const uid = await resolveUserId(ident);
        if (!uid) { addedFailures.push(`${ident} (not found)`); continue; }
        if (uid === captainId) continue;
        const { error: mErr } = await supabase
          .from('tournament_team_members')
          .insert({ team_id: newTeam.id, user_id: uid, role: 'member' });
        if (mErr) { addedFailures.push(`${ident} (${mErr.message})`); continue; }
        await upsertRegistration(uid);
      }

      toast({
        title: 'Team created',
        description: addedFailures.length
          ? `Team added. Some members skipped: ${addedFailures.join('; ')}`
          : 'Team added and members enrolled',
      });
      setTeamName(''); setCaptainIdent(''); setMembersIdent('');
      loadTeams();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to create team', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Remove this whole team and all its members? This bypasses normal process.')) return;
    setBusyId(teamId);
    try {
      // Delete members first to satisfy trigger counts
      const { error: mErr } = await supabase
        .from('tournament_team_members')
        .delete()
        .eq('team_id', teamId);
      if (mErr) throw mErr;

      const { error: tErr } = await supabase
        .from('tournament_teams')
        .delete()
        .eq('id', teamId);
      if (tErr) throw tErr;

      toast({ title: 'Team removed', description: 'Team and members deleted' });
      loadTeams();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to remove team', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const handleRemoveMember = async (teamId: string, memberId: string, userId: string, isCaptain: boolean) => {
    if (isCaptain) {
      toast({ title: 'Cannot remove captain', description: 'Delete the team instead, or promote another member.', variant: 'destructive' });
      return;
    }
    if (!confirm('Remove this member from the team?')) return;
    setBusyId(memberId);
    try {
      const { error } = await supabase
        .from('tournament_team_members')
        .delete()
        .eq('id', memberId);
      if (error) throw error;
      toast({ title: 'Member removed' });
      loadTeams();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to remove member', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const handleAddMember = async (teamId: string) => {
    const ident = prompt('Add member by email, phone, or user_id:');
    if (!ident) return;
    setBusyId(teamId);
    try {
      const uid = await resolveUserId(ident);
      if (!uid) {
        toast({ title: 'User not found', variant: 'destructive' });
        return;
      }
      const { error } = await supabase
        .from('tournament_team_members')
        .insert({ team_id: teamId, user_id: uid, role: 'member' });
      if (error) throw error;
      toast({ title: 'Member added' });
      loadTeams();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to add member', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger className="w-80 bg-gray-800 border-gray-700 text-white">
            <SelectValue placeholder="Select a tournament" />
          </SelectTrigger>
          <SelectContent>
            {tournaments.map(t => (
              <SelectItem key={t.id} value={t.id}>{t.name} ({t.game})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected && (
          <Badge variant="outline" className="text-gray-300">
            Team size: {selected.team_size || 1} • Mode: {selected.team_mode || 'n/a'}
          </Badge>
        )}
      </div>

      {/* Add Team */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Plus className="w-5 h-5 mr-2 text-purple-400" />
            Add Whole Team (Bypass Process)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300">Team Name</Label>
              <Input
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                placeholder="Phoenix Squad"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div>
              <Label className="text-gray-300">Captain (email / phone / user_id)</Label>
              <Input
                value={captainIdent}
                onChange={e => setCaptainIdent(e.target.value)}
                placeholder="captain@example.com"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>
          <div>
            <Label className="text-gray-300">
              Additional Members (one per line or comma separated — email / phone / user_id)
            </Label>
            <Textarea
              value={membersIdent}
              onChange={e => setMembersIdent(e.target.value)}
              placeholder={"player2@example.com\n9876543210\n<user-uuid>"}
              rows={4}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-yellow-400">
            <ShieldAlert className="w-4 h-4" />
            Bypasses payment, registration form, and team-join flow. Members are enrolled directly.
          </div>
          <Button
            onClick={handleCreateTeam}
            disabled={creating || !selectedId}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
            Create Team
          </Button>
        </CardContent>
      </Card>

      {/* Teams List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Teams ({teams.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center text-gray-400 py-8">No teams in this tournament</div>
          ) : (
            <div className="space-y-4">
              {teams.map(team => (
                <Card key={team.id} className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                      <div>
                        <div className="text-white font-semibold text-lg flex items-center gap-2">
                          {team.team_name}
                          <Badge className={team.is_full ? 'bg-green-600' : 'bg-blue-600'}>
                            {team.current_members}/{team.max_members}
                          </Badge>
                          <Badge variant="outline" className="text-gray-300">{team.status}</Badge>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Created: {new Date(team.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddMember(team.id)}
                          disabled={busyId === team.id}
                        >
                          <UserPlus className="w-4 h-4 mr-1" /> Add Member
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteTeam(team.id)}
                          disabled={busyId === team.id}
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Remove Team
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {team.members.map(m => {
                        const isCaptain = m.user_id === team.captain_user_id;
                        return (
                          <div
                            key={m.id}
                            className="flex items-center justify-between bg-gray-800 rounded px-3 py-2"
                          >
                            <div className="text-sm">
                              <div className="text-white flex items-center gap-2">
                                {m.display_name || m.username || m.email || m.user_id}
                                {isCaptain && <Badge className="bg-yellow-600">Captain</Badge>}
                              </div>
                              <div className="text-gray-400 text-xs">
                                {m.email || 'no email'} {m.phone_number ? `• ${m.phone_number}` : ''}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-400 hover:text-red-300"
                              onClick={() => handleRemoveMember(team.id, m.id, m.user_id, isCaptain)}
                              disabled={busyId === m.id || isCaptain}
                              title={isCaptain ? 'Delete the team to remove the captain' : 'Remove member'}
                            >
                              <UserMinus className="w-4 h-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentTeamsAdmin;
