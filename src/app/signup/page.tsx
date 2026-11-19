"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ShieldCheck,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Briefcase,
  Check,
  Lock,
  UserCheck,
  Clock,
  Compass,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [role, setRole] = useState<"STUDENT" | "ALUMNI">("STUDENT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Core Account Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [degree, setDegree] = useState("B.Tech in Computer Science");
  const [graduationYear, setGraduationYear] = useState(role === "STUDENT" ? 2026 : 2019);

  // Student Specific Detailed Options
  const [careerGoals, setCareerGoals] = useState(
    "Targeting a High-Scale Backend / Distributed Systems Engineer role at top-tier tech companies."
  );
  const [selectedTargetRoles, setSelectedTargetRoles] = useState<string[]>([
    "Software Engineer",
    "Distributed Systems",
  ]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([
    "Cloud & Infrastructure",
    "Artificial Intelligence",
  ]);
  const [selectedSkillsToDevelop, setSelectedSkillsToDevelop] = useState<string[]>([
    "System Design",
    "Go / Kubernetes",
    "Mock Technical Interviews",
  ]);
  const [preferredCadence, setPreferredCadence] = useState("Bi-weekly 45-min chats (Recommended)");

  // Alumni Specific Detailed Options
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [industry, setIndustry] = useState("Cloud & Big Tech");
  const [yearsOfExperience, setYearsOfExperience] = useState(4);
  const [bio, setBio] = useState(
    "Passionate about distributed storage, concurrency, and helping fellow campus students prepare for top-tier tech roles."
  );
  const [alumniSkills, setAlumniSkills] = useState<string[]>([
    "Distributed Systems",
    "System Design",
    "Kubernetes",
    "Go",
  ]);
  const [mentoringTopics, setMentoringTopics] = useState<string[]>([
    "System Design Mock Rounds",
    "Resume & Portfolio Teardown",
    "Early Career & Staff Promotion",
  ]);
  const [maxMenteesCapacity, setMaxMenteesCapacity] = useState(3);
  const [availableHoursPerWeek, setAvailableHoursPerWeek] = useState(2.0);
  const [preferredTimeSlots, setPreferredTimeSlots] = useState<string[]>([
    "Saturday Mornings",
    "Weekday Evenings (Post 6 PM)",
  ]);
  const [protectContactDetails, setProtectContactDetails] = useState(true);

  // Toggle helper for chips
  const toggleSelection = (
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (list.includes(item)) {
      setter(list.filter((x) => x !== item));
    } else {
      setter([...list, item]);
    }
  };

  const handleRoleChange = (newRole: "STUDENT" | "ALUMNI") => {
    setRole(newRole);
    setGraduationYear(newRole === "STUDENT" ? 2026 : 2019);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please provide your full legal name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid institutional or personal email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (role === "ALUMNI" && (!currentCompany.trim() || !currentRole.trim())) {
      setError("Please provide your current company and job title.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        department,
        degree,
        graduationYear: Number(graduationYear),
        ...(role === "STUDENT"
          ? {
              careerGoals,
              targetIndustries: selectedIndustries,
              targetRoles: selectedTargetRoles,
              skillsToDevelop: selectedSkillsToDevelop,
            }
          : {
              currentCompany: currentCompany.trim(),
              currentRole: currentRole.trim(),
              industry,
              yearsOfExperience: Number(yearsOfExperience),
              bio: bio.trim(),
              skills: alumniSkills,
              mentoringTopics,
              maxMenteesCapacity: Number(maxMenteesCapacity),
              availableHoursPerWeek: Number(availableHoursPerWeek),
              preferredTimeSlots,
              protectContactDetails,
            }),
      };

      const res = await register(payload);

      if (!res.success) {
        setError(res.error || "Registration failed. Please check your inputs.");
        setIsSubmitting(false);
        return;
      }

      // Route after successful registration - full reload ensures fresh session cookie and state
      const targetUrl = role === "ALUMNI" ? "/dashboard" : "/mentors";
      window.location.href = targetUrl;
    } catch (err: any) {
      setError(err.message || "Something went wrong during registration.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-10 font-outfit">
      {/* Editorial Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EFE8] text-[#2E5E3A] text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-[#4E8B5B] animate-pulse" />
          Campus Registrar Verified Onboarding
        </div>

        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#292524] leading-[1.15]">
          Join the community that feels{" "}
          <span className="font-cursive text-5xl sm:text-6xl text-[#E06D66] inline-block -rotate-1">
            kindred
          </span>
          .
        </h1>

        <p className="text-sm sm:text-base text-[#78716C] leading-relaxed">
          Create your verified profile to match based on declared career goals, protected privacy
          boundaries, and intentional campus mentorship.
        </p>
      </div>

      {/* Role Selection Switcher Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => handleRoleChange("STUDENT")}
          className={`p-5 rounded-3xl text-left border transition-all duration-200 soft-shadow flex flex-col justify-between space-y-3 ${
            role === "STUDENT"
              ? "bg-[#FDFCF8] border-[#292524] ring-2 ring-[#292524]/10 shadow-md"
              : "bg-white/80 border-[#ECE8E1] hover:bg-[#FDFCF8] hover:border-[#D5CEBE]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#E8EFE8] flex items-center justify-center text-[#2E5E3A]">
              <GraduationCap className="w-5 h-5" />
            </div>
            {role === "STUDENT" && (
              <span className="w-6 h-6 rounded-full bg-[#292524] text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-base text-[#292524]">Student / Mentee</h3>
            <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
              Declare your dream career goals, discover verified alumni mentors, and book 1-on-1
              guidance without awkward cold messaging.
            </p>
          </div>
          <div className="text-[11px] font-semibold text-[#4E8B5B] bg-[#E8EFE8]/70 px-2.5 py-1 rounded-full w-fit">
            Curated Mentorship Matching
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleRoleChange("ALUMNI")}
          className={`p-5 rounded-3xl text-left border transition-all duration-200 soft-shadow flex flex-col justify-between space-y-3 ${
            role === "ALUMNI"
              ? "bg-[#FDFCF8] border-[#292524] ring-2 ring-[#292524]/10 shadow-md"
              : "bg-white/80 border-[#ECE8E1] hover:bg-[#FDFCF8] hover:border-[#D5CEBE]"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-[#EFEDF4] flex items-center justify-center text-[#4A3B69]">
              <Briefcase className="w-5 h-5" />
            </div>
            {role === "ALUMNI" && (
              <span className="w-6 h-6 rounded-full bg-[#292524] text-white flex items-center justify-center">
                <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-base text-[#292524]">Alumni / Mentor</h3>
            <p className="text-xs text-[#78716C] mt-1 leading-relaxed">
              Share your industry expertise on your own schedule. Set mentee capacity caps with
              built-in contact detail privacy shields.
            </p>
          </div>
          <div className="text-[11px] font-semibold text-[#4A3B69] bg-[#EFEDF4]/70 px-2.5 py-1 rounded-full w-fit">
            Protected Capacity & Privacy Shield
          </div>
        </button>
      </div>

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-[#FFE4E1] border border-[#FFD0CC] text-[#9A3B3B] text-xs font-medium flex items-center gap-2.5 soft-shadow animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Account & University Credentials */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-[#ECE8E1] soft-shadow space-y-6">
          <div className="border-b border-[#F2EFE9] pb-3">
            <h2 className="font-semibold text-base text-[#292524] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#E06D66]" /> Identity & Campus Credentials
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              Used to verify your university affiliation and alumni trust badge.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                Full Name <span className="text-[#E06D66]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maya Lin"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                {role === "STUDENT" ? "Campus Email (.edu)" : "Email Address"}{" "}
                <span className="text-[#E06D66]">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === "STUDENT"
                    ? "maya.lin@student.institution.edu"
                    : "maya.lin@gmail.com"
                }
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                Password (min. 6 characters) <span className="text-[#E06D66]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#78716C]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                Department / School
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Computer Science & Engineering"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                University Degree Program
              </label>
              <input
                type="text"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="B.Tech Computer Science"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                {role === "STUDENT" ? "Expected Graduation Year" : "Alumni Graduation Year"}
              </label>
              <input
                type="number"
                value={graduationYear}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
                min={1980}
                max={2032}
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] transition"
              />
            </div>
          </div>
        </div>

        {/* Section 2 (STUDENT): Detailed Career Goals & Skills */}
        {role === "STUDENT" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-[#ECE8E1] soft-shadow space-y-6">
            <div className="border-b border-[#F2EFE9] pb-3">
              <h2 className="font-semibold text-base text-[#292524] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#4E8B5B]" /> Declared Career Goals & Alignment
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                The platform matches you with verified alumni based on these stated ambitions.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                What is your primary career aspiration? <span className="text-[#E06D66]">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                placeholder="e.g. Aiming to transition from classroom projects to high-throughput backend infrastructure at top tech companies."
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] transition"
              />
            </div>

            {/* Target Roles Chips */}
            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-2">
                Target Roles (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Software Engineer",
                  "Distributed Systems",
                  "Backend Engineer",
                  "AI / ML Engineer",
                  "Cloud Architect",
                  "Product Manager",
                  "DevOps / Site Reliability",
                ].map((targetRole) => {
                  const isSelected = selectedTargetRoles.includes(targetRole);
                  return (
                    <button
                      key={targetRole}
                      type="button"
                      onClick={() =>
                        toggleSelection(selectedTargetRoles, setSelectedTargetRoles, targetRole)
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-[#292524] text-white shadow-sm"
                          : "bg-[#F5F2EB] text-[#57534E] hover:bg-[#EAE6DF]"
                      }`}
                    >
                      {targetRole} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Industries Chips */}
            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-2">
                Target Industry Spaces
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Cloud & Infrastructure",
                  "Artificial Intelligence",
                  "Fintech & Payments",
                  "Developer Tooling",
                  "Enterprise SaaS",
                  "Cybersecurity",
                ].map((ind) => {
                  const isSelected = selectedIndustries.includes(ind);
                  return (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => toggleSelection(selectedIndustries, setSelectedIndustries, ind)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-[#292524] text-white shadow-sm"
                          : "bg-[#F5F2EB] text-[#57534E] hover:bg-[#EAE6DF]"
                      }`}
                    >
                      {ind} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skills to Develop */}
            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-2">
                Core Skills You Hope to Sharpen
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "System Design",
                  "Go / Kubernetes",
                  "Mock Technical Interviews",
                  "Resume & Portfolio Polish",
                  "Concurrency & Microservices",
                  "Promotion & Offer Negotiation",
                ].map((skill) => {
                  const isSelected = selectedSkillsToDevelop.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() =>
                        toggleSelection(selectedSkillsToDevelop, setSelectedSkillsToDevelop, skill)
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-[#E8EFE8] text-[#2E5E3A] border border-[#D5E2D5] font-semibold"
                          : "bg-[#F5F2EB] text-[#57534E] hover:bg-[#EAE6DF]"
                      }`}
                    >
                      {skill} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cadence */}
            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-2">
                Preferred Meeting Cadence
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  "Bi-weekly 45-min chats (Recommended)",
                  "Monthly Check-in",
                  "Milestone async updates",
                ].map((cad) => (
                  <button
                    key={cad}
                    type="button"
                    onClick={() => setPreferredCadence(cad)}
                    className={`p-3 rounded-2xl text-xs text-left font-medium transition border ${
                      preferredCadence === cad
                        ? "bg-[#E8EFE8] text-[#2E5E3A] border-[#D5E2D5] font-semibold"
                        : "bg-[#FDFCF8] text-[#57534E] border-[#ECE8E1] hover:bg-[#F5F2EB]"
                    }`}
                  >
                    {cad}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 2 (ALUMNI): Expertise, Capacity & Availability */}
        {role === "ALUMNI" && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white/95 border border-[#ECE8E1] soft-shadow space-y-6">
            <div className="border-b border-[#F2EFE9] pb-3">
              <h2 className="font-semibold text-base text-[#292524] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#4A3B69]" /> Professional Expertise & Mentoring Capacity
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                Set boundaries and capacity limits to prevent decay and mentor burnout.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                  Current Company / Employer <span className="text-[#E06D66]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  placeholder="e.g. Google, Stripe, Microsoft"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                  Current Role / Title <span className="text-[#E06D66]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                  placeholder="e.g. Staff Infrastructure Engineer"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                  Industry Focus
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Cloud & Big Tech"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                  Years of Professional Experience
                </label>
                <input
                  type="number"
                  value={yearsOfExperience}
                  onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                  min={1}
                  max={40}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-1.5">
                Bio & Mentoring Philosophy
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share a short note on what students can expect from your mentorship."
                className="w-full px-4 py-2.5 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] text-xs text-[#292524] focus:outline-none focus:border-[#FFB7B2] transition"
              />
            </div>

            {/* Core Skills */}
            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-2">
                Core Technical & Leadership Skills
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Distributed Systems",
                  "System Design",
                  "Kubernetes",
                  "Go",
                  "Cloud Infrastructure",
                  "Microservices",
                  "Machine Learning",
                  "Engineering Management",
                ].map((skill) => {
                  const isSelected = alumniSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSelection(alumniSkills, setAlumniSkills, skill)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-[#292524] text-white shadow-sm"
                          : "bg-[#F5F2EB] text-[#57534E] hover:bg-[#EAE6DF]"
                      }`}
                    >
                      {skill} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mentoring Topics */}
            <div>
              <label className="block text-xs font-semibold text-[#44403C] mb-2">
                Mentoring Offerings & Focus Areas
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "System Design Mock Rounds",
                  "Resume & Portfolio Teardown",
                  "Early Career & Staff Promotion",
                  "Code Reviews & Concurrency",
                  "Cross-functional Leadership",
                ].map((topic) => {
                  const isSelected = mentoringTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleSelection(mentoringTopics, setMentoringTopics, topic)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-[#EFEDF4] text-[#4A3B69] border border-[#DFDAE8] font-semibold"
                          : "bg-[#F5F2EB] text-[#57534E] hover:bg-[#EAE6DF]"
                      }`}
                    >
                      {topic} {isSelected && "✓"}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Capacity Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#292524]">Maximum Mentees Cap</span>
                  <span className="text-xs font-bold text-[#E06D66] bg-[#FFE4E1] px-2 py-0.5 rounded-full">
                    {maxMenteesCapacity} mentees
                  </span>
                </div>
                <p className="text-[11px] text-[#78716C]">
                  Once reached, your card automatically displays as &quot;Full&quot; to prevent inbox overwhelm.
                </p>
                <div className="flex gap-2 pt-1">
                  {[1, 2, 3, 5].map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setMaxMenteesCapacity(cap)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        maxMenteesCapacity === cap
                          ? "bg-[#292524] text-white"
                          : "bg-white border border-[#ECE8E1] text-[#78716C] hover:bg-[#F5F2EB]"
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#ECE8E1] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#292524]">Weekly Availability</span>
                  <span className="text-xs font-bold text-[#4E8B5B] bg-[#E8EFE8] px-2 py-0.5 rounded-full">
                    {availableHoursPerWeek} hrs/wk
                  </span>
                </div>
                <p className="text-[11px] text-[#78716C]">
                  Estimated dedicated time for 1-on-1 calls and action item reviews.
                </p>
                <div className="flex gap-2 pt-1">
                  {[1, 2, 3, 4].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setAvailableHoursPerWeek(hrs)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                        availableHoursPerWeek === hrs
                          ? "bg-[#292524] text-white"
                          : "bg-white border border-[#ECE8E1] text-[#78716C] hover:bg-[#F5F2EB]"
                      }`}
                    >
                      {hrs} hr{hrs > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy Shield Toggle */}
            <div className="p-4 rounded-2xl bg-[#E8EFE8]/50 border border-[#D5E2D5] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#3D7A4D] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#2E5E3A] flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={protectContactDetails}
                    onChange={(e) => setProtectContactDetails(e.target.checked)}
                    className="w-4 h-4 rounded text-[#292524] focus:ring-0 accent-[#292524]"
                  />
                  <span>Campus Privacy Relay Shield (Recommended)</span>
                </label>
                <p className="text-[11px] text-[#556B2F] leading-relaxed">
                  Masks your personal cell phone and direct corporate email. Students communicate via
                  verified platform relay rooms and proxy email forwards.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="pt-2 text-center space-y-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#FFB7B2] hover:bg-[#FFA5A0] text-[#292524] font-semibold text-sm shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Creating your profile...</span>
            ) : (
              <>
                <span>Complete Registration & Enter</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-xs text-[#78716C]">
            Already have an account?{" "}
            <Link href="/mentors" className="text-[#292524] font-semibold underline hover:text-[#E06D66]">
              Sign in with demo credentials or email
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
