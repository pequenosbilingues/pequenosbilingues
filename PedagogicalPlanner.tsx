/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, ClassSession } from '../types';
import { 
  Calendar, Clock, Plus, AlertTriangle, ArrowLeft, ArrowRight,
  User, Check, X, Tag, Trash2, Edit2, CalendarDays
} from 'lucide-react';

interface AgendaProps {
  students: Student[];
  classes: ClassSession[];
  onAddClass: (classSession: Omit<ClassSession, 'id'>) => void;
  onEditClass: (updatedClass: ClassSession) => void;
  onDeleteClass: (classId: string) => void;
  isOpenQuickAdd: boolean;
  onCloseQuickAdd: () => void;
}

export default function Agenda({
  students,
  classes,
  onAddClass,
  onEditClass,
  onDeleteClass,
  isOpenQuickAdd,
  onCloseQuickAdd
}: AgendaProps) {
  
  // View states
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-06-08')); // Consistent mock local time

  // Add/Edit schedule Modal States
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ClassSession | null>(null);

  const [formData, setFormData] = useState({
    studentId: '',
    date: '2026-06-08',
    time: '14:00',
    theme: '',
    vocabulary: '',
    notes: '',
    status: 'Agendada' as const,
    participation: 'Boa' as const,
    professor: 'Teacher Carla'
  });

  // Calculate conflicts representatively in real-time
  const getConflicts = (dateStr: string, timeStr: string, excludeId?: string) => {
    return classes.filter(
      c => c.date === dateStr && 
           c.time === timeStr && 
           c.id !== excludeId && 
           c.status !== 'Cancelada'
    );
  };

  const handleOpenScheduleModal = (initialDateStr?: string, initialTimeStr?: string) => {
    setEditingSession(null);
    setFormData({
      studentId: students.length > 0 ? students[0].id : '',
      date: initialDateStr || currentDate.toISOString().split('T')[0],
      time: initialTimeStr || '14:00',
      theme: '',
      vocabulary: '',
      notes: '',
      status: 'Agendada',
      participation: 'Boa',
      professor: 'Teacher Carla'
    });
    setIsScheduleModalOpen(true);
  };

  const handleOpenEditModal = (session: ClassSession) => {
    setEditingSession(session);
    setFormData({
      studentId: session.studentId,
      date: session.date,
      time: session.time,
      theme: session.theme,
      vocabulary: session.vocabulary,
      notes: session.notes,
      status: session.status,
      participation: session.participation,
      professor: session.professor
    });
    setIsScheduleModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.date || !formData.time) return;

    const student = students.find(s => s.id === formData.studentId);
    const sessionPayload = {
      studentId: formData.studentId,
      studentName: student ? student.name : 'Aluno desconhecido',
      date: formData.date,
      time: formData.time,
      theme: formData.theme,
      vocabulary: formData.vocabulary,
      notes: formData.notes,
      status: formData.status,
      participation: formData.participation,
      professor: formData.professor
    };

    if (editingSession) {
      onEditClass({
        ...editingSession,
        ...sessionPayload
      });
    } else {
      onAddClass(sessionPayload);
    }

    setIsScheduleModalOpen(false);
    onCloseQuickAdd();
  };

  const handleDeleteSession = (id: string) => {
    if (confirm("Tem certeza de que deseja excluir este agendamento de aula permanentemente da agenda?")) {
      onDeleteClass(id);
      setIsScheduleModalOpen(false);
    }
  };

  // Navigating dates
  const handlePrevDate = () => {
    const newD = new Date(currentDate);
    if (viewType === 'day') {
      newD.setDate(newD.getDate() - 1);
    } else if (viewType === 'week') {
      newD.setDate(newD.getDate() - 7);
    } else {
      newD.setMonth(newD.getMonth() - 1);
    }
    setCurrentDate(newD);
  };

  const handleNextDate = () => {
    const newD = new Date(currentDate);
    if (viewType === 'day') {
      newD.setDate(newD.getDate() + 1);
    } else if (viewType === 'week') {
      newD.setDate(newD.getDate() + 7);
    } else {
      newD.setMonth(newD.getMonth() + 1);
    }
    setCurrentDate(newD);
  };

  // Get start of week (Sunday or Monday)
  const getStartOfWeek = (d: Date) => {
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  // Safe check triggers for quick add shortcuts from other frames
  React.useEffect(() => {
    if (isOpenQuickAdd) {
      handleOpenScheduleModal();
    }
  }, [isOpenQuickAdd]);

  // Weeks list creation for Month view representation (June 2026)
  const getDaysInMonth = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const weekStart = getStartOfWeek(new Date(currentDate));
  const weekDays = Array.from({ length: 6 }).map((_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return day;
  }); // Mon to Sat

  const activeConflicts = getConflicts(formData.date, formData.time, editingSession?.id);

  return (
    <div className="space-y-6 animate-fade-in text-marinho">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-marinho flex items-center gap-2">
            <CalendarDays className="text-lilas" /> Planejamento de Aulas & Agenda
          </h1>
          <p className="text-sm text-marinho/60 mt-0.5">Gerenciador adaptado para visualizar compromissos pedagógicos e detectar choques.</p>
        </div>

        <button 
          onClick={() => handleOpenScheduleModal()}
          className="bg-[#CDB4DB] hover:bg-[#CDB4DB]/90 text-marinho font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-xs transition-transform focus:scale-98 cursor-pointer"
        >
          <Plus size={18} /> Agendar Aula
        </button>
      </div>

      {/* Navigation and View Select tabs */}
      <div className="bg-white p-4 rounded-scrapbook shadow-xs border-2 border-areia-dark/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Navigation arrows */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrevDate}
            className="p-2 border border-marinho/10 rounded-xl hover:bg-areia cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          
          <span className="font-display font-bold text-base text-marinho">
            {viewType === 'day' && currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {viewType === 'week' && `Semana de ${weekDays[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} até ${weekDays[5].toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`}
            {viewType === 'month' && currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </span>

          <button 
            onClick={handleNextDate}
            className="p-2 border border-marinho/10 rounded-xl hover:bg-areia cursor-pointer"
          >
            <ArrowRight size={16} />
          </button>
        </div>

        {/* View Select */}
        <div className="flex bg-areia/50 p-1 rounded-xl">
          {(['month', 'week', 'day'] as const).map((vt) => (
            <button
              key={vt}
              onClick={() => setViewType(vt)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase cursor-pointer ${
                viewType === vt 
                  ? 'bg-white text-marinho shadow-xs' 
                  : 'text-marinho/50 hover:text-marinho'
              }`}
            >
              {vt === 'month' ? 'Mês' : vt === 'week' ? 'Semana' : 'Dia'}
            </button>
          ))}
        </div>

      </div>

      {/* AGENDA WORKSPACE */}
      
      {/* 1. WEEK VIEW */}
      {viewType === 'week' && (
        <div className="bg-white rounded-scrapbook shadow-sm border border-areia overflow-hidden">
          <div className="grid grid-cols-6 border-b border-areia-dark/10 bg-[#ebd9cc]/20">
            {weekDays.map((day, i) => {
              const isToday = day.toISOString().split('T')[0] === '2026-06-08';
              return (
                <div key={i} className={`p-4 text-center border-r border-areia last:border-0 ${isToday ? 'bg-coral/10' : ''}`}>
                  <span className="block text-xs font-bold text-marinho/55 uppercase">{day.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                  <span className={`inline-block mt-1 font-display font-bold text-lg rounded-full w-8 h-8 flex items-center justify-center mx-auto ${
                    isToday ? 'bg-coral text-white' : 'text-marinho'
                  }`}>
                    {day.getDate()}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-6 divide-x divide-areia min-h-[400px]">
            {weekDays.map((day, dIdx) => {
              const dayStr = day.toISOString().split('T')[0];
              const dayClasses = classes.filter(c => c.date === dayStr && c.status !== 'Cancelada');

              return (
                <div key={dIdx} className="p-3 space-y-3 bg-white hover:bg-areia/10 transition-colors">
                  {dayClasses.length === 0 ? (
                    <div className="text-[10px] text-marinho/30 text-center mt-12 italic font-medium">Livre</div>
                  ) : (
                    dayClasses.map((item) => {
                      const overlaps = classes.filter(
                        c => c.date === item.date && c.time === item.time && c.id !== item.id && c.status !== 'Cancelada'
                      );
                      
                      return (
                        <div 
                          key={item.id}
                          onClick={() => handleOpenEditModal(item)}
                          className={`p-3 rounded-2xl border transition-all text-left cursor-pointer hover:shadow-xs group ${
                            overlaps.length > 0 
                              ? 'bg-red-50 border-red-200 hover:bg-red-100/50' 
                              : item.status === 'Reposição'
                                ? 'bg-coral/10 border-coral hover:bg-coral/15'
                                : 'bg-areia/40 border-areia-dark/15 hover:bg-areia/70'
                          }`}
                        >
                          <div className="flex items-center gap-1 text-[10px] font-bold text-marinho/50">
                            <Clock size={10} />
                            <span>{item.time}</span>
                          </div>

                          <p className="font-bold text-xs text-marinho mt-1.5 truncate group-hover:text-coral">{item.studentName}</p>
                          <span className="block text-[9px] text-marinho/65 font-semibold truncate mt-0.5">Tema: {item.theme}</span>

                          {overlaps.length > 0 && (
                            <div className="flex items-center gap-1 text-[8px] font-bold text-red-600 uppercase mt-2">
                              <AlertTriangle size={8} /> Confliito de horário!
                            </div>
                          )}

                          {item.status === 'Reposição' && overlaps.length === 0 && (
                            <span className="inline-block mt-2 text-[8px] font-black uppercase text-coral">Reposição</span>
                          )}
                        </div>
                      );
                    })
                  )}
                  
                  {/* Plus hover trigger card */}
                  <button 
                    onClick={() => handleOpenScheduleModal(dayStr)}
                    className="w-full py-2 rounded-xl border border-dashed border-marinho/5 hover:border-coral text-marinho/35 hover:text-coral transition-colors text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. DAY VIEW */}
      {viewType === 'day' && (
        <div className="bg-white p-6 rounded-scrapbook shadow-xs border-2 border-areia space-y-4">
          <h3 className="font-display font-bold text-lg text-marinho">Aulas para hoje</h3>
          
          {(() => {
            const dayStr = currentDate.toISOString().split('T')[0];
            const dayClasses = classes.filter(c => c.date === dayStr && c.status !== 'Cancelada');
            
            if (dayClasses.length === 0) {
              return (
                <div className="p-12 text-center text-marinho/50 space-y-2 border border-dashed border-marinho/10 rounded-xl">
                  <p className="text-sm">Nenhum agendamento pedagógico para este dia!</p>
                  <button 
                    onClick={() => handleOpenScheduleModal(dayStr)}
                    className="text-xs font-bold text-coral hover:underline"
                  >
                    Clique aqui para adicionar +
                  </button>
                </div>
              );
            }

            return (
              <div className="divide-y divide-areia">
                {dayClasses.map((item) => {
                  const hasConflict = classes.some(
                    c => c.date === item.date && c.time === item.time && c.id !== item.id && c.status !== 'Cancelada'
                  );
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => handleOpenEditModal(item)}
                      className="flex items-center justify-between py-4 cursor-pointer hover:bg-areia/10 px-3 rounded-xl transition"
                    >
                      <div className="flex items-center gap-4">
                        <div className="px-3 py-2 bg-lilas/20 text-marinho font-mono font-bold text-sm rounded-xl">
                          {item.time}
                        </div>
                        <div>
                          <p className="font-bold text-marinho">{item.studentName}</p>
                          <div className="flex items-center gap-2 text-xs text-marinho/60 mt-0.5">
                            <span>Tema: <strong>{item.theme}</strong></span>
                            <span>| Vocabulário: <em>{item.vocabulary}</em></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {hasConflict && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold">
                            <AlertTriangle size={12} /> Choque de horário!
                          </span>
                        )}
                        <span className="text-xs bg-areia text-marinho px-2.5 py-1 rounded-md border border-marinho/5">
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* 3. MONTH VIEW */}
      {viewType === 'month' && (
        <div className="bg-white p-6 rounded-scrapbook shadow-xs border border-areia space-y-6">
          <div className="grid grid-cols-7 gap-2 bg-areia/30 p-2 rounded-xl text-center text-xs font-bold text-marinho/60">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <span key={d}>{d}</span>)}
          </div>
          
          <div className="grid grid-cols-7 gap-2 font-display">
            {/* Displaying representation of dates for June 2026 */}
            {getDaysInMonth(currentDate).map((day, i) => {
              const dayStr = day.toISOString().split('T')[0];
              const dayClassesCount = classes.filter(c => c.date === dayStr && c.status !== 'Cancelada').length;
              const isToday = dayStr === '2026-06-08';

              return (
                <div 
                  key={i} 
                  onClick={() => {
                    setViewType('day');
                    setCurrentDate(day);
                  }}
                  className={`p-3 rounded-2xl text-center border cursor-pointer hover:border-coral transition flex flex-col items-center justify-between min-h-[60px] ${
                    isToday ? 'bg-coral/15 border-coral font-bold' : 'border-areia bg-white hover:bg-areia/20'
                  }`}
                >
                  <span className="text-xs font-bold">{day.getDate()}</span>
                  
                  {dayClassesCount > 0 && (
                    <span className="inline-block w-4 h-4 rounded-full bg-lilas text-[9px] font-bold text-marinho flex items-center justify-center mt-1">
                      {dayClassesCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FULL AGENDAMENTO / AULAS CREATION MODEL */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-scrapbook shadow-2xl border-4 border-dashed border-[#CDB4DB] max-w-md w-full p-6 relative">
            
            <button 
              onClick={() => {
                setIsScheduleModalOpen(false);
                onCloseQuickAdd();
              }}
              className="absolute top-4 right-4 text-marinho/60 hover:text-marinho font-bold text-xl px-2 hover:bg-areia rounded-full cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-1 mb-6">
              <h3 className="font-display font-black text-2xl text-marinho">
                {editingSession ? '✏️ Editar Registro de Aula' : '✨ Agendar Aula Lúdica'}
              </h3>
              <p className="text-xs text-marinho/60">Controle de horários pedagógicos na agenda da professora</p>
            </div>

            {/* Clash warnings alerts (show scheduling conflicts) */}
            {activeConflicts.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-marinho p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2.5 mb-4 shadow-sm animate-pulse">
                <AlertTriangle size={18} className="shrink-0 mt-0.5 text-red-600" />
                <div className="space-y-0.5">
                  <p className="text-red-700 uppercase font-black tracking-wider text-[10px]">Alerta Choque de Horários!</p>
                  <span>Atenção: Já existe aula agendada de <strong>{activeConflicts[0].studentName}</strong> neste mesmo horário e data!</span>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
              
              <div>
                <label className="block text-xs font-bold text-marinho/60 mb-1">Selecionar Aluno</label>
                <select
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleInputChange}
                  className="w-full bg-areia/45 border border-marinho/10 p-2.5 rounded-xl uppercase text-xs font-semibold outline-none focus:border-coral"
                >
                  <option value="" disabled>Escolha um estudante...</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>{st.name} ({st.modality})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Data da Aula</label>
                  <input 
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full bg-areia/45 border border-marinho/10 p-2.5 rounded-xl text-xs font-semibold outline-none focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Horário</label>
                  <input 
                    type="time"
                    name="time"
                    required
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full bg-areia/45 border border-marinho/10 p-2.5 rounded-xl text-xs font-semibold outline-none focus:border-coral"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-marinho/60 mb-1">Tema Proposto (Tema ou Projeto)</label>
                <input 
                  type="text"
                  name="theme"
                  required
                  placeholder="Ex: Farm Animals, Counting, Circle time"
                  value={formData.theme}
                  onChange={handleInputChange}
                  className="w-full bg-areia/45 border border-marinho/10 p-2.5 rounded-xl text-xs outline-none focus:border-coral"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-marinho/60 mb-1">Vocabulário / Materiais</label>
                <input 
                  type="text"
                  name="vocabulary"
                  placeholder="Ex: Flashcards, toys, music, numbers..."
                  value={formData.vocabulary}
                  onChange={handleInputChange}
                  className="w-full bg-areia/45 border border-marinho/10 p-2.5 rounded-xl text-xs outline-none focus:border-coral"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Status da Aula</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-areia/45 border border-marinho/10 p-2.5 rounded-xl text-xs outline-none focus:border-coral"
                  >
                    <option value="Agendada">Agendada</option>
                    <option value="Reposição">Reposição (Replacement)</option>
                    <option value="Concluída">Concluída</option>
                    <option value="Cancelada">Cancelada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Ministrante / Professor</label>
                  <input 
                    type="text"
                    name="professor"
                    required
                    value={formData.professor}
                    onChange={handleInputChange}
                    className="w-full bg-areia/45 border border-marinho/10 p-2.5 rounded-xl text-xs outline-none focus:border-coral"
                  />
                </div>
              </div>

              {editingSession && (
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Diário de Observação Pedagógica</label>
                  <textarea 
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Escreva como foi a aula lúdica..."
                    className="w-full bg-areia/45 border border-marinho/10 p-2.5 rounded-xl text-xs outline-none focus:border-coral h-20 resize-none"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-4">
                {editingSession && (
                  <button 
                    type="button"
                    onClick={() => handleDeleteSession(editingSession.id)}
                    className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition"
                    title="Excluir Aula"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                
                <button 
                  type="button"
                  onClick={() => {
                    setIsScheduleModalOpen(false);
                    onCloseQuickAdd();
                  }}
                  className="flex-1 border border-marinho/10 text-marinho font-bold py-3 rounded-xl hover:bg-areia cursor-pointer"
                >
                  Cancelar
                </button>
                
                <button 
                  type="submit"
                  className="flex-1 bg-marinho text-white font-bold py-3 rounded-xl hover:bg-marinho/90 shadow-xs cursor-pointer"
                >
                  {editingSession ? 'Salvar Alterações' : 'Salvar Compromisso'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
