export type CyberPathChallenge = {
  id: string;
  title: string;
  prompt: string;
  body: string;
  expectedAnswer: string;
  points: number;
  hint: string;
};

export const cyberpathChallenges: CyberPathChallenge[] = [
  {
    id: "decode-message",
    title: "Decode the message",
    prompt: "Decode this Base64 text.",
    body: "Q1lCRVJQQVRI",
    expectedAnswer: "CYBERPATH",
    points: 100,
    hint: "The answer is a plain uppercase word.",
  },
  {
    id: "find-flag",
    title: "Find the flag",
    prompt: "Inspect the safe mock page snippet and find the hidden flag.",
    body: `<main>
  <h1>Welcome to the seminar</h1>
  <p>Read the project documentation first.</p>
  <!-- FLAG{README_FIRST} -->
</main>`,
    expectedAnswer: "FLAG{README_FIRST}",
    points: 100,
    hint: "Look closely at the included source snippet.",
  },
  {
    id: "analyse-log",
    title: "Analyse the log",
    prompt: "Which log entry is most suspicious?",
    body: `10:31 Successful login - 192.168.1.14
10:32 Successful login - 192.168.1.14
10:33 Failed login - 45.77.21.90
10:33 Failed login - 45.77.21.90
10:34 Successful login - 45.77.21.90`,
    expectedAnswer: "10:34",
    points: 100,
    hint: "Find the successful login that follows repeated failures from an unfamiliar IP.",
  },
];
