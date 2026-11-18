"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ChevronDown,
  LogOut,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCog,
} from "lucide-react";
import EditProfileModal from "@/components/EditProfileModal";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, availableUsers, switchUser, login, logout } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [isCoinFlipping, setIsCoinFlipping] = useState(false);

  // Synthesize a subtle, muted, high-end tactile tap/chime via Web Audio API
  const playCoinSound = () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // Master low-pass filter to remove any harshness or piercing frequencies
      const masterFilter = ctx.createBiquadFilter();
      masterFilter.type = "lowpass";
      masterFilter.frequency.setValueAtTime(1200, now);
      masterFilter.connect(ctx.destination);

      // 1. Subtle, muted tactile droplet/tap (warm 420Hz -> 280Hz, gentle volume 0.045)
      const tapOsc = ctx.createOscillator();
      const tapGain = ctx.createGain();
      tapOsc.type = "sine";
      tapOsc.frequency.setValueAtTime(420, now);
      tapOsc.frequency.exponentialRampToValueAtTime(280, now + 0.06);

      tapGain.gain.setValueAtTime(0.045, now);
      tapGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      tapOsc.connect(tapGain);
      tapGain.connect(masterFilter);
      tapOsc.start(now);
      tapOsc.stop(now + 0.08);

      // 2. Soft, warm ambient harmonic bloom (659Hz warm E5 note, very quiet 0.035)
      const warmOsc = ctx.createOscillator();
      const warmGain = ctx.createGain();
      warmOsc.type = "sine";
      warmOsc.frequency.setValueAtTime(659.25, now + 0.01);
      warmOsc.frequency.exponentialRampToValueAtTime(650, now + 0.22);

      warmGain.gain.setValueAtTime(0.0001, now);
      warmGain.gain.linearRampToValueAtTime(0.035, now + 0.02);
      warmGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      warmOsc.connect(warmGain);
      warmGain.connect(masterFilter);
      warmOsc.start(now + 0.01);
      warmOsc.stop(now + 0.24);

      // 3. Gentle whisper settle ping at 0.36s (987Hz B5, very subtle 0.025 gain)
      setTimeout(() => {
        try {
          if (ctx.state === "closed") return;
          const pingTime = ctx.currentTime;
          const pingOsc = ctx.createOscillator();
          const pingGain = ctx.createGain();

          pingOsc.type = "sine";
          pingOsc.frequency.setValueAtTime(987.77, pingTime);

          pingGain.gain.setValueAtTime(0.025, pingTime);
          pingGain.gain.exponentialRampToValueAtTime(0.0001, pingTime + 0.18);

          pingOsc.connect(pingGain);
          pingGain.connect(masterFilter);
          pingOsc.start(pingTime);
          pingOsc.stop(pingTime + 0.2);
        } catch {
          // ignore
        }
      }, 360);
    } catch {
      // Graceful fallback if Web Audio is unsupported
    }
  };

  const handleLogoClick = (e?: React.MouseEvent) => {
    setIsCoinFlipping(true);
    playCoinSound();
    setTimeout(() => {
      setIsCoinFlipping(false);
    }, 900);

    // Always smoothly scroll to the top of the page when clicking the brand logo
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await logout();
    setDropdownOpen(false);
    router.push("/mentors");
  };

  const handleQuickFill = (email: string) => {
    setLoginEmail(email);
    setLoginPassword("password123");
    setAuthError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setAuthError(null);

    const res = await login(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (res.success) {
      setShowAuthModal(false);
      setLoginEmail("");
      const targetUser = availableUsers.find(
        (u) => u.email.toLowerCase() === loginEmail.toLowerCase().trim()
      );
      if (targetUser?.role === "ALUMNI") {
        router.push("/dashboard");
      } else if (targetUser?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/mentors");
      }
    } else {
      setAuthError(res.error || "Invalid email or credentials");
    }
  };

  const isStudent = user?.role === "STUDENT";
  const isAlumni = user?.role === "ALUMNI";
  const isAdmin = user?.role === "ADMIN";

  return (
    <header className="max-w-5xl mx-auto w-full relative z-50">
      {/* Floating Pill Nav Bar */}
      <div className="bg-white/85 backdrop-blur-xl border border-[#ECE8E1] rounded-full px-4 sm:px-5 py-1.5 sm:py-2 soft-shadow flex items-center justify-between transition-all relative">
        {/* Brand */}
        <Link
          href={isAlumni ? "/dashboard" : isAdmin ? "/admin" : "/mentors"}
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 group select-none"
          title="AlumniSphere • Click to flip coin"
        >
          <div
            className={`w-8 h-8 rounded-full bg-[#FFB7B2] flex items-center justify-center shadow-sm group-hover:scale-105 transition-all ${
              isCoinFlipping ? "animate-coin-flip" : ""
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-outfit font-semibold text-base text-[#292524] tracking-tight group-hover:text-[#E06D66] transition-colors">
              AlumniSphere
            </span>
            <span className="font-cursive text-2xl sm:text-[26px] text-[#E06D66] ml-1 tracking-wide leading-none inline-block -rotate-1 select-none">
              kindred
            </span>
          </div>
        </Link>

        {/* Navigation Links in Outfit Medium */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs font-outfit font-medium">
          {/* Student Tabs */}
          {isStudent && (
            <>
              <Link
                href="/mentors"
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  pathname === "/mentors" || pathname === "/"
                    ? "bg-[#292524] text-white shadow-sm"
                    : "text-[#78716C] hover:text-[#292524] hover:bg-[#F3F0EA]"
                }`}
              >
                Find Mentors
              </Link>
              <Link
                href="/dashboard"
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  pathname === "/dashboard"
                    ? "bg-[#292524] text-white shadow-sm"
                    : "text-[#78716C] hover:text-[#292524] hover:bg-[#F3F0EA]"
                }`}
              >
                My Mentorship
              </Link>
            </>
          )}

          {/* Mentor Tabs */}
          {isAlumni && (
            <Link
              href="/dashboard"
              className={`px-4 py-1.5 rounded-full transition-all ${
                pathname === "/dashboard"
                  ? "bg-[#292524] text-white shadow-sm"
                  : "text-[#78716C] hover:text-[#292524] hover:bg-[#F3F0EA]"
              }`}
            >
              My Mentees & Sessions
            </Link>
          )}

          {/* Admin Tabs */}
          {isAdmin && (
            <>
              <Link
                href="/admin"
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  pathname === "/admin"
                    ? "bg-[#292524] text-white shadow-sm"
                    : "text-[#78716C] hover:text-[#292524] hover:bg-[#F3F0EA]"
                }`}
              >
                University Admin
              </Link>
              <Link
                href="/mentors"
                className={`px-3.5 py-1.5 rounded-full transition-all ${
                  pathname === "/mentors"
                    ? "bg-[#292524] text-white shadow-sm"
                    : "text-[#78716C] hover:text-[#292524] hover:bg-[#F3F0EA]"
                }`}
              >
                Mentor Directory
              </Link>
            </>
          )}


        </nav>

        {/* Right Section: Sign In or User Dropdown */}
        <div ref={dropdownRef}>
          {user ? (
            <div>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-0.5 pr-2.5 sm:pr-3 py-0.5 rounded-full bg-[#F5F2EB] hover:bg-[#EAE6DF] text-[#292524] transition text-sm font-outfit border border-[#ECE8E1] cursor-pointer shadow-xs"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
                <span className="font-semibold hidden sm:inline text-sm text-[#292524]">
                  {user.name}
                </span>
                <span className="text-[11px] text-[#78716C] bg-white px-2 py-0.5 rounded-full border border-[#EAE6DF] font-medium hidden sm:inline">
                  {isStudent ? "Student" : isAlumni ? "Mentor" : "Admin"}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#78716C] transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* High Z-Index Floating Dropdown aligned with right edge of navbar */}
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-76 bg-white/98 backdrop-blur-2xl border border-[#ECE8E1] rounded-3xl soft-shadow p-3.5 z-[100] text-xs font-outfit space-y-2.5">
                  {/* Active User Card */}
                  <div className="p-3.5 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] space-y-2">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0 shadow-xs"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-[#292524] truncate">{user.name}</div>
                        <div className="text-xs text-[#78716C] truncate">{user.email}</div>
                      </div>
                    </div>
                    <div className="pt-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-[#A8A29E]">Active Session:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E8EFE8] text-[#2E5E3A] font-semibold">
                        {isStudent ? "Student Learner" : isAlumni ? "Verified Mentor" : "University Admin"}
                      </span>
                    </div>
                  </div>

                  {/* Edit Profile Action */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setShowEditProfileModal(true);
                        setDropdownOpen(false);
                      }}
                      className="w-full p-2.5 rounded-2xl bg-[#FDFCF8] hover:bg-[#F3F0EA] border border-[#ECE8E1] text-[#292524] flex items-center justify-between text-xs font-semibold transition cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <UserCog className="w-4 h-4 text-[#E06D66]" />
                        Edit Profile
                      </span>
                      <span className="text-[10px] text-[#78716C] bg-white border border-[#ECE8E1] px-2 py-0.5 rounded-full">
                        Photo & Bio →
                      </span>
                    </button>
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-1 border-t border-[#ECE8E1]">
                    <button
                      onClick={handleSignOut}
                      className="w-full p-2.5 rounded-2xl bg-[#FFF2F0] hover:bg-[#FFE5E2] text-[#B91C1C] flex items-center justify-center gap-1.5 text-xs font-semibold transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setAuthError(null);
                }}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F5F2EB] text-[#292524] text-xs font-semibold border border-[#ECE8E1] soft-shadow transition cursor-pointer"
              >
                Sign In
              </button>
              <Link
                href="/signup"
                className="px-4 py-1.5 rounded-full bg-[#FFB7B2] hover:bg-[#FFA5A0] text-[#292524] text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Backend Sign In & Register Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[200] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFCF8] border border-[#ECE8E1] rounded-3xl max-w-sm w-full p-6 space-y-4 soft-shadow font-outfit relative max-h-[72vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] text-[#A8A29E] uppercase tracking-wider font-semibold">
                  AlumniSphere Authentication
                </span>
                <h3 className="font-semibold text-lg text-[#292524]">
                  Sign In to Your Account
                </h3>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="w-7 h-7 rounded-full bg-[#F5F2EB] hover:bg-[#EAE6DF] text-[#57534E] flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            {authError && (
              <div className="p-2.5 rounded-xl bg-[#FFE4E1] text-[#9A3B3B] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {authError}
              </div>
            )}

            {/* LOGIN FORM */}
            <div className="space-y-3.5">
                {/* 1-Click Persona Pre-fills for Testing */}
                <div className="space-y-1">
                  <label className="text-[10px] text-[#78716C] font-semibold uppercase tracking-wider block">
                    1-Click Verified Demo Accounts:
                  </label>
                  <div className="grid grid-cols-1 gap-1">
                    <button
                      type="button"
                      onClick={() => handleQuickFill("aarav.mehta@student.institution.edu")}
                      className={`text-left p-2 rounded-xl border text-xs transition flex items-center justify-between ${
                        loginEmail.includes("aarav")
                          ? "bg-[#292524] text-white border-[#292524]"
                          : "bg-white border-[#ECE8E1] text-[#292524] hover:bg-[#F5F2EB]"
                      }`}
                    >
                      <span className="font-semibold">🎓 Student: Aarav Mehta</span>
                      <span className={`text-[10px] ${loginEmail.includes("aarav") ? "text-slate-300" : "text-[#78716C]"}`}>
                        Select
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickFill("alex.chen.alumni@gmail.com")}
                      className={`text-left p-2 rounded-xl border text-xs transition flex items-center justify-between ${
                        loginEmail.includes("alex")
                          ? "bg-[#292524] text-white border-[#292524]"
                          : "bg-white border-[#ECE8E1] text-[#292524] hover:bg-[#F5F2EB]"
                      }`}
                    >
                      <span className="font-semibold">💼 Mentor: Alex Chen</span>
                      <span className={`text-[10px] ${loginEmail.includes("alex") ? "text-slate-300" : "text-[#78716C]"}`}>
                        Google
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickFill("admin@institution.edu")}
                      className={`text-left p-2 rounded-xl border text-xs transition flex items-center justify-between ${
                        loginEmail.includes("admin")
                          ? "bg-[#292524] text-white border-[#292524]"
                          : "bg-white border-[#ECE8E1] text-[#292524] hover:bg-[#F5F2EB]"
                      }`}
                    >
                      <span className="font-semibold">🏛️ Admin: Dr. Sarah</span>
                      <span className={`text-[10px] ${loginEmail.includes("admin") ? "text-slate-300" : "text-[#78716C]"}`}>
                        Registrar
                      </span>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-[#57534E] mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. aarav.mehta@student.institution.edu"
                      className="w-full p-2.5 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#57534E] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full p-2.5 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2]"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 rounded-full bg-[#292524] hover:bg-[#3E3835] text-white text-xs font-medium shadow-sm transition disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? "Authenticating..." : "Sign In to AlumniSphere"}
                    </button>
                  </div>
                </form>

                {/* Dedicated link to the full registration page */}
                <div className="pt-3 text-center border-t border-[#F2EFE9] text-xs text-[#78716C]">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    onClick={() => setShowAuthModal(false)}
                    className="text-[#E06D66] font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    <span>Create an account on the signup page</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
      />
    </header>
  );
}
