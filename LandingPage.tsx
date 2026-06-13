/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Student, ClassSession, MonthlyPayment, FinancialRecord, StudentContract } from '../types';
import Dashboard from './Dashboard';
import StudentManager from './StudentManager';
import StudentProfile from './StudentProfile';
import Agenda from './Agenda';
import Financials from './Financials';
import Reports from './Reports';
import SecuritySettings from './SecuritySettings';

// New Advanced Modules imports
import CRMLeads from './CRMLeads';
import PedagogicalPlanner from './PedagogicalPlanner';

import { 
  Users, Calendar, DollarSign, BarChart, LogOut, 
  Menu, X, Sparkles, Smile, LayoutDashboard, Home, BookOpen, FileText, ArrowRight, Trash2, Plus, Download, Check, Lock
} from 'lucide-react';

interface AdminPanelProps {
  students: Student[];
  classes: ClassSession[];
  payments: MonthlyPayment[];
  financials: FinancialRecord[];
  contracts: StudentContract[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onAddClass: (classSession: Omit<ClassSession, 'id'>) => void;
  onEditClass: (updatedClass: ClassSession) => void;
  onDeleteClass: (classId: string) => void;
  onUpdatePaymentStatus: (paymentId: string, status: 'Pago' | 'Pendente' | 'Atrasado') => void;
  onAddTransaction: (record: Omit<FinancialRecord, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onAddContract: (studentId: string, fileName: string, fileSize: string) => void;
  onDeleteContract: (contractId: string) => void;
  onLogout: () => void;
}

export default function AdminPanel({
  students,
  classes,
  payments,
  financials,
  contracts,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onAddClass,
  onEditClass,
  onDeleteClass,
  onUpdatePaymentStatus,
  onAddTransaction,
  onDeleteTransaction,
  onAddContract,
  onDeleteContract,
  onLogout
}: AdminPanelProps) {
  
  // Active viewing sub-section
  const [activeSection, setActiveSection] = useState<string>('dashboard');
  
  // Dynamic administrator email loaded from localStorage
  const [adminEmail, setAdminEmail] = useState('admin@pequenosbilingues.com.br');

  useEffect(() => {
    const stored = localStorage.getItem('pb_user_credentials');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.email) {
          setAdminEmail(parsed.email);
        }
      } catch (err) {
        console.error('Falha ao ler pb_user_credentials no painel admin', err);
      }
    }
  }, [activeSection]);
  
  // Currently viewing student file
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Mobile sidebar controls
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Quick shortcuts trackers from dashboard clicks
  const [isOpenQuickStudentAdd, setIsOpenQuickStudentAdd] = useState(false);
  const [isOpenQuickClassAdd, setIsOpenQuickClassAdd] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'crm', label: 'CRM de Interessados', icon: <Sparkles size={18} /> },
    { id: 'alunos', label: 'Gestão de Alunos', icon: <Users size={18} /> },
    { id: 'agenda', label: 'Agenda & Aulas', icon: <Calendar size={18} /> },
    { id: 'financeiro', label: 'Financeiro', icon: <DollarSign size={18} /> },
    { id: 'contratos', label: 'Contratos', icon: <FileText size={18} /> },
    { id: 'pedagogico', label: 'Planeg. Pedagógico', icon: <BookOpen size={18} /> },
    { id: 'relatorios', label: 'Relatórios Pedagógicos', icon: <BarChart size={18} /> },
    { id: 'seguranca', label: 'Segurança & Senha', icon: <Lock size={18} /> },
  ];

  const handleNavigateSection = (sectionId: string) => {
    setActiveSection(sectionId);
    setSelectedStudent(null); // Clear student profile viewing
    setIsOpenQuickStudentAdd(false);
    setIsOpenQuickClassAdd(false);
    setIsMobileSidebarOpen(false); // Close mobile bar
  };

  const handleSelectStudentForView = (student: Student) => {
    setSelectedStudent(student);
    setActiveSection('alunos'); // Navigate to student files tab
    setIsMobileSidebarOpen(false);
  };

  const handleOpenQuickStudentAdd = () => {
    setActiveSection('alunos');
    setSelectedStudent(null);
    setIsOpenQuickStudentAdd(true);
  };

  const handleOpenQuickClassAdd = () => {
    setActiveSection('agenda');
    setIsOpenQuickClassAdd(true);
  };

  return (
    <div className="min-h-screen bg-areia flex text-marinho font-sans">
      
      {/* 1. SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-marinho text-areia p-6 border-r border-[#2D3A4A]/20 shrink-0">
        
        {/* Brand Banner */}
        <div className="space-y-1 mb-8">
          <span className="text-[10px] text-coral font-bold tracking-widest uppercase">Teacher Panel</span>
          <h2 className="font-display font-black text-xl text-white tracking-tight flex items-center gap-1.5">
            <Smile size={20} className="text-amarelo" /> Pequenos Bilíngues
          </h2>
        </div>

        {/* Regular Sidebar links */}
        <nav className="flex-1 space-y-2">
          {navigationItems.map((nav) => {
            const isActive = activeSection === nav.id && !selectedStudent;
            return (
              <button
                key={nav.id}
                onClick={() => handleNavigateSection(nav.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-marinho shadow-sm' 
                    : 'text-areia/65 hover:text-white hover:bg-white/5'
                }`}
              >
                {nav.icon}
                <span>{nav.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="pt-4 border-t border-white/10 space-y-3 shrink-0">
          <div className="flex items-center gap-2 bg-[#A8D5C2]/10 p-2.5 rounded-xl border border-[#A8D5C2]/25">
            <div className="w-8 h-8 rounded-full bg-menta text-marinho flex items-center justify-center font-bold text-xs uppercase font-display">
              TC
            </div>
            <div className="text-[10px] leading-tight">
              <span className="block font-bold text-white">Carla Cristina</span>
              <span className="block text-areia/50 font-semibold font-mono" title={adminEmail}>
                {adminEmail.length > 18 ? adminEmail.slice(0, 15) + '...' : adminEmail}
              </span>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-coral hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sair do Painel</span>
          </button>
        </div>

      </aside>

      {/* 2. MOBILE TOP-BAR NAVBAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-marinho text-white z-30 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-menta text-marinho flex items-center justify-center font-display font-bold">
            PB
          </div>
          <span className="font-display font-bold text-sm tracking-tight">Pequenos Bilíngues</span>
        </div>

        <button 
          onClick={() => setIsMobileSidebarOpen(prev => !prev)}
          className="p-2 text-white/80 hover:text-white cursor-pointer"
        >
          {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 3. MOBILE SLIDE-OUT DRAWER SIDEBAR */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40" onClick={() => setIsMobileSidebarOpen(false)}>
          <aside 
            className="w-64 bg-marinho text-areia h-full p-6 flex flex-col pt-20"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 space-y-2">
              {navigationItems.map((nav) => {
                const isActive = activeSection === nav.id && !selectedStudent;
                return (
                  <button
                    key={nav.id}
                    onClick={() => handleNavigateSection(nav.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-white text-marinho shadow-sm' 
                        : 'text-areia/65 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {nav.icon}
                    <span>{nav.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wide text-coral hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                <span>Sair do Painel</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 4. MAIN CENTRAL CONTENT BLOCK */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 pt-20 lg:pt-8 max-w-7xl mx-auto w-full">
        
        {/* Render Selected Student Profile Page if set */}
        {selectedStudent ? (
          <StudentProfile 
            student={selectedStudent}
            classes={classes}
            payments={payments}
            contracts={contracts}
            onBack={() => setSelectedStudent(null)}
            onAddClass={onAddClass}
            onUpdatePaymentStatus={onUpdatePaymentStatus}
            onAddContract={onAddContract}
            onDeleteContract={onDeleteContract}
          />
        ) : (
          /* Render Active Section Tab Router */
          <>
            {activeSection === 'dashboard' && (
              <Dashboard 
                students={students}
                classes={classes}
                payments={payments}
                financials={financials}
                onNavigateSection={handleNavigateSection}
                onSelectStudent={handleSelectStudentForView}
                onOpenQuickStudentAdd={handleOpenQuickStudentAdd}
                onOpenQuickClassAdd={handleOpenQuickClassAdd}
              />
            )}

            {activeSection === 'alunos' && (
              <StudentManager 
                students={students}
                onAddStudent={onAddStudent}
                onEditStudent={onEditStudent}
                onDeleteStudent={onDeleteStudent}
                onSelectStudent={handleSelectStudentForView}
                isOpenQuickAdd={isOpenQuickStudentAdd}
                onCloseQuickAdd={() => setIsOpenQuickStudentAdd(false)}
              />
            )}

            {activeSection === 'agenda' && (
              <Agenda 
                students={students}
                classes={classes}
                onAddClass={onAddClass}
                onEditClass={onEditClass}
                onDeleteClass={onDeleteClass}
                isOpenQuickAdd={isOpenQuickClassAdd}
                onCloseQuickAdd={() => setIsOpenQuickClassAdd(false)}
              />
            )}

            {activeSection === 'financeiro' && (
              <Financials 
                students={students}
                financials={financials}
                payments={payments}
                onAddTransaction={onAddTransaction}
                onDeleteTransaction={onDeleteTransaction}
                onUpdatePaymentStatus={onUpdatePaymentStatus}
              />
            )}

            {activeSection === 'relatorios' && (
              <Reports 
                students={students}
                classes={classes}
                payments={payments}
                financials={financials}
                onAddClass={onAddClass}
                onEditClass={onEditClass}
              />
            )}

            {activeSection === 'crm' && (
              <CRMLeads 
                students={students}
                onAddStudent={onAddStudent}
              />
            )}

            {activeSection === 'pedagogico' && (
              <PedagogicalPlanner />
            )}

            {activeSection === 'contratos' && (
              <div className="space-y-6 animate-fade-in text-marinho">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h1 className="font-display font-black text-3xl text-marinho flex items-center gap-2">
                      <FileText className="text-coral" /> Gestão de Contratos
                    </h1>
                    <p className="text-sm text-marinho/60 mt-0.5">Arquivamento durável, acompanhamento de assinaturas e minutas pedagógicas.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left: Upload / Simulação de emissão */}
                  <div className="bg-white p-6 rounded-scrapbook border-2 border-dashed border-red-100 space-y-4">
                    <h3 className="font-display font-bold text-lg text-marinho flex items-center gap-2">
                      <Plus size={18} className="text-coral" /> Emitir Novo Contrato
                    </h3>
                    <p className="text-xs text-marinho/60 leading-relaxed">
                      Selecione uma das crianças registradas para gerar uma simulação com a minuta padrão dos Pequenos Bilíngues.
                    </p>

                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-marinho/60 uppercase mb-1">Para qual aluno?</label>
                        <select 
                          id="contract-student-selector"
                          className="w-full bg-areia/45 border border-marinho/15 p-2.5 rounded-xl text-xs outline-none focus:border-coral font-medium"
                        >
                          <option value="">-- Selecione o Aluno --</option>
                          {students.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.modality})</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          const selector = document.getElementById('contract-student-selector') as HTMLSelectElement;
                          const studentId = selector?.value;
                          if (!studentId) {
                            alert('Por favor, selecione um aluno na lista.');
                            return;
                          }
                          const studentName = students.find(s => s.id === studentId)?.name || '';
                          const formattedName = studentName.toLowerCase().replace(/\s+/g, '_');
                          const fileName = `contrato_anual_pequenos_bilingues_${formattedName}.pdf`;
                          
                          // Check if active contract already exists for this child
                          if (contracts.some(c => c.studentId === studentId)) {
                            if (!window.confirm('Já existe uma minuta anexada para esta criança. Deseja registrar outra mesmo assim?')) {
                              return;
                            }
                          }

                          onAddContract(studentId, fileName, '1.1 MB');
                          alert('Contrato simulado de adesão pedagógica foi gerado e anexado com absoluto sucesso!');
                          if (selector) selector.value = '';
                        }}
                        className="w-full py-2.5 bg-marinho hover:bg-marinho/90 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition cursor-pointer"
                      >
                        Gerar & Anexar Contrato PDF ✨
                      </button>
                    </div>

                    <div className="p-3 bg-amarelo/10 border border-amarelo/30 rounded-xl text-[10px] text-marinho/70 flex items-start gap-2">
                      <Sparkles size={14} className="shrink-0 text-amber-600 mt-0.5" />
                      <span>Todos os termos baseados no estilo scrapbook premium estão em conformidade com as diretrizes lúdicas autônomas.</span>
                    </div>
                  </div>

                  {/* Right: Lista completa de termos vigentes */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-scrapbook border-2 border-areia-dark/15 space-y-4">
                    <h3 className="font-display font-bold text-lg text-marinho flex items-center gap-2">
                      <FileText size={18} className="text-azulCeu" /> Minutas Registradas na Base ({contracts.length})
                    </h3>

                    {contracts.length === 0 ? (
                      <div className="text-center py-12 bg-areia/15 rounded-2xl border-2 border-dashed border-marinho/5">
                        <Smile size={32} className="text-marinho/35 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-marinho/60">Nenhum contrato ativo cadastrado para os alunos da escola.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-marinho/5">
                        {contracts.map(cnt => {
                          const studentInfo = students.find(s => s.id === cnt.studentId);
                          return (
                            <div key={cnt.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div className="space-y-1">
                                <span className="text-[10px] font-bold text-marinho/55 capitalize bg-areia px-2 py-0.5 rounded-full inline-block">
                                  {studentInfo ? studentInfo.name : 'Ex-aluno desvinculado'}
                                </span>
                                <h4 className="font-mono text-xs text-marinho font-bold flex items-center gap-1">
                                  📄 {cnt.fileName}
                                </h4>
                                <span className="block text-[10px] text-marinho/40 font-semibold uppercase font-mono">
                                  Anexado em: {cnt.uploadedAt} • Tamanho: {cnt.fileSize}
                                </span>
                              </div>

                              <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                                <span className={`px-2.5 py-0.5 rounded-full font-display font-bold text-[10px] uppercase ${
                                  cnt.status === 'Assinado' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {cnt.status === 'Assinado' ? '✍️ Assinado' : '⏳ Pendente'}
                                </span>

                                <button 
                                  onClick={() => alert(`Simulando visualização segura e download imediato do arquivo eletrônico: ${cnt.fileName}`)}
                                  className="p-1.5 border border-marinho/10 rounded-lg hover:bg-areia/40 text-marinho/60 hover:text-marinho cursor-pointer"
                                  title="Baixar Minuta"
                                >
                                  <Download size={14} />
                                </button>

                                <button 
                                  onClick={() => {
                                    if (window.confirm(`Tem absoluta certeza que deseja desvincular e excluir permanentemente este contrato?`)) {
                                      onDeleteContract(cnt.id);
                                    }
                                  }}
                                  className="p-1.5 border border-red-200 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
                                  title="Excluir Contrato"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'seguranca' && (
              <SecuritySettings />
            )}
          </>
        )}

      </main>

    </div>
  );
}
