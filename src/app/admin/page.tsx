"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  CheckCircle2,
  Users,
  Star,
  Activity,
  Check,
  X,
  Send,
  Sparkles,
} from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleVerify = async (profileId: string, action: "VERIFY" | "REJECT") => {
    await fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        alumniProfileId: profileId,
        action,
        adminName: user?.name || "Registrar Office",
      }),
    });
    setBannerMsg(`Alumni identity marked as ${action === "VERIFY" ? "Verified" : "Rejected"}.`);
    await loadStats();
    setTimeout(() => setBannerMsg(null), 3000);
  };

  const handleNudge = async (relationshipId: string) => {
    await fetch("/api/admin/nudge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relationshipId }),
    });
    setBannerMsg("Gentle re-engagement check-in delivered to the pairing.");
    await loadStats();
    setTimeout(() => setBannerMsg(null), 3000);
  };

  const m = stats?.metrics;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-outfit">
      {/* Header */}
      <div className="border-b border-[#ECE8E1] pb-5">
        <span className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-1">
          Dean&apos;s Office & Registrar
        </span>
        <h1 className="text-3xl font-semibold text-[#292524] tracking-tight">
          University Mentorship{" "}
          <span className="font-cursive text-3xl text-[#E06D66]">visibility</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
          Verify authentic alumni credentials, preserve mentor privacy, and nurture ongoing connections.
        </p>
      </div>

      {bannerMsg && (
        <div className="p-3.5 rounded-2xl bg-[#E8EFE8] border border-[#D5E2D5] text-[#2E5E3A] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-[#4E8B5B]" /> {bannerMsg}
        </div>
      )}

      {/* 3 Pastel Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-[#E8EFE8]/70 border border-[#D5E2D5] soft-shadow">
          <span className="text-xs text-[#2E5E3A] font-medium block">Verified Alumni Ratio</span>
          <div className="text-2xl font-bold text-[#292524] mt-1">
            {m?.verifiedAlumni || 0} / {m?.totalAlumni || 0}{" "}
            <span className="text-xs text-[#4E8B5B] font-semibold">
              ({m?.totalAlumni ? Math.round((m.verifiedAlumni / m.totalAlumni) * 100) : 0}%)
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-[#EFEDF4]/70 border border-[#DDD8E5] soft-shadow">
          <span className="text-xs text-[#4A3B69] font-medium block">Active Pairings</span>
          <div className="text-2xl font-bold text-[#292524] mt-1">{m?.activePairings || 0} Pairs</div>
        </div>

        <div className="p-5 rounded-3xl bg-[#FFE4E1]/60 border border-[#FAD2CD] soft-shadow">
          <span className="text-xs text-[#9A3B3B] font-medium block">Student Satisfaction</span>
          <div className="text-2xl font-bold text-[#292524] mt-1">
            ★ {m?.avgSatisfaction || 5.0} / 5.0
          </div>
        </div>
      </div>

      {/* Section 1: Verification Queue */}
      <div className="p-6 rounded-3xl bg-white/95 border border-[#ECE8E1] soft-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-[#F2EFE9] pb-3">
          <h2 className="font-semibold text-sm text-[#292524] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#4E8B5B]" /> Alumni Identity Review
          </h2>
          <span className="text-xs text-[#78716C] bg-[#F5F2EB] px-3 py-1 rounded-full font-medium">
            {stats?.pendingAlumni?.length || 0} Pending Credentials
          </span>
        </div>

        <div className="space-y-3">
          {stats?.pendingAlumni?.length > 0 ? (
            stats.pendingAlumni.map((p: any) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-sm text-[#292524]">{p.user?.name}</div>
                  <div className="text-[#57534E] mt-0.5">
                    {p.degree} (Batch of {p.graduationYear}) • {p.currentRole} @ {p.currentCompany}
                  </div>
                  <div className="text-[11px] text-[#A8A29E] font-mono mt-1">
                    Student ID: {p.studentIdNumber || "IT16B045"} • Domain Email: {p.workEmail || "elena@datadog.com"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVerify(p.id, "VERIFY")}
                    className="px-3.5 py-1.5 bg-[#292524] hover:bg-[#3E3835] text-white font-medium rounded-full flex items-center gap-1.5 transition text-xs shadow-sm"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => handleVerify(p.id, "REJECT")}
                    className="px-3.5 py-1.5 bg-[#F5F2EB] hover:bg-[#EAE6DF] text-[#78716C] rounded-full flex items-center gap-1 transition text-xs"
                  >
                    <X className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#A8A29E] py-3 text-center">
              All submitted alumni credentials have been verified with campus registrar archives.
            </p>
          )}
        </div>
      </div>

      {/* Section 2: Engagement Health Watchdog */}
      <div className="p-6 rounded-3xl bg-white/95 border border-[#ECE8E1] soft-shadow space-y-4">
        <div className="flex items-center justify-between border-b border-[#F2EFE9] pb-3">
          <h2 className="font-semibold text-sm text-[#292524] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#E06D66]" /> Relationship Continuity Watchdog
          </h2>
          <span className="text-xs text-[#78716C]">Decay Prevention</span>
        </div>

        <div className="space-y-3">
          {stats?.relationships?.map((rel: any) => {
            const d = rel.decayDiagnostics;
            const needsNudge = d?.status !== "HEALTHY";

            return (
              <div
                key={rel.id}
                className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-medium text-[#292524]">
                    {rel.student?.name}{" "}
                    <span className="text-[#A8A29E]">paired with</span>{" "}
                    {rel.alumni?.name} ({rel.alumni?.alumniProfile?.currentCompany})
                  </div>
                  <div className="text-[11px] text-[#78716C] mt-0.5">
                    Last recorded interaction: {d?.daysInactive === 0 ? "Today" : `${d?.daysInactive} days ago`}
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`px-3 py-1 rounded-full font-medium text-[11px] ${
                      needsNudge
                        ? "bg-[#FFE4E1] text-[#9A3B3B]"
                        : "bg-[#E8EFE8] text-[#2E5E3A]"
                    }`}
                  >
                    {needsNudge ? "Needs Attention" : "Active & Flowing"}
                  </span>

                  {needsNudge && (
                    <button
                      onClick={() => handleNudge(rel.id)}
                      className="px-3.5 py-1 bg-[#FFB7B2] hover:bg-[#FFA5A0] text-[#292524] font-semibold rounded-full text-xs flex items-center gap-1.5 transition shadow-sm"
                    >
                      <Send className="w-3 h-3" /> Nudge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
