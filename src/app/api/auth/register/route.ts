import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/auth";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  role: z.enum(["STUDENT", "ALUMNI"]),
  department: z.string().optional(),
  degree: z.string().optional(),
  graduationYear: z.number().or(z.string()).optional(),

  // Student specific detailed options
  careerGoals: z.string().optional(),
  targetIndustries: z.array(z.string()).or(z.string()).optional(),
  targetRoles: z.array(z.string()).or(z.string()).optional(),
  skillsToDevelop: z.array(z.string()).or(z.string()).optional(),

  // Alumni specific detailed options
  currentCompany: z.string().optional(),
  currentRole: z.string().optional(),
  industry: z.string().optional(),
  yearsOfExperience: z.number().or(z.string()).optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).or(z.string()).optional(),
  mentoringTopics: z.array(z.string()).or(z.string()).optional(),
  maxMenteesCapacity: z.number().or(z.string()).optional(),
  availableHoursPerWeek: z.number().or(z.string()).optional(),
  preferredTimeSlots: z.array(z.string()).or(z.string()).optional(),
  protectContactDetails: z.boolean().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const result = RegisterSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid registration data." },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      password,
      role,
      department,
      degree,
      graduationYear,
      // Student details
      careerGoals,
      targetIndustries,
      targetRoles,
      skillsToDevelop,
      // Alumni details
      currentCompany,
      currentRole,
      industry,
      yearsOfExperience,
      bio,
      skills,
      mentoringTopics,
      maxMenteesCapacity,
      availableHoursPerWeek,
      preferredTimeSlots,
      protectContactDetails,
    } = result.data;

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const gradYearNum = Number(graduationYear) || (role === "STUDENT" ? 2027 : 2020);

    const parseArrayOrJson = (val: any, fallback: string[]) => {
      if (Array.isArray(val)) return JSON.stringify(val);
      if (typeof val === "string") {
        if (val.trim().startsWith("[")) return val;
        return JSON.stringify(val.split(",").map((s) => s.trim()).filter(Boolean));
      }
      return JSON.stringify(fallback);
    };

    // Create User & Profile transactionally
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          role,
          department: department || (role === "STUDENT" ? "Computer Science" : "Alumni Network"),
          avatarUrl:
            role === "STUDENT"
              ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
              : "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
        },
      });

      if (role === "STUDENT") {
        await tx.studentProfile.create({
          data: {
            userId: user.id,
            degree: degree || "B.Tech Computer Science",
            graduationYear: gradYearNum,
            studentIdNumber: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
            careerGoals: careerGoals || "Explore career options and technical interview mentorship.",
            targetIndustries: parseArrayOrJson(targetIndustries, ["Technology", "Software Engineering"]),
            targetRoles: parseArrayOrJson(targetRoles, ["Software Engineer", "Backend Developer"]),
            skillsToDevelop: parseArrayOrJson(skillsToDevelop, ["System Design", "Problem Solving", "Web Development"]),
          },
        });
      } else if (role === "ALUMNI") {
        await tx.alumniProfile.create({
          data: {
            userId: user.id,
            headline: `${currentRole || "Software Engineer"} @ ${currentCompany || "Technology Inc."}`,
            currentCompany: currentCompany || "Technology Inc.",
            currentRole: currentRole || "Software Engineer",
            industry: industry || "Technology & Software",
            yearsOfExperience: Number(yearsOfExperience) || 3,
            graduationYear: gradYearNum,
            degree: degree || "B.Tech Computer Science",
            studentIdNumber: `ALU-${Math.floor(1000 + Math.random() * 9000)}`,
            verificationStatus: "PENDING",
            verificationNotes: "Submitted registration credentials. Awaiting registrar review.",
            bio: bio || "Campus alumni eager to provide mentorship and career guidance to fellow students.",
            skills: parseArrayOrJson(skills, ["Software Engineering", "Career Mentorship", "Technical Guidance"]),
            mentoringTopics: parseArrayOrJson(mentoringTopics, ["Interview Preparation", "Resume Review", "Early Career Guidance"]),
            maxMenteesCapacity: Number(maxMenteesCapacity) || 3,
            availableHoursPerWeek: Number(availableHoursPerWeek) || 2.0,
            preferredTimeSlots: parseArrayOrJson(preferredTimeSlots, ["Weekend Mornings", "Weekday Evenings"]),
            acceptingNewMentees: true,
            protectContactDetails: protectContactDetails !== undefined ? protectContactDetails : true,
            proxyEmail: `${name.toLowerCase().replace(/[^a-z0-9]/g, "")}.${user.id.slice(-4)}@relay.institution-alumni.edu`,
            directPhoneMasked: "+1 ••• ••• 4192",
          },
        });
      }

      return user;
    });

    // Create session & set httpOnly cookie
    await createSession(newUser.id);

    // Fetch full user with profile
    const fullUser = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        alumniProfile: true,
        studentProfile: true,
      },
    });

    const { passwordHash: _, ...sanitizedUser } = fullUser!;

    return NextResponse.json({
      success: true,
      user: sanitizedUser,
    });
  } catch (err: any) {
    console.error("Register API error:", err);
    return NextResponse.json(
      { error: "Registration failed. Please verify your details." },
      { status: 500 }
    );
  }
}
