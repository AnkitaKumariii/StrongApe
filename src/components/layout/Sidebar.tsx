import { Link, useLocation } from "react-router-dom"
import { Home, Users, MapPin, MessageSquare, Award, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Users, label: "Communities", href: "/communities" },
  { icon: MapPin, label: "Nearby Apes", href: "/nearby" },
  { icon: MessageSquare, label: "Messages", href: "/messages", badge: "2" },
  { icon: Award, label: "Leaderboard", href: "/leaderboard" },
]

interface SidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const location = useLocation()

  return (
    <aside className={cn(
      "fixed left-0 top-0 bottom-0 bg-white flex flex-col z-50 text-slate-900 border-r border-slate-200 transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute -right-3 top-8 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-colors z-50"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}

      <div className={cn("border-b border-slate-100 flex items-center", isCollapsed ? "p-4 justify-center" : "p-6 gap-3")}>
        <div className="w-10 h-10 min-w-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0"/>
            <path d="M3 19c0-4 9-4 9-4s9 0 9 4"/>
          </svg>
        </div>
        {!isCollapsed && <span className="font-bold text-xl text-slate-900 tracking-tight whitespace-nowrap overflow-hidden">StrongApe</span>}
      </div>

      <nav className="flex-1 p-4 overflow-y-auto space-y-1">
        {!isCollapsed && (
          <div className="px-3 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap overflow-hidden">
            Main Menu
          </div>
        )}
        {isCollapsed && <div className="h-4"></div>}
        
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center rounded-xl text-sm font-medium transition-all duration-200",
                isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                isActive 
                  ? "bg-primary/10 text-primary border-l-2 border-primary" 
                  : "hover:bg-slate-50 hover:text-slate-900 text-slate-500 border-l-2 border-transparent"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.label}</span>}
              {!isCollapsed && item.badge && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  {item.badge}
                </span>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={cn("p-4 border-t border-slate-100", isCollapsed ? "flex justify-center" : "")}>
        <Link 
          to="/profile" 
          title={isCollapsed ? "Profile" : undefined}
          className={cn("flex items-center hover:bg-slate-50 transition-colors", isCollapsed ? "justify-center p-0 rounded-full" : "gap-3 p-3 rounded-xl")}
        >
          <Avatar className="shrink-0">
            <AvatarFallback className="bg-primary text-white font-bold">A</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="text-sm font-semibold text-slate-900 truncate">Ankit</div>
              <div className="text-xs text-slate-500 truncate">Level 24</div>
            </div>
          )}
        </Link>
      </div>
    </aside>
  )
}
