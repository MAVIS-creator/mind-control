export type CyberPathCategory = {
  title: string;
  paths: string[];
  beginnerNotes?: Array<{ term: string; meaning: string }>;
};

export const cyberpathCategories: CyberPathCategory[] = [
  {
    title: "Security Operations and Defence",
    paths: [
      "SOC Analyst",
      "Incident Response",
      "Digital Forensics",
      "Threat Intelligence",
      "Threat Hunting",
      "Detection Engineering",
      "SIEM and Security Monitoring Engineering",
      "Malware Analysis",
      "Endpoint Security",
      "Network Security",
      "Vulnerability Management",
    ],
  },
  {
    title: "Offensive Security",
    paths: [
      "Penetration Testing",
      "Ethical Hacking",
      "Red Teaming and Adversary Simulation",
      "Bug Bounty Hunting",
      "Vulnerability Research",
      "Web Application Security Testing",
      "Mobile Application Security Testing",
      "Wireless Security Testing",
      "Exploit Development",
    ],
    beginnerNotes: [
      {
        term: "Penetration testing",
        meaning: "Structured, authorised testing with a defined scope and report.",
      },
      {
        term: "Ethical hacking",
        meaning: "Broad authorised security testing and vulnerability discovery.",
      },
      {
        term: "Red teaming",
        meaning: "Realistic adversary simulation against people, processes and technology.",
      },
      {
        term: "Bug bounty",
        meaning: "Finding vulnerabilities within an organisation's authorised programme.",
      },
    ],
  },
  {
    title: "Application and Product Security",
    paths: [
      "Application Security",
      "Secure Software Development",
      "Product Security",
      "DevSecOps",
      "API Security",
      "Software Supply Chain Security",
      "Security Code Review",
    ],
  },
  {
    title: "Cloud and Infrastructure Security",
    paths: [
      "Cloud Security",
      "Cloud Security Engineering",
      "Cloud Security Architecture",
      "Identity and Access Management",
      "Privileged Access Management",
      "Container and Kubernetes Security",
      "Infrastructure Security",
      "Zero Trust Architecture",
    ],
  },
  {
    title: "Hardware and Specialised Security",
    paths: [
      "Firmware Security",
      "Embedded Systems Security",
      "Internet of Things Security",
      "Hardware Security",
      "Operational Technology and ICS Security",
      "Automotive Security",
      "Telecommunications Security",
      "Drone and Robotics Security",
    ],
  },
  {
    title: "Emerging Security Areas",
    paths: [
      "Artificial Intelligence Security",
      "Machine Learning Security",
      "Blockchain and Web3 Security",
      "Smart Contract Auditing",
      "Cryptography",
      "Public Key Infrastructure",
      "Quantum-Safe Security Research",
    ],
  },
  {
    title: "Governance, Risk and Compliance",
    paths: [
      "Governance, Risk and Compliance",
      "Cybersecurity Auditing",
      "Information Security Risk Management",
      "Third-Party Risk Management",
      "Privacy and Data Protection",
      "Security Policy and Standards",
      "Business Continuity",
      "Disaster Recovery",
      "Cybersecurity Awareness and Training",
    ],
  },
  {
    title: "Security Engineering, Research and Leadership",
    paths: [
      "Security Engineering",
      "Security Architecture",
      "Security Research",
      "Cybersecurity Consulting",
      "Cybercrime Investigation",
      "Security Product Management",
      "Cybersecurity Project Management",
      "Security Programme Management",
      "Cybersecurity Education and Technical Writing",
      "Security Leadership and CISO Career Track",
    ],
  },
];
