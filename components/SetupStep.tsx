import React, { useState, useRef } from 'react';
import { Player, Rank, TournamentConfig, Language } from '../types';
import { generatePlayerId, t } from '../utils';
import { Plus, Trash2, Users, Upload, FileDown } from 'lucide-react';
import { read, utils } from 'xlsx';

interface Props {
  config: TournamentConfig;
  players: Player[];
  lang: Language;
  setConfig: (c: TournamentConfig) => void;
  setPlayers: (p: Player[]) => void;
  onNext: () => void;
}

const SetupStep: React.FC<Props> = ({ config, players, lang, setConfig, setPlayers, onNext }) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerRank, setNewPlayerRank] = useState<Rank>(Rank.A);
  const [excludeIds, setExcludeIds] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPlayer = () => {
    if (!newPlayerName.trim()) return;
    const newId = generatePlayerId(players.length);
    const exclusions = excludeIds.split(',').map(s => s.trim().toUpperCase()).filter(s => s);
    
    const newPlayer: Player = {
      id: newId,
      name: newPlayerName,
      rank: newPlayerRank,
      points: 0, // Calculated in utils based on Rank enum, handled there or mapped here
      excludeIds: exclusions
    };

    // Map rank to points immediately for easier sorting later
    const pointMap: Record<string, number> = { 'A+': 4, 'A': 3, 'B+': 2, 'B': 1 };
    newPlayer.points = pointMap[newPlayerRank];

    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
    setExcludeIds('');
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const generateDummyPlayers = () => {
      const dummies: Player[] = [];
      const ranks = [Rank.APlus, Rank.A, Rank.BPlus, Rank.B];
      for(let i=0; i<16; i++) {
          const r = ranks[Math.floor(Math.random() * ranks.length)];
          const pointMap: Record<string, number> = { 'A+': 4, 'A': 3, 'B+': 2, 'B': 1 };
          dummies.push({
              id: generatePlayerId(i),
              name: `Player ${i+1}`,
              rank: r,
              points: pointMap[r],
              excludeIds: []
          });
      }
      setPlayers(dummies);
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
        const data = await file.arrayBuffer();
        const workbook = read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = utils.sheet_to_json(worksheet);

        const newPlayers: Player[] = [];
        let currentIndex = players.length;

        const pointMap: Record<string, number> = { 'A+': 4, 'A': 3, 'B+': 2, 'B': 1 };

        jsonData.forEach((row) => {
            // Support both Vietnamese and English headers
            const name = row['Tên'] || row['Name'];
            let rankStr = row['Hạng'] || row['Rank'];
            const exclusionStr = row['Tránh gặp'] || row['Exclusions'];

            if (name) {
                // Normalize Rank
                let rank: Rank = Rank.A;
                if(rankStr) {
                    rankStr = rankStr.toString().trim().toUpperCase();
                    if(rankStr === 'A+') rank = Rank.APlus;
                    else if(rankStr === 'A') rank = Rank.A;
                    else if(rankStr === 'B+') rank = Rank.BPlus;
                    else if(rankStr === 'B') rank = Rank.B;
                }

                // Process Exclusions
                const excludeIds = exclusionStr 
                    ? exclusionStr.toString().split(',').map((s: string) => s.trim().toUpperCase())
                    : [];

                newPlayers.push({
                    id: generatePlayerId(currentIndex),
                    name: name,
                    rank: rank,
                    points: pointMap[rank],
                    excludeIds: excludeIds
                });
                currentIndex++;
            }
        });

        if (newPlayers.length > 0) {
            setPlayers([...players, ...newPlayers]);
        }
    } catch (error) {
        console.error("Error parsing Excel:", error);
        alert(t('excelError', lang));
    } finally {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const handleDownloadTemplate = () => {
     const headers = [["Tên", "Hạng", "Tránh gặp"], ["Nguyen Van A", "A+", "P02, P05"]];
     const ws = utils.aoa_to_sheet(headers);
     const wb = utils.book_new();
     utils.book_append_sheet(wb, ws, "Template");
     import("xlsx").then(xlsx => {
         xlsx.writeFile(wb, "Pickleball_Template.xlsx");
     });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4 flex items-center text-slate-800"><Users className="mr-2" /> {t('setup', lang)}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('numGroups', lang)}</label>
            <input 
              type="number" min="1" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              value={config.numGroups}
              onChange={(e) => setConfig({...config, numGroups: parseInt(e.target.value) || 1})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('numCourts', lang)}</label>
            <input 
              type="number" min="1" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              value={config.numCourts}
              onChange={(e) => setConfig({...config, numCourts: parseInt(e.target.value) || 1})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('elimRounds', lang)}</label>
            <input 
              type="number" min="0" max="4"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
              value={config.eliminationRounds}
              onChange={(e) => setConfig({...config, eliminationRounds: parseInt(e.target.value) || 0})}
            />
             <p className="text-xs text-gray-500 mt-1">1=Final, 2=Semi, 3=Quarter, 4=1/8</p>
          </div>
          <div>
             <label className="block text-sm font-medium text-gray-700">{t('maxPlayers', lang)}</label>
             <input 
                type="number" min="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                value={config.maxPlayersPerGroup}
                onChange={(e) => setConfig({...config, maxPlayersPerGroup: parseInt(e.target.value) || 8})}
            />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <h2 className="text-xl font-bold text-slate-800">{t('playerReg', lang)} ({players.length})</h2>
            <div className="flex gap-2">
                 <button onClick={handleDownloadTemplate} className="text-sm text-gray-600 hover:text-gray-900 flex items-center border px-2 py-1 rounded">
                    <FileDown size={14} className="mr-1" /> Template
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef}
                    accept=".xlsx, .xls" 
                    onChange={handleFileUpload} 
                    className="hidden"
                />
                <button onClick={() => fileInputRef.current?.click()} className="text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded flex items-center font-medium">
                    <Upload size={14} className="mr-1" /> {t('importExcel', lang)}
                </button>
                <button onClick={generateDummyPlayers} className="text-sm text-indigo-600 hover:text-indigo-800 underline">
                    {t('autoFill', lang)}
                </button>
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 mb-4">
          <input 
            type="text" placeholder={t('name', lang)} 
            className="flex-1 rounded-md border-gray-300 border p-2"
            value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPlayer()}
          />
          <select 
            className="rounded-md border-gray-300 border p-2"
            value={newPlayerRank} onChange={e => setNewPlayerRank(e.target.value as Rank)}
          >
            {Object.values(Rank).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <input 
            type="text" placeholder={`${t('exclusions', lang)} (e.g. P01, P05)`} 
            className="flex-1 rounded-md border-gray-300 border p-2"
            value={excludeIds} onChange={e => setExcludeIds(e.target.value)}
          />
          <button onClick={addPlayer} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center">
            <Plus size={18} /> {t('add', lang)}
          </button>
        </div>

        <div className="overflow-x-auto max-h-[400px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name', lang)}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('rank', lang)}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('exclusions', lang)}</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('action', lang)}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {players.map(p => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${p.rank === 'A+' ? 'bg-purple-100 text-purple-800' : 
                          p.rank === 'A' ? 'bg-blue-100 text-blue-800' : 
                          p.rank === 'B+' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {p.rank} ({p.points}pts)
                      </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.excludeIds.join(', ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => removePlayer(p.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {players.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">{t('noPlayers', lang)}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={onNext}
          disabled={players.length < 4}
          className={`px-6 py-3 rounded-md text-white font-medium ${players.length < 4 ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
        >
          {t('generatePairs', lang)} &rarr;
        </button>
      </div>
    </div>
  );
};

export default SetupStep;