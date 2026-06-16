import { useState, useEffect } from "react"
import { Layout } from "@/components/layout/Layout"
import { XPProgress } from "@/components/domain/XPProgress"
import { UserCard } from "@/components/domain/UserCard"
import { WorkoutPost } from "@/components/domain/WorkoutPost"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Trophy, Activity, Target, Flame } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

interface PostAuthor {
  id: number;
  username: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
  current_streak: number;
  gym_name: string | null;
}

interface Post {
  id: number;
  content: string;
  post_type: string;
  created_at: string;
  author: PostAuthor;
  likes_count: number;
  has_liked: boolean;
}

interface NearbyUser {
  id: number;
  username: string;
  full_name: string;
  avatar_url: string | null;
  level: number;
  current_streak: number;
  gym_name: string | null;
  distance_km: number;
}

function formatTimeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export function Dashboard() {
  const { user, refreshProfile } = useAuth();
  
  // States
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  
  const [postContent, setPostContent] = useState("");
  const [postSubmitting, setPostSubmitting] = useState(false);

  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(true);

  // Log Workout Modal States
  const [isLogWorkoutOpen, setIsLogWorkoutOpen] = useState(false);
  const [duration, setDuration] = useState("30");
  const [intensity, setIntensity] = useState("Medium");
  const [notes, setNotes] = useState("");
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState("");

  const fetchFeed = async () => {
    try {
      setFeedLoading(true);
      const data = await api.get<Post[]>("/api/posts?limit=20");
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch feed posts:", err);
    } finally {
      setFeedLoading(false);
    }
  };

  const fetchNearby = async () => {
    try {
      setNearbyLoading(true);
      const data = await api.get<NearbyUser[]>("/api/users/nearby?max_distance_km=20");
      setNearbyUsers(data.slice(0, 3)); // Display up to 3 partners in sidebar
    } catch (err) {
      console.error("Failed to fetch nearby users:", err);
    } finally {
      setNearbyLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    fetchNearby();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    setPostSubmitting(true);
    try {
      const newPost = await api.post<Post>("/api/posts", {
        content: postContent,
        post_type: "regular"
      });
      // Prepend the new post locally to avoid full page refetch
      setPosts([newPost, ...posts]);
      setPostContent("");
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleLikeToggle = async (postId: number) => {
    try {
      const response = await api.post<{ liked: boolean; likes_count: number }>(`/api/posts/${postId}/like`);
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? { ...post, has_liked: response.liked, likes_count: response.likes_count }
            : post
        )
      );
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleLogWorkoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLogError("");
    setLogLoading(true);

    try {
      const durationVal = parseInt(duration);
      if (isNaN(durationVal) || durationVal <= 0) {
        throw new Error("Duration must be a positive integer.");
      }

      await api.post("/api/checkin", {
        duration_minutes: durationVal,
        intensity: intensity,
        notes: notes || null
      });

      // Reset fields
      setNotes("");
      setIsLogWorkoutOpen(false);

      // Refresh data
      await refreshProfile();
      await fetchFeed();
    } catch (err: any) {
      setLogError(err.message || "Failed to log check-in. Note: You can only check in once per day!");
    } finally {
      setLogLoading(false);
    }
  };

  // XP progression details
  const level = user?.level || 1;
  const currentXP = user?.xp ? (user.xp % 1000) : 0;
  const maxXP = 1000;

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-blue-400 p-8 md:p-12 mb-8 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
              Ready to crush it, {user?.full_name?.split(" ")[0] || user?.username || "Ape"}?
            </h1>
            <p className="text-white/80 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              Find a training partner and earn XP
            </p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => { setLogError(""); setIsLogWorkoutOpen(true); }} variant="secondary" className="rounded-full font-bold cursor-pointer">
              Log Workout
            </Button>
            <Button asChild variant="outline" className="rounded-full font-bold text-white border-white/20 bg-white/10 hover:bg-white/20">
              <a href="/nearby">Find Partner</a>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Stats */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-slate-200 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Flame className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-3xl font-black">{user?.current_streak || 0}<span className="text-base text-primary ml-1">days</span></div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-primary" />
                XP Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <XPProgress currentXP={currentXP} maxXP={maxXP} level={level} />
              <div className="text-right text-[10px] text-slate-400 font-bold mt-1 uppercase">Total: {user?.xp || 0} XP</div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-slate-200 text-center p-4">
              <Activity className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">{user?.level || 1}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Ape Level</div>
            </Card>
            <Card className="border-slate-200 text-center p-4">
              <Target className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">{user?.settings?.notifications ? "Active" : "Muted"}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Alerts</div>
            </Card>
          </div>
        </div>

        {/* Center Column - Feed */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex gap-4">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarFallback className="bg-primary text-white font-bold">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <Input 
                    placeholder="Share your workout or ask the community..." 
                    className="border-none shadow-none text-base focus-visible:ring-0 px-0"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    required
                  />
                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <div className="flex gap-2">
                      <Button type="button" variant="ghost" size="sm" className="text-slate-500 rounded-full font-medium">Photo</Button>
                      <Button type="button" variant="ghost" size="sm" className="text-slate-500 rounded-full font-medium">Routine</Button>
                    </div>
                    <Button 
                      type="submit" 
                      className="rounded-full font-bold px-6 cursor-pointer" 
                      disabled={postSubmitting || !postContent.trim()}
                    >
                      {postSubmitting ? "Posting..." : "Post"}
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pb-2">
            <h2 className="font-bold text-lg text-slate-900">Community Feed</h2>
            <div onClick={fetchFeed} className="text-sm font-semibold text-primary cursor-pointer hover:underline">Refresh</div>
          </div>

          <div className="space-y-6">
            {feedLoading && posts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-medium">Loading feed...</div>
            ) : posts.length === 0 ? (
              <Card className="border-slate-200 text-center py-12 bg-slate-50/50">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">No feed posts yet</h3>
                <p className="text-slate-500 font-medium mb-6">Create the very first post to start the conversation!</p>
              </Card>
            ) : (
              posts.map((post) => (
                <WorkoutPost 
                  key={post.id}
                  id={post.id}
                  author={post.author.full_name || post.author.username} 
                  initials={post.author.full_name ? post.author.full_name.charAt(0).toUpperCase() : post.author.username.charAt(0).toUpperCase()} 
                  timeAgo={formatTimeAgo(post.created_at)} 
                  content={post.content} 
                  likes={post.likes_count} 
                  comments={0} // Backend doesn't support comments directly yet, defaulting to 0
                  isLiked={post.has_liked}
                  onLikeToggle={handleLikeToggle}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column - Recommendations */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Nearby Partners</h2>
            <Button asChild variant="link" className="text-xs font-bold text-primary p-0 h-auto">
              <a href="/nearby">See all</a>
            </Button>
          </div>
          
          <div className="space-y-3">
            {nearbyLoading ? (
              <div className="text-center py-4 text-xs text-slate-400">Loading partners...</div>
            ) : nearbyUsers.length === 0 ? (
              <div className="text-slate-500 text-xs font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200">
                Set location in profile to find nearby workout partners.
              </div>
            ) : (
              nearbyUsers.map(u => (
                <UserCard 
                  key={u.id}
                  name={u.full_name || u.username} 
                  initials={u.full_name ? u.full_name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()} 
                  level={u.level} 
                  distance={`${u.distance_km} km`} 
                  tags={[u.gym_name || "Gym Athlete"]} 
                  active={u.current_streak > 0} 
                />
              ))
            )}
          </div>

          <Card className="border-slate-200 mt-8 bg-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-900">Leaderboard Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              {[
                { rank: 1, name: "Vikas M.", xp: "9,800" },
                { rank: 2, name: "Arjun P.", xp: "8,400" },
                { rank: 3, name: "Kiran M.", xp: "7,900" }
              ].map((user) => (
                <div key={user.rank} className="flex items-center gap-3">
                  <div className={`w-6 text-center font-black ${user.rank === 1 ? 'text-primary' : user.rank === 2 ? 'text-slate-400' : 'text-slate-600'}`}>{user.rank}</div>
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-slate-200 text-slate-500 font-bold text-xs">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="font-bold text-sm text-slate-900 flex-1">{user.name}</div>
                  <div className="text-xs font-bold text-slate-500">{user.xp}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Log Workout Dialog */}
      <Dialog open={isLogWorkoutOpen} onOpenChange={setIsLogWorkoutOpen}>
        <DialogContent className="sm:rounded-3xl border-slate-200 max-w-md p-8 bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Log Today's Workout</DialogTitle>
            <DialogDescription className="text-slate-500 font-semibold mt-1">
              Check in daily to maintain your streak and earn +200 XP.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogWorkoutSubmit} className="space-y-4 mt-4">
            {logError && (
              <div className="p-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
                {logError}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Duration (Minutes)</label>
              <Input
                type="number"
                min="1"
                max="1440"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="h-12 rounded-xl border-slate-200"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Intensity</label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="w-full h-12 rounded-xl border border-slate-200 px-3 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Workout Notes (Optional)</label>
              <Input
                type="text"
                maxLength={140}
                placeholder="Leg day PR! Felt great."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-12 rounded-xl border-slate-200"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20 text-base cursor-pointer"
              disabled={logLoading}
            >
              {logLoading ? "Logging workout..." : "Log Workout & Earn XP"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
