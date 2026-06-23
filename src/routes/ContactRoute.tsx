import { Link } from "react-router-dom";
import { MailIcon, PlayIcon, SparklesIcon } from "../components/AppIcons";
import { PublicSiteShell } from "../components/PublicSiteShell";

const contactCards = [
  {
    title: "Player feedback",
    text: "Tell us what feels fun, confusing, too easy, too hard, or missing from the current game flow.",
    action: "Send Feedback",
    href: "mailto:akintunde.dolapo1@gmail.com?subject=MindGrid%20player%20feedback",
  },
  {
    title: "Bug reports",
    text: "Share device, browser, route, and what happened so we can reproduce and fix issues faster.",
    action: "Report a Bug",
    href: "mailto:akintunde.dolapo1@gmail.com?subject=MindGrid%20bug%20report",
  },
  {
    title: "Support",
    text: "Need help with login, profile email, score saving, or leaderboard placement? Send the details.",
    action: "Get Support",
    href: "mailto:akintunde.dolapo1@gmail.com?subject=MindGrid%20support",
  },
];

export const ContactRoute = () => (
  <PublicSiteShell active="contact">
    <main className="mx-auto flex min-h-[calc(100svh-170px)] max-w-[1280px] flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[#3525cd] shadow-[0_14px_30px_rgba(53,37,205,0.08)] backdrop-blur-xl sm:text-xs">
            <MailIcon className="h-4 w-4" />
            Contact MindGrid
          </div>
          <h1 className="mt-5 font-display text-5xl font-extrabold tracking-[-0.06em] text-[#111c2d] sm:text-7xl">
            Help shape the grid.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[#4f5568] sm:text-lg">
            MindGrid is being built around real player feedback. If something feels off, exciting, broken, or worth expanding, send it in.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:akintunde.dolapo1@gmail.com?subject=MindGrid%20message"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-b from-[#4f46e5] to-[#3525cd] px-8 py-4 font-semibold text-white shadow-[0_18px_30px_rgba(53,37,205,0.22)]"
            >
              <MailIcon className="h-5 w-5" />
              Email Us
            </a>
            <Link to="/register" className="inline-flex items-center justify-center gap-3 rounded-full border border-[#d9d8eb] bg-white/80 px-8 py-4 font-semibold text-[#3525cd]">
              <PlayIcon className="h-5 w-5" />
              Join the Game
            </Link>
          </div>
        </div>

        <div className="glass-panel rounded-[2.2rem] p-5 shadow-[0_18px_40px_rgba(53,37,205,0.08)] sm:p-7">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.3rem] bg-[#f1efff] text-[#3525cd]">
              <SparklesIcon className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7d8395]">Best message format</p>
              <h2 className="text-2xl font-bold tracking-[-0.04em] text-[#111c2d]">What to include</h2>
            </div>
          </div>
          <div className="space-y-3 text-sm leading-7 text-[#586074]">
            <p className="rounded-[1.2rem] bg-white/70 px-4 py-3">Your username or email if the issue is account-related.</p>
            <p className="rounded-[1.2rem] bg-white/70 px-4 py-3">The page or screen where it happened, such as landing, lobby, game board, ranks, or profile.</p>
            <p className="rounded-[1.2rem] bg-white/70 px-4 py-3">Your device and browser, especially for mobile display issues.</p>
          </div>
        </div>
      </section>

      <section className="mt-9 grid gap-4 md:grid-cols-3">
        {contactCards.map((card) => (
          <article key={card.title} className="glass-panel rounded-[1.8rem] p-6 shadow-[0_14px_32px_rgba(53,37,205,0.06)]">
            <h2 className="text-xl font-bold tracking-[-0.03em] text-[#111c2d]">{card.title}</h2>
            <p className="mt-3 min-h-[5.5rem] text-sm leading-7 text-[#586074]">{card.text}</p>
            <a href={card.href} className="mt-5 inline-flex w-full justify-center rounded-full bg-white/80 px-5 py-3 text-sm font-semibold text-[#3525cd] shadow-sm">
              {card.action}
            </a>
          </article>
        ))}
      </section>
    </main>
  </PublicSiteShell>
);
