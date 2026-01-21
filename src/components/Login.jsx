import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { School, User, LogIn } from 'lucide-react';

export default function Login({ onLogin }) {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchStudents(selectedClassId);
            setSelectedStudentId('');
        } else {
            setStudents([]);
        }
    }, [selectedClassId]);

    const fetchClasses = async () => {
        const { data, error } = await supabase.from('classes').select('*').order('name');
        if (data) setClasses(data);
    };

    const fetchStudents = async (classId) => {
        const { data, error } = await supabase.from('students').select('*').eq('class_id', classId).order('name');
        if (data) setStudents(data);
    };

    const handleLogin = () => {
        const student = students.find(s => s.id === selectedStudentId);
        if (student) {
            onLogin(student);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-slate-700">
                        <School className="w-10 h-10 text-blue-500" />
                    </div>
                    <h1 className="text-3xl font-black text-white">Hayatta Kal</h1>
                    <p className="text-slate-400">Sınıfını ve ismini seçerek oyuna katıl.</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300 ml-1">Sınıfın</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        >
                            <option value="">Sınıf Seçiniz</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300 ml-1">İsmin</label>
                        <select
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            disabled={!selectedClassId}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                        >
                            <option value="">İsim Seçiniz</option>
                            {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={!selectedStudentId}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg mt-4"
                    >
                        <LogIn className="w-5 h-5" /> OYUNA BAŞLA
                    </button>
                </div>
            </div>
        </div>
    );
}
