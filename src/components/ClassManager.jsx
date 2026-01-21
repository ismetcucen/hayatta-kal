import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Trash2, Users, UserPlus } from 'lucide-react';

export default function ClassManager() {
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newClassName, setNewClassName] = useState('');
    const [selectedClass, setSelectedClass] = useState(null);
    const [newStudentName, setNewStudentName] = useState('');

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchStudents(selectedClass.id);
        } else {
            setStudents([]);
        }
    }, [selectedClass]);

    const fetchClasses = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('classes').select('*').order('created_at', { ascending: true });
        if (error) console.error(error);
        else setClasses(data || []);
        setLoading(false);
    };

    const fetchStudents = async (classId) => {
        const { data, error } = await supabase.from('students').select('*').eq('class_id', classId).order('name');
        if (error) console.error(error);
        else setStudents(data || []);
    };

    const addClass = async () => {
        if (!newClassName.trim()) return;
        const { data, error } = await supabase.from('classes').insert([{ name: newClassName.trim() }]).select();
        if (error) {
            alert('Hata oluştu: ' + error.message);
        } else {
            setClasses([...classes, ...data]);
            setNewClassName('');
        }
    };

    const deleteClass = async (id) => {
        if (!window.confirm('Bu sınıfı ve içindeki TÜM ÖĞRENCİLERİ silmek istediğinize emin misiniz?')) return;
        const { error } = await supabase.from('classes').delete().eq('id', id);
        if (error) alert('Hata: ' + error.message);
        else {
            setClasses(classes.filter(c => c.id !== id));
            if (selectedClass?.id === id) setSelectedClass(null);
        }
    };

    const addStudent = async () => {
        if (!newStudentName.trim() || !selectedClass) return;
        const { data, error } = await supabase.from('students').insert([{
            name: newStudentName.trim(),
            class_id: selectedClass.id
        }]).select();

        if (error) {
            alert('Hata: ' + error.message);
        } else {
            setStudents([...students, ...data]);
            setNewStudentName('');
        }
    };

    const deleteStudent = async (id) => {
        if (!window.confirm('Öğrenciyi silmek istediğinize emin misiniz?')) return;
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) alert('Hata: ' + error.message);
        else {
            setStudents(students.filter(s => s.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Class List */}
                <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[600px]">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Users className="text-blue-500" /> Sınıflar
                    </h3>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Yeni Sınıf Adı..."
                            className="bg-slate-800 border border-slate-700 rounded px-3 py-2 flex-1 text-sm outline-none focus:border-blue-500"
                            value={newClassName}
                            onChange={(e) => setNewClassName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addClass()}
                        />
                        <button onClick={addClass} className="bg-blue-600 px-3 rounded hover:bg-blue-500">
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2">
                        {loading ? <p className="text-slate-500 text-center">Yükleniyor...</p> : classes.map(c => (
                            <div
                                key={c.id}
                                onClick={() => setSelectedClass(c)}
                                className={`p-3 rounded-lg flex justify-between items-center cursor-pointer transition-all ${selectedClass?.id === c.id ? 'bg-blue-900/50 border border-blue-500' : 'bg-slate-800 hover:bg-slate-700'}`}
                            >
                                <span className="font-medium">{c.name}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteClass(c.id); }}
                                    className="p-1 hover:text-red-500 text-slate-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {classes.length === 0 && !loading && <p className="text-slate-500 text-sm text-center mt-10">Henüz sınıf eklenmemiş.</p>}
                    </div>
                </div>

                {/* Student List */}
                <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-[600px]">
                    {selectedClass ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">
                                    {selectedClass.name} - Öğrenci Listesi
                                </h3>
                                <span className="text-sm bg-slate-800 px-3 py-1 rounded-full text-slate-400">
                                    {students.length} Öğrenci
                                </span>
                            </div>

                            <div className="flex gap-2 mb-6 max-w-md">
                                <input
                                    type="text"
                                    placeholder="Yeni Öğrenci Adı..."
                                    className="bg-slate-800 border border-slate-700 rounded px-3 py-2 flex-1 outline-none focus:border-blue-500"
                                    value={newStudentName}
                                    onChange={(e) => setNewStudentName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addStudent()}
                                />
                                <button onClick={addStudent} className="bg-green-600 hover:bg-green-500 px-4 rounded text-white flex items-center gap-2">
                                    <UserPlus className="w-4 h-4" /> Ekle
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="text-slate-500 text-sm border-b border-slate-800">
                                            <th className="p-3">Ad Soyad</th>
                                            <th className="p-3">Puan</th>
                                            <th className="p-3 text-right">İşlem</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800">
                                        {students.map(s => (
                                            <tr key={s.id} className="hover:bg-slate-800/50 group">
                                                <td className="p-3 font-medium">{s.name}</td>
                                                <td className="p-3 text-yellow-500 font-mono">{s.score}</td>
                                                <td className="p-3 text-right">
                                                    <button
                                                        onClick={() => deleteStudent(s.id)}
                                                        className="p-2 text-slate-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {students.length === 0 && (
                                            <tr>
                                                <td colSpan="3" className="p-8 text-center text-slate-500">
                                                    Bu sınıfta henüz öğrenci yok.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <Users className="w-16 h-16 mb-4 opacity-20" />
                            <p>Öğrencileri yönetmek için soldan bir sınıf seçiniz.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
