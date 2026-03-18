import {
  type JDAnalysis,
  type JDConfidenceScores,
  type JDEmployerSignal,
  type JDGap,
  type JDPrepTask,
  type JDRound,
  type JDTheme
} from "@/lib/types";

interface JDSeed {
  analysisId?: string;
  rawText?: string;
  role?: string;
  company?: string;
  summary?: string;
  keySkills?: string[];
  criticalGaps?: JDGap[];
  interviewRounds?: JDRound[];
  whatMattersMost?: JDTheme[];
  employerSignals?: JDEmployerSignal[];
  prep48h?: JDPrepTask[];
  prep2Week?: JDPrepTask[];
  generalTips?: string[];
  confidenceScores?: Partial<JDConfidenceScores>;
  seniority?: string;
  geography?: string;
  jobFamily?: string;
  functionArea?: string;
  hasAnalysis?: boolean;
}

interface ThemeDefinition {
  title: string;
  keywords: string[];
  explanation: (matches: string[]) => string;
}

const skillDefinitions = [
  { label: "Observability", keywords: ["observability", "telemetry", "instrumentation"] },
  { label: "Metrics", keywords: ["metrics", "metric"] },
  { label: "Logs", keywords: ["logs", "logging"] },
  { label: "Traces", keywords: ["traces", "tracing"] },
  { label: "SLI/SLO Strategy", keywords: ["sli", "slo", "error budget", "error budgets"] },
  { label: "Reliability", keywords: ["reliability", "reliable"] },
  { label: "Distributed Systems", keywords: ["distributed systems", "distributed"] },
  { label: "Cloud-Native", keywords: ["cloud-native", "cloud native", "microservices"] },
  { label: "Datadog", keywords: ["datadog"] },
  { label: "Prometheus", keywords: ["prometheus"] },
  { label: "Grafana", keywords: ["grafana"] },
  { label: "OpenTelemetry", keywords: ["opentelemetry", "open telemetry"] },
  { label: "Product Strategy", keywords: ["product strategy", "strategy"] },
  { label: "Roadmap", keywords: ["roadmap", "vision"] },
  { label: "Platform as a Product", keywords: ["platform as a product", "platform strategy", "developer productivity"] },
  { label: "Stakeholder Management", keywords: ["stakeholder", "cross-functional", "partner closely"] },
  { label: "Technical Fluency", keywords: ["technical", "architecture", "architect", "engineering"] },
  { label: "Conditional Access", keywords: ["conditional access"] },
  { label: "Azure AD Connect", keywords: ["azure ad connect"] },
  { label: "PowerShell", keywords: ["powershell"] },
  { label: "Graph API", keywords: ["graph api"] },
  { label: "Zero Trust", keywords: ["zero trust"] },
  { label: "Identity Administration", keywords: ["identity", "identity administration", "iam"] },
  { label: "Troubleshooting", keywords: ["troubleshooting", "diagnose", "incident", "root cause"] }
];

const themeDefinitions: ThemeDefinition[] = [
  {
    title: "Technical Depth in Infrastructure",
    keywords: ["distributed systems", "cloud-native", "metrics", "logs", "traces", "infrastructure", "sre", "reliability"],
    explanation: (matches) =>
      `The JD expects credibility in ${matches.slice(0, 3).join(", ")} so you can operate confidently with engineering and infrastructure teams.`
  },
  {
    title: "Platform as a Product",
    keywords: ["platform", "developer productivity", "developer experience", "product strategy", "roadmap", "vision"],
    explanation: (matches) =>
      `This is not just tooling ownership. The role treats the platform like a product, with emphasis on ${matches.slice(0, 3).join(", ")}.`
  },
  {
    title: "Reliability and SLI/SLO Rigor",
    keywords: ["sli", "slo", "error budget", "error budgets", "reliability", "monitoring", "alerting"],
    explanation: (matches) =>
      `The role will likely test whether you can connect ${matches.slice(0, 3).join(", ")} to operational discipline and product decisions.`
  },
  {
    title: "Cross-Functional Leadership",
    keywords: ["cross-functional", "partner", "engineering", "data teams", "infrastructure", "stakeholder"],
    explanation: (matches) =>
      `A big part of the job is influencing across teams, especially around ${matches.slice(0, 3).join(", ")}.`
  },
  {
    title: "Operational Excellence",
    keywords: ["operational excellence", "best practices", "scale", "execution", "standards"],
    explanation: (matches) =>
      `This company cares about disciplined execution, and the JD keeps reinforcing ${matches.slice(0, 3).join(", ")}.`
  },
  {
    title: "Product Strategy and Roadmap Ownership",
    keywords: ["define the vision", "vision", "roadmap", "strategy", "prioritization", "own"],
    explanation: (matches) =>
      `You’ll need to show that you can turn broad intent into clear decisions, sequencing, and trade-offs around ${matches.slice(0, 3).join(", ")}.`
  },
  {
    title: "Identity Architecture Judgment",
    keywords: ["conditional access", "identity", "azure ad connect", "zero trust", "authentication", "graph api"],
    explanation: (matches) =>
      `This role wants more than configuration knowledge. It expects design judgment around ${matches.slice(0, 3).join(", ")}.`
  },
  {
    title: "Troubleshooting Under Pressure",
    keywords: ["troubleshooting", "incident", "root cause", "diagnose", "resolve", "sync"],
    explanation: (matches) =>
      `The interview will likely test how you think through messy, real-world failures tied to ${matches.slice(0, 3).join(", ")}.`
  }
];

function normalizeWhitespace(input: string) {
  return input.replace(/\r/g, "\n").replace(/\t/g, " ").replace(/[ ]{2,}/g, " ").trim();
}

function startCase(value: string) {
  return value
    .trim()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function titleCaseRole(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (/^(sli|slo|api|iam|sre|ui|ux)$/i.test(word)) {
        return word.toUpperCase();
      }

      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function uniqueStrings(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function countMatches(text: string, terms: string[]) {
  return uniqueStrings(terms.filter((term) => text.includes(term.toLowerCase())));
}

function extractLines(text: string) {
  return normalizeWhitespace(text)
    .split("\n")
    .map((line) => line.replace(/^[•\-*]\s*/, "").trim())
    .filter(Boolean);
}

function detectRole(text: string, fallbackRole?: string) {
  const lowered = text.toLowerCase();
  const rolePatterns = [
    /we'?re looking for (?:an?|the)?\s*([^.\n]{4,90}?)\s+to\b/i,
    /we are looking for (?:an?|the)?\s*([^.\n]{4,90}?)\s+to\b/i,
    /role[:\s]+([^.\n]{4,90})/i,
    /title[:\s]+([^.\n]{4,90})/i
  ];

  for (const pattern of rolePatterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      const parsedRole = titleCaseRole(
        match[1]
          .replace(/\b(seasoned|experienced|exceptional|strong|high-impact|senior-level|hands-on)\b/gi, "")
          .replace(/\bour\b/gi, "")
          .replace(/\bteam\b/gi, "")
          .replace(/\s{2,}/g, " ")
          .trim()
      );

      if (/product leader/i.test(parsedRole) && lowered.includes("observability") && !/observability/i.test(parsedRole)) {
        return "Product Leader, Observability";
      }

      return parsedRole;
    }
  }

  if (lowered.includes("product leader") && lowered.includes("observability")) {
    return "Product Leader, Observability";
  }

  if (lowered.includes("technical product manager")) {
    return "Technical Product Manager";
  }

  if (lowered.includes("product manager")) {
    return "Product Manager";
  }

  if (lowered.includes("azure ad engineer")) {
    return "Azure AD Engineer";
  }

  if ((lowered.includes("identity") || lowered.includes("iam")) && lowered.includes("engineer")) {
    return "IAM Engineer";
  }

  if (lowered.includes("devops")) {
    return "DevOps Engineer";
  }

  return fallbackRole?.trim() || "";
}

function detectCompany(text: string, fallbackCompany?: string) {
  const knownCompanies = [
    "Zenoti",
    "Microsoft",
    "Okta",
    "Infosys",
    "Deloitte",
    "Datadog",
    "Grafana Labs",
    "Elastic",
    "New Relic",
    "Splunk",
    "Dynatrace"
  ];

  for (const company of knownCompanies) {
    const pattern = new RegExp(`\\b${company.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");

    if (pattern.test(text)) {
      return company;
    }
  }

  const aboutMatch = text.match(/about\s+([A-Z][A-Za-z0-9&.\- ]{2,50})/);

  if (aboutMatch?.[1]) {
    return aboutMatch[1].trim();
  }

  return fallbackCompany?.trim() || "";
}

function detectSeniority(text: string, fallback?: string) {
  const lowered = text.toLowerCase();

  if (fallback?.trim()) {
    return fallback.trim();
  }

  if (/\b(principal|director|head of|vp|vice president|lead)\b/i.test(lowered)) {
    return "Lead";
  }

  if (/\b(staff|senior)\b/i.test(lowered)) {
    return "Senior";
  }

  if (/\b(entry|junior)\b/i.test(lowered)) {
    return "Junior";
  }

  return "Mid";
}

function detectGeography(text: string, fallback?: string) {
  const lowered = text.toLowerCase();

  if (fallback?.trim()) {
    return fallback.trim();
  }

  const parts: string[] = [];

  if (lowered.includes("remote")) {
    parts.push("Remote");
  }

  if (lowered.includes("hybrid")) {
    parts.push("Hybrid");
  }

  const geographyMatch = text.match(/\b(us|india|europe|apac|emea|global)\b/gi);

  if (geographyMatch?.length) {
    parts.unshift(uniqueStrings(geographyMatch.map((item) => item.toUpperCase())).join("/"));
  }

  return parts.join(" • ");
}

function detectJobFamily(role: string, text: string, fallback?: string) {
  if (fallback?.trim()) {
    return fallback.trim();
  }

  const loweredRole = role.toLowerCase();
  const lowered = text.toLowerCase();

  if (loweredRole.includes("product")) {
    return "Product";
  }

  if (lowered.includes("observability") || lowered.includes("platform")) {
    return "Platform";
  }

  if (lowered.includes("identity") || lowered.includes("iam") || lowered.includes("azure ad")) {
    return "Identity & Access";
  }

  return "Core Role";
}

function detectFunctionArea(role: string, text: string, fallback?: string) {
  if (fallback?.trim()) {
    return fallback.trim();
  }

  const loweredRole = role.toLowerCase();
  const lowered = text.toLowerCase();

  if (loweredRole.includes("product") && (lowered.includes("observability") || lowered.includes("platform"))) {
    return "Platform & Infrastructure Product Management";
  }

  if (lowered.includes("observability")) {
    return "Observability & Reliability";
  }

  if (lowered.includes("identity") || lowered.includes("azure ad")) {
    return "Cloud Identity & Security";
  }

  return "";
}

function detectSkills(text: string, seedSkills: string[]) {
  const lowered = text.toLowerCase();
  const matched = skillDefinitions
    .map((definition) => ({
      label: definition.label,
      matches: countMatches(lowered, definition.keywords)
    }))
    .filter((item) => item.matches.length > 0)
    .sort((left, right) => right.matches.length - left.matches.length)
    .map((item) => item.label);

  return uniqueStrings([...seedSkills, ...matched]).slice(0, 6);
}

function detectThemes(text: string, keySkills: string[], seedThemes: JDTheme[]) {
  const lowered = text.toLowerCase();

  const scoredThemes = themeDefinitions
    .map((definition) => {
      const matches = countMatches(lowered, definition.keywords);

      return {
        definition,
        matches,
        score: matches.length
      };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.definition.title.localeCompare(right.definition.title))
    .slice(0, 5)
    .map((item, index) => ({
      step: index + 1,
      title: item.definition.title,
      confidence: Math.max(68, 96 - index * 6),
      explanation: item.definition.explanation(item.matches)
    }));

  if (scoredThemes.length) {
    return scoredThemes;
  }

  if (seedThemes.length) {
    return seedThemes;
  }

  return keySkills.slice(0, 5).map((skill, index) => ({
    step: index + 1,
    title: skill,
    confidence: Math.max(66, 92 - index * 6),
    explanation: `${skill} appears often enough in the JD that you should be ready to prove it with concrete examples.`
  }));
}

function detectSignals(text: string, role: string, themes: JDTheme[], seedSignals: JDEmployerSignal[]) {
  const lowered = text.toLowerCase();
  const signals: JDEmployerSignal[] = [];

  if (lowered.includes("distributed systems") || lowered.includes("cloud-native") || lowered.includes("platform")) {
    signals.push({
      label: "Scale and systems complexity",
      explanation: "This team operates in a technically demanding environment, so they will likely test whether you can reason beyond surface-level product language.",
      prepAction: "Prepare one story where you navigated complexity across architecture, reliability, and delivery."
    });
  }

  if (lowered.includes("partner") || lowered.includes("cross-functional") || lowered.includes("engineering")) {
    signals.push({
      label: "Engineering partnership is non-negotiable",
      explanation: "The JD keeps signaling that success depends on working deeply with engineers, not just handing over requirements.",
      prepAction: "Tell one story where strong engineering collaboration changed the quality or speed of delivery."
    });
  }

  if (lowered.includes("vision") || lowered.includes("roadmap") || lowered.includes("strategy")) {
    signals.push({
      label: "Strategy ownership matters",
      explanation: "This role will probably reward clarity of thought, prioritization, and long-range decision-making under uncertainty.",
      prepAction: "Be ready to explain how you turned ambiguity into a roadmap with real trade-offs."
    });
  }

  if (lowered.includes("sli") || lowered.includes("slo") || lowered.includes("error budget")) {
    signals.push({
      label: "Reliability rigor is part of the interview",
      explanation: "Expect questions that probe how you balance customer impact, alert quality, and operational discipline.",
      prepAction: "Prepare one example of using reliability signals or telemetry to influence product decisions."
    });
  }

  if (signals.length) {
    return signals.slice(0, 3);
  }

  if (seedSignals.length) {
    return seedSignals;
  }

  return [
    {
      label: "Execution over buzzwords",
      explanation: `The role ${role ? `for ${role}` : ""} will likely favor concrete examples and judgment over abstract frameworks.`,
      prepAction: "Prepare one clear example where you owned a messy problem and delivered a practical outcome."
    }
  ];
}

function buildSummary(role: string, company: string, seniority: string, themes: JDTheme[], rounds: JDRound[]) {
  const first = themes[0]?.title ?? "role depth";
  const second = themes[1]?.title ?? "execution clarity";
  const third = themes[2]?.title ?? "cross-functional trust";
  const roundFocus = rounds[1]?.name ?? "the technical loop";

  const prefix = company ? `${role} at ${company}` : role || "This role";
  const seniorityNote = seniority ? `${seniority.toLowerCase()}-level ` : "";

  return `${prefix} is really asking for a ${seniorityNote}candidate who can prove ${first.toLowerCase()}, ${second.toLowerCase()}, and ${third.toLowerCase()}. Expect interview pressure around ${roundFocus.toLowerCase()}, where clarity, trade-off thinking, and real examples will matter more than buzzwords.`;
}

function buildRounds(role: string, text: string, themes: JDTheme[], seedRounds: JDRound[]) {
  const loweredRole = role.toLowerCase();
  const lowered = text.toLowerCase();

  if (seedRounds.length >= 4 && seedRounds.some((round) => round.description.trim().length > 20)) {
    return seedRounds;
  }

  if (loweredRole.includes("product")) {
    const productRounds: JDRound[] = [
      {
        step: 1,
        name: "Recruiter Screen",
        likelihood: 100,
        gate: true,
        difficulty: "Easy",
        duration: "30 min",
        format: "Screening",
        description: "Initial fit screen on role motivation, compensation, communication quality, and why this domain makes sense for you.",
        focus: ["Role motivation", "Communication", "Company fit"]
      },
      {
        step: 2,
        name: "Hiring Manager / PM Peer Interview",
        likelihood: 90,
        gate: true,
        difficulty: "Medium",
        duration: "45 min",
        format: "Role-fit interview",
        description: "This round usually checks product judgment, prioritization, and whether your stories show enough technical and cross-functional credibility.",
        focus: [themes[0]?.title ?? "Product judgment", themes[1]?.title ?? "Execution", "Stakeholder management"]
      },
      {
        step: 3,
        name: lowered.includes("observability") || lowered.includes("platform") ? "Technical / Architect Interview" : "Technical Depth Interview",
        likelihood: 82,
        gate: true,
        difficulty: "Medium",
        duration: "60 min",
        format: "Technical scenario",
        description: "Expect deeper questioning on systems, trade-offs, and how you work with engineering in technically complex environments.",
        focus: [themes[0]?.title ?? "Technical fluency", themes[1]?.title ?? "Systems thinking", "Trade-offs"]
      },
      {
        step: 4,
        name: "Case Presentation",
        likelihood: 68,
        gate: true,
        difficulty: "Medium",
        duration: "60 min",
        format: "Case study",
        description: "You may be asked to structure an ambiguous product problem and defend a clear path forward using judgment and evidence.",
        focus: ["Structured thinking", "Decision clarity", "Metrics"]
      },
      {
        step: 5,
        name: "Leadership Round",
        likelihood: lowered.includes("lead") || lowered.includes("director") ? 58 : 48,
        gate: false,
        difficulty: "Hard",
        duration: "45 min",
        format: "Executive interview",
        description: "This round checks executive presence, influence, and whether you can simplify technical complexity into business judgment.",
        focus: ["Leadership", "Influence", "Executive communication"]
      }
    ];

    return productRounds;
  }

  return [
    {
      step: 1,
      name: "Recruiter Screen",
      likelihood: 100,
      gate: true,
      difficulty: "Easy",
      duration: "30 min",
      format: "Screening",
      description: "Initial screen on role fit, communication quality, and compensation expectations.",
      focus: ["Motivation", "Communication", "Fit"]
    },
    {
      step: 2,
      name: "Technical Deep Dive",
      likelihood: 88,
      gate: true,
      difficulty: "Medium",
      duration: "60 min",
      format: "Technical panel",
      description: "Expect the interviewer to test the concepts and systems that matter most in the JD, with follow-up questions on trade-offs and edge cases.",
      focus: [themes[0]?.title ?? "Technical depth", themes[1]?.title ?? "Troubleshooting", "Execution"]
    },
    {
      step: 3,
      name: "Scenario / Troubleshooting Round",
      likelihood: 74,
      gate: true,
      difficulty: "Medium",
      duration: "45 min",
      format: "Scenario interview",
      description: "This round checks how you think under pressure, especially when information is incomplete or systems are failing.",
      focus: [themes[1]?.title ?? "Troubleshooting", "Judgment", "Communication"]
    },
    {
      step: 4,
      name: "Leadership / Stakeholder Round",
      likelihood: 56,
      gate: false,
      difficulty: "Medium",
      duration: "45 min",
      format: "Behavioral",
      description: "Final round usually checks ownership, stakeholder trust, and how you communicate technical choices to others.",
      focus: ["Ownership", "Stakeholder management", "Clarity"]
    }
  ];
}

function buildGapNote(skill: string) {
  const lowered = skill.toLowerCase();

  if (lowered.includes("sli") || lowered.includes("slo") || lowered.includes("reliability")) {
    return "You should be able to explain how this changes product or operational decisions, not just define the term.";
  }

  if (lowered.includes("platform") || lowered.includes("product")) {
    return "Interviewers will expect a concrete story showing how you shaped platform direction or product outcomes.";
  }

  if (lowered.includes("technical") || lowered.includes("infrastructure") || lowered.includes("distributed")) {
    return "You need enough systems depth to sound credible with engineers and simplify it for non-technical stakeholders.";
  }

  return "This area needs one concrete example, one trade-off, and one measurable result in your interview story bank.";
}

function buildCriticalGaps(text: string, keySkills: string[], seedGaps: JDGap[]) {
  if (seedGaps.length) {
    return seedGaps.slice(0, 3);
  }

  const lowered = text.toLowerCase();
  const gapCandidates = uniqueStrings([
    ...keySkills,
    lowered.includes("observability") ? "Observability strategy" : "",
    lowered.includes("sli") || lowered.includes("slo") ? "SLI/SLO judgment" : "",
    lowered.includes("distributed systems") ? "Distributed systems depth" : "",
    lowered.includes("cross-functional") ? "Cross-functional leadership" : ""
  ]).slice(0, 3);

  return gapCandidates.map((skill, index) => ({
    skill,
    importance: index === 0 ? "High" : index === 1 ? "High" : "Medium",
    note: buildGapNote(skill),
    suggestedActions: [
      `Prepare 1 story that proves ${skill.toLowerCase()}.`,
      "Practice explaining it simply, then one level deeper."
    ]
  }));
}

function buildPrepTasks(themes: JDTheme[], gaps: JDGap[], window: "48h" | "2week", company: string) {
  if (window === "48h") {
    const firstTheme = themes[0]?.title ?? gaps[0]?.skill ?? "Role theme";
    const secondTheme = themes[1]?.title ?? gaps[1]?.skill ?? "Technical clarity";
    const thirdTheme = themes[2]?.title ?? gaps[2]?.skill ?? "Interview storytelling";

    return [
      {
        step: 1,
        title: `Understand ${firstTheme.toLowerCase()} in plain English and interview depth.`,
        duration: "90 min",
        resources: ["Official docs", "Your notes"],
        note: "You should be able to explain it to a child first, then to an interviewer."
      },
      {
        step: 2,
        title: `Prepare 2 stories that prove ${secondTheme.toLowerCase()}.`,
        duration: "2 hours",
        resources: ["Resume", "Project journal"],
        note: "Use stories with a problem, tension, action, and measurable result."
      },
      {
        step: 3,
        title: `Rehearse a crisp role pitch for ${company || "this company"}.`,
        duration: "45 min",
        resources: ["Voice notes"],
        note: `Keep it simple: why this role, why now, and what makes you credible for ${thirdTheme.toLowerCase()}.`
      }
    ];
  }

  return [
    {
      step: 1,
      title: "Break the JD into 4 to 5 interview themes.",
      duration: "Days 1-2",
      resources: ["JD notes"],
      note: "Turn the description into a prep map instead of re-reading the text."
    },
    {
      step: 2,
      title: `Build proof for ${themes[0]?.title.toLowerCase() ?? gaps[0]?.skill.toLowerCase() ?? "the top theme"}.`,
      duration: "Days 3-5",
      resources: ["Portfolio", "Case notes"],
      note: "One demo, one case, or one measurable story is enough if it is concrete."
    },
    {
      step: 3,
      title: "Rehearse the likely interview rounds out loud.",
      duration: "Days 6-8",
      resources: ["Mock interview", "Story bank"],
      note: "Practice clarity under pressure, not just content recall."
    },
    {
      step: 4,
      title: "Tighten domain depth and edge cases.",
      duration: "Days 9-11",
      resources: ["Docs", "Architecture notes"],
      note: "Go one level deeper on tools, trade-offs, and failure modes."
    },
    {
      step: 5,
      title: "Align resume and final pitch to the JD signals.",
      duration: "Days 12-14",
      resources: ["Resume workspace"],
      note: "Your profile should now mirror what the JD actually values."
    }
  ];
}

function buildGeneralTips(role: string, text: string, company: string) {
  const loweredRole = role.toLowerCase();
  const lowered = text.toLowerCase();

  if (loweredRole.includes("product")) {
    return [
      "Start answers with customer or business impact before you go into product mechanics.",
      "Show that you can speak comfortably with engineering without drowning the listener in jargon.",
      `For ${company || "this role"}, concrete roadmap trade-offs and crisp stakeholder stories will matter more than generic PM frameworks.`
    ];
  }

  if (lowered.includes("observability") || lowered.includes("platform")) {
    return [
      "Translate platform work into reliability, developer productivity, or business impact.",
      "Be ready to explain metrics, logs, traces, and SLI/SLO decisions simply before going deep.",
      "Use one incident or strategy story to prove judgment under pressure."
    ];
  }

  return [
    "Lead with impact, then go deeper into the technical choice or trade-off.",
    "Keep answers concrete and anchored in real situations.",
    "If a non-technical listener understands you, the interviewer will trust you faster."
  ];
}

function buildConfidenceScores(text: string, company: string, themes: JDTheme[]) {
  const lowered = text.toLowerCase();
  const specificityBoost = Math.min(12, themes.length * 2);

  return {
    skillExtraction: Math.min(98, 84 + specificityBoost + (lowered.length > 600 ? 4 : 0)),
    roundPrediction: Math.min(95, 74 + specificityBoost),
    seniority: /\b(lead|senior|principal|director|junior|entry)\b/i.test(text) ? 94 : 82,
    companyMatch: company ? 88 : 52
  };
}

function mergeConfidenceScores(seed: Partial<JDConfidenceScores> | undefined, derived: JDConfidenceScores) {
  return {
    skillExtraction: seed?.skillExtraction ?? derived.skillExtraction,
    roundPrediction: seed?.roundPrediction ?? derived.roundPrediction,
    seniority: seed?.seniority ?? derived.seniority,
    companyMatch: seed?.companyMatch ?? derived.companyMatch
  };
}

export function deriveJDAnalysis(seed: JDSeed): JDAnalysis {
  const rawText = normalizeWhitespace(seed.rawText ?? "");
  const role = detectRole(rawText, seed.role);
  const company = detectCompany(rawText, seed.company);
  const seniority = detectSeniority(rawText, seed.seniority);
  const geography = detectGeography(rawText, seed.geography);
  const jobFamily = detectJobFamily(role, rawText, seed.jobFamily);
  const functionArea = detectFunctionArea(role, rawText, seed.functionArea);
  const keySkills = detectSkills(rawText, seed.keySkills ?? []);
  const whatMattersMost = detectThemes(rawText, keySkills, seed.whatMattersMost ?? []);
  const employerSignals = detectSignals(rawText, role, whatMattersMost, seed.employerSignals ?? []);
  const interviewRounds = buildRounds(role, rawText, whatMattersMost, seed.interviewRounds ?? []);
  const criticalGaps = buildCriticalGaps(rawText, keySkills, seed.criticalGaps ?? []);
  const prep48h = (seed.prep48h?.length ? seed.prep48h : buildPrepTasks(whatMattersMost, criticalGaps, "48h", company)).slice(0, 3);
  const prep2Week = (seed.prep2Week?.length ? seed.prep2Week : buildPrepTasks(whatMattersMost, criticalGaps, "2week", company)).slice(0, 5);
  const generalTips = (seed.generalTips?.length ? seed.generalTips : buildGeneralTips(role, rawText, company)).slice(0, 4);
  const confidenceScores = mergeConfidenceScores(
    seed.confidenceScores,
    buildConfidenceScores(rawText, company, whatMattersMost)
  );

  const summary =
    seed.summary?.trim().length && !seed.summary?.includes("emphasizes")
      ? seed.summary
      : buildSummary(role || "This role", company, seniority, whatMattersMost, interviewRounds);

  return {
    analysisId: seed.analysisId,
    summary,
    keySkills,
    criticalGaps,
    interviewRounds,
    whatMattersMost,
    employerSignals,
    prep48h,
    prep2Week,
    generalTips,
    confidenceScores,
    role,
    company,
    seniority,
    geography,
    jobFamily,
    functionArea,
    rawText,
    hasAnalysis: seed.hasAnalysis ?? Boolean(rawText)
  };
}
