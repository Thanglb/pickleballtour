import React, { useState } from 'react';
import { AppState, Group, Match, Pair, Player, Rank, TournamentConfig, Language } from './types';
import { generatePairs, generateSchedule, generateEliminationBracket, calculateStandings, t } from './utils';
import SetupStep from './components/SetupStep';
import PairingStep from './components/PairingStep';
import ScheduleView from './components/ScheduleView';
import StandingsView from './components/StandingsView';
import PrintReports from './components/PrintReports';
import { Calendar, Trophy, Users, LayoutList, Printer, Globe, X } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('vi'); // Default Vietnamese
  const [activeTab, setActiveTab] = useState<'schedule' | 'standings' | 'elimination'>('schedule');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printMode, setPrintMode] = useState<'sheets' | 'groups' | 'schedule' | 'all'>('all');

  const [state, setState] = useState<AppState>({
    step: 'setup',
    config: {
      numCourts: 3,
      numGroups: 2,
      maxPlayersPerGroup: 8,
      eliminationRounds: 2 // default to Semis+Final
    },
    players: [],
    pairs: [],
    groups: [],
    matches: []
  });

  const updateConfig = (c: TournamentConfig) => setState(prev => ({ ...prev, config: c }));
  const updatePlayers = (p: Player[]) => setState(prev => ({ ...prev, players: p }));

  const handleGeneratePairs = () => {
    const { pairs, groups } = generatePairs(state.players, state.config.numGroups);
    setState(prev => ({
      ...prev,
      pairs,
      groups,
      step: 'pairing'
    }));
  };

  const handleConfirmSchedule = () => {
    const matches = generateSchedule(state.groups, state.pairs, state.config);
    setState(prev => ({
      ...prev,
      matches,
      step: 'schedule'
    }));
  };

  const handleUpdateScore = (matchId: string, s1: number, s2: number) => {
    setState(prev => {
      const updatedMatches = prev.matches.map(m => {
        if (m.id !== matchId) return m;

        // Logic for Winner
        let winnerId: string | null = null;
        if (s1 > s2) winnerId = m.pair1Id;
        else if (s2 > s1) winnerId = m.pair2Id;

        // Create new Match object
        const newMatch: Match = {
             ...m,
             score: { pair1Score: s1, pair2Score: s2 },
             finished: true,
             winnerId: winnerId
        };
        return newMatch;
      });

      // Check if we need to update Elimination Bracket
      let finalMatches = [...updatedMatches];
      
      const justFinishedMatch = finalMatches.find(m => m.id === matchId);
      if(justFinishedMatch && justFinishedMatch.nextMatchId && justFinishedMatch.winnerId) {
          const winnerPair = prev.pairs.find(p => p.id === justFinishedMatch.winnerId);
          const winnerName = winnerPair ? `${winnerPair.player1.name}/${winnerPair.player2.name}` : 'TBD';

          finalMatches = finalMatches.map(nm => {
              if(nm.id === justFinishedMatch.nextMatchId) {
                  return {
                      ...nm,
                      [justFinishedMatch.nextMatchSlot === 'pair1' ? 'pair1Id' : 'pair2Id']: justFinishedMatch.winnerId!,
                      [justFinishedMatch.nextMatchSlot === 'pair1' ? 'pair1Name' : 'pair2Name']: winnerName,
                  };
              }
              return nm;
          });
      }

      return { ...prev, matches: finalMatches };
    });
  };
  
  const handleGenerateElimination = () => {
      const standings = calculateStandings(state.matches, state.pairs);
      
      const groupMatches = state.matches.filter(m => !m.isElimination);
      const lastSlot = Math.max(...groupMatches.map(m => m.slotId), 0);

      const elimMatches = generateEliminationBracket(
          state.groups, 
          standings, 
          state.pairs, 
          state.config.eliminationRounds,
          lastSlot + 2 
      );

      setState(prev => ({
          ...prev,
          matches: [...groupMatches, ...elimMatches]
      }));
  };

  const handlePrint = () => {
      setShowPrintModal(false);
      setTimeout(() => window.print(), 100);
  };

  const toggleLang = () => {
    setLang(prev => prev === 'vi' ? 'en' : 'vi');
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-slate-900 pb-20 print:bg-white print:pb-0">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Trophy className="text-yellow-400" />
            <h1 className="text-xl font-bold tracking-tight md:block hidden">{t('appTitle', lang)}</h1>
            <h1 className="text-xl font-bold tracking-tight md:hidden block">Pickleball Pro</h1>
          </div>
          <div className="flex items-center space-x-4">
              {state.step === 'schedule' && (
                <div className="text-sm text-gray-400 hidden md:block">
                  {state.matches.filter(m => m.finished).length} / {state.matches.length} {t('matches', lang)}
                </div>
              )}
              {state.matches.length > 0 && (
                <button 
                    onClick={() => setShowPrintModal(true)}
                    className="flex items-center text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded"
                >
                    <Printer size={16} className="mr-2" /> {t('print', lang)}
                </button>
              )}
              <button 
                onClick={toggleLang}
                className="flex items-center text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded w-16 justify-center"
              >
                 <span className="font-bold">{lang === 'vi' ? 'VN' : 'EN'}</span>
              </button>
          </div>
        </div>
      </header>

      {/* Main UI - Hidden when printing */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 print:hidden">
        {state.step === 'setup' && (
          <SetupStep 
            config={state.config} 
            players={state.players} 
            lang={lang}
            setConfig={updateConfig} 
            setPlayers={updatePlayers}
            onNext={handleGeneratePairs}
          />
        )}

        {state.step === 'pairing' && (
          <PairingStep 
            groups={state.groups} 
            pairs={state.pairs} 
            lang={lang}
            onRegenerate={handleGeneratePairs}
            onConfirm={handleConfirmSchedule}
          />
        )}

        {state.step === 'schedule' && (
          <div className="space-y-6">
            
            {/* Tabs */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-fit mx-auto mb-6">
                <button 
                  onClick={() => setActiveTab('schedule')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'schedule' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                   <Calendar size={16} className="mr-2" /> {t('schedule', lang)}
                </button>
                <button 
                  onClick={() => setActiveTab('standings')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'standings' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                   <LayoutList size={16} className="mr-2" /> {t('standings', lang)}
                </button>
                {state.config.eliminationRounds > 0 && (
                    <button 
                    onClick={() => setActiveTab('elimination')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'elimination' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                    <Trophy size={16} className="mr-2" /> {t('playoffs', lang)}
                    </button>
                )}
            </div>

            {activeTab === 'schedule' && (
                <ScheduleView 
                    matches={state.matches} 
                    pairs={state.pairs} 
                    groups={state.groups} 
                    config={state.config}
                    lang={lang}
                    onUpdateScore={handleUpdateScore}
                />
            )}

            {activeTab === 'standings' && (
                <StandingsView 
                    groups={state.groups} 
                    pairs={state.pairs} 
                    matches={state.matches} 
                    lang={lang}
                />
            )}
            
            {activeTab === 'elimination' && (
                <div className="space-y-6">
                     <div className="flex justify-between items-center bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <div>
                            <h3 className="font-bold text-orange-800">{t('generateBracket', lang)}</h3>
                            <p className="text-xs text-orange-600">{t('bracketNote', lang)}</p>
                        </div>
                        <button 
                            onClick={handleGenerateElimination}
                            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 shadow-sm text-sm font-medium"
                        >
                            {t('generateBracket', lang)}
                        </button>
                     </div>
                     <ScheduleView 
                        matches={state.matches.filter(m => m.isElimination)} 
                        pairs={state.pairs} 
                        groups={state.groups} 
                        config={state.config}
                        lang={lang}
                        onUpdateScore={handleUpdateScore}
                    />
                </div>
            )}

          </div>
        )}
      </main>

      {/* Print Modal Overlay */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center print:hidden">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl relative">
                <button onClick={() => setShowPrintModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <h2 className="text-xl font-bold mb-4 flex items-center"><Printer className="mr-2" /> {t('printOptions', lang)}</h2>
                
                <div className="space-y-3 mb-6">
                    <label className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <input type="radio" name="printMode" checked={printMode === 'sheets'} onChange={() => setPrintMode('sheets')} className="w-5 h-5 text-indigo-600" />
                        <span>{t('printSheets', lang)}</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <input type="radio" name="printMode" checked={printMode === 'groups'} onChange={() => setPrintMode('groups')} className="w-5 h-5 text-indigo-600" />
                        <span>{t('printGroups', lang)}</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <input type="radio" name="printMode" checked={printMode === 'schedule'} onChange={() => setPrintMode('schedule')} className="w-5 h-5 text-indigo-600" />
                        <span>{t('printSchedule', lang)}</span>
                    </label>
                    <label className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <input type="radio" name="printMode" checked={printMode === 'all'} onChange={() => setPrintMode('all')} className="w-5 h-5 text-indigo-600" />
                        <span>{t('print', lang)} All</span>
                    </label>
                </div>

                <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowPrintModal(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">{t('close', lang)}</button>
                    <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow">{t('print', lang)}</button>
                </div>
            </div>
        </div>
      )}

      {/* Print Content (Only visible when printing) */}
      <PrintReports state={state} lang={lang} mode={printMode} />
    </div>
  );
};

export default App;