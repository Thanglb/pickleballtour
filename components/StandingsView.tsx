import React from 'react';
import { Group, Pair, Match, Language } from '../types';
import { calculateStandings, t } from '../utils';

interface Props {
  groups: Group[];
  pairs: Pair[];
  matches: Match[];
  lang: Language;
}

const StandingsView: React.FC<Props> = ({ groups, pairs, matches, lang }) => {
  const standings = calculateStandings(matches, pairs);

  return (
    <div className="space-y-8">
      {groups.map(group => {
        // Filter and Sort for this group
        const groupStandings = Object.values(standings)
          .filter(row => pairs.find(p => p.id === row.pairId)?.groupId === group.id)
          .sort((a, b) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            if (b.diff !== a.diff) return b.diff - a.diff;
            return b.pointsFor - a.pointsFor;
          });

        return (
          <div key={group.id} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100">
              <h3 className="text-lg font-bold text-indigo-900">{group.name} {t('standings', lang)}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rk', lang)}</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('team', lang)}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('mp', lang)}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('w', lang)}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('l', lang)}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('diff', lang)}</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('ptsPlus', lang)}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupStandings.map((row, idx) => (
                    <tr key={row.pairId} className={idx < 2 ? 'bg-green-50/50' : ''}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{idx + 1}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.pairName}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500">{row.matchesPlayed}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-bold text-green-600">{row.wins}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-red-400">{row.losses}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">{row.diff > 0 ? `+${row.diff}` : row.diff}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500">{row.pointsFor}</td>
                    </tr>
                  ))}
                  {groupStandings.length === 0 && <tr><td colSpan={7} className="text-center py-4 text-gray-400">No data</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StandingsView;