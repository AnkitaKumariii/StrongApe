import { useState, useEffect } from "react"
import { Layout } from "@/components/layout/Layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StreakBadge } from "@/components/domain/StreakBadge"
import { XPProgress } from "@/components/domain/XPProgress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Settings, Edit2, MapPin, Calendar, Award, Activity, Target, Scale, Ruler, Utensils, Coffee, Candy, ShieldAlert } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

interface PostAuthor {
  id: number;
  username: string;
  full_name: string;
}

interface Post {
  id: number;
  content: string;
  post_type: string;
  created_at: string;
  author: PostAuthor;
  post_metadata: {
    duration: number;
    intensity: string;
    streak: number;
    xp_gained: number;
  } | null;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function Profile() {
  const { user, updateProfile } = useAuth();
  
  // Profile state and lists
  const [workouts, setWorkouts] = useState<Post[]>([]);
  const [loadingWorkouts, setLoadingWorkouts] = useState(true);

  // Edit Profile dialog states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [gymName, setGymName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const fetchUserWorkouts = async () => {
    try {
      setLoadingWorkouts(true);
      const data = await api.get<Post[]>("/api/posts?limit=100");
      // Filter posts belonging to current user that are workout checkins
      const userWorkouts = data.filter(
        (p) => p.author.id === user?.id && p.post_type === "check_in"
      );
      setWorkouts(userWorkouts);
    } catch (err) {
      console.error("Failed to fetch workouts:", err);
    } finally {
      setLoadingWorkouts(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchUserWorkouts();
    }
  }, [user?.id]);

  const openEditDialog = () => {
    setFullName(user?.full_name || "");
    setGymName(user?.gym_name || "");
    setLat(user?.location_lat !== null ? String(user?.location_lat) : "");
    setLon(user?.location_lon !== null ? String(user?.location_lon) : "");
    setEditError("");
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError("");
    setEditLoading(true);

    try {
      const latVal = lat.trim() ? parseFloat(lat) : null;
      const lonVal = lon.trim() ? parseFloat(lon) : null;

      if ((latVal !== null && isNaN(latVal)) || (lonVal !== null && isNaN(lonVal))) {
        throw new Error("Coordinates must be valid numbers.");
      }

      await updateProfile({
        full_name: fullName,
        gym_name: gymName || null || undefined,
        location_lat: latVal !== null ? latVal : undefined,
        location_lon: lonVal !== null ? lonVal : undefined,
      });

      setIsEditOpen(false);
    } catch (err: any) {
      setEditError(err.message || "Failed to update profile.");
    } finally {
      setEditLoading(false);
    }
  };

  const level = user?.level || 1;
  const currentXP = user?.xp ? (user.xp % 1000) : 0;
  const maxXP = 1000;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden mb-8 shadow-sm">
          <div className="h-banner bg-gradient-to-r from-primary to-blue-400 relative">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
          <div className="px-8 pb-8 relative">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-16 mb-6">
              <Avatar className="w-32 h-32 z-10 shadow-md">
                <AvatarFallback className="bg-primary text-white text-4xl font-black">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900">
                      {user?.full_name || user?.username}
                    </h1>
                    <div className="flex items-center gap-4 mt-2 text-sm font-semibold text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> 
                        {user?.gym_name || "No gym set"}
                        {user?.location_lat && ` (${user.location_lat.toFixed(2)}, ${user.location_lon?.toFixed(2)})`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> 
                        Joined {user?.created_at ? formatDate(user.created_at) : "Recently"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={openEditDialog} variant="outline" className="rounded-full font-bold border-slate-200 gap-2 cursor-pointer">
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <p className="text-slate-600 leading-relaxed font-medium">
                  Active StrongApe member training daily to hit consistency goals and climb the leaderboards.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1 text-xs shadow-none">Strength Training</Badge>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1 text-xs shadow-none">Powerlifting</Badge>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1 text-xs shadow-none">Morning Crew</Badge>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-4">
                <StreakBadge days={user?.current_streak || 0} active={user?.current_streak ? user.current_streak > 0 : false} className="w-full justify-center py-3 bg-white" />
                <XPProgress currentXP={currentXP} maxXP={maxXP} level={level} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="workouts" className="w-full">
          <TabsList className="w-full justify-start h-14 bg-transparent border-b border-slate-200 rounded-none p-0 space-x-6">
            <TabsTrigger value="workouts" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-bold text-base data-[state=active]:text-primary text-slate-500">
              Workouts
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-bold text-base data-[state=active]:text-primary text-slate-500">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-bold text-base data-[state=active]:text-primary text-slate-500">
              Stats
            </TabsTrigger>
            <TabsTrigger value="fitness_profile" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 h-full font-bold text-base data-[state=active]:text-primary text-slate-500">
              Fitness Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workouts" className="mt-8 space-y-6">
            {loadingWorkouts ? (
              <div className="text-center py-12 text-slate-400 font-medium">Loading workouts...</div>
            ) : workouts.length === 0 ? (
              <Card className="border-slate-200 text-center py-12 bg-slate-50/50">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">No workouts logged yet</h3>
                <p className="text-slate-500 font-medium mb-6">Start logging your workouts on the dashboard to see them here.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {workouts.map((w) => (
                  <Card key={w.id} className="border-slate-200 p-6 bg-white hover:shadow-sm transition-all rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-base">{w.content}</h4>
                      <p className="text-slate-500 text-xs font-semibold mt-1">
                        Logged on {new Date(w.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      {w.post_metadata?.duration && (
                        <div className="text-sm font-black text-slate-900">
                          {w.post_metadata.duration} mins
                        </div>
                      )}
                      <div className="text-[10px] font-bold text-primary uppercase">
                        +{w.post_metadata?.xp_gained || 200} XP
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="achievements" className="mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { name: "First Step", desc: "Logged first workout", icon: "🥉", unlocked: user?.xp ? user.xp >= 200 : false },
                { name: "Consistent", desc: "7 day streak", icon: "🔥", unlocked: user?.current_streak ? user.current_streak >= 7 : false },
                { name: "Dedicated", desc: "30 day streak", icon: "🦍", unlocked: user?.current_streak ? user.current_streak >= 30 : false },
                { name: "Master Athlete", desc: "Reached Level 5", icon: "🤝", unlocked: user?.level ? user.level >= 5 : false },
              ].map(badge => (
                <Card key={badge.name} className={`border-slate-200 text-center p-6 ${!badge.unlocked ? 'opacity-50 grayscale' : ''}`}>
                  <div className="text-4xl mb-3">{badge.icon}</div>
                  <div className="font-bold text-sm text-slate-900 mb-1">{badge.name}</div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">{badge.desc}</div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200 p-6">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">Total Achievements</h3>
                <div className="text-3xl font-black text-slate-900">
                  {([
                    user?.xp && user.xp >= 200,
                    user?.current_streak && user.current_streak >= 7,
                    user?.current_streak && user.current_streak >= 30,
                    user?.level && user.level >= 5
                  ].filter(Boolean).length)} / 4
                </div>
              </Card>
              <Card className="border-slate-200 p-6">
                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">Total Experience (XP)</h3>
                <div className="text-3xl font-black text-slate-900">{user?.xp || 0} XP</div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fitness_profile" className="mt-8 space-y-6">
            {!user?.settings?.fitness_profile ? (
              <Card className="border-slate-200 text-center py-12 bg-slate-50/50">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">No Fitness Profile setup yet</h3>
                <p className="text-slate-500 font-medium mb-6">Set up your fitness goals and dietary preferences on the dashboard.</p>
              </Card>
            ) : (() => {
              const fp = user.settings.fitness_profile;
              const weightNum = parseFloat(fp.weight);
              const heightNum = parseFloat(fp.height) / 100; // in meters
              const bmi = (weightNum && heightNum) ? (weightNum / (heightNum * heightNum)).toFixed(1) : null;
              
              let bmiCategory = "";
              let bmiColor = "";
              if (bmi) {
                const bmiVal = parseFloat(bmi);
                if (bmiVal < 18.5) { bmiCategory = "Underweight"; bmiColor = "text-yellow-600 bg-yellow-50 border-yellow-100"; }
                else if (bmiVal < 25) { bmiCategory = "Normal"; bmiColor = "text-green-600 bg-green-50 border-green-100"; }
                else if (bmiVal < 30) { bmiCategory = "Overweight"; bmiColor = "text-orange-600 bg-orange-50 border-orange-100"; }
                else { bmiCategory = "Obese"; bmiColor = "text-red-600 bg-red-50 border-red-100"; }
              }

              const goalLabels: Record<string, string> = {
                muscle: "Build Muscle",
                weight: "Lose Weight",
                endurance: "Improve Endurance",
                health: "General Health"
              };

              const eatingStyleLabels: Record<string, string> = {
                "3meals": "3 Meals/Day",
                fasting: "Intermittent Fasting",
                snacking: "Frequent Snacking"
              };

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Physical Metrics & BMI */}
                  <div className="space-y-6">
                    <Card className="border-slate-200 p-6 bg-white rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                      <h3 className="text-base font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-primary" /> Physical Metrics
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="text-xs font-bold text-slate-400 uppercase">Weight</div>
                          <div className="text-2xl font-black text-slate-900 mt-1">{fp.weight} <span className="text-sm font-semibold text-slate-500">kg</span></div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                          <div className="text-xs font-bold text-slate-400 uppercase">Height</div>
                          <div className="text-2xl font-black text-slate-900 mt-1">{fp.height} <span className="text-sm font-semibold text-slate-500">cm</span></div>
                        </div>
                      </div>
                      
                      {bmi && (
                        <div className="border-t border-slate-100 pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-xs font-bold text-slate-400 uppercase">Calculated BMI</div>
                              <div className="text-3xl font-black text-slate-900 mt-1">{bmi}</div>
                            </div>
                            <Badge className={`px-4 py-2 rounded-xl text-sm font-extrabold border shadow-none ${bmiColor}`}>
                              {bmiCategory}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </Card>

                    <Card className="border-slate-200 p-6 bg-white rounded-2xl">
                      <h3 className="text-base font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-primary" /> Dietary Preferences
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                          <span className="font-bold text-slate-600">Meat Consumption</span>
                          <Badge variant="outline" className={`font-extrabold px-3 py-1 text-xs rounded-lg ${fp.dietMeat ? "bg-green-50 text-green-700 border-green-100" : "bg-slate-50 text-slate-600 border-slate-200"}`}>
                            {fp.dietMeat ? "Meat Eater" : "Vegetarian/No Meat"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                          <span className="font-bold text-slate-600">Lactose Tolerance</span>
                          <Badge variant="outline" className={`font-extrabold px-3 py-1 text-xs rounded-lg ${fp.dietLactose ? "bg-red-50 text-red-700 border-red-100" : "bg-green-50 text-green-700 border-green-100"}`}>
                            {fp.dietLactose ? "Lactose Intolerant" : "Lactose Tolerant"}
                          </Badge>
                        </div>
                        <div className="pt-2">
                          <span className="block text-xs font-bold text-slate-400 uppercase mb-3">Allergies</span>
                          {fp.allergies && fp.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {fp.allergies.map((allergy: string) => (
                                <Badge key={allergy} className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-50 font-bold px-3 py-1.5 text-xs rounded-lg shadow-none flex items-center gap-1.5">
                                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-sm font-semibold italic">No known allergies</span>
                          )}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Right Column: Goals & Nutrition */}
                  <div className="space-y-6">
                    <Card className="border-slate-200 p-6 bg-white rounded-2xl">
                      <h3 className="text-base font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" /> Fitness Goal
                      </h3>
                      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                          <Target className="w-8 h-8" />
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase">Primary Goal</div>
                        <div className="text-2xl font-black text-slate-900 mt-1">
                          {goalLabels[fp.primaryGoal] || fp.primaryGoal}
                        </div>
                      </div>
                    </Card>

                    <Card className="border-slate-200 p-6 bg-white rounded-2xl">
                      <h3 className="text-base font-bold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary" /> Lifestyle & Consumption
                      </h3>
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
                            <Utensils className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-400 uppercase">Eating Style</div>
                            <div className="font-bold text-slate-800 mt-0.5">{eatingStyleLabels[fp.eatingStyle] || fp.eatingStyle}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
                            <Coffee className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-400 uppercase">Caffeine Consumption</div>
                            <div className="font-bold text-slate-800 mt-0.5 capitalize">{fp.caffeine}</div>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-500">
                            <Candy className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-400 uppercase">Sugar Consumption</div>
                            <div className="font-bold text-slate-800 mt-0.5 capitalize">{fp.sugar} sugar</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              );
            })()}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:rounded-3xl border-slate-200 max-w-md p-8 bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile</DialogTitle>
            <DialogDescription className="text-slate-500 font-semibold mt-1">
              Update your basic details and gym coordinates.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
            {editError && (
              <div className="p-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
                {editError}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
              <Input
                type="text"
                placeholder="Ankit Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-xl border-slate-200"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Gym Name / Location Label</label>
              <Input
                type="text"
                placeholder="Gold's Gym Mumbai"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                className="h-12 rounded-xl border-slate-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Latitude</label>
                <Input
                  type="text"
                  placeholder="19.0760"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="h-12 rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Longitude</label>
                <Input
                  type="text"
                  placeholder="72.8777"
                  value={lon}
                  onChange={(e) => setLon(e.target.value)}
                  className="h-12 rounded-xl border-slate-200"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20 text-base cursor-pointer"
              disabled={editLoading}
            >
              {editLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  )
}
