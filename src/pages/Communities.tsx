import { Layout } from "@/components/layout/Layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, Plus } from "lucide-react"

export function Communities() {
  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Communities</h1>
          <p className="text-slate-500 font-medium">Join groups that match your training style.</p>
        </div>
        <Button className="rounded-full font-bold shadow-lg shadow-primary/20 gap-2">
          <Plus className="w-4 h-4" />
          Create Community
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search communities by name, sport, or goal..." 
            className="pl-9 h-12 rounded-xl border-slate-200 bg-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          <Button variant="secondary" className="rounded-full whitespace-nowrap">My Groups</Button>
          <Button variant="outline" className="rounded-full whitespace-nowrap">Powerlifting</Button>
          <Button variant="outline" className="rounded-full whitespace-nowrap">Running</Button>
          <Button variant="outline" className="rounded-full whitespace-nowrap">CrossFit</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: "Morning Lifters", members: "1.2k", type: "General Fitness", active: true },
          { name: "Powerlifting India", members: "8.4k", type: "Strength", active: false },
          { name: "5K Every Day", members: "3.2k", type: "Cardio", active: true },
          { name: "Calisthenics Pros", members: "840", type: "Bodyweight", active: false },
          { name: "Yoga & Mobility", members: "4.5k", type: "Recovery", active: false },
          { name: "Hyrox Training", members: "1.1k", type: "Hybrid", active: true },
        ].map((community) => (
          <Card key={community.name} className="border-slate-200 hover:shadow-md transition-all cursor-pointer group">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">{community.name}</h3>
              <p className="text-sm font-semibold text-slate-500 mb-4">{community.type}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-200"></div>
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-300"></div>
                    <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-400"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{community.members}</span>
                </div>
                {community.active ? (
                  <Button size="sm" variant="outline" className="rounded-full border-primary text-primary hover:bg-primary/5">Joined</Button>
                ) : (
                  <Button size="sm" className="rounded-full">Join</Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  )
}
