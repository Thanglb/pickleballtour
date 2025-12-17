import { Player, Pair, Match, Group, Rank, RANK_POINTS, StandingsRow, TournamentConfig, Language } from './types';

// --- Translations ---
export const TRANSLATIONS = {
  vi: {
    appTitle: "Quản Lý Giải Pickleball",
    setup: "Thiết lập",
    pairing: "Ghép đôi",
    schedule: "Lịch thi đấu",
    standings: "Bảng xếp hạng",
    playoffs: "Vòng loại trực tiếp",
    print: "In / Xuất PDF",
    language: "Ngôn ngữ",
    numGroups: "Số bảng đấu",
    numCourts: "Số sân thi đấu",
    elimRounds: "Số vòng đấu trực tiếp",
    maxPlayers: "Số VĐV tối đa/bảng",
    playerReg: "Đăng ký vận động viên",
    autoFill: "Điền danh sách mẫu (12 VĐV)",
    importExcel: "Nhập từ Excel",
    downloadTemplate: "Tải file mẫu",
    add: "Thêm",
    update: "Cập nhật",
    edit: "Sửa",
    cancel: "Hủy",
    name: "Tên",
    rank: "Hạng",
    exclusions: "Tránh gặp",
    action: "Thao tác",
    noPlayers: "Chưa có vận động viên nào.",
    generatePairs: "Tạo cặp & Bảng đấu",
    confirmPairs: "Xác nhận cặp đấu",
    regenerate: "Tạo lại",
    confirmSchedule: "Xác nhận & Lên lịch",
    pairsGenerated: "Hệ thống đã tối ưu hóa các cặp đấu dựa trên điểm trình.",
    totalPts: "Tổng điểm",
    allCourts: "Tất cả các sân",
    elimOnly: "Vòng loại",
    slot: "Lượt",
    court: "Sân",
    free: "Trống",
    save: "Lưu",
    groupStandings: "Bảng xếp hạng",
    rk: "Hạng",
    team: "Đội / VĐV",
    mp: "Trận",
    w: "Thắng",
    l: "Thua",
    diff: "Hiệu số",
    ptsPlus: "Điểm thắng",
    printOptions: "Tùy chọn in",
    printSheets: "Phiếu ghi điểm",
    printGroups: "Danh sách bảng",
    printSchedule: "Lịch thi đấu",
    close: "Đóng",
    matches: "Trận đấu",
    generateBracket: "Tạo nhánh đấu",
    bracketNote: "Đảm bảo đã nhập đủ kết quả vòng bảng trước khi tạo.",
    filter: "Lọc",
    matchSheet: "PHIẾU GHI ĐIỂM",
    referee: "Trọng tài",
    signature: "Ký tên",
    winner: "Người thắng",
    excelError: "Lỗi đọc file. Vui lòng kiểm tra định dạng.",
    pointsFor: "Điểm thắng (GF)",
    pointsAgainst: "Điểm thua (GA)",
    pairStandings: "Xếp Hạng Cặp Đôi",
    individualStandings: "Xếp Hạng Cá Nhân",
  },
  en: {
    appTitle: "Pickleball Tournament Pro",
    setup: "Setup",
    pairing: "Pairing",
    schedule: "Schedule",
    standings: "Standings",
    playoffs: "Playoffs",
    print: "Print / PDF",
    language: "Language",
    numGroups: "Number of Groups",
    numCourts: "Number of Courts",
    elimRounds: "Elimination Rounds",
    maxPlayers: "Max Players/Group",
    playerReg: "Player Registration",
    autoFill: "Auto-fill Sample (12 Players)",
    importExcel: "Import Excel",
    downloadTemplate: "Download Template",
    add: "Add",
    update: "Update",
    edit: "Edit",
    cancel: "Cancel",
    name: "Name",
    rank: "Rank",
    exclusions: "Exclusions",
    action: "Action",
    noPlayers: "No players added yet.",
    generatePairs: "Generate Pairs & Groups",
    confirmPairs: "Confirm Pairings",
    regenerate: "Regenerate",
    confirmSchedule: "Confirm & Schedule",
    pairsGenerated: "The system has optimized pairs based on rank balance.",
    totalPts: "Total Pts",
    allCourts: "All Courts",
    elimOnly: "Elimination",
    slot: "Slot",
    court: "Court",
    free: "Free",
    save: "Save",
    groupStandings: "Group Standings",
    rk: "Rk",
    team: "Team / Player",
    mp: "MP",
    w: "W",
    l: "L",
    diff: "Diff",
    ptsPlus: "Pts+",
    printOptions: "Print Options",
    printSheets: "Score Sheets",
    printGroups: "Group List",
    printSchedule: "Schedule",
    close: "Close",
    matches: "Matches",
    generateBracket: "Generate Bracket",
    bracketNote: "Ensure all group stage scores are entered before generating.",
    filter: "Filter",
    matchSheet: "MATCH SCORE SHEET",
    referee: "Referee",
    signature: "Signature",
    winner: "Winner",
    excelError: "Error reading file. Please check the format.",
    pointsFor: "Pts For (GF)",
    pointsAgainst: "Pts Against (GA)",
    pairStandings: "Pair Standings",
    individualStandings: "Individual Standings",
  }
};

export const t = (key: keyof typeof TRANSLATIONS.en, lang: Language) => {
  return TRANSLATIONS[lang][key] || key;
};

// --- Helpers ---

export const generatePlayerId = (index: number) => {
  return `P${(index + 1).toString().padStart(2, '0')}`;
};

export const getRankPoints = (rank: Rank) => RANK_POINTS[rank];

// --- Pairing Logic ---

export const generatePairs = (players: Player[], numGroups: number): { pairs: Pair[], groups: Group[] } => {
  // 1. Randomize the player pool completely first.
  // This ensures that if multiple players have the same rank, their order is random,
  // preventing deterministic pairing based on input order.
  let pool = [...players];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  // 2. Sort by Rank High to Low.
  // Since sort is stable, the random relative order of players with *equal* points is preserved.
  pool.sort((a, b) => b.points - a.points);
  
  const pairs: Pair[] = [];
  const groups: Group[] = [];

  // Initialize Groups
  for (let i = 0; i < numGroups; i++) {
    groups.push({
      id: `G${i + 1}`,
      name: `Group ${String.fromCharCode(65 + i)}`,
      pairIds: [],
    });
  }

  // Pairing Algorithm: Balance total points (Strongest with Weakest)
  let pairIndex = 1;

  while (pool.length >= 2) {
    const p1 = pool.shift()!;
    let p2Index = -1;

    // Find best match (lowest rank that is not excluded)
    // We search from the end (lowest rank) upwards
    for (let i = pool.length - 1; i >= 0; i--) {
      const candidate = pool[i];
      if (!p1.excludeIds.includes(candidate.id) && !candidate.excludeIds.includes(p1.id)) {
        p2Index = i;
        break;
      }
    }

    // If no compatible found, just take the lowest one (fallback)
    if (p2Index === -1) {
      p2Index = pool.length - 1;
    }

    const p2 = pool.splice(p2Index, 1)[0];

    pairs.push({
      id: `PR${pairIndex.toString().padStart(2, '0')}`,
      player1: p1,
      player2: p2,
      totalRankPoints: p1.points + p2.points,
      groupId: null, // assigned later
    });
    pairIndex++;
  }

  // Assign Pairs to Groups (Snake draft to balance group strength)
  // Sort pairs by total points first
  // Shuffle equal point pairs too to randomize group assignment for ties
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  pairs.sort((a, b) => b.totalRankPoints - a.totalRankPoints);

  pairs.forEach((pair, index) => {
    // Snake draft logic
    const cycle = Math.floor(index / numGroups);
    const groupIndex = cycle % 2 === 0 
      ? index % numGroups 
      : numGroups - 1 - (index % numGroups);
    
    pair.groupId = groups[groupIndex].id;
    groups[groupIndex].pairIds.push(pair.id);
  });

  return { pairs, groups };
};

// --- Scheduling Logic ---

export const generateSchedule = (
  groups: Group[], 
  pairs: Pair[], 
  config: TournamentConfig
): Match[] => {
  const matches: Match[] = [];
  let matchIdCounter = 1;

  // 1. Create all Round Robin Matches
  const allMatchesPool: Match[] = [];

  groups.forEach(group => {
    const groupPairs = group.pairIds;
    for (let i = 0; i < groupPairs.length; i++) {
      for (let j = i + 1; j < groupPairs.length; j++) {
        allMatchesPool.push({
          id: `M${matchIdCounter++}`,
          roundName: 'Group Stage',
          isElimination: false,
          groupId: group.id,
          pair1Id: groupPairs[i],
          pair2Id: groupPairs[j],
          score: { pair1Score: null, pair2Score: null },
          winnerId: null,
          courtId: 0,
          slotId: 0,
          finished: false
        });
      }
    }
  });

  // 2. Assign to Slots & Courts (Heuristic)
  // Constraints: 
  // - Max matches per slot = numCourts
  // - Player continuity (not > 3 in a row)
  
  const scheduledMatches: Match[] = [];
  const pairConsecutiveMatches: Record<string, number> = {}; // Track consecutive matches
  pairs.forEach(p => pairConsecutiveMatches[p.id] = 0);

  let currentSlot = 1;
  
  while (allMatchesPool.length > 0) {
    const matchesInSlot: Match[] = [];
    const pairsPlayingInSlot = new Set<string>();

    // Try to fill courts
    for (let c = 1; c <= config.numCourts; c++) {
      // Find a suitable match for this court/slot
      let bestMatchIndex = -1;

      // Simple heuristic: Find first match where pairs are not playing and not exhausted
      // Ideally, prioritize matches from different groups to spread load
      for (let i = 0; i < allMatchesPool.length; i++) {
        const m = allMatchesPool[i];
        
        // Check if pairs are already playing this slot
        if (pairsPlayingInSlot.has(m.pair1Id) || pairsPlayingInSlot.has(m.pair2Id)) continue;

        // Check fatigue (Simplified: Avoid if just played 2 in a row, Strict: Max 3)
        // Here we try to avoid if > 2, but allow if forced.
        const p1Fatigue = pairConsecutiveMatches[m.pair1Id] || 0;
        const p2Fatigue = pairConsecutiveMatches[m.pair2Id] || 0;

        if (p1Fatigue >= 3 || p2Fatigue >= 3) continue; // Hard skip if possible

        bestMatchIndex = i;
        break;
      }

      // If we couldn't find a match because of fatigue, try to relax fatigue rule slightly
      // or just leave court empty this slot (rest period)
      if (bestMatchIndex === -1 && allMatchesPool.length > 0) {
         // Second pass: Ignore fatigue constraint if we really need to fill courts and pool is large
         // For now, let's just skip filling this court to allow rest.
      }

      if (bestMatchIndex !== -1) {
        const match = allMatchesPool.splice(bestMatchIndex, 1)[0];
        match.slotId = currentSlot;
        match.courtId = c;
        matchesInSlot.push(match);
        pairsPlayingInSlot.add(match.pair1Id);
        pairsPlayingInSlot.add(match.pair2Id);
      }
    }

    if (matchesInSlot.length === 0 && allMatchesPool.length > 0) {
       // Deadlock prevention: If we have matches left but couldn't schedule any due to constraints,
       // force schedule the first one regardless of fatigue to advance time.
       const match = allMatchesPool.shift()!;
       match.slotId = currentSlot;
       match.courtId = 1;
       matchesInSlot.push(match);
       pairsPlayingInSlot.add(match.pair1Id);
       pairsPlayingInSlot.add(match.pair2Id);
    }

    // Update fatigue stats
    pairs.forEach(p => {
      if (pairsPlayingInSlot.has(p.id)) {
        pairConsecutiveMatches[p.id] = (pairConsecutiveMatches[p.id] || 0) + 1;
      } else {
        pairConsecutiveMatches[p.id] = 0; // Reset if resting
      }
    });

    scheduledMatches.push(...matchesInSlot);
    
    // Only increment slot if we actually scheduled something (or forced to)
    if (matchesInSlot.length > 0) {
        currentSlot++;
    } else if (allMatchesPool.length === 0) {
        break; 
    }
  }

  return scheduledMatches;
};

// --- Elimination Logic ---

export const generateEliminationBracket = (
    groups: Group[], 
    standings: Record<string, StandingsRow>, 
    pairs: Pair[],
    eliminationRounds: number,
    startSlot: number
): Match[] => {
    if (eliminationRounds === 0) return [];

    const numTeams = Math.pow(2, eliminationRounds); // 1->2, 2->4, 3->8, 4->16
    const bracketMatches: Match[] = [];
    
    // 1. Gather qualified teams
    // Strategy: Take top N from each group, then fill remainder with best wildcards
    let qualifiedPairs: { id: string, rank: number, score: number, groupId: string }[] = [];
    
    const allRows = Object.values(standings);
    
    // Sort overall for wildcard picking later
    const overallSorted = [...allRows].sort((a, b) => {
        if (a.wins !== b.wins) return b.wins - a.wins;
        if (a.diff !== b.diff) return b.diff - a.diff;
        return b.pointsFor - a.pointsFor;
    });

    // Determine how many guaranteed per group
    // Ideally equal distribution. If 2 groups, 16 teams -> 8 per group.
    const perGroup = Math.floor(numTeams / groups.length);
    const remainder = numTeams % groups.length;

    const chosenIds = new Set<string>();

    groups.forEach(g => {
        // Get standings for this group
        const groupRows = allRows.filter(r => pairs.find(p => p.id === r.pairId)?.groupId === g.id);
        // Sort
        groupRows.sort((a,b) => b.rank - a.rank); // Rank is 1 (high) to N. Wait, simpler to sort by wins/diff again
        groupRows.sort((a, b) => {
             if (a.wins !== b.wins) return b.wins - a.wins;
             return b.diff - a.diff;
        });

        // Take top 'perGroup'
        for(let i=0; i<perGroup; i++) {
            if(groupRows[i]) {
                qualifiedPairs.push({ 
                    id: groupRows[i].pairId, 
                    rank: i+1, 
                    score: groupRows[i].wins * 1000 + groupRows[i].diff, 
                    groupId: g.id 
                });
                chosenIds.add(groupRows[i].pairId);
            }
        }
    });

    // Fill remainder with wildcards
    let filledCount = qualifiedPairs.length;
    let wcIdx = 0;
    while(filledCount < numTeams && wcIdx < overallSorted.length) {
        const candidate = overallSorted[wcIdx];
        if(!chosenIds.has(candidate.pairId)) {
            qualifiedPairs.push({
                 id: candidate.pairId, 
                 rank: 99, // Wildcard rank
                 score: candidate.wins * 1000 + candidate.diff,
                 groupId: pairs.find(p => p.id === candidate.pairId)?.groupId || ''
            });
            chosenIds.add(candidate.pairId);
            filledCount++;
        }
        wcIdx++;
    }

    // Seed the qualified teams (1 to numTeams) based on performance
    qualifiedPairs.sort((a,b) => b.score - a.score);

    // Generate First Round Matches (e.g. 1 vs 16, 2 vs 15)
    // Standard Bracket Seeding
    const seedOrder = getSeedOrder(numTeams); // e.g., [1, 16, 8, 9, ...]
    
    let matchIdStart = 1000;
    let currentRoundMatches: Match[] = [];
    
    const roundNames = ["Final", "Semi Final", "Quarter Final", "Round of 16"];
    const currentRoundName = roundNames[eliminationRounds - 1] || "Elimination";

    for(let i=0; i<numTeams/2; i++) {
        const seed1 = seedOrder[i * 2];
        const seed2 = seedOrder[i * 2 + 1];
        
        const p1 = qualifiedPairs[seed1 - 1];
        const p2 = qualifiedPairs[seed2 - 1];

        const match: Match = {
            id: `E${matchIdStart++}`,
            roundName: currentRoundName,
            isElimination: true,
            groupId: null,
            pair1Id: p1?.id || 'TBD',
            pair2Id: p2?.id || 'TBD',
            pair1Name: p1 ? `Seed ${seed1}` : 'TBD',
            pair2Name: p2 ? `Seed ${seed2}` : 'TBD',
            score: { pair1Score: null, pair2Score: null },
            winnerId: null,
            courtId: (i % 3) + 1, // Simple distribution
            slotId: startSlot, // All start same time roughly
            finished: false,
        };
        currentRoundMatches.push(match);
        bracketMatches.push(match);
    }

    // Generate placeholder matches for subsequent rounds
    let prevRoundMatches = currentRoundMatches;
    for(let r=1; r<eliminationRounds; r++) {
        const nextRoundMatches: Match[] = [];
        const nextRoundName = roundNames[eliminationRounds - 1 - r];
        
        for(let i=0; i<prevRoundMatches.length; i+=2) {
             const m1 = prevRoundMatches[i];
             const m2 = prevRoundMatches[i+1];

             const nextMatch: Match = {
                id: `E${matchIdStart++}`,
                roundName: nextRoundName,
                isElimination: true,
                groupId: null,
                pair1Id: 'TBD',
                pair2Id: 'TBD',
                pair1Name: `Winner ${m1.id}`,
                pair2Name: `Winner ${m2.id}`,
                score: { pair1Score: null, pair2Score: null },
                winnerId: null,
                courtId: 1, // TBD
                slotId: startSlot + r,
                finished: false
             };
             
             // Link previous to this
             m1.nextMatchId = nextMatch.id;
             m1.nextMatchSlot = 'pair1';
             m2.nextMatchId = nextMatch.id;
             m2.nextMatchSlot = 'pair2';

             nextRoundMatches.push(nextMatch);
             bracketMatches.push(nextMatch);
        }
        prevRoundMatches = nextRoundMatches;
    }

    return bracketMatches;
};

// Helper for standard bracket seeding (1 vs 16, etc)
function getSeedOrder(n: number): number[] {
    let rounds = Math.log2(n);
    let seeds = [1, 2];
    for (let i = 0; i < rounds - 1; i++) {
        let next = [];
        const len = seeds.length * 2 + 1;
        for(let s of seeds) {
            next.push(s);
            next.push(len - s);
        }
        seeds = next;
    }
    return seeds;
}


// --- Standings Calculation ---

export const calculateStandings = (matches: Match[], pairs: Pair[]): Record<string, StandingsRow> => {
    const table: Record<string, StandingsRow> = {};

    // Initialize
    pairs.forEach(p => {
        const name = `${p.player1.name} & ${p.player2.name}`;
        table[p.id] = {
            pairId: p.id,
            pairName: name,
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            diff: 0,
            rank: 0
        };
    });

    // Process Matches (Only Group Stage)
    matches.filter(m => !m.isElimination && m.finished).forEach(m => {
        if (!table[m.pair1Id] || !table[m.pair2Id]) return;

        const p1Stats = table[m.pair1Id];
        const p2Stats = table[m.pair2Id];
        const s1 = m.score.pair1Score || 0;
        const s2 = m.score.pair2Score || 0;

        p1Stats.matchesPlayed++;
        p2Stats.matchesPlayed++;
        p1Stats.pointsFor += s1;
        p1Stats.pointsAgainst += s2;
        p2Stats.pointsFor += s2;
        p2Stats.pointsAgainst += s1;
        p1Stats.diff = p1Stats.pointsFor - p1Stats.pointsAgainst;
        p2Stats.diff = p2Stats.pointsFor - p2Stats.pointsAgainst;

        if (s1 > s2) {
            p1Stats.wins++;
            p2Stats.losses++;
        } else {
            p2Stats.wins++;
            p1Stats.losses++;
        }
    });
    
    return table;
}

export const calculatePlayerStandings = (matches: Match[], pairs: Pair[]): Record<string, StandingsRow> => {
    const table: Record<string, StandingsRow> = {};
    const playerMap: Record<string, Player> = {};

    // Map Players from Pairs
    pairs.forEach(p => {
        playerMap[p.player1.id] = p.player1;
        playerMap[p.player2.id] = p.player2;
    });

    // Initialize table for all unique players
    Object.values(playerMap).forEach(player => {
        table[player.id] = {
            pairId: player.id, // Reusing field for PlayerID
            pairName: player.name,
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            diff: 0,
            rank: 0
        };
    });

    matches.filter(m => !m.isElimination && m.finished).forEach(m => {
        const pair1 = pairs.find(p => p.id === m.pair1Id);
        const pair2 = pairs.find(p => p.id === m.pair2Id);
        if(!pair1 || !pair2) return;

        const p1a = table[pair1.player1.id];
        const p1b = table[pair1.player2.id];
        const p2a = table[pair2.player1.id];
        const p2b = table[pair2.player2.id];

        const s1 = m.score.pair1Score || 0;
        const s2 = m.score.pair2Score || 0;

        // Update Stats for Pair 1 Players
        [p1a, p1b].forEach(p => {
            if(p) {
                p.matchesPlayed++;
                p.pointsFor += s1;
                p.pointsAgainst += s2;
                p.diff = p.pointsFor - p.pointsAgainst;
                if(s1 > s2) p.wins++; else p.losses++;
            }
        });

        // Update Stats for Pair 2 Players
        [p2a, p2b].forEach(p => {
             if(p) {
                p.matchesPlayed++;
                p.pointsFor += s2;
                p.pointsAgainst += s1;
                p.diff = p.pointsFor - p.pointsAgainst;
                if(s2 > s1) p.wins++; else p.losses++;
             }
        });
    });

    return table;
};

// Helper to sort standings based on rules: Total Points (Wins) -> Head-to-Head -> Diff -> Points For
export const sortStandings = (standings: StandingsRow[], matches: Match[], isPair: boolean): StandingsRow[] => {
    return standings.sort((a, b) => {
        // 1. Total Points (Wins)
        if (a.wins !== b.wins) return b.wins - a.wins;

        // 2. Head to Head (Only feasible robustly for Pairs in this simple model)
        // Check if there is a direct match between these two entities
        if (isPair) {
            const directMatch = matches.find(m => 
                m.finished && !m.isElimination &&
                ((m.pair1Id === a.pairId && m.pair2Id === b.pairId) || 
                 (m.pair1Id === b.pairId && m.pair2Id === a.pairId))
            );

            if (directMatch) {
                // If A beat B, A comes first (return -1)
                if (directMatch.winnerId === a.pairId) return -1;
                if (directMatch.winnerId === b.pairId) return 1;
            }
        }

        // 3. Point Difference
        if (a.diff !== b.diff) return b.diff - a.diff;

        // 4. Points For
        return b.pointsFor - a.pointsFor;
    });
};