/**
 * محرّك «آخر فرصة» — آلة حالات نقيّة.
 * القاعدة الملزمة: الفوز (الرصيد) منفصل تمامًا عن القيم الممارَسة (valueCounts).
 * القيم تُحصى كعدد مواقف مُورست فيها، لا كنسبة أو حكم على الشخصية.
 */

import {
  DIFFICULTIES, TEAM_PRESETS, CHALLENGE_WIN, COMEBACK_WIN_POINTS, START_BALANCE, START_ENERGY,
  type LCDifficultyId, type LCDecision, type LCChallenge, type LCOption,
} from "../data/lastChance";

export type Phase = "setup" | "brief" | "playing" | "decision" | "challenge" | "comeback" | "final" | "end";
export type FinalChoice = "safe" | "bold" | "all" | null;

export interface LCStats { decisions: number; risks: number; helps: number; comebacks: number; fails: number }

export interface LCTeam {
  id: string; name: string; emoji: string; color: string;
  hearts: number; balance: number; energy: number;
  stats: LCStats;
  values: Record<string, number>; // key -> عدد مرات الممارسة
  finalChoice: FinalChoice;
  finalDone: boolean;
  takeHome: string | null;
}

export interface LCConfig {
  ageGroup: string; minutes: number; difficulty: LCDifficultyId; teamCount: number;
}

export interface LCLog { teamId: string; text: string }

export interface LCState {
  phase: Phase;
  config: LCConfig;
  teams: LCTeam[];
  secondsLeft: number;
  paused: boolean;
  activeTeamId: string | null;
  decision: LCDecision | null;
  challenge: LCChallenge | null;
  comebackTeamId: string | null;
  revealed: number;
  log: LCLog[];
}

const FINAL_AT = 300;

function diff(id: LCDifficultyId) {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1];
}

function makeTeams(count: number, hearts: number): LCTeam[] {
  return Array.from({ length: count }, (_, i) => {
    const p = TEAM_PRESETS[i % TEAM_PRESETS.length];
    return {
      id: `t${i + 1}`, name: p.name, emoji: p.emoji, color: p.color,
      hearts, balance: START_BALANCE, energy: START_ENERGY,
      stats: { decisions: 0, risks: 0, helps: 0, comebacks: 0, fails: 0 },
      values: {}, finalChoice: null, finalDone: false, takeHome: null,
    };
  });
}

export function initState(): LCState {
  const config: LCConfig = { ageGroup: "خامس ابتدائي", minutes: 30, difficulty: "medium", teamCount: 4 };
  return {
    phase: "setup", config, teams: makeTeams(config.teamCount, diff(config.difficulty).hearts),
    secondsLeft: config.minutes * 60, paused: false, activeTeamId: null,
    decision: null, challenge: null, comebackTeamId: null, revealed: 0, log: [],
  };
}

const clamp0 = (n: number) => Math.max(0, Math.round(n));

function addValues(team: LCTeam, keys: string[]): Record<string, number> {
  const values = { ...team.values };
  keys.forEach((k) => { values[k] = (values[k] ?? 0) + 1; });
  return values;
}

/** إجمالي القيم عبر كل الفرق (للتقرير الجماعي إن لزم). */
export function totalValue(team: LCTeam): number {
  return Object.values(team.values).reduce((a, b) => a + b, 0);
}

/** أكثر قيمة مورست لدى الفريق (أو null). */
export function topValue(team: LCTeam): string | null {
  const entries = Object.entries(team.values);
  if (!entries.length) return null;
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

/** ترتيب الفوز — بالرصيد فقط، منفصل عن القيم. */
export function standings(teams: LCTeam[]): LCTeam[] {
  return [...teams].sort((a, b) => b.balance - a.balance);
}

export type Action =
  | { t: "setConfig"; patch: Partial<LCConfig> }
  | { t: "setTeamCount"; count: number }
  | { t: "renameTeam"; id: string; name: string }
  | { t: "newGame" } | { t: "start" } | { t: "tick" } | { t: "pause" } | { t: "resume" }
  | { t: "pickTeam"; id: string }
  | { t: "startDecision"; decision: LCDecision }
  | { t: "applyDecision"; optionIndex: number; reason: string }
  | { t: "startChallenge"; challenge: LCChallenge }
  | { t: "judgeChallenge"; win: boolean }
  | { t: "startComeback"; teamId: string; challenge: LCChallenge }
  | { t: "judgeComeback"; win: boolean }
  | { t: "closeComeback" }
  | { t: "toFinal" }
  | { t: "setFinalChoice"; id: string; choice: "safe" | "bold" | "all" }
  | { t: "resolveFinal"; id: string; win?: boolean }
  | { t: "endGame" } | { t: "reveal" }
  | { t: "setTakeHome"; id: string; value: string }
  | { t: "reset" };

function nextTeamId(s: LCState, id: string): string | null {
  const idx = s.teams.findIndex((t) => t.id === id);
  return s.teams[(idx + 1) % s.teams.length]?.id ?? null;
}

export function reducer(s: LCState, a: Action): LCState {
  switch (a.t) {
    case "setConfig": {
      const config = { ...s.config, ...a.patch };
      const d = diff(config.difficulty);
      const teams = a.patch.difficulty != null ? makeTeams(config.teamCount, d.hearts) : s.teams;
      return { ...s, config, teams, secondsLeft: config.minutes * 60 };
    }
    case "setTeamCount": {
      const count = Math.min(8, Math.max(2, a.count));
      return { ...s, config: { ...s.config, teamCount: count }, teams: makeTeams(count, diff(s.config.difficulty).hearts) };
    }
    case "renameTeam":
      return { ...s, teams: s.teams.map((t) => (t.id === a.id ? { ...t, name: a.name } : t)) };
    case "newGame": {
      const d = diff(s.config.difficulty);
      return {
        ...s, phase: "brief", teams: makeTeams(s.config.teamCount, d.hearts),
        secondsLeft: s.config.minutes * 60, activeTeamId: null, revealed: 0, log: [],
      };
    }
    case "start":
      return { ...s, phase: "playing", activeTeamId: s.teams[0]?.id ?? null };
    case "tick": {
      if (s.paused || s.phase !== "playing") return s;
      const secondsLeft = Math.max(0, s.secondsLeft - 1);
      if (secondsLeft <= FINAL_AT && s.secondsLeft > FINAL_AT) return { ...s, secondsLeft, phase: "final" };
      return { ...s, secondsLeft };
    }
    case "pause": return { ...s, paused: true };
    case "resume": return { ...s, paused: false };
    case "pickTeam": return { ...s, activeTeamId: a.id };

    case "startDecision":
      return { ...s, phase: "decision", decision: a.decision };
    case "applyDecision": {
      if (!s.decision || !s.activeTeamId) return s;
      const teamId = s.activeTeamId;
      const opt: LCOption = s.decision.options[a.optionIndex];
      if (!opt) return s;
      const teams = s.teams.map((t) => {
        if (t.id !== teamId) return t;
        return {
          ...t,
          balance: clamp0(t.balance + opt.points),
          hearts: clamp0(t.hearts + (opt.hearts ?? 0)),
          energy: clamp0(t.energy + (opt.energy ?? 0)),
          values: addValues(t, s.decision!.values),
          stats: {
            ...t.stats,
            decisions: t.stats.decisions + 1,
            risks: t.stats.risks + (opt.risk ? 1 : 0),
            helps: t.stats.helps + (opt.help ? 1 : 0),
          },
        };
      });
      return {
        ...s, teams, phase: "playing", decision: null, activeTeamId: nextTeamId(s, teamId),
        log: [...s.log, { teamId, text: `${s.decision.title}: ${opt.label} — ${a.reason}` }],
      };
    }

    case "startChallenge":
      return { ...s, phase: "challenge", challenge: a.challenge };
    case "judgeChallenge": {
      if (!s.challenge || !s.activeTeamId) return s;
      const teamId = s.activeTeamId;
      const ch = s.challenge;
      if (a.win) {
        const teams = s.teams.map((t) => t.id === teamId
          ? { ...t, balance: clamp0(t.balance + CHALLENGE_WIN), values: addValues(t, ch.values) }
          : t);
        return { ...s, teams, phase: "playing", challenge: null, activeTeamId: nextTeamId(s, teamId),
          log: [...s.log, { teamId, text: `فاز بتحدّي: ${ch.title}` }] };
      }
      // خسارة: ينقص قلب + تُتاح فرصة العودة
      const teams = s.teams.map((t) => t.id === teamId
        ? { ...t, hearts: clamp0(t.hearts - 1), values: addValues(t, ch.values), stats: { ...t.stats, fails: t.stats.fails + 1 } }
        : t);
      return { ...s, teams, phase: "comeback", challenge: null, comebackTeamId: teamId,
        log: [...s.log, { teamId, text: `خسر تحدّي: ${ch.title} (−قلب)` }] };
    }

    case "startComeback":
      return { ...s, phase: "comeback", comebackTeamId: a.teamId, challenge: a.challenge };
    case "judgeComeback": {
      if (!s.comebackTeamId) return s;
      const teamId = s.comebackTeamId;
      const teams = s.teams.map((t) => {
        if (t.id !== teamId) return t;
        if (a.win) return { ...t, hearts: t.hearts + 1, balance: clamp0(t.balance + COMEBACK_WIN_POINTS), values: addValues(t, ["persevere"]), stats: { ...t.stats, comebacks: t.stats.comebacks + 1 } };
        return { ...t, values: addValues(t, ["persevere"]) };
      });
      return { ...s, teams, phase: "playing", challenge: null, comebackTeamId: null, activeTeamId: nextTeamId(s, teamId),
        log: [...s.log, { teamId, text: a.win ? "عاد بعد الفشل ونجح 💪" : "حاول العودة ولم ينجح، لكنه ثابر" }] };
    }
    case "closeComeback": {
      const next = s.comebackTeamId ? nextTeamId(s, s.comebackTeamId) : s.activeTeamId;
      return { ...s, phase: "playing", challenge: null, comebackTeamId: null, activeTeamId: next };
    }

    case "toFinal":
      return { ...s, phase: "final" };
    case "setFinalChoice":
      return { ...s, teams: s.teams.map((t) => (t.id === a.id ? { ...t, finalChoice: a.choice } : t)) };
    case "resolveFinal": {
      const teams = s.teams.map((t) => {
        if (t.id !== a.id || t.finalDone) return t;
        let balance = t.balance;
        if (t.finalChoice === "safe") balance += 500;
        else if (t.finalChoice === "bold") balance += a.win ? 1500 : 0;
        else if (t.finalChoice === "all") {
          const stake = Math.round(t.balance / 2);
          balance += a.win ? stake : -stake;
        }
        return { ...t, balance: clamp0(balance), finalDone: true, values: addValues(t, ["decision"]) };
      });
      return { ...s, teams };
    }
    case "endGame":
      return { ...s, phase: "end", revealed: 0 };
    case "reveal":
      return { ...s, revealed: Math.min(s.revealed + 1, s.teams.length) };
    case "setTakeHome":
      return { ...s, teams: s.teams.map((t) => (t.id === a.id ? { ...t, takeHome: a.value } : t)) };
    case "reset":
      return initState();
    default:
      return s;
  }
}
