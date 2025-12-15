import React from 'react';
import { AppState, Language } from '../types';
import { t } from '../utils';

interface Props {
  state: AppState;
  lang: Language;
  mode: 'sheets' | 'groups' | 'schedule' | 'all';
}

const PrintReports: React.FC<Props> = ({ state, lang, mode }) => {
  const { matches, groups, pairs, config } = state;

  const getPairName = (id: string, fallback?: string) => {
    const p = pairs.find(x => x.id === id);
    if (p) return `${p.player1.name} / ${p.player2.name}`;
    return fallback || 'TBD';
  };

  const sortedMatches = [...matches].sort((a,b) => a.slotId - b.slotId || a.courtId - b.courtId);

  return (
    <div className="print-container hidden print:block p-8 bg-white text-black space-y-12">
      {/* 1. MATCH SCORE SHEETS */}
      {(mode === 'sheets' || mode === 'all') && (
        <div className="space-y-8">
           <h1 className="text-2xl font-bold text-center border-b-2 border-black pb-4 mb-8 hidden print:block">{t('printSheets', lang)}</h1>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2">
             {sortedMatches.map(m => (
               <div key={m.id} className="border-2 border-black p-4 break-inside-avoid">
                  <div className="flex justify-between border-b border-black pb-2 mb-4">
                     <span className="font-bold">Match: {m.id}</span>
                     <span className="font-bold">{t('court', lang)}: {m.courtId}</span>
                     <span className="font-bold">{t('slot', lang)}: {m.slotId}</span>
                  </div>
                  <div className="text-center text-sm mb-4 uppercase font-bold tracking-widest">{m.roundName}</div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="col-span-1 flex flex-col items-center">
                          <div className="font-bold text-lg mb-2 text-center h-12 flex items-center justify-center">{getPairName(m.pair1Id, m.pair1Name)}</div>
                          <div className="w-full h-24 border-2 border-black rounded flex items-center justify-center text-4xl text-gray-300">
                              {m.score.pair1Score ?? ''}
                          </div>
                      </div>
                      <div className="col-span-1 flex items-center justify-center font-bold text-2xl">VS</div>
                      <div className="col-span-1 flex flex-col items-center">
                          <div className="font-bold text-lg mb-2 text-center h-12 flex items-center justify-center">{getPairName(m.pair2Id, m.pair2Name)}</div>
                          <div className="w-full h-24 border-2 border-black rounded flex items-center justify-center text-4xl text-gray-300">
                              {m.score.pair2Score ?? ''}
                          </div>
                      </div>
                  </div>

                  <div className="mt-8 border-t border-black pt-4 grid grid-cols-2 gap-8">
                      <div>
                          <p className="text-xs uppercase mb-8">{t('winner', lang)}:</p>
                          <div className="border-b border-black"></div>
                      </div>
                      <div>
                          <p className="text-xs uppercase mb-8">{t('referee', lang)} / {t('signature', lang)}:</p>
                          <div className="border-b border-black"></div>
                      </div>
                  </div>
               </div>
             ))}
           </div>
           <div className="page-break w-full h-1"></div>
        </div>
      )}

      {/* 2. GROUP LISTS */}
      {(mode === 'groups' || mode === 'all') && (
        <div className="space-y-8 break-before-page">
           <h1 className="text-2xl font-bold text-center border-b-2 border-black pb-4 mb-8">{t('printGroups', lang)}</h1>
           <div className="grid grid-cols-1 gap-8">
               {groups.map(g => (
                   <div key={g.id} className="border border-black p-4 break-inside-avoid">
                       <h2 className="text-xl font-bold mb-4 bg-gray-100 p-2 border-b border-black">{g.name}</h2>
                       <table className="w-full border-collapse border border-black text-sm">
                           <thead>
                               <tr className="bg-gray-100">
                                   <th className="border border-black p-2 text-left">#</th>
                                   <th className="border border-black p-2 text-left">{t('team', lang)}</th>
                                   <th className="border border-black p-2 text-left">{t('totalPts', lang)}</th>
                               </tr>
                           </thead>
                           <tbody>
                               {g.pairIds.map((pid, idx) => {
                                   const p = pairs.find(x => x.id === pid);
                                   if(!p) return null;
                                   return (
                                       <tr key={pid}>
                                           <td className="border border-black p-2">{idx + 1}</td>
                                           <td className="border border-black p-2 font-bold">
                                               {p.player1.name} ({p.player1.rank}) & {p.player2.name} ({p.player2.rank})
                                           </td>
                                           <td className="border border-black p-2">{p.totalRankPoints}</td>
                                       </tr>
                                   )
                               })}
                           </tbody>
                       </table>
                   </div>
               ))}
           </div>
           <div className="page-break w-full h-1"></div>
        </div>
      )}

      {/* 3. SCHEDULE */}
      {(mode === 'schedule' || mode === 'all') && (
        <div className="space-y-8 break-before-page">
           <h1 className="text-2xl font-bold text-center border-b-2 border-black pb-4 mb-8">{t('printSchedule', lang)}</h1>
           <table className="w-full border-collapse border border-black text-sm">
               <thead>
                   <tr className="bg-gray-100">
                       <th className="border border-black p-2">{t('slot', lang)}</th>
                       <th className="border border-black p-2">{t('court', lang)}</th>
                       <th className="border border-black p-2">Match</th>
                       <th className="border border-black p-2">Round</th>
                       <th className="border border-black p-2 text-left">Team 1</th>
                       <th className="border border-black p-2 text-left">Team 2</th>
                       <th className="border border-black p-2">Score</th>
                   </tr>
               </thead>
               <tbody>
                   {sortedMatches.map(m => (
                       <tr key={m.id}>
                           <td className="border border-black p-2 text-center font-bold">{m.slotId}</td>
                           <td className="border border-black p-2 text-center">{m.courtId}</td>
                           <td className="border border-black p-2 text-center">{m.id}</td>
                           <td className="border border-black p-2 text-center text-xs uppercase">{m.roundName}</td>
                           <td className="border border-black p-2">{getPairName(m.pair1Id, m.pair1Name)}</td>
                           <td className="border border-black p-2">{getPairName(m.pair2Id, m.pair2Name)}</td>
                           <td className="border border-black p-2 text-center">
                               {m.finished ? `${m.score.pair1Score} - ${m.score.pair2Score}` : '___ - ___'}
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default PrintReports;
