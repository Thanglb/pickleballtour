import React, { useState } from 'react';
import { Group, Pair, Match, Language, StandingsRow } from '../types';
import { calculateStandings, calculatePlayerStandings, sortStandings, t } from '../utils';

interface Props {
  groups: Group[];
  pairs: Pair[];
  matches: Match[];
  lang: Language;
}

const StandingsView: React.FC<Props> = ({ groups, pairs, matches, lang }) => {
  const [viewMode, setViewMode] = useState<'pair' | 'individual'>('pair');

  const pairStandings = calculateStandings(matches, pairs);
  const playerStandings = calculatePlayerStandings(matches, pairs);

  const renderTable = (rows: StandingsRow[], title: string, isPair: boolean) => (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-8">
      <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
        <h3 className="text-lg font-bold text-indigo-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rk', lang)}</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px]">{t('name', lang)}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('mp', lang)}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('w', lang)}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('l', lang)}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100">{t('totalPts', lang)}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pointsFor', lang)}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pointsAgainst', lang)}</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('diff', lang)}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((row, idx) => (
              <tr key={row.pairId} className={idx < 2 && isPair ? 'bg-green-50/50' : ''}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-center">{idx + 1}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.pairName}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500">{row.matchesPlayed}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-bold text-green-600">{row.wins}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-red-400">{row.losses}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900 bg-gray-50">{row.wins}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500">{row.pointsFor}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500">{row.pointsAgainst}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-mono font-medium text-blue-600">
                  {row.diff > 0 ? `+${row.diff}` : row.diff}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={9} className="text-center py-4 text-gray-400">No data</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-center space-x-4 mb-6">
         <button 
           onClick={() => setViewMode('pair')}
           className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'pair' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}
         >
           {t('pairStandings', lang)}
         </button>
         <button 
           onClick={() => setViewMode('individual')}
           className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${viewMode === 'individual' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}
         >
           {t('individualStandings', lang)}
         </button>
      </div>

      {viewMode === 'pair' && groups.map(group => {
        const rawRows = Object.values(pairStandings).filter(row => pairs.find(p => p.id === row.pairId)?.groupId === group.id);
        const sortedRows = sortStandings(rawRows, matches, true);
        return <div key={group.id}>{renderTable(sortedRows, `${group.name} - ${t('pairStandings', lang)}`, true)}</div>
      })}

      {viewMode === 'individual' && groups.map(group => {
         // Filter players belonging to this group
         const groupPairs = pairs.filter(p => p.groupId === group.id);
         const playerIds = new Set<string>();
         groupPairs.forEach(p => { playerIds.add(p.player1.id); playerIds.add(p.player2.id); });

         const rawRows = Object.values(playerStandings).filter(row => playerIds.has(row.pairId));
         const sortedRows = sortStandings(rawRows, matches, false);
         
         return <div key={group.id}>{renderTable(sortedRows, `${group.name} - ${t('individualStandings', lang)}`, false)}</div>
      })}
    </div>
  );
};

export default StandingsView;