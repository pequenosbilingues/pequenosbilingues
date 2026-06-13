/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Lock, Mail, ArrowLeft, Key, Sparkles, AlertCircle, Check, Send, ShieldCheck, RefreshCw } from 'lucide-react';

async function sha256(message: string): Promise<string> {
  try {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (e) {
    // Portability iframe fallback 
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }
}

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export default function Login({ onLoginSuccess, onNavigateHome }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Advanced password recovery states
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [resetEmail, setResetEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [enteredCode, setEnteredCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Floating email simulation notification state
  const [simulatedEmail, setSimulatedEmail] = useState<{
    visible: boolean;
    to: string;
    subject: string;
    code: string;
  } | null>(null);

  // Load configured email if available on mount to ease testability
  useEffect(() => {
    const stored = localStorage.getItem('pb_user_credentials');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.email) setEmail(parsed.email);
      } catch (err) {}
    } else {
      setEmail('admin@pequenosbilingues.com.br');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    try {
      // 1. Get stored credentials or prepare defaults
      const stored = localStorage.getItem('pb_user_credentials');
      let registeredEmail = 'admin@pequenosbilingues.com.br';
      let correctHash = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // SHA-256 of "admin"
      let plainFallback = 'admin';

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.email) registeredEmail = parsed.email;
          if (parsed.passwordHash) correctHash = parsed.passwordHash;
          if (parsed.plainPassword) plainFallback = parsed.plainPassword;
        } catch (err) {}
      }

      // 2. Hash Entered Password for standard evaluation
      const enteredHash = await sha256(password);

      // 3. Authenticate securely
      if (
        email.trim().toLowerCase() === registeredEmail.trim().toLowerCase() &&
        (password === plainFallback || enteredHash === correctHash)
      ) {
        localStorage.setItem('pb_logged_in', 'true');
        setSuccessMsg('Autenticação concedida com sucesso! Redirecionando...');
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        setErrorMsg('Credenciais inválidas. Verifique o e-mail digitado e a senha protecional.');
      }
    } catch (e) {
      setErrorMsg('Erro de integridade durante a criptografia de senha.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetEmail) return;

    // Load registered credentials
    const stored = localStorage.getItem('pb_user_credentials');
    let registeredEmail = 'admin@pequenosbilingues.com.br';
    let backupRecoveryEmail = 'carlacristinavq@gmail.com';

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.email) registeredEmail = parsed.email;
        if (parsed.recoveryEmail) backupRecoveryEmail = parsed.recoveryEmail;
      } catch (err) {}
    }

    const trimmedInput = resetEmail.trim().toLowerCase();
    
    // Authorization check
    if (trimmedInput === registeredEmail.toLowerCase() || trimmedInput === backupRecoveryEmail.toLowerCase()) {
      // Generate a nice 6-digit random code
      const pinCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(pinCode);
      
      // Setup dynamic email mockup toast simulation
      setSimulatedEmail({
        visible: true,
        to: backupRecoveryEmail,
        subject: 'Recuperação de Acesso - Pequenos Bilíngues 🔑',
        code: pinCode
      });

      setSuccessMsg(`Código de segurança emitido! Enviando para o e-mail registrado.`);
      setRecoveryStep('verify');
    } else {
      setErrorMsg('O endereço informado não corresponde a nenhum e-mail cadastrado ou de backup.');
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (enteredCode.trim() === generatedCode) {
      setSuccessMsg('Verificação aprovada! Agora configure sua nova senha.');
      setRecoveryStep('reset');
    } else {
      setErrorMsg('Código incorreto de segurança. Revise a caixa postal simulada e tente novamente.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('As senhas digitadas não batem.');
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg('Sua nova senha deve possuir no mínimo 4 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Fetch default setup
      const stored = localStorage.getItem('pb_user_credentials');
      let currentSettings = {
        email: 'admin@pequenosbilingues.com.br',
        recoveryEmail: 'carlacristinavq@gmail.com'
      };

      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          currentSettings = {
            email: parsed.email || currentSettings.email,
            recoveryEmail: parsed.recoveryEmail || currentSettings.recoveryEmail
          };
        } catch (err) {}
      }

      // Hash and build payload
      const hashedPass = await sha256(newPassword);
      const updatedCreds = {
        ...currentSettings,
        passwordHash: hashedPass,
        plainPassword: newPassword
      };

      localStorage.setItem('pb_user_credentials', JSON.stringify(updatedCreds));
      
      setSuccessMsg('Sua senha foi redefinida com absoluto sucesso! Retorne e logue com as novas credenciais.');
      
      // Dismiss Simulated notification
      setSimulatedEmail(null);

      setTimeout(() => {
        setIsForgotPassword(false);
        setRecoveryStep('request');
        setPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setEnteredCode('');
        setGeneratedCode('');
        setSuccessMsg('');
      }, 1500);

    } catch (err) {
      setErrorMsg('Houve um erro durante o reset de password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-areia flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Decorative Wavy Blobs */}
      <div className="absolute top-1/4 -left-12 w-48 h-48 bg-menta/30 rounded-full blur-2xl -z-10" />
      <div className="absolute bottom-1/4 -right-12 w-60 h-60 bg-lilas/25 rounded-full blur-2xl -z-10" />
      
      {/* ========================================================
          SIMULADOR DE EMAIL RECEBIDO (AESTHETIC FLOATING NOTIFICATION)
          ======================================================== */}
      {simulatedEmail?.visible && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-slate-900 text-slate-100 p-4 rounded-2xl shadow-2xl border-2 border-dashed border-sky-400 space-y-2 animate-bounce">
          <div className="flex items-center justify-between border-b border-white/15 pb-1.5">
            <div className="flex items-center gap-1.5 text-[10px] text-sky-400 font-bold uppercase tracking-wider">
              <span className="p-1 bg-sky-500/20 rounded-md">📬</span> Simulador de E-mail
            </div>
            <button 
              onClick={() => setSimulatedEmail(prev => prev ? { ...prev, visible: false } : null)}
              className="text-white/45 hover:text-white font-mono text-[10px] cursor-pointer"
            >
              ocultar
            </button>
          </div>
          <div className="text-[11px] space-y-1">
            <p className="text-slate-300"><strong>Para:</strong> {simulatedEmail.to}</p>
            <p className="text-slate-300"><strong>Assunto:</strong> {simulatedEmail.subject}</p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center space-y-1.5 mt-2">
              <span className="block text-[10px] uppercase text-emerald-400 font-bold">Código de Segurança Autorizado</span>
              <span className="block text-xl tracking-widest font-mono font-black text-white bg-slate-900 border border-white/5 py-1 px-3 rounded-md">
                {simulatedEmail.code}
              </span>
              <span className="block text-[9px] text-slate-400">Copie este número e utilize-o abaixo para destravar a sua conta.</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full bg-white rounded-scrapbook shadow-2xl border-4 border-dashed border-marinho/10 p-8 relative">
        
        {/* Back Link */}
        <button 
          onClick={onNavigateHome}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-bold text-marinho/60 hover:text-marinho cursor-pointer"
        >
          <ArrowLeft size={14} /> Voltar ao Site
        </button>

        <div className="text-center mt-6 mb-8 space-y-2">
          {/* Logo element */}
          <div className="mx-auto w-12 h-12 bg-coral rounded-full flex items-center justify-center text-marinho font-bold font-display shadow-sm">
            PB
          </div>
          <h2 className="font-display font-black text-2xl text-marinho">
            {isForgotPassword ? 'Segurança & Recuperação' : 'Área do Professor'}
          </h2>
          <p className="text-xs text-marinho/60">
            {isForgotPassword 
              ? 'Ambiente automatizado de redefinição lúdica' 
              : 'Painel administrativo e pedagógico Pequenos Bilíngues'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-coral/25 border border-coral text-marinho p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2 mb-4">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-coral-dark" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-menta/20 border border-menta text-marinho p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2 mb-4 animate-pulse">
            <Check size={16} className="shrink-0 mt-0.5 text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        {isForgotPassword ? (
          /* ========================================================
             FORGOT PASSWORD / ACCESS RECOVERY MULTI-STEP
             ======================================================== */
          <div className="space-y-4">
            
            {recoveryStep === 'request' && (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">E-mail Cadastrado ou de Backup</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-marinho/40" />
                    <input 
                      type="email" 
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="Ex: carlacristinavq@gmail.com"
                      className="w-full bg-areia/40 border border-marinho/10 pl-9 pr-3 py-2.5 rounded-xl text-sm focus:border-coral outline-none"
                    />
                  </div>
                  <span className="block text-[10px] text-marinho/50 font-medium leading-relaxed mt-1">
                    Insira o e-mail comercial (<code className="font-mono bg-areia px-1 rounded-xs">admin@pequenosbilingues.com.br</code>) ou de resgate (<code className="font-mono bg-areia px-1 rounded-xs">carlacristinavq@gmail.com</code>).
                  </span>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-marinho text-white font-bold py-3 rounded-xl shadow-md hover:bg-marinho/90 transition-transform active:scale-95 text-sm cursor-pointer"
                >
                  Confirmar e Emitir PIN de Recuperação 📧
                </button>

                <button 
                  type="button" 
                  onClick={() => setIsForgotPassword(false)}
                  className="w-full text-center text-xs font-bold text-marinho/60 hover:text-marinho underline block py-2"
                >
                  Voltar para tela de login
                </button>
              </form>
            )}

            {recoveryStep === 'verify' && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-center text-[11px] leading-relaxed font-semibold">
                  📨 Enviamos as instruções de código. Se você estiver usando o ambiente de homologação, utilize a caixa preta flutuante no canto superior direito para ler o PIN!
                </div>

                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Digite o PIN de 6 dígitos</label>
                  <div className="relative">
                    <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-marinho/40" />
                    <input 
                      type="text" 
                      required
                      value={enteredCode}
                      onChange={(e) => setEnteredCode(e.target.value)}
                      placeholder="Ex: 123456"
                      maxLength={6}
                      className="w-full bg-areia/40 border border-marinho/10 pl-9 pr-3 py-2.5 rounded-xl text-sm focus:border-coral outline-none text-center font-mono font-bold tracking-widest"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-marinho text-white font-bold py-3 rounded-xl shadow-md hover:bg-marinho/90 transition-transform active:scale-95 text-sm cursor-pointer"
                >
                  Validar Código de Segurança 🔑
                </button>

                <div className="flex gap-2 justify-between">
                  {simulatedEmail && !simulatedEmail.visible && (
                    <button 
                      type="button" 
                      onClick={() => setSimulatedEmail(prev => prev ? { ...prev, visible: true } : null)}
                      className="text-[10px] text-sky-600 font-bold underline"
                    >
                      Mostrar E-mail Novamente 📬
                    </button>
                  )}
                  <button 
                    type="button" 
                    onClick={() => {
                      setRecoveryStep('request');
                      setErrorMsg('');
                    }}
                    className="text-[10px] text-marinho/60 font-bold underline ml-auto"
                  >
                    Alterar outro e-mail
                  </button>
                </div>
              </form>
            )}

            {recoveryStep === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-[11px] leading-relaxed font-semibold">
                  🔒 Código autorizado! Agora defina a sua nova senha de acesso administrativo.
                </div>

                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Nova Senha</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full bg-areia/40 border border-marinho/10 px-3 py-2.5 rounded-xl text-sm focus:border-coral outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-marinho/60 mb-1">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Repita a senha nova"
                    className="w-full bg-areia/40 border border-marinho/10 px-3 py-2.5 rounded-xl text-sm focus:border-coral outline-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-emerald-700 transition-all text-sm cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando Nova Senha...' : 'Salvar Nova Senha & Concluir 💾'}
                </button>
              </form>
            )}

          </div>
        ) : (
          /* ========================================================
             STANDARD LOGIN INTERFACE
             ======================================================== */
          <form onSubmit={handleLogin} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-marinho/60 mb-1">E-mail Cadastrado</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-marinho/40" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@pequenosbilingues.com.br"
                  className="w-full bg-areia/40 border border-marinho/10 pl-9 pr-3 py-2.5 rounded-xl text-sm focus:border-coral outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-marinho/60">Senha Protegida</label>
                <button 
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setRecoveryStep('request');
                    setErrorMsg('');
                    setSuccessMsg('');
                    setResetEmail(email || 'admin@pequenosbilingues.com.br');
                  }}
                  className="text-[10px] font-bold text-coral hover:underline focus:outline-none cursor-pointer"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-marinho/40" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-areia/40 border border-marinho/10 pl-9 pr-3 py-2.5 rounded-xl text-sm focus:border-coral outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-marinho text-white font-bold py-3 rounded-xl shadow-md hover:bg-marinho/95 transition-all text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="animate-spin" size={14} /> Autenticando...
                </>
              ) : (
                'Entrar no Painel 🔒'
              )}
            </button>


          </form>
        )}
      </div>
    </div>
  );
}
