# AlumniSphere • Verified Alumni Mentorship & Engagement Platform

> *"Mentorship that feels human, not transactional."*

AlumniSphere is a modern, intentional alumni-to-student mentorship network built with **Next.js 16 (App Router + Turbopack)**, **Prisma ORM**, **Tailwind CSS v4**, and **SQLite**. Designed with a warm editorial aesthetic ("Digital Living Room"), it features verifiable registrar degree verification, smart goal-to-skill matchmaking, protected contact masking, and proactive anti-decay nudges.

---

## ✨ Key Features

- **🎓 Registrar-Verified Credentials**: Campus registrar badge validation with tamper-resistant credential stamps.
- **🎯 Career Goal Matchmaking**: Goal-to-skill alignment engine tailoring alumni mentors based on student aspirations (Cloud, AI/ML, Fintech, DevOps).
- **🔒 Private by Design (Contact Masking)**: Secure relay preventing off-platform spam while keeping personal contacts confidential until mutual trust is formed.
- **⏳ Anti-Decay Momentum Engine**: Automatic cadence detection that nudges inactive mentorship loops to preserve momentum.
- **🎨 Warm Editorial Aesthetic**: Inspired by Kinfolk and minimalist lifestyle publications, featuring Open Doodles line art, analog grain texture overlays, and smooth parallax floating physics.
- **⚡ Next.js 16 & Turbopack**: Blazing fast server-rendered dynamic routes, static optimization, and zero-runtime overhead.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Database & ORM**: [Prisma](https://www.prisma.io/) with SQLite
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Typography**: Outfit, Dancing Script, Caveat
- **Illustrations**: Open Doodles by Pablo Stanley

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **npm** or **pnpm** / **yarn**

### 1. Clone & Install

```bash
git clone https://github.com/ashrafamaan/alumnisphere.git
cd alumnisphere
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 3. Database Migration & Seed

Initialize the SQLite database with rich mock data (verified alumni, student profiles, active mentorship relationships, and goal items):

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Production Build

```bash
npm run build
npm run start
```

---

## 👤 Author

Crafted by **Amaan Ashraf**
- GitHub: [@ashrafamaan](https://github.com/ashrafamaan)
- LinkedIn: [Amaan Ashraf](https://www.linkedin.com/in/amaanashraf/)

---

## 📄 License

This project is licensed under the MIT License.
