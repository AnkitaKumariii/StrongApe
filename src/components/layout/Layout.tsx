import { TopNav } from "./TopNav"
import { Sidebar } from "./Sidebar"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 pl-[88px]">
        <TopNav />
        <main className="flex-1 pt-16 pb-12 px-4 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="py-8 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
