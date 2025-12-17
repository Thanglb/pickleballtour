import React, { useState } from 'react';
import { Match, Pair, Group, Language } from '../types';
import { Save, Edit2 } from 'lucide-react';
import { t } from '../utils';

interface Props {
  matches: Match[];
  pairs: Pair[];
  groups: Group[];
  config: { numCourts: number };
  lang: Language;
  onUpdateScore: (matchId: string, s1: number, s2: number) => void;
}

const ScheduleView: React.FC<Props> = ({ matches, pairs, groups, config, lang, onUpdateScore }) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  
  // Group matches by Slot -> Court
  const slots: number[] = Array.from<number>(new Set(matches.map(m => m.slotId))).sort((a: number, b: number) => a - b);

  const getMatchBySlotAndCourt = (slot: number, court: number) => {
    return matches.find(m => m.slotId === slot && m.courtId === court);
  };

  const filteredMatches = selectedGroup === 'all' 
    ? matches 
    : matches.filter(m => m.groupId === selectedGroup || (m.isElimination && selectedGroup === 'elim'));

  const filteredSlots: number[] = Array.from<number>(new Set(filteredMatches.map(m => m.slotId))).sort((a: number, b: number) => a - b);

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button 
          onClick={() => setSelectedGroup('all')}
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${selectedGroup === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          {t('allCourts', lang)}
        </button>
        {groups.map(g => (
          <button 
            key={g.id}
            onClick={() => setSelectedGroup(g.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${selectedGroup === g.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {g.name} Only
          </button>
        ))}
         <button 
          onClick={() => setSelectedGroup('elim')}
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${selectedGroup === 'elim' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          {t('elimOnly', lang)}
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-20">
                {t('slot', lang)}
              </th>
              {Array.from({ length: config.numCourts }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[260px]">
                  {t('court', lang)} {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSlots.map(slot => (
              <tr key={slot}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-100">
                  #{slot}
                </td>
                {Array.from({ length: config.numCourts }).map((_, i) => {
                  const match = getMatchBySlotAndCourt(slot, i + 1);
                  // Apply filter logic visually (hide if not in filter)
                  const isVisible = match && (selectedGroup === 'all' || match.groupId === selectedGroup || (selectedGroup === 'elim' && match.isElimination));

                  return (
                    <td key={i} className="px-2 py-2 align-top border-l border-gray-100 bg-gray-50/30">
                      {match && isVisible ? (
                        <MatchCard match={match} pairs={pairs} lang={lang} onUpdateScore={onUpdateScore} />
                      ) : match ? (
                         <div className="text-xs text-gray-300 text-center py-4">{t('filter', lang)}</div>
                      ) : (
                        <div className="text-xs text-gray-300 text-center py-4">- {t('free', lang)} -</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
             {filteredSlots.length === 0 && (
                 <tr><td colSpan={config.numCourts + 1} className="p-8 text-center text-gray-500">{t('noPlayers', lang)}</td></tr>
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MatchCard: React.FC<{ match: Match, pairs: Pair[], lang: Language, onUpdateScore: (id: string, s1: number, s2: number) => void }> = ({ match, pairs, lang, onUpdateScore }) => {
  const [s1, setS1] = useState(match.score.pair1Score?.toString() || '');
  const [s2, setS2] = useState(match.score.pair2Score?.toString() || '');
  
  // Update local state if match score changes externally (though rare in this flow)
  React.useEffect(() => {
     if (match.score.pair1Score !== null) setS1(match.score.pair1Score.toString());
     if (match.score.pair2Score !== null) setS2(match.score.pair2Score.toString());
  }, [match.score]);

  const getLabel = (id: string, fallback?: string) => {
      const p = pairs.find(x => x.id === id);
      if(p) return `${p.player1.name} & ${p.player2.name}`;
      return fallback || 'TBD';
  }

  const handleSave = () => {
    const v1 = parseInt(s1);
    const v2 = parseInt(s2);
    if (!isNaN(v1) && !isNaN(v2)) {
      onUpdateScore(match.id, v1, v2);
    }
  };

  const isCompleted = match.finished;
  const borderColor = match.isElimination ? 'border-orange-300 bg-orange-50' : isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-300 bg-white';

  return (
    <div className={`p-3 rounded-md border shadow-sm ${borderColor} text-sm h-full flex flex-col justify-between`}>
      <div className="flex justify-between items-center mb-2 border-b border-black/5 pb-1">
        <span className="text-xs font-bold text-gray-500">{match.id}</span>
        <span className="text-[10px] uppercase text-gray-400">{match.roundName}</span>
      </div>
      
      <div className="space-y-3 mb-2">
        <div className="flex justify-between items-center gap-2">
            <div className="text-xs font-medium text-slate-800 leading-tight flex-1" title={getLabel(match.pair1Id, match.pair1Name)}>
                {getLabel(match.pair1Id, match.pair1Name)}
            </div>
            <input 
            type="number" className="w-10 h-8 text-center border rounded flex-shrink-0 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={s1} onChange={e => setS1(e.target.value)} 
            />
        </div>
        
        <div className="flex justify-between items-center gap-2">
            <div className="text-xs font-medium text-slate-800 leading-tight flex-1" title={getLabel(match.pair2Id, match.pair2Name)}>
                {getLabel(match.pair2Id, match.pair2Name)}
            </div>
            <input 
            type="number" className="w-10 h-8 text-center border rounded flex-shrink-0 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            value={s2} onChange={e => setS2(e.target.value)} 
            />
        </div>
      </div>

      {match.pair1Id !== 'TBD' && match.pair2Id !== 'TBD' && (
         <button 
            onClick={handleSave} 
            className={`w-full text-xs py-1.5 rounded flex justify-center items-center mt-2 transition-colors
                ${isCompleted ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
         >
             {isCompleted ? <><Edit2 size={14} className="mr-1"/> {t('update', lang)}</> : <><Save size={14} className="mr-1"/> {t('save', lang)}</>}
         </button>
      )}
    </div>
  );
};

export default ScheduleView;