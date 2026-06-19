import React, { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Sidebar } from "./Sidebar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"


interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { 
    user, 
    loading, 
    login, 
    register, 
    isLoginOpen, 
    setIsLoginOpen, 
    isRegisterOpen, 
    setIsRegisterOpen 
  } = useAuth();

  // Form Fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  // Form Field Touched States
  const [touched, setTouched] = useState({
    fullName: false,
    username: false,
    email: false,
    password: false,
  });

  // UI States
  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Client-side Validations
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isUsernameValid = username.trim().length >= 3;
  const isFullNameValid = fullName.trim().length >= 1;
  const isPasswordValid = password.length >= 6;

  const isFormValid = isEmailValid && isUsernameValid && isFullNameValid && isPasswordValid;

  const resetForm = () => {
    setEmail("");
    setUsername("");
    setFullName("");
    setPassword("");
    setError("");
    setTouched({
      fullName: false,
      username: false,
      email: false,
      password: false,
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);
    try {
      await login(username || email, password);
      setIsLoginOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Invalid username/email or password.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    // Mark all as touched on submit
    setTouched({
      fullName: true,
      username: true,
      email: true,
      password: true,
    });

    if (!isFormValid) {
      setError("Please fix the validation errors before submitting.");
      setFormLoading(false);
      return;
    }

    try {
      await register(email, username, fullName, password);
      setIsRegisterOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 pl-[88px]">
        <main className="flex-1 pt-8 pb-12 px-4 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="py-8 w-full">
            {user && user.id !== 0 ? (
              children
            ) : (
              /* Click capturing preview wrapper */
              <div 
                onClickCapture={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsRegisterOpen(true);
                }}
                className="cursor-pointer select-none opacity-90 filter blur-[0.2px] hover:opacity-95 transition-all duration-300"
              >
                {children}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Global Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:rounded-3xl border-slate-200 dark:border-slate-800 max-w-md p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">Welcome Back</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Log in to your StrongApe account to resume training.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLoginSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="p-3 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Username or Email</label>
              <Input
                type="text"
                placeholder="ape_warrior"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20 text-base"
              disabled={formLoading}
            >
              {formLoading ? "Logging in..." : "Log In"}
            </Button>
            <div className="text-center pt-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
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

      {/* Global Register Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:rounded-3xl border-slate-200 dark:border-slate-800 max-w-md p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">Create Account</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 font-semibold mt-1">
              Join the crew and start leveling up your fitness.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="p-3 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Full Name</label>
              <Input
                type="text"
                placeholder="Ankit Kumar"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setTouched(prev => ({ ...prev, fullName: true }));
                }}
                onBlur={() => setTouched(prev => ({ ...prev, fullName: true }))}
                className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 focus-visible:ring-primary ${touched.fullName && !isFullNameValid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                required
              />
              {touched.fullName && !isFullNameValid && (
                <p className="text-xs font-bold text-red-500 mt-1">Full Name is required.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Username</label>
              <Input
                type="text"
                placeholder="ankit_strong"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setTouched(prev => ({ ...prev, username: true }));
                }}
                onBlur={() => setTouched(prev => ({ ...prev, username: true }))}
                className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 focus-visible:ring-primary ${touched.username && !isUsernameValid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                required
              />
              <p className={`text-xs font-bold mt-1 ${touched.username && !isUsernameValid ? "text-red-500" : "text-slate-400"}`}>
                Must be at least 3 characters.
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</label>
              <Input
                type="email"
                placeholder="ankit@strongape.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setTouched(prev => ({ ...prev, email: true }));
                }}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 focus-visible:ring-primary ${touched.email && !isEmailValid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                required
              />
              {touched.email && !isEmailValid && (
                <p className="text-xs font-bold text-red-500 mt-1">Please enter a valid email address.</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setTouched(prev => ({ ...prev, password: true }));
                }}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                className={`h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-950 focus-visible:ring-primary ${touched.password && !isPasswordValid ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                required
              />
              <p className={`text-xs font-bold mt-1 ${touched.password && !isPasswordValid ? "text-red-500" : "text-slate-400"}`}>
                Must be at least 6 characters.
              </p>
            </div>
            <Button
              type="submit"
              className="w-full h-12 rounded-full font-bold shadow-lg shadow-primary/20 text-base mt-2"
              disabled={formLoading}
            >
              {formLoading ? "Creating Account..." : "Create Account"}
            </Button>
            <div className="text-center pt-2">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
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
