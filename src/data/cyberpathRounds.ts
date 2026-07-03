export type CyberPathPair = {
  id: string;
  prompt: string;
  answer: string;
};

export type CyberPathRound = {
  id: "careers" | "terms" | "scenarios";
  number: number;
  title: string;
  subtitle: string;
  summary: string;
  pairs: CyberPathPair[];
};

export const CYBERPATH_EVENT_ID = "cyberpath-seminar-2026";
export const CYBERPATH_EVENT_LABEL = "CyberPath Seminar 2026";

export const cyberpathRounds: CyberPathRound[] = [
  {
    id: "careers",
    number: 1,
    title: "Cybersecurity Careers",
    subtitle: "Match the work to the career path.",
    summary:
      "Cybersecurity careers are wider than hacking. They include analysis, forensics, secure engineering, risk, cloud, and incident response.",
    pairs: [
      { id: "pentest", prompt: "Authorised security testing", answer: "Penetration Tester" },
      { id: "soc", prompt: "Monitoring alerts and suspicious activity", answer: "Security Analyst" },
      { id: "cloud", prompt: "Designing secure cloud systems", answer: "Cloud Security Engineer" },
      { id: "network", prompt: "Protecting networks and firewalls", answer: "Network Security Engineer" },
      { id: "forensics", prompt: "Investigating cyber crimes and evidence", answer: "Digital Forensics Analyst" },
      { id: "appsec", prompt: "Building secure software practices", answer: "Application Security Engineer" },
      { id: "grc", prompt: "Explaining risks to leaders", answer: "GRC Specialist" },
      { id: "incident", prompt: "Responding to active incidents", answer: "Incident Responder" },
    ],
  },
  {
    id: "terms",
    number: 2,
    title: "Cyber and Professional Terms",
    subtitle: "Connect seminar terms to their meaning.",
    summary:
      "Strong tech careers are built from practical tools, professional presence, documentation, and basic security awareness.",
    pairs: [
      { id: "git", prompt: "Saving project versions with commits", answer: "Git" },
      { id: "github", prompt: "Online portfolio for code projects", answer: "GitHub" },
      { id: "linkedin", prompt: "Professional profile and career networking", answer: "LinkedIn" },
      { id: "flag", prompt: "Secret proof hidden in a challenge", answer: "Flag" },
      { id: "phishing", prompt: "Fake message trying to steal info", answer: "Phishing" },
      { id: "mfa", prompt: "Extra login proof after password", answer: "Multi-Factor Authentication" },
      { id: "readme", prompt: "Readable project instructions", answer: "README" },
      { id: "pr", prompt: "Tracking a code change request", answer: "Pull Request" },
    ],
  },
  {
    id: "scenarios",
    number: 3,
    title: "Security Scenarios",
    subtitle: "Identify who handles each situation.",
    summary:
      "Scenario thinking helps you understand what cybersecurity professionals actually do when something suspicious happens.",
    pairs: [
      { id: "incident", prompt: "A company is hit by ransomware", answer: "Incident Responder" },
      { id: "forensics", prompt: "Collecting evidence from a seized computer", answer: "Digital Forensics" },
      { id: "threat-intel", prompt: "Researching attacker behaviour and indicators", answer: "Threat Intelligence" },
      { id: "soc", prompt: "A dashboard shows unusual login attempts", answer: "Security Analyst" },
      { id: "pentest", prompt: "A school asks for a safe system test", answer: "Penetration Tester" },
      { id: "grc", prompt: "A manager asks what security rules are needed", answer: "GRC Specialist" },
      { id: "appsec", prompt: "A website form accepts unsafe input", answer: "Application Security" },
      { id: "network", prompt: "Unknown traffic is leaving the network", answer: "Network Security" },
    ],
  },
];
