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
    isLoginOpen, 
    setIsLoginOpen, 
    isRegisterOpen, 
    setIsRegisterOpen,
    googleClientId,
    loginWithGoogle
  } = useAuth();

  const [error, setError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const resetForm = () => {
    setError("");
  };

  const handleGoogleCallback = async (response: any) => {
    setError("");
    setFormLoading(true);
    try {
      await loginWithGoogle(response.credential);
      setIsLoginOpen(false);
      setIsRegisterOpen(false);
      resetForm();
    } catch (err: any) {
      setError(err.message || "Google authentication failed.");
    } finally {
      setFormLoading(false);
    }
  };

  // Google One Tap Effect
  React.useEffect(() => {
    const isGuest = user && user.id === 0;
    if (googleClientId && isGuest) {
      const initOneTap = () => {
        const googleObj = (window as any).google;
        if (googleObj) {
          googleObj.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCallback,
            auto_select: false,
          });
          
          googleObj.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed()) {
              console.log("One Tap prompt not displayed:", notification.getNotDisplayedReason());
            } else if (notification.isSkippedMoment()) {
              console.log("One Tap prompt skipped:", notification.getSkippedReason());
            } else if (notification.isDismissedMoment()) {
              console.log("One Tap prompt dismissed:", notification.getDismissedReason());
            }
          });
        }
      };

      initOneTap();
      const interval = setInterval(() => {
        if ((window as any).google) {
          initOneTap();
          clearInterval(interval);
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [googleClientId, user?.id]);

  // Google Modals Button Effect
  React.useEffect(() => {
    if (googleClientId && (isLoginOpen || isRegisterOpen)) {
      const initGoogleBtn = () => {
        const googleObj = (window as any).google;
        if (googleObj) {
          googleObj.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCallback,
            auto_select: false,
          });

          const loginBtnEl = document.getElementById("google-login-btn");
          if (loginBtnEl) {
            googleObj.accounts.id.renderButton(loginBtnEl, {
              theme: "outline",
              size: "large",
              width: 320,
              text: "signin_with",
              shape: "circle",
            });
          }

          const registerBtnEl = document.getElementById("google-register-btn");
          if (registerBtnEl) {
            googleObj.accounts.id.renderButton(registerBtnEl, {
              theme: "outline",
              size: "large",
              width: 320,
              text: "signup_with",
              shape: "circle",
            });
          }
        }
      };

      initGoogleBtn();
      const interval = setInterval(() => {
        if ((window as any).google) {
          initGoogleBtn();
          clearInterval(interval);
        }
      }, 300);

      return () => clearInterval(interval);
    }
  }, [googleClientId, isLoginOpen, isRegisterOpen]);

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
          <DialogHeader className="text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                <path d="M6.5 6.5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0" />
                <path d="M3 19c0-4 9-4 9-4s9 0 9 4" />
              </svg>
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-center">Welcome to StrongApe</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium text-center mt-1">
              Join 12,000+ fitness peers, track streaks, and connect.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-6 flex flex-col items-center">
            {error && (
              <div className="p-3 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl w-full text-center">
                {error}
              </div>
            )}
            
            <div className="flex justify-center w-full min-h-[40px] py-2" id="google-login-btn">
              {!googleClientId && (
                <span className="text-[11px] text-slate-400 font-semibold italic dark:text-slate-500">
                  (Configure GOOGLE_CLIENT_ID in backend/.env)
                </span>
              )}
            </div>
            
            <div className="text-xs text-slate-400 dark:text-slate-500 text-center leading-relaxed">
              By continuing, you agree to StrongApe's Terms of Service and Privacy Policy.
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Global Register Dialog */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="sm:rounded-3xl border-slate-200 dark:border-slate-800 max-w-md p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
          <DialogHeader className="text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary">
                <path d="M6.5 6.5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0" />
                <path d="M3 19c0-4 9-4 9-4s9 0 9 4" />
              </svg>
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight text-center">Create StrongApe Account</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium text-center mt-1">
              Sign up instantly using Google to unlock all features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 mt-6 flex flex-col items-center">
            {error && (
              <div className="p-3 text-sm font-bold text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl w-full text-center">
                {error}
              </div>
            )}
            
            <div className="flex justify-center w-full min-h-[40px] py-2" id="google-register-btn">
              {!googleClientId && (
                <span className="text-[11px] text-slate-400 font-semibold italic dark:text-slate-500">
                  (Configure GOOGLE_CLIENT_ID in backend/.env)
                </span>
              )}
            </div>
            
            <div className="text-xs text-slate-400 dark:text-slate-500 text-center leading-relaxed">
              By continuing, you agree to StrongApe's Terms of Service and Privacy Policy.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
