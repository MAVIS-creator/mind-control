import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://neuralclash.dev";

const routeMeta: Record<string, { title: string; description: string; robots?: string }> = {
  "/": {
    title: "MindGrid: Neural Clash - Online Memory Game",
    description:
      "Play MindGrid: Neural Clash, a fast online memory game with classic boards, score chasing, combos, ranks, and a Hall of Fame leaderboard.",
  },
  "/play": {
    title: "Play MindGrid - Choose Your Memory Board",
    description:
      "Choose a MindGrid board size and match type, then start a focused single-player memory challenge.",
    robots: "noindex, nofollow",
  },
  "/ranks": {
    title: "MindGrid Ranks - Public Memory Game Leaderboard",
    description:
      "View public MindGrid ranks, top memory game players, ratings, total points, best scores, accuracy, combo, and time.",
  },
  "/contact": {
    title: "Contact MindGrid - Feedback and Support",
    description:
      "Contact MindGrid for player feedback, bug reports, account support, and game improvement ideas.",
  },
  "/hall-of-fame": {
    title: "MindGrid Hall of Fame - Memory Game Leaderboard",
    description:
      "View the MindGrid Hall of Fame leaderboard and compare top memory game scores, ratings, accuracy, combos, and times.",
    robots: "noindex, nofollow",
  },
  "/login": {
    title: "Login - MindGrid",
    description: "Log in to your MindGrid account.",
    robots: "noindex, nofollow",
  },
  "/register": {
    title: "Create Account - MindGrid",
    description: "Create a MindGrid account to save progress and leaderboard runs.",
    robots: "noindex, nofollow",
  },
  "/forgot-password": {
    title: "Reset Password - MindGrid",
    description: "Request a MindGrid password reset link.",
    robots: "noindex, nofollow",
  },
  "/reset-password": {
    title: "Set New Password - MindGrid",
    description: "Set a new password for your MindGrid account.",
    robots: "noindex, nofollow",
  },
  "/complete-email": {
    title: "Complete Email - MindGrid",
    description: "Add an email address to your MindGrid account.",
    robots: "noindex, nofollow",
  },
  "/play/classic": {
    title: "Classic Sync Mode - MindGrid",
    description: "Play Classic Sync Mode in MindGrid, a timed memory board with moves, combos, score, and accuracy.",
    robots: "noindex, nofollow",
  },
  "/mavisbk": {
    title: "Admin - MindGrid",
    description: "MindGrid admin panel.",
    robots: "noindex, nofollow",
  },
};

const dynamicMeta = (pathname: string) => {
  if (pathname.startsWith("/results/")) {
    return {
      title: "Run Results - MindGrid",
      description: "Review a completed MindGrid run.",
      robots: "noindex, nofollow",
    };
  }

  if (pathname.startsWith("/profile")) {
    return {
      title: "Player Profile - MindGrid",
      description: "View MindGrid player progress and recent runs.",
      robots: "noindex, nofollow",
    };
  }

  return routeMeta[pathname] ?? routeMeta["/"];
};

const setMetaByName = (name: string, content: string) => {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.name = name;
    document.head.appendChild(tag);
  }
  tag.content = content;
};

const setMetaByProperty = (property: string, content: string) => {
  let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.content = content;
};

const setCanonical = (url: string) => {
  let tag = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!tag) {
    tag = document.createElement("link");
    tag.rel = "canonical";
    document.head.appendChild(tag);
  }
  tag.href = url;
};

export const Seo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = dynamicMeta(pathname);
    const canonicalPath = meta.robots?.startsWith("noindex") ? "/" : pathname;
    const canonical = `${SITE_URL}${canonicalPath === "/" ? "/" : canonicalPath}`;

    document.title = meta.title;
    setMetaByName("description", meta.description);
    setMetaByName("robots", meta.robots ?? "index, follow");
    setCanonical(canonical);
    setMetaByProperty("og:title", meta.title);
    setMetaByProperty("og:description", meta.description);
    setMetaByProperty("og:url", canonical);
    setMetaByName("twitter:title", meta.title);
    setMetaByName("twitter:description", meta.description);
  }, [pathname]);

  return null;
};
