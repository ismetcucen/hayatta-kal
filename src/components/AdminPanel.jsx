import React, { useState } from 'react';
import { scenarios as localScenarios } from '../data/scenarios';
import { Save, Trash2, Plus, ArrowLeft, BookOpen, Users, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import ClassManager from './ClassManager';
import GameSettings from './GameSettings';

function AdminPanel() {
    // Supabase integration
    const [gameScenarios, setGameScenarios] = useState([]);
    const [selectedScenarioId, setSelectedScenarioId] = useState(null);
    const [activeTab, setActiveTab] = useState('questions'); // 'questions' or 'settings' within a scenario
    const [activeSection, setActiveSection] = useState('scenarios'); // 'scenarios' or 'classes' or 'settings'
    const [loading, setLoading] = useState(true);

    // Fetch data on mount
    React.useEffect(() => {
        fetchScenarios();
    }, []);

    const fetchScenarios = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('scenarios').select('*');
        if (error) {
            console.error('Error fetching scenarios:', error);
            // alert('Veri çekilemedi!'); 
        } else {
            console.log('Fetched Data:', data);

            if (!data || data.length === 0) {
                setGameScenarios(localScenarios);
            } else {
                setGameScenarios(data);
            }

            if (data && data.length > 0) setSelectedScenarioId(data[0].id);
            else if (localScenarios.length > 0) setSelectedScenarioId(localScenarios[0].id);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        const scenario = gameScenarios.find(s => s.id === selectedScenarioId);
        if (!scenario) return;

        const { error } = await supabase
            .from('scenarios')
            .upsert(scenario, { onConflict: 'id' });

        if (error) {
            alert('Hata: ' + error.message);
        } else {
            alert('Başarıyla kaydedildi!');
        }
    };

    const updateScenarioField = (field, value) => {
        setGameScenarios(prev => prev.map(s =>
            s.id === selectedScenarioId ? { ...s, [field]: value } : s
        ));
    };

    const updateStep = (idx, field, value) => {
        setGameScenarios(prev => prev.map(s => {
            if (s.id !== selectedScenarioId) return s;
            const newSteps = [...s.steps];
            newSteps[idx] = { ...newSteps[idx], [field]: value };
            return { ...s, steps: newSteps };
        }));
    };

    const updateOption = (stepIdx, optIdx, field, value) => {
        setGameScenarios(prev => prev.map(s => {
            if (s.id !== selectedScenarioId) return s;
            const newSteps = [...s.steps];
            const newOptions = [...newSteps[stepIdx].options];
            newOptions[optIdx] = { ...newOptions[optIdx], [field]: value };
            newSteps[stepIdx] = { ...newSteps[stepIdx], options: newOptions };
            return { ...s, steps: newSteps };
        }));
    };

    const addScenario = () => {
        const id = prompt("Yeni Senaryo ID (örn: yangin):");
        if (!id) return;
        if (gameScenarios.find(s => s.id === id)) {
            alert("Bu ID zaten kullanılıyor!");
            return;
        }
        const newScenario = {
            id,
            title: "Yeni Senaryo",
            intro: "Giriş metni...",
            steps: [{
                id: 1,
                question: "İlk soru?",
                options: [
                    { text: "Seçenek A", riskChanges: 0, feedback: "Geri bildirim A" },
                    { text: "Seçenek B", riskChanges: 10, feedback: "Geri bildirim B" }
                ]
            }]
        };
        setGameScenarios([...gameScenarios, newScenario]);
        setSelectedScenarioId(id);
    };

    const addQuestion = () => {
        setGameScenarios(prev => prev.map(s => {
            if (s.id !== selectedScenarioId) return s;
            const newStep = {
                id: s.steps.length + 1,
                question: "Yeni Soru...",
                options: [
                    { text: "Seçenek 1", riskChanges: 0, feedback: "Feedback..." },
                    { text: "Seçenek 2", riskChanges: 0, feedback: "Feedback..." }
                ]
            };
            return { ...s, steps: [...s.steps, newStep] };
        }));
    };

    const deleteQuestion = (idx) => {
        if (!confirm("Soruyu silmek istediğinize emin misiniz?")) return;
        setGameScenarios(prev => prev.map(s => {
            if (s.id !== selectedScenarioId) return s;
            const newSteps = s.steps.filter((_, i) => i !== idx);
            return { ...s, steps: newSteps };
        }));
    };

    const currentScenario = gameScenarios.find(s => s.id === selectedScenarioId);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center sticky top-0 z-50 shadow-lg">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-xl">Yönetim Paneli</h1>
                </div>

                <div className="flex bg-slate-800 rounded-lg p-1">
                    <button
                        onClick={() => setActiveSection('scenarios')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeSection === 'scenarios' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        <BookOpen className="w-4 h-4" /> Senaryolar
                    </button>
                    <button
                        onClick={() => setActiveSection('classes')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeSection === 'classes' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Users className="w-4 h-4" /> Sınıf Yönetimi
                    </button>
                    <button
                        onClick={() => setActiveSection('settings')}
                        className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${activeSection === 'settings' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Settings className="w-4 h-4" /> Oyun Ayarları
                    </button>
                </div>
            </div>

            <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
                {activeSection === 'classes' ? (
                    <ClassManager />
                ) : activeSection === 'settings' ? (
                    <GameSettings />
                ) : (
                    /* Existing Scenario Editor Content */
                    <div className="grid grid-cols-12 gap-6 h-full">
                        {/* Sidebar - Scenario List */}
                        <div className="col-span-3 bg-slate-900 rounded-xl border border-slate-800 p-4 h-fit sticky top-24">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-slate-400 text-sm uppercase tracking-wider">Senaryolar</h2>
                                <button onClick={addScenario} className="p-1 hover:bg-slate-800 rounded text-blue-500"><Plus className="w-4 h-4" /></button>
                            </div>
                            <div className="space-y-2">
                                {gameScenarios.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedScenarioId(s.id)}
                                        className={`w-full text-left p-3 rounded-lg font-medium transition-all ${selectedScenarioId === s.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50' : 'hover:bg-slate-800 text-slate-300'}`}
                                    >
                                        {s.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Main Content - Editor */}
                        <div className="col-span-9 space-y-6 pb-20">
                            {loading && <p>Yükleniyor...</p>}
                            {!loading && currentScenario && (
                                <>
                                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-full mr-4">
                                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Senaryo Başlığı</label>
                                                <input
                                                    value={currentScenario.title}
                                                    onChange={(e) => updateScenarioField('title', e.target.value)}
                                                    className="bg-transparent text-2xl font-black w-full border-b border-transparent hover:border-slate-700 focus:border-blue-500 outline-none pb-1 transition-colors"
                                                />
                                            </div>
                                            <button
                                                onClick={handleSave}
                                                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg hover:shadow-green-500/20 transition-all shrink-0"
                                            >
                                                <Save className="w-4 h-4" /> Değişiklikleri Kaydet
                                            </button>
                                        </div>

                                        <div className="mb-4">
                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Giriş Metni</label>
                                            <textarea
                                                value={currentScenario.intro}
                                                onChange={(e) => updateScenarioField('intro', e.target.value)}
                                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-3 text-slate-300 min-h-[100px] outline-none focus:border-blue-500"
                                            />
                                        </div>

                                        {/* Tabs */}
                                        <div className="flex border-b border-slate-800 mb-6">
                                            <button
                                                onClick={() => setActiveTab('questions')}
                                                className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'questions' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                            >
                                                Sorular ({currentScenario.steps.length})
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('settings')}
                                                className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'settings' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                            >
                                                Ayarlar
                                            </button>
                                        </div>

                                        {/* Questions Editor */}
                                        {activeTab === 'questions' && (
                                            <div className="space-y-8">
                                                {currentScenario.steps.map((step, idx) => (
                                                    <div key={idx} className="bg-slate-950/50 border border-slate-800 rounded-xl p-6 relative group">
                                                        <span className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-400">
                                                            {idx + 1}
                                                        </span>

                                                        <div className="flex justify-end absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => deleteQuestion(idx)} className="text-slate-600 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                                        </div>

                                                        <div className="mb-6">
                                                            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Soru Metni</label>
                                                            <input
                                                                value={step.question}
                                                                onChange={(e) => updateStep(idx, 'question', e.target.value)}
                                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 outline-none focus:border-blue-500 font-medium"
                                                            />
                                                        </div>

                                                        <div className="space-y-4 pl-4 border-l-2 border-slate-800">
                                                            <label className="text-xs font-bold text-slate-500 uppercase block">Seçenekler</label>
                                                            {step.options.map((opt, optIdx) => (
                                                                <div key={optIdx} className="grid grid-cols-12 gap-4 items-start">
                                                                    <div className="col-span-1 pt-3 text-center font-bold text-slate-600">{String.fromCharCode(65 + optIdx)}</div>
                                                                    <div className="col-span-5">
                                                                        <input
                                                                            value={opt.text}
                                                                            onChange={(e) => updateOption(idx, optIdx, 'text', e.target.value)}
                                                                            placeholder="Seçenek yazısı"
                                                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                                                        />
                                                                    </div>
                                                                    <div className="col-span-2">
                                                                        <input
                                                                            type="number"
                                                                            value={opt.riskChanges}
                                                                            onChange={(e) => updateOption(idx, optIdx, 'riskChanges', parseInt(e.target.value))}
                                                                            placeholder="Risk Etkisi (0-100)"
                                                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                                                        />
                                                                    </div>
                                                                    <div className="col-span-4">
                                                                        <input
                                                                            value={opt.feedback}
                                                                            onChange={(e) => updateOption(idx, optIdx, 'feedback', e.target.value)}
                                                                            placeholder="Geri bildirim mesajı"
                                                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm focus:border-blue-500 outline-none"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}

                                                <button onClick={addQuestion} className="w-full py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 font-bold hover:border-slate-600 hover:text-slate-300 transition-all flex items-center justify-center gap-2">
                                                    <Plus className="w-5 h-5" /> Soru Ekle
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminPanel;
