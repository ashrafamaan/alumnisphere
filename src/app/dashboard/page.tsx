"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Star,
  Activity,
  Send,
  Lock,
  Heart,
  Sparkles,
  ChevronDown,
  Check,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [relationships, setRelationships] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRelId, setSelectedRelId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Quick modals / inputs
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const [sessionDate, setSessionDate] = useState("");

  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [itemTitle, setItemTitle] = useState("");

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [messageText, setMessageText] = useState("");
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const selectorRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target as Node)) {
        setIsSelectorOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadAll = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const [relRes, reqRes] = await Promise.all([
        fetch(`/api/relationships?userId=${user.id}&role=${user.role}`),
        fetch(`/api/requests?userId=${user.id}&role=${user.role}`),
      ]);
      const relData = await relRes.json();
      const reqData = await reqRes.json();

      if (relData.relationships) {
        setRelationships(relData.relationships);
        if (relData.relationships.length > 0 && !selectedRelId) {
          setSelectedRelId(relData.relationships[0].id);
        }
      }
      if (reqData.requests) {
        setRequests(reqData.requests);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [user?.id, user?.role]);

  const loadRelationship = async (id: string) => {
    try {
      const res = await fetch(`/api/relationships/${id}`);
      const data = await res.json();
      if (data.relationship) {
        setActiveData(data.relationship);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (selectedRelId) {
      loadRelationship(selectedRelId);
    }
  }, [selectedRelId]);

  // Request actions
  const handleRequestResponse = async (requestId: string, status: "ACCEPTED" | "DECLINED") => {
    await fetch("/api/requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status }),
    });
    await loadAll();
  };

  // Toggle action item
  const handleToggleItem = async (itemId: string, current: boolean) => {
    await fetch("/api/action-items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actionItemId: itemId, isCompleted: !current }),
    });
    if (selectedRelId) loadRelationship(selectedRelId);
  };

  // Add action item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || !itemTitle.trim()) return;
    await fetch("/api/action-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        goalId: selectedGoalId,
        title: itemTitle.trim(),
        assignedRole: user?.role === "ALUMNI" ? "ALUMNI" : "STUDENT",
      }),
    });
    setShowItemModal(false);
    setItemTitle("");
    if (selectedRelId) loadRelationship(selectedRelId);
  };

  // Schedule session
  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeData || !sessionTitle || !sessionDate) return;
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        relationshipId: activeData.id,
        studentId: activeData.studentId,
        alumniId: activeData.alumniId,
        title: sessionTitle,
        scheduledDate: sessionDate,
        durationMinutes: 45,
      }),
    });
    setShowSessionModal(false);
    setSessionTitle("");
    setSessionDate("");
    if (selectedRelId) loadRelationship(selectedRelId);
  };

  // Submit Feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionId || !activeData || !user) return;
    const receiverId = user.id === activeData.studentId ? activeData.alumniId : activeData.studentId;
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: selectedSessionId,
        giverId: user.id,
        receiverId,
        rating,
        comments: comment || "Great session!",
      }),
    });
    setShowFeedbackModal(false);
    setComment("");
    if (selectedRelId) loadRelationship(selectedRelId);
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeData || !user) return;
    const receiverId = user.id === activeData.studentId ? activeData.alumniId : activeData.studentId;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        relationshipId: activeData.id,
        senderId: user.id,
        receiverId,
        content: messageText.trim(),
      }),
    });
    setMessageText("");
    if (selectedRelId) loadRelationship(selectedRelId);
  };

  const partner = user?.role === "ALUMNI" ? activeData?.student : activeData?.alumni;
  const decay = activeData?.decayDiagnostics;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8 font-outfit">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE8E1] pb-5">
        <div>
          <span className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-1">
            {user?.role === "ALUMNI" ? "Mentor Space" : "Student Journey"}
          </span>
          <h1 className="text-3xl font-semibold text-[#292524] tracking-tight flex items-baseline gap-2">
            My Mentorship{" "}
            <span className="font-cursive text-3xl text-[#E06D66]">rhythm</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-0.5">
            Structured action items, booked chats, and intentional touchpoints.
          </p>
        </div>

        {/* Custom Rounded Pairing Selector (Non-square Softly Aesthetic) */}
        {relationships.length > 1 && (() => {
          const currentRel = relationships.find((r) => r.id === selectedRelId) || relationships[0];
          const currentPartnerName = user?.role === "ALUMNI" ? currentRel?.student?.name : currentRel?.alumni?.name;

          return (
            <div ref={selectorRef} className="relative z-30">
              <button
                type="button"
                onClick={() => setIsSelectorOpen(!isSelectorOpen)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 border border-[#ECE8E1] text-xs font-semibold text-[#292524] soft-shadow hover:bg-[#FDFCF8] hover:border-[#D5CEBE] transition duration-200"
              >
                <span>{currentPartnerName || "Select Mentorship"}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#78716C] transition-transform duration-200 ${
                    isSelectorOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isSelectorOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-3xl bg-[#FDFCF8] border border-[#ECE8E1] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[#A8A29E]">
                    {user?.role === "ALUMNI" ? "Switch Mentee" : "Switch Mentor"}
                  </div>
                  {relationships.map((r) => {
                    const partnerName = user?.role === "ALUMNI" ? r.student?.name : r.alumni?.name;
                    const partnerRole = user?.role === "ALUMNI"
                      ? (r.student?.studentProfile?.department || "Student Learner")
                      : (r.alumni?.alumniProfile?.currentCompany || "Mentor");
                    const isSelected = r.id === (selectedRelId || currentRel?.id);

                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setSelectedRelId(r.id);
                          setIsSelectorOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs transition duration-150 flex items-center justify-between ${
                          isSelected
                            ? "bg-[#E8EFE8] text-[#2E5E3A] font-semibold border border-[#D5E2D5]"
                            : "text-[#44403C] hover:bg-[#F3F0EA] border border-transparent"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold">{partnerName}</p>
                          <p className="text-[10px] text-[#78716C] opacity-80">{partnerRole}</p>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#2E5E3A] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Pending Requests Banner (Clean & Sincere) */}
      {requests.filter((r) => r.status === "PENDING").length > 0 && (
        <div className="p-4 rounded-3xl bg-[#E8EFE8] border border-[#D5E2D5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 soft-shadow">
          <div className="text-xs text-[#2E5E3A] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4E8B5B] shrink-0" />
            <span>
              {user?.role === "ALUMNI"
                ? `${requests[0].student?.name} requested guidance: "${requests[0].preferredTrack}"`
                : `Awaiting response from ${requests[0].alumni?.name}`}
            </span>
          </div>
          {user?.role === "ALUMNI" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleRequestResponse(requests[0].id, "ACCEPTED")}
                className="px-3.5 py-1.5 bg-[#292524] hover:bg-[#3E3835] text-white rounded-full text-xs font-medium transition"
              >
                Accept Mentee
              </button>
              <button
                onClick={() => handleRequestResponse(requests[0].id, "DECLINED")}
                className="px-3.5 py-1.5 bg-white/80 text-[#78716C] hover:text-[#292524] rounded-full text-xs transition"
              >
                Decline
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && relationships.length === 0 && (
        <div className="p-12 text-center bg-white/80 rounded-3xl border border-[#ECE8E1] soft-shadow space-y-3 max-w-md mx-auto">
          <p className="text-[#292524] text-base font-semibold">No active mentorship connection yet.</p>
          <p className="text-[#78716C] text-xs">
            Browse verified campus alumni and send an introduction note.
          </p>
          <Link
            href="/mentors"
            className="inline-block px-5 py-2 bg-[#FFB7B2] hover:bg-[#FFA5A0] text-[#292524] rounded-full text-xs font-semibold soft-shadow transition"
          >
            Explore Mentors
          </Link>
        </div>
      )}

      {/* Active Mentorship Card */}
      {activeData && (
        <div className="space-y-6">
          {/* Top Companion Card */}
          <div className="p-6 rounded-3xl bg-white/90 border border-[#ECE8E1] soft-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={partner?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                alt={partner?.name}
                className="w-14 h-14 rounded-2xl object-cover ring-4 ring-[#EFEDF4]"
              />
              <div>
                <div className="font-semibold text-lg text-[#292524] flex items-center gap-2">
                  {partner?.name}
                  <span className="text-[11px] bg-[#EFEDF4] text-[#4A3B69] px-2.5 py-0.5 rounded-full font-medium">
                    {user?.role === "ALUMNI" ? "Mentee" : "Mentor"}
                  </span>
                </div>
                <p className="text-xs text-[#78716C] mt-0.5">
                  {user?.role === "ALUMNI"
                    ? partner?.studentProfile?.degree
                    : `${partner?.alumniProfile?.currentRole} @ ${partner?.alumniProfile?.currentCompany}`}
                </p>
              </div>
            </div>

            {/* Anti-Decay Indicator Pill */}
            <div className="flex items-center gap-2.5 bg-[#FDFCF8] px-4 py-2 rounded-2xl border border-[#ECE8E1] text-xs">
              <span className={`w-2.5 h-2.5 rounded-full ${decay?.status === "HEALTHY" ? "bg-[#4E8B5B]" : "bg-[#E06D66]"}`} />
              <div>
                <span className="font-medium text-[#292524] block">
                  {decay?.status === "HEALTHY" ? "Connection Blooming" : "Needs Sincere Check-in"}
                </span>
                <span className="text-[11px] text-[#A8A29E]">
                  Last touchpoint: {decay?.daysInactive === 0 ? "Today" : `${decay?.daysInactive}d ago`}
                </span>
              </div>
            </div>
          </div>

          {/* 2-Column Living Room Workspace */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left: Tactile Diary-Style Action Items Checklist */}
            <div className="p-6 rounded-3xl bg-white/95 border border-[#ECE8E1] soft-shadow space-y-5">
              <div className="flex items-center justify-between border-b border-[#F2EFE9] pb-3">
                <div>
                  <h2 className="font-semibold text-sm text-[#292524] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4E8B5B]" /> Milestones & Intentions
                  </h2>
                  <p className="text-[11px] text-[#78716C] mt-0.5">Action items to maintain momentum</p>
                </div>
                <span className="text-xs font-bold text-[#4E8B5B] bg-[#E8EFE8] px-2.5 py-0.5 rounded-full">
                  {activeData.goals?.[0]?.progressPercent || 0}%
                </span>
              </div>

              {activeData.goals?.length > 0 ? (
                activeData.goals.map((goal: any) => (
                  <div key={goal.id} className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#292524]">{goal.title}</span>
                      <button
                        onClick={() => {
                          setSelectedGoalId(goal.id);
                          setShowItemModal(true);
                        }}
                        className="text-[11px] text-[#E06D66] hover:underline font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add item
                      </button>
                    </div>

                    {/* Pastel Progress Bar */}
                    <div className="w-full h-2 bg-[#F5F2EB] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#FFB7B2] rounded-full transition-all duration-500"
                        style={{ width: `${goal.progressPercent}%` }}
                      />
                    </div>

                    {/* Checklist */}
                    <div className="space-y-2 pt-1">
                      {goal.actionItems?.map((item: any) => (
                        <label
                          key={item.id}
                          className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-[#FDFCF8] border border-transparent hover:border-[#ECE8E1] transition cursor-pointer select-none text-xs"
                        >
                          <input
                            type="checkbox"
                            checked={item.isCompleted}
                            onChange={() => handleToggleItem(item.id, item.isCompleted)}
                            className="w-4 h-4 rounded text-[#292524] focus:ring-0 accent-[#292524] cursor-pointer"
                          />
                          <span
                            className={item.isCompleted ? "line-through text-[#A8A29E]" : "text-[#44403C] font-medium"}
                          >
                            {item.title}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* Handwritten style sign-off */}
                    <div className="pt-2 flex items-center justify-end gap-2 text-[#A8A29E]">
                      <div className="w-8 h-px bg-[#ECE8E1]" />
                      <span className="font-cursive text-sm text-[#78716C]">shared roadmap</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#A8A29E] py-4 text-center">No active milestones yet.</p>
              )}
            </div>

            {/* Right: Sessions & Quiet Messaging */}
            <div className="space-y-6">
              {/* Sessions Card */}
              <div className="p-6 rounded-3xl bg-white/95 border border-[#ECE8E1] soft-shadow space-y-4">
                <div className="flex items-center justify-between border-b border-[#F2EFE9] pb-3">
                  <h2 className="font-semibold text-sm text-[#292524] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#E06D66]" /> Coffee & 1-on-1s
                  </h2>
                  <button
                    onClick={() => setShowSessionModal(true)}
                    className="text-xs bg-[#292524] hover:bg-[#3E3835] text-white font-medium px-3 py-1.5 rounded-full transition shadow-sm"
                  >
                    + Book time
                  </button>
                </div>

                <div className="space-y-2.5">
                  {activeData.sessions?.length > 0 ? (
                    activeData.sessions.map((sess: any) => (
                      <div
                        key={sess.id}
                        className="p-3.5 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-[#292524]">{sess.title}</div>
                          <div className="text-[11px] text-[#78716C] mt-0.5 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-[#A8A29E]" />
                            {new Date(sess.scheduledDate).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}{" "}
                            • 45 mins
                          </div>
                        </div>

                        {sess.status === "COMPLETED" ? (
                          <button
                            onClick={() => {
                              setSelectedSessionId(sess.id);
                              setShowFeedbackModal(true);
                            }}
                            className="text-[11px] text-[#A05A12] bg-[#FFF2E0] px-2.5 py-1 rounded-full font-medium flex items-center gap-1"
                          >
                            <Star className="w-3 h-3 fill-[#A05A12]" /> Feedback
                          </button>
                        ) : (
                          <span className="text-[10px] bg-[#E8EFE8] text-[#2E5E3A] px-2.5 py-0.5 rounded-full font-semibold">
                            Scheduled
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#A8A29E] py-2 text-center">No upcoming chats scheduled.</p>
                  )}
                </div>
              </div>

              {/* In-Platform Conversation Bubble Card */}
              <div className="p-6 rounded-3xl bg-white/95 border border-[#ECE8E1] soft-shadow space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#F2EFE9] pb-2">
                  <span className="font-semibold text-xs text-[#292524]">Private Relay Room</span>
                  <span className="text-[10px] text-[#78716C] flex items-center gap-1">
                    <Lock className="w-3 h-3 text-[#A8A29E]" /> Contacts shielded
                  </span>
                </div>

                <div className="h-44 overflow-y-auto space-y-2.5 text-xs pr-1">
                  {activeData.messages?.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                        msg.senderId === user?.id
                          ? "ml-auto bg-[#292524] text-white rounded-br-sm"
                          : "bg-[#F5F2EB] text-[#292524] rounded-bl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Send a quiet note or update..."
                    className="flex-1 px-3.5 py-2 rounded-full bg-[#F5F2EB] border border-[#ECE8E1] text-xs text-[#292524] placeholder-[#A8A29E] focus:outline-none focus:border-[#FFB7B2]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#FFB7B2] hover:bg-[#FFA5A0] text-[#292524] rounded-full text-xs font-semibold transition"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFCF8] border border-[#ECE8E1] rounded-3xl max-w-sm w-full p-6 space-y-4 soft-shadow">
            <h3 className="font-semibold text-base text-[#292524]">Schedule 1-on-1 Time</h3>
            <form onSubmit={handleScheduleSession} className="space-y-3">
              <div>
                <label className="block text-xs text-[#78716C] mb-1">Topic</label>
                <input
                  type="text"
                  required
                  value={sessionTitle}
                  onChange={(e) => setSessionTitle(e.target.value)}
                  placeholder="e.g. Distributed Systems Architecture Mock"
                  className="w-full p-2.5 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#78716C] mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-3.5 py-1.5 text-xs text-[#78716C] hover:text-[#292524]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#292524] hover:bg-[#3E3835] text-white rounded-full text-xs font-medium"
                >
                  Confirm Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFCF8] border border-[#ECE8E1] rounded-3xl max-w-sm w-full p-6 space-y-3 soft-shadow">
            <h3 className="font-semibold text-base text-[#292524]">Add Intention or Action Item</h3>
            <form onSubmit={handleAddItem} className="space-y-3">
              <input
                type="text"
                required
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="e.g. Draft sliding window rate-limiter diagram"
                className="w-full p-2.5 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2]"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-3 py-1.5 text-xs text-[#78716C] hover:text-[#292524]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#292524] text-white rounded-full text-xs font-medium"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FDFCF8] border border-[#ECE8E1] rounded-3xl max-w-sm w-full p-6 space-y-4 soft-shadow">
            <h3 className="font-semibold text-base text-[#292524]">Session Reflection</h3>
            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    className={`flex-1 p-2 rounded-2xl border text-xs font-bold transition ${
                      rating >= val
                        ? "bg-[#FFE4E1] text-[#9A3B3B] border-[#FFB7B2]"
                        : "bg-white border-[#ECE8E1] text-[#A8A29E]"
                    }`}
                  >
                    ★ {val}
                  </button>
                ))}
              </div>
              <textarea
                rows={3}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What was most helpful in this discussion?"
                className="w-full p-3 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2]"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-3.5 py-1.5 text-xs text-[#78716C] hover:text-[#292524]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#292524] text-white rounded-full text-xs font-medium"
                >
                  Submit Reflection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
