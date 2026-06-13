/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Heart, Music, Sparkles, Smile, Compass, BookOpen, 
  MapPin, Laptop, Home as HomeIcon, ChevronRight, ChevronDown, MessageSquare, 
  Phone, User, Calendar, Tag, Check, Award, Clock, HelpCircle, AlertCircle, Instagram, Send, Mail,
  Menu, X, ArrowUp
} from 'lucide-react';

export function RainbowLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer arch (Menta) */}
      <path d="M15 70 A35 35 0 0 1 85 70" stroke="#A8D5C2" strokeWidth="8" strokeLinecap="round" />
      {/* Middle arch (Coral) */}
      <path d="M27 70 A23 23 0 0 1 73 70" stroke="#FFB6A6" strokeWidth="8" strokeLinecap="round" />
      {/* Inner arch (Amarelo) */}
      <path d="M39 70 A11 11 0 0 1 61 70" stroke="#FFD166" strokeWidth="8" strokeLinecap="round" />
      {/* Center Heart (Lilas/Coral) */}
      <path d="M50 72 C48 70 45 70 44 72 C43 74 45 77 50 82 C55 77 57 74 56 72 C55 70 52 70 50 72 Z" fill="#CDB4DB" />
    </svg>
  );
}

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onAddExperimentalRequest: (data: {
    parentName: string;
    childName: string;
    childAge: string;
    phone: string;
    whatsapp: string;
    email: string;
    origin: string;
    message: string;
  }) => void;
}

export default function LandingPage({ onNavigateToLogin, onAddExperimentalRequest }: LandingPageProps) {
  // Contact Form (Solicitar Informações) State
  const [formData, setFormData] = useState({
    parentName: '',
    childName: '',
    childAge: '',
    whatsapp: '',
    email: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Modal State for multi-purpose request flows (Agendar Aula Experimental | Receber Proposta)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'proposal' | 'experimental'>('experimental');
  const [modalData, setModalData] = useState({
    parentName: '',
    childName: '',
    childAge: '',
    phone: '',
    whatsapp: '',
    email: '',
    preferredModality: 'Individual', // Individual | Dupla | Pequeno Grupo
    preferredFrequency: '2 vezes por semana', // For Receber Proposta
    bestDay: 'Qualquer dia útil', // For Agendar Aula Experimental
    notes: ''
  });
  const [modalSubmitted, setModalSubmitted] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{ status: 'idle' | 'sending' | 'success' | 'error'; message: string } | null>(null);

  // Simulated Email Toast State (Exposing sent automation logs to show full implementation details)
  const [activeSimulation, setActiveSimulation] = useState<{
    visible: boolean;
    toAdmin: {
      to: string;
      subject: string;
      body: string;
    };
    toFamily: {
      to: string;
      subject: string;
      body: string;
    };
  } | null>(null);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // ESTADOS DE FACILIDADE & INTERATIVIDADE
  const [pricingTab, setPricingTab] = useState<'simulator' | 'tables'>('simulator');
  const [simFreq, setSimFreq] = useState<1 | 2>(1); // 1 ou 2 encontros semanais
  const [simMod, setSimMod] = useState<'Individual' | 'Dupla' | 'Pequeno Grupo'>('Individual');
  const [faqSearch, setFaqSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollTopBtn, setShowScrollTopBtn] = useState(false);
  const [isAdminOrDebug, setIsAdminOrDebug] = useState(false);

  useEffect(() => {
    const checkAdmin = () => {
      const logged = localStorage.getItem('pb_logged_in') === 'true';
      const robotOver = localStorage.getItem('pb_show_robot') === 'true';
      const searchParams = new URLSearchParams(window.location.search);
      const debugParam = searchParams.get('debug') === 'true' || searchParams.has('debug') || searchParams.has('admin') || searchParams.has('showRobot');
      
      setIsAdminOrDebug(logged || robotOver || debugParam);
    };
    checkAdmin();
    const interval = setInterval(checkAdmin, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTopBtn(true);
      } else {
        setShowScrollTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const getSimulatedPrice = () => {
    if (simFreq === 1) {
      if (simMod === 'Individual') return 420;
      if (simMod === 'Dupla') return 300;
      return 220; // Pequeno Grupo
    } else {
      if (simMod === 'Individual') return 750;
      if (simMod === 'Dupla') return 520;
      return 380; // Pequeno Grupo
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setModalData(prev => ({ ...prev, [name]: value }));
  };

  // Automated Email integration with express mailer backend
  const triggerLeadAutomation = async (
    origin: string,
    leadDetails: {
      parentName: string;
      childName: string;
      childAge: string;
      phone: string;
      whatsapp: string;
      email: string;
      message: string;
    }
  ) => {
    // 1. Save Lead structure to our global application states
    onAddExperimentalRequest({
      parentName: leadDetails.parentName,
      childName: leadDetails.childName,
      childAge: leadDetails.childAge,
      phone: leadDetails.phone,
      whatsapp: leadDetails.whatsapp,
      email: leadDetails.email,
      origin: origin,
      message: leadDetails.message
    });

    const adminEmail = 'contact.pequenosbilingues@gmail.com';
    const targetFamilyEmail = leadDetails.email || 'contato.familia@gmail.com';

    setSubmissionStatus({ status: 'sending', message: 'Enviando seus dados de forma segura...' });

    try {
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parentName: leadDetails.parentName,
          childName: leadDetails.childName,
          childAge: leadDetails.childAge,
          phone: leadDetails.phone,
          whatsapp: leadDetails.whatsapp,
          email: leadDetails.email,
          origin,
          message: leadDetails.message
        })
      });

      const resData = await response.json();

      if (response.ok && resData.success) {
        setSubmissionStatus({
          status: 'success',
          message: '✓ Dados enviados com sucesso! Os e-mails de notificação e boas-vindas foram despachados.'
        });

        // Open floating automation process feedback toast
        setActiveSimulation({
          visible: true,
          toAdmin: {
            to: adminEmail,
            subject: `📥 [CRM Pequenos Bilíngues] Novo lead qualificado: ${origin}`,
            body: `Olá Administradora Teacher Carla,\n\nUm novo lead preencheu correspondência de interesse via portal oficial.\n\nFicha Cadastral:\n- Fluxo: ${origin}\n- Responsável: ${leadDetails.parentName}\n- Nome da Criança: ${leadDetails.childName}\n- Idade da Criança: ${leadDetails.childAge} anos\n- WhatsApp: ${leadDetails.whatsapp}\n- Telefone Fixo/Celular: ${leadDetails.phone}\n- E-mail da família: ${targetFamilyEmail}\n- Memorandos:\n"${leadDetails.message}"\n\nEste registro foi protocolado com sucesso nas tabelas do seu CRM.`
          },
          toFamily: {
            to: targetFamilyEmail,
            subject: 'Bem-vindo(a) ao Pequenos Bilíngues! 🎈🇬🇧',
            body: `Olá!\n\nRecebemos sua mensagem e ficamos muito felizes pelo seu interesse no Pequenos Bilíngues.\n\nEm breve entraremos em contato para conversar sobre sua criança e apresentar nossa proposta de forma personalizada.\n\nCom carinho,\n\nTeacher Carla Cristina\nPequenos Bilíngues`
          }
        });
      } else {
        throw new Error(resData.error || 'Erro processando os e-mails no servidor.');
      }
    } catch (err: any) {
      console.error('Error submitting form data:', err);
      // Fallback with a nice warning message but logs simulation details on client so everything functions beautifully
      setSubmissionStatus({
        status: 'error',
        message: `Falha ao transmitir dados diretamente ao servidor, mas seu lead foi capturado localmente!`
      });

      setActiveSimulation({
        visible: true,
        toAdmin: {
          to: adminEmail,
          subject: `📥 [CRM Pequenos Bilíngues - Contingência] Novo lead qualificado: ${origin}`,
          body: `Olá Administradora Teacher Carla,\n\nUm novo lead preencheu correspondência de interesse via portal oficial.\n\nFicha Cadastral:\n- Fluxo: ${origin}\n- Responsável: ${leadDetails.parentName}\n- Nome da Criança: ${leadDetails.childName}\n- Idade da Criança: ${leadDetails.childAge} anos\n- WhatsApp: ${leadDetails.whatsapp}\n- Telefone Fixo/Celular: ${leadDetails.phone}\n- E-mail da família: ${targetFamilyEmail}\n- Memorandos:\n"${leadDetails.message}"`
        },
        toFamily: {
          to: targetFamilyEmail,
          subject: 'Bem-vindo(a) ao Pequenos Bilíngues! 🎈🇬🇧',
          body: `Olá!\n\nRecebemos sua mensagem e ficamos muito felizes pelo seu interesse no Pequenos Bilíngues.\n\nEm breve entraremos em contato para conversar sobre sua criança e apresentar nossa proposta de forma personalizada.`
        }
      });
    }

    // Auto dismiss after 8s
    setTimeout(() => {
      setSubmissionStatus(null);
    }, 8000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.parentName || !formData.whatsapp) return;
    
    // Trigger fully simulated pipeline
    triggerLeadAutomation('Solicitar Informações', {
      parentName: formData.parentName,
      childName: formData.childName || 'A informar',
      childAge: formData.childAge || 'Não informada',
      phone: formData.whatsapp,
      whatsapp: formData.whatsapp,
      email: formData.email,
      message: formData.message
    });

    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({
        parentName: '',
        childName: '',
        childAge: '',
        whatsapp: '',
        email: '',
        message: ''
      });
    }, 6000);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalData.parentName || !modalData.whatsapp) return;

    const extraComments = modalType === 'proposal'
      ? `Modalidade Desejada: ${modalData.preferredModality}. Frequência: ${modalData.preferredFrequency}. Notas: ${modalData.notes}`
      : `Modalidade Desejada: ${modalData.preferredModality}. Melhor dia para contato: ${modalData.bestDay}. Notas: ${modalData.notes}`;

    triggerLeadAutomation(
      modalType === 'proposal' ? 'Receber Proposta' : 'Agendar Aula Experimental',
      {
        parentName: modalData.parentName,
        childName: modalData.childName,
        childAge: modalData.childAge,
        phone: modalData.phone || modalData.whatsapp,
        whatsapp: modalData.whatsapp,
        email: modalData.email,
        message: extraComments
      }
    );

    setModalSubmitted(true);
    setTimeout(() => {
      setModalSubmitted(false);
      setIsModalOpen(false);
      // Reset Modal parameters
      setModalData({
        parentName: '',
        childName: '',
        childAge: '',
        phone: '',
        whatsapp: '',
        email: '',
        preferredModality: 'Individual',
        preferredFrequency: '2 vezes por semana',
        bestDay: 'Qualquer dia útil',
        notes: ''
      });
    }, 6000);
  };

  return (
    <div className="bg-areia min-h-screen selection:bg-coral/30 selection:text-marinho font-sans">
      
      {/* HEADER NAV */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b-2 border-areia-dark/15 px-3 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Mobile Shortcuts Trigger (Canto Superior Esquerdo) */}
          <div className="md:hidden flex items-center mr-1">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-marinho bg-areia/45 hover:bg-areia border-2 border-dashed border-marinho/10 hover:border-marinho/25 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 active:scale-95 shrink-0"
              id="mobile_shortcuts_button"
              title="Atalhos do Site"
            >
              {isMobileMenuOpen ? <X size={18} className="text-coral" /> : <Menu size={18} className="text-purple-600" />}
              <span className="text-[10px] font-black uppercase tracking-wider text-marinho hidden xs:inline">Atalhos</span>
            </button>
          </div>

          {/* Logo with Scrapbook Feel */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <RainbowLogo className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-xs group-hover:scale-105 transition-transform duration-300" />
            <div className="hidden xs:block">
              <span className="font-display font-bold text-sm sm:text-xl tracking-tight text-marinho">Pequenos Bilíngues</span>
              <span className="block text-[9px] sm:text-[10px] text-coral font-bold tracking-widest uppercase">Inglês Lúdico</span>
            </div>
          </div>

          {/* Desktop Navigation links */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6 font-medium text-marinho/80 text-xs lg:text-sm">
            <a href="#sobre" className="hover:text-coral transition-colors">Sobre</a>
            <a href="#professora" className="hover:text-coral transition-colors">Teacher Carla</a>
            <a href="#metodologia" className="hover:text-coral transition-colors">Metodologia</a>
            <a href="#modalidades" className="hover:text-coral transition-colors">Modalidades</a>
            <a href="#investimento" className="hover:text-coral transition-colors font-bold text-coral">Investimento</a>
            <a href="#horarios" className="hover:text-coral transition-colors">Horários</a>
            <a href="#faq" className="hover:text-coral transition-colors">Dúvidas</a>
            <a href="#contato" className="hover:text-coral transition-colors">Contato</a>
          </nav>

          {/* Action Button & Instagram Link */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
            <button 
              onClick={() => {
                setModalType('experimental');
                setIsModalOpen(true);
              }}
              id="btn_experimental_top"
              className="bg-[#FFB6A6] hover:bg-[#FFB6A6]/95 text-marinho font-bold px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-[10px] sm:text-xs md:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
            >
              Experimental 🎈
            </button>
            <a 
              href="https://instagram.com/teacher.carlacristina" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-marinho/80 hover:text-coral transition-colors text-xs font-semibold shrink-0"
              title="Instagram @teacher.carlacristina"
            >
              <Instagram size={18} className="text-coral shrink-0" />
              <span className="hidden lg:inline">@teacher.carlacristina</span>
            </a>
          </div>
        </div>
      </header>

      {/* MOBILE SHORTCUTS DRAWER / TAB OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Slide-out Panel with Hand-drawn scrapbook aesthetics */}
          <div className="relative w-72 max-w-xs bg-[#FFFDF9] h-full shadow-2xl border-r-4 border-dashed border-lilas/40 p-6 flex flex-col justify-between z-10 animate-slide-in-left">
            <div className="space-y-6">
              {/* Header inside Menu */}
              <div className="flex items-center justify-between border-b border-marinho/5 pb-4">
                <div className="flex items-center gap-2">
                  <RainbowLogo className="w-9 h-9" />
                  <div>
                    <span className="font-display font-black text-sm text-marinho block">Pequenos Bilíngues</span>
                    <span className="text-[9px] text-coral font-bold uppercase tracking-wider block">Atalhos Lúdicos</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full bg-marinho/5 text-marinho/60 hover:text-marinho hover:bg-marinho/10 transition-colors cursor-pointer"
                  title="Fechar Menu"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5">
                {[
                  { label: "Início", href: "#", icon: <HomeIcon size={16} className="text-blue-500" /> },
                  { label: "Sobre o Projeto", href: "#sobre", icon: <Heart size={16} className="text-coral" /> },
                  { label: "Teacher Carla", href: "#professora", icon: <User size={16} className="text-purple-500" /> },
                  { label: "Abordagem & Métodos", href: "#metodologia", icon: <BookOpen size={16} className="text-emerald-500" /> },
                  { label: "Como Funciona", href: "#como-funciona", icon: <Compass size={16} className="text-amber-500" /> },
                  { label: "Preços & Simulador", href: "#investimento", icon: <Tag size={16} className="text-indigo-500" /> },
                  { label: "Grade de Horários", href: "#horarios", icon: <Clock size={16} className="text-teal-500" /> },
                  { label: "Dúvidas Frequentes", href: "#faq", icon: <HelpCircle size={16} className="text-rose-500" /> },
                  { label: "Entrar em Contato", href: "#contato", icon: <Mail size={16} className="text-sky-500" /> },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl hover:bg-areia/40 text-xs sm:text-sm font-semibold text-marinho/85 hover:text-marinho border border-transparent hover:border-marinho/5 transition-all duration-200"
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Bottom Actions of Menu */}
            <div className="space-y-4 pt-6 border-t border-marinho/5">
              <a 
                href="https://wa.me/5569992512267?text=Olá%20Teacher%20Carla!%20Gostaria%20de%20receber%20informações%20sobre%20o%20Pequenos%20Bilíngues."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-2.5 bg-[#25D366] hover:bg-[#20BA56] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Falar no WhatsApp 💬
              </a>
              
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNavigateToLogin();
                }}
                className="w-full py-2 bg-marinho/5 hover:bg-marinho/10 text-marinho/70 hover:text-marinho font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Acesso do Professor 🔐
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 px-4 md:px-8">
        
        {/* Background Blobs for Scrapbook Vibe */}
        <div className="absolute top-1/4 -left-16 w-64 h-64 bg-menta/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-12 right-0 w-80 h-80 bg-lilas/25 rounded-full blur-3xl -z-10" />
        <div className="absolute top-12 right-1/4 w-32 h-32 bg-amarelo/20 organic-blob-1 -z-10 animate-pulse" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          
          {/* Hero text */}
          <div className="md:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/80 border border-marinho/10 px-4 py-1.5 rounded-full text-xs font-bold text-marinho shadow-xs">
              <Sparkles size={14} className="text-amarelo" />
              <span>Aprendizado ativo, leve e natural 🇬🇧✨</span>
            </div>
            
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-marinho leading-tight">
              Inglês infantil em Porto Velho:<br />
              Porque aprender pode ser <span className="text-[#FFB6A6] underline decoration-wavy decoration-3">leve.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-marinho/80 leading-relaxed max-w-xl">
              Aula particular de inglês infantil idealizada sob os pilares do <span className="italic font-bold text-coral">play based learning</span> na educação bilíngue infantil. Um inglês lúdico planejado especialmente para a infância.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={() => {
                  setModalType('experimental');
                  setIsModalOpen(true);
                }}
                className="inline-flex justify-center items-center gap-2 bg-marinho hover:bg-marinho/90 text-white font-bold px-8 py-4 rounded-scrapbook shadow-md hover:shadow-xl transition-all text-center cursor-pointer"
              >
                Agendar Aula Experimental 🎈
                <ChevronRight size={18} />
              </button>
              <a 
                href="https://wa.me/5569992512267?text=Olá%20Teacher%20Carla!%20Gostaria%20de%20receber%20informações%20sobre%20o%20Pequenos%20Bilíngues."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center gap-2 bg-[#25D366] hover:bg-[#20BA56] text-white font-bold px-8 py-4 rounded-scrapbook shadow-md hover:shadow-xl transition-all cursor-pointer text-center"
              >
                Falar no WhatsApp 💬
                <MessageSquare size={18} />
              </a>
            </div>

            {/* Quick trust badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-marinho/10 max-w-md">
              <div>
                <span className="block font-display font-bold text-lg text-marinho">Play-based</span>
                <span className="text-xs text-marinho/70">Aprender brincando</span>
              </div>
              <div>
                <span className="block font-display font-bold text-lg text-marinho">Acolhedor</span>
                <span className="text-xs text-marinho/70">Ambiente premium</span>
              </div>
              <div>
                <span className="block font-display font-bold text-lg text-marinho">Autoral</span>
                <span className="text-xs text-marinho/70">Aulas sob medida</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Scrapbook */}
          <div className="md:col-span-5 relative flex justify-center">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96">
              
              {/* Organic Frame 1 */}
              <div className="absolute inset-0 bg-coral/30 organic-blob-1 rotate-6 transform hover:rotate-12 transition-transform duration-500" />
              
              {/* Organic Frame 2 */}
              <div className="absolute inset-4 bg-azulCeu/30 organic-blob-2 -rotate-12 transform hover:rotate-6 transition-transform duration-500" />

              {/* Main Scrapbook Frame */}
              <div className="absolute inset-8 bg-white rounded-scrapbook shadow-xl overflow-hidden border-4 border-dashed border-marinho/10 p-6 flex flex-col justify-between items-center text-center">
                
                {/* Visual elements */}
                <span className="text-xs font-bold text-coral tracking-widest uppercase">Pequenos Bilíngues</span>
                
                <div className="my-auto space-y-4">
                  <div className="mx-auto w-20 h-20 rounded-full bg-amarelo flex items-center justify-center text-marinho shadow-sm">
                    <Smile size={48} className="animate-bounce" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-2xl text-marinho">Let's Play!</h3>
                    <p className="text-sm text-marinho/70 mt-1">Imersão em inglês através do afeto, música e artes lúdicas.</p>
                  </div>
                </div>

                <div className="flex gap-2 items-center text-xs font-bold text-menta-dark bg-menta/20 px-3 py-1 rounded-full">
                  <Heart size={12} className="fill-current text-coral animate-pulse" />
                  <span>Pedagogia do Afeto</span>
                </div>
              </div>

              {/* Little speech bubbles */}
              <div className="absolute -top-3 -right-3 bg-white border border-marinho/15 py-1 px-3 rounded-full text-xs font-bold text-marinho shadow-md rotate-12">
                "Hello!" 👋
              </div>
              <div className="absolute -bottom-3 -left-3 bg-white border border-marinho/15 py-1 px-3 rounded-full text-xs font-bold text-marinho shadow-md -rotate-12">
                "Let's go! 🎈"
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION SOBRE */}
      <section id="sobre" className="py-20 bg-white px-4 md:px-8 border-y-2 border-areia-dark/15 relative overflow-hidden">
        {/* Abstract background decorations like delicate stars */}
        <div className="absolute top-8 left-8 text-amarelo/40 animate-pulse">
          <Sparkles size={32} />
        </div>
        <div className="absolute bottom-12 right-8 text-lilas/40">
          <Heart size={36} className="fill-current" />
        </div>

        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold tracking-widest text-coral uppercase block">Nossa Essência</span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-marinho leading-tight">
              O que é o Pequenos Bilíngues?
            </h2>
            <div className="w-16 h-1 bg-amarelo mx-auto rounded-full" />
            <p className="text-lg md:text-xl text-marinho/80 leading-relaxed font-medium">
              Conectamos crianças ao inglês desde os primeiros anos de vida, respeitando seu tempo e desenvolvimento, tornando o aprender um momento feliz.
            </p>
          </div>

          {/* Posicionamento - Comparison Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-[#FFFDF9] p-8 rounded-scrapbook border-2 border-dashed border-red-200/80 shadow-xs hover:shadow-md transition-all duration-300 relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-coral text-marinho text-xs font-bold rounded-full uppercase tracking-wider">
                Descoberta
              </div>
              <h3 className="font-display font-bold text-xl text-marinho mt-2 mb-3">Não é uma escola tradicional 🎒</h3>
              <p className="text-sm text-marinho/75 leading-relaxed">
                Esqueça carteiras enfileiras, provas, cobrança excessiva ou rigidez pedagógica. Aqui o ambiente é afetivo, espontâneo e foca inteiramente no aconchego do seu filho.
              </p>
            </div>

            <div className="bg-[#FFFDF9] p-8 rounded-scrapbook border-2 border-dashed border-blue-200/80 shadow-xs hover:shadow-md transition-all duration-300 relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-azulCeu text-marinho text-xs font-bold rounded-full uppercase tracking-wider">
                Curiosidade
              </div>
              <h3 className="font-display font-bold text-xl text-marinho mt-2 mb-3">Não é um curso convencional 🧸</h3>
              <p className="text-sm text-marinho/75 leading-relaxed">
                Sem apostilas maçantes ou decoreba mecânica de palavras soltas. O idioma acontece de forma imersiva e contextualizada através de gincanas sensoriais e projetos autorais lúdicos.
              </p>
            </div>

            <div className="bg-[#FFFDF9] p-8 rounded-scrapbook border-2 border-dashed border-purple-200/80 shadow-xs hover:shadow-md transition-all duration-300 relative">
              <div className="absolute -top-3 left-6 px-3 py-1 bg-lilas text-marinho text-xs font-bold rounded-full uppercase tracking-wider">
                Conexão
              </div>
              <h3 className="font-display font-bold text-xl text-marinho mt-2 mb-3">Não é reforço escolar 🚀</h3>
              <p className="text-sm text-marinho/75 leading-relaxed">
                Não focamos em corrigir lições de casa ou preencher lacunas de notas escolares. Promovemos o amor espontâneo ao segundo idioma através do brincar e do vínculo!
              </p>
            </div>

          </div>

          {/* 4 Concept Pillars Banner */}
          <div className="bg-areia/40 border border-marinho/5 p-8 md:p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[#F7F1E6]/20 opacity-50 pointer-events-none" />
            
            <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
              <h3 className="font-display font-bold text-2xl text-marinho">Pequenos Passos, Grandes Descobertas</h3>
              <p className="text-xs text-coral font-bold uppercase tracking-widest">Nossa Filosofia de Aprendizado</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-coral/25 text-coral rounded-full flex items-center justify-center mx-auto text-lg font-bold font-display">1</div>
                <h4 className="font-display font-bold text-marinho text-base">Aprender não precisa ser uma obrigação</h4>
                <p className="text-xs text-marinho/70 leading-relaxed">
                  Transformamos cada momento em curiosidade. Sem fórmulas rígidas, estimulando o interesse intrínseco.
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-azulCeu/30 text-blue-700 rounded-full flex items-center justify-center mx-auto text-lg font-bold font-display">2</div>
                <h4 className="font-display font-bold text-marinho text-base">Crianças aprendem melhor quando brincam</h4>
                <p className="text-xs text-marinho/70 leading-relaxed">
                  O jogo e a imaginação são as ferramentas primárias do desenvolvimento cognitivo na infância bilíngue.
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-menta/30 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-lg font-bold font-display">3</div>
                <h4 className="font-display font-bold text-marinho text-base">O inglês acontece de forma 100% natural</h4>
                <p className="text-xs text-marinho/70 leading-relaxed">
                  A aquisição acontece por imersão viva no idioma, no ritmo de desenvolvimento físico e mental individual.
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-amarelo/30 text-amber-800 rounded-full flex items-center justify-center mx-auto text-lg font-bold font-display">4</div>
                <h4 className="font-display font-bold text-marinho text-base">Vínculo, repetição e diversão caminham juntos</h4>
                <p className="text-xs text-marinho/70 leading-relaxed">
                  Acolhimento afetivo pavimenta a autoconfiança de falar e compreender um segundo idioma com naturalidade.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SEÇÃO CONHEÇA A PROFESSORA */}
      <section id="professora" className="py-20 px-4 md:px-8 bg-areia relative overflow-hidden border-b-2 border-areia-dark/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Polaroid Photo and Quick Credentials */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative bg-white p-5 pb-8 rounded-2xl shadow-xl border-2 border-dashed border-marinho/10 rotate-2 hover:rotate-0 transition-all duration-300 max-w-sm w-full">
                {/* Decorative tape effect */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-amarelo/45 -rotate-3 rounded-md shadow-xs" />
                
                <div className="overflow-hidden rounded-xl aspect-[3/4] bg-areia">
                  <img 
                    src="/src/assets/images/regenerated_image_1780965159865.jpg" 
                    alt="Teacher Carla Cristina" 
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                </div>
                
                <div className="mt-6 text-center space-y-1">
                  <h4 className="font-display font-bold text-lg text-marinho">Carla Cristina</h4>
                  <p className="text-xs text-coral font-bold uppercase tracking-wider">Teacher & Pedagoga</p>
                </div>
              </div>

              {/* Professional Experience Badges and Info */}
              <div className="mt-8 bg-white/80 p-5 rounded-3xl border border-marinho/5 shadow-xs w-full max-w-sm space-y-4">
                <p className="text-[10px] text-marinho/50 font-black uppercase tracking-widest text-center border-b border-marinho/5 pb-2">
                  Credenciais Profissionais
                </p>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-menta/25 text-emerald-700 flex items-center justify-center shrink-0">
                    <Award size={16} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-marinho">5 Anos de Experiência</span>
                    <span className="block text-[10px] text-marinho/60">Dedicados à educação bilíngue infantil</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-azulCeu/25 text-blue-700 flex items-center justify-center shrink-0">
                    <Smile size={16} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-marinho">Educação Infantil</span>
                    <span className="block text-[10px] text-marinho/60">Atuação ativa com desenvolvimento infantil</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Bio and Pedagogical Highlights */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-3">
                <span className="text-xs font-bold tracking-widest text-coral uppercase block">Quem te acompanha</span>
                <h2 className="font-display font-black text-3xl md:text-4xl text-marinho leading-tight">
                  Olá, eu sou a Teacher Carla Cristina
                </h2>
                <div className="w-16 h-1 bg-coral rounded-full" />
              </div>

              <div className="space-y-4 text-marinho/80 text-sm md:text-base leading-relaxed">
                <p className="font-medium">
                  Sou pedagoga e professora de inglês para a educação infantil. Desde muito nova, sempre tive uma conexão especial com as crianças e uma paixão pelo inglês. Ao longo da minha trajetória, uni essas duas áreas para criar uma proposta de aprendizagem leve, afetiva e significativa.
                </p>
                <p>
                  Acredito que crianças aprendem melhor quando brincam, exploram, se movimentam e se sentem seguras. Por isso, minhas aulas são planejadas para que o inglês faça parte das experiências da infância de forma natural, divertida e sem pressão.
                </p>
              </div>

              {/* Differentials / Highlights block */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-marinho mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-lilas/30 text-xs flex items-center justify-center font-bold text-marinho">✨</span>
                  Meus Diferenciais Pedagógicos
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-marinho/5 hover:border-marinho/15 transition shadow-xs">
                    <span className="font-bold text-sm text-marinho block mb-1">🎯 Afeto e Vínculo Primeiro</span>
                    <p className="text-xs text-marinho/70">Acolhimento humanizado para construir a segurança emocional necessária para a aquisição linguística.</p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-marinho/5 hover:border-marinho/15 transition shadow-xs">
                    <span className="font-bold text-sm text-marinho block mb-1">🎈 Planejamento Personalizado</span>
                    <p className="text-xs text-marinho/70">Aulas autênticas construídas com base nos temas de real interesse de cada aluno ou pequeno grupo.</p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-marinho/5 hover:border-marinho/15 transition shadow-xs">
                    <span className="font-bold text-sm text-marinho block mb-1">🎨 Metodologia 100% Lúdica</span>
                    <p className="text-xs text-marinho/70">Brincadeiras, contação de histórias e culinária lúdica substituem fórmulas tradicionais e repetitivas.</p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-marinho/5 hover:border-marinho/15 transition shadow-xs">
                    <span className="font-bold text-sm text-marinho block mb-1">📋 Relatórios Pós-Aula Diários</span>
                    <p className="text-xs text-marinho/70">Feedbacks estruturados na Área da Família detalhando vocabulários praticados e a participação da criança.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* METODOLOGIA / SEÇÃO DIFERENCIAIS */}
      <section id="metodologia" className="py-20 px-4 md:px-8 bg-areia relative overflow-hidden">
        
        {/* Visual elements */}
        <div className="absolute top-24 right-10 w-44 h-44 bg-menta/10 organic-blob-3 -z-10" />

        <div className="max-w-7xl mx-auto">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#B5A1C9] uppercase">Nossos Valores e Métodos</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-marinho">Como Brincamos e Aprendemos</h2>
            <p className="text-marinho/70 max-w-xl mx-auto">Utilizamos metodologias ativas que se conectam com a imaginação natural das crianças.</p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-scrapbook border-2 border-dashed border-red-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-coral/20 flex items-center justify-center text-coral mb-6 group-hover:scale-110 transition-transform">
                <Music size={24} />
              </div>
              <h3 className="font-display font-bold text-xl text-marinho mb-2">🎵 Músicas e movimento</h3>
              <p className="text-sm text-marinho/70 leading-relaxed">
                Usamos canções infantis inglesas, ritmo e mímica adaptados corporalmente para memorizar vocabulários de forma natural e muito ativa.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-scrapbook border-2 border-dashed border-emerald-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-menta/20 flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                <Smile size={24} />
              </div>
              <h3 className="font-display font-bold text-xl text-marinho mb-2">🧸 Aprendizagem através do brincar</h3>
              <p className="text-sm text-marinho/70 leading-relaxed">
                Brinquedos guiados, jogos cooperativos e blocos de montar geram experiências ricas que tornam o idioma concreto.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-scrapbook border-2 border-dashed border-blue-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-azulCeu/20 flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <Compass size={24} />
              </div>
              <h3 className="font-display font-bold text-xl text-marinho mb-2">💬 Contato natural com o inglês</h3>
              <p className="text-sm text-marinho/70 leading-relaxed">
                Imersão contextualizada sem traduções mecânicas constantes. A criança infere e absorve os significados assim como fez no português.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-8 rounded-scrapbook border-2 border-dashed border-yellow-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-amarelo/20 flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>
              <h3 className="font-display font-bold text-xl text-marinho mb-2">✨ Desenvolvimento sem pressão</h3>
              <p className="text-sm text-marinho/70 leading-relaxed">
                Não exigimos repetição forçada. Respeitamos o "silent period" de cada criança enquanto ela adquire escuta empática e compreensão passiva.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-8 rounded-scrapbook border-2 border-dashed border-purple-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-lilas/20 flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <h3 className="font-display font-bold text-xl text-marinho mb-2">🌈 Aulas personalizadas</h3>
              <p className="text-sm text-marinho/70 leading-relaxed">
                Material focado nas afinidades de cada pequeno aluno (animais do mar, dinossauros, foguetes, culinária lúdica ou artes visuais).
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white p-8 rounded-scrapbook border-2 border-dashed border-pink-200 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 mb-6 group-hover:scale-110 transition-transform">
                <Heart size={24} />
              </div>
              <h3 className="font-display font-bold text-xl text-marinho mb-2">❤️ Vínculo e acolhimento</h3>
              <p className="text-sm text-marinho/70 leading-relaxed">
                Segurança emocional em primeiro lugar. Aulas divertidas que geram conexões afetivas genuínas entre a professora e a criança.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* SEÇÃO COMO FUNCIONA */}
      <section id="como-funciona" className="py-20 bg-white px-4 md:px-8 border-t-2 border-areia-dark/15 relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute top-1/3 -right-24 w-72 h-72 bg-menta/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-lilas/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold tracking-widest text-coral uppercase block">Como Funcionam as Aulas</span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-marinho">A Rotina Visual Bilíngue</h2>
            <p className="text-marinho/70 max-w-2xl mx-auto text-sm md:text-base">
              Estruturamos nossas dinâmicas inspiradas em rotinas visuais infantis modernas. Cada aula segue um ritmo previsível e seguro, propiciando que o seu pequeno aprenda com total segurança emocional.
            </p>
          </div>

          {/* Sequential Routine Scrapbook Carousel/Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Step 1: Acolhimento */}
            <div className="bg-[#FFFDF9] p-6 rounded-scrapbook border-2 border-dashed border-red-200 shadow-xs hover:shadow-md transition-all duration-300 relative rotate-1 hover:rotate-0 flex flex-col justify-between">
              <div>
                <div className="absolute -top-3 -right-2 bg-coral text-marinho font-display font-black text-xs w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  01
                </div>
                <div className="w-10 h-10 rounded-xl bg-coral/25 text-coral flex items-center justify-center mb-4">
                  <Heart size={20} className="fill-current" />
                </div>
                <h4 className="font-display font-bold text-lg text-marinho mb-2">Acolhimento</h4>
                <p className="text-xs text-marinho/80 leading-relaxed">
                  Muito carinho e música calma de boas-vindas para criar um ambiente acolhedor, onde a criança se sinta ouvida e segura emocionalmente.
                </p>
              </div>
              <span className="text-[10px] uppercase font-black tracking-wider text-coral/80 mt-4 block">1. Welcoming & Hug</span>
            </div>

            {/* Step 2: Músicas */}
            <div className="bg-[#FFFDF9] p-6 rounded-scrapbook border-2 border-dashed border-blue-200 shadow-xs hover:shadow-md transition-all duration-300 relative -rotate-1 hover:rotate-0 flex flex-col justify-between">
              <div>
                <div className="absolute -top-3 -right-2 bg-azulCeu text-marinho font-display font-black text-xs w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  02
                </div>
                <div className="w-10 h-10 rounded-xl bg-azulCeu/30 text-blue-600 flex items-center justify-center mb-4">
                  <Music size={20} />
                </div>
                <h4 className="font-display font-bold text-lg text-marinho mb-2">Músicas</h4>
                <p className="text-xs text-marinho/80 leading-relaxed">
                  Canções, rimas e ritmos infantis ingleses associados a mímicas corporais que incentivam a escuta atenta e aquecem a fala de forma ativa.
                </p>
              </div>
              <span className="text-[10px] uppercase font-black tracking-wider text-blue-600/80 mt-4 block">2. Songs & Rhythm</span>
            </div>

            {/* Step 3: Brincadeiras */}
            <div className="bg-[#FFFDF9] p-6 rounded-scrapbook border-2 border-dashed border-emerald-200 shadow-xs hover:shadow-md transition-all duration-300 relative rotate-1 hover:rotate-0 flex flex-col justify-between">
              <div>
                <div className="absolute -top-3 -right-2 bg-menta text-marinho font-display font-black text-xs w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  03
                </div>
                <div className="w-10 h-10 rounded-xl bg-menta/30 text-emerald-700 flex items-center justify-center mb-4">
                  <Smile size={20} />
                </div>
                <h4 className="font-display font-bold text-lg text-marinho mb-2">Brincadeiras</h4>
                <p className="text-xs text-marinho/80 leading-relaxed">
                  Jogos cooperativos lúdicos, blocos de montar e dinâmicas guiadas que tornam o idioma concreto e dão contexto real às palavras.
                </p>
              </div>
              <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800/80 mt-4 block">3. Playful Games</span>
            </div>

            {/* Step 4: Movimento */}
            <div className="bg-[#FFFDF9] p-6 rounded-scrapbook border-2 border-dashed border-amber-200 shadow-xs hover:shadow-md transition-all duration-300 relative -rotate-1 hover:rotate-0 flex flex-col justify-between">
              <div>
                <div className="absolute -top-3 -right-2 bg-amarelo text-amber-900 font-display font-black text-xs w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  04
                </div>
                <div className="w-10 h-10 rounded-xl bg-amarelo/30 text-amber-700 flex items-center justify-center mb-4">
                  <Sparkles size={20} />
                </div>
                <h4 className="font-display font-bold text-lg text-marinho mb-2">Movimento</h4>
                <p className="text-xs text-marinho/80 leading-relaxed">
                  Gincanas físicas ativas, como esconde-esconde ou circuitos de exploração, para prender a atenção e gastar energia de forma bilíngue.
                </p>
              </div>
              <span className="text-[10px] uppercase font-black tracking-wider text-amber-800/80 mt-4 block">4. Body Action</span>
            </div>

            {/* Step 5: Histórias */}
            <div className="bg-[#FFFDF9] p-6 rounded-scrapbook border-2 border-dashed border-purple-200 shadow-xs hover:shadow-md transition-all duration-300 relative rotate-1 hover:rotate-0 flex flex-col justify-between">
              <div>
                <div className="absolute -top-3 -right-2 bg-lilas text-purple-900 font-display font-black text-xs w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  05
                </div>
                <div className="w-10 h-10 rounded-xl bg-lilas/30 text-purple-600 flex items-center justify-center mb-4">
                  <BookOpen size={20} />
                </div>
                <h4 className="font-display font-bold text-lg text-marinho mb-2">Histórias</h4>
                <p className="text-xs text-marinho/80 leading-relaxed">
                  Rodas de leitura com livros ilustrados e fantoches afetuosos que dão vida a mundos imaginários e introduzem novas frases com leveza.
                </p>
              </div>
              <span className="text-[10px] uppercase font-black tracking-wider text-purple-800/80 mt-4 block">5. Storytime</span>
            </div>

            {/* Step 6: Vocabulário */}
            <div className="bg-[#FFFDF9] p-6 rounded-scrapbook border-2 border-dashed border-blue-200 shadow-xs hover:shadow-md transition-all duration-300 relative -rotate-2 hover:rotate-0 flex flex-col justify-between">
              <div>
                <div className="absolute -top-3 -right-2 bg-azulCeu text-marinho font-display font-black text-xs w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  06
                </div>
                <div className="w-10 h-10 rounded-xl bg-azulCeu/30 text-blue-600 flex items-center justify-center mb-4">
                  <Compass size={20} />
                </div>
                <h4 className="font-display font-bold text-lg text-marinho mb-2">Vocabulário</h4>
                <p className="text-xs text-marinho/80 leading-relaxed">
                  Uso prático com artes plásticas, modelagem de massinhas ou culinária lúdica baseada nos temas favoritos e prediletos da criança.
                </p>
              </div>
              <span className="text-[10px] uppercase font-black tracking-wider text-blue-800/80 mt-4 block">6. Hands-on English</span>
            </div>

            {/* Step 7: Despedida */}
            <div className="bg-[#FFFDF9] p-6 rounded-scrapbook border-2 border-dashed border-red-200 shadow-xs hover:shadow-md transition-all duration-300 relative lg:col-span-2 rotate-1 hover:rotate-0 flex flex-col justify-between">
              <div>
                <div className="absolute -top-3 -right-2 bg-coral text-marinho font-display font-black text-xs w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  07
                </div>
                <div className="w-10 h-10 rounded-xl bg-coral/25 text-coral flex items-center justify-center mb-4">
                  <Award size={20} />
                </div>
                <h4 className="font-display font-bold text-lg text-marinho mb-2">Despedida e Celebração</h4>
                <p className="text-xs text-marinho/80 leading-relaxed">
                  Música do "goodbye", organização compartilhada do espaço e a colagem de adesivos no painel de rotinas para celebrar e recompensar a conquista do dia!
                </p>
              </div>
              <span className="text-[10px] uppercase font-black tracking-wider text-coral/80 mt-4 block">7. Goodbye Routine & Star Seal</span>
            </div>

          </div>

          {/* Formatos Title area */}
          <div className="text-center space-y-3 pt-8 border-t border-marinho/5">
            <span className="text-xs font-bold tracking-widest text-coral uppercase block">Formatos Disponíveis</span>
            <h3 className="font-display font-black text-2xl md:text-4xl text-marinho">Estrutura e Formatos de Atendimento</h3>
            <p className="text-marinho/70 max-w-xl mx-auto text-sm">
              Modelos sob medida adaptados perfeitamente à rotina de desenvolvimento do seu lar.
            </p>
          </div>

          {/* Modalidades Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Atendimento Individual */}
            <div className="bg-areia/40 p-8 rounded-scrapbook relative border-2 border-marinho/5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <span className="inline-block px-3 py-1 bg-coral/20 text-marinho text-xs font-bold rounded-full mb-4">Mais Foco</span>
                <h3 className="font-display font-bold text-2xl text-marinho mb-4">Atendimento Individual</h3>
                <p className="text-sm text-marinho/70 mb-6 leading-relaxed">
                  Atenção pedagógica totalmente personalizada, respeitando os interesses, o ritmo e o desenvolvimento de cada criança. Cada encontro é planejado para transformar o inglês em uma experiência significativa, divertida e acolhedora.
                </p>
                
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center gap-2 text-marinho/80">
                    <Check size={16} className="text-emerald-500" />
                    <span>Planejamento personalizado</span>
                  </li>
                  <li className="flex items-center gap-2 text-marinho/80">
                    <Check size={16} className="text-emerald-500" />
                    <span>Material lúdico incluso</span>
                  </li>
                  <li className="flex items-center gap-2 text-marinho/80">
                    <Check size={16} className="text-emerald-500" />
                    <span>Aprendizagem no ritmo da criança</span>
                  </li>
                  <li className="flex items-center gap-2 text-marinho/80">
                    <Check size={16} className="text-emerald-500" />
                    <span>Acompanhamento próximo da família</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Duplas */}
            <div className="bg-lilas/10 p-8 rounded-scrapbook relative border-2 border-lilas/20 flex flex-col justify-between overflow-hidden hover:shadow-md transition">
              <div className="absolute top-0 right-0 bg-coral text-marinho text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Parceria
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-lilas/30 text-marinho text-xs font-bold rounded-full mb-4">Vínculo Amigável</span>
                <h3 className="font-display font-bold text-2xl text-marinho mb-4">Duplas</h3>
                <p className="text-sm text-marinho/70 mb-6 leading-relaxed">
                  Ideal para irmãos, primos ou amigos que desejam aprender juntos. Une interação social, brincadeiras cooperativas e experiências compartilhadas em inglês.
                </p>
                
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center gap-2 text-marinho/80">
                    <Check size={16} className="text-emerald-500" />
                    <span>Aprendizagem colaborativa</span>
                  </li>
                  <li className="flex items-center gap-2 text-marinho/80">
                    <Check size={16} className="text-emerald-500" />
                    <span>Jogos e desafios em dupla</span>
                  </li>
                  <li className="flex items-center gap-2 text-marinho/80">
                    <Check size={16} className="text-emerald-500" />
                    <span>Desenvolvimento da comunicação</span>
                  </li>
                  <li className="flex items-center gap-2 text-marinho/80">
                    <Check size={16} className="text-emerald-500" />
                    <span>Excelente equilíbrio entre personalização e socialização</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Pequenos Grupos */}
            <div className="bg-areia/40 p-8 rounded-scrapbook relative border-2 border-marinho/5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <span className="inline-block px-3 py-1 bg-[#9CC6E8]/30 text-marinho text-xs font-bold rounded-full mb-4">Dinâmica Coletiva</span>
                <h3 className="font-display font-bold text-2xl text-marinho mb-4">Pequenos Grupos</h3>
                <p className="text-sm text-marinho/70 mb-6 leading-relaxed">
                  Grupos reduzidos de até 5 crianças que estimulam a interação, a criatividade e a comunicação em inglês através de brincadeiras, histórias, músicas e desafios coletivos.
                </p>
                
                <ul className="space-y-3 mb-8 text-sm">
                  <li className="flex items-center gap-2 text-marinho/80">
                    <Check size={16} className="text-emerald-500" />
                    <span>Grupos pequenos</span>
                  </li>
                  <li className="flex items-center gap-2 text-marinho/80">
                    <Check size={16} className="text-emerald-500" />
                    <span>Ambiente estimulante</span>
                  </li>
                  <li className="flex items-center gap-2 text-marinho/80">
                    <Check size={16} className="text-emerald-500" />
                    <span>Atividades colaborativas</span>
                  </li>
                  <li className="flex items-center gap-2 text-marinho/80">
                    <Check size={16} className="text-emerald-500" />
                    <span>Excelente custo-benefício</span>
                  </li>
                </ul>
              </div>
            </div>

          </div>

          {/* Tipos de Atendimento e Locais */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Tipos de Atendimento Box */}
            <div className="bg-[#FFFDF9] p-8 rounded-3xl border-2 border-dashed border-red-200">
              <h4 className="font-display font-bold text-marinho text-xl mb-6 flex items-center gap-2">
                <span className="p-1.5 bg-coral/25 text-coral rounded-lg"><Laptop size={18} /></span>
                Tipos de Atendimento
              </h4>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center font-bold font-display cursor-default shrink-0 mt-0.5">
                    P
                  </div>
                  <div>
                    <h5 className="font-bold text-marinho text-sm md:text-base">Presencial</h5>
                    <p className="text-xs md:text-sm text-marinho/70 leading-relaxed mt-1">
                      Aulas presenciais com toda a ludicidade de materiais táteis, gincanas de movimento e contatos físicos reais de interação da criança.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-coral/10 text-coral flex items-center justify-center font-bold font-display cursor-default shrink-0 mt-0.5">
                    O
                  </div>
                  <div>
                    <h5 className="font-bold text-marinho text-sm md:text-base">Online</h5>
                    <p className="text-xs md:text-sm text-marinho/70 leading-relaxed mt-1">
                      Aulas remotas dinâmicas ao vivo integrando jogos pedagógicos, recursos visuais ricos e contação guiada online sem perder a conexão afetiva.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Locais de Atendimento Box */}
            <div className="bg-[#FFFDF9] p-8 rounded-3xl border-2 border-dashed border-emerald-200">
              <h4 className="font-display font-bold text-marinho text-xl mb-6 flex items-center gap-2">
                <span className="p-1.5 bg-menta/35 text-emerald-700 rounded-lg"><MapPin size={18} /></span>
                Locais de Atendimento
              </h4>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-menta/25 text-emerald-800 flex items-center justify-center font-bold font-display cursor-default shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-marinho text-sm md:text-base">Casa da criança (home school)</h5>
                    <p className="text-xs md:text-sm text-marinho/70 leading-relaxed mt-1">
                      A Teacher atende no conforto e familiaridade do lar da própria criança, estabelecendo mais segurança emocional para as brincadeiras em inglês.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-menta/25 text-emerald-800 flex items-center justify-center font-bold font-display cursor-default shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-marinho text-sm md:text-base">Local definido pela família</h5>
                    <p className="text-xs md:text-sm text-marinho/70 leading-relaxed mt-1">
                      Espaço acordado para a realização das atividades, de acordo com o interesse familiar: brinquedotecas, parques ou condomínios compartilhados.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* SEÇÃO INVESTIMENTO */}
      <section id="investimento" className="py-20 px-4 md:px-8 bg-areia relative overflow-hidden border-t-2 border-areia-dark/15">
        <div className="absolute top-10 right-10 text-coral/20 animate-pulse">
          <Sparkles size={36} />
        </div>
        <div className="absolute bottom-10 left-10 text-lilas/20">
          <Heart size={44} className="fill-current animate-bounce-slow" />
        </div>

        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-bold tracking-widest text-[#B5A1C9] uppercase block">Valores Transparentes</span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-marinho leading-tight">
              Investimento & Planos
            </h2>
            <div className="w-16 h-1 bg-amarelo mx-auto rounded-full" />
            <p className="text-sm md:text-base text-marinho/80">
              Acreditamos em transparência absoluta. Sem taxas escondidas de matrícula ou materiais — tudo incluso na mensalidade para que você planeje com tranquilidade.
            </p>
          </div>

          {/* ABAS INTERATIVAS */}
          <div className="flex justify-center items-center gap-2 max-w-sm sm:max-w-md mx-auto bg-white/60 p-1.5 rounded-2xl border border-marinho/10 shadow-xs">
            <button
              onClick={() => setPricingTab('simulator')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer ${
                pricingTab === 'simulator'
                  ? 'bg-marinho text-white shadow-md'
                  : 'text-marinho/60 hover:text-marinho hover:bg-white/40'
              }`}
            >
              📊 Simulador Interativo
            </button>
            <button
              onClick={() => setPricingTab('tables')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer  ${
                pricingTab === 'tables'
                  ? 'bg-marinho text-white shadow-md'
                  : 'text-marinho/60 hover:text-marinho hover:bg-white/40'
              }`}
            >
              📋 Tabela Completa
            </button>
          </div>

          {pricingTab === 'simulator' ? (
            /* CONTEÚDO PRINCIPAL DO SIMULADOR (INTERATIVIDADE PREMIUM) */
            <div className="max-w-4xl mx-auto bg-[#FFFDF9] p-6 md:p-10 rounded-scrapbook border-4 border-dashed border-marinho/10 shadow-xl space-y-8 animate-fade-in relative">
              <div className="absolute -top-3 right-6 px-3 py-1 bg-amarelo text-amber-950 text-[10px] font-black rounded-full uppercase tracking-wider shadow-xs animate-bounce-slow">
                ⚡ Prático e Dinâmico
              </div>

              <div className="flex items-center gap-3 border-b border-marinho/5 pb-4">
                <div className="w-10 h-10 rounded-full bg-[#FFD166]/20 text-amber-600 flex items-center justify-center font-bold text-lg">
                  🧮
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg md:text-xl text-marinho">
                    Simule o Investimento Perfeito
                  </h3>
                  <p className="text-xs text-marinho/65">
                    Escolha as preferências e obtenha o cálculo correspondente de forma instantânea.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* CONFIGURAÇÃO EXTRA */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Frequência de Aulas */}
                  <div className="space-y-3">
                    <span className="block text-xs font-bold uppercase tracking-wider text-marinho/50">
                      1. Frequência Semanal:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSimFreq(1)}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex justify-between items-center ${
                          simFreq === 1
                            ? 'bg-menta/20 border-menta text-marinho font-bold ring-2 ring-menta/40 shadow-xs'
                            : 'bg-white border-marinho/10 text-marinho/75 hover:bg-white/80 hover:border-marinho/25'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs sm:text-sm font-bold">1 Encontro Semanal 🌿</p>
                          <p className="text-[10px] text-marinho/60">Plano Essencial</p>
                        </div>
                        {simFreq === 1 && <Check size={16} className="text-emerald-700 shrink-0" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSimFreq(2)}
                        className={`p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex justify-between items-center ${
                          simFreq === 2
                            ? 'bg-lilas/20 border-lilas text-purple-950 font-bold ring-2 ring-lilas/40 shadow-xs'
                            : 'bg-white border-marinho/10 text-marinho/75 hover:bg-white/80 hover:border-marinho/25'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs sm:text-sm font-bold">2 Encontros Semanais ⭐</p>
                          <p className="text-[10px] text-marinho/60">Plano Frequência+</p>
                        </div>
                        {simFreq === 2 && <Check size={16} className="text-purple-700 shrink-0" />}
                      </button>
                    </div>
                  </div>

                  {/* Formato de Modalidade */}
                  <div className="space-y-3">
                    <span className="block text-xs font-bold uppercase tracking-wider text-marinho/50">
                      2. Formato do Atendimento (Por Criança):
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {[
                        { id: 'Individual', label: '👤 Individual / Particular', desc: 'Sessão exclusiva com foco irrestrito nos interesses do seu pequeno.', highlight: 'Foco Total' },
                        { id: 'Dupla', label: '👥 Atendimento em Dupla', desc: 'Para irmãos, primos ou amiguinhos compartilharem o encontro de forma cooperativa.', highlight: 'Social' },
                        { id: 'Pequeno Grupo', label: '🎪 Pequenos Grupos (3 a 4 crianças)', desc: 'Máxima socialização e gincanas coletivas lúdicas de inglês ao vivo.', highlight: 'Mais Dinâmico' }
                      ].map((modOpt) => {
                        const isChosen = simMod === modOpt.id;
                        return (
                          <button
                            key={modOpt.id}
                            type="button"
                            onClick={() => setSimMod(modOpt.id as any)}
                            className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex justify-between items-center ${
                              isChosen
                                ? 'bg-coral/10 border-coral text-marinho font-bold ring-2 ring-coral/30 shadow-xs'
                                : 'bg-white border-marinho/10 text-marinho/75 hover:bg-white/80 hover:border-marinho/25'
                            }`}
                          >
                            <div className="flex-1 pr-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-bold text-marinho">{modOpt.label}</span>
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  isChosen ? 'bg-coral text-white' : 'bg-marinho/5 text-marinho/50'
                                }`}>
                                  {modOpt.highlight}
                                </span>
                              </div>
                              <p className="text-[10px] text-marinho/60 mt-0.5 leading-tight">{modOpt.desc}</p>
                            </div>
                            {isChosen && <Check size={16} className="text-coral shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* PAINEL DINÂMICO DE INVESTIMENTO */}
                <div className="lg:col-span-5 bg-areia/45 border-4 border-dashed border-marinho/5 p-6 rounded-2xl flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <span className="inline-block text-[9px] font-black text-[#B5A1C9] uppercase tracking-widest bg-white px-2.5 py-1 rounded-full border border-marinho/10">
                      Mensalidade Estimada
                    </span>

                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-semibold text-marinho">R$</span>
                        <span className="text-4xl md:text-5xl font-black text-marinho tracking-tight animate-pulse-slow">
                          {getSimulatedPrice()}
                        </span>
                        <span className="text-xs font-bold text-marinho/65">/mês</span>
                      </div>
                      <p className="text-[10px] font-semibold text-marinho/60">
                        {simMod === 'Individual' ? 'Atendimento individual e exclusivo' : '* Valor unitário por criança do grupo/dupla'}
                      </p>
                    </div>

                    <div className="border-t border-marinho/5 pt-4 space-y-3">
                      <p className="text-[9px] font-extrabold text-marinho/40 uppercase tracking-widest">Incluso no Pacote:</p>
                      <ul className="space-y-2 text-xs text-marinho/80">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
                          <span><strong>{simFreq === 1 ? '4 encontros' : '8 encontros'} mensais</strong> de ~1 hora cada.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
                          <span>Todo o material de arte, tátil e papelaria pedagógica incluso.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
                          <span>Planejamento estritamente individual baseado nos interesses do aluno.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-coral mt-1.5 shrink-0" />
                          <span>Atendimento em Porto Velho (domicílio ou condomínio acordado).</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-2 text-center">
                    <a
                      href={`https://wa.me/5569992512267?text=Olá%20Teacher%20Carla!%20Fiz%20a%20simulação%20no%20site%20da%20mensalidade%20de%20R$%20${getSimulatedPrice()}/mês%20para%20o%20Plano%20${simFreq === 1 ? 'Essencial' : 'Frequência+'}+(${simFreq === 1 ? '1x' : '2x'}%20por%20semana)%20na%20modalidade%20${simMod}.%20Gostaria%20de%20tirar%20mais%20dúvidas!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-[#25D366] hover:bg-[#20BA56] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      Reservar via WhatsApp 💬
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setModalData(prev => ({
                          ...prev,
                          preferredModality: simMod,
                          preferredFrequency: simFreq === 1 ? '1 vez por semana' : '2 vezes por semana',
                        }));
                        setModalType('proposal');
                        setIsModalOpen(true);
                      }}
                      className="w-full py-2.5 bg-marinho hover:bg-marinho/90 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      Preencher Formulário ✨
                    </button>
                  </div>
                </div>
              </div>

              {/* Banner de bônus lúdico para aula experimental */}
              <div className="bg-lilas/10 rounded-xl p-4 border border-dashed border-lilas/40 flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left">
                <div className="space-y-0.5">
                  <h4 className="font-display font-bold text-xs sm:text-sm text-marinho flex items-center justify-center sm:justify-start gap-1">
                    🎈 Quer experimentar primeiro? Realize uma vivência prática!
                  </h4>
                  <p className="text-[10px] sm:text-xs text-marinho/70">
                    Agende nossa Aula Experimental por apenas R$ 50. Se matricular em até 7 dias, devolvemos/abatemos o valor!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalType('experimental');
                    setIsModalOpen(true);
                  }}
                  className="bg-lilas text-purple-950 hover:bg-lilas/90 font-black text-[10px] uppercase tracking-wider px-4 py-2 rounded-lg cursor-pointer transition-colors shrink-0"
                >
                  Agendar Aula de R$ 50 🌟
                </button>
              </div>

            </div>
          ) : (
            /* TABELA DETALHADA TRADICIONAL */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto animate-fade-in">
              
              {/* CARD 1: Plano Essencial */}
              <div className="bg-[#FFFDF9] p-8 rounded-scrapbook border-2 border-dashed border-emerald-200/80 shadow-xs hover:shadow-md transition-all duration-300 relative flex flex-col justify-between">
                <div>
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-menta text-emerald-950 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Leveza & Consistência
                  </div>
                  <h3 className="font-display font-bold text-xl text-marinho mt-2 mb-1 flex items-center gap-2">
                    Plano Essencial 🌿
                  </h3>
                  <p className="text-xs font-semibold text-[#66C39E] uppercase tracking-wider mb-4">
                    1 encontro semanal (~1 hora)
                  </p>
                  <p className="text-xs text-marinho/70 leading-relaxed mb-6">
                    Ideal para estabelecer um contato leve, constante e caloroso com o idioma de forma regular.
                  </p>
                  
                  <div className="border-t border-marinho/5 pt-4 space-y-3">
                    <span className="text-[10px] font-bold uppercase text-marinho/50 block">Valores Mensais:</span>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-white/50 p-2.5 rounded-lg border border-marinho/5">
                        <span className="text-xs font-bold text-marinho">Individual</span>
                        <span className="text-xs font-black text-marinho bg-menta/30 px-2 py-1 rounded">R$ 420/mês</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/50 p-2.5 rounded-lg border border-marinho/5">
                        <span className="text-xs font-bold text-marinho">Dupla</span>
                        <span className="text-xs font-black text-marinho bg-menta/30 px-2 py-1 rounded">R$ 300/mês <span className="text-[9px] font-normal text-marinho/60">por criança</span></span>
                      </div>
                      <div className="flex justify-between items-center bg-white/50 p-2.5 rounded-lg border border-marinho/5">
                        <span className="text-xs font-bold text-marinho">Pequenos Grupos</span>
                        <span className="text-xs font-black text-marinho bg-menta/30 px-2 py-1 rounded">R$ 220/mês <span className="text-[9px] font-normal text-marinho/60">por criança</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-marinho/5 pt-4 mt-6">
                  <button
                    onClick={() => {
                      setSimFreq(1);
                      setSimMod('Individual');
                      setModalData(prev => ({ ...prev, preferredModality: 'Individual', preferredFrequency: '1 vez por semana' }));
                      setModalType('proposal');
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-marinho text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-marinho/90 transition-all cursor-pointer text-center"
                  >
                    Selecionar Plano Essencial
                  </button>
                </div>
              </div>

              {/* CARD 2: Plano Frequência+ */}
              <div className="bg-[#FFFDF9] p-8 rounded-scrapbook border-2 border-dashed border-purple-200 shadow-md hover:shadow-lg transition-all duration-300 relative flex flex-col justify-between transform lg:scale-105">
                <div className="absolute -top-3.5 left-6 px-3 py-1 bg-lilas text-purple-950 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Sparkles size={10} className="text-amarelo" />
                  Maior Imersão
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-marinho mt-2 mb-1 flex items-center gap-2">
                    Plano Frequência+ ⭐
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-4">
                    2 encontros semanais (~1 hora)
                  </p>
                  <p className="text-xs text-marinho/70 leading-relaxed mb-6">
                    Recomendado para acelerar a aquisição vocabular e a familiaridade do canal auditivo com o idioma.
                  </p>
                  
                  <div className="border-t border-marinho/5 pt-4 space-y-3">
                    <span className="text-[10px] font-bold uppercase text-marinho/50 block">Valores Mensais:</span>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-marinho/10 shadow-xs">
                        <span className="text-xs font-bold text-marinho">Individual</span>
                        <span className="text-xs font-black text-marinho bg-lilas/40 px-2 py-1 rounded">R$ 750/mês</span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-marinho/10 shadow-xs">
                        <span className="text-xs font-bold text-marinho">Dupla</span>
                        <span className="text-xs font-black text-marinho bg-lilas/40 px-2 py-1 rounded">R$ 520/mês <span className="text-[9px] font-normal text-marinho/60">por criança</span></span>
                      </div>
                      <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-marinho/10 shadow-xs">
                        <span className="text-xs font-bold text-marinho">Pequenos Grupos</span>
                        <span className="text-xs font-black text-marinho bg-lilas/40 px-2 py-1 rounded">R$ 380/mês <span className="text-[9px] font-normal text-marinho/60">por criança</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-marinho/5 pt-4 mt-6">
                  <button
                    onClick={() => {
                      setSimFreq(2);
                      setSimMod('Individual');
                      setModalData(prev => ({ ...prev, preferredModality: 'Individual', preferredFrequency: '2 vezes por semana' }));
                      setModalType('proposal');
                      setIsModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-marinho text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-marinho/90 transition-all cursor-pointer text-center"
                  >
                    Selecionar Plano Frequência+ ⭐
                  </button>
                </div>
              </div>

              {/* CARD 3: Aula Experimental */}
              <div className="bg-[#FFFDF9] p-8 rounded-scrapbook border-2 border-dashed border-[#FFB6A6]/80 shadow-xs hover:shadow-md transition-all duration-300 relative flex flex-col justify-between">
                <div>
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-[#FFB6A6] text-marinho text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Primeiro Encontro
                  </div>
                  <h3 className="font-display font-bold text-xl text-marinho mt-2 mb-1 flex items-center gap-2">
                    Aula Experimental 🎈
                  </h3>
                  <p className="text-xs font-semibold text-[#E07A5F] uppercase tracking-wider mb-4">
                    Vivência Prática Única
                  </p>
                  <p className="text-xs text-marinho/70 leading-relaxed mb-6">
                    Um primeiro encontro para conhecer a criança, compreender seus interesses e apresentar a proposta do Pequenos Bilíngues de forma leve e acolhedora.
                  </p>
                  
                  <div className="border-t border-marinho/5 pt-4 space-y-3">
                    <span className="text-[10px] font-bold uppercase text-marinho/50 block">Valor da Vivência:</span>
                    <div className="bg-[#FFB6A6]/10 border-2 border-dashed border-[#FFB6A6]/40 p-4 rounded-xl text-center space-y-1">
                      <span className="text-2xl font-black text-marinho inline-block">R$ 50</span>
                      <p className="text-[10px] text-marinho/70 font-medium leading-normal">
                        O valor pago será totalmente <span className="font-bold text-coral underline">deduzido / abatido</span> da primeira mensalidade se a matrícula for efetuada em até 7 dias.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#FFB6A6]/20 pt-4 mt-6">
                  <button
                    onClick={() => {
                      setModalType('experimental');
                      setIsModalOpen(true);
                    }}
                    className="w-full py-3 bg-[#FFB6A6] hover:bg-[#FFB6A6]/95 text-marinho font-black text-xs uppercase tracking-widest rounded-xl shadow-md transition-all cursor-pointer text-center"
                  >
                    Agendar Aula Experimental 🎈
                  </button>
                </div>
              </div>

            </div>
          )}

          <div className="text-center space-y-4 max-w-2xl mx-auto pt-6">
            <p className="text-xs text-marinho/70 font-semibold leading-relaxed">
              * Todos os valores incluem planejamento pedagógico, materiais utilizados nas atividades e atendimento dentro da zona urbana de Porto Velho. Online é uma modalidade complementar de aula particular de inglês infantil.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <a 
                href="https://wa.me/5569992512267?text=Olá%20Teacher%20Carla!%20Tenho%20algumas%20dúvidas%20sobre%20os%20planos%20do%20Pequenos%20Bilíngues."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-[#25D366] gap-2 bg-[#25D366] hover:bg-[#20BA56] text-white font-bold text-sm px-6 py-3 rounded-full shadow hover:shadow-md transition-all cursor-pointer animate-pulse"
              >
                Falar Conosco no WhatsApp 💬
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* SEÇÃO HORÁRIOS DISPONÍVEIS */}
      <section id="horarios" className="py-20 px-4 md:px-8 bg-white relative overflow-hidden border-t-2 border-areia-dark/15">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold tracking-widest text-[#B5A1C9] uppercase">Disponibilidade</span>
            <h2 className="font-display font-black text-3xl md:text-5xl text-marinho">Horários Atuais</h2>
            <div className="w-16 h-1 bg-amarelo mx-auto rounded-full" />
            <p className="text-marinho/70 text-sm max-w-xl mx-auto">Compatibilidades de calendário para o planejamento do seu lar.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Visual Highlight Card */}
            <div className="bg-areia/40 p-8 md:p-10 rounded-scrapbook border-4 border-dashed border-amarelo/80 shadow-xl relative">
              {/* Sticker badge decoration */}
              <div className="absolute -top-5 -right-3 bg-coral text-marinho font-display font-black text-xs px-4 py-2 rounded-full shadow-md -rotate-6">
                VAGAS LIMITADAS 👑
              </div>
              
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="w-14 h-14 rounded-full bg-amarelo/30 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock size={28} />
                </div>
                
                <div className="space-y-6 text-left flex-1">
                  <h3 className="font-display font-black text-xl md:text-2xl text-marinho text-center sm:text-left">
                    Horários atualmente disponíveis
                  </h3>
                  
                  <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-amarelo/35 text-marinho/90 text-sm md:text-base leading-relaxed space-y-4">
                    <p className="font-bold text-coral text-xs uppercase tracking-widest">
                      Atualmente os atendimentos estão disponíveis:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-coral inline-block shrink-0" />
                        <span className="font-semibold text-marinho">Aos sábados (manhã e tarde)</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-coral inline-block shrink-0" />
                        <span className="font-semibold text-marinho">Durante a semana após as 18h30</span>
                      </li>
                    </ul>
                    
                    <p className="text-xs text-marinho/60 pt-3 border-t border-marinho/5 font-medium italic">
                      Novos horários serão disponibilizados futuramente conforme a expansão do projeto.
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="px-3 py-1 bg-menta/30 text-emerald-900 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs">
                      📅 Sábados (Manhã e Tarde)
                    </span>
                    <span className="px-3 py-1 bg-azulCeu/30 text-blue-900 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs">
                      ⏰ Seg a Sex (Após 18h30)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO PERGUNTAS FREQUENTES */}
      <section id="faq" className="py-20 bg-white px-4 md:px-8 border-t-2 border-areia-dark/15">
        <div className="max-w-4xl mx-auto">
          
          <div className="text-center space-y-3 mb-16">
            <span className="text-xs font-bold tracking-widest text-[#FFB6A6] uppercase">Tem Dúvidas?</span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-marinho">Perguntas Frequentes</h2>
            <p className="text-marinho/70 text-sm">Respostas para as principais dúvidas sobre nossa dinâmica pedagógica de inglês para crianças, valores e rotina bilíngue.</p>
          </div>

          {/* BARRA DE PESQUISA INTERATIVA DE DÚVIDAS */}
          <div className="max-w-2xl mx-auto mb-10 relative px-2">
            <div className="relative">
              <input
                type="text"
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                placeholder="Busque sua dúvida (ex: valor, idade, reposição, presencial...)"
                className="w-full bg-[#FFFDF9] border-2 border-marinho/10 p-4 pl-12 pr-16 rounded-2xl focus:border-[#FFB6A6] focus:ring-2 focus:ring-[#FFB6A6]/20 outline-none text-xs sm:text-sm md:text-base text-marinho shadow-sm placeholder:text-marinho/40 transition-all font-medium"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-marinho/40 text-lg">
                🔍
              </span>
              {faqSearch && (
                <button
                  type="button"
                  onClick={() => setFaqSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-marinho/5 hover:bg-marinho/15 text-marinho/60 px-2 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {(() => {
              const allFaqs = [
                {
                  q: "Qual o valor das aulas?",
                  a: "Acreditamos em transparência absoluta! O Plano Essencial (1 encontro semanal de ~1 hora) custa R$ 420/mês para atendimento Individual, R$ 300/mês por criança em Dupla, e R$ 220/mês por criança em Pequenos Grupos. Já o Plano Frequência+ (2 encontros semanais de ~1 hora) custa R$ 750/mês Individual, R$ 520/mês por criança em Dupla, e R$ 380/mês por criança em Pequenos Grupos. Todos os valores incluem planejamento individual do aluno e materiais lúdicos específicos."
                },
                {
                  q: "Como funciona a aula experimental?",
                  a: "A aula experimental é uma vivência prática única de aproximadamente 1 hora que custa R$ 50. Seu principal objetivo é permitir que a Teacher Carla conheça os interesses específicos e nível de engajamento da criança, elaborando um primeiro diagnóstico lúdico. Caso a matrícula seja realizada em até 7 dias, o valor de R$ 50 pago pela aula experimental será integralmente abatido/deduzido da primeira mensalidade do plano contratado!"
                },
                {
                  q: "O material está incluso?",
                  a: "Sim, absolutamente! Todo o material lúdico e pedagógico personalizado (atividades táteis, crafts de arte, gincanas motoras e brinquedos adaptados) está 100% incluso nos valores. Você não paga nenhuma taxa de matrícula ou material didático à parte."
                },
                {
                  q: "O atendimento é presencial?",
                  a: "Sim! Prestamos serviços presenciais e domiciliares com toda a ludicidade necessária no lar da criança ou em locais designados consensualmente (parques, condomínios), abrangendo toda a zona urbana do município de Porto Velho - RO."
                },
                {
                  q: "Existe atendimento online?",
                  a: "Sim! Disponibilizamos aulas particulares remotas/online ativas ao vivo como modalidade complementar ou principal dependendo da flexibilidade exigida pelo lar da família, fazendo uso de recursos digitais interativos e fantásticos sem comprometer a conexão emocional."
                },
                {
                  q: "A partir de qual idade?",
                  a: "Nossos encontros são planejados sob medida para crianças a partir de 2 anos. Atuamos com a plasticidade e absorção natural típica da primeira infância por meio de brincadeiras dinâmicas e afetuosas."
                },
                {
                  q: "Como funcionam as reposições?",
                  a: "Buscando organizar nossa rota logística em Porto Velho, solicitamos aviso de cancelamento ou remarcação com no mínimo 12 horas de antecedência. Isso nos permite reorganizar a agenda logística com serenidade."
                }
              ];

              const filteredFaqs = allFaqs.filter(faq => {
                const query = faqSearch.toLowerCase().trim();
                if (!query) return true;
                return faq.q.toLowerCase().includes(query) || faq.a.toLowerCase().includes(query);
              });

              if (filteredFaqs.length === 0) {
                return (
                  <div className="text-center p-8 bg-[#FFFDF9] rounded-2xl border-2 border-dashed border-marinho/10 text-marinho/60 space-y-1 max-w-xl mx-auto animate-fade-in animate-pulse">
                    <p className="text-sm font-bold">Nenhuma resposta encontrada para "{faqSearch}" 🎈</p>
                    <p className="text-xs">Tente buscar por termos como "valor", "idade", "presencial" ou "material".</p>
                  </div>
                );
              }

              return filteredFaqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div 
                    key={idx} 
                    className="bg-[#FFFDF9] rounded-2xl border border-marinho/10 shadow-xs transition duration-200 overflow-hidden"
                  >
                    <button 
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left p-5 md:p-6 flex justify-between items-center gap-4 outline-none font-display font-bold text-base md:text-lg text-marinho cursor-pointer hover:bg-areia/20 transition-colors"
                    >
                      <span className="flex items-center gap-3">
                        <HelpCircle size={18} className="text-coral shrink-0" />
                        {faq.q}
                      </span>
                      <span className="text-marinho/50 shrink-0">
                        {isOpen ? <ChevronDown size={20} className="transform rotate-180 transition-transform duration-200" /> : <ChevronRight size={20} />}
                      </span>
                    </button>
                    
                    {isOpen && (
                      <div className="px-5 pb-6 md:px-6 md:pb-6 text-sm md:text-base text-marinho/80 leading-relaxed border-t border-marinho/5 animate-fade-in pt-4 bg-white/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>

          {/* Instagram Banner within FAQ */}
          <div className="mt-12 bg-coral/10 rounded-2xl p-6 text-center border-2 border-dashed border-coral/30 space-y-3">
            <p className="text-sm font-bold text-marinho flex items-center justify-center gap-2">
              <Instagram size={20} className="text-coral animate-pulse" />
              Acompanhe nossas aulas e bastidores em tempo real!
            </p>
            <p className="text-xs text-marinho/70">
              Postamos dinâmicas de play-based learning, rotinas visuais e as conquistas dos pequenos diariamente.
            </p>
            <a 
              href="https://instagram.com/teacher.carlacristina" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block bg-[#FFB6A6] text-marinho hover:bg-[#FFB6A6]/90 font-black text-xs px-5 py-2.5 rounded-full shadow transition-all cursor-pointer uppercase tracking-wider"
            >
              Seguir no @teacher.carlacristina 📸
            </a>
          </div>

        </div>
      </section>

      {/* SECTION CONTATO */}
      <section id="contato" className="py-20 px-4 md:px-8 bg-areia relative overflow-hidden">
        
        {/* Background blobs */}
        <div className="absolute bottom-0 left-10 w-48 h-48 bg-coral/10 organic-blob-1 -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Form Info text */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold tracking-widest text-[#FFB6A6] uppercase">Agende uma conversa</span>
            
            <h2 className="font-display font-bold text-3xl md:text-4xl text-marinho">
              Pronto para iniciar essa jornada lúdica?
            </h2>

            <p className="text-marinho/80 leading-relaxed">
              Deixe suas informações ao lado para conversar com a Teacher Carla, tirar suas dúvidas e dar o primeiro passo para o inglês lúdico. Retornaremos em breve via WhatsApp!
            </p>

            <div className="space-y-4 pt-4 border-t border-marinho/10 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#A8D5C2]/30 flex items-center justify-center text-marinho"><Phone size={16} /></div>
                <span className="font-semibold text-marinho">(69) 99251-2267 (WhatsApp)</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-azulCeu/30 flex items-center justify-center text-marinho"><Mail size={16} /></div>
                <span className="font-semibold text-marinho">contact.pequenosbilingues@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FFB6A6]/30 flex items-center justify-center text-[#E07A5F]"><Instagram size={16} /></div>
                <a 
                  href="https://instagram.com/teacher.carlacristina" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-semibold text-marinho hover:underline"
                >
                  @teacher.carlacristina 📸
                </a>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-10 rounded-scrapbook shadow-xl border-4 border-dashed border-amarelo/30">
              
              <h3 className="font-display font-bold text-2xl text-marinho mb-6 flex items-center gap-2">
                🎈 Solicitar Informações
              </h3>

              {formSubmitted ? (
                <div className="bg-[#A8D5C2]/20 border border-menta text-marinho p-6 sm:p-8 rounded-2xl text-center space-y-4">
                  <div className="w-14 h-14 bg-[#A8D5C2] rounded-full flex items-center justify-center text-marinho mx-auto shadow-xs">
                    <Check size={28} />
                  </div>
                  <h4 className="font-display font-black text-xl text-marinho">Mensagem Recebida! 🎉</h4>
                  <p className="text-sm md:text-base text-marinho/90 font-semibold leading-relaxed">
                    Recebemos seu contato com sucesso! Em breve entraremos em contato via WhatsApp para conversar e agendar o primeiro encontro lúdico de inglês.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-marinho/60 mb-1.5 uppercase">Nome Completo *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-marinho/40" />
                      <input 
                        type="text" 
                        name="parentName"
                        required
                        value={formData.parentName}
                        onChange={handleInputChange}
                        placeholder="Ex: Mariana Silva"
                        className="w-full bg-[#F7F1E6]/40 pl-10 pr-4 py-2.5 rounded-xl border border-marinho/10 focus:border-coral outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-marinho/60 mb-1.5 uppercase">WhatsApp *</label>
                      <div className="relative">
                        <MessageSquare size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-marinho/40" />
                        <input 
                          type="tel" 
                          name="whatsapp"
                          required
                          value={formData.whatsapp}
                          onChange={handleInputChange}
                          placeholder="Ex: (69) 99251-2267"
                          className="w-full bg-[#F7F1E6]/40 pl-10 pr-4 py-2.5 rounded-xl border border-marinho/10 focus:border-coral outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-marinho/60 mb-1.5 uppercase">E-mail</label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-marinho/40" />
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Ex: mae@exemplo.com"
                          className="w-full bg-[#F7F1E6]/40 pl-10 pr-4 py-2.5 rounded-xl border border-marinho/10 focus:border-coral outline-none text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-marinho/60 mb-1.5 uppercase">Mensagem</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Deixe aqui suas principais dúvidas, interesses ou dia ideal de contato..."
                      className="w-full bg-[#F7F1E6]/40 p-4 rounded-xl border border-marinho/10 focus:border-coral outline-none text-sm h-28 resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-marinho hover:bg-marinho/95 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-transform focus:scale-[0.98] outline-none cursor-pointer"
                  >
                    Solicitar Informações ✨
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-marinho text-areia py-12 px-4 md:px-8 border-t-4 border-coral/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-white/10">
          
          {/* Logo brand & slogan */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2 group">
              <RainbowLogo className="w-12 h-12 drop-shadow-xs bg-white/10 p-1.5 rounded-full" />
              <div>
                <span className="font-display font-medium text-lg text-white block">Pequenos Bilíngues</span>
                <span className="block text-[10px] text-[#FFB6A6] font-bold uppercase tracking-widest">Inglês Lúdico</span>
              </div>
            </div>
            <p className="text-sm text-areia/80 italic">
              "Porque aprender pode ser leve."
            </p>
            <p className="text-xs text-areia/65 leading-relaxed">
              Aula particular de inglês infantil em Porto Velho baseada nos pilares do play based learning, educação bilíngue e aprendizado ativo sob medida.
            </p>
          </div>

          {/* Quick Menu */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-[#FFB6A6]">Menu Rápido</h4>
            <ul className="space-y-2 text-xs md:text-sm text-areia/75">
              <li><a href="#sobre" className="hover:text-white transition-colors">Sobre o Projeto</a></li>
              <li><a href="#professora" className="hover:text-white transition-colors">Teacher Carla</a></li>
              <li><a href="#metodologia" className="hover:text-white transition-colors">Abordagem Lúdica</a></li>
              <li><a href="#como-funciona" className="hover:text-white transition-colors">Como Funciona</a></li>
              <li><a href="#horarios" className="hover:text-white transition-colors">Horários</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Dúvidas Frequentes</a></li>
            </ul>
          </div>

          {/* Contact Details & Instagram Profile */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-[#FFB6A6]">Contatos Diretos</h4>
            <div className="space-y-3 text-xs md:text-sm text-areia/80">
              <div className="flex items-center gap-2">
                <Instagram size={16} className="text-coral" />
                <a 
                  href="https://instagram.com/teacher.carlacristina" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white hover:underline transition"
                >
                  @teacher.carlacristina
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400">💬</span>
                <span>WhatsApp: <a href="https://wa.me/5569992512267?text=Olá%20Teacher%20Carla!%20Gostaria%20de%20receber%20informações%20sobre%20o%20Pequenos%20Bilíngues." className="font-bold hover:underline" target="_blank" rel="noopener noreferrer">(69) 99251-2267</a></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#9CC6E8]" />
                <a href="mailto:contact.pequenosbilingues@gmail.com" className="hover:text-white hover:underline">
                  contact.pequenosbilingues@gmail.com
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => {
                  setModalType('proposal');
                  setIsModalOpen(true);
                }}
                className="bg-[#FFB6A6] text-marinho hover:bg-[#FFB6A6]/90 font-display font-black text-xs px-5 py-2.5 rounded-full shadow transition-all cursor-pointer"
              >
                Receber Proposta 📄
              </button>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-areia/45 pt-6">
          <p>© 2026 Pequenos Bilíngues. Desenvolvido para a captação e gestão profissional de aulas particulares infantis.</p>
          <div className="flex items-center gap-4">
            <span>Porto Velho - RO</span>
            <span className="text-white/10">|</span>
            <button 
              onClick={onNavigateToLogin}
              className="text-areia/45 hover:text-[#FFB6A6] transition-colors text-[10px] uppercase font-bold tracking-widest cursor-pointer"
              id="discrete_admin_link"
              title="Acesso da Professora para Relatórios"
            >
              Acesso do Professor 🔐
            </button>
          </div>
        </div>
      </footer>

      {/* ADAPTIVE MODAL (AGENDAR AULA EXPERIMENTAL OR RECEBER PROPOSTA) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-scrapbook shadow-2xl border-4 border-dashed border-menta max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 relative">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-marinho/60 hover:text-marinho font-bold text-xl px-2.5 py-1 hover:bg-areia rounded-full cursor-pointer transition-colors"
            >
              ✕
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="mx-auto w-12 h-12 bg-menta/30 text-emerald-800 rounded-full flex items-center justify-center">
                {modalType === 'proposal' ? <Tag size={24} className="text-[#FFB6A6]" /> : <Calendar size={24} className="text-[#A8D5C2]" />}
              </div>
              <h3 className="font-display font-black text-2xl text-marinho">
                {modalType === 'proposal' ? 'Receber Proposta' : 'Agendar Aula Experimental'}
              </h3>
              <p className="text-xs md:text-sm text-marinho/60 leading-relaxed">
                {modalType === 'proposal' 
                  ? 'Preencha suas preferências abaixo para receber por e-mail nossa proposta de forma direta.'
                  : 'Preencha as informações para agendar uma vivência prática lúdica em Porto Velho.'
                }
              </p>
            </div>

            {modalSubmitted ? (
              <div className="bg-menta/20 border border-menta text-marinho p-6 sm:p-8 rounded-2xl text-center space-y-4 my-6">
                <div className="w-16 h-16 bg-[#A8D5C2] rounded-full flex items-center justify-center mx-auto text-marinho shadow-md">
                  <Check size={32} />
                </div>
                <h4 className="font-display font-bold text-xl text-marinho">Sucesso! 🎉</h4>
                <p className="text-sm md:text-base text-marinho/90 font-semibold leading-relaxed">
                  Recebemos sua mensagem! Em breve entraremos em contato para apresentar o Pequenos Bilíngues e esclarecer todas as suas dúvidas.
                </p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-4">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-marinho/60 mb-1.5 uppercase">Seu Nome *</label>
                    <input 
                      type="text" 
                      name="parentName"
                      required
                      value={modalData.parentName}
                      onChange={handleModalInputChange}
                      placeholder="Ex: Mariana Silva"
                      className="w-full bg-areia/40 border border-marinho/10 p-2.5 rounded-xl focus:border-menta outline-none text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-marinho/60 mb-1.5 uppercase">Nome da Criança *</label>
                    <input 
                      type="text" 
                      name="childName"
                      required
                      value={modalData.childName}
                      onChange={handleModalInputChange}
                      placeholder="Ex: Arthur"
                      className="w-full bg-areia/40 border border-marinho/10 p-2.5 rounded-xl focus:border-menta outline-none text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-marinho/60 mb-1.5 uppercase">Idade da Criança *</label>
                    <input 
                      type="text" 
                      name="childAge"
                      required
                      value={modalData.childAge}
                      onChange={handleModalInputChange}
                      placeholder="Ex: 4 anos"
                      className="w-full bg-areia/40 border border-marinho/10 p-2.5 rounded-xl focus:border-menta outline-none text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-marinho/60 mb-1.5 uppercase">Modalidade Desejada</label>
                    <select
                      name="preferredModality"
                      value={modalData.preferredModality}
                      onChange={handleModalInputChange}
                      className="w-full bg-areia/40 border border-marinho/10 p-2.5 rounded-xl focus:border-menta outline-none text-xs sm:text-sm cursor-pointer"
                    >
                      <option value="Individual">Individual (Presencial/Online)</option>
                      <option value="Dupla">Em Dupla</option>
                      <option value="Pequeno Grupo">Pequeno Grupo</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-marinho/60 mb-1.5 uppercase">WhatsApp *</label>
                    <input 
                      type="tel" 
                      name="whatsapp"
                      required
                      value={modalData.whatsapp}
                      onChange={handleModalInputChange}
                      placeholder="Ex: (69) 99251-2267"
                      className="w-full bg-areia/40 border border-marinho/10 p-2.5 rounded-xl focus:border-menta outline-none text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-marinho/60 mb-1.5 uppercase">E-mail</label>
                    <input 
                      type="email" 
                      name="email"
                      value={modalData.email}
                      onChange={handleModalInputChange}
                      placeholder="Ex: pai@exemplo.com"
                      className="w-full bg-areia/40 border border-marinho/10 p-2.5 rounded-xl focus:border-menta outline-none text-xs sm:text-sm"
                    />
                  </div>
                </div>

                {/* Conditional Fields based on form goals */}
                {modalType === 'proposal' ? (
                  <div>
                    <label className="block text-xs font-bold text-marinho/60 mb-1.5 uppercase">Frequência Desejada</label>
                    <select
                      name="preferredFrequency"
                      value={modalData.preferredFrequency}
                      onChange={handleModalInputChange}
                      className="w-full bg-areia/40 border border-marinho/10 p-2.5 rounded-xl focus:border-menta outline-none text-xs sm:text-sm cursor-pointer"
                    >
                      <option value="1 vez por semana">1 encontro por semana</option>
                      <option value="2 vezes por semana">2 encontros por semana</option>
                      <option value="Frequência adaptada">Frequência adaptada sob demanda</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-marinho/60 mb-1.5 uppercase">Melhor dia/horário para contato</label>
                    <input 
                      type="text" 
                      name="bestDay"
                      value={modalData.bestDay}
                      onChange={handleModalInputChange}
                      placeholder="Ex: Sábados de manhã, Segunda à tarde..."
                      className="w-full bg-areia/40 border border-marinho/10 p-2.5 rounded-xl focus:border-menta outline-none text-xs sm:text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1.5 uppercase">Observações adicionais</label>
                  <textarea 
                    name="notes"
                    value={modalData.notes}
                    onChange={handleModalInputChange}
                    placeholder="Conte-nos sobre o atual nível ou interesses especiais da criança..."
                    className="w-full bg-areia/40 border border-marinho/10 p-3 rounded-xl focus:border-menta outline-none text-xs sm:text-sm h-20 resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="w-1/2 border border-marinho/25 text-marinho font-bold py-3 rounded-xl hover:bg-areia cursor-pointer transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    type="submit" 
                    className="w-1/2 bg-marinho text-white font-bold py-3 rounded-xl hover:bg-marinho/90 cursor-pointer transition-all"
                  >
                    Enviar Dados ✨
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* BUTTON BACK TO TOP */}
      {showScrollTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 bg-[#FFFDF9] text-marinho p-3.5 rounded-full shadow-2xl border-2 border-dashed border-marinho/25 hover:border-marinho/60 hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 animate-fade-in group hover:bg-[#FFF] hover:text-coral"
          title="Ir ao topo de volta de forma lúdica"
          id="back_to_top_button"
        >
          <ArrowUp size={20} className="animate-pulse" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out font-display font-black text-xs uppercase tracking-wider whitespace-nowrap">
            Ir ao Topo! 🎈
          </span>
        </button>
      )}

      {/* FLOATING WHATSAPP BUTTON */}
      <a 
        href="https://wa.me/5569992512267?text=Olá%20Teacher%20Carla!%20Gostaria%20de%20receber%20informações%20sobre%20o%20Pequenos%20Bilíngues."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:bg-[#20BA56] hover:scale-110 transition-all duration-300 group flex items-center gap-2"
        title="Fale Conosco no WhatsApp"
        id="floating_whatsapp_btn"
      >
        <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping -z-10 group-hover:hidden" />
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.62.962 3.41 1.47 5.258 1.471 5.485 0 9.948-4.469 9.952-9.956.002-2.657-1.02-5.155-2.877-7.016C17.066 1.792 14.582.77 11.917.77 6.438.77 1.979 5.237 1.975 10.724c-.001 1.84.482 3.633 1.4 5.228l-.99 3.619 3.71-.973zm11.233-7.234c-.31-.155-1.833-.904-2.112-1.006-.279-.101-.483-.153-.686.153-.203.306-.787.992-.965 1.196-.178.204-.356.229-.666.074-.31-.155-1.31-.483-2.495-1.539-.922-.821-1.544-1.835-1.724-2.143-.18-.306-.019-.472.136-.626.139-.138.31-.362.465-.543.155-.181.206-.31.31-.517.103-.207.052-.388-.026-.543-.078-.155-.686-1.65-.94-2.26-.247-.595-.499-.514-.686-.524-.178-.008-.381-.01-.584-.01-.203 0-.533.076-.813.382-.28.306-1.067 1.042-1.067 2.542 0 1.5 1.092 2.946 1.244 3.15.152.204 2.149 3.282 5.205 4.602.727.314 1.294.502 1.737.643.73.232 1.394.2 1.918.122.584-.087 1.833-.749 2.087-1.474.254-.725.254-1.346.178-1.474-.076-.127-.279-.203-.589-.358z"/>
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out font-bold text-sm whitespace-nowrap">
          Tenho Dúvidas!
        </span>
      </a>

      {/* GLOBAL TRANSMISSION NOTIFICATION POPUP (DADOS ENVIADOS STATUS BUBBLE) */}
      {submissionStatus && (
        <div className="fixed top-24 right-4 z-50 max-w-sm w-full bg-[#FFFDF9] text-marinho rounded-scrapbook border-4 border-dashed border-menta/50 shadow-2xl p-5 animate-fade-in space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="text-xl">📬</span>
              <span className="font-display font-black text-sm text-marinho uppercase tracking-wider">Status do Envio</span>
            </div>
            <button 
              onClick={() => setSubmissionStatus(null)}
              className="text-marinho/40 hover:text-marinho font-bold text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1.5 text-xs">
            {submissionStatus.status === 'sending' && (
              <div className="flex items-center gap-2 text-amber-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <span>Enviando dados para o servidor...</span>
              </div>
            )}
            {submissionStatus.status === 'success' && (
              <div className="space-y-1">
                <p className="text-emerald-700 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                  ● DADOS ENVIADOS COM SUCESSO!
                </p>
                <p className="text-marinho/80 leading-relaxed font-semibold">
                  {submissionStatus.message}
                </p>
                <p className="text-[10px] text-coral font-bold uppercase tracking-wider mt-1 block">
                  Destinatário: contact.pequenosbilingues@gmail.com
                </p>
              </div>
            )}
            {submissionStatus.status === 'error' && (
              <div className="space-y-1">
                <p className="text-rose-600 font-black text-xs uppercase tracking-widest flex items-center gap-1.5">
                  ● DADOS GRAVADOS NO CRM
                </p>
                <p className="text-marinho/80 leading-relaxed font-semibold">
                  {submissionStatus.message}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REAL EMAIL AUTOMATION REPORT (TOAST CONSOLE) - EXCLUSIVO PARA ADMINISTRADOR OU CONTESTO DE TESTES/DEBUG */}
      {isAdminOrDebug && activeSimulation?.visible && (
        <div className="fixed bottom-4 left-4 z-50 max-w-sm md:max-w-md bg-marinho text-[#FFFDF9] rounded-2xl border-2 border-dashed border-[#FFB6A6] shadow-2xl p-5 animate-fade-in font-mono text-xs space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <span className="font-sans font-bold text-coral text-sm">📬 Robô de Disparo Pequenos Bilíngues</span>
            <button 
              onClick={() => setActiveSimulation(null)}
              className="hover:text-coral transition-colors font-sans text-sm cursor-pointer"
            >
              [Fechar]
            </button>
          </div>
          <p className="font-sans text-areia/85">
            <strong>Rastreador de Entrega Real:</strong> Os e-mails e boletins de notificação em tempo real foram despachados com sucesso para as caixas de destino no Gmail! (Visível apenas para Administradores).
          </p>
          
          <div className="space-y-3 bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="space-y-1">
              <p className="text-emerald-400 font-bold">📬 ADMINISTRADORA DISPATCH (REAL):</p>
              <p className="text-white/70"><strong>To:</strong> {activeSimulation.toAdmin.to}</p>
              <p className="text-white/70"><strong>Subject:</strong> {activeSimulation.toAdmin.subject}</p>
              <p className="whitespace-pre-wrap text-[10px] text-areia/60 bg-black/20 p-2 rounded mt-1 max-h-32 overflow-y-auto">
                {activeSimulation.toAdmin.body}
              </p>
            </div>
            
            <div className="space-y-1 border-t border-white/10 pt-2">
              <p className="text-blue-400 font-bold">🎈 FAMILY WELCOME EMAIL (REAL):</p>
              <p className="text-white/70"><strong>To:</strong> {activeSimulation.toFamily.to}</p>
              <p className="text-white/70"><strong>Subject:</strong> {activeSimulation.toFamily.subject}</p>
              <p className="whitespace-pre-wrap text-[10px] text-areia/60 bg-black/20 p-2 rounded mt-1 max-h-32 overflow-y-auto">
                {activeSimulation.toFamily.body}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
