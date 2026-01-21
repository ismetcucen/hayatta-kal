import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HumanBody from './components/HumanBody';
import MapController from './components/MapController';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import { scenarios } from './data/scenarios';
import { supabase } from './supabaseClient';
import { Play, RotateCcw, AlertTriangle, Map as MapIcon, Settings, Trophy, LogOut } from 'lucide-react';
import clsx from 'clsx';
import { cityStats } from './data/cityData';

function Game() {
    const [currentUser, setCurrentUser] = useState(null);
    const [currentCity, setCurrentCity] = useState(null);
    const [currentScenario, setCurrentScenario] = useState(null);
    const [gameScenarios, setGameScenarios] = useState(scenarios);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [riskLevel, setRiskLevel] = useState(0);
    const [chatHistory, setChatHistory] = useState([]);
    const [gameStatus, setGameStatus] = useState('map'); // map, playing, finished
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [classLeaderboard, setClassLeaderboard] = useState([]);

    const [activeMission, setActiveMission] = useState('hepsi');

    const updateScorePoints = async (delta) => {
        if (!currentUser) return;

        // Optimistic update
        setCurrentUser(prev => ({ ...prev, score: (prev.score || 0) + delta }));

        // DB Update
        const { data: freshUser } = await supabase.from('students').select('score').eq('id', currentUser.id).single();
        if (freshUser) {
            await supabase.from('students').update({ score: freshUser.score + delta }).eq('id', currentUser.id);
        }
    };

    useEffect(() => {
        const fetchGameData = async () => {
            // Fetch Scenarios
            const { data: scenariosData } = await supabase.from('scenarios').select('*');
            if (scenariosData && scenariosData.length > 0) {
                setGameScenarios(scenariosData);
            }

            // Fetch Active Mission Setting
            const { data: settingsData } = await supabase.from('game_settings').select('active_mission').eq('id', 'global_config').single();
            if (settingsData) {
                setActiveMission(settingsData.active_mission);
            }
        };
        fetchGameData();
    }, []);

    useEffect(() => {
        if (showLeaderboard && currentUser) {
            fetchLeaderboard();
        }
    }, [showLeaderboard]);


    const fetchLeaderboard = async () => {
        const { data } = await supabase
            .from('students')
            .select('*')
            .eq('class_id', currentUser.class_id)
            .order('score', { ascending: false })
            .limit(10);
        if (data) setClassLeaderboard(data);
    };

    const getMissionCities = () => {
        if (activeMission === 'hepsi') return Object.keys(cityStats);
        return Object.keys(cityStats).filter(key => cityStats[key].dangerType === activeMission);
    };

    const [completedCityIds, setCompletedCityIds] = useState([]);

    const selectCity = (city) => {
        // Find the key for this city object
        const cityKey = Object.keys(cityStats).find(key => cityStats[key].name === city.name);

        if (activeMission !== 'hepsi' && city.dangerType !== activeMission) {
            alert("Bu bölge şu anki görev kapsamında değil!");
            return;
        }
        if (completedCityIds.includes(cityKey)) {
            alert("Bu bölgedeki görev zaten tamamlandı!");
            return;
        }

        setCurrentCity(city);
        setRiskLevel(0);

        // Load scenario
        let type = city.dangerType;
        if (activeMission !== 'hepsi') type = activeMission; // Enforce mission type

        const scenario = gameScenarios.find(s => s.id === type) || gameScenarios[0];
        setCurrentScenario(scenario);

        const initialSteps = scenario.steps || [];
        if (initialSteps.length === 0) {
            console.error("Scenario has no steps!");
            return;
        }

        // Determine which step (question) to show based on progress
        const missionProgress = completedCityIds.length;
        const stepIndex = missionProgress % initialSteps.length;

        setCurrentStepIndex(stepIndex); // LOAD SPECIFIC STEP

        let warningText = "";
        switch (city.dangerType) {
            case 'sel':
                warningText = `UYARI: ${city.name} bölgesinde sel felaketi başladı!`;
                break;
            case 'cig':
                warningText = `UYARI: ${city.name} dağlık bölgesinde çığ düştü!`;
                break;
            case 'yangin':
                warningText = `ALARM: ${city.name} ormanlarında yangın çıktı!`;
                break;
            default:
                warningText = `UYARI: ${city.name} bölgesinde şiddetli sarsıntı tespit edildi!`;
        }

        setChatHistory([
            { type: 'bot', text: warningText },
            { type: 'bot', text: scenario.intro },
            { type: 'bot', text: initialSteps[stepIndex].question }
        ]);

        setGameStatus('intro');
        setTimeout(() => setGameStatus('playing'), 2500);
    };

    const startGame = () => {
        if (!currentCity) {
            // Auto-select first city if none selected in map
            const missionKeys = getMissionCities();
            const unvisited = missionKeys.filter(k => !completedCityIds.includes(k));
            if (unvisited.length > 0) {
                const randomKey = unvisited[Math.floor(Math.random() * unvisited.length)];
                selectCity(cityStats[randomKey]);
            } else {
                alert("Lütfen haritadan bir şehir seçin.");
            }
        } else {
            setGameStatus('playing');
        }
    };

    const handleOptionClick = (option) => {
        setChatHistory(prev => [...prev, { type: 'user', text: option.text }]);
        const newRisk = Math.min(100, riskLevel + option.riskChanges);
        setRiskLevel(newRisk);

        setTimeout(() => {
            setChatHistory(prev => [...prev, { type: 'bot', text: option.feedback, isFeedback: true }]);

            if (newRisk >= 100) {
                setChatHistory(prev => [...prev, { type: 'bot', text: "💀 MAALESEF KAYBETTİNİZ. Risk seviyeniz %100'e ulaştı." }]);
                setGameStatus('finished');
                updateScore(100); // 0 score gained (effectively) or max penalty
            } else {
                const isWrongAnswer = option.riskChanges > 0;

                // Show feedback
                if (isWrongAnswer) {
                    setChatHistory(prev => [...prev, { type: 'bot', text: "❌ Yanlış karar! Risk seviyesi arttı.", isWarning: true }]);
                    // Penalty for wrong answer? Maybe just higher risk results in lower final score.
                    // Or we can explicitly decrease score.
                    // For now, let's rely on risk level affecting the final calculation or added points.
                } else {
                    setChatHistory(prev => [...prev, { type: 'bot', text: "✅ Doğru hamle! Risk seviyesi kontrol altında." }]);
                }

                // ADVANCE LOGIC (Regardless of Right/Wrong, unless dead)

                // Mark confirmed complete for this city
                const cityKey = Object.keys(cityStats).find(key => cityStats[key].name === currentCity.name);

                // Only add if not already there (safety check)
                let newCompleted = completedCityIds;
                if (!completedCityIds.includes(cityKey)) {
                    newCompleted = [...completedCityIds, cityKey];
                    setCompletedCityIds(newCompleted);
                }

                // Check Mission Status
                const allMissionCities = getMissionCities();
                const isMissionComplete = allMissionCities.every(k => newCompleted.includes(k));

                // Update Score
                // If correct: +20 points. If wrong: -10 points.
                // We need a different updateScore logic for this "action-based" scoring
                const scoreDelta = isWrongAnswer ? -10 : 20;
                updateScorePoints(scoreDelta);

                if (isMissionComplete) {
                    setTimeout(() => {
                        setChatHistory(prev => [...prev, { type: 'bot', text: "🏆 GÖREV TAMAMLANDI! Tüm bölgeler ziyaret edildi." }]);
                        setGameStatus('finished');
                    }, 1000);
                } else {
                    // AUTO-ADVANCE logic
                    setTimeout(() => {
                        setChatHistory(prev => [...prev, { type: 'bot', text: "🚁 Helikopter hazırlanıyor... Sıradaki acil durum bölgesine geçiliyor..." }]);

                        setTimeout(() => {
                            // Pick next random unvisited city
                            const unvisited = allMissionCities.filter(k => !newCompleted.includes(k));
                            if (unvisited.length > 0) {
                                const nextKey = unvisited[Math.floor(Math.random() * unvisited.length)];
                                selectCity(cityStats[nextKey]);
                            }
                        }, 3000);
                    }, 1000);
                }
            }
        }, 600);
    };

    const restartGame = () => {
        setGameStatus('map');
        setCurrentCity(null);
        setChatHistory([]);
        setRiskLevel(0);
        // We do NOT plain reset completedCityIds here, because users might want to continue map.
        // But if they explicitly formatted "Restart" from a finished game, maybe we should?
        // Let's reset only if Mission is Complete, otherwise keep progress.
        const allMissionCities = getMissionCities();
        if (completedCityIds.length >= allMissionCities.length) {
            setCompletedCityIds([]);
        }
    };

    if (!currentUser) {
        return <Login onLogin={setCurrentUser} />;
    }

    return (
        <div className="flex flex-col h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden font-inter selection:bg-blue-500/30">
            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-20 shadow-lg shrink-0">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="text-red-600 w-6 h-6" />
                    <h1 className="font-bold text-xl tracking-tight hidden md:block">HAYATTA KAL \ {activeMission !== 'hepsi' ? activeMission.toUpperCase() + ' MODU' : 'SERBEST MOD'}</h1>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mission Progress Bar */}
                    {activeMission !== 'hepsi' && (
                        <div className="hidden lg:flex flex-col items-end mr-2">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Görev İlerlemesi</span>
                            <div className="flex gap-1 mt-1 max-w-[200px] flex-wrap justify-end">
                                {getMissionCities().map(key => (
                                    <div key={key} className={`w-2 h-2 rounded-full transition-all ${completedCityIds.includes(key) ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-800'}`}></div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 bg-slate-800 rounded-full px-4 py-1 border border-slate-700">
                        <span className="font-bold text-blue-400">{currentUser.name}</span>
                        <span className="text-slate-500">|</span>
                        <span className="font-mono text-yellow-500 font-bold">{currentUser.score || 0} Puan</span>
                    </div>

                    <button
                        onClick={() => setShowLeaderboard(!showLeaderboard)}
                        className={`p-2 rounded-full transition-colors ${showLeaderboard ? 'bg-yellow-500/20 text-yellow-500' : 'text-slate-400 hover:text-yellow-500'}`}
                        title="Puan Durumu"
                    >
                        <Trophy className="w-5 h-5" />
                    </button>

                    <Link to="/admin" className="p-2 text-slate-600 hover:text-slate-400 hover:bg-slate-800 rounded-full transition-colors" title="Yönetim Paneli">
                        <Settings className="w-5 h-5" />
                    </Link>

                    <button
                        onClick={() => setCurrentUser(null)}
                        className="p-2 text-red-500/70 hover:text-red-500 hover:bg-red-900/20 rounded-full transition-colors"
                        title="Çıkış Yap"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

                {/* Leaderboard Overlay */}
                {showLeaderboard && (
                    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                                <h3 className="font-bold text-xl text-yellow-500 flex items-center gap-2">
                                    <Trophy className="w-6 h-6" /> Sınıf Sıralaması
                                </h3>
                                <button onClick={() => setShowLeaderboard(false)} className="text-slate-400 hover:text-white font-bold text-xl">&times;</button>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold sticky top-0">
                                        <tr>
                                            <th className="p-4">#</th>
                                            <th className="p-4">Öğrenci</th>
                                            <th className="p-4 text-right">Puan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800 text-sm">
                                        {classLeaderboard.map((s, i) => (
                                            <tr key={s.id} className={s.id === currentUser.id ? "bg-blue-900/20 text-white" : "text-slate-300"}>
                                                <td className="p-4 font-bold text-slate-500">{i + 1}</td>
                                                <td className="p-4 font-medium">{s.name} {s.id === currentUser.id && "(Sen)"}</td>
                                                <td className="p-4 text-right font-mono text-yellow-500">{s.score}</td>
                                            </tr>
                                        ))}
                                        {classLeaderboard.length === 0 && (
                                            <tr><td colSpan="3" className="p-8 text-center text-slate-500">Veri yükleniyor...</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Left Panel: Map & Status */}
                <div className={clsx(
                    "transition-all duration-500 ease-in-out border-r border-slate-800 flex flex-col bg-slate-900 relative",
                    gameStatus === 'map' ? "flex-1" : "flex-[0.4] md:max-w-sm hidden md:flex"
                )}>
                    {gameStatus === 'map' ? (
                        <MapController onSelectCity={selectCity} activeMission={activeMission} />
                    ) : (
                        <div className="flex-1 flex items-center justify-center p-4">
                            <HumanBody riskLevel={riskLevel} />
                        </div>
                    )}

                    {gameStatus === 'map' && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur px-6 py-3 rounded-full border border-slate-700 shadow-2xl z-[1000] whitespace-nowrap text-center">
                            <p className="font-bold animate-pulse text-sm md:text-base mb-1">
                                {activeMission === 'hepsi' && "Bir şehir seç ve simülasyonu başlat"}
                                {activeMission === 'yangin' && "GÖREV: Orman yangını riski taşıyan bölgelere müdahale et!"}
                                {activeMission === 'deprem' && "GÖREV: Deprem riski olan bölgelerde tatbikat yap!"}
                                {activeMission === 'sel' && "GÖREV: Sel riski taşıyan bölgeleri kontrol et!"}
                                {activeMission === 'cig' && "GÖREV: Çığ tehlikesi olan bölgeleri incele!"}
                            </p>
                            {activeMission !== 'hepsi' && (
                                <p className="text-xs text-slate-400">
                                    Tamamlanan: {completedCityIds.length} / {getMissionCities().length}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Panel: Game / Intro */}
                {
                    gameStatus !== 'map' && (
                        <div className="flex-[1.5] flex flex-col bg-slate-950 relative animate-in slide-in-from-right duration-500">

                            {gameStatus === 'intro' ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8">
                                    <div className="w-32 h-32 relative">
                                        <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-20"></div>
                                        <div className="relative bg-gradient-to-br from-red-600 to-red-800 w-full h-full rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-900">
                                            <AlertTriangle className="w-16 h-16 text-white" />
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-4xl font-black mb-4">SİMÜLASYON HAZIR</h2>
                                        <p className="text-xl text-slate-400 max-w-lg mx-auto">
                                            {currentCity.name} için afet senaryosu yükleniyor.
                                        </p>
                                    </div>

                                    <button
                                        onClick={startGame}
                                        className="px-10 py-4 bg-white text-slate-900 rounded-xl font-black text-xl hover:scale-105 transition-transform flex items-center gap-3"
                                    >
                                        <Play className="fill-current w-6 h-6" /> BAŞLAT
                                    </button>

                                    <button onClick={restartGame} className="text-slate-500 hover:text-white underline">
                                        Farklı şehir seç
                                    </button>
                                </div>
                            ) : (
                                // Chat Interface
                                <div className="flex-1 flex flex-col h-full bg-slate-950">
                                    {/* Chat Messages */}
                                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                                        {chatHistory.map((msg, i) => (
                                            <div key={i} className={clsx("flex w-full animate-in slide-in-from-bottom-2", msg.type === 'user' ? "justify-end" : "justify-start")}>
                                                <div className={clsx("max-w-[85%] rounded-2xl p-5 text-lg shadow-lg leading-relaxed",
                                                    msg.type === 'user'
                                                        ? "bg-blue-600 text-white rounded-tr-none"
                                                        : msg.isWarning
                                                            ? "bg-red-900/20 text-red-200 border border-red-500/50 rounded-tl-none"
                                                            : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none"
                                                )}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Options */}
                                        {gameStatus === 'playing' && (
                                            <div className="mt-8 grid grid-cols-1 gap-3 pb-8">
                                                {currentScenario.steps[currentStepIndex].options.map((opt, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleOptionClick(opt)}
                                                        className="text-left p-5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-xl transition-all group flex items-start gap-4"
                                                    >
                                                        <span className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-blue-500 flex items-center justify-center font-bold text-slate-400 group-hover:text-white transition-colors shrink-0 mt-1">
                                                            {String.fromCharCode(65 + i)}
                                                        </span>
                                                        <span className="text-slate-300 group-hover:text-white text-lg">{opt.text}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {gameStatus === 'finished' && (
                                            <div className="text-center py-10 space-y-4">
                                                <p className="text-slate-400">Puanın güncellendi!</p>
                                                <button onClick={restartGame} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold flex items-center gap-2 mx-auto">
                                                    <RotateCcw className="w-5 h-5" /> Haritaya Dön
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }
            </div >
        </div >
    );
}

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Game />} />
                <Route path="/admin" element={<AdminPanel />} />
            </Routes>
        </Router>
    );
}

export default App;
