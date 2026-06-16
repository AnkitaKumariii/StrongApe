import { Link, useLocation } from "react-router-dom"
import { Home, Users, PlusCircle, MessageSquare, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Users, label: "Communities", href: "/communities" },
  { icon: PlusCircle, label: "Post", href: "/post", primary: true },
  { icon: MessageSquare, label: "Messages", href: "/messages" },
  { icon: User, label: "Profile", href: "/profile" },
]

export function MobileNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around z-50 px-2 pb-safe">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href

        if (item.primary) {
          return (
            <Link key={item.href} to={item.href} className="relative -top-5">
              <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                <item.icon className="w-6 h-6" />
              </div>
            </Link>
          )
        }

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors",
              isActive ? "text-primary" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
