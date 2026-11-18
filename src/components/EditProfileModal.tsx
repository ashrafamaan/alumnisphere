"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Camera,
  Upload,
  Link as LinkIcon,
  Check,
  Sparkles,
  Building,
  Briefcase,
  Layers,
  GraduationCap,
  Shield,
  Loader2,
} from "lucide-react";

// Curated aesthetic avatars matching the "Softly" living-room aesthetic
const PRESET_AVATARS = [
  {
    id: "aarav-student",
    label: "Aarav (Student)",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "alex-mentor",
    label: "Alex (Mentor)",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "sarah-admin",
    label: "Dr. Sarah (Admin)",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "maya-ai",
    label: "Maya (AI Engineer)",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "marcus-fintech",
    label: "Marcus (Fintech)",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "priya-cloud",
    label: "Priya (Cloud Architect)",
    url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "elena-student",
    label: "Elena (Student)",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "devon-systems",
    label: "Devon (Systems)",
    url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "chloe-founder",
    label: "Chloe (Founder)",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "david-distributed",
    label: "David (Distributed)",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "sara-pm",
    label: "Sara (Product Lead)",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "karan-devops",
    label: "Karan (DevOps)",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80",
  },
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Common fields
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [department, setDepartment] = useState("");
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [showUrlField, setShowUrlField] = useState(false);

  // Student specific fields
  const [careerGoals, setCareerGoals] = useState("");
  const [studentBio, setStudentBio] = useState("");
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [skillsToDevelop, setSkillsToDevelop] = useState<string[]>([]);

  // Alumni specific fields
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [industry, setIndustry] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState(3);
  const [alumniBio, setAlumniBio] = useState("");
  const [maxMenteesCapacity, setMaxMenteesCapacity] = useState(3);
  const [availableHoursPerWeek, setAvailableHoursPerWeek] = useState(2);
  const [protectContactDetails, setProtectContactDetails] = useState(true);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize fields when modal opens or user changes
  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || "");
      setAvatarUrl(user.avatarUrl || PRESET_AVATARS[0].url);
      setDepartment(user.department || "");

      if (user.role === "STUDENT" && user.studentProfile) {
        setCareerGoals(user.studentProfile.careerGoals || "");
        setStudentBio(user.studentProfile.bio || "");
        try {
          const roles = typeof user.studentProfile.targetRoles === "string"
            ? JSON.parse(user.studentProfile.targetRoles)
            : user.studentProfile.targetRoles || [];
          setTargetRoles(Array.isArray(roles) ? roles : []);
        } catch {
          setTargetRoles([]);
        }
        try {
          const skills = typeof user.studentProfile.skillsToDevelop === "string"
            ? JSON.parse(user.studentProfile.skillsToDevelop)
            : user.studentProfile.skillsToDevelop || [];
          setSkillsToDevelop(Array.isArray(skills) ? skills : []);
        } catch {
          setSkillsToDevelop([]);
        }
      }

      if (user.role === "ALUMNI" && user.alumniProfile) {
        setCurrentCompany(user.alumniProfile.currentCompany || "");
        setCurrentRole(user.alumniProfile.currentRole || "");
        setIndustry(user.alumniProfile.industry || "");
        setYearsOfExperience(user.alumniProfile.yearsOfExperience || 3);
        setAlumniBio(user.alumniProfile.bio || "");
        setMaxMenteesCapacity(user.alumniProfile.maxMenteesCapacity || 3);
        setAvailableHoursPerWeek(user.alumniProfile.availableHoursPerWeek || 2);
        setProtectContactDetails(
          user.alumniProfile.protectContactDetails !== undefined
            ? user.alumniProfile.protectContactDetails
            : true
        );
      }

      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const isStudent = user.role === "STUDENT";
  const isAlumni = user.role === "ALUMNI";

  // Handle local image upload via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setErrorMessage("Image is larger than 4MB. Please select a smaller photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarUrl(reader.result);
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setAvatarUrl(customUrlInput.trim());
    setShowUrlField(false);
    setCustomUrlInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload: Record<string, any> = {
        userId: user.id,
        name,
        avatarUrl,
        department,
        role: user.role,
      };

      if (isStudent) {
        payload.careerGoals = careerGoals;
        payload.studentBio = studentBio;
        payload.targetRoles = targetRoles;
        payload.skillsToDevelop = skillsToDevelop;
      }

      if (isAlumni) {
        payload.currentCompany = currentCompany;
        payload.currentRole = currentRole;
        payload.industry = industry;
        payload.yearsOfExperience = yearsOfExperience;
        payload.alumniBio = alumniBio;
        payload.maxMenteesCapacity = maxMenteesCapacity;
        payload.availableHoursPerWeek = availableHoursPerWeek;
        payload.protectContactDetails = protectContactDetails;
      }

      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      await refreshUser();
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong saving your profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FDFCF8] border border-[#ECE8E1] rounded-3xl w-full max-w-2xl max-h-[72vh] flex flex-col soft-shadow relative font-outfit text-[#292524] shadow-2xl overflow-hidden">
        {/* Header - Stays Pinned at Top */}
        <div className="p-5 sm:p-6 pb-4 border-b border-[#ECE8E1]/80 shrink-0 flex items-start justify-between bg-[#FDFCF8] z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFB7B2]" />
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#292524]">
                Edit Profile
              </h2>
              <span className="font-cursive text-xl text-[#78716C] ml-1">
                kindred identity
              </span>
            </div>
            <p className="text-xs text-[#78716C]">
              Update your photo, identity details, and mentorship preferences.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-[#F3F0EA] border border-[#ECE8E1] flex items-center justify-center text-[#78716C] hover:text-[#292524] transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-[#FFF2F0] border border-[#FCA5A5] text-[#991B1B] text-xs">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-2xl bg-[#E8EFE8] border border-[#86EFAC] text-[#166534] text-xs flex items-center gap-2">
                <Check className="w-4 h-4" /> {successMessage}
              </div>
            )}
          {/* 1. Profile Picture Selection Section */}
          <div className="p-4 rounded-3xl bg-white border border-[#ECE8E1] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#292524] flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-[#FFB7B2]" /> Profile Picture
                </h3>
                <p className="text-[11px] text-[#78716C]">
                  Select a curated avatar, upload your own photo, or enter a URL.
                </p>
              </div>

              {/* Active Avatar Preview */}
              <div className="relative group shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#FFB7B2] shadow-sm"
                />
              </div>
            </div>

            {/* Curated Avatars Gallery */}
            <div>
              <span className="text-[11px] font-medium text-[#78716C] block mb-2">
                Choose from curated aesthetic avatars:
              </span>
              <div className="grid grid-cols-6 gap-2.5 justify-items-center">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setAvatarUrl(preset.url)}
                      title={preset.label}
                      className={`relative w-11 h-11 rounded-full p-0.5 transition-all cursor-pointer shrink-0 flex items-center justify-center ${
                        isSelected
                          ? "ring-2.5 ring-[#FFB7B2] ring-offset-2 scale-110 shadow-sm opacity-100"
                          : "opacity-75 hover:opacity-100 hover:scale-105"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Photo Upload & URL options */}
            <div className="pt-2 border-t border-[#ECE8E1] flex flex-wrap items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-full bg-[#FDFCF8] hover:bg-[#F3F0EA] border border-[#ECE8E1] text-xs font-medium text-[#292524] flex items-center gap-1.5 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#78716C]" /> Upload from Computer
              </button>

              <button
                type="button"
                onClick={() => setShowUrlField(!showUrlField)}
                className="px-3.5 py-1.5 rounded-full bg-[#FDFCF8] hover:bg-[#F3F0EA] border border-[#ECE8E1] text-xs font-medium text-[#292524] flex items-center gap-1.5 transition cursor-pointer"
              >
                <LinkIcon className="w-3.5 h-3.5 text-[#78716C]" /> Custom Image URL
              </button>
            </div>

            {showUrlField && (
              <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 px-3.5 py-2 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2]"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  className="px-4 py-2 rounded-2xl bg-[#292524] text-white text-xs font-medium hover:bg-stone-800 transition cursor-pointer"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* 2. Basic Identity Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#292524]">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#292524]">Department / Major</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science & Engineering"
                className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2]"
              />
            </div>
          </div>

          {/* 3. Role-Specific Detailed Profile Fields */}
          {isStudent && (
            <div className="space-y-4 pt-2 border-t border-[#ECE8E1]">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292524] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFB7B2]" /> Primary Career Aspiration / Target Goal
                </label>
                <textarea
                  rows={2}
                  value={careerGoals}
                  onChange={(e) => setCareerGoals(e.target.value)}
                  placeholder="e.g. Aiming to land a Software Engineer role at a top-tier product or cloud company, specializing in Distributed Systems."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292524]">Student Bio / Focus</label>
                <textarea
                  rows={2}
                  value={studentBio}
                  onChange={(e) => setStudentBio(e.target.value)}
                  placeholder="Tell mentors about your background, projects, or interests..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] resize-none"
                />
              </div>
            </div>
          )}

          {isAlumni && (
            <div className="space-y-4 pt-2 border-t border-[#ECE8E1]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292524] flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-[#78716C]" /> Current Company / Employer
                  </label>
                  <input
                    type="text"
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder="e.g. Google, Stripe, Meta"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292524] flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#78716C]" /> Current Role / Title
                  </label>
                  <input
                    type="text"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    placeholder="e.g. Staff Software Engineer"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292524]">Industry Space</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Big Tech, Cloud, AI"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292524]">Years of Experience</label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#292524]">Bio & Mentoring Philosophy</label>
                <textarea
                  rows={2}
                  value={alumniBio}
                  onChange={(e) => setAlumniBio(e.target.value)}
                  placeholder="Share how you like to guide students..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] resize-none"
                />
              </div>

              {/* Mentee Capacity & Availability */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292524]">Max Active Mentees Cap</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 5].map((cap) => (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setMaxMenteesCapacity(cap)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                          maxMenteesCapacity === cap
                            ? "bg-[#292524] text-white border-[#292524]"
                            : "bg-white text-[#78716C] border-[#ECE8E1] hover:bg-[#F3F0EA]"
                        }`}
                      >
                        {cap} {cap === 1 ? "mentee" : "mentees"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#292524]">Weekly Availability</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setAvailableHoursPerWeek(hrs)}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
                          availableHoursPerWeek === hrs
                            ? "bg-[#292524] text-white border-[#292524]"
                            : "bg-white text-[#78716C] border-[#ECE8E1] hover:bg-[#F3F0EA]"
                        }`}
                      >
                        {hrs} {hrs === 1 ? "hr" : "hrs"}/wk
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Campus Privacy Relay Shield */}
              <label className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#ECE8E1] cursor-pointer hover:bg-[#FDFCF8] transition">
                <input
                  type="checkbox"
                  checked={protectContactDetails}
                  onChange={(e) => setProtectContactDetails(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FFB7B2] focus:ring-[#FFB7B2]"
                />
                <div className="text-xs">
                  <span className="font-semibold text-[#292524] flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-[#4E8B5B]" /> Campus Privacy Relay Shield Active
                  </span>
                  <p className="text-[11px] text-[#78716C]">
                    Shields direct personal phone and personal email from students; routing all communication via protected relay rooms.
                  </p>
                </div>
              </label>
            </div>
          )}
          </div>

          {/* Sticky Pinned Footer - Always In Screen */}
          <div className="p-4 sm:px-6 bg-[#FDFCF8] border-t border-[#ECE8E1] flex items-center justify-end gap-3 shrink-0 z-10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-white hover:bg-[#F3F0EA] border border-[#ECE8E1] text-xs font-medium text-[#78716C] hover:text-[#292524] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-full bg-[#FFB7B2] hover:bg-[#FFA5A0] text-[#292524] text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                "Save Profile Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
