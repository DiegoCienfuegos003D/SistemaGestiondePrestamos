import React, { useState } from 'react';
import { 
  CheckCircle, XCircle, Play, AlertTriangle, Bug, ClipboardList, 
  Settings, Zap, Shield, HelpCircle, Activity, RotateCcw, AlertOctagon, RefreshCw, Clock
} from 'lucide-react';
import { Student, Item, TestCase, Bug as BugType, ChangeLog, Loan } from '../types';

interface QAPanelProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onUpdateStudentStatus: (rut: string, status: any) => void;
  onAddStudent: (student: Student) => boolean;
  items: Item[];
  onUpdateItemStock: (itemId: string, newStock: number) => void;
  onResetDatabase: () => void;
  testCases: TestCase[];
  onRunTestCase: (id: string) => void;
  onRunAllTestCases: () => void;
  bugs: BugType[];
  changeLogs: ChangeLog[];
  loans: Loan[];
  simulatedLag: boolean;
  setSimulatedLag: (val: boolean) => void;
  activeStudent: Student | null;
  selectedScreen: string;
  onAddItem: (item: Omit<Item, 'id'>) => boolean;
  onReturnLoan: (loanId: string, delayDays: number) => void;
  onAutoReleaseCanchas: () => void;
}

export default function QAPanel({
  students,
  onSelectStudent,
  onUpdateStudentStatus,
  onAddStudent,
  items,
  onUpdateItemStock,
  onResetDatabase,
  testCases,
  onRunTestCase,
  onRunAllTestCases,
  bugs,
  changeLogs,
  loans,
  simulatedLag,
  setSimulatedLag,
  activeStudent,
  selectedScreen,
  onAddItem,
  onReturnLoan,
  onAutoReleaseCanchas
}: QAPanelProps) {
  const [activeTab, setActiveTab] = useState<'tests' | 'students' | 'inventory' | 'bugs' | 'loans' | 'reports'>('tests');
  const [successRunMessage, setSuccessRunMessage] = useState<string | null>(null);

  // States for registering new mock students
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRut, setNewStudentRut] = useState('');
  const [newStudentCareer, setNewStudentCareer] = useState('Técnico en Deportes');
  const [newStudentStatus, setNewStudentStatus] = useState<'Normal' | 'Moroso' | 'Suspendido'>('Normal');
  const [addStudentError, setAddStudentError] = useState('');

  const submitNewStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setAddStudentError('');

    if (!newStudentName.trim()) {
      setAddStudentError('Debe ingresar el nombre completo del alumno.');
      return;
    }
    if (!newStudentRut.trim()) {
      setAddStudentError('Debe ingresar un RUT válido.');
      return;
    }

    // Basic RUT pattern check or format
    const rutClean = newStudentRut.trim();

    const success = onAddStudent({
      rut: rutClean,
      name: newStudentName.trim(),
      career: newStudentCareer,
      status: newStudentStatus,
      email: `${newStudentName.toLowerCase().replace(/\s+/g, '.')}@duocuc.cl`,
      activeLoansCount: 0
    });

    if (success) {
      setNewStudentName('');
      setNewStudentRut('');
      setNewStudentStatus('Normal');
    }
  };

  // HU04 "Registrar Nuevo Implemento" states
  const [newItemName, setNewItemName] = useState('');
  const [newItemStock, setNewItemStock] = useState('5');
  const [newItemCategory, setNewItemCategory] = useState('Accesorios');
  const [newItemLocation, setNewItemLocation] = useState('Mesón Central');
  const [itemNameError, setItemNameError] = useState(false);
  const [itemStockError, setItemStockError] = useState(false);
  const [itemSubmitError, setItemSubmitError] = useState(false);

  // HU04 onSubmit handler
  const submitNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    setItemNameError(false);
    setItemStockError(false);
    setItemSubmitError(false);
    
    let hasError = false;
    if (!newItemName.trim()) {
      setItemNameError(true);
      hasError = true;
    }
    const parsedStock = parseInt(newItemStock, 10);
    if (newItemStock === "" || isNaN(parsedStock) || parsedStock < 0) {
      setItemStockError(true);
      hasError = true;
    }

    if (hasError) {
      setItemSubmitError(true);
      return;
    }

    const wasAdded = onAddItem({
      name: newItemName.trim(),
      stock: parsedStock,
      totalStock: parsedStock,
      type: newItemCategory === 'Canchas' ? 'Cancha' : 'Implemento',
      category: newItemCategory,
      location: newItemLocation.trim() || 'Bodega Deportes',
      image: 'Activity'
    });

    if (wasAdded) {
      setNewItemName('');
      setNewItemStock('5');
      setNewItemLocation('Mesón Central');
    }
  };

  // Administrador / Mesón Returns list state
  const [loanSearch, setLoanSearch] = useState('');
  const [simulatedReturnDays, setSimulatedReturnDays] = useState<{ [loanId: string]: number }>({});

  // HU08_01 Reports Filtering and Date segmentation
  const [reportCategory, setReportCategory] = useState('Todas');
  const [reportStartDate, setReportStartDate] = useState('2026-03-01');
  const [reportEndDate, setReportEndDate] = useState('2026-03-31');

  const handleRunAndNotify = (id: string) => {
    onRunTestCase(id);
    const tcObj = testCases.find(t => t.id === id);
    setSuccessRunMessage(`Caso ${id} "${tcObj?.title}" ejecutado e inspeccionado.`);
    setTimeout(() => setSuccessRunMessage(null), 4000);
  };

  const handleRunAllAndNotify = () => {
    onRunAllTestCases();
    setSuccessRunMessage(`Se ejecutraron los 13 casos de prueba bajo criterios de calidad ISO 25010.`);
    setTimeout(() => setSuccessRunMessage(null), 4000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pasó': return 'bg-emerald-50 text-emerald-700 border-emerald-250';
      case 'Falló': return 'bg-rose-50 text-rose-700 border-rose-250';
      default: return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Alta': return 'bg-rose-100 text-rose-800 font-bold';
      case 'Media': return 'bg-amber-105 text-amber-800 font-bold';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-lg flex flex-col h-full font-sans max-w-full" id="qa-panel-container">
      
      {/* Panel header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1 px-1.5 bg-[#002F6C] text-[#FFA000] rounded font-mono font-black text-xs">QA</span>
            <h1 className="text-lg font-extrabold text-[#1A202C] tracking-tight">Consola de Control de Calidad (ISO 25000)</h1>
          </div>
          <p className="text-xs text-[#A0AEC0] mt-0.5">Simulador de Préstamos para Duoc UC • Evaluador SQuaRE</p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={onResetDatabase}
            className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg font-bold transition-all flex items-center space-x-1 cursor-pointer"
            title="Restaurar estado original del inventario y alumnos"
            id="btn-reset-db"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reiniciar App</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 bg-slate-100 p-1 rounded-xl my-4">
        <button
          onClick={() => setActiveTab('tests')}
          className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
            activeTab === 'tests' 
              ? 'bg-[#002F6C] text-white shadow' 
              : 'text-slate-600 hover:bg-slate-200'
          }`}
          id="btn-tab-tests"
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Casos ISO</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
            activeTab === 'students' 
              ? 'bg-[#002F6C] text-white shadow' 
              : 'text-slate-600 hover:bg-slate-200'
          }`}
          id="btn-tab-students"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Alumnos</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
            activeTab === 'inventory' 
              ? 'bg-[#002F6C] text-white shadow' 
              : 'text-slate-600 hover:bg-slate-200'
          }`}
          id="btn-tab-inventory"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>Inventario</span>
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
            activeTab === 'loans' 
              ? 'bg-[#002F6C] text-white shadow' 
              : 'text-slate-600 hover:bg-slate-200'
          }`}
          id="btn-tab-loans"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          <span>Préstamos</span>
          {loans.filter(l => l.status === 'Activo').length > 0 && (
            <span className="ml-1 bg-[#FFA000] text-[#002F6C] text-[9.5px] px-1.5 py-0.2 rounded-full font-black animate-pulse">
              {loans.filter(l => l.status === 'Activo').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
            activeTab === 'reports' 
              ? 'bg-[#002F6C] text-white shadow' 
              : 'text-slate-600 hover:bg-slate-200'
          }`}
          id="btn-tab-reports"
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Reportes</span>
        </button>

        <button
          onClick={() => setActiveTab('bugs')}
          className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 cursor-pointer ${
            activeTab === 'bugs' 
              ? 'bg-[#002F6C] text-white shadow' 
              : 'text-slate-600 hover:bg-slate-200'
          }`}
          id="btn-tab-bugs"
        >
          <Bug className="h-3.5 w-3.5" />
          <span>Bugs</span>
        </button>
      </div>

      {/* Main Tab content with flex growth */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-[350px]">
        
        {successRunMessage && (
          <div className="mb-4 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-lg flex items-center space-x-2 animate-fadeIn animate-duration-150">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successRunMessage}</span>
          </div>
        )}

        {/* TAB 1: ISO 25000 TEST RUNNER */}
        {activeTab === 'tests' && (
          <div className="space-y-4" id="section-tests">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-[#1A202C] uppercase tracking-wide">Evaluación de Calidad ISO/IEC 25010</h3>
                <p className="text-[11px] text-slate-500 mt-1">Someter la APK a pruebas de estrés, bloqueos, deudas y filtros de inventario.</p>
              </div>

              <button
                onClick={handleRunAllAndNotify}
                className="bg-[#002F6C] hover:bg-[#002554] text-white font-bold text-xs py-1.5 px-3 rounded-lg shadow-sm transition-colors flex items-center space-x-1 cursor-pointer shrink-0"
                id="btn-run-all-tests"
              >
                <Play className="h-3.5 w-3.5 text-[#FFA000] fill-[#FFA000]" />
                <span>Ejecutar Todo el Suite</span>
              </button>
            </div>

            {/* Test list */}
            <div className="space-y-3">
              {testCases.map((tc) => (
                <div 
                  key={tc.id} 
                  className={`p-3 rounded-xl border transition-all ${
                    tc.status === 'Pasó' ? 'border-emerald-200 bg-emerald-50/20' : 
                    tc.status === 'Falló' ? 'border-red-250 bg-red-50/20' : 
                    'border-slate-200 bg-white'
                  }`}
                  id={`test-case-item-${tc.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-extrabold text-[#002F6C]">{tc.id}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded uppercase">
                          {tc.hu}
                        </span>
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                          {tc.isoCharacteristic}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-[#1A202C] mt-1.5 leading-snug">{tc.title}</h4>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getStatusColor(tc.status)}`}>
                        {tc.status}
                      </span>
                      <button
                        onClick={() => handleRunAndNotify(tc.id)}
                        className="p-1.5 text-[#002F6C] hover:bg-[#002F6C]/10 rounded-lg transition-colors border border-slate-200 cursor-pointer text-xs flex items-center space-x-1"
                        title="Simular y resolver este caso de prueba"
                        id={`btn-run-${tc.id}`}
                      >
                        <Play className="h-3 w-3 fill-current" />
                        <span className="text-[10px] font-bold">Simular</span>
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-600 leading-snug">
                    <div>
                      <strong className="text-[#1A202C]">Lanzamiento:</strong> {tc.context}
                    </div>
                    <div>
                      <strong className="text-[#1A202C]">Efecto Esperado (ISO):</strong> {tc.expectedResult}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS SIMULATOR CONTROL */}
        {activeTab === 'students' && (
          <div className="space-y-4" id="section-students">
            
            {/* NUEVO ALUMNO FORM (Solicitado por el usuario) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-105 pb-1.5">
                <span className="p-0.5 px-1.5 bg-[#002F6C] text-[#FFA000] rounded font-mono font-bold text-xs">Añadir</span>
                <h4 className="text-xs font-bold text-[#1A202C] uppercase tracking-wide">Ingresar Nuevo Alumno</h4>
              </div>

              <form onSubmit={submitNewStudent} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Nombre Completo</label>
                    <input
                      id="input-new-student-name"
                      type="text"
                      placeholder="Ej: Juan Pérez Soler"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002F6C] bg-white text-[#1A202C]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">RUT Alumno (para Inicio de Sesión)</label>
                    <input
                      id="input-new-student-rut"
                      type="text"
                      placeholder="Ej: 12.345.678-9"
                      value={newStudentRut}
                      onChange={(e) => setNewStudentRut(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002F6C] bg-white text-[#1A202C]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Carrera Duoc UC</label>
                    <select
                      id="select-new-student-career"
                      value={newStudentCareer}
                      onChange={(e) => setNewStudentCareer(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002F6C] bg-white text-[#1A202C]"
                    >
                      <option value="Técnico en Deportes">Técnico en Deportes</option>
                      <option value="Ingeniería en Informática">Ingeniería en Informática</option>
                      <option value="Animación Digital">Animación Digital</option>
                      <option value="Diseño Gráfico">Diseño Gráfico</option>
                      <option value="Administración de Empresas">Administración de Empresas</option>
                      <option value="Construcción Civil">Construcción Civil</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Estado Financiero/Académico</label>
                    <select
                      id="select-new-student-status"
                      value={newStudentStatus}
                      onChange={(e) => setNewStudentStatus(e.target.value as any)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002F6C] bg-white text-[#1A202C]"
                    >
                      <option value="Normal">🟢 Normal (Sin deudas)</option>
                      <option value="Moroso">🔴 Moroso (Bloqueo Deportes)</option>
                      <option value="Suspendido">⚫ Suspendido (Sanción Fuerte)</option>
                    </select>
                  </div>
                </div>

                {addStudentError && (
                  <p className="text-[10px] text-red-650 font-bold bg-red-50 p-1.5 rounded border-l-2 border-red-500">
                    ⚠️ {addStudentError}
                  </p>
                )}

                <div className="flex justify-between items-center pt-1">
                  <span className="text-[9px] text-[#A0AEC0]">
                    Contraseña genérica: <strong className="text-slate-600 font-mono">duoc2026</strong>
                  </span>
                  <button
                    id="btn-add-student-submit"
                    type="submit"
                    className="bg-[#002F6C] hover:bg-[#002554] text-[#FFA000] font-bold text-xs py-1.5 px-3 rounded-lg shadow transition-colors cursor-pointer"
                  >
                    Registrar e Iniciar
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-[#F4F6F9] p-3 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-[#002F6C]" />
                <h4 className="text-xs font-bold text-[#1A202C]">Configuración de Red Móvil</h4>
              </div>
              
              <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-100">
                <div>
                  <span className="text-xs font-bold text-[#1A202C] block">Simular Conexión Móvil con Lag (3G/4G Duoc)</span>
                  <span className="text-[9px] text-[#A0AEC0]">Agrega un retraso físico de 3 segundos para probar de forma real el bloqueo de doble click (Pérdidas de inventario).</span>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                  <input 
                    type="checkbox" 
                    id="checkbox-lag-simulator"
                    className="sr-only peer" 
                    checked={simulatedLag}
                    onChange={(e) => setSimulatedLag(e.target.checked)}
                  />
                  <div className="w-9 h-5 bg-slate-200 rounded-full peer peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-[#002F6C] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FFA000]"></div>
                </label>
              </div>
            </div>

            <p className="text-xs font-bold text-[#1A202C] border-b pb-1">Seleccionar Estudiante Activo en el Iframe</p>

            <div className="grid grid-cols-1 gap-2.5">
              {students.map((student) => {
                const isActive = activeStudent?.rut === student.rut;
                return (
                  <div 
                    key={student.rut}
                    className={`p-3 rounded-xl border transition-all flex flex-col md:flex-row shadow-xs justify-between gap-3 ${
                      isActive 
                        ? 'border-[#002F6C] bg-indigo-50/25' 
                        : 'border-slate-150 bg-white hover:border-slate-300'
                    }`}
                    id={`student-sim-item-${student.rut.replace(/\./g, '').replace(/-/g, '')}`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs text-[#1A202C]" id={`student-sim-name-${student.rut}`}>{student.name}</span>
                        {isActive && (
                          <span className="text-[8px] bg-[#002F6C] text-white px-1 py-0.2 rounded font-bold animate-pulse">
                            Conectado
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#A0AEC0]">{student.career} • RUT: {student.rut}</p>
                      <p className="text-[10px] text-slate-500 mt-1">E-mail: <strong>{student.email}</strong></p>
                      
                      {/* Active loans counter and list */}
                      <p className="text-[10px] text-[#002F6C] font-semibold mt-1">
                        Carga activa actual: <strong>{student.activeLoansCount}/3 reservas</strong>
                      </p>
                    </div>

                    <div className="flex flex-row md:flex-col items-start md:items-end justify-between md:justify-center gap-2">
                      {/* Dynamic status dropdown for QA manipulation */}
                      <div>
                        <span className="text-[9px] text-slate-400 block md:text-right">Fuerza estado:</span>
                        <select
                          value={student.status}
                          onChange={(e) => onUpdateStudentStatus(student.rut, e.target.value as any)}
                          className={`text-[10px] font-bold p-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#002F6C] ${
                            student.status === 'Normal' ? 'text-green-700 bg-green-50 border-green-200' :
                            student.status === 'Moroso' ? 'text-red-700 bg-red-50 border-red-200' :
                            'text-slate-700 bg-slate-50 border-slate-350'
                          }`}
                          id={`select-status-${student.rut}`}
                        >
                          <option value="Normal">🟢 Normal</option>
                          <option value="Moroso">🔴 Moroso</option>
                          <option value="Suspendido">⚫ Suspendido</option>
                        </select>
                      </div>

                      <button
                        onClick={() => onSelectStudent(student)}
                        className={`text-[10px] font-bold px-2 py-1 rounded transition-colors w-full md:w-auto text-center cursor-pointer ${
                          isActive 
                            ? 'bg-[#002F6C] text-white cursor-default' 
                            : 'bg-slate-100 hover:bg-slate-200 text-[#1A202C]'
                        }`}
                        id={`btn-select-student-${student.rut}`}
                      >
                        {isActive ? 'Conectado Listo' : 'Inyectar Login Auth'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY STOCK CONTROL */}
        {activeTab === 'inventory' && (
          <div className="space-y-4" id="section-inventory">
            
            {/* HU04: REGISTRAR NUEVO IMPLEMENTO FORM */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-1.5">
                <span className="p-0.5 px-1.5 bg-[#002F6C] text-[#FFA000] rounded font-mono font-bold text-[10px] uppercase">HU04 FORM</span>
                <h4 className="text-xs font-bold text-[#1A202C] uppercase tracking-wide">Registrar Nuevo Implemento</h4>
              </div>
              
              <form onSubmit={submitNewItem} className="space-y-3" id="form-new-item">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Nombre del Implemento *</label>
                    <input
                      id="input-item-name"
                      type="text"
                      placeholder="Ej: Set de Raquetas Bádminton"
                      value={newItemName}
                      onChange={(e) => {
                        setNewItemName(e.target.value);
                        if (e.target.value.trim()) setItemNameError(false);
                      }}
                      className={`w-full text-xs p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002F6C] bg-white text-[#1A202C] ${
                        itemNameError ? 'border-red-505 ring-1 ring-red-500 bg-red-50/10' : 'border-slate-200'
                      }`}
                    />
                    {itemNameError && (
                      <span className="text-[9px] text-red-500 font-bold block mt-0.5">
                        ⚠️ El nombre del implemento es estrictamente requerido.
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Cantidad Disponible *</label>
                    <input
                      id="input-item-stock"
                      type="number"
                      min="0"
                      placeholder="Ej: 5"
                      value={newItemStock}
                      onChange={(e) => {
                        setNewItemStock(e.target.value);
                        if (e.target.value !== "") setItemStockError(false);
                      }}
                      className={`w-full text-xs p-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002F6C] bg-white text-[#1A202C] ${
                        itemStockError ? 'border-red-505 ring-1 ring-red-500 bg-red-50/10' : 'border-slate-200'
                      }`}
                    />
                    {itemStockError && (
                      <span className="text-[9px] text-red-500 font-bold block mt-0.5">
                        ⚠️ Cantidad debe ser mayor o igual a 0.
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Categoría Deportiva</label>
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002F6C] bg-white text-[#1A202C]"
                    >
                      <option value="Accesorios">Accesorios</option>
                      <option value="Balones">Balones</option>
                      <option value="Raquetas">Raquetas</option>
                      <option value="Canchas">Canchas (Infraestructura)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Ubicación Bodega / Sede</label>
                    <input
                      type="text"
                      placeholder="Ej: Casillero Deportes A-1"
                      value={newItemLocation}
                      onChange={(e) => setNewItemLocation(e.target.value)}
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002F6C] bg-white text-[#1A202C]"
                    />
                  </div>
                </div>

                {itemSubmitError && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-[10px] text-red-750 font-bold leading-snug">
                    El sistema detuvo la operación de guardado. Resalte en color rojo los campos requeridos vacíos. Base de datos intacta. El formulario permanece abierto para su corrección.
                  </div>
                )}

                <div className="flex justify-between items-center pt-1">
                  <span className="text-[9px] text-slate-400">Todos los recursos nuevos asimilan el estándar de calidad ISO 25000.</span>
                  <button
                    id="btn-save-new-item"
                    type="submit"
                    className="bg-[#002F6C] hover:bg-[#002554] text-[#FFA000] font-black text-xs py-1.5 px-4 rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    Guardar Implemento
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-800 leading-snug">
              <p className="font-bold flex items-center space-x-1 mb-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Simulador de Stock Corporal e Ingressos (ISO 25010)</span>
              </p>
              Pruebe a cambiar el stock de artículos a cero para validar que al activar <strong>"Solo Disponibles"</strong> en el catálogo inteligente, estos desaparezcan en tiempo real (Solución al BUG-01 de alta severidad detectado en auditorías internas).
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#1a202c] border-b pb-1">Bodegas y Canchas de la Sede</h4>
              
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="p-2.5 rounded-xl border border-slate-150 bg-white flex items-center justify-between text-xs"
                  id={`inventory-edit-item-${item.id}`}
                >
                  <div className="space-y-0.5 truncate max-w-[140px] md:max-w-xs">
                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1 py-0.2 rounded mr-1">
                      {item.type}
                    </span>
                    <strong className="text-[#1A202C] text-[11px] block truncate">{item.name}</strong>
                    <span className="text-[9px] text-[#A0AEC0] block truncate">Locación: {item.location}</span>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      item.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700 font-bold'
                    }`}>
                      {item.stock > 0 ? 'Disponible' : 'Sin Stock'}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onUpdateItemStock(item.id, Math.max(0, item.stock - 1))}
                        className="w-6 h-6 rounded bg-slate-100 text-slate-705 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                        title="Restar Stock"
                        id={`btn-stock-dec-${item.id}`}
                      >
                        -
                      </button>
                      <span className="font-mono font-bold text-xs w-6 text-center" id={`stock-span-${item.id}`}>{item.stock}</span>
                      <button
                        onClick={() => onUpdateItemStock(item.id, Math.min(item.totalStock, item.stock + 1))}
                        className="w-6 h-6 rounded bg-slate-100 text-slate-705 font-bold hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                        title="Sumar Stock"
                        id={`btn-stock-inc-${item.id}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB NEW: LOANS & RETURNS MANAGEMENT (Requested by user: "una de administrador para ver si entregaron") */}
        {activeTab === 'loans' && (
          <div className="space-y-4" id="section-loans">
            
            {/* HU11_04 Automatic cancha cancellation sim and notice */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-start justify-between gap-3 flex-col sm:flex-row">
                <div>
                  <h4 className="font-extrabold text-[#002F6C] flex items-center gap-1">
                    <Clock className="h-4 w-4 text-[#FFA000]" />
                    <span>Liberación Automática de Canchas (HU11_04)</span>
                  </h4>
                  <p className="text-[10.5px] mt-1 text-slate-500">
                    El sistema cuenta con un tolerancia de 15 minutos de retraso. Si el estudiante no escanea su ingreso QR a la cancha, el sistema cancela en automático liberando el stock e historializando.
                  </p>
                </div>
                
                <button
                  onClick={onAutoReleaseCanchas}
                  className="bg-indigo-50 hover:bg-indigo-100 text-[#002F6C] border border-[#002F6C]/20 text-[10px] font-black py-1.5 px-3 rounded-lg flex items-center space-x-1 cursor-pointer shrink-0"
                  id="btn-auto-release-sim"
                >
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Auto-Liberar Canchas (+15m)</span>
                </button>
              </div>
            </div>

            {/* Search filter bar */}
            <div>
              <input
                type="text"
                placeholder="Buscar préstamo por RUT Alumno o Nombre de Implemento..."
                value={loanSearch}
                onChange={(e) => setLoanSearch(e.target.value)}
                className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002F6C] bg-white text-[#1A202C]"
                id="input-loan-search"
              />
            </div>

            {/* Active Loans */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#1a202c] border-b pb-1">
                Préstamos Activos en Custodia ({loans.filter(l => l.status === 'Activo').length})
              </h4>

              {loans.filter(l => l.status === 'Activo').length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed">
                  No hay préstamos activos registrados. Solicite implementos desde el simulador de celular.
                </div>
              ) : (
                loans
                  .filter(l => l.status === 'Activo')
                  .filter(l => {
                    const search = loanSearch.toLowerCase();
                    return l.itemName.toLowerCase().includes(search) || 
                           l.studentName.toLowerCase().includes(search) || 
                           l.studentRut.toLowerCase().includes(search);
                  })
                  .map(loan => {
                    const delay = simulatedReturnDays[loan.id] || 0;
                    return (
                      <div 
                        key={loan.id} 
                        className="p-3 bg-white border border-slate-200 rounded-xl space-y-3 flex flex-col justify-between shadow-xs"
                        id={`loan-card-${loan.id}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded mr-1">
                              {loan.itemType}
                            </span>
                            <span className="font-mono text-[10px] text-[#002F6C] font-extrabold">{loan.folio}</span>
                            <h5 className="font-bold text-xs text-[#1A202C] mt-1">{loan.itemName}</h5>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Solicitante: <strong>{loan.studentName}</strong> • {loan.studentRut}
                            </p>
                            <p className="text-[9px] text-[#A0AEC0]">
                              Fecha Préstamo: {new Date(loan.requestedAt).toLocaleString()}
                            </p>
                          </div>
                          
                          <span className="text-[10px] bg-sky-50 text-sky-800 border-sky-200 border px-2 py-0.5 rounded font-black animate-pulse">
                            En Custodia
                          </span>
                        </div>

                        {/* Interactive return simulator */}
                        <div className="bg-[#F4F6F9] p-2.5 rounded-lg border border-slate-100 space-y-2 text-xs">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] font-bold text-slate-600">Simular retraso:</span>
                              <input
                                type="number"
                                min="0"
                                value={delay}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10) || 0;
                                  setSimulatedReturnDays(prev => ({ ...prev, [loan.id]: val }));
                                }}
                                className="w-12 text-center text-xs p-1 border border-slate-305 bg-white text-[#1a202c] font-bold rounded"
                                id={`input-delay-${loan.id}`}
                              />
                              <span className="text-[10px] text-slate-500">días</span>
                            </div>

                            <button
                              onClick={() => onReturnLoan(loan.id, delay)}
                              className="bg-[#002F6C] hover:bg-[#002554] text-white font-bold text-[10px] py-1 px-3 rounded-lg shadow-inner flex items-center space-x-1 cursor-pointer ml-auto"
                              id={`btn-receive-return-${loan.id}`}
                            >
                              <CheckCircle className="h-3 w-3 text-[#FFA000]" />
                              <span>Escanear y Recibir</span>
                            </button>
                          </div>

                          {delay > 0 && (
                            <p className="text-[9.5px] text-red-600 font-bold bg-red-50 p-1 rounded border-l-2 border-red-500">
                              ⚠️ Alertas de Multa ($5.000/día): Alumno deberá pagar ${(delay * 5000).toLocaleString()} CLP y quedará bloqueado de todo préstamo.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Completed Loans History */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#1a202c] border-b pb-1">
                Historial de Devoluciones y Entregas Realizadas ({loans.filter(l => l.status !== 'Activo').length})
              </h4>
              
              <div className="space-y-2">
                {loans.filter(l => l.status !== 'Activo').map(loan => (
                  <div key={loan.id} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs flex justify-between items-center gap-3">
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="text-[9px] bg-slate-200 text-slate-500 px-1 rounded uppercase font-bold">{loan.itemType}</span>
                        <strong className="text-[#1A202C]">{loan.itemName}</strong>
                      </div>
                      <p className="text-[10px] text-[#A0AEC0] mt-0.5">
                        Devuelto por: {loan.studentName} • Deuda Multa: <strong className="text-red-700">${(loan.fineCharged || 0).toLocaleString()}</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded border ${
                        loan.status === 'Cancelado' ? 'bg-red-50 text-red-750 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {loan.status === 'Cancelado' ? 'Auto-Liberado' : 'Finalizado'}
                      </span>
                      {loan.delayDays !== undefined && loan.delayDays > 0 && (
                        <span className="block text-[8px] text-rose-600 font-bold mt-0.5">+{loan.delayDays} días de retraso</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB NEW: REPORTS & KPIS (HU08_01 and HU08_02) */}
        {activeTab === 'reports' && (
          <div className="space-y-4" id="section-reports">
            
            {/* HU08_01 Real-time filters */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-1">
                <Shield className="h-4 w-4 text-[#002F6C]" />
                <h4 className="text-xs font-bold text-[#1A202C] uppercase tracking-wide">Segmentación de KPI en Tiempo Real (HU08_01)</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Categorías</label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002F6C] bg-white text-[#1a202c]"
                    id="select-report-category"
                  >
                    <option value="Todas">Todas las categorías</option>
                    <option value="Balones">Balones</option>
                    <option value="Raquetas">Raquetas</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Canchas">Canchas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Fecha Desde</label>
                  <input
                    type="date"
                    value={reportStartDate}
                    onChange={(e) => setReportStartDate(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002F6C] bg-white text-slate-705"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Fecha Hasta</label>
                  <input
                    type="date"
                    value={reportEndDate}
                    onChange={(e) => setReportEndDate(e.target.value)}
                    className="w-full text-xs p-1.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#002F6C] bg-white text-slate-705"
                  />
                </div>
              </div>
            </div>

            {/* HU08_02: HIGH-DEMAND LOW-INVENTORY CRITICAL ALERTS */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Control de Quiebres e Inventariado Crítico (HU08_02)</h4>
              
              {/* Scan database in real-time to locate risk items */}
              {items.filter(item => item.stock <= 1).length === 0 ? (
                <div className="p-3 bg-emerald-50 border border-emerald-250 rounded-xl text-xs text-emerald-805 font-bold flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Sede en estado óptimo. Todos los implementos deportivos cuentan con stock saludable.</span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {items
                    .filter(item => item.stock <= 1)
                    .map(item => (
                      <div 
                        key={item.id} 
                        className="p-3 bg-red-50 border-2 border-red-500 rounded-xl flex items-center justify-between text-xs animate-pulse"
                        id={`critical-stock-alert-${item.id}`}
                      >
                        <div className="space-y-1">
                          <span className="text-[8px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded uppercase">
                            🔴 RIESGO DE QUIEBRE CRÍTICO (HU08_02)
                          </span>
                          <h5 className="font-extrabold text-slate-900 mt-1">{item.name}</h5>
                          <p className="text-[10px] text-slate-500 leading-tight">
                            Ratio de solicitudes alto. Stock actual: <strong className="text-red-700">{item.stock} / {item.totalStock}</strong> disponible.
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-bold bg-[#FFA000] text-[#002F6C] px-2 py-0.5 rounded font-black">
                            Accionar Compra
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Interactive KPIs stats cards based on filter */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs font-bold text-slate-900">
              <div className="bg-[#002F6C] text-white p-3 rounded-xl border border-[#002F6C] shadow-xs flex flex-col justify-between">
                <span className="text-white/60 text-[9px] block">Préstamos Registrados</span>
                <span className="text-lg font-black mt-2 font-mono">
                  {reportCategory === 'Todas' 
                    ? loans.length 
                    : loans.filter(l => l.itemType === (reportCategory === 'Canchas' ? 'Cancha' : 'Implemento')).length}
                </span>
                <span className="text-[8px] text-[#FFA000] block mt-1 tracking-wider uppercase font-semibold">Duoc Deportes</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-slate-400 text-[9px] block">Tasa de Devoluciones</span>
                <span className="text-lg font-black mt-2 font-mono text-[#002F6C]">
                  {loans.length > 0 
                    ? Math.round((loans.filter(l => l.status === 'Devuelto').length / loans.length) * 105) 
                    : 100}%
                </span>
                <span className="text-[8px] text-green-700 block mt-1 uppercase font-semibold">94% a tiempo</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-slate-400 text-[9px] block">Multas Acumuladas</span>
                <span className="text-lg font-black mt-2 font-mono text-red-700">
                  ${loans.reduce((acc, current) => acc + (current.fineCharged || 0), 0).toLocaleString()}
                </span>
                <span className="text-[8px] text-red-500 block mt-1 uppercase font-semibold">Por Devolución Tardía</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
                <span className="text-slate-400 text-[9px] block">Auto-Liberados (HU11_04)</span>
                <span className="text-lg font-black mt-2 font-mono text-slate-700">
                  {loans.filter(l => l.autoReleased).length} Cancha(s)
                </span>
                <span className="text-[8px] text-indigo-700 block mt-1 uppercase font-semibold">Inasistencias</span>
              </div>
            </div>

            {/* Zero dependency beautifully styled progressive statistics bars */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-xs">
              <h4 className="text-xs font-black text-slate-900 border-b pb-1.5 uppercase tracking-wide">
                Estadísticas de Uso por Categoría
              </h4>
              
              <div className="space-y-3 text-xs leading-none">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-700">Balones (Fútbol, Básquet, Vóley)</span>
                    <span className="font-mono text-[#002F6C]">70% Demanda</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#002F6C] h-full rounded-full transition-all duration-500" style={{ width: '70%' }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-700">Raquetas & Palas (Pádel, Tenis de Mesa)</span>
                    <span className="font-mono text-[#002F6C]">45% Demanda</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#002F6C] h-full rounded-full transition-all duration-500" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-700">Accesorios (Set de Mesa, Infladores)</span>
                    <span className="font-mono text-[#002F6C]">15% Demanda</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#002F6C] h-full rounded-full transition-all duration-500" style={{ width: '15%' }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-slate-700">Canchas (Multicancha Sede, Pádel Crystal)</span>
                    <span className="font-mono text-[#002F6C]">85% Demanda</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#FFA000] h-full rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: BUGS REGISTER & CHANGELOGS */}
        {activeTab === 'bugs' && (
          <div className="space-y-4" id="section-bugs">
            <div>
              <h3 className="text-xs font-bold text-slate-900 border-b pb-1 uppercase tracking-wide">Registro Oficial de Defectos (Bugs)</h3>
              <div className="space-y-3 mt-2">
                {bugs.map((bug) => (
                  <div key={bug.id} className="p-3 bg-red-50 border border-slate-200 rounded-xl" id={`bug-item-${bug.id}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-extrabold text-[#002F6C]">{bug.id}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${getSeverityBadge(bug.severity)}`}>
                          Severidad {bug.severity}
                        </span>
                      </div>
                      <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded flex items-center space-x-1">
                        <span className="w-1 h-1 bg-green-600 rounded-full"></span>
                        <span>{bug.status}</span>
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#1A202C] mt-2">{bug.title}</h4>
                    <p className="text-[10px] text-slate-600 mt-1 italic"><strong>Problema: </strong>{bug.description}</p>
                    
                    <div className="bg-white p-2 rounded border border-slate-250 mt-2 text-[10px] leading-snug">
                      <strong className="text-green-800">Solución Técnica Aplicada: </strong>
                      <span className="text-slate-700">{bug.solution}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-xs font-bold text-slate-900 border-b pb-1 uppercase tracking-wide">Control de Cambios del Proyecto</h3>
              <div className="space-y-3 mt-2">
                {changeLogs.map((log) => (
                  <div key={log.code} className="p-3 bg-slate-50 rounded-xl border border-slate-200" id={`changelog-item-${log.code}`}>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-[#002F6C] font-mono">{log.code} ({log.version})</span>
                      <span className="text-slate-400 text-[10px]">Aprobado</span>
                    </div>
                    <h4 className="text-xs font-extrabold text-[#1A202C] mt-1">{log.description}</h4>
                    <ul className="list-disc pl-4 mt-1.5 space-y-1 text-[9.5px] text-slate-500">
                      {log.details.map((detail, idx) => (
                        <li key={idx}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Footer statistics regarding ISO 25000 */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#A0AEC0] shrink-0 font-medium bg-[#002F6C]/5 p-2 rounded-lg gap-2">
        <div className="flex items-center space-x-1.5">
          <Activity className="h-4 w-4 text-[#002F6C] shrink-0" />
          <span>ISO 25010 Evaluated: <strong className="text-[#1A202C]">100% Cobertura</strong></span>
        </div>
        <div className="text-right">
          <span className="font-mono text-[10px] font-bold text-[#002F6C]" id="qa-stats-text">
            {testCases.filter(t => t.status === 'Pasó').length} de 13 Casos OK
          </span>
        </div>
      </div>
    </div>
  );
}

// Minimal placeholder component to satisfy TypeScript compilation
function AlertCircle() {
  return <AlertTriangle className="h-3.5 w-3.5 shrink-0" />;
}
