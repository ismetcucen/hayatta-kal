import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HumanBody from './components/HumanBody';
import MapController from './components/MapController';
import AdminPanel from './components/AdminPanel';
import { scenarios } from './data/scenarios';
import { supabase } from './supabaseClient';
import { Play, RotateCcw, AlertTriangle, Map as MapIcon, Info, Settings } from 'lucide-react';
import clsx from 'clsx';
import { cityStats } from './data/cityData';

function Game() {
    const [currentCity, setCurrentCity] = useState(null);
    const [currentScenario, setCurrentScenario] = useState(null);
    const [gameScenarios, setGameScenarios] = useState(scenarios);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [riskLevel, setRiskLevel] = useState(0);
    const [chatHistory, setChatHistory] = useState([]);
    const [gameStatus, setGameStatus] = useState('map'); // map, playing, finished

    useEffect(() => {
        const fetchScenarios = async () => {
            const { data, error } = await supabase.from('scenarios').select('*');
            if (error) {
                console.error('Error fetching scenarios:', error);
            } else if (data && data.length > 0) {
                setGameScenarios(data);
            }
        };
        fetchScenarios();
    }, []);

    const selectCity = (city) => {
        setCurrentCity(city);
        // Find matching scenario or default to earthquake
        const scenario = gameScenarios.find(s => s.id === city.dangerType) || gameScenarios[0];
        setCurrentScenario(scenario);
        setGameStatus('intro');
    };

    const startGame = () => {
        setCurrentStepIndex(0);
        setRiskLevel(0);
        setGameStatus('playing');

        let warningText = "";
        switch (currentCity.dangerType) {
            case 'sel':
                warningText = `UYARI: ${currentCity.name} bölgesinde sel felaketi başladı!`;
                break;
            case 'cig':
                warningText = `UYARI: ${currentCity.name} dağlık bölgesinde çığ düştü!`;
                break;
            default:
                warningText = `UYARI: ${currentCity.name} bölgesinde şiddetli sarsıntı tespit edildi!`;
        }

        setChatHistory([
            { type: 'bot', text: warningText },
            { type: 'bot', text: currentScenario.intro },
            { type: 'bot', text: currentScenario.steps[0].question }
        ]);
    };

    const restartGame = () => {
        setGameStatus('map');
        setCurrentCity(null);
        setChatHistory([]);
        setRiskLevel(0);
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
            } else {
                if (currentStepIndex < currentScenario.steps.length - 1) {
                    const nextStep = currentScenario.steps[currentStepIndex + 1];
                    setCurrentStepIndex(prev => prev + 1);
                    setTimeout(() => {
                        setChatHistory(prev => [...prev, { type: 'bot', text: nextStep.question }]);
                    }, 1000);
                } else {
                    setChatHistory(prev => [...prev, { type: 'bot', text: "🏆 TEBRİKLER! Bu felaketten sağ kurtuldun." }]);
                    setGameStatus('finished');
                }
            }
        }, 600);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col h-screen font-sans text-slate-100 overflow-hidden">

            {/* Header */}
            <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center z-20 shadow-lg shrink-0">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="text-red-600 w-6 h-6" />
                    <h1 className="font-bold text-xl tracking-tight">HAYATTA KAL <span className="text-slate-500 font-normal text-sm">| Afet Simülasyonu</span></h1>
                </div>

                <div className="flex items-center gap-4">
                    {currentCity && (
                        <div className="bg-slate-800 px-3 py-1 rounded-full text-sm font-bold border border-slate-700 flex items-center gap-2">
                            <MapIcon className="w-4 h-4 text-blue-500" />
                            {currentCity.name}
                        </div>
                    )}
                    <Link to="/admin" className="p-2 text-slate-600 hover:text-slate-400 hover:bg-slate-800 rounded-full transition-colors" title="Yönetim Paneli">
                        <Settings className="w-5 h-5" />
                    </Link>
                </div>
            </header>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

                {/* Left Panel: Map & Stats (Always visible but shrinks when playing) */}
                <div className={clsx(
                    "transition-all duration-500 ease-in-out border-r border-slate-800 flex flex-col bg-slate-900 relative",
                    gameStatus === 'map' ? "flex-1" : "flex-[0.4] md:max-w-sm hidden md:flex"
                )}>
                    {gameStatus === 'map' ? (
                        <MapController onSelectCity={selectCity} />
                    ) : (
                        // Stats View when Playing
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                                <h2 className="text-2xl font-black mb-4 text-white">{currentCity.name}</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between border-b border-slate-700 pb-2">
                                        <span className="text-slate-400">Nüfus</span>
                                        <span className="font-bold">{currentCity.population}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-700 pb-2">
                                        <span className="text-slate-400">Risk Seviyesi</span>
                                        <span className="font-bold text-red-500">{currentCity.risk}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block mb-1">Geçmiş Afetler</span>
                                        <p className="text-sm text-slate-300 italic">{currentCity.history}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-900/50">
                                <h3 className="flex items-center gap-2 font-bold text-blue-400 mb-2">
                                    <Info className="w-4 h-4" /> Biliyor muydun?
                                </h3>
                                <ul className="list-disc list-inside text-sm text-blue-200 space-y-1">
                                    {currentCity.facts.map((fact, i) => <li key={i}>{fact}</li>)}
                                </ul>
                            </div>

                            <HumanBody riskLevel={riskLevel} />
                        </div>
                    )}

                    {/* Instructions overlay on Map Mode */}
                    {gameStatus === 'map' && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur px-6 py-3 rounded-full border border-slate-700 shadow-2xl z-[1000]">
                            <p className="font-bold animate-pulse">Bir şehir seç ve simülasyonu başlat</p>
                        </div>
                    )}
                </div>

                {/* Right Panel: Game / Intro (Only visible when city selected) */}
                {gameStatus !== 'map' && (
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
                                        Doğru kararlar vererek hayatta kalmalısın.
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
                                                msg.type === 'user' ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none"
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
                                        <div className="text-center py-10">
                                            <button onClick={restartGame} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold flex items-center gap-2 mx-auto">
                                                <RotateCcw className="w-5 h-5" /> Haritaya Dön
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
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
