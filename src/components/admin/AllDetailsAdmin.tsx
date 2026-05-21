import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  Trophy,
  Ticket,
  Wallet,
  ClipboardList,
  Loader2,
  Search,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  users: number;
  tournaments: number;
  registrations: number;
  battleCodes: number;
  redemptions: number;
  walletDeposits: number;
  walletWithdrawals: number;
  walletAvailable: number;
}

interface UserRow {
  user_id: string;
  email: string | null;
  username: string | null;
  display_name: string | null;
  phone_number: string | null;
  referral_code: string | null;
  created_at: string;
  available_balance: number;
  registrations_count: number;
}

interface RegistrationRow {
  id: string;
  player_name: string;
  game_id: string;
  payment_status: string | null;
  payment_amount: number | null;
  created_at: string | null;
  referral_code_used: string | null;
  tournament_name: string;
  user_email: string | null;
  referrer_name: string | null;
}

interface RedemptionRow {
  id: string;
  amount: number;
  mode: string;
  redeemed_at: string;
  code: string;
  user_email: string | null;
  user_name: string | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  owner_user_id: string | null;
  source: string;
}

interface TxnRow {
  id: string;
  transaction_type: string;
  amount: number;
  status: string;
  payment_method: string | null;
  mode: string;
  created_at: string;
  user_email: string | null;
}

const formatINR = (n: number) =>
  `₹${(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const AllDetailsAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionRow[]>([]);
  const [transactions, setTransactions] = useState<TxnRow[]>([]);
  const [search, setSearch] = useState('');
  const [creditTarget, setCreditTarget] = useState<RedemptionRow | null>(null);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [crediting, setCrediting] = useState(false);

  const handleCredit = async () => {
    if (!creditTarget?.owner_user_id) return;
    const amt = Number(creditAmount);
    if (!amt || amt <= 0) {
      toast.error('Enter a valid amount');
      return;
    }
    setCrediting(true);
    try {
      const { error } = await supabase.from('wallet_transactions').insert({
        user_id: creditTarget.owner_user_id,
        transaction_type: 'battle_code',
        amount: amt,
        status: 'approved',
        payment_method: 'Admin Credit',
        transaction_reference:
          creditNote || `Admin credit for code ${creditTarget.code}`,
        mode: 'esports',
        approved_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success(`Credited ₹${amt} to ${creditTarget.owner_name}`);
      setCreditTarget(null);
      setCreditAmount('');
      setCreditNote('');
      loadAll();
    } catch (e: any) {
      toast.error(e.message || 'Failed to credit');
    } finally {
      setCrediting(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [
        profilesRes,
        tournamentsRes,
        regsRes,
        codesRes,
        redemptionsRes,
        txnsRes,
        balancesRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('tournaments').select('id, name'),
        supabase
          .from('tournament_registrations')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500),
        supabase.from('battle_codes').select('id, code, created_by_user_id'),
        supabase
          .from('battle_code_redemptions')
          .select('*')
          .order('redeemed_at', { ascending: false })
          .limit(500),
        supabase
          .from('wallet_transactions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500),
        supabase.from('wallet_balances').select('user_id, available_balance'),
      ]);

      const profiles = profilesRes.data || [];
      const tournaments = tournamentsRes.data || [];
      const regs = regsRes.data || [];
      const codes = codesRes.data || [];
      const reds = redemptionsRes.data || [];
      const txns = txnsRes.data || [];
      const balances = balancesRes.data || [];

      const profileMap = new Map(profiles.map((p: any) => [p.user_id, p]));
      const tournamentMap = new Map(tournaments.map((t: any) => [t.id, t.name]));
      const codeMap = new Map(codes.map((c: any) => [c.id, c]));

      // ---- Stats ----
      const totalDep = txns
        .filter((t: any) => t.transaction_type === 'deposit' && t.status === 'approved')
        .reduce((a: number, t: any) => a + Number(t.amount || 0), 0);
      const totalWith = txns
        .filter((t: any) => t.transaction_type === 'withdrawal' && t.status === 'approved')
        .reduce((a: number, t: any) => a + Number(t.amount || 0), 0);
      const totalAvail = balances.reduce(
        (a: number, b: any) => a + Number(b.available_balance || 0),
        0,
      );

      setStats({
        users: profiles.length,
        tournaments: tournaments.length,
        registrations: regs.length,
        battleCodes: codes.length,
        redemptions: reds.length + regs.filter((r: any) => r.referral_code_used).length,
        walletDeposits: totalDep,
        walletWithdrawals: totalWith,
        walletAvailable: totalAvail,
      });

      // ---- Users table ----
      const regsByUser = new Map<string, number>();
      regs.forEach((r: any) =>
        regsByUser.set(r.user_id, (regsByUser.get(r.user_id) || 0) + 1),
      );
      const balanceByUser = new Map<string, number>();
      balances.forEach((b: any) =>
        balanceByUser.set(
          b.user_id,
          (balanceByUser.get(b.user_id) || 0) + Number(b.available_balance || 0),
        ),
      );
      setUsers(
        profiles.map((p: any) => ({
          user_id: p.user_id,
          email: p.email,
          username: p.username,
          display_name: p.display_name,
          phone_number: p.phone_number,
          referral_code: p.referral_code,
          created_at: p.created_at,
          available_balance: balanceByUser.get(p.user_id) || 0,
          registrations_count: regsByUser.get(p.user_id) || 0,
        })),
      );

      // ---- Registrations ----
      setRegistrations(
        regs.map((r: any) => {
          const userP: any = profileMap.get(r.user_id);
          const referrerP: any = r.referrer_user_id
            ? profileMap.get(r.referrer_user_id)
            : null;
          return {
            id: r.id,
            player_name: r.player_name,
            game_id: r.game_id,
            payment_status: r.payment_status,
            payment_amount: r.payment_amount,
            created_at: r.created_at,
            referral_code_used: r.referral_code_used,
            tournament_name: tournamentMap.get(r.tournament_id) || '—',
            user_email: userP?.email || null,
            referrer_name: referrerP
              ? referrerP.display_name || referrerP.username || referrerP.email
              : null,
          };
        }),
      );

      // ---- Redemptions (wallet bonus via redeem_battle_code RPC) ----
      const walletRedemptions: RedemptionRow[] = reds.map((r: any) => {
        const userP: any = profileMap.get(r.user_id);
        const code: any = codeMap.get(r.code_id);
        const ownerP: any = code?.created_by_user_id
          ? profileMap.get(code.created_by_user_id)
          : null;
        return {
          id: `red-${r.id}`,
          amount: Number(r.amount),
          mode: r.mode,
          redeemed_at: r.redeemed_at,
          code: code?.code || '—',
          user_email: userP?.email || null,
          user_name:
            userP?.display_name || userP?.username || userP?.email || null,
          owner_name: ownerP
            ? ownerP.display_name || ownerP.username || ownerP.email
            : null,
          owner_email: ownerP?.email || null,
          owner_phone: ownerP?.phone_number || null,
          owner_user_id: ownerP?.user_id || null,
          source: 'Wallet Bonus',
        };
      });

      // ---- Tournament registration battle code usages ----
      const codeByText = new Map<string, any>();
      codes.forEach((c: any) =>
        codeByText.set(String(c.code).toUpperCase().trim(), c),
      );
      const profileByReferral = new Map<string, any>();
      profiles.forEach((p: any) => {
        if (p.referral_code)
          profileByReferral.set(
            String(p.referral_code).toUpperCase().trim(),
            p,
          );
      });

      const regUsages: RedemptionRow[] = regs
        .filter((r: any) => r.referral_code_used)
        .map((r: any) => {
          const userP: any = profileMap.get(r.user_id);
          const codeKey = String(r.referral_code_used).toUpperCase().trim();
          const bc = codeByText.get(codeKey);
          let ownerP: any = null;
          if (r.referrer_user_id) ownerP = profileMap.get(r.referrer_user_id);
          if (!ownerP && bc?.created_by_user_id)
            ownerP = profileMap.get(bc.created_by_user_id);
          if (!ownerP) ownerP = profileByReferral.get(codeKey);
          return {
            id: `reg-${r.id}`,
            amount: Number(r.payment_amount || 0),
            mode: 'esports',
            redeemed_at: r.created_at,
            code: r.referral_code_used,
            user_email: userP?.email || null,
            user_name:
              userP?.display_name || userP?.username || userP?.email || null,
            owner_name: ownerP
              ? ownerP.display_name || ownerP.username || ownerP.email
              : null,
            owner_email: ownerP?.email || null,
            owner_phone: ownerP?.phone_number || null,
            owner_user_id: ownerP?.user_id || null,
            source: 'Tournament Discount',
          };
        });

      const combined = [...walletRedemptions, ...regUsages].sort(
        (a, b) =>
          new Date(b.redeemed_at).getTime() - new Date(a.redeemed_at).getTime(),
      );
      setRedemptions(combined);

      // ---- Transactions ----
      setTransactions(
        txns.map((t: any) => {
          const userP: any = profileMap.get(t.user_id);
          return {
            id: t.id,
            transaction_type: t.transaction_type,
            amount: Number(t.amount),
            status: t.status,
            payment_method: t.payment_method,
            mode: t.mode,
            created_at: t.created_at,
            user_email: userP?.email || null,
          };
        }),
      );
    } catch (e) {
      console.error('Failed to load admin details', e);
    } finally {
      setLoading(false);
    }
  };

  const q = search.trim().toLowerCase();
  const filter = <T extends Record<string, any>>(rows: T[]) =>
    q
      ? rows.filter((r) =>
          Object.values(r).some((v) =>
            String(v ?? '').toLowerCase().includes(q),
          ),
        )
      : rows;

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8 flex items-center justify-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2 text-purple-400" />
          Loading all details...
        </CardContent>
      </Card>
    );
  }

  const statusBadge = (s: string | null) => {
    const map: Record<string, string> = {
      approved: 'bg-green-500',
      completed: 'bg-green-500',
      confirmed: 'bg-green-500',
      pending: 'bg-yellow-500',
      rejected: 'bg-red-500',
      failed: 'bg-red-500',
    };
    return <Badge className={map[s || ''] || 'bg-gray-500'}>{s || 'unknown'}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-500/30">
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 text-blue-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">{stats?.users}</div>
            <div className="text-blue-300 text-xs">Users</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-500/30">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 text-purple-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">{stats?.tournaments}</div>
            <div className="text-purple-300 text-xs">Tournaments</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 border-emerald-500/30">
          <CardContent className="p-4 text-center">
            <ClipboardList className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">{stats?.registrations}</div>
            <div className="text-emerald-300 text-xs">Registrations</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-pink-900/50 to-pink-800/50 border-pink-500/30">
          <CardContent className="p-4 text-center">
            <Ticket className="w-6 h-6 text-pink-400 mx-auto mb-1" />
            <div className="text-2xl font-bold text-white">
              {stats?.battleCodes} / {stats?.redemptions}
            </div>
            <div className="text-pink-300 text-xs">Codes / Redemptions</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500/30 col-span-2">
          <CardContent className="p-4 text-center">
            <Wallet className="w-6 h-6 text-green-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">
              {formatINR(stats?.walletDeposits || 0)}
            </div>
            <div className="text-green-300 text-xs">Total Deposits</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-500/30">
          <CardContent className="p-4 text-center">
            <Wallet className="w-6 h-6 text-red-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">
              {formatINR(stats?.walletWithdrawals || 0)}
            </div>
            <div className="text-red-300 text-xs">Total Withdrawals</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-900/50 to-amber-800/50 border-amber-500/30">
          <CardContent className="p-4 text-center">
            <Wallet className="w-6 h-6 text-amber-400 mx-auto mb-1" />
            <div className="text-xl font-bold text-white">
              {formatINR(stats?.walletAvailable || 0)}
            </div>
            <div className="text-amber-300 text-xs">User Balances</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search across all tables..."
          className="pl-9 bg-gray-800 border-gray-700 text-white"
        />
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="bg-gray-800/50 border border-gray-700 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="redemptions">Battle Code Redemptions</TabsTrigger>
          <TabsTrigger value="transactions">Wallet Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">All Users ({users.length})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Email</TableHead>
                    <TableHead className="text-gray-300">Phone</TableHead>
                    <TableHead className="text-gray-300">Referral</TableHead>
                    <TableHead className="text-gray-300 text-right">Balance</TableHead>
                    <TableHead className="text-gray-300 text-right">Regs</TableHead>
                    <TableHead className="text-gray-300">Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filter(users).map((u) => (
                    <TableRow key={u.user_id} className="border-gray-700">
                      <TableCell className="text-white">
                        {u.display_name || u.username || '—'}
                      </TableCell>
                      <TableCell className="text-gray-300">{u.email || '—'}</TableCell>
                      <TableCell className="text-gray-300">
                        {u.phone_number || '—'}
                      </TableCell>
                      <TableCell className="text-purple-300 font-mono text-xs">
                        {u.referral_code || '—'}
                      </TableCell>
                      <TableCell className="text-emerald-300 text-right">
                        {formatINR(u.available_balance)}
                      </TableCell>
                      <TableCell className="text-gray-300 text-right">
                        {u.registrations_count}
                      </TableCell>
                      <TableCell className="text-gray-400 text-xs">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                All Registrations ({registrations.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Player</TableHead>
                    <TableHead className="text-gray-300">Email</TableHead>
                    <TableHead className="text-gray-300">Tournament</TableHead>
                    <TableHead className="text-gray-300">Game ID</TableHead>
                    <TableHead className="text-gray-300 text-right">Amount</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Battle Code</TableHead>
                    <TableHead className="text-gray-300">Code Owner</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filter(registrations).map((r) => (
                    <TableRow key={r.id} className="border-gray-700">
                      <TableCell className="text-white">{r.player_name}</TableCell>
                      <TableCell className="text-gray-300">
                        {r.user_email || '—'}
                      </TableCell>
                      <TableCell className="text-purple-300">
                        {r.tournament_name}
                      </TableCell>
                      <TableCell className="text-gray-300 font-mono text-xs">
                        {r.game_id}
                      </TableCell>
                      <TableCell className="text-emerald-300 text-right">
                        {r.payment_amount ? formatINR(r.payment_amount) : '—'}
                      </TableCell>
                      <TableCell>{statusBadge(r.payment_status)}</TableCell>
                      <TableCell className="font-mono text-pink-300 text-xs">
                        {r.referral_code_used || '—'}
                      </TableCell>
                      <TableCell className="text-emerald-300 text-xs">
                        {r.referrer_name || '—'}
                      </TableCell>
                      <TableCell className="text-gray-400 text-xs">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleString()
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redemptions">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Battle Code Redemptions ({redemptions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Code</TableHead>
                    <TableHead className="text-gray-300">Source</TableHead>
                    <TableHead className="text-gray-300">Used By</TableHead>
                    <TableHead className="text-gray-300">Email</TableHead>
                    <TableHead className="text-gray-300">Code Owner</TableHead>
                    <TableHead className="text-gray-300 text-right">Amount</TableHead>
                    <TableHead className="text-gray-300">Mode</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filter(redemptions).map((r) => (
                    <TableRow key={r.id} className="border-gray-700">
                      <TableCell className="font-mono text-pink-300">{r.code}</TableCell>
                      <TableCell>
                        <Badge className={r.source === 'Wallet Bonus' ? 'bg-purple-600' : 'bg-blue-600'}>
                          {r.source}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-white">
                        {r.user_name || '—'}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {r.user_email || '—'}
                      </TableCell>
                      <TableCell className="text-emerald-300">
                        <div className="font-medium">{r.owner_name || '—'}</div>
                        {r.owner_email && (
                          <div className="text-xs text-gray-400">{r.owner_email}</div>
                        )}
                        {r.owner_phone && (
                          <div className="text-xs text-gray-400">📞 {r.owner_phone}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-emerald-300 text-right">
                        {formatINR(r.amount)}
                      </TableCell>
                      <TableCell className="text-gray-300 capitalize">
                        {r.mode}
                      </TableCell>
                      <TableCell className="text-gray-400 text-xs">
                        {new Date(r.redeemed_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {r.owner_user_id ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-emerald-500 text-emerald-300 hover:bg-emerald-500/10"
                            onClick={() => setCreditTarget(r)}
                          >
                            <Wallet className="w-3 h-3 mr-1" /> Credit
                          </Button>
                        ) : (
                          <span className="text-gray-500 text-xs">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">
                Wallet Transactions ({transactions.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300 text-right">Amount</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Method</TableHead>
                    <TableHead className="text-gray-300">Mode</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filter(transactions).map((t) => (
                    <TableRow key={t.id} className="border-gray-700">
                      <TableCell className="text-gray-300 text-xs">
                        {t.user_email || '—'}
                      </TableCell>
                      <TableCell className="text-white capitalize">
                        {t.transaction_type.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell className="text-emerald-300 text-right">
                        {formatINR(t.amount)}
                      </TableCell>
                      <TableCell>{statusBadge(t.status)}</TableCell>
                      <TableCell className="text-gray-300 text-xs">
                        {t.payment_method || '—'}
                      </TableCell>
                      <TableCell className="text-gray-300 capitalize">
                        {t.mode}
                      </TableCell>
                      <TableCell className="text-gray-400 text-xs">
                        {new Date(t.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!creditTarget} onOpenChange={(o) => !o && setCreditTarget(null)}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Credit Wallet</DialogTitle>
          </DialogHeader>
          {creditTarget && (
            <div className="space-y-3">
              <div className="text-sm text-gray-300 space-y-1 bg-gray-800 p-3 rounded">
                <div><span className="text-gray-400">Owner:</span> {creditTarget.owner_name}</div>
                {creditTarget.owner_email && <div><span className="text-gray-400">Email:</span> {creditTarget.owner_email}</div>}
                {creditTarget.owner_phone && <div><span className="text-gray-400">Phone:</span> {creditTarget.owner_phone}</div>}
                <div><span className="text-gray-400">Code:</span> <span className="font-mono text-pink-300">{creditTarget.code}</span></div>
              </div>
              <div>
                <Label className="text-gray-300">Amount (₹)</Label>
                <Input
                  type="number"
                  min="1"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  placeholder="10"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              <div>
                <Label className="text-gray-300">Note (optional)</Label>
                <Input
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  placeholder="Refer & Earn manual credit"
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditTarget(null)} disabled={crediting}>
              Cancel
            </Button>
            <Button onClick={handleCredit} disabled={crediting} className="bg-emerald-600 hover:bg-emerald-700">
              {crediting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Wallet className="w-4 h-4 mr-1" />}
              Credit Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllDetailsAdmin;
