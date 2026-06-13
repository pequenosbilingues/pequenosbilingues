/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { Student, ClassSession, MonthlyPayment, FinancialRecord, StudentContract } from './types';
import { 
  getStudents, saveStudents,
  getClasses, saveClasses,
  getPayments, savePayments,
  getFinancials, saveFinancials,
  getContracts, saveContracts,
  getLeads, saveLeads,
  initializeStorage
} from './mockData';

export default function App() {
  
  // Navigation: 'site' | 'login' | 'admin'
  const [currentView, setCurrentView] = useState<'site' | 'login' | 'admin'>('site');

  // Application database states
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [payments, setPayments] = useState<MonthlyPayment[]>([]);
  const [financials, setFinancials] = useState<FinancialRecord[]>([]);
  const [contracts, setContracts] = useState<StudentContract[]>([]);

  // Initialize LocalStorage and read values once
  useEffect(() => {
    initializeStorage();
    setStudents(getStudents());
    setClasses(getClasses());
    setPayments(getPayments());
    setFinancials(getFinancials());
    setContracts(getContracts());
  }, []);

  // --- ACTIONS HANDLERS ---

  // 1. ADD STUDENT
  const handleAddStudent = (newStudentData: Omit<Student, 'id'>) => {
    const newId = `student-${Date.now()}`;
    const student: Student = {
      id: newId,
      ...newStudentData
    };

    const updatedStudents = [...students, student];
    setStudents(updatedStudents);
    saveStudents(updatedStudents);

    // Automatically generate a companion monthly payment record for June 2026 under this student
    const newPayment: MonthlyPayment = {
      id: `pay-${Date.now()}`,
      studentId: newId,
      studentName: student.name,
      dueDate: '2026-06-10', // Standard due date month June
      amount: student.monthlyFee,
      status: 'Pendente'
    };

    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    savePayments(updatedPayments);
  };

  // 2. EDIT STUDENT
  const handleEditStudent = (updatedStudent: Student) => {
    const updated = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudents(updated);
    saveStudents(updated);

    // Also update companion names inside current payment listings
    const updatedPayments = payments.map(p => 
      p.studentId === updatedStudent.id ? { ...p, studentName: updatedStudent.name, amount: updatedStudent.monthlyFee } : p
    );
    setPayments(updatedPayments);
    savePayments(updatedPayments);

    const updatedClasses = classes.map(c =>
      c.studentId === updatedStudent.id ? { ...c, studentName: updatedStudent.name } : c
    );
    setClasses(updatedClasses);
    saveClasses(updatedClasses);
  };

  // 3. DELETE STUDENT
  const handleDeleteStudent = (id: string) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    saveStudents(updated);

    // Filter payments, classes and contracts out
    const updatedPayments = payments.filter(p => p.studentId !== id);
    setPayments(updatedPayments);
    savePayments(updatedPayments);

    const updatedClasses = classes.filter(c => c.studentId !== id);
    setClasses(updatedClasses);
    saveClasses(updatedClasses);

    const updatedContracts = contracts.filter(c => c.studentId !== id);
    setContracts(updatedContracts);
    saveContracts(updatedContracts);
  };

  // 4. ADD CLASS SESSION
  const handleAddClass = (classData: Omit<ClassSession, 'id'>) => {
    const cl: ClassSession = {
      id: `class-${Date.now()}`,
      ...classData
    };

    const updated = [...classes, cl];
    setClasses(updated);
    saveClasses(updated);
  };

  // 5. EDIT CLASS SESSION
  const handleEditClass = (updatedClass: ClassSession) => {
    const updated = classes.map(c => c.id === updatedClass.id ? updatedClass : c);
    setClasses(updated);
    saveClasses(updated);
  };

  // 6. DELETE CLASS SESSION
  const handleDeleteClass = (classId: string) => {
    const updated = classes.filter(c => c.id !== classId);
    setClasses(updated);
    saveClasses(updated);
  };

  // 7. UPDATE MONTHLY PAYMENT STATUS
  const handleUpdatePaymentStatus = (paymentId: string, statusValue: 'Pago' | 'Pendente' | 'Atrasado') => {
    const originalPayment = payments.find(p => p.id === paymentId);
    
    const updated = payments.map(p => {
      if (p.id === paymentId) {
        return {
          ...p,
          status: statusValue,
          paymentDate: statusValue === 'Pago' ? '2026-06-08' : undefined
        };
      }
      return p;
    });

    setPayments(updated);
    savePayments(updated);

    // INTELLIGENT DOUBLE-ENTRY TRIGGER:
    // If marked as 'Pago', automatically append a positive entry to Financial Ledger
    if (statusValue === 'Pago' && originalPayment && originalPayment.status !== 'Pago') {
      const newLedgerRecord: FinancialRecord = {
        id: `fin-${Date.now()}`,
        type: 'Receita',
        category: 'Mensalidade',
        amount: originalPayment.amount,
        date: '2026-06-08',
        description: `Mensalidade Recebida - Aluno: ${originalPayment.studentName}`,
        studentId: originalPayment.studentId
      };

      const updatedFinancials = [...financials, newLedgerRecord];
      setFinancials(updatedFinancials);
      saveFinancials(updatedFinancials);
    }
  };

  // 8. ADD TRANSACTION
  const handleAddTransaction = (recordData: Omit<FinancialRecord, 'id'>) => {
    const rec: FinancialRecord = {
      id: `fin-${Date.now()}`,
      ...recordData
    };

    const updated = [...financials, rec];
    setFinancials(updated);
    saveFinancials(updated);
  };

  // 9. DELETE TRANSACTION
  const handleDeleteTransaction = (id: string) => {
    const updated = financials.filter(f => f.id !== id);
    setFinancials(updated);
    saveFinancials(updated);
  };

  // 10. ADD CONTRACT
  const handleAddContract = (studentId: string, fileName: string, fileSize: string) => {
    const cnt: StudentContract = {
      id: `contract-${Date.now()}`,
      studentId,
      status: 'Pendente Assinatura',
      fileName,
      fileSize,
      uploadedAt: new Date('2026-06-08').toISOString().split('T')[0]
    };

    const updated = [...contracts, cnt];
    setContracts(updated);
    saveContracts(updated);
  };

  // 11. DELETE CONTRACT
  const handleDeleteContract = (contractId: string) => {
    const updated = contracts.filter(c => c.id !== contractId);
    setContracts(updated);
    saveContracts(updated);
  };

  // Handler for mock forms filled on the Landing Page
  const handleAddInquiryRequest = (data: {
    parentName: string;
    childName: string;
    childAge: string;
    phone: string;
    whatsapp: string;
    email: string;
    origin: string; // "Solicitar Informações" | "Receber Proposta" | "Agendar Aula Experimental"
    message: string;
  }) => {
    // Get current date and timestamp
    const today = new Date().toISOString().split('T')[0];
    const timestamp = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Registered parent inquiry as a financial experimental marker or simple pedagogical log
    const mockRecord: FinancialRecord = {
      id: `fin-${Date.now()}`,
      type: 'Receita',
      category: 'Aula Experimental',
      amount: 0, // No payment collected yet for initial inquiries
      date: today,
      description: `[Inquérito] Resp: ${data.parentName} (Zap: ${data.whatsapp}). Criança: ${data.childName} (${data.childAge} anos). Origem: ${data.origin}`
    };

    const updatedFinancials = [...financials, mockRecord];
    setFinancials(updatedFinancials);
    saveFinancials(updatedFinancials);

    // Save properly into the dedicated CRM Leads table
    const newLead = {
      id: `lead-${Date.now()}`,
      parentName: data.parentName,
      phone: data.phone,
      whatsapp: data.whatsapp || data.phone,
      childName: data.childName || 'A informar',
      childAge: data.childAge ? `${data.childAge} anos` : 'Não informada',
      status: 'Novo contato' as const,
      notes: `Origem: ${data.origin}. E-mail de Contato: ${data.email || 'Não informado'}. Obs: "${data.message}"`,
      createdAt: today,
      history: [
        {
          date: today,
          note: `Contato inicial recebido via formulário "${data.origin}" do Site em ${today} às ${timestamp}. E-mail: ${data.email || 'Não informado'}. Obs: "${data.message}"`
        }
      ]
    };

    const currentLeads = [newLead, ...getLeads()];
    saveLeads(currentLeads);
  };

  return (
    <>
      {currentView === 'site' && (
        <LandingPage 
          onNavigateToLogin={() => setCurrentView('login')} 
          onAddExperimentalRequest={handleAddInquiryRequest} 
        />
      )}

      {currentView === 'login' && (
        <Login 
          onLoginSuccess={() => setCurrentView('admin')} 
          onNavigateHome={() => setCurrentView('site')}
        />
      )}

      {currentView === 'admin' && (
        <AdminPanel 
          students={students}
          classes={classes}
          payments={payments}
          financials={financials}
          contracts={contracts}
          onAddStudent={handleAddStudent}
          onEditStudent={handleEditStudent}
          onDeleteStudent={handleDeleteStudent}
          onAddClass={handleAddClass}
          onEditClass={handleEditClass}
          onDeleteClass={handleDeleteClass}
          onUpdatePaymentStatus={handleUpdatePaymentStatus}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
          onAddContract={handleAddContract}
          onDeleteContract={handleDeleteContract}
          onLogout={() => {
            localStorage.removeItem('pb_logged_in');
            setCurrentView('site');
          }}
        />
      )}
    </>
  );
}
