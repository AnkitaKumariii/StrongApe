import { Layout } from "@/components/layout/Layout"

import { Button } from "@/components/ui/button"
import { UserCard } from "@/components/domain/UserCard"
import { Map, List, SlidersHorizontal } from "lucide-react"

export function Nearby() {
  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Nearby Apes</h1>
          <p className="text-slate-500 font-medium">Find gym partners in your area.</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full">
          <Button variant="ghost" className="rounded-full bg-white shadow-sm h-8 px-4 text-xs">
            <List className="w-4 h-4 mr-2" />
            List
          </Button>
          <Button variant="ghost" className="rounded-full h-8 px-4 text-xs text-slate-500 hover:text-slate-900">
            <Map className="w-4 h-4 mr-2" />
            Map
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="text-sm font-bold text-slate-900">24 active partners near you</div>
        <Button variant="outline" size="sm" className="rounded-full gap-2 border-slate-200">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UserCard name="Rahul M." initials="R" level={24} distance="1.2 km" tags={["Strength", "6AM", "Intermediate"]} active />
        <UserCard name="Sneha R." initials="S" level={31} distance="2.1 km" tags={["Powerlifting", "Evening", "Advanced"]} active />
        <UserCard name="Karan S." initials="K" level={18} distance="2.4 km" tags={["Cardio", "Morning", "Beginner"]} />
        <UserCard name="Arjun P." initials="A" level={42} distance="3.8 km" tags={["CrossFit", "Flexible", "Advanced"]} />
        <UserCard name="Vikas M." initials="V" level={12} distance="4.2 km" tags={["Bodyweight", "Evening"]} active />
        <UserCard name="Priya T." initials="P" level={28} distance="5.0 km" tags={["Yoga", "Morning", "Intermediate"]} />
      </div>

      <div className="mt-8 text-center">
        <Button variant="outline" className="rounded-full border-slate-200 font-bold px-8">
          Load More
        </Button>
      </div>
    </Layout>
  )
}
