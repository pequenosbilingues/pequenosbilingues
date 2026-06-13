import React, { useState } from 'react';
import { LessonPlan } from '../types';
import { getPlans, savePlans } from '../mockData';
import { 
  BookOpen, Sparkles, Plus, Copy, Trash2, 
  Map, Scroll, Award, Search, Check, AlertCircle, FileText
} from 'lucide-react';

interface PedagogicalPlannerProps {
  onApplyPlanToClass?: (plan: LessonPlan) => void;
}

export default function PedagogicalPlanner({ onApplyPlanToClass }: PedagogicalPlannerProps) {
  const [plans, setPlans] = useState<LessonPlan[]>(() => getPlans());
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingPlan, setIsAddingPlan] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    theme: '',
    objective: '',
    vocabulary: '',
    song: '',
    story: '',
    activity: '',
    materialsNeeded: ''
  });

  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.theme) return;

    const newPlan: LessonPlan = {
      id: `plan-${Date.now()}`,
      theme: formData.theme,
      objective: formData.objective || 'N/A',
      vocabulary: formData.vocabulary || 'N/A',
      song: formData.song || 'Sem música específica',
      story: formData.story || 'Sem leitura de livros',
      activity: formData.activity || 'Sem brincadeira cadastrada',
      materialsNeeded: formData.materialsNeeded || 'Sem materiais extraordinários',
      isTemplate: true
    };

    const updated = [newPlan, ...plans];
    setPlans(updated);
    savePlans(updated);

    // Reset
    setIsAddingPlan(false);
    setFormData({
      theme: '',
      objective: '',
      vocabulary: '',
      song: '',
      story: '',
      activity: '',
      materialsNeeded: ''
    });
  };

  const handleDuplicatePlan = (plan: LessonPlan) => {
    const duplicated: LessonPlan = {
      ...plan,
      id: `plan-${Date.now()}`,
      theme: `${plan.theme} (Cópia)`
    };

    const updated = [duplicated, ...plans];
    setPlans(updated);
    savePlans(updated);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Deseja realmente remover este plano de aula permanente?')) {
      const updated = plans.filter(p => p.id !== planId);
      setPlans(updated);
      savePlans(updated);
    }
  };

  const handleQuickApply = (plan: LessonPlan) => {
    if (onApplyPlanToClass) {
      onApplyPlanToClass(plan);
      setAppliedNotification(plan.theme);
      setTimeout(() => setAppliedNotification(null), 3500);
    } else {
      alert(`Plano "${plan.theme}" selecionado e copiado para a Área de Transferência como referência para a próxima aula! 📚`);
    }
  };

  const filteredPlans = plans.filter(p => 
    p.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vocabulary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.activity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Upper header summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#CDB4DB]/20 p-6 rounded-3xl border border-[#2D3A4A]/5">
        <div>
          <h1 className="font-display font-black text-2xl text-marinho flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-lilas/20 flex items-center justify-center text-marinho">🧸</span>
            Planejamento Pedagógico
          </h1>
          <p className="text-sm text-marinho/60 mt-1">Biblioteca didática. Cadastre temas, canções lúdicas e materiais úteis de uso repetitivo.</p>
        </div>

        <button 
          onClick={() => setIsAddingPlan(true)}
          className="bg-marinho text-white font-bold text-xs uppercase px-5 py-3 rounded-xl hover:bg-coral hover:text-marinho transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus size={16} /> Cadastrar Plano
        </button>
      </div>

      {/* Applied notice */}
      {appliedNotification && (
        <div className="bg-emerald-50 border border-emerald-400 text-emerald-800 p-4 rounded-xl flex items-center gap-2 text-xs">
          <Check size={16} />
          <span>Plano de lição <strong>"{appliedNotification}"</strong> configurado com sucesso para a aula ativa!</span>
        </div>
      )}

      {/* Grid overlay modal for plan creation */}
      {isAddingPlan && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border-4 border-dashed border-[#CDB4DB]">
            <h3 className="font-display font-bold text-xl text-marinho mb-4">Novo Planejamento Pedagógico</h3>
            <form onSubmit={handleCreatePlan} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Tema Lúdico *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.theme}
                    onChange={e => setFormData({...formData, theme: e.target.value})}
                    placeholder="Ex: Farm Animals / Deep Sea Adventure"
                    className="w-full bg-[#F7F1E6]/40 p-2.5 rounded-xl border border-marinho/10 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Objetivos Pedagógicos</label>
                  <input 
                    type="text" 
                    value={formData.objective}
                    onChange={e => setFormData({...formData, objective: e.target.value})}
                    placeholder="Ex: Identificar vocabulário através da mímica..."
                    className="w-full bg-[#F7F1E6]/40 p-2.5 rounded-xl border border-marinho/10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-marinho/60 mb-1">Vocabulário Central (Target Words)</label>
                <input 
                  type="text" 
                  value={formData.vocabulary}
                  onChange={e => setFormData({...formData, vocabulary: e.target.value})}
                  placeholder="Ex: Fish, Octopus, Crab, Sea, Blue"
                  className="w-full bg-[#F7F1E6]/40 p-2.5 rounded-xl border border-marinho/10 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-normal">
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Cantar / Música Lúdica</label>
                  <input 
                    type="text" 
                    value={formData.song}
                    onChange={e => setFormData({...formData, song: e.target.value})}
                    placeholder="Ex: Baby Shark dance version"
                    className="w-full bg-[#F7F1E6]/40 p-2.5 rounded-xl border border-marinho/10 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Contar Histórias / Livro de Apoio</label>
                  <input 
                    type="text" 
                    value={formData.story}
                    onChange={e => setFormData({...formData, story: e.target.value})}
                    placeholder="Ex: Spot Goes to school"
                    className="w-full bg-[#F7F1E6]/40 p-2.5 rounded-xl border border-marinho/10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-marinho/60 mb-1">Brincadeiras e Atividades (Play-Based Learning)</label>
                <textarea 
                  value={formData.activity}
                  onChange={e => setFormData({...formData, activity: e.target.value})}
                  placeholder="Ex: Esconde-esconde no tapete de EVA. Encontrando os brinquedos temáticos do oceano..."
                  className="w-full bg-[#F7F1E6]/40 p-2.5 rounded-xl border border-marinho/10 text-sm h-16 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-marinho/60 mb-1">Material Necessário para a Aula lúdica</label>
                <input 
                  type="text" 
                  value={formData.materialsNeeded}
                  onChange={e => setFormData({...formData, materialsNeeded: e.target.value})}
                  placeholder="Ex: Massinha roxa, canetas, tigelas de brinquedo"
                  className="w-full bg-[#F7F1E6]/40 p-2.5 rounded-xl border border-marinho/10 text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsAddingPlan(false)}
                  className="w-1/2 border border-marinho/25 py-2.5 rounded-xl text-xs font-bold uppercase"
                >
                  Voltar
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-marinho text-white py-2.5 rounded-xl text-xs font-bold uppercase hover:bg-coral hover:text-marinho transition"
                >
                  Guardar Modelo de Aula
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-3 flex items-center text-marinho/30">
          <Search size={16} />
        </div>
        <input 
          type="text" 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Pesquisar por tema, palavras de vocabulário ou brincadeira..."
          className="w-full bg-white p-3 pl-10 rounded-2xl text-xs font-medium border border-[#2D3A4A]/5 focus:border-coral outline-none text-marinho"
        />
      </div>

      {/* Plans List Grid */}
      {filteredPlans.length === 0 ? (
        <div className="bg-white p-12 text-center text-marinho/40 rounded-3xl">
          <AlertCircle size={32} className="mx-auto text-marinho/25 mb-2" />
          <p className="text-sm font-semibold">Nenhum planejamento condizente com as palavras digitadas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPlans.map(plan => (
            <div 
              key={plan.id}
              className="bg-white p-6 rounded-[2rem] border border-[#2D3A4A]/5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all relative overflow-hidden group"
            >
              {/* Top info and theme */}
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-bold text-marinho/40 font-mono tracking-wider">Scrapbook Template</span>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDuplicatePlan(plan)}
                      className="p-1.5 text-marinho/40 hover:text-marinho hover:bg-areia rounded-lg"
                      title="Copiar Modelo"
                    >
                      <Copy size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Apagar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-medium text-lg text-marinho leading-tight flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-theme/10 text-xs flex items-center justify-center bg-[#CDB4DB]/30 font-bold">🎯</span>
                    {plan.theme}
                  </h3>
                  <p className="text-xs text-marinho/50 font-medium mt-1 leading-relaxed">Obj: {plan.objective}</p>
                </div>

                {/* Sub detailed specifications with tags */}
                <div className="space-y-2 pt-2 border-t border-marinho/5 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-black text-marinho/40 font-serif mr-2">Vocabulários:</span>
                    <span className="text-marinho font-mono font-bold bg-areia/40 px-2 py-0.5 rounded-md">{plan.vocabulary}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 bg-[#9CC6E8]/10 rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-[#2D2A4A]/50 block">Música lúdica</span>
                      <p className="text-xs font-semibold text-marinho leading-snug">{plan.song}</p>
                    </div>
                    <div className="p-2.5 bg-[#FFB6A6]/10 rounded-xl space-y-1">
                      <span className="text-[9px] uppercase font-bold text-[#2D2A4A]/50 block">Livro lido</span>
                      <p className="text-xs font-semibold text-marinho leading-snug">{plan.story}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#A8D5C2]/15 rounded-2xl font-normal leading-relaxed text-marinho/80">
                    <span className="text-[9px] uppercase font-bold block text-[#2D2A4A]/50 mb-1">Brincadeira / Jogo Ativo:</span>
                    {plan.activity}
                  </div>

                  <div className="text-[11px] text-marinho/60 pt-1 flex items-center gap-1.5 font-medium">
                    <span className="font-bold">🎒 Materiais:</span> {plan.materialsNeeded}
                  </div>
                </div>
              </div>

              {/* Bottom apply trigger button */}
              <div className="pt-4 border-t border-[#2D3A4A]/5 mt-4">
                <button 
                  onClick={() => handleQuickApply(plan)}
                  className="w-full bg-[#2D3A4A] text-white py-2.5 rounded-xl text-xs font-bold uppercase transition hover:bg-coral hover:text-marinho cursor-pointer"
                >
                  Usar Este Roteiro de Aula
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Reusable hint */}
      <div className="p-4 bg-white rounded-3xl text-xs text-marinho/60 flex items-center gap-3">
        <Scroll size={24} className="text-[#CDB4DB] shrink-0" />
        <p>A Teacher Carla pode pré-selecionar estes planejamentos na hora de registrar as presenças ou feedbacks, otimizando o envio de relatórios didáticos para a família!</p>
      </div>

    </div>
  );
}
