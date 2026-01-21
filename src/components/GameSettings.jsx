import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Save, AlertTriangle, Flame, Droplets, Snowflake, Globe } from 'lucide-react';

export default function GameSettings() {
    const [activeMission, setActiveMission] = useState('hepsi');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        setLoading(true);
        // We will store settings in a 'game_settings' table. 
        // Row with id 'global_config' will hold the active mission.
        const { data, error } = await supabase.from('game_settings').select('active_mission').eq('id', 'global_config').single();
        if (data) {
            setActiveMission(data.active_mission || 'hepsi');
        } else {
            // If doesn't exist, create it default
            await supabase.from('game_settings').insert([{ id: 'global_config', active_mission: 'hepsi' }]);
        }
        setLoading(false);
    };

    const saveSettings = async (mission) => {
        setLoading(true);
        setActiveMission(mission);
        const { error } = await supabase.from('game_settings').upsert({ id: 'global_config', active_mission: mission });
        if (error) alert('Hata: ' + error.message);
        setLoading(false);
    };

    const missions = [
        { id: 'hepsi', label: 'Tüm Afetler (Serbest Mod)', icon: Globe, color: 'text-blue-400', desc: 'Öğrenciler tüm haritayı ve afet türlerini görebilir.' },
        { id: 'deprem', label: 'Deprem Tatbikatı', icon: AlertTriangle, color: 'text-red-500', desc: 'Sadece deprem riski taşıyan şehirler aktif olur.' },
        { id: 'yangin', label: 'Yangın Müdahalesi', icon: Flame, color: 'text-orange-500', desc: 'Sadece orman yangını riski olan güney şeridi aktif olur.' },
        { id: 'sel', label: 'Sel Operasyonu', icon: Droplets, color: 'text-sky-500', desc: 'Sadece sel/taşkın riski olan Karadeniz bölgesi aktif olur.' },
        { id: 'cig', label: 'Çığ Nöbeti', icon: Snowflake, color: 'text-cyan-200', desc: 'Sadece çığ riski olan dağlık doğu illeri aktif olur.' },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
                <h2 className="text-2xl font-black mb-2 flex items-center gap-3">
                    <Globe className="w-8 h-8 text-blue-500" /> Aktif Görev Modu
                </h2>
                <p className="text-slate-400 mb-8">
                    Sınıfın hangi afet türüne odaklanacağını seçin. Seçtiğinizde öğrencilerin haritasında sadece ilgili şehirler aktif olacaktır.
                </p>

                <div className="grid grid-cols-1 gap-4">
                    {missions.map(m => {
                        const Icon = m.icon;
                        const isSelected = activeMission === m.id;
                        return (
                            <button
                                key={m.id}
                                onClick={() => saveSettings(m.id)}
                                className={`flex items-start gap-4 p-6 rounded-xl border-2 transition-all text-left group ${isSelected
                                    ? 'bg-blue-900/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                    : 'bg-slate-950 border-slate-800 hover:border-slate-600 hover:bg-slate-900'}`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-900 ' + m.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold mb-1 ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                        {m.label}
                                    </h3>
                                    <p className="text-slate-500 text-sm">
                                        {m.desc}
                                    </p>
                                </div>
                                {isSelected && (
                                    <div className="ml-auto self-center bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                                        AKTİF
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
