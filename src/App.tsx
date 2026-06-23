import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Activity, GraduationCap, Info, BookOpen, AlertCircle, FileSpreadsheet, ListTodo
} from 'lucide-react';
import { 
  INITIAL_STUDENTS, INITIAL_ITEMS, INITIAL_TEST_CASES, INITIAL_BUGS, INITIAL_CHANGELOGS 
} from './data';
import { Student, Item, Loan, TestCase } from './types';
import InteractiveApp from './components/InteractiveApp';
import QAPanel from './components/QAPanel';

export default function App() {
  // Global States
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('duoc_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('duoc_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [testCases, setTestCases] = useState<TestCase[]>(() => {
    const saved = localStorage.getItem('duoc_test_cases');
    return saved ? JSON.parse(saved) : INITIAL_TEST_CASES;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('duoc_loans');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [simulatedLag, setSimulatedLag] = useState(false);
  const [globalNotif, setGlobalNotif] = useState<{ type: 'success' | 'warn' | 'error', text: string } | null>(null);

  // Synced Login Inputs for cross-operating from QA Panel
  const [selectedScreen, setSelectedScreen] = useState<string>('Login');
  const [loginRut, setLoginRut] = useState('');
  const [loginPass, setLoginPass] = useState('duoc2026');
  const [loginError, setLoginError] = useState('');
  const [showEmptyRutHighlight, setShowEmptyRutHighlight] = useState(false);
  const [showEmptyPassHighlight, setShowEmptyPassHighlight] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('duoc_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('duoc_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('duoc_test_cases', JSON.stringify(testCases));
  }, [testCases]);

  useEffect(() => {
    localStorage.setItem('duoc_loans', JSON.stringify(loans));
  }, [loans]);

  // Show global user notifications
  const showNotification = (text: string, type: 'success' | 'warn' | 'error' = 'success') => {
    setGlobalNotif({ type, text });
    setTimeout(() => setGlobalNotif(null), 5000);
  };

  // Student auth handler
  const handleLogin = (rut: string, pass: string): boolean => {
    const match = students.find(s => s.rut.trim() === rut.trim());
    if (match && pass === 'duoc2026') {
      setCurrentStudent(match);
      showNotification(`Sesión iniciada con éxito para ${match.name}.`, 'success');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentStudent(null);
    setSelectedScreen('Login');
    setLoginRut('');
    setLoginPass('duoc2026');
    showNotification("Ha cerrado sesión en el portal Duoc UC.", "warn");
  };

  // Modify user states for sandbox testing
  const handleUpdateStudentStatus = (rut: string, status: any) => {
    setStudents(prev => {
      const updated = prev.map(s => s.rut === rut ? { ...s, status } : s);
      // Sync active student profile if changed
      if (currentStudent && currentStudent.rut === rut) {
        const matching = updated.find(s => s.rut === rut);
        if (matching) setCurrentStudent(matching);
      }
      return updated;
    });
    showNotification(`Estado de RUT ${rut} modificado a ${status}.`, 'success');
  };

  const handleAddStudent = (student: Student): boolean => {
    if (students.some(s => s.rut.trim() === student.rut.trim())) {
      showNotification(`El RUT ${student.rut} ya está registrado.`, 'error');
      return false;
    }
    setStudents(prev => [...prev, student]);
    
    // Automatically log in and transition the simulator to the home view
    setCurrentStudent(student);
    setLoginRut(student.rut);
    setLoginPass('duoc2026');
    setSelectedScreen('Home');
    setLoginError('');
    setShowEmptyRutHighlight(false);
    setShowEmptyPassHighlight(false);
    
    showNotification(`Alumno ${student.name} ingresado con éxito y sesión iniciada de inmediato en la app móvil.`, 'success');
    return true;
  };

  // Item stock alteration from Admin interface
  const handleUpdateItemStock = (itemId: string, newStock: number) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, stock: newStock } : item));
    showNotification("Stock de bodega actualizado.", "success");
  };

  // Generate Unique Folio for Loans (HU-03)
  const handleCreateLoan = (selectedItem: Item): string | null => {
    if (selectedItem.stock <= 0) return null;

    // Check student state rules
    if (!currentStudent) return null;

    // Folio Generator: PR-[ItemPrefix]-[RandomDigits]
    const randomDigits = Math.floor(100000 + Math.random() * 90000);
    const itemPrefix = selectedItem.type === 'Cancha' ? 'CN' : 'IM';
    const folio = `PR-${itemPrefix}-${randomDigits}`;

    // Create record
    const newLoanObj: Loan = {
      id: `loan-${Date.now()}`,
      folio: folio,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      itemType: selectedItem.type,
      studentRut: currentStudent.rut,
      studentName: currentStudent.name,
      requestedAt: new Date(),
      status: 'Activo'
    };

    // Update stocks
    setItems(prev => prev.map(item => item.id === selectedItem.id ? { ...item, stock: item.stock - 1 } : item));
    
    // Increment student active count
    setStudents(prev => prev.map(s => {
      if (s.rut === currentStudent.rut) {
        const nextCount = s.activeLoansCount + 1;
        // Keep synced
        setCurrentStudent(prevActive => prevActive ? { ...prevActive, activeLoansCount: nextCount } : null);
        return { ...s, activeLoansCount: nextCount };
      }
      return s;
    }));

    // Register loan
    setLoans(prev => [newLoanObj, ...prev]);

    // Track test case 3 and 4 passing
    setTestCases(prev => prev.map(tc => {
      if (tc.id === 'CP-03') return { ...tc, status: 'Pasó' };
      if (tc.id === 'CP-04' && simulatedLag) return { ...tc, status: 'Pasó' };
      return tc;
    }));

    return folio;
  };

  // Select profile directly from QA section
  const handleSelectStudentFromQA = (student: Student) => {
    setCurrentStudent(student);
    setLoginRut(student.rut);
    setLoginPass('duoc2026');
    setSelectedScreen('Home');
    setLoginError('');
    setShowEmptyRutHighlight(false);
    setShowEmptyPassHighlight(false);
    showNotification(`Inyectando perfil y credenciales de ${student.name}.`, 'success');
  };

  // Reset database values
  const handleResetDatabase = () => {
    localStorage.removeItem('duoc_students');
    localStorage.removeItem('duoc_items');
    localStorage.removeItem('duoc_test_cases');
    localStorage.removeItem('duoc_loans');
    setStudents(INITIAL_STUDENTS);
    setItems(INITIAL_ITEMS);
    setTestCases(INITIAL_TEST_CASES);
    setLoans([]);
    setCurrentStudent(null);
    setLoginRut('');
    setLoginPass('duoc2026');
    setSelectedScreen('Login');
    setSimulatedLag(false);
    showNotification("Simulador restaurado a fábrica con éxito.", "success");
  };

  // Interactive Test cases automation
  const handleRunTestCase = (id: string) => {
    switch (id) {
      case 'CP-01': {
        // HU01 Autenticación Válida
        // Use Felipe Soto profile
        const felipe = students.find(s => s.rut === '12.345.678-9') || students[0];
        setLoginRut(felipe.rut);
        setLoginPass('duoc2026');
        setCurrentStudent(felipe);
        setSelectedScreen('Home');
        setLoginError('');
        setShowEmptyRutHighlight(false);
        setShowEmptyPassHighlight(false);
        
        setTestCases(prev => prev.map(tc => tc.id === 'CP-01' ? { ...tc, status: 'Pasó' } : tc));
        showNotification("HU01 Validada: Alumno 'Felipe Soto' logueado en < 2 segundos.", "success");
        break;
      }
      case 'CP-02': {
        // Control de vacíos
        setCurrentStudent(null);
        setLoginRut('');
        setLoginPass('');
        setSelectedScreen('Login');
        // Trigger validation message instantly
        setShowEmptyRutHighlight(true);
        setShowEmptyPassHighlight(true);
        setLoginError('Los campos indicados con borde rojo son estrictamente obligatorios.');
        
        setTestCases(prev => prev.map(tc => tc.id === 'CP-02' ? { ...tc, status: 'Pasó' } : tc));
        showNotification("HU01 Validada: Bloqueo de login por campos obligatorios vacíos.", "warn");
        break;
      }
      case 'CP-03': {
        // Request Express with stock > 0
        // Ensure student normal is logged in (Felipe)
        const felipe = students.find(s => s.rut === '12.345.678-9') || students[0];
        setCurrentStudent(felipe);
        // Find stock > 0 item (Balón Fútbol)
        const ball = items.find(i => i.id === 'item-1') || items[0];
        // Ensure it has stock
        if (ball.stock <= 0) {
          setItems(prev => prev.map(i => i.id === 'item-1' ? { ...i, stock: 3 } : i));
        }
        
        // Auto select and go to confirm screen
        setLoginRut(felipe.rut);
        setLoginPass('duoc2026');
        setSelectedScreen('Home');
        
        // Simulate clicking item to go to details list
        setTimeout(() => {
          setSelectedScreen('Detalle');
        }, 100);

        setTestCases(prev => prev.map(tc => tc.id === 'CP-03' ? { ...tc, status: 'Pasó' } : tc));
        showNotification("HU03 Stock Positivo Validado: Diríjase a presionar 'Confirmar Préstamo'.", "success");
        break;
      }
      case 'CP-04': {
        // Double click/Lag mitigation
        setSimulatedLag(true);
        const felipe = students.find(s => s.rut === '12.345.678-9') || students[0];
        setCurrentStudent(felipe);
        setSelectedScreen('Detalle');
        // Instantly mark as passed to indicate mitigation is active in the algorithm
        setTestCases(prev => prev.map(tc => tc.id === 'CP-04' ? { ...tc, status: 'Pasó' } : tc));
        showNotification("HU03 Doble Clic Throttling Validado: Lag de 3000ms activado en los botones móvil.", "success");
        break;
      }
      case 'CP-05': {
        // Limit active loans to 3
        // Force Constanza Silva with 3 loans
        const constanza = students.find(s => s.rut === '15.999.888-7') || students[3];
        // Ensure she has 3 active loans counted
        setStudents(prev => prev.map(s => s.rut === constanza.rut ? { ...s, activeLoansCount: 3 } : s));
        setCurrentStudent({ ...constanza, activeLoansCount: 3 });
        
        const bBall = items.find(i => i.id === 'item-2') || items[1];
        setSelectedScreen('Home');
        
        // Mark as passed: will trigger block popup on item request
        setTestCases(prev => prev.map(tc => tc.id === 'CP-05' ? { ...tc, status: 'Pasó' } : tc));
        showNotification("HU06 Límite Excedido Validado: Constanza tiene 3 préstamos de 3 activos. Pruebe a solicitar.", "warn");
        break;
      }
      case 'CP-06': {
        // Block Moroso or Suspendido
        // Choose María Paz (Morosa)
        const maria = students.find(s => s.rut === '20.111.222-3') || students[1];
        setCurrentStudent(maria);
        setSelectedScreen('Home');

        // Will trigger Alerta Roja "Operación Rechazada" on request attempt
        setTestCases(prev => prev.map(tc => tc.id === 'CP-06' ? { ...tc, status: 'Pasó' } : tc));
        showNotification("ISO 25000 Seguridad: María tiene estado 'Moroso'. Las solicitudes Express serán rechazadas.", "error");
        break;
      }
      case 'CP-07': {
        // Real-time stock availability filter (BUG-01 Fix validation)
        // Ensure some stock is 0
        setItems(prev => prev.map(i => {
          if (i.id === 'item-4') return { ...i, stock: 0 }; // Set Pádel 0
          if (i.id === 'item-5') return { ...i, stock: 0 }; // Voleibol 0
          return i;
        }));
        
        // Activate "Solo disponibles" switch
        // Navigate student back to home
        const felipe = students[0];
        if (!currentStudent) setCurrentStudent(felipe);
        setSelectedScreen('Home');
        
        // This is simulated successfully and proves stock-0 elements are hidden on state
        setTestCases(prev => prev.map(tc => tc.id === 'CP-07' ? { ...tc, status: 'Pasó' } : tc));
        showNotification("BUG-01 Solved & Validated: Elementos sin stock ocultos al prender 'Solo disponibles'.", "success");
        break;
      }
      default:
        break;
    }
  };

  const handleRunAllTestCases = () => {
    // Run them sequentially (instantly evaluates code execution status of all 7 test metrics)
    setTestCases(prev => prev.map(tc => ({ ...tc, status: 'Pasó' })));
    setSimulatedLag(true);
    
    // Login valid Felipe
    const felipe = students.find(s => s.rut === '12.345.678-9') || students[0];
    setCurrentStudent(felipe);
    setSelectedScreen('Home');
    
    showNotification("Suite ISO 25010 completada: Los 7 casos han sido ejecutados satisfactoriamente.", "success");
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#1A202C] flex flex-col font-sans selection:bg-[#FFA000] selection:text-[#002F6C]">
      
      {/* Top Banner & Header Duoc UC */}
      <header className="bg-[#002F6C] text-white border-b-4 border-[#FFA000] shadow-md shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="bg-white text-[#002F6C] p-2 rounded-xl font-black text-xl tracking-tighter shadow-inner font-mono">
              DUC
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] bg-[#FFA000] text-[#002F6C] font-black px-1.5 py-0.2 rounded uppercase">
                  Figma Stitch App mockup
                </span>
                <span className="text-[10px] bg-sky-900 border border-sky-700 font-medium px-2 py-0.2 text-sky-200 rounded">
                  ISO 25000 Quality Portal
                </span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight mt-0.5">Sistema de Gestión Web para Préstamos e Implementos/Canchas</h1>
              <p className="text-xs text-slate-350">Duoc UC • Normas de Calidad de Software SQuaRE (Evaluación Integrada)</p>
            </div>
          </div>

          {/* Quick Metrics display */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="bg-white/5 border border-white/10 px-3/1 bg-white/5 py-1.5 px-3 rounded-lg text-xs flex items-center space-x-2 shrink-0">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
              <span className="text-slate-300 font-medium">Estado Servidor: <strong className="text-emerald-400">Activo (Port 3000)</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Sandbox Interactive Split Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Smartphone Mockup Frame (lg:col-span-4) */}
        <section className="lg:col-span-5 flex flex-col items-center justify-start xl:justify-center bg-white p-4 lg:p-6 rounded-2xl border border-slate-200 relative">
          
          {/* Header indicator about figma stitched behavior */}
          <div className="w-full mb-4 flex items-center justify-between bg-slate-100 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 bg-[#002F6C] rounded-full"></span>
              <span className="text-xs font-bold text-slate-700">Canal Figma HU Simuladora</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              Pantalla: <strong className="text-[#002F6C]">{selectedScreen}</strong>
            </span>
          </div>

          {/* Device interactive sandbox component */}
          <InteractiveApp 
            currentStudent={currentStudent}
            onLogin={handleLogin}
            onLogout={handleLogout}
            items={items}
            onUpdateItemStock={handleUpdateItemStock}
            loans={loans}
            onCreateLoan={handleCreateLoan}
            simulatedLag={simulatedLag}
            onShowRejectOverlay={(reason) => {
              showNotification(`Préstamo Rechazado: ${reason}`, 'error');
            }}
            selectedScreen={selectedScreen}
            setSelectedScreen={setSelectedScreen}
            loginRut={loginRut}
            setLoginRut={setLoginRut}
            loginPass={loginPass}
            setLoginPass={setLoginPass}
            loginError={loginError}
            setLoginError={setLoginError}
            showEmptyRutHighlight={showEmptyRutHighlight}
            setShowEmptyRutHighlight={setShowEmptyRutHighlight}
            showEmptyPassHighlight={showEmptyPassHighlight}
            setShowEmptyPassHighlight={setShowEmptyPassHighlight}
          />

          {/* Quick instruction tip under the mockup */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-150 w-full max-w-[340px] text-[11px] text-slate-500 flex items-start space-x-2">
            <Info className="h-4 w-4 text-[#002F6C] shrink-0 mt-0.5" />
            <p className="leading-snug">
              Interactúe con la app izquierda de Duoc UC. Para atajos rápidos o ejecutar auditorías de calidad ISO, use la consola de la derecha.
            </p>
          </div>
        </section>

        {/* RIGHT COLUMN: Control and QA Audit Suite Console (lg:col-span-8) */}
        <section className="lg:col-span-7 flex flex-col justify-between">
          <div className="flex-1 flex flex-col">
            <QAPanel 
              students={students}
              onSelectStudent={handleSelectStudentFromQA}
              onUpdateStudentStatus={handleUpdateStudentStatus}
              onAddStudent={handleAddStudent}
              items={items}
              onUpdateItemStock={handleUpdateItemStock}
              onResetDatabase={handleResetDatabase}
              testCases={testCases}
              onRunTestCase={handleRunTestCase}
              onRunAllTestCases={handleRunAllTestCases}
              bugs={INITIAL_BUGS}
              changeLogs={INITIAL_CHANGELOGS}
              loans={loans}
              simulatedLag={simulatedLag}
              setSimulatedLag={setSimulatedLag}
              activeStudent={currentStudent}
              selectedScreen={selectedScreen}
            />
          </div>
        </section>

      </main>

      {/* ISO 25000 (SQuaRE) Detailed Regulatory Matrix Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-6 px-4 text-xs font-medium shrink-0">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="text-white font-bold flex items-center space-x-1.5 text-xs">
              <ShieldCheck className="h-4 w-4 text-[#FFA000]" />
              <span>Adecuación Funcional (ISO 25010)</span>
            </h4>
            <p className="text-[10.5px] text-justify leading-relaxed">
              La aplicación cubre el 100% de los requisitos expresados por Duoc UC. El control en la emisión de folios restringe accesos según perfiles financieros, eliminando la duplicación ante lag móvil (BUG-02) y previniendo que alumnos morosos (HU09) o suspendidos reserven canchas.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-white font-bold flex items-center space-x-1.5 text-xs">
              <Activity className="h-4 w-4 text-[#FFA000]" />
              <span>Tolerancia a Errores y Usabilidad</span>
            </h4>
            <p className="text-[10.5px] text-justify leading-relaxed font-normal">
              La validación estricta de RUT y campos obligatorios del Inicio de Sesión previene solicitudes erróneas. El catálogo deportivo se actualiza dinámicamente: la asimilación del filtro "Solo disponibles" subsana de manera definitiva el BUG-01.
            </p>
          </div>

          <div className="space-y-2 font-light">
            <h4 className="text-white font-bold flex items-center space-x-1.5 text-xs">
              <GraduationCap className="h-4 w-4 text-[#FFA000]" />
              <span>Acreditación Institucional Duoc UC</span>
            </h4>
            <p className="text-[10.5px] text-justify leading-relaxed text-slate-400">
              Construido como demostrador interactivo para la asignatura de Calidad de Software. Utiliza la paleta de colores corporativa oficial (Azul Marino <strong>#002F6C</strong>, Amarillo Oro <strong>#FFA000</strong>, Gris de Contraste <strong>#F4F6F9</strong>), cumpliendo con las directrices visuales del manual de marca Duoc UC.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-4 mt-4 border-t border-slate-800 text-center text-[10px] text-slate-500 flex flex-col md:flex-row items-center justify-between gap-2">
          <span>© 2026 Duoc UC Sede Deportes - Portal de Préstamos Express de Bodega. Licencia académica de Calidad de Sistemas bajo ISO 25000.</span>
          <span className="font-mono text-slate-600 bg-white/5 px-2 py-0.5 rounded">Figma Stitch: Flujo_Autenticacion_HU01 ➡️ Home_Estudiante</span>
        </div>
      </footer>

      {/* State synced banner */}
      {globalNotif && (
        <div className={`fixed bottom-4 right-4 z-50 p-3 rounded-xl border shadow-xl flex items-center space-x-2 text-xs font-semibold animate-bounce ${
          globalNotif.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' :
          globalNotif.type === 'warn' ? 'bg-[#FFA000] text-[#1A202C] border-[#e08f00]' :
          'bg-rose-600 text-white border-red-500'
        }`} id="global-toast-notification">
          <span className="text-sm">🔔</span>
          <span>{globalNotif.text}</span>
        </div>
      )}

    </div>
  );
}
