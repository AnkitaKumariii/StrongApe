import { Layout } from "@/components/layout/Layout"

import { XPProgress } from "@/components/domain/XPProgress"
import { UserCard } from "@/components/domain/UserCard"
import { WorkoutPost } from "@/components/domain/WorkoutPost"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trophy, Activity, Target, Flame } from "lucide-react"

export function Dashboard() {
  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-blue-400 p-8 md:p-12 mb-8 shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
              Ready to crush it, Ankit?
            </h1>
            <p className="text-white/80 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              4 friends are working out right now
            </p>
          </div>
          <div className="flex gap-4">
            <Button variant="secondary" className="rounded-full font-bold">
              Log Workout
            </Button>
            <Button variant="outline" className="rounded-full font-bold text-white border-white/20 bg-white/10 hover:bg-white/20">
              Find Partner
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
                  <div className="text-3xl font-black">24<span className="text-base text-primary ml-1">days</span></div>
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
              <XPProgress currentXP={4200} maxXP={5000} level={24} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-slate-200 text-center p-4">
              <Activity className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">12</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Workouts</div>
            </Card>
            <Card className="border-slate-200 text-center p-4">
              <Target className="w-6 h-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-black text-slate-900">8.4k</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Volume</div>
            </Card>
          </div>
        </div>

        {/* Center Column - Feed */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-4 flex gap-4">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <AvatarFallback className="bg-primary text-white font-bold">A</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <Input placeholder="Share your workout or ask the community..." className="border-none shadow-none text-base focus-visible:ring-0 px-0" />
                <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-slate-500 rounded-full font-medium">Photo</Button>
                    <Button variant="ghost" size="sm" className="text-slate-500 rounded-full font-medium">Routine</Button>
                  </div>
                  <Button className="rounded-full font-bold px-6">Post</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between pb-2">
            <h2 className="font-bold text-lg text-slate-900">Community Feed</h2>
            <div className="text-sm font-semibold text-primary cursor-pointer">Filter</div>
          </div>

          <div className="space-y-6">
            <WorkoutPost
              author="Rahul M."
              initials="R"
              timeAgo="2 hours ago"
              content="Just hit a new PR on deadlifts! 180kg x 3. The consistency is finally paying off. Thanks to the 6AM crew for the spot."
              likes={24}
              comments={5}
              isLiked
            />
            <WorkoutPost
              author="Karan S."
              initials="K"
              timeAgo="4 hours ago"
              content="Light recovery run today. 5km around the park. Getting ready for the weekend challenge."
              likes={12}
              comments={1}
            />
          </div>
        </div>

        {/* Right Column - Recommendations */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-900 uppercase tracking-wider">Nearby Partners</h2>
            <span className="text-xs font-bold text-primary cursor-pointer">See all</span>
          </div>

          <div className="space-y-3">
            <UserCard name="Rahul M." initials="R" level={24} distance="1.2 km" tags={["Strength", "6AM"]} active />
            <UserCard name="Karan S." initials="K" level={18} distance="2.4 km" tags={["Cardio", "Evening"]} />
            <UserCard name="Sneha R." initials="S" level={31} distance="3.1 km" tags={["Powerlifting"]} active />
          </div>

          <Card className="border-slate-200 mt-8 bg-slate-50">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-900">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
    </Layout>
  )
}
