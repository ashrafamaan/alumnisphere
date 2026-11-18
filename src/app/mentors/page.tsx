"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { StudentLineArt, TeacherLineArt } from "@/components/HeroLineArt";
import {
  ShieldCheck,
  Search,
  Lock,
  Sparkles,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Heart,
} from "lucide-react";

interface Mentor {
  id: string;
  name: string;
  avatarUrl: string;
  headline: string;
  currentCompany: string;
  currentRole: string;
  industry: string;
  graduationYear: number;
  degree: string;
  verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
  bio: string;
  skills: string[];
  mentoringTopics: string[];
  maxMenteesCapacity: number;
  activeMenteesCount: number;
  availableHoursPerWeek: number;
  isAlreadyMentor?: boolean;
  hasPendingRequest?: boolean;
  matchAnalysis: {
    score: number;
    matchTier: string;
    matchedHighlights: string[];
  };
}

export default function MentorsPage() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [preferredTrack, setPreferredTrack] = useState("Technical & System Design Mock Rounds");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Scroll position state for parallax line art responsiveness
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const targetScrollRef = useRef<HTMLDivElement>(null);
  const firstTextRef = useRef<HTMLSpanElement>(null);

  // Smooth, whisper-slow, single-direction seamless ticker loop calibrated with deltaTime
  useEffect(() => {
    const el = targetScrollRef.current;
    const firstText = firstTextRef.current;
    if (!el) return;

    let animId: number;
    let isHovered = false;
    let lastTime = performance.now();
    let scrollPos = el.scrollLeft;

    // Truly slow, calm reading pace (15 pixels per second, monitor refresh-rate independent)
    const SPEED_PX_PER_SEC = 15;

    const onEnter = () => {
      isHovered = true;
    };
    const onLeave = () => {
      isHovered = false;
      lastTime = performance.now();
    };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    const step = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1); // cap dt to avoid jump on tab wake
      lastTime = now;

      if (!isHovered && el.scrollWidth > el.clientWidth) {
        scrollPos += SPEED_PX_PER_SEC * dt;

        // Seamless wrap in single direction
        const itemWidth = firstText?.offsetWidth || el.scrollWidth / 3;
        if (itemWidth > 0 && scrollPos >= itemWidth) {
          scrollPos -= itemWidth;
        }

        el.scrollLeft = scrollPos;
      } else {
        scrollPos = el.scrollLeft;
      }

      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);

    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      cancelAnimationFrame(animId);
    };
  }, [user?.studentProfile?.careerGoals]);

  const fetchMentors = async () => {
    try {
      setIsLoading(true);
      const studentId = user?.role === "STUDENT" ? user.id : "";
      const params = new URLSearchParams();
      if (studentId) params.append("studentUserId", studentId);
      if (selectedIndustry !== "ALL") params.append("industry", selectedIndustry);
      if (searchQuery) params.append("query", searchQuery);

      const res = await fetch(`/api/mentors?${params.toString()}`);
      const data = await res.json();
      if (data.mentors) {
        setMentors(data.mentors);
      }
    } catch (err) {
      console.error("Failed to load mentors", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [user?.id, selectedIndustry, searchQuery]);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor || !user) return;

    try {
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);

      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user.id,
          alumniId: selectedMentor.id,
          message: requestMessage,
          preferredTrack,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request");

      setSubmitSuccess(`Note delivered to ${selectedMentor.name}! Check 'My Mentorship' to follow up.`);
      setTimeout(() => {
        setSelectedMentor(null);
        setSubmitSuccess(null);
      }, 2200);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const industries = [
    { label: "All Spaces", value: "ALL" },
    { label: "Cloud & Big Tech", value: "Big Tech" },
    { label: "AI & Intelligence", value: "Artificial Intelligence" },
    { label: "Fintech & Payments", value: "Fintech" },
    { label: "DevOps & Systems", value: "Cloud" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10 font-outfit">
      {/* Warm Editorial Hero Section with Flanking Minimalist Line Art */}
      <div className="relative pt-4">
        {/* Left Flank: Curious Learner Line Art (Coffee Doodle, 120% bigger, responsive to scroll) */}
        <div className="absolute left-0 xl:-left-24 2xl:-left-44 top-0 z-0 hidden lg:block">
          <StudentLineArt scrollY={scrollY} />
        </div>

        {/* Right Flank: Seasoned Mentor Line Art (Sitting Reading Doodle, 120% bigger, responsive to scroll) */}
        <div className="absolute right-0 xl:-right-24 2xl:-right-44 top-0 z-0 hidden lg:block">
          <TeacherLineArt scrollY={scrollY} />
        </div>

        {/* Central Editorial Hero Content */}
        <div className="text-center max-w-2xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE8] text-[#2E5E3A] text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#4E8B5B] animate-pulse" />
            Campus Registrar Verified Mentorship
          </div>

          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#292524] leading-[1.15]">
            Mentorship that feels{" "}
            <span className="font-cursive text-5xl sm:text-6xl text-[#E06D66] inline-block -rotate-1">
              human
            </span>
            , not transactional.
          </h1>

          <p className="text-sm sm:text-base text-[#78716C] max-w-lg mx-auto leading-relaxed">
            {user?.role === "ALUMNI"
              ? "Welcome to your alumni space. Review peer mentors and manage your active mentees with protected boundaries."
              : "Connect with verified campus alumni tailored to your stated career goals. Contact details remain private; guidance stays sincere."}
          </p>

          {user?.role === "STUDENT" && (
            <div className="inline-flex items-center max-w-sm sm:max-w-md md:max-w-xl w-full rounded-full bg-white border border-[#ECE8E1] soft-shadow py-1.5 px-3.5 text-xs text-[#57534E] overflow-hidden relative shadow-sm">
              {/* Pinned "your target:" label - fixed in place and never scrolls away */}
              <div className="shrink-0 flex items-center pr-2.5 bg-white z-20 select-none shadow-[4px_0_10px_white]">
                <span className="font-cursive text-base text-[#E06D66] font-medium tracking-wide">
                  your target:
                </span>
                <span className="w-px h-3.5 bg-[#EAE6DF] ml-2 shrink-0" />
              </div>

              {/* Left fade guard */}
              <div className="absolute left-[96px] top-0 bottom-0 w-3 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />

              {/* Right fade guard */}
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none z-10 rounded-r-full" />

              {/* Smooth slow, single-direction seamlessly looping ticker container */}
              <div
                ref={targetScrollRef}
                className="overflow-x-hidden whitespace-nowrap py-0.5 text-[#292524] font-medium select-none w-full flex items-center"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                title={user.studentProfile?.careerGoals || "Backend Systems & Cloud Engineering"}
              >
                {/* First copy */}
                <span ref={firstTextRef} className="inline-flex items-center shrink-0 pr-8">
                  <span>{user.studentProfile?.careerGoals || "Backend Systems & Cloud Engineering"}</span>
                  <span className="ml-8 text-[#D6D3D1]">•</span>
                </span>

                {/* Second copy for infinite single-direction seamless loop */}
                <span className="inline-flex items-center shrink-0 pr-8">
                  <span>{user.studentProfile?.careerGoals || "Backend Systems & Cloud Engineering"}</span>
                  <span className="ml-8 text-[#D6D3D1]">•</span>
                </span>

                {/* Third copy ensuring wide displays are seamlessly covered */}
                <span className="inline-flex items-center shrink-0 pr-8">
                  <span>{user.studentProfile?.careerGoals || "Backend Systems & Cloud Engineering"}</span>
                  <span className="ml-8 text-[#D6D3D1]">•</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Pill Search & Category Filters */}
      <div className="space-y-3">
        <div className="relative max-w-xl mx-auto">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by mentor name, company (Google, Stripe), or skill..."
            className="w-full pl-11 pr-4 py-3 rounded-full bg-white/90 border border-[#ECE8E1] text-sm text-[#292524] placeholder-[#A8A29E] soft-shadow focus:outline-none focus:border-[#FFB7B2] transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {industries.map((ind) => (
            <button
              key={ind.value}
              onClick={() => setSelectedIndustry(ind.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-all font-medium ${
                selectedIndustry === ind.value
                  ? "bg-[#292524] text-white shadow-sm"
                  : "bg-white/80 hover:bg-[#F3F0EA] text-[#78716C] border border-[#ECE8E1]"
              }`}
            >
              {ind.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mentors Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-[#78716C] text-sm font-outfit">
          Curating mentors for your living room...
        </div>
      ) : mentors.length === 0 ? (
        <div className="py-16 text-center text-[#78716C] bg-white/60 rounded-3xl border border-[#ECE8E1] p-8 max-w-md mx-auto">
          <p className="font-medium text-[#292524]">No mentors match this view.</p>
          <p className="text-xs text-[#A8A29E] mt-1">Try selecting &apos;All Spaces&apos; to view all alumni.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mentors.map((mentor, index) => {
            const isVerified = mentor.verificationStatus === "VERIFIED";
            const slotsLeft = Math.max(mentor.maxMenteesCapacity - mentor.activeMenteesCount, 0);

            return (
              <div
                key={mentor.id}
                className="rounded-3xl bg-white/90 border border-[#ECE8E1] p-6 soft-shadow soft-shadow-hover transition-all duration-300 flex flex-col justify-between space-y-4 relative group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    {/* Avatar with Soft Pastel Ring */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mentor.avatarUrl}
                      alt={mentor.name}
                      className="w-13 h-13 rounded-2xl object-cover ring-4 ring-[#E8EFE8] group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-base text-[#292524] tracking-tight">
                          {mentor.name}
                        </span>
                        {isVerified && (
                          <span
                            title="University Registrar Verified Credentials"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E8EFE8] text-[#2E5E3A] text-[10px] font-medium"
                          >
                            <ShieldCheck className="w-3 h-3 text-[#3D7A4D]" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#57534E] font-medium mt-0.5">
                        {mentor.currentRole} • {mentor.currentCompany}
                      </p>
                      <p className="text-[11px] text-[#A8A29E]">
                        {mentor.degree} (Class of {mentor.graduationYear})
                      </p>
                    </div>
                  </div>

                  {/* Pastel Match Pill */}
                  <div className="text-right shrink-0">
                    <span className="px-3 py-1 rounded-full bg-[#EFEDF4] text-[#4A3B69] font-bold text-xs inline-block">
                      {mentor.matchAnalysis.score}% match
                    </span>
                  </div>
                </div>

                {/* Warm Persona Bio Quote */}
                <p className="text-xs text-[#78716C] leading-relaxed line-clamp-2">
                  &ldquo;{mentor.bio}&rdquo;
                </p>

                {/* Soft Skill Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {mentor.skills.slice(0, 4).map((skill, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-[#F5F2EB] text-[#57534E] px-2.5 py-0.5 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Card Footer: Capacity & Tactile CTA */}
                <div className="pt-3 border-t border-[#F2EFE9] flex items-center justify-between text-xs">
                  <div className="text-[11px] text-[#78716C] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#A8A29E]" />
                    <span>{slotsLeft} of {mentor.maxMenteesCapacity} open slots</span>
                  </div>

                  {user?.role === "STUDENT" ? (
                    mentor.isAlreadyMentor ? (
                      <a
                        href="/dashboard"
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#E8EFE8] text-[#2E5E3A] border border-[#CDE1CD] hover:bg-[#DDF0DD] transition-all duration-200 inline-flex items-center gap-1 shadow-sm"
                      >
                        Your Mentor <ArrowRight className="w-3 h-3" />
                      </a>
                    ) : mentor.hasPendingRequest ? (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FFF2E0] text-[#A05A12] border border-[#FFE0B2]">
                        Request Pending
                      </span>
                    ) : (
                      <button
                        disabled={slotsLeft === 0}
                        onClick={() => {
                          setSelectedMentor(mentor);
                          setRequestMessage(
                            `Hi ${mentor.name}! I am focusing on backend distributed systems and would value your guidance on project trade-offs and interview preparation.`
                          );
                        }}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                          slotsLeft === 0
                            ? "bg-[#EAE6DF] text-[#A8A29E] cursor-not-allowed"
                            : "bg-[#FFB7B2] text-[#292524] hover:bg-[#FFA5A0] hover:scale-105 active:scale-95 shadow-sm"
                        }`}
                      >
                        {slotsLeft === 0 ? "Full" : "Connect"}
                      </button>
                    )
                  ) : mentor.id === user?.id ? (
                    <span className="text-[11px] bg-[#E8EFE8] text-[#2E5E3A] px-3 py-1 rounded-full font-medium">
                      Your Profile
                    </span>
                  ) : !user ? (
                    <Link
                      href="/signup"
                      className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#FFB7B2] text-[#292524] hover:bg-[#FFA5A0] hover:scale-105 active:scale-95 shadow-sm transition-all duration-200 cursor-pointer inline-flex items-center gap-1"
                    >
                      Peer Mentor
                    </Link>
                  ) : (
                    <span className="text-[11px] text-[#57534E] bg-[#F5F2EB] border border-[#ECE8E1] px-3 py-1 rounded-full font-medium">
                      Peer Mentor
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tactile Request Modal */}
      {selectedMentor && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFCF8] border border-[#ECE8E1] rounded-3xl max-w-md w-full p-6 space-y-4 soft-shadow max-h-[72vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] text-[#A8A29E] uppercase tracking-wider font-semibold">
                  Mentorship Request
                </span>
                <h3 className="font-semibold text-lg text-[#292524]">
                  Write to {selectedMentor.name}
                </h3>
                <p className="text-xs text-[#78716C]">
                  {selectedMentor.currentRole} at {selectedMentor.currentCompany}
                </p>
              </div>
              <button
                onClick={() => setSelectedMentor(null)}
                className="w-7 h-7 rounded-full bg-[#F5F2EB] hover:bg-[#EAE6DF] text-[#57534E] flex items-center justify-center text-xs font-bold transition"
              >
                ✕
              </button>
            </div>

            {submitSuccess && (
              <div className="p-3.5 rounded-2xl bg-[#E8EFE8] text-[#2E5E3A] text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {submitSuccess}
              </div>
            )}

            {submitError && (
              <div className="p-3.5 rounded-2xl bg-[#FFE4E1] text-[#9A3B3B] text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {submitError}
              </div>
            )}

            <form onSubmit={handleSendRequest} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-medium text-[#57534E] mb-1.5">
                  Focus Track
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    "Technical & System Design Mock Rounds",
                    "Resume Optimization & Portfolio",
                    "Career Transition & Roadmap",
                  ].map((track) => (
                    <button
                      key={track}
                      type="button"
                      onClick={() => setPreferredTrack(track)}
                      className={`w-full text-left px-3.5 py-2 rounded-2xl text-xs font-medium transition border ${
                        preferredTrack === track
                          ? "bg-[#E8EFE8] text-[#2E5E3A] border-[#CDE1CD] font-semibold"
                          : "bg-white text-[#57534E] border-[#ECE8E1] hover:bg-[#F7F5F0]"
                      }`}
                    >
                      {track === "Technical & System Design Mock Rounds"
                        ? "System Design & Technical Architecture"
                        : track === "Resume Optimization & Portfolio"
                        ? "Resume Review & Portfolio Polish"
                        : "Career Roadmap & Early Promotion"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#57534E] mb-1">
                  Your Pitch & What You Hope to Learn
                </label>
                <textarea
                  rows={3}
                  required
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] leading-relaxed"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#F5F2EB] text-[11px] text-[#78716C] flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#A8A29E] shrink-0" />
                <span>
                  Alumni contact info is protected via in-platform relay.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[#78716C] hover:text-[#292524]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-full bg-[#292524] hover:bg-[#3E3835] text-white text-xs font-medium shadow-sm transition disabled:opacity-50"
                >
                  {isSubmitting ? "Delivering..." : "Send Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
