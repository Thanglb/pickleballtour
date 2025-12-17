import React, { useState } from 'react';
import { Match, Pair, Group, Language } from '../types';
import { Save, Edit2, Trophy } from 'lucide-react';
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10 w-20 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                {t('slot', lang)}
              </th>
              {Array.from({ length: config.numCourts }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[280px]">
                  {t('court', lang)} {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSlots.map(slot => (
              <tr key={slot}>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 sticky left-0 bg-white z-10 border-r border-gray-100 shadow-[1px_0_0_0_rgba(0,0,0,0.05)]">
                  #{slot}
                </td>
                {Array.from({ length: config.numCourts }).map((_, i) => {
                  const match = getMatchBySlotAndCourt(slot, i + 1);
                  // Apply filter logic visually (hide if not in filter)
                  const isVisible = match && (selectedGroup === 'all' || match.groupId === selectedGroup || (selectedGroup === 'elim' && match.isElimination));

                  return (
                    <td key={i} className="px-3 py-3 align-top border-l border-gray-100 bg-gray-50/30">
                      {match && isVisible ? (
                        <MatchCard match={match} pairs={pairs} lang={lang} onUpdateScore={onUpdateScore} />
                      ) : match ? (
                         <div className="text-xs text-gray-300 text-center py-4 opacity-50">{t('filter', lang)}</div>
                      ) : (
                        <div className="text-xs text-gray-300 text-center py-4 border-2 border-dashed border-gray-100 rounded-lg mx-2">- {t('free', lang)} -</div>
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
  
  // Style calculations
  const isP1Winner = isCompleted && match.winnerId === match.pair1Id;
  const isP2Winner = isCompleted && match.winnerId === match.pair2Id;

  return (
    <div className={`rounded-xl border shadow-sm transition-all duration-200 overflow-hidden flex flex-col h-full bg-white
        ${match.isElimination ? 'border-orange-200' : isCompleted ? 'border-green-200' : 'border-gray-200 hover:shadow-md'}`}>
      
      {/* Header */}
      <div className={`flex justify-between items-center px-3 py-2 border-b text-xs font-semibold
        ${match.isElimination ? 'bg-orange-50 text-orange-800 border-orange-100' : isCompleted ? 'bg-green-50 text-green-800 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
        <span className="bg-white/50 px-1.5 py-0.5 rounded border border-black/5">{match.id}</span>
        <span className="uppercase tracking-wide text-[10px]">{match.roundName}</span>
      </div>
      
      <div className="p-3 space-y-3 flex-1">
        {/* Team 1 Row */}
        <div className={`flex items-center justify-between p-2 rounded-lg border-2 transition-colors
            ${isP1Winner 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-100 bg-white focus-within:border-indigo-300'}`}>
            <div className="flex-1 pr-2">
                 <div className={`text-xs font-bold leading-tight ${isP1Winner ? 'text-green-900' : 'text-slate-700'}`} title={getLabel(match.pair1Id, match.pair1Name)}>
                    {getLabel(match.pair1Id, match.pair1Name)}
                </div>
                {isP1Winner && <div className="text-[10px] text-green-600 font-medium flex items-center mt-0.5"><Trophy size={10} className="mr-1"/> Winner</div>}
            </div>
            <input 
                type="number" 
                className={`w-12 h-10 text-center text-lg font-bold border-2 rounded-md outline-none transition-all
                ${isP1Winner ? 'border-green-400 bg-white text-green-700' : 'border-gray-200 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
                value={s1} onChange={e => setS1(e.target.value)} 
                placeholder="-"
            />
        </div>
        
        {/* Team 2 Row */}
        <div className={`flex items-center justify-between p-2 rounded-lg border-2 transition-colors
            ${isP2Winner 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-100 bg-white focus-within:border-indigo-300'}`}>
            <div className="flex-1 pr-2">
                <div className={`text-xs font-bold leading-tight ${isP2Winner ? 'text-green-900' : 'text-slate-700'}`} title={getLabel(match.pair2Id, match.pair2Name)}>
                    {getLabel(match.pair2Id, match.pair2Name)}
                </div>
                 {isP2Winner && <div className="text-[10px] text-green-600 font-medium flex items-center mt-0.5"><Trophy size={10} className="mr-1"/> Winner</div>}
            </div>
            <input 
                type="number" 
                className={`w-12 h-10 text-center text-lg font-bold border-2 rounded-md outline-none transition-all
                ${isP2Winner ? 'border-green-400 bg-white text-green-700' : 'border-gray-200 text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'}`}
                value={s2} onChange={e => setS2(e.target.value)} 
                placeholder="-"
            />
        </div>
      </div>

      {/* Action Footer */}
      {(match.pair1Id !== 'TBD' && match.pair2Id !== 'TBD') && (
        <div className="px-3 pb-3">
             <button 
                onClick={handleSave} 
                className={`w-full py-2 rounded-lg font-medium text-xs flex justify-center items-center transition-all shadow-sm
                    ${isCompleted 
                        ? 'bg-white border border-green-600 text-green-700 hover:bg-green-50' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow'}`}
            >
                {isCompleted ? <><Edit2 size={14} className="mr-1.5"/> {t('update', lang)}</> : <><Save size={14} className="mr-1.5"/> {t('save', lang)}</>}
            </button>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;