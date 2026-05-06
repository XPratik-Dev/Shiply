<div align="center">

<h1>⚡ Shiply</h1>

<p><strong>Turn GitHub commits into polished changelogs — powered by AI.</strong><br/>
No manual writing. No copy-pasting. Just ship.</p>

<br/>

[![Next.js](https://img.shields.io/badge/Next.js_14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Anthropic](https://img.shields.io/badge/Claude_AI-D97757?style=for-the-badge&logo=anthropic&logoColor=white)](https://anthropic.com)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=black)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Vercel-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

<br/>

[**Live Demo**](https://shiply.vercel.app) · [**Report Bug**](https://github.com/YOUR_USERNAME/shiply/issues) · [**Request Feature**](https://github.com/YOUR_USERNAME/shiply/issues)

<br/>

</div>

---

## 📖 Overview

**Shiply** connects to any GitHub repository, fetches your commit history, and uses Claude AI to generate structured, human-readable release notes in seconds. Draft, edit, and publish changelogs to beautiful public pages your users can bookmark — all from one clean dashboard.

Built for developers and product teams who ship fast and want consistent release communication without the manual work.

---

## ✨ Features

- 🔗 &nbsp;**GitHub Integration** — Import any public repo, filter commits by date range or branch
- 🤖 &nbsp;**AI Generation** — Claude analyzes commits and writes grouped, categorized changelogs
- ✏️ &nbsp;**Edit & Refine** — Rich editor to tweak AI output, reorder entries, update metadata
- 🌐 &nbsp;**Public Pages** — One-click publish to a shareable, permanent public URL
- 💳 &nbsp;**Billing Built-in** — Stripe-powered Free / Pro / Team plans with enforced limits
- 🌙 &nbsp;**Dark & Light Mode** — Persisted theme preference across sessions
- 📧 &nbsp;**Email Notifications** — Notify users when a new changelog goes live via Resend
- ⚡ &nbsp;**Streaming Generation** — Real-time AI output so you see it build live

---

## 🖼️ Screenshots

### 🏠 Landing Page
<img width="1181" height="646" alt="Screenshot 1" src="https://github.com/user-attachments/assets/727eaf1c-7f6c-42b4-a02a-e939a1455d1b" />

<br/>

### 📊 Dashboard
<img width="1154" height="632" alt="Screenshot 2" src="https://github.com/user-attachments/assets/249be8b0-1b90-4991-9c79-bb5fe84f8e7a" />

<br/>

### 🗂️ Repositories
<img width="982" height="610" alt="Screenshot 3" src="https://github.com/user-attachments/assets/1c2a7545-0b41-41c7-8e2d-bf80479425d3" />

<br/>

### 📋 Changelogs
<img width="993" height="555" alt="Screenshot 4" src="https://github.com/user-attachments/assets/feca6033-740b-445e-a825-d03511bbe28f" />

<br/>

### 💳 Billing & Plans
<img width="1229" height="559" alt="Screenshot 5" src="https://github.com/user-attachments/assets/465d554f-75c7-4a32-a77f-8c9112367c5c" />

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | Full-stack React with SSR + API routes |
| **Language** | TypeScript | End-to-end type safety |
| **AI** | Anthropic Claude API | Commit → changelog generation |
| **Auth** | NextAuth.js + GitHub OAuth | One-click GitHub sign-in |
| **Database** | Supabase (PostgreSQL) | Hosted Postgres with realtime |
| **ORM** | Prisma | Type-safe database queries |
| **Payments** | Stripe | Subscriptions + customer portal |
| **Email** | Resend | Transactional email notifications |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Rate Limiting** | Upstash Redis | API protection + caching |
| **Hosting** | Vercel | Zero-config Next.js deployment |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [GitHub OAuth App](https://github.com/settings/developers)
- An [Anthropic API key](https://console.anthropic.com)
- A [Stripe](https://stripe.com) account *(optional for billing)*
- A [Resend](https://resend.com) account *(optional for email)*

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/shiply.git
cd shiply
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
# App
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Database
DATABASE_URL=your_supabase_connection_string

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Stripe (optional)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Resend (optional)
RESEND_API_KEY=re_...
```

**4. Set up the database**

```bash
npx prisma generate
npx prisma db push
```

**5. Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you're live. ✅

---

## 💰 Pricing

| Plan | Price | Repositories | Changelogs / mo | Public Pages |
|---|---|---|---|---|
| **Free** | $0 / mo | 3 | 10 | ✅ |
| **Pro** | $19 / mo | 20 | 100 | ✅ |
| **Team** | $49 / mo | Unlimited | Unlimited | ✅ |

---

## 🗂️ Project Structure

```
shiply/
├── app/
│   ├── (dashboard)/        # Protected dashboard routes
│   ├── changelog/[slug]/   # Public changelog pages
│   └── api/                # API routes
├── components/             # Reusable UI components
├── lib/                    # GitHub, AI, Stripe, email helpers
├── prisma/                 # Database schema & migrations
└── .github/
    └── screenshots/        # Repo screenshots
        ├── Screenshot_1.png   ← Landing page
        ├── Screenshot_2.png   ← Dashboard
        ├── Screenshot_3.png   ← Repositories
        ├── Screenshot_4.png   ← Changelogs
        └── Screenshot_5.png   ← Billing
```

---

## 🗺️ Roadmap

- [ ] Custom domains for public changelog pages
- [ ] Webhook auto-generation on push
- [ ] Team member seats & roles
- [ ] Embeddable changelog widget
- [ ] Slack / Discord notifications
- [ ] CSV + JSON changelog export

---

## 🤝 Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/your-feature
git commit -m "feat: add your feature"
git push origin feature/your-feature
# Open a pull request
```

---

## 📄 License

MIT © [Your Name](https://github.com/YOUR_USERNAME)

---

<div align="center">

<br/>

Built with ❤️ using [Next.js](https://nextjs.org) · [Anthropic Claude](https://anthropic.com) · [Supabase](https://supabase.com)

<br/>

⭐ **Star this repo if Shiply saves you time**

</div>
