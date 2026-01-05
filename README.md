<div align="center">
  <img src="public/favicon.svg" alt="Atomio Logo" width="80" height="80" />

  # Atomio

  **Small habits. Big results.**

  Track your daily habits and watch 1% daily improvements compound into life-changing results.

  [Live Demo](https://atomio.app) · [Report Bug](https://github.com/lazarspasic96/atomio-app/issues) · [Request Feature](https://github.com/lazarspasic96/atomio-app/issues)

</div>

---

## About

Atomio is a free, open-source habit tracking application inspired by James Clear's *Atomic Habits*. The core philosophy is simple: small, consistent improvements compound over time to create remarkable results.

### Key Features

- **Daily Habit Tracking** - Mark habits complete with a simple click
- **Streak Tracking** - Build momentum with current and longest streak stats
- **Two-Day Rule** - Get warnings when you're at risk of breaking a streak
- **Calendar View** - Visualize your progress over weeks and months
- **Dashboard Analytics** - See completion rates, trends, and your best days
- **Category Organization** - Group habits by health, productivity, mindfulness, and more
- **Flexible Scheduling** - Set habits for specific days or frequency per week
- **Level & XP System** - Gamify your progress with experience points
- **Dark Mode** - Easy on the eyes, beautiful by design

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth) (Google OAuth)
- **API**: [tRPC](https://trpc.io/) for end-to-end type safety
- **Deployment**: [Vercel](https://vercel.com/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/) database
- [Supabase](https://supabase.com/) project (for authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lazarspasic96/atomio-app.git
   cd atomio-app
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Fill in your environment variables:
   ```env
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)** in your browser

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── (marketing)/       # Public marketing pages
│   └── api/               # API routes (tRPC)
├── components/            # Shared UI components
│   ├── layout/           # Header, footer, etc.
│   └── ui/               # shadcn/ui components
├── features/             # Feature-based modules
│   ├── auth/             # Authentication logic
│   ├── dashboard/        # Dashboard components
│   └── habits/           # Habit tracking logic
├── lib/                  # Utility libraries
├── server/               # Server-side code
│   ├── api/              # tRPC routers
│   └── db.ts             # Database client
└── styles/               # Global styles
```

## Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Inspired by [Atomic Habits](https://jamesclear.com/atomic-habits) by James Clear
- Built with the [T3 Stack](https://create.t3.gg/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

<div align="center">
  <p>Built with dedication by <a href="https://github.com/lazarspasic96">Lazar Spasic</a></p>
  <p>
    <a href="https://atomio.app">Website</a> ·
    <a href="https://github.com/lazarspasic96/atomio-app">GitHub</a>
  </p>
</div>
