/**
 * محرّك «بطولة نشاط» — آلة حالات نقيّة قابلة لإعادة الاستخدام والتوسّع.
 * الجولة/التحدي/الحدث/النهائي كلها حالات، لا صفحات مستقلة.
 * (النسخة الكاملة بسجلّ عمليات آمن ومزامنة أجهزة تحتاج خادمًا لاحقًا.)
 */

import {
  CHALLENGES, BASE_REWARD, DIFFICULTIES, TEAM_PRESETS,
  type BigChallenge, type BigEvent, type DifficultyId,
} from "../data/bigGame";

export type Phase = "setup" | "lobby" | "playing" | "challenge" | "event" | "final" | "final-challenge" | "end";
export type FinalChoice = "keep" | "double" | null;

export interface Team {
  id: string; name: string; emoji: string; color: string;
  balance: number; wins: number; losses: number; played: number;
}

export interface GameConfig {
  ageGroup: string; minutes: number; startBalance: number;
  difficulty: DifficultyId; enableEvents: boolean; enableRisk: boolean;
}

export interface LogEntry { teamId: string; delta: number; reason: string }

export interface GameState {
  phase: Phase;
  config: GameConfig;
  teams: Team[];
  round: number;
  totalRounds: number;
  secondsLeft: number;
  paused: boolean;
  activeTeamId: string | null;
  challenge: BigChallenge | null;
  bet: number;
  golden: boolean;
  event: BigEvent | null;
  usedChallengeIds: string[];
  finalChoices: Record<string, FinalChoice>;
  finalTeamId: string | null;
  finalDone: string[];
  log: LogEntry[];
  revealed: number;
}

export function makeTeams(count: number, startBalance: number): Team[] {
  return Array.from({ length: count }, (_, i) => {
    const p = TEAM_PRESETS[i % TEAM_PRESETS.length];
    return { id: `t${i + 1}`, name: p.name, emoji: p.emoji, color: p.color, balance: startBalance, wins: 0, losses: 0, played: 0 };
  });
}

export function initState(): GameState {
  const config: GameConfig = {
    ageGroup: "رابع ابتدائي", minutes: 30, startBalance: 1000,
    difficulty: "medium", enableEvents: true, enableRisk: true,
  };
  return {
    phase: "setup", config, teams: makeTeams(4, config.startBalance),
    round: 1, totalRounds: 8, secondsLeft: config.minutes * 60, paused: false,
    activeTeamId: null, challenge: null, bet: 0, golden: false, event: null,
    usedChallengeIds: [], finalChoices: {}, finalTeamId: null, finalDone: [], log: [], revealed: 0,
  };
}

function diffMax(id: DifficultyId): number {
  return DIFFICULTIES.find((d) => d.id === id)?.max ?? 2;
}
function diffMult(id: DifficultyId): number {
  return DIFFICULTIES.find((d) => d.id === id)?.mult ?? 1;
}

/** يختار تحدّيًا مناسبًا للصعوبة لم يُستخدم بعد (يعيد التدوير عند النفاد). */
export function pickChallenge(config: GameConfig, used: string[]): BigChallenge {
  const max = diffMax(config.difficulty);
  let pool = CHALLENGES.filter((c) => c.difficulty <= max && !used.includes(c.id));
  if (pool.length === 0) pool = CHALLENGES.filter((c) => c.difficulty <= max);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function rewardFor(ch: BigChallenge, config: GameConfig): number {
  return Math.round((BASE_REWARD[ch.difficulty] * diffMult(config.difficulty)) / 50) * 50;
}

export function standings(teams: Team[]): Team[] {
  return [...teams].sort((a, b) => b.balance - a.balance);
}

export type Action =
  | { t: "setConfig"; patch: Partial<GameConfig> }
  | { t: "setTeamCount"; count: number }
  | { t: "renameTeam"; id: string; name: string }
  | { t: "toLobby" } | { t: "start" } | { t: "tick" }
  | { t: "pause" } | { t: "resume" }
  | { t: "pickTeam"; id: string }
  | { t: "startChallenge"; challenge: BigChallenge }
  | { t: "setBet"; amount: number }
  | { t: "judge"; win: boolean }
  | { t: "triggerEvent"; event: BigEvent } | { t: "applyEvent" }
  | { t: "adjust"; id: string; delta: number; reason: string }
  | { t: "startFinal" }
  | { t: "finalChoice"; id: string; choice: "keep" | "double" }
  | { t: "finalStart"; id: string; challenge: BigChallenge }
  | { t: "finalJudge"; win: boolean }
  | { t: "endGame" } | { t: "reveal" } | { t: "reset" };

const clamp0 = (n: number) => Math.max(0, Math.round(n));

export function reducer(s: GameState, a: Action): GameState {
  switch (a.t) {
    case "setConfig": {
      const config = { ...s.config, ...a.patch };
      const teams = a.patch.startBalance != null
        ? s.teams.map((t) => ({ ...t, balance: config.startBalance }))
        : s.teams;
      return { ...s, config, teams, secondsLeft: config.minutes * 60 };
    }
    case "setTeamCount":
      return { ...s, teams: makeTeams(Math.min(8, Math.max(2, a.count)), s.config.startBalance) };
    case "renameTeam":
      return { ...s, teams: s.teams.map((t) => (t.id === a.id ? { ...t, name: a.name } : t)) };
    case "toLobby":
      return { ...s, phase: "lobby" };
    case "start":
      return {
        ...s, phase: "playing", round: 1,
        totalRounds: Math.max(5, Math.round(s.config.minutes / 4)),
        secondsLeft: s.config.minutes * 60, activeTeamId: s.teams[0]?.id ?? null,
      };
    case "tick": {
      if (s.paused || s.phase === "setup" || s.phase === "lobby" || s.phase === "end") return s;
      const secondsLeft = Math.max(0, s.secondsLeft - 1);
      if (secondsLeft === 0 && (s.phase === "playing")) {
        return { ...s, secondsLeft, phase: "final", finalChoices: Object.fromEntries(s.teams.map((t) => [t.id, null])) };
      }
      return { ...s, secondsLeft };
    }
    case "pause": return { ...s, paused: true };
    case "resume": return { ...s, paused: false };
    case "pickTeam": return { ...s, activeTeamId: a.id };
    case "startChallenge":
      return { ...s, phase: "challenge", challenge: a.challenge, bet: 0, usedChallengeIds: [...s.usedChallengeIds, a.challenge.id] };
    case "setBet": {
      const team = s.teams.find((t) => t.id === s.activeTeamId);
      const amount = Math.min(a.amount, team?.balance ?? 0);
      return { ...s, bet: Math.max(0, amount) };
    }
    case "judge": {
      if (!s.challenge || !s.activeTeamId) return s;
      const g = s.golden ? 2 : 1;
      const base = rewardFor(s.challenge, s.config);
      const win = a.win;
      const gain = (s.bet > 0 ? s.bet : base) * g;
      const loss = s.bet > 0 ? s.bet : Math.round(base / 2);
      const delta = win ? gain : -loss;
      const teams = s.teams.map((t) => t.id === s.activeTeamId
        ? { ...t, balance: clamp0(t.balance + delta), wins: t.wins + (win ? 1 : 0), losses: t.losses + (win ? 0 : 1), played: t.played + 1 }
        : t);
      const idx = s.teams.findIndex((t) => t.id === s.activeTeamId);
      const nextTeam = s.teams[(idx + 1) % s.teams.length]?.id ?? null;
      return {
        ...s, teams, phase: "playing", challenge: null, bet: 0, golden: false,
        round: s.round + 1, activeTeamId: nextTeam,
        log: [...s.log, { teamId: s.activeTeamId, delta, reason: win ? `فوز: ${s.challenge.title}` : `خسارة: ${s.challenge.title}` }],
      };
    }
    case "triggerEvent":
      return { ...s, phase: "event", event: a.event };
    case "applyEvent": {
      if (!s.event) return s;
      const e = s.event;
      let teams = s.teams;
      let golden = s.golden;
      if (e.kind === "allMinus") teams = teams.map((t) => ({ ...t, balance: clamp0(t.balance - e.value) }));
      else if (e.kind === "allPlus") teams = teams.map((t) => ({ ...t, balance: clamp0(t.balance + e.value) }));
      else if (e.kind === "randomPlus") {
        const i = Math.floor(Math.random() * teams.length);
        teams = teams.map((t, k) => (k === i ? { ...t, balance: clamp0(t.balance + e.value) } : t));
      } else if (e.kind === "golden") golden = true;
      return { ...s, teams, golden, phase: "playing", event: null };
    }
    case "adjust": {
      const teams = s.teams.map((t) => (t.id === a.id ? { ...t, balance: clamp0(t.balance + a.delta) } : t));
      return { ...s, teams, log: [...s.log, { teamId: a.id, delta: a.delta, reason: a.reason }] };
    }
    case "startFinal":
      return { ...s, phase: "final", finalChoices: Object.fromEntries(s.teams.map((t) => [t.id, null])) };
    case "finalChoice":
      return { ...s, finalChoices: { ...s.finalChoices, [a.id]: a.choice } };
    case "finalStart":
      return { ...s, phase: "final-challenge", finalTeamId: a.id, challenge: a.challenge };
    case "finalJudge": {
      if (!s.finalTeamId) return s;
      const teams = s.teams.map((t) => t.id === s.finalTeamId
        ? { ...t, balance: clamp0(a.win ? t.balance * 2 : t.balance / 2) }
        : t);
      return {
        ...s, teams, phase: "final", challenge: null,
        finalDone: [...s.finalDone, s.finalTeamId], finalTeamId: null,
        log: [...s.log, { teamId: s.finalTeamId, delta: 0, reason: a.win ? "ضاعف رصيده في النهائي" : "خسر مضاعفة النهائي" }],
      };
    }
    case "endGame":
      return { ...s, phase: "end", revealed: 0 };
    case "reveal":
      return { ...s, revealed: Math.min(s.revealed + 1, s.teams.length) };
    case "reset":
      return initState();
    default:
      return s;
  }
}
