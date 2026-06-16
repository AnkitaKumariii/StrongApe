import { Search, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"

export function TopNav() {
  const { user } = useAuth()
  
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 flex items-center px-4 lg:px-8 gap-4">
      <div className="lg:hidden font-bold text-xl text-slate-900 tracking-tight">
        StrongApe
      </div>
      
      <div className="hidden lg:block font-semibold text-slate-900">
        Welcome back, <span className="text-primary">{user?.full_name?.split(" ")[0] || user?.username || "Ape"}</span>
      </div>

      <div className="flex-1 max-w-md ml-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search apes, communities, or posts..." 
            className="pl-9 bg-slate-50/50 border-slate-200 focus-visible:ring-primary rounded-xl h-10"
          />
        </div>
      </div>

      <div className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 cursor-pointer transition-colors">
        <Bell className="w-5 h-5 text-slate-600" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white"></span>
      </div>
    </header>
  )
}

