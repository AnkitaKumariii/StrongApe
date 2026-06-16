import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { TopNav } from "./TopNav"
import { MobileNav } from "./MobileNav"
import { cn } from "@/lib/utils"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <div className="hidden lg:block">
        <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </div>

      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        isCollapsed ? "lg:ml-20" : "lg:ml-64"
      )}>
        <TopNav />
        <main className="flex-1 pt-16 pb-20 lg:pb-0 px-4 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="py-8 w-full">
            {children}
          </div>
        </main>
      </div>

      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}
