import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning existing database...");
  await prisma.actionItem.deleteMany();
  await prisma.mentorshipGoal.deleteMany();
  await prisma.sessionFeedback.deleteMany();
  await prisma.mentorshipSession.deleteMany();
  await prisma.directMessage.deleteMany();
  await prisma.mentorshipRelationship.deleteMany();
  await prisma.mentorshipRequest.deleteMany();
  await prisma.alumniProfile.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.institutionalAuditLog.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  console.log("Seeding Users...");

  // 1. Institution Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@institution.edu",
      name: "Dr. Sarah Jenkins",
      passwordHash,
      role: "ADMIN",
      department: "Alumni Relations & Career Services",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    },
  });

  // 2. Alumni Mentors
  const alexUser = await prisma.user.create({
    data: {
      email: "alex.chen.alumni@gmail.com", // real email hidden by system
      name: "Alex Chen",
      passwordHash,
      role: "ALUMNI",
      department: "Computer Science & Engineering",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const alexProfile = await prisma.alumniProfile.create({
    data: {
      userId: alexUser.id,
      headline: "Staff Software Engineer @ Google | Ex-Amazon Cloud",
      currentCompany: "Google",
      currentRole: "Staff Software Engineer",
      industry: "Big Tech / Cloud Infrastructure",
      yearsOfExperience: 7,
      graduationYear: 2018,
      degree: "B.Tech in Computer Science & Engineering",
      studentIdNumber: "CS14B029",
      linkedInUrl: "https://linkedin.com/in/alexchen-example",
      verificationStatus: "VERIFIED",
      verifiedAt: new Date("2024-01-15"),
      verificationNotes: "Degree certificate verified against university registrar records (Batch 2014-2018).",
      bio: "Passionate about distributed systems, large scale backend engineering, and helping fellow campus graduates navigate tech interviews and early career promotions.",
      skills: JSON.stringify(["Distributed Systems", "Go", "Kubernetes", "System Design", "Microservices", "Cloud Architecture"]),
      mentoringTopics: JSON.stringify(["System Design Interviews", "Resume Optimization", "Navigating FAANG/Big Tech", "Salary Negotiation"]),
      maxMenteesCapacity: 3,
      availableHoursPerWeek: 2.5,
      preferredTimeSlots: JSON.stringify(["Saturday 10:00 AM - 1:00 PM EST", "Wednesday 7:00 PM - 9:00 PM EST"]),
      acceptingNewMentees: true,
      protectContactDetails: true,
      proxyEmail: "alex.chen.892@relay.institution-alumni.edu",
      directPhoneMasked: "+1 ••• ••• 4821",
    },
  });

  const priyaUser = await prisma.user.create({
    data: {
      email: "priya.sharma.alumni@ai-labs.com",
      name: "Dr. Priya Sharma",
      passwordHash,
      role: "ALUMNI",
      department: "School of Artificial Intelligence & Data Science",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    },
  });

  await prisma.alumniProfile.create({
    data: {
      userId: priyaUser.id,
      headline: "Principal AI Scientist @ Microsoft Research | Ph.D.",
      currentCompany: "Microsoft Research",
      currentRole: "Principal AI Scientist",
      industry: "Artificial Intelligence & Research",
      yearsOfExperience: 9,
      graduationYear: 2015,
      degree: "M.Tech & Ph.D. in AI and Robotics",
      studentIdNumber: "AI13M004",
      linkedInUrl: "https://linkedin.com/in/priyasharma-example",
      verificationStatus: "VERIFIED",
      verifiedAt: new Date("2024-02-10"),
      verificationNotes: "Verified via Institutional Alumni Directory and ORCID research profile.",
      bio: "Working on generative AI reasoning, transformer architectures, and multimodal foundation models. Eager to guide students targeting top-tier research labs and AI engineering.",
      skills: JSON.stringify(["Deep Learning", "Generative AI", "PyTorch", "LLM Fine-tuning", "Computer Vision", "Research Publications"]),
      mentoringTopics: JSON.stringify(["AI Engineering Career Path", "Grad School & Ph.D. Applications", "Paper Reading & Research Projects", "Mock Technical Rounds"]),
      maxMenteesCapacity: 2,
      availableHoursPerWeek: 2.0,
      preferredTimeSlots: JSON.stringify(["Sunday 2:00 PM - 4:00 PM EST", "Thursday 6:00 PM - 7:30 PM EST"]),
      acceptingNewMentees: true,
      protectContactDetails: true,
      proxyEmail: "priya.sharma.412@relay.institution-alumni.edu",
      directPhoneMasked: "+1 ••• ••• 7731",
    },
  });

  const marcusUser = await prisma.user.create({
    data: {
      email: "marcus.vance.stripe@pm.org",
      name: "Marcus Vance",
      passwordHash,
      role: "ALUMNI",
      department: "School of Management & Computer Science",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  await prisma.alumniProfile.create({
    data: {
      userId: marcusUser.id,
      headline: "Lead Product Manager @ Stripe | Ex-Goldman Sachs",
      currentCompany: "Stripe",
      currentRole: "Lead Product Manager",
      industry: "Fintech & Payments",
      yearsOfExperience: 8,
      graduationYear: 2016,
      degree: "B.Tech Electronics + Minor in Economics",
      studentIdNumber: "EC12B088",
      linkedInUrl: "https://linkedin.com/in/marcusvance-example",
      verificationStatus: "VERIFIED",
      verifiedAt: new Date("2024-03-01"),
      verificationNotes: "Verified via LinkedIn badge and institutional records.",
      bio: "Bridging deep technical infrastructure with payment user experience. Happy to mentor aspiring APMs, product engineers, and students exploring fintech.",
      skills: JSON.stringify(["Product Strategy", "Fintech APIs", "System Architecture", "User Discovery", "Metrics & A/B Testing"]),
      mentoringTopics: JSON.stringify(["Breaking into Product Management", "Product Sense Interviews", "Fintech Industry Landscape", "Career Pivots"]),
      maxMenteesCapacity: 3,
      availableHoursPerWeek: 1.5,
      preferredTimeSlots: JSON.stringify(["Friday 5:00 PM - 7:00 PM EST"]),
      acceptingNewMentees: true,
      protectContactDetails: true,
      proxyEmail: "marcus.vance.901@relay.institution-alumni.edu",
      directPhoneMasked: "+1 ••• ••• 1920",
    },
  });

  // Pending Verification Mentor (Demonstrates Institution Admin Approval Queue)
  const elenaUser = await prisma.user.create({
    data: {
      email: "elena.rostova@aws-cloud.io",
      name: "Elena Rostova",
      passwordHash,
      role: "ALUMNI",
      department: "Information Technology",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    },
  });

  await prisma.alumniProfile.create({
    data: {
      userId: elenaUser.id,
      headline: "Senior Cloud & Platform Architect @ Datadog | Ex-AWS",
      currentCompany: "Datadog",
      currentRole: "Senior Cloud Architect",
      industry: "Cloud & Observability",
      yearsOfExperience: 5,
      graduationYear: 2020,
      degree: "B.Tech in Information Technology",
      studentIdNumber: "IT16B045",
      linkedInUrl: "https://linkedin.com/in/elenarostova-example",
      verificationStatus: "PENDING",
      verificationNotes: "Submitted degree scan & corporate Datadog work email (elena@datadoghq.com). Awaiting alumni registrar cross-check.",
      bio: "Passionate about Linux internals, Terraform, CI/CD pipelines, and cloud security architecture.",
      skills: JSON.stringify(["Terraform", "Kubernetes", "AWS", "Datadog", "Site Reliability Engineering", "CI/CD"]),
      mentoringTopics: JSON.stringify(["DevOps & SRE Career Roadmaps", "Cloud Certifications (AWS/CKA)", "Mock Infrastructure Interviews"]),
      maxMenteesCapacity: 2,
      availableHoursPerWeek: 2.0,
      preferredTimeSlots: JSON.stringify(["Tuesday 6:30 PM - 8:30 PM EST"]),
      acceptingNewMentees: true,
      protectContactDetails: true,
      proxyEmail: "elena.rostova.551@relay.institution-alumni.edu",
      directPhoneMasked: "+1 ••• ••• 3144",
    },
  });

  // 3. Students
  const aaravUser = await prisma.user.create({
    data: {
      email: "aarav.mehta@student.institution.edu",
      name: "Aarav Mehta",
      passwordHash,
      role: "STUDENT",
      department: "Computer Science & Engineering",
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    },
  });

  const aaravProfile = await prisma.studentProfile.create({
    data: {
      userId: aaravUser.id,
      graduationYear: 2027,
      degree: "B.Tech Computer Science (Final Year)",
      studentIdNumber: "2023CSB1042",
      cgpa: 8.9,
      careerGoals: "Aiming to land a Software Engineer role at a top-tier product or cloud company, specializing in Distributed Systems, Backend Architecture, and Microservices.",
      targetIndustries: JSON.stringify(["Big Tech / Cloud Infrastructure", "Fintech & Payments"]),
      targetRoles: JSON.stringify(["Software Engineer", "Backend Engineer", "Cloud Infrastructure Specialist"]),
      skillsToDevelop: JSON.stringify(["Distributed Systems", "System Design", "Go", "Kubernetes", "Interview Prep"]),
      bio: "Final year CS student passionate about distributed caching and concurrency. Building open-source web services.",
      githubUrl: "https://github.com/aaravmehta-demo",
      linkedInUrl: "https://linkedin.com/in/aaravmehta-demo",
      resumeUrl: "https://example.com/resumes/aarav-mehta.pdf",
    },
  });

  const saraUser = await prisma.user.create({
    data: {
      email: "sara.lin@student.institution.edu",
      name: "Sara Lin",
      passwordHash,
      role: "STUDENT",
      department: "School of Artificial Intelligence & Data Science",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    },
  });

  await prisma.studentProfile.create({
    data: {
      userId: saraUser.id,
      graduationYear: 2028,
      degree: "B.Tech in Artificial Intelligence (3rd Year)",
      studentIdNumber: "2024AIB2011",
      cgpa: 9.3,
      careerGoals: "Aspiring to work as an Applied AI Engineer or pursue a competitive Master's in Machine Learning, focusing on Large Language Models and Foundation Models.",
      targetIndustries: JSON.stringify(["Artificial Intelligence & Research", "Big Tech"]),
      targetRoles: JSON.stringify(["Machine Learning Engineer", "AI Research Scientist", "Data Scientist"]),
      skillsToDevelop: JSON.stringify(["Deep Learning", "Generative AI", "PyTorch", "LLM Fine-tuning"]),
      bio: "Passionate about NLP, model evaluation, and building responsible AI assistants.",
      githubUrl: "https://github.com/saralin-demo",
      linkedInUrl: "https://linkedin.com/in/saralin-demo",
    },
  });

  // 4. Mentorship Relationship (Aarav Mehta <-> Alex Chen)
  console.log("Seeding Mentorship Relationship & Anti-Decay tracking...");

  const request1 = await prisma.mentorshipRequest.create({
    data: {
      studentId: aaravUser.id,
      alumniId: alexUser.id,
      status: "ACCEPTED",
      message: "Hi Alex! I'm a final-year CS student deeply impressed by your journey at Google. My primary goal is mastering Distributed Systems and cracking technical System Design rounds for upcoming campus placements. Would love your guidance!",
      preferredTrack: "System Design Interviews & Career Navigation",
      responseNote: "Thrilled to connect Aarav! Your background in systems programming is strong. Let's work through practical architecture patterns and mock interviews.",
    },
  });

  const relationship1 = await prisma.mentorshipRelationship.create({
    data: {
      requestId: request1.id,
      studentId: aaravUser.id,
      alumniId: alexUser.id,
      status: "ACTIVE",
      startDate: new Date("2024-10-01"),
      lastInteractionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago = HEALTHY
      decayRiskStatus: "HEALTHY",
      healthScore: 96,
      notes: "High engagement. Aarav completed the distributed rate-limiter design assignment ahead of time.",
    },
  });

  // Completed Session
  const session1 = await prisma.mentorshipSession.create({
    data: {
      relationshipId: relationship1.id,
      studentId: aaravUser.id,
      alumniId: alexUser.id,
      title: "Onboarding & Semester Roadmap Alignment",
      description: "Initial 1-on-1 alignment session to establish baseline strengths, target company tiers, and 90-day milestone plan.",
      scheduledDate: new Date("2024-10-15T18:00:00Z"),
      durationMinutes: 45,
      status: "COMPLETED",
      virtualMeetingUrl: "/rooms/session-onboard-771",
      agenda: "1. Background intro & target companies\n2. Review current resume draft\n3. Establish 3 concrete goals with deadlines\n4. Q&A on FAANG interview loops",
      meetingSummary: "Discussed Aarav's focus on cloud backend. Assigned mock system design on distributed key-value store. Agreed to weekly action item tracking.",
      alumniPrivateNotes: "Strong fundamentals in OS and networking. Needs more practice explaining trade-offs under time pressure.",
      studentPrivateNotes: "Alex gave super actionable tips on structuring 45-minute architectural interviews into clear phases.",
    },
  });

  // Feedback on Session 1
  await prisma.sessionFeedback.create({
    data: {
      sessionId: session1.id,
      giverId: aaravUser.id,
      receiverId: alexUser.id,
      rating: 5,
      comments: "Incredible insight! Alex gave me real-world perspective that completely transformed how I explain system scalability.",
      keyTakeaways: "Start with functional requirements, quantify QPS and storage bottlenecks before picking databases.",
      followUpRequired: false,
    },
  });

  // Upcoming Scheduled Session
  await prisma.mentorshipSession.create({
    data: {
      relationshipId: relationship1.id,
      studentId: aaravUser.id,
      alumniId: alexUser.id,
      title: "Deep Dive: Distributed Rate Limiter & Message Queues",
      description: "Technical mock interview and whiteboarding on designing a high-throughput rate limiter using Redis and sliding window counters.",
      scheduledDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days in future
      durationMinutes: 60,
      status: "SCHEDULED",
      virtualMeetingUrl: "/rooms/session-deepdive-882",
      agenda: "1. 30 min: Live Whiteboard System Design\n2. 15 min: In-depth critique on failure modes & network partitions\n3. 15 min: Action item review and next steps",
    },
  });

  // Goals & Action Items for Aarav & Alex
  const goal1 = await prisma.mentorshipGoal.create({
    data: {
      relationshipId: relationship1.id,
      title: "Master High-Scale System Design Fundamentals",
      description: "Prepare thoroughly for Senior/New-Grad System Design rounds covering caching, sharding, consensus, and event-driven patterns.",
      targetDate: new Date("2024-12-30"),
      status: "IN_PROGRESS",
      priority: "HIGH",
      progressPercent: 65,
    },
  });

  await prisma.actionItem.createMany({
    data: [
      {
        goalId: goal1.id,
        title: "Complete architectural write-up for Distributed Rate Limiter",
        assignedRole: "STUDENT",
        isCompleted: true,
        completedAt: new Date(),
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        goalId: goal1.id,
        title: "Review Martin Kleppmann's Chapter on Partitioning & Replication",
        assignedRole: "STUDENT",
        isCompleted: true,
        completedAt: new Date(),
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        goalId: goal1.id,
        title: "Mock System Design interview on Distributed Message Broker (Kafka/RabbitMQ)",
        assignedRole: "STUDENT",
        isCompleted: false,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        goalId: goal1.id,
        title: "Share Google L4 rubrics and architectural evaluation checklist",
        assignedRole: "ALUMNI",
        isCompleted: true,
        completedAt: new Date(),
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  const goal2 = await prisma.mentorshipGoal.create({
    data: {
      relationshipId: relationship1.id,
      title: "Refine Technical Resume & Quantify Project Impact",
      description: "Transform generic project bullets into quantified metric-driven achievements (e.g. latency, throughput, cost).",
      targetDate: new Date("2024-11-25"),
      status: "ACHIEVED",
      priority: "MEDIUM",
      progressPercent: 100,
    },
  });

  await prisma.actionItem.create({
    data: {
      goalId: goal2.id,
      title: "Incorporate Alex's feedback on concurrent microservices project",
      assignedRole: "STUDENT",
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  // Direct In-Platform Messages (Protecting contact info!)
  await prisma.directMessage.createMany({
    data: [
      {
        relationshipId: relationship1.id,
        senderId: alexUser.id,
        receiverId: aaravUser.id,
        content: "Hi Aarav! I reviewed the distributed rate limiter diagram you shared. Really solid consideration of Redis cluster failovers! Let's drill into sliding log vs token bucket in our next session.",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isRead: true,
      },
      {
        relationshipId: relationship1.id,
        senderId: aaravUser.id,
        receiverId: alexUser.id,
        content: "Thank you Alex! I've updated the action items and prepared benchmark notes comparing memory footprint for 10M active API keys. Excited for our Saturday call!",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        isRead: true,
      },
    ],
  });

  // Pending Mentorship Request (Sara Lin -> Dr. Priya Sharma)
  await prisma.mentorshipRequest.create({
    data: {
      studentId: saraUser.id,
      alumniId: priyaUser.id,
      status: "PENDING",
      message: "Dear Dr. Sharma, I am a 3rd-year student researching multimodal LLM alignment. Your work at Microsoft Research is deeply inspiring. I would be immensely grateful for your mentorship regarding research methodologies and preparing for competitive AI residency programs.",
      preferredTrack: "AI Engineering & Research Residency Prep",
    },
  });

  // 5. Example Inactive/Decayed Relationship (Simulating Anti-Decay Warning for Institutional Admin)
  const decayingRequest = await prisma.mentorshipRequest.create({
    data: {
      studentId: saraUser.id,
      alumniId: marcusUser.id,
      status: "ACCEPTED",
      message: "Exploring transition from technical engineering to fintech product management.",
      preferredTrack: "Product Strategy & Career Pivot",
      responseNote: "Happy to share my experience from Goldman to Stripe.",
    },
  });

  await prisma.mentorshipRelationship.create({
    data: {
      requestId: decayingRequest.id,
      studentId: saraUser.id,
      alumniId: marcusUser.id,
      status: "ACTIVE",
      startDate: new Date("2024-09-01"),
      lastInteractionDate: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000), // 19 days ago = STALLED!
      decayRiskStatus: "STALLED",
      healthScore: 42,
      notes: "Pairing has been inactive for nearly 3 weeks. System flagged for automated nudging.",
    },
  });

  // 6. Institutional Audit Logs
  await prisma.institutionalAuditLog.createMany({
    data: [
      {
        eventType: "ALUMNI_VERIFIED",
        actorName: "Dr. Sarah Jenkins (Registrar)",
        targetName: "Alex Chen (Google)",
        description: "Alumni identity and graduation credentials verified via Official University Records (Class of 2018).",
        severity: "SUCCESS",
        createdAt: new Date("2024-01-15T10:00:00Z"),
      },
      {
        eventType: "ALUMNI_VERIFIED",
        actorName: "Dr. Sarah Jenkins (Registrar)",
        targetName: "Dr. Priya Sharma (Microsoft)",
        description: "Verified institutional doctorate credentials and professional appointment at Microsoft Research.",
        severity: "SUCCESS",
        createdAt: new Date("2024-02-10T14:30:00Z"),
      },
      {
        eventType: "PAIRING_CREATED",
        actorName: "Matching Engine",
        targetName: "Aarav Mehta & Alex Chen",
        description: "High-compatibility match (96% compatibility) accepted. Anti-decay monitoring activated.",
        severity: "INFO",
        createdAt: new Date("2024-10-01T09:15:00Z"),
      },
      {
        eventType: "DECAY_WARNING",
        actorName: "Platform Anti-Decay Watchdog",
        targetName: "Sara Lin & Marcus Vance",
        description: "Relationship has had zero recorded sessions or milestones in 19 days. Health score dropped to 42. Automated re-engagement prompt queued.",
        severity: "WARNING",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        eventType: "SESSION_COMPLETED",
        actorName: "System Automation",
        targetName: "Aarav Mehta & Alex Chen",
        description: "45-minute virtual mentorship session completed with 5-star mutual feedback.",
        severity: "SUCCESS",
        createdAt: new Date("2024-10-15T18:50:00Z"),
      },
    ],
  });

  console.log("Database successfully seeded with realistic verification, matching, and engagement data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
