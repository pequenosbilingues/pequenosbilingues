/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Student, FinancialRecord, MonthlyPayment } from '../types';
import { 
  DollarSign, TrendingUp, TrendingDown, Clipboard, 
  Plus, Trash2, Calendar, AlertCircle, CheckCircle, Clock,
  Filter, ArrowUpRight, Search, Sparkles
} from 'lucide-react';

interface FinancialsProps {
  students: Student[];
  financials: FinancialRecord[];
  payments: MonthlyPayment[];
  onAddTransaction: (record: Omit<FinancialRecord, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdatePaymentStatus: (paymentId: string, status: 'Pago' | 'Pendente' | 'Atrasado') => void;
}

export default function Financials({
  students,
  financials,
  payments,
  onAddTransaction,
  onDeleteTransaction,
  onUpdatePaymentStatus
}: FinancialsProps) {
  
  // Tab states: 'transacoes' (Transactions history) or 'mensalidades' (Student bills)
  const [financeTab, setFinanceTab] = useState<'transacoes' | 'mensalidades'>('transacoes');

  // New transaction modal & inputs
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txFormData, setTxFormData] = useState({
    type: 'Receita' as const,
    category: 'Mensalidade' as const,
    amount: 100,
    date: '2026-06-08',
    description: '',
    studentId: ''
  });

  // Calculate high-level numbers for current mock date (June 2026)
  const billingMonthYear = '2026-06';

  const totalRevenue = financials
    .filter(f => f.type === 'Receita')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = financials
    .filter(f => f.type === 'Despesa')
    .reduce((sum, item) => sum + item.amount, 0);

  const netProfit = totalRevenue - totalExpense;

  // Unpaid payments list specifically format
  const overduePayments = payments.filter(p => p.status === 'Atrasado' || p.status === 'Pendente');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTxFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (txFormData.amount <= 0) return;

    onAddTransaction({
      type: txFormData.type,
      category: txFormData.category,
      amount: txFormData.amount,
      date: txFormData.date,
      description: txFormData.description || `${txFormData.category} - Força de Entrada`,
      studentId: txFormData.studentId || undefined
    });

    setIsTxModalOpen(false);
    setTxFormData({
      type: 'Receita',
      category: 'Mensalidade',
      amount: 100,
      date: '2026-06-08',
      description: '',
      studentId: ''
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta transação do histórico financeiro?")) {
      onDeleteTransaction(id);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in text-marinho">
      
      {/* Top action layout */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-marinho flex items-center gap-2">
            <DollarSign className="text-azulCeu" /> Controle Comercial & Fluxo Financeiro
          </h1>
          <p className="text-sm text-marinho/60 mt-0.5">Visão unificada das receitas, despesas de combustível/materiais e cobrança das mensalidades.</p>
        </div>

        <button 
          onClick={() => setIsTxModalOpen(true)}
          className="bg-azulCeu hover:bg-azulCeu/95 text-marinho font-bold px-6 py-3 rounded-full flex items-center gap-2 shadow-xs transition-transform focus:scale-98 cursor-pointer"
        >
          <Plus size={18} /> Registrar Movimentação
        </button>
      </div>

      {/* Summary Scoreboard row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Receita card */}
        <div className="bg-white p-6 rounded-scrapbook border-b-8 border-menta shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-marinho/45 uppercase tracking-wider">Receitas Totais</span>
            <span className="block text-3xl font-display font-black text-emerald-600 mt-2 font-mono">
              {formatCurrency(totalRevenue)}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-full text-emerald-500">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Despesas card */}
        <div className="bg-white p-6 rounded-scrapbook border-b-8 border-coral shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-marinho/45 uppercase tracking-wider">Despesas Totais</span>
            <span className="block text-3xl font-display font-black text-red-500 mt-2 font-mono">
              {formatCurrency(totalExpense)}
            </span>
          </div>
          <div className="p-3 bg-red-50 rounded-full text-red-500">
            <TrendingDown size={24} />
          </div>
        </div>

        {/* Saldo Líquido Card */}
        <div className="bg-white p-6 rounded-scrapbook border-b-8 border-azulCeu shadow-xs flex items-center justify-between">
          <div>
            <span className="block text-xs font-bold text-marinho/45 uppercase tracking-wider">Saldo Líquido</span>
            <span className={`block text-3xl font-display font-black mt-2 font-mono ${netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {formatCurrency(netProfit)}
            </span>
          </div>
          <div className={`p-3 rounded-full ${netProfit >= 0 ? 'bg-blue-50 text-blue-500' : 'bg-red-50 text-red-500'}`}>
            <ArrowUpRight size={24} />
          </div>
        </div>

      </div>

      {/* Segment controls */}
      <div className="flex border-b border-areia-dark/15">
        <button
          onClick={() => setFinanceTab('transacoes')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
            financeTab === 'transacoes' 
              ? 'border-coral text-marinho' 
              : 'border-transparent text-marinho/50 hover:text-marinho'
          }`}
        >
          📊 Diário de Caixa (Receitas e Despesas)
        </button>
        <button
          onClick={() => setFinanceTab('mensalidades')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-all cursor-pointer ${
            financeTab === 'mensalidades' 
              ? 'border-coral text-marinho' 
              : 'border-transparent text-marinho/50 hover:text-marinho'
          }`}
        >
          💳 Controle de Inadimplência e WhatsApp ({overduePayments.length} Pendentes)
        </button>
      </div>

      {/* TAB CONTENT: TRANSAÇÕES */}
      {financeTab === 'transacoes' && (
        <div className="bg-white rounded-scrapbook shadow-sm border border-areia overflow-hidden">
          <div className="p-5 border-b border-areia flex justify-between items-center bg-[#ebd9cc]/20">
            <h3 className="font-display font-bold text-base text-marinho">Histórico de Caixa Recente</h3>
            <span className="text-xs text-marinho/50 font-bold font-mono">Tudo registrado com clareza</span>
          </div>

          {financials.length === 0 ? (
            <div className="p-12 text-center text-marinho/50">
              Nenhuma movimentação de caixa foi adicionada ao fluxo financeiro ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans">
                <thead className="bg-areia/40 text-marinho/65 text-xs font-bold uppercase tracking-wider border-b border-areia">
                  <tr>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                    <th className="px-6 py-4 text-center">Excluir</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-areia text-sm">
                  {financials
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((item) => (
                      <tr key={item.id} className="hover:bg-areia/20 transition">
                        {/* Data */}
                        <td className="px-6 py-4 text-xs font-semibold text-marinho/60">
                          {item.date.split('-').reverse().join('/')}
                        </td>

                        {/* Tipo com badge */}
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.type === 'Receita' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.type}
                          </span>
                        </td>

                        {/* Categoria */}
                        <td className="px-6 py-4 text-xs font-bold text-marinho/70">
                          {item.category}
                        </td>

                        {/* Descrição */}
                        <td className="px-6 py-4 text-xs font-medium text-marinho/80">
                          {item.description}
                        </td>

                        {/* Valor */}
                        <td className={`px-6 py-4 text-right font-bold font-mono ${
                          item.type === 'Receita' ? 'text-emerald-600' : 'text-red-500'
                        }`}>
                          {item.type === 'Receita' ? '+' : '-'} {formatCurrency(item.amount)}
                        </td>

                        {/* Ações */}
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MENSALIDADES */}
      {financeTab === 'mensalidades' && (
        <div className="bg-white p-6 rounded-scrapbook border-2 border-areia-dark/5 space-y-6">
          
          <div className="space-y-1 pl-1">
            <h3 className="font-display font-medium text-lg text-marinho flex items-center gap-2">
              🚨 Controle de Inadimplência & Cobrança de Famílias
            </h3>
            <p className="text-xs text-marinho/60">Filtro facilitado exibindo mensalidades vencidas fora do prazo e comandos rápidos de cobrança educada pelo WhatsApp.</p>
          </div>

          {overduePayments.length === 0 ? (
            <div className="p-12 text-center text-marinho/50 bg-[#ebd9cc]/10 rounded-2xl">
              Nenhuma mensalidade com o status de <strong>Atrasado</strong> ou <strong>Pendente</strong> no momento! Parabéns pelo controle comercial. 🎉
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {overduePayments.map((pay) => {
                const student = students.find(s => s.id === pay.studentId);
                const isOverdue = pay.status === 'Atrasado';

                return (
                  <div 
                    key={pay.id} 
                    className={`p-5 rounded-scrapbook border-2 flex flex-col justify-between h-[180px] transition-all hover:shadow-xs relative overflow-hidden ${
                      isOverdue ? 'border-red-100 bg-red-50/20' : 'border-amber-100 bg-amber-50/20'
                    }`}
                  >
                    <div>
                      {/* Badge top */}
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {pay.status === 'Atrasado' ? 'Atrasado' : 'Aguardando'}
                        </span>
                        
                        <span className="text-[10px] font-bold text-marinho/40">Vence em: {pay.dueDate.split('-').reverse().join('/')}</span>
                      </div>

                      <h4 className="font-display font-bold text-sm text-marinho mt-3.5 leading-tight">{pay.studentName}</h4>
                      <p className="text-[10px] text-marinho/60 font-medium">Reponsável: {student?.parentName || 'Cadastrado'}</p>
                    </div>

                    <div className="flex justify-between items-end pt-4 border-t border-marinho/5 mt-auto">
                      <span className="font-display font-bold text-base text-marinho font-mono">
                        {formatCurrency(pay.amount)}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Mark as paid button */}
                        <button 
                          onClick={() => onUpdatePaymentStatus(pay.id, 'Pago')}
                          className="bg-white hover:bg-emerald-50 border border-marinho/10 text-emerald-600 font-bold text-[9px] uppercase px-2.5 py-1.5 rounded-md"
                        >
                          Pago ✔️
                        </button>

                        {student && (
                          <a 
                            href={`https://wa.me/${student.whatsapp}?text=Ol%C3%A1%20${encodeURIComponent(student.parentName)}%2C%20tudo%20bem%3F%20Passando%20para%20enviar%20o%20lembrete%20da%20mensalidade%20de%20ingl%C3%AAs%20do(a)%20${encodeURIComponent(student.name)}.%20Qualquer%20d%C3%BAvida%20estou%20%C3%A0%20disposi%C3%A7%C3%A3o!%20%E2%9D%A4%EF%B8%8F`}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-coral text-marinho font-bold text-[9px] uppercase px-2.5 py-1.5 rounded-md text-center hover:bg-coral/90 block inline-flex items-center gap-1"
                          >
                            WhatsApp Lembrete 💬
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Regular Payments reference */}
          <div className="space-y-2 pt-4 pl-1">
            <h4 className="font-display font-bold text-xs text-marinho uppercase text-marinho/45 tracking-widest">Compilado de Mensalidades Recebidas</h4>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {payments
                .filter(p => p.status === 'Pago')
                .map((p) => (
                  <span key={p.id} className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full px-3 py-1 font-bold">
                    👍 {p.studentName} ({p.dueDate.split('-')[1]}/2026) - Pago em {p.paymentDate?.split('-').reverse().join('/')}
                  </span>
                ))
              }
            </div>
          </div>

        </div>
      )}

      {/* DIÁRIO DE CAIXA CREATION MODAL FORM */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-scrapbook shadow-2xl border-4 border-dashed border-[#9CC6E8] max-w-sm w-full p-6 relative">
            
            <button 
              onClick={() => setIsTxModalOpen(false)}
              className="absolute top-4 right-4 text-marinho/60 hover:text-marinho font-bold text-xl px-2 hover:bg-areia rounded-full cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-1 mb-6">
              <h3 className="font-display font-black text-2xl text-marinho">✨ Diário de Caixa</h3>
              <p className="text-xs text-marinho/60">Registrar despesas didáticas, custos de transporte ou receitas com aulas experimentais</p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Membro de fluxo</label>
                  <select
                    name="type"
                    value={txFormData.type}
                    onChange={(e) => {
                      const typeVal = e.target.value as 'Receita' | 'Despesa';
                      setTxFormData(prev => ({
                        ...prev,
                        type: typeVal,
                        category: typeVal === 'Receita' ? 'Mensalidade' : 'Combustível'
                      }));
                    }}
                    className="w-full bg-areia/45 border border-marinho/10 p-2.5 rounded-xl uppercase text-[10px] font-bold outline-none focus:border-coral"
                  >
                    <option value="Receita">Receita (Inflow)</option>
                    <option value="Despesa">Despesa (Outflow)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Categoria</label>
                  <select
                    name="category"
                    value={txFormData.category}
                    onChange={handleInputChange}
                    className="w-full bg-areia/45 border border-marinho/10 p-2.5 rounded-xl uppercase text-[10px] font-bold outline-none focus:border-coral"
                  >
                    {txFormData.type === 'Receita' ? (
                      <>
                        <option value="Mensalidade">Mensalidade</option>
                        <option value="Aula Experimental">Aula Experimental</option>
                        <option value="Outros">Outros</option>
                      </>
                    ) : (
                      <>
                        <option value="Combustível">Combustível</option>
                        <option value="Materiais">Materiais didáticos</option>
                        <option value="Impressões">Impressões folhas</option>
                        <option value="Outros">Outros administrativos</option>
                      </>
                    )}
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Valor Comercial (R$)</label>
                  <input 
                    type="number"
                    name="amount"
                    required
                    value={txFormData.amount}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full bg-areia/45 border border-marinho/10 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Data</label>
                  <input 
                    type="date"
                    name="date"
                    required
                    value={txFormData.date}
                    onChange={handleInputChange}
                    className="w-full bg-areia/45 border border-marinho/10 p-2.5 rounded-xl text-xs font-bold outline-none focus:border-coral"
                  />
                </div>
              </div>

              {/* Se Receita e Mensalidade, associar aluno opcional */}
              {txFormData.type === 'Receita' && (
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Aluno Relacionado (Opcional)</label>
                  <select
                    name="studentId"
                    value={txFormData.studentId}
                    onChange={handleInputChange}
                    className="w-full bg-areia/45 border border-marinho/10 p-2.5 rounded-xl uppercase text-[10px] font-bold outline-none focus:border-coral"
                  >
                    <option value="">Atribuição genérica sem estudante</option>
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-marinho/60 mb-1 flex items-center justify-between">
                  <span>Descrição / Justificativa</span>
                  <span className="text-[9px] text-[#B5A1C9]">Ex: Posto de gasolina</span>
                </label>
                <input 
                  type="text"
                  name="description"
                  required
                  placeholder="Ex: Compra de tintas para aula do Arthur"
                  value={txFormData.description}
                  onChange={handleInputChange}
                  className="w-full bg-areia/45 border border-marinho/10 p-2.5 rounded-xl text-xs outline-none focus:border-coral"
                />
              </div>

              {/* Confirm row */}
              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="w-1/2 border border-marinho/10 text-marinho font-bold py-3 rounded-xl hover:bg-areia cursor-pointer text-xs"
                >
                  Voltar
                </button>
                <button 
                  type="submit"
                  className="w-1/2 bg-marinho text-white font-bold py-3 rounded-xl hover:bg-marinho/90 text-xs shadow-xs cursor-pointer"
                >
                  Registrar Diário
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
