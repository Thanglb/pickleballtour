export enum Rank {
  APlus = 'A+',
  A = 'A',
  BPlus = 'B+',
  B = 'B',
}

export const RANK_POINTS: Record<Rank, number> = {
  [Rank.APlus]: 4,
  [Rank.A]: 3,
  [Rank.BPlus]: 2,
  [Rank.B]: 1,
};

export type Language = 'vi' | 'en';

export interface Player {
  id: string;
  name: string;
  rank: Rank;
  points: number; // Based on rank
  excludeIds: string[]; // IDs of players they cannot pair with
}

export interface Pair {
  id: string;
  player1: Player;
  player2: Player;
  totalRankPoints: number;
  groupId: string | null;
  manualAdjustment?: boolean;
}

export interface MatchScore {
  pair1Score: number | null;
  pair2Score: number | null;
}

export interface Match {
  id: string;
  roundName: string; // "Group Stage", "Quarter Final", etc.
  isElimination: boolean;
  groupId: string | null; // Null if elimination
  pair1Id: string; // Can be placeholder in elimination
  pair2Id: string;
  pair1Name?: string; // For display before pairs are determined in elimination
  pair2Name?: string;
  score: MatchScore;
  winnerId: string | null;
  courtId: number;
  slotId: number; // Time slot index
  finished: boolean;
  nextMatchId?: string; // For elimination bracket linking
  nextMatchSlot?: 'pair1' | 'pair2';
}

export interface Group {
  id: string;
  name: string;
  pairIds: string[];
}

export interface TournamentConfig {
  numCourts: number;
  numGroups: number;
  maxPlayersPerGroup: number;
  eliminationRounds: number; // 0 to 4
}

export interface AppState {
  step: 'setup' | 'pairing' | 'schedule';
  config: TournamentConfig;
  players: Player[];
  pairs: Pair[];
  groups: Group[];
  matches: Match[];
}

export interface StandingsRow {
  pairId: string;
  pairName: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  pointsFor: number;
  pointsAgainst: number;
  diff: number;
  rank: number;
}
