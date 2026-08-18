import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://neuralclash.dev";

const routeMeta: Record<string, { title: string; description: string; robots?: string }> = {
  "/": {
    title: "MindGrid: Neural Clash - Play Free Online Memory Game by Klyvex Studios",
    description:
      "Play MindGrid: Neural Clash, the ultimate competitive online memory game by Klyvex Studios. Real-time multiplayer duels, speed sprint races, solo boards, combo streaks, and global Hall of Fame leaderboards.",
  },
  "/play": {
    title: "Play MindGrid - Choose Your Memory Board | Klyvex Studios",
    description:
      "Choose a MindGrid board size and match type, then start a focused single-player memory challenge.",
    robots: "noindex, nofollow",
  },
  "/ranks": {
    title: "Global Leaderboards & Hall of Fame - MindGrid: Neural Clash",
    description:
      "View live MindGrid global ranks, top memory game operatives, ratings, total points, best scores, accuracy, max combo, and multiplayer win stats.",
  },
  "/contact": {
    title: "Contact & Player Support - MindGrid: Neural Clash | Klyvex Studios",
    description:
      "Contact Klyvex Studios and the MindGrid team for player support, feature suggestions, bug reports, and partnership inquiries.",
  },
  "/hall-of-fame": {
    title: "MindGrid Hall of Fame - Memory Game Leaderboard",
    description:
      "View the MindGrid Hall of Fame leaderboard and compare top memory game scores, ratings, accuracy, combos, and times.",
    robots: "noindex, nofollow",
  },
  "/login": {
    title: "Login - MindGrid: Neural Clash",
    description: "Log in to your MindGrid account to sync your memory ratings, multiplayer stats, and founder perks.",
    robots: "noindex, nofollow",
  },
  "/register": {
    title: "Create Account - MindGrid: Neural Clash",
    description: "Create a free MindGrid account to unlock multiplayer battles, profile badges, and global rankings.",
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
  "/cyberpath": {
    title: "CyberPath - MindGrid",
    description: "Archived event page.",
    robots: "noindex, nofollow",
  },
  "/cyberpath/play": {
    title: "CyberPath Rounds - MindGrid",
    description: "Archived event page.",
    robots: "noindex, nofollow",
  },
  "/cyberpath/bonus": {
    title: "CyberPath Bonus - MindGrid",
    description: "Archived event page.",
    robots: "noindex, nofollow",
  },
  "/cyberpath/results": {
    title: "CyberPath Results - MindGrid",
    description: "Archived event page.",
    robots: "noindex, nofollow",
  },
  "/cyberpath/live": {
    title: "CyberPath Live - MindGrid",
    description: "Archived event page.",
    robots: "noindex, nofollow",
  },
};

const dynamicMeta = (pathname: string) => {
  if (pathname.startsWith("/cyberpath")) {
    return {
      title: "CyberPath - MindGrid",
      description: "Archived event page.",
      robots: "noindex, nofollow",
    };
  }

  if (pathname.startsWith("/results/")) {
    return {
      title: "Run Results - MindGrid",
      description: "Review a completed MindGrid run.",
      robots: "noindex, nofollow",
    };
  }

  if (pathname.startsWith("/profile")) {
    return {
      title: "Player Profile - MindGrid: Neural Clash",
      description: "View MindGrid player progress and recent runs.",
      robots: "noindex, nofollow",
    };
  }

  if (pathname.startsWith("/multiplayer")) {
    return {
      title: "Multiplayer Clash Arena - MindGrid",
      description: "Online multiplayer memory game room.",
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
    const ogImage = `${SITE_URL}/og-image.png`;

    document.title = meta.title;
    setMetaByName("description", meta.description);
    setMetaByName("robots", meta.robots ?? "index, follow");
    setCanonical(canonical);

    // OpenGraph Tags
    setMetaByProperty("og:type", "website");
    setMetaByProperty("og:site_name", "MindGrid: Neural Clash | Klyvex Studios");
    setMetaByProperty("og:title", meta.title);
    setMetaByProperty("og:description", meta.description);
    setMetaByProperty("og:url", canonical);
    setMetaByProperty("og:image", ogImage);
    setMetaByProperty("og:image:secure_url", ogImage);
    setMetaByProperty("og:image:type", "image/png");
    setMetaByProperty("og:image:width", "1200");
    setMetaByProperty("og:image:height", "630");
    setMetaByProperty("og:image:alt", "MindGrid: Neural Clash by Klyvex Studios");

    // Twitter Card Tags
    setMetaByName("twitter:card", "summary_large_image");
    setMetaByName("twitter:site", "@klyvex_studios");
    setMetaByName("twitter:creator", "@klyvex_studios");
    setMetaByName("twitter:title", meta.title);
    setMetaByName("twitter:description", meta.description);
    setMetaByName("twitter:image", ogImage);
    setMetaByName("twitter:image:alt", "MindGrid: Neural Clash by Klyvex Studios");
  }, [pathname]);

  return null;
};
