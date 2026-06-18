import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Layout } from "@/components/layout/Layout"
import { XPProgress } from "@/components/domain/XPProgress"
import { UserCard } from "@/components/domain/UserCard"
import { WorkoutPost } from "@/components/domain/WorkoutPost"
import { FitnessProfileSetup } from "@/components/domain/FitnessProfileSetup"
import { PostCarousel } from "@/components/domain/PostCarousel"
import { EncryptedText } from "@/components/ui/encrypted-text"
import { Meteors } from "@/components/ui/meteors"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Link } from "react-router-dom"
import { Trophy, Activity, Target, Flame, Dumbbell, ScanLine, Image as ImageIcon, ListChecks } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

function PostSkeleton() {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm mb-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-200 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-200 rounded w-1/4" />
          <div className="h-2 bg-slate-100 rounded w-1/6" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-slate-200 rounded w-full" />
        <div className="h-3 bg-slate-200 rounded w-5/6" />
        <div className="h-3 bg-slate-200 rounded w-4/6" />
      </div>
      <div className="h-48 bg-slate-100 rounded-xl w-full mb-4" />
      <div className="flex gap-4 border-t border-slate-100 pt-3">
        <div className="h-6 bg-slate-200 rounded w-12" />
        <div className="h-6 bg-slate-200 rounded w-12" />
      </div>
    </div>
  );
}

import { AnimatedTooltip } from "@/components/ui/animated-tooltip"
import { GlowingEffect } from "@/components/ui/glowing-effect"
const GlowingCard = ({ children, className = "", innerClassName = "bg-white" }: { children: React.ReactNode, className?: string, innerClassName?: string }) => {
  return (
    <div className={`group relative rounded-3xl border border-slate-200/50 p-[3px] ${className}`}>
      <GlowingEffect
        blur={0}
        borderWidth={3}
        spread={150}
        glow={true}
        disabled={false}
        proximity={120}
        inactiveZone={0.01}
      />
      <div className={`relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-3px)] shadow-sm z-10 ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
};

const people = [
  {
    id: 1,
    name: "John Doe",
    designation: "Powerlifter",
    image:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
    recentPost: "Just hit a new PR on the deadlift today! 405lbs for 3 reps! Let's go! 🏋️‍♂️🔥"
  },
  {
    id: 2,
    name: "Robert Johnson",
    designation: "Calisthenics",
    image:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    recentPost: "Finally unlocked the full planche after 6 months of training. Consistency is everything. 💪"
  },
  {
    id: 3,
    name: "Jane Smith",
    designation: "CrossFit Athlete",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60",
    recentPost: "Murph challenge completed in 45:12! That was brutal but feeling amazing now. 🏃‍♀️💨"
  },
  {
    id: 4,
    name: "Emily Davis",
    designation: "Yoga Instructor",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGF2YXRhcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
    recentPost: "Morning flow session to start the day. Remember to focus on your breathing today! 🧘‍♀️✨"
  },
  {
    id: 5,
    name: "Tyler Durden",
    designation: "Bodybuilder",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80",
    recentPost: "Chest day complete. The pump was unreal today. Eating 300g of protein to recover. 🦍🥩"
  },
  {
    id: 6,
    name: "Dora",
    designation: "Marathon Runner",
    image:
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3534&q=80",
    recentPost: "Just signed up for the Boston Marathon! Time to start the 16-week prep block. 🏃‍♀️🏅"
  },
];

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
  media_url?: string;
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
  const [visiblePostsCount, setVisiblePostsCount] = useState(5);
  const [isPostFocused, setIsPostFocused] = useState(false);
  const [feedLoading, setFeedLoading] = useState(true);

  const [postContent, setPostContent] = useState("");
  const [postSubmitting, setPostSubmitting] = useState(false);

  // File Upload States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [nearbyLoading, setNearbyLoading] = useState(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!validTypes.includes(file.type) || !["jpg", "jpeg", "png"].includes(ext || "")) {
        setFileError("Only JPG and PNG files are allowed.");
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

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
    if (!postContent.trim() && !selectedFile) return;

    setPostSubmitting(true);
    setFileError(null);
    try {
      let mediaUrl = undefined;

      if (selectedFile) {
        // Upload the file first
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await api.post<{ image_url: string }>("/api/posts/attach-media", formData);
        mediaUrl = uploadRes.image_url;
      }

      const newPost = await api.post<Post>("/api/posts", {
        content: postContent,
        post_type: "regular",
        media_url: mediaUrl
      });
      // Prepend the new post locally to avoid full page refetch
      setPosts([newPost, ...posts]);
      setPostContent("");
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (err: any) {
      console.error("Failed to create post:", err);
      setFileError(err.message || "Failed to create post.");
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
        <Meteors number={25} className="before:from-white bg-white shadow-[0_0_0_1px_#ffffff50]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
              <EncryptedText
                text={`Welcome to StrongApe, ${user?.username || "Ape"}.`}
                encryptedClassName="text-white/40 font-mono"
                revealedClassName="text-white"
                revealDelayMs={80}
              />
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

      <FitnessProfileSetup />

      {/* Features Quick Links */}
      <div className="bg-slate-900 rounded-3xl p-8 mb-12 shadow-lg border border-slate-800">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">
            Everything You Need for <span className="text-primary">Fitness Success</span>
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto font-medium">
            This comprehensive platform combines cutting-edge AI technology with proven fitness science to deliver results that exceed your expectations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Workout Routines */}
          <Link
            to="/workout-routines"
            className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-primary/50 hover:bg-slate-800 transition-all group cursor-pointer block no-underline"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white">Workout Routines</h3>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Access scientifically-designed workout plans that adapt to your fitness level and objectives.
            </p>
          </Link>

          {/* Food Scanner */}
          <Link
            to="/food-scanner"
            className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-primary/50 hover:bg-slate-800 transition-all group cursor-pointer block no-underline"
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
                <ScanLine className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-white">Food Scanner</h3>
            </div>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Scan your meals to get instant nutritional analysis and track your dietary intake effortlessly.
            </p>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-12 max-w-4xl mx-auto w-full">

        {/* Top Section - Feed */}
        <div className="space-y-6 w-full">
          <motion.div
            animate={{
              boxShadow: isPostFocused ? "0 10px 25px -5px rgba(0, 104, 249, 0.15)" : "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
              borderColor: isPostFocused ? "rgba(0, 104, 249, 0.3)" : "rgba(226, 232, 240, 1)",
            }}
            className="rounded-xl bg-white border border-slate-200 transition-colors duration-200"
          >
            <CardContent className="p-4 flex gap-4">
              <Avatar className="w-10 h-10 flex-shrink-0 border-2 border-transparent hover:border-primary transition-all cursor-pointer">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div className="relative">
                    <Input
                      placeholder="Share your workout or ask the community..."
                      className="border-none shadow-none text-base focus-visible:ring-0 px-0 h-10 placeholder:text-slate-400 bg-transparent relative z-10"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      onFocus={() => setIsPostFocused(true)}
                      onBlur={() => setIsPostFocused(false)}
                    />
                    <motion.div
                      initial={false}
                      animate={{ width: isPostFocused || postContent ? "100%" : "0%" }}
                      className="absolute bottom-0 left-0 h-[2px] bg-primary/20 rounded-full origin-left"
                    />
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg, image/jpg"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                  />
                  <AnimatePresence>
                    {previewUrl && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="relative rounded-xl overflow-hidden bg-slate-50 border border-slate-200 max-w-xs group"
                      >
                        <img src={previewUrl} alt="Preview" className="w-full h-auto object-cover max-h-48" />
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          className="absolute top-2 right-2 bg-slate-900/60 hover:bg-slate-900/80 text-white rounded-full p-1.5 cursor-pointer backdrop-blur-sm transition-all"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <AnimatePresence>
                    {fileError && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs font-bold text-red-500 mt-1"
                      >
                        {fileError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <motion.div
                    animate={{ paddingTop: (isPostFocused || postContent || previewUrl) ? 12 : 8 }}
                    className="flex justify-between items-center border-t border-slate-100 transition-all"
                  >
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ backgroundColor: "rgba(241, 245, 249, 1)", color: "rgba(15, 23, 42, 1)" }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="flex items-center gap-2 px-3 py-1.5 text-slate-500 rounded-full font-medium cursor-pointer transition-colors text-sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="w-4 h-4" />
                        Photo
                      </motion.button>
                      <motion.button
                        whileHover={{ backgroundColor: "rgba(241, 245, 249, 1)", color: "rgba(15, 23, 42, 1)" }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        className="flex items-center gap-2 px-3 py-1.5 text-slate-500 rounded-full font-medium transition-colors text-sm"
                      >
                        <ListChecks className="w-4 h-4" />
                        Routine
                      </motion.button>
                    </div>
                    <motion.div
                      animate={{
                        scale: (postContent.trim() || selectedFile) ? 1 : 0.95,
                      }}
                    >
                      <Button
                        type="submit"
                        className={`rounded-full font-bold px-6 cursor-pointer transition-all duration-300 ${(postContent.trim() || selectedFile)
                            ? "bg-primary text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            : "bg-slate-100 text-slate-400"
                          }`}
                        disabled={postSubmitting || (!postContent.trim() && !selectedFile)}
                      >
                        {postSubmitting ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Posting
                          </div>
                        ) : "Post"}
                      </Button>
                    </motion.div>
                  </motion.div>
                </form>
              </div>
            </CardContent>
          </motion.div>

          {/* Active Community Members */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-6 text-center">Active Community Members</h3>
            <div className="flex flex-row items-center justify-center w-full">
              <AnimatedTooltip items={people} />
            </div>
          </div>

          <div className="flex items-center justify-between pb-2">
            <h2 className="font-bold text-lg text-slate-900">Community Feed</h2>
            <div onClick={fetchFeed} className="text-sm font-semibold text-primary cursor-pointer hover:underline">Refresh</div>
          </div>

          <div>
            {feedLoading && posts.length === 0 ? (
              <div className="space-y-4">
                <PostSkeleton />
                <PostSkeleton />
                <PostSkeleton />
              </div>
            ) : posts.length === 0 ? (
              <Card className="border-slate-200 text-center py-12 bg-slate-50/50">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Activity className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">No feed posts yet</h3>
                <p className="text-slate-500 font-medium mb-6">Create the very first post to start the conversation!</p>
              </Card>
            ) : (
              <PostCarousel
                posts={posts.map(post => ({
                  id: post.id,
                  author: post.author.full_name || post.author.username,
                  initials: post.author.full_name
                    ? post.author.full_name.charAt(0).toUpperCase()
                    : post.author.username.charAt(0).toUpperCase(),
                  timeAgo: formatTimeAgo(post.created_at),
                  content: post.content,
                  mediaUrl: post.media_url,
                  likes: post.likes_count,
                  comments: 0,
                  isLiked: post.has_liked,
                }))}
                onLikeToggle={handleLikeToggle}
                loop={false}
              />
            )}
          </div>
        </div>

        {/* Bottom Section - Stats & Recommendations */}
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Left Col - Stats */}
            <div className="space-y-6">
              <GlowingCard innerClassName="bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                <Card className="border-0 bg-transparent text-white overflow-hidden relative shadow-none h-full w-full">
                  <Meteors number={18} className="before:from-primary bg-primary shadow-[0_0_0_1px_#ffffff20]" />
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/20 rounded-full blur-xl"></div>
                  <CardContent className="p-6 relative z-10">
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
              </GlowingCard>

              <GlowingCard>
                <Card className="border-0 shadow-none h-full w-full">
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
              </GlowingCard>
            </div>

            {/* Middle Col - More Stats & Leaderboard */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <GlowingCard>
                  <Card className="border-0 shadow-none text-center p-4 h-full w-full">
                    <Activity className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-black text-slate-900">{user?.level || 1}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Ape Level</div>
                  </Card>
                </GlowingCard>
                <GlowingCard>
                  <Card className="border-0 shadow-none text-center p-4 h-full w-full">
                    <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-black text-slate-900">{user?.settings?.notifications ? "Active" : "Muted"}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase">Alerts</div>
                  </Card>
                </GlowingCard>
              </div>
              <GlowingCard className="mt-8" innerClassName="bg-slate-50">
                <Card className="border-0 shadow-none bg-transparent h-full w-full">
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
              </GlowingCard>
            </div>

            {/* Right Col - Recommendations */}
            <div className="space-y-6">
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
                  <GlowingCard innerClassName="bg-slate-50">
                    <div className="text-slate-500 text-xs font-medium p-4 h-full w-full">
                      Set location in profile to find nearby workout partners.
                    </div>
                  </GlowingCard>
                ) : (
                  nearbyUsers.map(u => (
                    <GlowingCard key={u.id} innerClassName="bg-white">
                      <div className="border-0 p-0 shadow-none h-full w-full">
                        <UserCard
                          name={u.full_name || u.username}
                          initials={u.full_name ? u.full_name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}
                          level={u.level}
                          distance={`${u.distance_km} km`}
                          tags={[u.gym_name || "Gym Athlete"]}
                          active={u.current_streak > 0}
                        />
                      </div>
                    </GlowingCard>
                  ))
                )}
              </div>
            </div>

          </div>
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
