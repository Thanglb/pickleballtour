import React from 'react';
import { Group, Pair, Language } from '../types';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { t } from '../utils';

interface Props {
  groups: Group[];
  pairs: Pair[];
  lang: Language;
  onRegenerate: () => void;
  onConfirm: () => void;
}

const PairingStep: React.FC<Props> = ({ groups, pairs, lang, onRegenerate, onConfirm }) => {
  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">{t('confirmPairs', lang)}</h2>
            <p className="text-gray-600">{t('pairsGenerated', lang)}</p>
         </div>
         <div className="flex gap-2">
            <button onClick={onRegenerate} className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50">
                <RefreshCw size={16} className="mr-2" /> {t('regenerate', lang)}
            </button>
            <button onClick={onConfirm} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 shadow-sm">
                <CheckCircle size={16} className="mr-2" /> {t('confirmSchedule', lang)}
            </button>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {groups.map(group => (
           <div key={group.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
             <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
               <h3 className="font-bold text-indigo-900">{group.name}</h3>
               <span className="text-xs text-indigo-700 bg-indigo-100 px-2 py-1 rounded-full">{group.pairIds.length} Pairs</span>
             </div>
             <div className="p-4 space-y-3">
               {group.pairIds.map(pairId => {
                 const pair = pairs.find(p => p.id === pairId);
                 if (!pair) return null;
                 return (
                   <div key={pair.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
                     <div className="flex flex-col">
                        <span className="font-medium text-sm text-gray-900">{pair.player1.name} <span className="text-xs text-gray-500">({pair.player1.rank})</span></span>
                        <span className="font-medium text-sm text-gray-900">{pair.player2.name} <span className="text-xs text-gray-500">({pair.player2.rank})</span></span>
                     </div>
                     <div className="text-center">
                       <div className="text-xs text-gray-400 uppercase">{t('totalPts', lang)}</div>
                       <div className="font-bold text-lg text-indigo-600">{pair.totalRankPoints}</div>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
         ))}
       </div>
    </div>
  );
};

export default PairingStep;