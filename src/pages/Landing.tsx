import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"

export function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary/20 overflow-x-hidden font-sans text-slate-900">
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="w-full max-w-5xl h-16 px-6 flex items-center justify-between bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full shadow-sm">
        <Link to="/" className="flex items-center gap-2 font-black text-2xl text-slate-900 tracking-tight">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 6.5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0"/>
              <path d="M3 19c0-4 9-4 9-4s9 0 9 4"/>
            </svg>
          </div>
          StrongApe
        </Link>
        <div className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden md:block font-bold text-slate-600 hover:text-slate-900 transition-colors px-4">Log In</Link>
          <Button asChild className="rounded-full font-bold px-6 h-11 text-base shadow-lg shadow-primary/20">
            <Link to="/">Get Started</Link>
          </Button>
        </div>
        </nav>
      </div>

      <main>
        {/* Hero */}
        <section className="pt-48 pb-32 px-4 flex flex-col items-center text-center relative max-w-5xl mx-auto">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent blur-3xl"></div>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-primary font-bold text-sm mb-12">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Now in beta — join 12,000+ members
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-8 text-slate-900">
            Train Together. <span className="text-primary">Grow Stronger.</span>
          </h1>
          
          <p className="text-xl text-slate-500 max-w-2xl mb-12 font-medium leading-relaxed">
            Find gym partners near you, build consistency through streaks and challenges, and be part of a fitness community that keeps you accountable.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center justify-center">
            <Button asChild size="lg" className="rounded-full font-bold text-lg h-14 px-8 shadow-lg shadow-primary/20 w-full sm:w-auto">
              <Link to="/">Start for Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full font-bold text-lg h-14 px-8 border-2 w-full sm:w-auto gap-2">
              <a href="#how-it-works">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                See How It Works
              </a>
            </Button>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-slate-900 py-16 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">12K+</div>
              <div className="text-slate-400 font-semibold text-sm uppercase tracking-wider">Active Members</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">48K+</div>
              <div className="text-slate-400 font-semibold text-sm uppercase tracking-wider">Workouts Logged</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">3.2K</div>
              <div className="text-slate-400 font-semibold text-sm uppercase tracking-wider">Partners Matched</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black text-white mb-2">94%</div>
              <div className="text-slate-400 font-semibold text-sm uppercase tracking-wider">Consistency Rate</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
