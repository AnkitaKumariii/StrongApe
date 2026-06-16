import { useState, useEffect } from "react"
import { Layout } from "@/components/layout/Layout"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Flame, MapPin } from "lucide-react"
import { api } from "@/lib/api"

interface LeaderboardUser {
  id: number;
  username: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
  xp: number;
  current_streak: number;
  gym_name: string | null;
}

export function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await api.get<LeaderboardUser[]>("/api/users/leaderboard?limit=25");
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="font-black text-slate-400 text-sm">{rank}</span>;
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Trophy className="w-8 h-8 text-primary" />
            Leaderboard
          </h1>
          <p className="text-slate-500 font-medium">Top performing apes in the StrongApe network.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium">Loading leaderboard...</div>
      ) : users.length === 0 ? (
        <Card className="border-slate-200 text-center py-12 bg-slate-50/50">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-2">Leaderboard is empty</h3>
            <p className="text-slate-500 font-medium">Start training and earning XP to be the first on the board!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-3xl mx-auto space-y-4">
          {users.map((item, idx) => {
            const rank = idx + 1;
            return (
              <Card 
                key={item.id} 
                className={`border-slate-200 transition-all duration-200 hover:shadow-sm ${
                  rank === 1 ? 'bg-gradient-to-r from-amber-50/30 to-transparent border-amber-200' :
                  rank === 2 ? 'bg-gradient-to-r from-slate-50 to-transparent border-slate-200' :
                  rank === 3 ? 'bg-gradient-to-r from-orange-50/20 to-transparent border-orange-200' : 'bg-white'
                }`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Rank column */}
                  <div className="w-10 flex items-center justify-center font-bold">
                    {getRankIcon(rank)}
                  </div>

                  {/* Avatar fallback */}
                  <Avatar className="w-12 h-12 flex-shrink-0 shadow-sm">
                    <AvatarFallback className={`${
                      rank === 1 ? 'bg-amber-500 text-white' :
                      rank === 2 ? 'bg-slate-400 text-white' :
                      rank === 3 ? 'bg-orange-600 text-white' : 'bg-primary text-white'
                    } font-black`}>
                      {item.full_name ? item.full_name.charAt(0).toUpperCase() : item.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Profile info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 truncate">
                      {item.full_name || item.username}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500 font-semibold">
                      <span>Level {item.level}</span>
                      <span className="opacity-50">•</span>
                      <span className="flex items-center gap-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {item.gym_name || "No gym set"}
                      </span>
                    </div>
                  </div>

                  {/* Stats column */}
                  <div className="flex items-center gap-6 text-right">
                    {item.current_streak > 0 && (
                      <div className="hidden sm:flex items-center gap-1 text-orange-600 font-bold bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 text-xs">
                        <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-600" />
                        {item.current_streak}d streak
                      </div>
                    )}
                    <div className="text-right">
                      <div className="text-base font-black text-slate-900">{item.xp.toLocaleString()}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">XP</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </Layout>
  )
}
