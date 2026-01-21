import React, { useState } from 'react';
import { scenarios } from '../data/scenarios';
import { Save, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function AdminPanel() {
    // Supabase integration
    const [gameScenarios, setGameScenarios] = useState([]);
    const [selectedScenarioId, setSelectedScenarioId] = useState(null);
    const [activeTab, setActiveTab] = useState('questions');
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
            alert('Veri çekilemedi!');
        } else {
            console.log('Fetched Data:', data); // Debugging

            // Eğer veritabanı boşsa (ilk kurulum), varsayılan senaryoları yükle
            if (data.length === 0) {
                // İlk yükleme mantığı buraya eklenebilir veya kullanıcıya bilgi verilebilir
                setGameScenarios(scenarios); // Fallback to local file for now so UI isn't empty
                alert("Veritabanı boş görünüyor. SQL kodunu çalıştırdınız mı?");
            } else {
                setGameScenarios(data);
            }

            if (data && data.length > 0) setSelectedScenarioId(data[0].id);
        }
        setLoading(false);
    };

    // Helper to get current scenario object
    const currentScenario = gameScenarios.find(s => s.id === selectedScenarioId);

    const handleSave = async () => {
        if (!currentScenario) return;

        const { error } = await supabase
            .from('scenarios')
            .upsert({
                id: currentScenario.id,
                title: currentScenario.title,
                intro: currentScenario.intro,
                steps: currentScenario.steps
            });

        if (error) {
            alert("Hata oluştu: " + error.message);
        } else {
            alert("Başarıyla kaydedildi! ✅");
        }
    };

    const addScenario = async () => {
        const id = prompt("Yeni senaryo için benzersiz bir ID girin (örn: yangin):");
        if (!id) return;

        // Check if ID exists
        if (gameScenarios.find(s => s.id === id)) {
            alert("Bu ID zaten kullanılıyor!");
            return;
        }

        const newScenario = {
            id: id.toLowerCase().replace(/\s+/g, '-'),
            title: "Yeni Senaryo",
            intro: "Senaryo açıklamasını buraya yazın...",
            steps: [
                {
                    id: 1,
                    question: "İlk soru buraya...",
                    options: [
                        { text: "Seçenek A", riskChanges: 0, feedback: "Geri bildirim..." },
                        { text: "Seçenek B", riskChanges: 50, feedback: "Geri bildirim..." },
                        { text: "Seçenek C", riskChanges: 100, feedback: "Geri bildirim..." },
                        { text: "Seçenek D", riskChanges: 20, feedback: "Geri bildirim..." }
                    ]
                }
            ]
        };

        const { error } = await supabase.from('scenarios').insert(newScenario);

        if (error) {
            alert("Ekleme hatası: " + error.message);
        } else {
            setGameScenarios(prev => [...prev, newScenario]);
            setSelectedScenarioId(newScenario.id);
            alert("Yeni senaryo eklendi!");
        }
    };

    const addQuestion = () => {
        if (!currentScenario) return;

        const newQuestion = {
            id: currentScenario.steps.length + 1,
            question: "Yeni Soru...",
            options: [
                { text: "Seçenek A", riskChanges: 0, feedback: "..." },
                { text: "Seçenek B", riskChanges: 0, feedback: "..." },
                { text: "Seçenek C", riskChanges: 0, feedback: "..." },
                { text: "Seçenek D", riskChanges: 0, feedback: "..." }
            ]
        };

        const updatedSteps = [...currentScenario.steps, newQuestion];
        updateScenarioField('steps', updatedSteps);

        // Auto-scroll to bottom logic could be added here
    };

    const deleteQuestion = (index) => {
        const updatedSteps = currentScenario.steps.filter((_, i) => i !== index);
        updateScenarioField('steps', updatedSteps);
    };

    // Update local state when typing
    const updateScenarioField = (field, value) => {
        setGameScenarios(prev => prev.map(s =>
            s.id === selectedScenarioId ? { ...s, [field]: value } : s
        ));
    };


    const updateStep = (stepIndex, field, value) => {
        setGameScenarios(prev => prev.map(s => {
            if (s.id !== selectedScenarioId) return s;
            const newSteps = [...s.steps];
            newSteps[stepIndex] = { ...newSteps[stepIndex], [field]: value };
            return { ...s, steps: newSteps };
        }));
    };


    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h1 className="font-black text-xl tracking-tight text-blue-500">YÖNETİM PANELİ</h1>
                    <p className="text-xs text-slate-500 mt-1">Hayatta Kal - v1.0</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('questions')}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === 'questions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        Senaryolar & Sorular
                    </button>
                    {/* Placeholder links */}
                    <button className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors font-medium opacity-50 cursor-not-allowed">
                        İstatistikler (Yakında)
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 transition-colors font-medium opacity-50 cursor-not-allowed">
                        Ayarlar
                    </button>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Oyuna Dön
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/50 backdrop-blur">
                    <h2 className="font-bold text-lg">İçerik Yönetimi</h2>
                    <button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                    >
                        <Save className="w-4 h-4" /> Değişiklikleri Kaydet
                    </button>
                </header>

                <div className="flex-1 overflow-hidden flex">
                    {/* Scenario List Column */}
                    <div className="w-72 border-r border-slate-800 overflow-y-auto p-4 bg-slate-900/50">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-400 text-sm uppercase">Senaryolar</h3>
                            <button onClick={addScenario} className="p-1 hover:bg-slate-700 rounded text-blue-500 hover:text-blue-400" title="Yeni Senaryo Ekle"><Plus className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-2">
                            {gameScenarios.map(sc => (
                                <div
                                    key={sc.id}
                                    onClick={() => setSelectedScenarioId(sc.id)}
                                    className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedScenarioId === sc.id ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-slate-800 border-transparent hover:border-slate-600'}`}
                                >
                                    <div className="font-bold">{sc.title}</div>
                                    <div className="text-xs text-slate-500 mt-1">{sc.steps.length} Soru</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Editor Content */}
                    <div className="flex-1 overflow-y-auto p-8">
                        {currentScenario ? (
                            <div className="max-w-3xl mx-auto space-y-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400">Senaryo Başlığı</label>
                                    <input
                                        type="text"
                                        value={currentScenario.title}
                                        onChange={(e) => updateScenarioField('title', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-xl font-bold focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400">Giriş Hikayesi</label>
                                    <textarea
                                        value={currentScenario.intro}
                                        onChange={(e) => updateScenarioField('intro', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 min-h-[100px] focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div className="border-t border-slate-800 pt-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-black">Sorular ({currentScenario.steps.length})</h3>
                                        <button onClick={addQuestion} className="text-blue-500 hover:text-blue-400 font-bold text-sm bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-500/30 hover:bg-blue-900/40 transition-colors">+ Soru Ekle</button>
                                    </div>

                                    <div className="space-y-6">
                                        {currentScenario.steps.map((step, idx) => (
                                            <div key={idx} className="bg-slate-900 rounded-2xl p-6 border border-slate-800 relative group">
                                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => deleteQuestion(idx)} className="text-red-500 hover:bg-slate-800 p-2 rounded" title="Soruyu Sil"><Trash2 className="w-4 h-4" /></button>
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Soru {idx + 1}</label>
                                                    <input
                                                        type="text"
                                                        value={step.question}
                                                        onChange={(e) => updateStep(idx, 'question', e.target.value)}
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 font-medium"
                                                    />
                                                </div>

                                                <div className="space-y-3 pl-4 border-l-2 border-slate-800">
                                                    {step.options.map((opt, optIdx) => (
                                                        <div key={optIdx} className="flex gap-4 items-start">
                                                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-slate-500 shrink-0">
                                                                {String.fromCharCode(65 + optIdx)}
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={opt.text}
                                                                    onChange={(e) => {
                                                                        const newOptions = [...step.options];
                                                                        newOptions[optIdx] = { ...opt, text: e.target.value };
                                                                        updateStep(idx, 'options', newOptions);
                                                                    }}
                                                                    className="w-full bg-slate-950/50 border border-slate-700 rounded p-2 text-sm"
                                                                    placeholder="Cevap metni"
                                                                />
                                                                <input
                                                                    type="text"
                                                                    value={opt.feedback}
                                                                    onChange={(e) => {
                                                                        const newOptions = [...step.options];
                                                                        newOptions[optIdx] = { ...opt, feedback: e.target.value };
                                                                        updateStep(idx, 'options', newOptions);
                                                                    }}
                                                                    className="w-full bg-slate-950/50 border border-slate-700 rounded p-2 text-xs text-yellow-500/80"
                                                                    placeholder="Geri bildirim mesajı"
                                                                />
                                                            </div>
                                                            <div className="w-20 pt-2 text-center">
                                                                <div className="text-[10px] text-slate-500 uppercase mb-1">Risk %</div>
                                                                <input
                                                                    type="number"
                                                                    value={opt.riskChanges}
                                                                    onChange={(e) => {
                                                                        const newOptions = [...step.options];
                                                                        newOptions[optIdx] = { ...opt, riskChanges: parseInt(e.target.value) || 0 };
                                                                        updateStep(idx, 'options', newOptions);
                                                                    }}
                                                                    className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-center text-sm"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}

                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                Bir senaryo seçin
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminPanel;
