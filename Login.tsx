import React, { useState } from 'react';
import { CRMLead, Student } from '../types';
import { 
  getLeads, saveLeads, getStudents, saveStudents
} from '../mockData';
import { 
  User, Phone, Calendar, Smile, AlertCircle, 
  Plus, Check, Trash2, ArrowRight, MessageSquare, MessageCircle, RefreshCw
} from 'lucide-react';

interface CRMLeadsProps {
  students: Student[];
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onRefreshData?: () => void;
}

export default function CRMLeads({ students, onAddStudent, onRefreshData }: CRMLeadsProps) {
  const [leads, setLeads] = useState<CRMLead[]>(() => getLeads());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Form State
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [newLead, setNewLead] = useState({
    parentName: '',
    phone: '',
    whatsapp: '',
    childName: '',
    childAge: '',
    notes: '',
    status: 'Novo contato' as CRMLead['status']
  });

  // Selected lead for detail/history
  const [selectedLead, setSelectedLead] = useState<CRMLead | null>(null);
  const [newHistoryNote, setNewHistoryNote] = useState('');

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.parentName || !newLead.phone) return;

    const lead: CRMLead = {
      id: `lead-${Date.now()}`,
      parentName: newLead.parentName,
      phone: newLead.phone,
      whatsapp: newLead.whatsapp || newLead.phone,
      childName: newLead.childName,
      childAge: newLead.childAge ? `${newLead.childAge} anos` : 'Não informada',
      status: newLead.status,
      notes: newLead.notes,
      createdAt: new Date().toISOString().split('T')[0],
      history: [
        {
          date: new Date().toISOString().split('T')[0],
          note: `Lead criado com status inicial: ${newLead.status}. ${newLead.notes}`
        }
      ]
    };

    const updated = [lead, ...leads];
    setLeads(updated);
    saveLeads(updated);

    // Reset Form
    setIsAddingLead(false);
    setNewLead({
      parentName: '',
      phone: '',
      whatsapp: '',
      childName: '',
      childAge: '',
      notes: '',
      status: 'Novo contato'
    });
    if (onRefreshData) onRefreshData();
  };

  const handleUpdateStatus = (leadId: string, nextStatus: CRMLead['status']) => {
    const updated = leads.map(l => {
      if (l.id === leadId) {
        return {
          ...l,
          status: nextStatus,
          history: [
            ...l.history,
            {
              date: new Date().toISOString().split('T')[0],
              note: `Status alterado para: ${nextStatus}`
            }
          ]
        };
      }
      return l;
    });
    setLeads(updated);
    saveLeads(updated);
    
    // Synergize state if selected
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead(updated.find(x => x.id === leadId) || null);
    }
    if (onRefreshData) onRefreshData();
  };

  const handleAddHistoryNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newHistoryNote.trim()) return;

    const updated = leads.map(l => {
      if (l.id === selectedLead.id) {
        return {
          ...l,
          history: [
            ...l.history,
            {
              date: new Date().toISOString().split('T')[0],
              note: newHistoryNote
            }
          ]
        };
      }
      return l;
    });

    setLeads(updated);
    saveLeads(updated);
    setSelectedLead(updated.find(x => x.id === selectedLead.id) || null);
    setNewHistoryNote('');
  };

  const handleDeleteLead = (leadId: string) => {
    if (confirm('Tem certeza de que deseja excluir este interessado/lead?')) {
      const updated = leads.filter(l => l.id !== leadId);
      setLeads(updated);
      saveLeads(updated);
      if (selectedLead?.id === leadId) setSelectedLead(null);
      if (onRefreshData) onRefreshData();
    }
  };

  // Turn lead into an official student
  const handleEnrollLead = (lead: CRMLead) => {
    if (confirm(`Matricular ${lead.childName || 'a criança'} no sistema escolar dos Pequenos Bilíngues?`)) {
      // 1. Add to active Students list
      onAddStudent({
        name: lead.childName || lead.parentName + ' Filho',
        birthDate: lead.childAge ? `${2026 - parseInt(lead.childAge)}-01-01` : '2022-01-01', // proxy birth year
        parentName: lead.parentName,
        phone: lead.phone,
        whatsapp: lead.whatsapp,
        email: `${lead.parentName.toLowerCase().replace(/\s+/g, '')}@email.com`,
        address: 'Endereço residencial do lead (atualizar)',
        modality: 'Individual',
        frequency: 1,
        monthlyFee: 450,
        enrollmentDate: new Date().toISOString().split('T')[0],
        observations: `Admitido via CRM de Leads. Notas originais: ${lead.notes}`,
        status: 'Ativo',
        familyPin: Math.floor(1000 + Math.random() * 9000).toString() // Generate safe 4-digit PIN!
      });

      // 2. Clear out or tag lead status as converted (Matriculado)
      handleUpdateStatus(lead.id, 'Matriculado');
      alert('Aluno matriculado com absoluto sucesso! O sistema gerou um PIN de acesso único para a família.');
    }
  };

  const getStatusBadgeClass = (status: CRMLead['status']) => {
    switch (status) {
      case 'Novo contato': return 'bg-blue-100 text-blue-700';
      case 'Aula experimental agendada': return 'bg-amber-100 text-amber-700';
      case 'Proposta enviada': return 'bg-purple-100 text-purple-700';
      case 'Em negociação': return 'bg-orange-100 text-orange-700';
      case 'Matriculado': return 'bg-green-100 text-green-700 font-bold';
      case 'Não convertido': return 'bg-red-100 text-red-700';
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesStatus = filterStatus === 'all' || l.status === filterStatus;
    const matchesSearch = l.parentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (l.childName && l.childName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          l.phone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/60 p-6 rounded-3xl border border-[#2D3A4A]/5">
        <div>
          <h1 className="font-display font-black text-2xl text-marinho flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center text-coral">🚀</span>
            CRM de Leads e Interessados
          </h1>
          <p className="text-sm text-marinho/60 mt-1">Gerencie a funil de novos contatos, propostas enviadas e aulas experimentais agendadas.</p>
        </div>
        
        <button 
          onClick={() => setIsAddingLead(true)}
          className="bg-marinho text-white font-bold text-xs uppercase px-5 py-3 rounded-xl hover:bg-coral hover:text-marinho transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus size={16} /> Novo Contato / Lead
        </button>
      </div>

      {/* Adding Form Overlay Modal */}
      {isAddingLead && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full border-4 border-dashed border-coral/30">
            <h3 className="font-display font-bold text-lg text-marinho mb-4">Adicionar Novo Interessado</h3>
            <form onSubmit={handleCreateLead} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-marinho/60 mb-1">Nome do Responsável *</label>
                <input 
                  type="text" 
                  required
                  value={newLead.parentName}
                  onChange={e => setNewLead({...newLead, parentName: e.target.value})}
                  className="w-full bg-[#F7F1E6]/40 p-2.5 rounded-xl border border-marinho/10 text-sm"
                  placeholder="Ex: Pedro Alencar"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Telefone Fone</label>
                  <input 
                    type="text"
                    required
                    value={newLead.phone}
                    onChange={e => setNewLead({...newLead, phone: e.target.value})}
                    className="w-full bg-[#F7F1E6]/40 p-2.5 rounded-xl border border-marinho/10 text-sm"
                    placeholder="Ex: (11) 99876-1234"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">WhatsApp</label>
                  <input 
                    type="text"
                    value={newLead.whatsapp}
                    onChange={e => setNewLead({...newLead, whatsapp: e.target.value})}
                    className="w-full bg-[#F7F1E6]/40 p-2.5 rounded-xl border border-marinho/10 text-sm"
                    placeholder="Ex: 11998761234"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Nome do Filho(a)</label>
                  <input 
                    type="text"
                    value={newLead.childName}
                    onChange={e => setNewLead({...newLead, childName: e.target.value})}
                    className="w-full bg-[#F7F1E6]/40 p-2.5 rounded-xl border border-marinho/10 text-sm"
                    placeholder="Ex: Heitor"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Idade do Filho</label>
                  <input 
                    type="number"
                    value={newLead.childAge}
                    onChange={e => setNewLead({...newLead, childAge: e.target.value})}
                    className="w-full bg-[#F7F1E6]/40 p-2.5 rounded-xl border border-marinho/10 text-sm"
                    placeholder="Ex: 3"
                    min="1"
                    max="15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-marinho/60 mb-1">Observações iniciais</label>
                <textarea 
                  value={newLead.notes}
                  onChange={e => setNewLead({...newLead, notes: e.target.value})}
                  className="w-full bg-[#F7F1E6]/40 p-2.5 rounded-xl border border-marinho/10 text-sm h-20 resize-none"
                  placeholder="Encontrou pelo insta, busca aos sábados de manhã..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddingLead(false)}
                  className="w-1/2 border border-marinho/25 py-2.5 rounded-xl text-xs font-bold uppercase transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-marinho text-white py-2.5 rounded-xl text-xs font-bold uppercase hover:bg-coral hover:text-marinho transition"
                >
                  Criar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main CRM Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Funnel list & search */}
        <div className="lg:col-span-12 xl:col-span-7 bg-white p-6 rounded-[2.5rem] border border-[#2D3A4A]/5">
          
          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome do responsável, criança ou celular..."
                className="w-full bg-areia/40 p-2.5 rounded-xl text-xs font-medium border border-marinho/10 focus:border-coral outline-none"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-areia/40 p-2.5 rounded-xl text-xs font-bold border border-marinho/10 outline-none"
            >
              <option value="all">Filtro: Todos os Leads</option>
              <option value="Novo contato">Novo contato</option>
              <option value="Aula experimental agendada">Experimental agendada</option>
              <option value="Proposta enviada">Proposta enviada</option>
              <option value="Em negociação">Em negociação</option>
              <option value="Matriculado">Matriculados 🎓</option>
              <option value="Não convertido">Não convertidos ❌</option>
            </select>
          </div>

          {/* Leads Rows */}
          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-marinho/40">
              <AlertCircle size={32} className="mx-auto text-marinho/20 mb-2" />
              <p className="font-display font-medium text-sm">Nenhum interessado encontrado para os filtros ativos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLeads.map(lead => {
                const isSelected = selectedLead?.id === lead.id;
                return (
                  <div 
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-areia/50 border-marinho ring-2 ring-marinho/5' 
                        : 'bg-white border-marinho/5 hover:border-marinho/15 hover:bg-areia/10'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-marinho text-sm truncate">{lead.parentName}</p>
                          <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${getStatusBadgeClass(lead.status)}`}>
                            {lead.status}
                          </span>
                        </div>
                        <p className="text-xs text-marinho/60 font-medium mt-1">
                          Filho(a): <strong className="text-marinho">{lead.childName || 'N/A'}</strong> ({lead.childAge})
                        </p>
                        <p className="text-[10px] text-marinho/40 mt-1 font-semibold block">Criado em: {lead.createdAt.split('-')[2]}/{lead.createdAt.split('-')[1]}</p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <a 
                          href={`https://wa.me/${lead.whatsapp}?text=Ol%C3%A1%20${encodeURIComponent(lead.parentName)}%2C%20tudo%20bem%3F%20Aqui%20%C3%A9%20a%20Teacher%20Carla%20Cristina%20do%20Pequenos%20Bil%C3%ADngues!`}
                          target="_blank"
                          rel="noreferrer"
                          id={`zap_lead_${lead.id}`}
                          className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                          title="Enviar mensagem no WhatsApp"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MessageCircle size={15} />
                        </a>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLead(lead.id);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Remover"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Quick status cycle button */}
                    <div className="mt-3 pt-3 border-t border-marinho/5 flex gap-2 overflow-x-auto text-[10px] font-bold uppercase no-scrollbar">
                      {lead.status !== 'Matriculado' && (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(lead.id, 'Aula experimental agendada'); }}
                            className="bg-amber-50 text-amber-600 px-2 py-1 rounded-md border border-amber-200 hover:bg-amber-100 shrink-0"
                          >
                            Agendar Exp.
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(lead.id, 'Proposta enviada'); }}
                            className="bg-purple-50 text-purple-600 px-2 py-1 rounded-md border border-purple-200 hover:bg-purple-100 shrink-0"
                          >
                            Proposta
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleUpdateStatus(lead.id, 'Em negociação'); }}
                            className="bg-orange-50 text-orange-600 px-2 py-1 rounded-md border border-orange-200 hover:bg-orange-100 shrink-0"
                          >
                            Negóciar
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEnrollLead(lead); }}
                            className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 shrink-0 flex items-center gap-1"
                          >
                            MATRICULAR 🎓
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Lead detail, comments timeline & historical notes */}
        <div className="lg:col-span-12 xl:col-span-5">
          {selectedLead ? (
            <div className="bg-[#2D3A4A] text-white p-6 rounded-[2.5rem] space-y-6 shadow-xs border border-white/5">
              
              <div className="border-b border-white/10 pb-4">
                <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full ${getStatusBadgeClass(selectedLead.status)}`}>
                  {selectedLead.status}
                </span>
                <h3 className="font-display font-bold text-xl text-white mt-2 leading-tight">{selectedLead.parentName}</h3>
                <p className="text-xs text-white/60 mt-1 font-semibold">Interesse no aluno(a): <span className="text-white font-black">{selectedLead.childName || 'Não registrado'}</span> ({selectedLead.childAge})</p>
              </div>

              {/* Bio block */}
              <div className="bg-white/5 p-4 rounded-2xl text-xs space-y-2">
                <p className="text-white/50 uppercase font-black tracking-widest text-[9px]">Notas Originais do Lead</p>
                <p className="text-white/95 leading-relaxed italic">"{selectedLead.notes || 'Sem observações adicionais.'}"</p>
              </div>

              {/* CRM Conversion CTA */}
              {selectedLead.status !== 'Matriculado' && (
                <div className="p-4 bg-[#A8D5C2]/15 border border-[#A8D5C2]/30 rounded-2xl flex flex-col gap-3">
                  <div className="text-xs">
                    <span className="font-bold text-[#A8D5C2] block mb-1">Matricular Fechando Negócio</span>
                    <p className="text-white/75 leading-relaxed">Gera automaticamente o Pin de login e insere no banco de alunos ativos.</p>
                  </div>
                  <button 
                    onClick={() => handleEnrollLead(selectedLead)}
                    className="w-full bg-[#A8D5C2] text-marinho font-black text-xs uppercase p-3 rounded-xl hover:bg-white transition duration-200 flex items-center justify-center gap-1"
                  >
                    MATRICULAR NO SISTEMA <ArrowRight size={14} />
                  </button>
                </div>
              )}

              {/* History list */}
              <div className="space-y-4">
                <p className="text-white/50 uppercase font-bold tracking-widest text-[9px]">Histórico de Interações ({selectedLead.history.length})</p>
                
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {selectedLead.history.map((hist, index) => (
                    <div key={index} className="pl-3 border-l-2 border-white/20 text-xs">
                      <span className="block text-[10px] text-white/40 font-bold font-mono">{hist.date}</span>
                      <p className="text-white/80 mt-1">{hist.note}</p>
                    </div>
                  ))}
                </div>

                {/* Add annotation to lead */}
                <form onSubmit={handleAddHistoryNote} className="pt-2 flex gap-2">
                  <input 
                    type="text"
                    required
                    value={newHistoryNote}
                    onChange={e => setNewHistoryNote(e.target.value)}
                    placeholder="Registrar telefonema, email, visita..."
                    className="flex-1 bg-white/10 border border-white/10 px-3 py-2 rounded-xl text-xs outline-none focus:border-white text-white"
                  />
                  <button 
                    type="submit"
                    className="p-2.5 bg-white text-marinho font-bold rounded-xl transition cursor-pointer hover:bg-coral hover:text-marinho flex items-center justify-center shrink-0"
                    title="Registrar"
                  >
                    <Plus size={16} />
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 rounded-[2.5rem] border border-dashed border-[#2D3A4A]/10 text-center py-20 text-marinho/50">
              <Smile size={32} className="mx-auto text-marinho/25 mb-2" />
              <h4 className="font-display font-semibold text-sm">Selecione um lead da lista</h4>
              <p className="text-xs text-marinho/60 mt-1">Para visualizar o histórico detalhado, registrar anotações e realizar a matrícula do aluno.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
