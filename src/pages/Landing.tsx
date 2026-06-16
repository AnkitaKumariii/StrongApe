import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function Landing() {
  const { login, register } = useAuth();
  
  // Dialog Open States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Form Fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  // UI States
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail("");
    setUsername("");
    setFullName("");
    setPassword("");
    setError("");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username || email, password);
      setIsLoginOpen(false);
    } catch (err: any) {
      setError(err.message || "Invalid username/email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!email || !username || !fullName || !password) {
        throw new Error("All fields are required.");
      }
      await register(email, username, fullName, password);
      setIsRegisterOpen(false);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-primary/20 overflow-x-hidden font-sans text-slate-900">
      {/* Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <nav className="w-full max-w-5xl h-16 px-6 flex items-center justify-between bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full shadow-sm">
          <button onClick={() => { setIsLoginOpen(false); setIsRegisterOpen(false); }} className="flex items-center gap-2 font-black text-2xl text-slate-900 tracking-tight bg-transparent border-none cursor-pointer">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 6.5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0"/>
                <path d="M3 19c0-4 9-4 9-4s9 0 9 4"/>
              </svg>
            </div>
            StrongApe
          </button>
          <div className="hidden md:flex items-center gap-8 font-semibold text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { resetForm(); setIsLoginOpen(true); }}
              className="hidden md:block font-bold text-slate-600 hover:text-slate-900 transition-colors px-4 cursor-pointer"
            >
              Log In
            </button>
            <Button
              onClick={() => { resetForm(); setIsRegisterOpen(true); }}
              className="rounded-full font-bold px-6 h-11 text-base shadow-lg shadow-primary/20 cursor-pointer"
            >
              Get Started
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
            <Button
              onClick={() => { resetForm(); setIsRegisterOpen(true); }}
              size="lg"
              className="rounded-full font-bold text-lg h-14 px-8 shadow-lg shadow-primary/20 w-full sm:w-auto cursor-pointer"
            >
              Start for Free
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full font-bold text-lg h-14 px-8 border-2 w-full sm:w-auto gap-2"
            >
              <a href="#how-it-works">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
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

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:rounded-3xl border-slate-200 max-w-md p-8 bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Welcome Back</DialogTitle>
            <DialogDescription className="text-slate-500 font-semibold mt-1">
              Log in to your StrongApe account to resume training.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLoginSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="p-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Username or Email</label>
              <Input
                type="text"
                placeholder="ape_warrior"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl border-slate-200"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-slate-200"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20 text-base"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
            <div className="text-center pt-2">
              <p className="text-sm text-slate-500 font-medium">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setIsLoginOpen(false); resetForm(); setIsRegisterOpen(true); }}
                  className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer"
                >
                  Sign Up
                </button>
              </p>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:rounded-3xl border-slate-200 max-w-md p-8 bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Create Account</DialogTitle>
            <DialogDescription className="text-slate-500 font-semibold mt-1">
              Join the crew and start leveling up your fitness.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="p-3 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
              <Input
                type="text"
                placeholder="Ankit Kumar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-xl border-slate-200"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Username</label>
              <Input
                type="text"
                placeholder="ankit_strong"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl border-slate-200"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
              <Input
                type="email"
                placeholder="ankit@strongape.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-slate-200"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-slate-200"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20 text-base"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
            <div className="text-center pt-2">
              <p className="text-sm text-slate-500 font-medium">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => { setIsRegisterOpen(false); resetForm(); setIsLoginOpen(true); }}
                  className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer"
                >
                  Log In
                </button>
              </p>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
