/**
 * محرّك لعبة «الشفرة» — آلة حالات نقيّة.
 * المحتوى (الأدلّة/التحديات) يأتي من data/shifra، والمحرّك يدير المنطق فقط.
 * توليد الشفرة والأدلّة يجري في newGame (لحظة إنشاء اللعبة) لا في كل خطوة.
 */

import {
  DIFFICULTIES, MARKET_PRICE, CHALLENGE_REWARD, TEAM_PRESETS,
  generateCode, buildClues,
  type Clue, type ShifraDifficultyId, type ShifraChallenge,
} from "../data/shifra";

export type Phase = "setup" | "brief" | "playing" | "challenge" | "reveal" | "market" | "vault" | "final" | "end";

export interface ShifraTeam {
  id: string; name: string; emoji: string; color: string;
  balance: number;
  clueIds: string[];
  attemptsLeft: number;
  solved: boolean;
  bestCorrect: number;
  guess: number[] | null;
}

export interface ShifraConfig {
  ageGroup: string;
  minutes: number;
  difficulty: ShifraDifficultyId;
  startBalance: number;
  teamCount: number;
}

export interface LogEntry { teamId: string; delta: number; reason: string }

export interface ShifraState {
  phase: Phase;
  config: ShifraConfig;
  code: number[];
  clues: Record<string, Clue>;
  earnPool: string[];
  teams: ShifraTeam[];
  secondsLeft: number;
  paused: boolean;
  round: number;
  activeTeamId: string | null;
  challenge: ShifraChallenge | null;
  lastGrant: { teamId: string; clueId: string; cost?: number } | null;
  vaultTeamId: string | null;
  revealed: number;
  log: LogEntry[];
}

const FINAL_AT = 300; // ٥ دقائق

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function diff(id: ShifraDifficultyId) {
  return DIFFICULTIES.find((d) => d.id === id) ?? DIFFICULTIES[1];
}

function makeTeams(count: number, startBalance: number, attempts: number): ShifraTeam[] {
  return Array.from({ length: count }, (_, i) => {
    const p = TEAM_PRESETS[i % TEAM_PRESETS.length];
    return {
      id: `t${i + 1}`, name: p.name, emoji: p.emoji, color: p.color,
      balance: startBalance, clueIds: [], attemptsLeft: attempts, solved: false, bestCorrect: 0, guess: null,
    };
  });
}

/** ينشئ لعبة جديدة: يولّد الشفرة والأدلّة ويوزّعها بحيث لا يحلّها فريق وحده. */
export function newGame(config: ShifraConfig): ShifraState {
  const d = diff(config.difficulty);
  const code = generateCode(d.len);
  const { core, extras } = buildClues(code);

  const clues: Record<string, Clue> = {};
  [...core, ...extras].forEach((c) => { clues[c.id] = c; });

  const teams = makeTeams(config.teamCount, config.startBalance, d.attempts);

  // توزيع أدلّة الأرقام بالتناوب: كل فريق يحصل على جزء ناقص
  const shuffledCore = shuffle(core);
  shuffledCore.forEach((c, i) => { teams[i % teams.length].clueIds.push(c.id); });

  // دليل غير مباشر لكل فريق
  const shuffledExtras = shuffle(extras);
  teams.forEach((t, i) => {
    const e = shuffledExtras[i % Math.max(1, shuffledExtras.length)];
    if (e && !t.clueIds.includes(e.id)) t.clueIds.push(e.id);
  });

  // مخزون الاكتساب: بقية الأدلّة غير المباشرة + نُسخ من أدلّة الأرقام (تُكتَسب بالتحدّي/الشراء)
  const usedExtra = new Set(teams.flatMap((t) => t.clueIds).filter((id) => extras.some((e) => e.id === id)));
  const leftoverExtras = extras.filter((e) => !usedExtra.has(e.id)).map((e) => e.id);
  const dupCore = core.map((c) => {
    const id = `d-${c.id}`;
    clues[id] = { ...c, id };
    return id;
  });
  const earnPool = shuffle([...leftoverExtras, ...dupCore]);

  return {
    phase: "brief", config, code, clues, earnPool, teams,
    secondsLeft: config.minutes * 60, paused: false, round: 1,
    activeTeamId: teams[0]?.id ?? null, challenge: null, lastGrant: null,
    vaultTeamId: null, revealed: 0, log: [],
  };
}

export function initState(): ShifraState {
  const config: ShifraConfig = {
    ageGroup: "خامس ابتدائي", minutes: 30, difficulty: "medium", startBalance: 800, teamCount: 4,
  };
  const d = diff(config.difficulty);
  return {
    phase: "setup", config, code: [], clues: {}, earnPool: [],
    teams: makeTeams(config.teamCount, config.startBalance, d.attempts),
    secondsLeft: config.minutes * 60, paused: false, round: 1,
    activeTeamId: null, challenge: null, lastGrant: null, vaultTeamId: null, revealed: 0, log: [],
  };
}

const clamp0 = (n: number) => Math.max(0, Math.round(n));

/** يمنح الفريق دليلًا جديدًا لا يملكه من مخزون الاكتساب. يعيد الحالة الجديدة ومعرّف الدليل (أو null). */
function grantClue(s: ShifraState, teamId: string): { earnPool: string[]; teams: ShifraTeam[]; clueId: string | null } {
  const team = s.teams.find((t) => t.id === teamId);
  if (!team) return { earnPool: s.earnPool, teams: s.teams, clueId: null };
  const ownedTexts = new Set(team.clueIds.map((id) => s.clues[id]?.text));
  const idx = s.earnPool.findIndex((id) => !ownedTexts.has(s.clues[id]?.text));
  if (idx === -1) return { earnPool: s.earnPool, teams: s.teams, clueId: null };
  const clueId = s.earnPool[idx];
  const earnPool = s.earnPool.filter((_, i) => i !== idx);
  const teams = s.teams.map((t) => (t.id === teamId ? { ...t, clueIds: [...t.clueIds, clueId] } : t));
  return { earnPool, teams, clueId };
}

export function standings(teams: ShifraTeam[], codeLen: number): { team: ShifraTeam; score: number }[] {
  const maxBal = Math.max(1, ...teams.map((t) => t.balance));
  return teams
    .map((t) => ({
      team: t,
      score: 0.6 * (codeLen ? t.bestCorrect / codeLen : 0) + 0.4 * (t.balance / maxBal),
    }))
    .sort((a, b) => b.score - a.score);
}

export type Action =
  | { t: "setConfig"; patch: Partial<ShifraConfig> }
  | { t: "setTeamCount"; count: number }
  | { t: "renameTeam"; id: string; name: string }
  | { t: "newGame" }
  | { t: "start" } | { t: "tick" } | { t: "pause" } | { t: "resume" }
  | { t: "pickTeam"; id: string }
  | { t: "startChallenge"; challenge: ShifraChallenge }
  | { t: "judge"; win: boolean }
  | { t: "openMarket" } | { t: "buyClue"; teamId: string } | { t: "closeMarket" }
  | { t: "closeReveal" }
  | { t: "openVault"; teamId: string } | { t: "submitGuess"; guess: number[] } | { t: "closeVault" }
  | { t: "toFinal" } | { t: "endGame" } | { t: "reveal" } | { t: "reset" };

export function reducer(s: ShifraState, a: Action): ShifraState {
  switch (a.t) {
    case "setConfig": {
      const config = { ...s.config, ...a.patch };
      const d = diff(config.difficulty);
      const teams = a.patch.startBalance != null
        ? s.teams.map((t) => ({ ...t, balance: config.startBalance }))
        : a.patch.difficulty != null
          ? s.teams.map((t) => ({ ...t, attemptsLeft: d.attempts }))
          : s.teams;
      return { ...s, config, teams, secondsLeft: config.minutes * 60 };
    }
    case "setTeamCount": {
      const count = Math.min(8, Math.max(2, a.count));
      const d = diff(s.config.difficulty);
      return { ...s, config: { ...s.config, teamCount: count }, teams: makeTeams(count, s.config.startBalance, d.attempts) };
    }
    case "renameTeam":
      return { ...s, teams: s.teams.map((t) => (t.id === a.id ? { ...t, name: a.name } : t)) };
    case "newGame":
      return newGame(s.config);
    case "start":
      return { ...s, phase: "playing", activeTeamId: s.teams[0]?.id ?? null };
    case "tick": {
      if (s.paused || s.phase !== "playing") return s;
      const secondsLeft = Math.max(0, s.secondsLeft - 1);
      if (secondsLeft <= FINAL_AT && s.secondsLeft > FINAL_AT) {
        return { ...s, secondsLeft, phase: "final" };
      }
      return { ...s, secondsLeft };
    }
    case "pause": return { ...s, paused: true };
    case "resume": return { ...s, paused: false };
    case "pickTeam": return { ...s, activeTeamId: a.id };
    case "startChallenge":
      return { ...s, phase: "challenge", challenge: a.challenge };
    case "judge": {
      if (!s.challenge || !s.activeTeamId) return s;
      const teamId = s.activeTeamId;
      if (a.win) {
        const g = grantClue(s, teamId);
        const teams = g.teams.map((t) => (t.id === teamId ? { ...t, balance: clamp0(t.balance + CHALLENGE_REWARD) } : t));
        const idx = s.teams.findIndex((t) => t.id === teamId);
        const nextTeam = s.teams[(idx + 1) % s.teams.length]?.id ?? null;
        return {
          ...s, teams, earnPool: g.earnPool, challenge: null,
          phase: g.clueId ? "reveal" : "playing",
          lastGrant: g.clueId ? { teamId, clueId: g.clueId } : null,
          activeTeamId: nextTeam, round: s.round + 1,
          log: [...s.log, { teamId, delta: CHALLENGE_REWARD, reason: `فوز بتحدّي: ${s.challenge.title}` }],
        };
      }
      const idx = s.teams.findIndex((t) => t.id === teamId);
      const nextTeam = s.teams[(idx + 1) % s.teams.length]?.id ?? null;
      return { ...s, phase: "playing", challenge: null, activeTeamId: nextTeam, round: s.round + 1 };
    }
    case "openMarket": return { ...s, phase: "market" };
    case "closeMarket": return { ...s, phase: "playing" };
    case "buyClue": {
      const price = MARKET_PRICE[s.config.difficulty];
      const team = s.teams.find((t) => t.id === a.teamId);
      if (!team || team.balance < price) return s;
      const g = grantClue(s, a.teamId);
      if (!g.clueId) return s;
      const teams = g.teams.map((t) => (t.id === a.teamId ? { ...t, balance: clamp0(t.balance - price) } : t));
      return {
        ...s, teams, earnPool: g.earnPool, phase: "reveal",
        lastGrant: { teamId: a.teamId, clueId: g.clueId, cost: price },
        log: [...s.log, { teamId: a.teamId, delta: -price, reason: "شراء معلومة من السوق" }],
      };
    }
    case "closeReveal":
      return { ...s, phase: s.secondsLeft <= FINAL_AT ? "final" : "playing", lastGrant: null };
    case "openVault":
      return { ...s, phase: "vault", vaultTeamId: a.teamId };
    case "closeVault":
      return { ...s, phase: s.secondsLeft <= FINAL_AT ? "final" : "playing", vaultTeamId: null };
    case "submitGuess": {
      if (!s.vaultTeamId) return s;
      const teamId = s.vaultTeamId;
      const correct = a.guess.reduce((n, v, i) => n + (v === s.code[i] ? 1 : 0), 0);
      const solvedNow = correct === s.code.length;
      const teams = s.teams.map((t) => t.id === teamId
        ? {
            ...t,
            attemptsLeft: Math.max(0, t.attemptsLeft - 1),
            bestCorrect: Math.max(t.bestCorrect, correct),
            solved: t.solved || solvedNow,
            guess: a.guess,
          }
        : t);
      return {
        ...s, teams,
        log: [...s.log, { teamId, delta: 0, reason: solvedNow ? "🔓 فكّ الشفرة!" : `محاولة: ${correct}/${s.code.length} صحيحة` }],
      };
    }
    case "toFinal":
      return { ...s, phase: "final" };
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
