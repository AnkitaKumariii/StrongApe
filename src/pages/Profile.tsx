import { Layout } from "@/components/layout/Layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { StreakBadge } from "@/components/domain/StreakBadge"
import { XPProgress } from "@/components/domain/XPProgress"
import { Settings, Edit2, MapPin, Calendar, Award } from "lucide-react"

export function Profile() {
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
                <AvatarFallback className="bg-primary text-white text-4xl font-black">A</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-black text-slate-900">Ankit</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm font-semibold text-slate-500">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Mumbai, IN</span>
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined Mar 2026</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-full font-bold border-slate-200 gap-2">
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
                  Software engineer by day, aspiring powerlifter by night. Looking for a training partner who is serious about hitting PRs and staying consistent. Usually train at 6AM.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1 text-xs shadow-none">Strength Training</Badge>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1 text-xs shadow-none">Powerlifting</Badge>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 font-bold px-3 py-1 text-xs shadow-none">Morning Crew</Badge>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col gap-4">
                <StreakBadge days={24} active className="w-full justify-center py-3 bg-white" />
                <XPProgress currentXP={4200} maxXP={5000} level={24} />
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
          </TabsList>
          
          <TabsContent value="workouts" className="mt-8 space-y-6">
            <Card className="border-slate-200 text-center py-12 bg-slate-50/50">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">No workouts logged yet</h3>
              <p className="text-slate-500 font-medium mb-6">Start logging your workouts to see them here.</p>
              <Button className="rounded-full font-bold px-8 shadow-lg shadow-primary/20">Log Workout</Button>
            </Card>
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { name: "First Step", desc: "Logged first workout", icon: "🥉", unlocked: true },
                { name: "Consistent", desc: "7 day streak", icon: "🔥", unlocked: true },
                { name: "Dedicated", desc: "30 day streak", icon: "🦍", unlocked: false },
                { name: "Social Butterfly", desc: "Connected with 5 apes", icon: "🤝", unlocked: true },
              ].map(badge => (
                <Card key={badge.name} className={`border-slate-200 text-center p-6 ${!badge.unlocked ? 'opacity-50 grayscale' : ''}`}>
                  <div className="text-4xl mb-3">{badge.icon}</div>
                  <div className="font-bold text-sm text-slate-900 mb-1">{badge.name}</div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase">{badge.desc}</div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
