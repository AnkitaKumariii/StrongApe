import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Home, Users, MapPin, MessageSquare, Award, LogOut, LogIn, Bell, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext"
import { MagneticDock, type DockItemData } from "@/components/ui/magnetic-dock"
import { motion } from "framer-motion"

export function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, setIsLoginOpen } = useAuth()
  const [isExpanded, setIsExpanded] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("theme") as "light" | "dark") || "light"
  )

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    localStorage.setItem("theme", theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === "light" ? "dark" : "light")

  const dockItems: DockItemData[] = [
    { 
      id: "home", 
      label: "Home", 
      icon: <Home className="w-full h-full" />, 
      onClick: () => navigate("/"),
      isActive: location.pathname === "/"
    },
    { 
      id: "communities", 
      label: "Communities", 
      icon: <Users className="w-full h-full" />, 
      onClick: () => navigate("/communities"),
      isActive: location.pathname === "/communities"
    },
    { 
      id: "nearby", 
      label: "Nearby Apes", 
      icon: <MapPin className="w-full h-full" />, 
      onClick: () => navigate("/nearby"),
      isActive: location.pathname === "/nearby"
    },
    { 
      id: "chat", 
      label: "Messages", 
      icon: <MessageSquare className="w-full h-full" />, 
      onClick: () => navigate("/messages"),
      isActive: location.pathname === "/messages",
      badge: 2
    },
    { 
      id: "leaderboard", 
      label: "Leaderboard", 
      icon: <Award className="w-full h-full" />, 
      onClick: () => navigate("/leaderboard"),
      isActive: location.pathname === "/leaderboard"
    },
  ]

  return (
    <motion.aside 
      className={cn(
        "fixed left-0 top-0 bottom-0 bg-white dark:bg-slate-900 flex flex-col z-[100] text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 transition-shadow",
        isExpanded ? "shadow-2xl" : "shadow-sm"
      )}
      initial={{ width: 88 }}
      animate={{ width: isExpanded ? 260 : 88 }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className={cn("border-b border-slate-100 dark:border-slate-800 flex items-center overflow-hidden h-[88px] shrink-0", isExpanded ? "p-6 gap-3" : "p-4 justify-center")}>
        <div className="w-10 h-10 min-w-[40px] bg-primary rounded-xl flex items-center justify-center shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0" />
            <path d="M3 19c0-4 9-4 9-4s9 0 9 4" />
          </svg>
        </div>
        {isExpanded && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-xl tracking-tight whitespace-nowrap">StrongApe</motion.span>}
      </div>

      <nav className="flex-1 p-2 overflow-y-auto overflow-x-hidden flex flex-col">
        <MagneticDock 
          items={dockItems}
          iconSize={48}
          maxScale={1.3}
          magneticDistance={150}
          variant="transparent"
          position="left"
          isExpanded={isExpanded}
        />
      </nav>

      <div className={cn("p-4 border-t border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col gap-2 shrink-0")}>
        <div className={cn("flex gap-2 w-full", isExpanded ? "flex-row justify-between" : "flex-col")}>
          <button
            className={cn("relative flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl transition-colors shrink-0", isExpanded ? "w-1/2 h-10" : "w-10 h-10")}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>
          <button
            onClick={toggleTheme}
            className={cn("flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl transition-colors shrink-0", isExpanded ? "w-1/2 h-10" : "w-10 h-10")}
            title="Toggle theme"
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
        
        {user && user.id !== 0 ? (
          <>
            <button 
              onClick={() => navigate("/profile")}
              className={cn("flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full rounded-xl overflow-hidden", isExpanded ? "gap-3 p-3" : "justify-center p-2")}
            >
              <Avatar className="shrink-0 w-10 h-10">
                <AvatarFallback className="bg-primary text-white font-bold">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : "A"}
                </AvatarFallback>
              </Avatar>
              {isExpanded && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-semibold truncate">{user.full_name || user.username || "Ape"}</div>
                  <div className="text-xs text-slate-500 truncate">Level {user.level || 1}</div>
                </motion.div>
              )}
            </button>
            <button
              onClick={logout}
              className={cn(
                "flex items-center text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all duration-200 cursor-pointer w-full text-left border-none bg-transparent overflow-hidden",
                isExpanded ? "gap-3 px-4 py-3 text-sm font-medium" : "justify-center p-3"
              )}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {isExpanded && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Log Out</motion.span>}
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setIsLoginOpen(true)}
              className={cn("flex items-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-full rounded-xl overflow-hidden", isExpanded ? "gap-3 p-3" : "justify-center p-2")}
            >
              <Avatar className="shrink-0 w-10 h-10">
                <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold">
                  G
                </AvatarFallback>
              </Avatar>
              {isExpanded && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-semibold truncate text-slate-600 dark:text-slate-400">Guest Ape</div>
                  <div className="text-xs text-slate-400">Not Signed In</div>
                </motion.div>
              )}
            </button>
            <button
              onClick={() => setIsLoginOpen(true)}
              className={cn(
                "flex items-center text-primary hover:bg-primary/5 rounded-xl transition-all duration-200 cursor-pointer w-full text-left border-none bg-transparent overflow-hidden",
                isExpanded ? "gap-3 px-4 py-3 text-sm font-bold" : "justify-center p-3"
              )}
            >
              <LogIn className="w-5 h-5 shrink-0" />
              {isExpanded && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Sign In</motion.span>}
            </button>
          </>
        )}
      </div>
    </motion.aside>
  )
}
