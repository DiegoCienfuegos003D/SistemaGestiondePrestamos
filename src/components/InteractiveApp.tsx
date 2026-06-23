import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Search, Filter, CheckCircle2, AlertTriangle, 
  XSquare, LogOut, FileText, MapPin, Layers, History, Clock, Check
} from 'lucide-react';
import { Item, Student, Loan, StudentStatus } from '../types';

interface InteractiveAppProps {
  currentStudent: Student | null;
  onLogin: (rut: string, pass: string) => boolean;
  onLogout: () => void;
  items: Item[];
  onUpdateItemStock: (itemId: string, newStock: number) => void;
  loans: Loan[];
  onCreateLoan: (item: Item) => string | null; // returns folio if success, else null
  simulatedLag: boolean;
  onShowRejectOverlay: (reason: string) => void;
  // State from parent to trigger specific screen or fields for manual test runner or QA control
  selectedScreen: string;
  setSelectedScreen: React.Dispatch<React.SetStateAction<string>>;
  loginRut: string;
  setLoginRut: React.Dispatch<React.SetStateAction<string>>;
  loginPass: string;
  setLoginPass: React.Dispatch<React.SetStateAction<string>>;
  loginError: string;
  setLoginError: React.Dispatch<React.SetStateAction<string>>;
  showEmptyRutHighlight: boolean;
  setShowEmptyRutHighlight: React.Dispatch<React.SetStateAction<boolean>>;
  showEmptyPassHighlight: boolean;
  setShowEmptyPassHighlight: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function InteractiveApp({
  currentStudent,
  onLogin,
  onLogout,
  items,
  onUpdateItemStock,
  loans,
  onCreateLoan,
  simulatedLag,
  onShowRejectOverlay,
  selectedScreen,
  setSelectedScreen,
  loginRut,
  setLoginRut,
  loginPass,
  setLoginPass,
  loginError,
  setLoginError,
  showEmptyRutHighlight,
  setShowEmptyRutHighlight,
  showEmptyPassHighlight,
  setShowEmptyPassHighlight
}: InteractiveAppProps) {
  
  // App local controls
  const [activeCategory, setActiveCategory] = useState<'Todos' | 'Implemento' | 'Cancha'>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Last successfully generated loan details for Comprobante view
  const [lastLoan, setLastLoan] = useState<Loan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clickCount, setClickCount] = useState(0); // To demonstrate double-click prevention
  const [showDoubleClickPreventionAlert, setShowDoubleClickPreventionAlert] = useState(false);

  // Rejection overlay control (HU09 and HU06 and ISO 25000)
  const [rejectionMessage, setRejectionMessage] = useState<string | null>(null);

  // Sync route based on selectedScreen prop
  useEffect(() => {
    if (selectedScreen === 'Login' && currentStudent) {
      onLogout();
    }
  }, [selectedScreen]);

  const handleLocalLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setShowEmptyRutHighlight(false);
    setShowEmptyPassHighlight(false);

    let hasError = false;
    if (!loginRut.trim()) {
      setShowEmptyRutHighlight(true);
      hasError = true;
    }
    if (!loginPass.trim()) {
      setShowEmptyPassHighlight(true);
      hasError = true;
    }

    if (hasError) {
      setLoginError('Los campos indicados con borde rojo son estrictamente obligatorios.');
      return;
    }

    const success = onLogin(loginRut, loginPass);
    if (success) {
      setSelectedScreen('Home');
    } else {
      setLoginError('Credenciales incorrectas. Pruebe los accesos rápidos de prueba de la derecha.');
    }
  };

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setSelectedScreen('Detalle');
  };

  const handleRequestExpress = async () => {
    if (!currentStudent) {
      setLoginError("Debe iniciar sesión para solicitar.");
      setSelectedScreen('Login');
      return;
    }

    if (!selectedItem) return;

    // Track click count for tracking CP-04 (double click warning)
    setClickCount((prev) => prev + 1);

    // If already submitting/loading, block secondary action
    if (isSubmitting) {
      setShowDoubleClickPreventionAlert(true);
      setTimeout(() => setShowDoubleClickPreventionAlert(false), 2000);
      return;
    }

    // Safety check 1: Stock must be > 0
    if (selectedItem.stock <= 0) {
      setRejectionMessage(`El elemento "${selectedItem.name}" no tiene stock disponible en este instante.`);
      setSelectedScreen('Rechazado');
      onShowRejectOverlay(`El elemento "${selectedItem.name}" no tiene stock.`);
      return;
    }

    // Safety check 2: Moroso
    if (currentStudent.status === 'Moroso') {
      setRejectionMessage(`Operación Rechazada: El estudiante registra estado "Moroso" en la base de datos de la institución.`);
      setSelectedScreen('Rechazado');
      onShowRejectOverlay(`Bloqueo por Morosidad: El RUT ${currentStudent.rut} posee multas o deudas pendientes.`);
      return;
    }

    // Safety check 3: Suspendido
    if (currentStudent.status === 'Suspendido') {
      setRejectionMessage(`Operación Rechazada: Su matrícula figura como "Suspendido" en los registros de Duoc UC.`);
      setSelectedScreen('Rechazado');
      onShowRejectOverlay(`Bloqueo Institucional: Estado académica suspendida temporalmente.`);
      return;
    }

    // Safety check 4: Limit of 3 active loans
    if (currentStudent.activeLoansCount >= 3) {
      setRejectionMessage(`Operación Rechazada: Ha alcanzado el límite máximo de 3 préstamos o reservas activas simultáneas.`);
      setSelectedScreen('Rechazado');
      onShowRejectOverlay(`Límite Excedido: Alumno ya cuenta con ${currentStudent.activeLoansCount} reservas activas.`);
      return;
    }

    // Process loan
    setIsSubmitting(true);

    const processTime = simulatedLag ? 3000 : 250;

    setTimeout(() => {
      const folio = onCreateLoan(selectedItem);
      if (folio) {
        // Find newly created loan
        const mockLoan: Loan = {
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
        setLastLoan(mockLoan);
        setSelectedScreen('Success');
      } else {
        setRejectionMessage("Error al procesar la solicitud. Stock agotado en tiempo real.");
        setSelectedScreen('Rechazado');
      }
      setIsSubmitting(false);
      setClickCount(0);
    }, processTime);
  };

  // Helper to render responsive Category Icons
  const getItemEmoji = (imageName: string) => {
    switch (imageName) {
      case 'Futbol': return '⚽';
      case 'Basquetbol': return '🏀';
      case 'Tenis': return '🎾';
      case 'Padel': return '🏸';
      case 'Voleibol': return '🏐';
      case 'Pingpong': return '🏓';
      case 'CanchaFútbol': return '🏟️';
      case 'CanchaTenis': return '🎾🏟️';
      case 'Gym': return '🏢';
      case 'CanchaPadel': return '🟦';
      default: return '📍';
    }
  };

  // Filter items in real time (Correcting BUG-01 using strict item.stock > 0 condition when onlyAvailable is activated)
  const filteredItems = items.filter(item => {
    // 1. Category
    if (activeCategory !== 'Todos' && item.type !== activeCategory) {
      return false;
    }
    // 2. Search Query
    if (searchQuery.trim() && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // 3. Only available (BUG-01 FIXED: if active, item.stock MUST be greater than 0)
    if (onlyAvailable && item.stock <= 0) {
      return false;
    }
    return true;
  });

  return (
    <div className="relative mx-auto w-[360px] h-[720px] bg-white rounded-[40px] border-[12px] border-slate-900 shadow-2xl overflow-hidden flex flex-col font-sans" id="smartphone-container">
      {/* Speaker and Camera notch representation */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-[24px] bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center">
        <div className="w-16 h-1 bg-slate-800 rounded-full mb-1"></div>
        <div className="w-2.5 h-2.5 bg-slate-800 rounded-full ml-2 mb-1"></div>
      </div>

      {/* Screen Area */}
      <div className="flex-1 overflow-y-auto pt-6 flex flex-col bg-white">
        
        {/* LOGIN SCREEN */}
        {selectedScreen === 'Login' && (
          <div className="flex-1 flex flex-col px-6 justify-center" id="screen-login">
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-[#002F6C] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform">
                <span className="text-white text-2xl font-bold font-mono">D</span>
              </div>
              <h2 className="text-[#002F6C] text-xl font-bold mt-3 tracking-tight">DUOC UC DEPORTES</h2>
              <p className="text-[#A0AEC0] text-xs font-medium">Sistema de Préstamos e Implementos</p>
            </div>

            <form onSubmit={handleLocalLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1A202C] mb-1">RUT</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-[#A0AEC0]" />
                  <input 
                    id="input-login-rut"
                    type="text" 
                    placeholder="Ej: 12.345.678-9" 
                    value={loginRut}
                    onChange={(e) => {
                      setLoginRut(e.target.value);
                      setShowEmptyRutHighlight(false);
                    }}
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white text-[#1A202C] focus:outline-none focus:ring-1 focus:ring-[#002F6C] transition-all ${
                      showEmptyRutHighlight 
                        ? 'border-red-500 bg-red-50 focus:ring-red-500' 
                        : 'border-slate-200'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-[#A0AEC0] mt-0.5">Ej: 12.345.678-9 (Use puntos y guión)</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1A202C] mb-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#A0AEC0]" />
                  <input 
                    id="input-login-password"
                    type="password" 
                    placeholder="••••••••" 
                    value={loginPass}
                    onChange={(e) => {
                      setLoginPass(e.target.value);
                      setShowEmptyPassHighlight(false);
                    }}
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-white text-[#1A202C] focus:outline-none focus:ring-1 focus:ring-[#002F6C] transition-all ${
                      showEmptyPassHighlight 
                        ? 'border-red-500 bg-red-50 focus:ring-red-500' 
                        : 'border-slate-200'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-[#A0AEC0] mt-0.5">Contraseña genérica para alumnos: <strong className="text-slate-650 font-mono">duoc2026</strong></p>
              </div>

              {loginError && (
                <div className="p-2.5 rounded bg-red-50 border-l-4 border-red-500 text-[11px] text-red-700 font-medium" id="login-error-msg">
                  {loginError}
                </div>
              )}

              <button 
                id="btn-login"
                type="submit"
                className="w-full bg-[#002F6C] hover:bg-[#002554] text-white py-2.5 px-4 rounded-lg font-bold text-sm tracking-wide shadow-md cursor-pointer transition-colors mt-2"
              >
                Ingresar
              </button>
            </form>

            <div className="mt-8 pt-4 border-t border-slate-100 text-center">
              <span className="text-[10px] font-bold text-[#002F6C] opacity-75 uppercase">Normativa ISO 25000 (SQuaRE)</span>
              <p className="text-[9px] text-[#A0AEC0] mt-1 max-w-[280px] mx-auto leading-relaxed">
                Este portal móvil está construido bajo los rigurosos estándares de seguridad y adecuación funcional informática de Duoc UC.
              </p>
            </div>
          </div>
        )}

        {/* HOME & CATALOGUE SCREEN */}
        {selectedScreen === 'Home' && currentStudent && (
          <div className="flex-1 flex flex-col bg-[#F4F6F9]" id="screen-catalog">
            {/* Student Header Card */}
            <div className="bg-[#002F6C] text-white px-4 pt-3 pb-4 rounded-b-[24px] shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full transform translate-x-8 -translate-y-8 pointer-events-none"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center font-bold">
                    {currentStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold truncate max-w-[170px]" id="student-header-name">{currentStudent.name}</h3>
                    <p className="text-[9px] text-slate-300 truncate max-w-[170px]">{currentStudent.career}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {/* Status Badge */}
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    currentStudent.status === 'Normal' ? 'bg-green-600 text-white' :
                    currentStudent.status === 'Moroso' ? 'bg-red-500 text-white' :
                    'bg-slate-700 text-white'
                  }`} id="student-status-badge">
                    {currentStudent.status}
                  </span>
                  
                  <button 
                    onClick={onLogout} 
                    className="p-1.5 hover:bg-white/20 rounded-full transition-all text-slate-200 hover:text-white cursor-pointer relative z-20"
                    title="Cerrar sesión"
                    id="btn-signout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Loans quota tracker */}
              <div className="mt-3.5 bg-white/10 px-3 py-1.5 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#FFA000]" />
                  <span className="font-semibold text-[11px]">Reservas Activas:</span>
                </div>
                <span className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                  currentStudent.activeLoansCount >= 3 ? 'bg-red-500/20 text-red-100' : 'text-[#FFA000]'
                }`} id="span-active-loans-count">
                  {currentStudent.activeLoansCount} / 3 solicitadas
                </span>
              </div>
            </div>

            {/* Quick Filter Section */}
            <div className="p-3 bg-white border-b border-slate-100 shadow-xs space-y-2.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.2 h-3.5 w-3.5 text-[#A0AEC0]" />
                <input 
                  type="text"
                  placeholder="Buscar implemento o cancha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-[#1A202C] focus:outline-none focus:ring-1 focus:ring-[#002F6C]"
                />
              </div>

              {/* Solo disponibles filter & ISO metric info */}
              <div className="flex items-center justify-between bg-[#F4F6F9] px-2 py-1.5 rounded-lg">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold text-[#1A202C]">Filtro:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      id="checkbox-filter-available"
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={onlyAvailable}
                      onChange={(e) => setOnlyAvailable(e.target.checked)}
                    />
                    <div className="w-7 h-4 bg-slate-300 rounded-full peer peer-focus:ring-1 peer-focus:ring-[#002F6C] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#002F6C]"></div>
                    <span className="ml-1 text-[10px] text-[#1A202C] font-semibold">Solo Disponibles</span>
                  </label>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="text-[8px] font-mono font-bold text-green-700 bg-green-50 px-1 py-0.2 rounded hover:underline">
                    BUG-01 Corregido
                  </span>
                </div>
              </div>

              {/* Segmented control for Type */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-lg">
                {(['Todos', 'Implemento', 'Cancha'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveCategory(t)}
                    className={`py-1 text-[10px] font-bold rounded-md transition-colors cursor-pointer ${
                      activeCategory === t 
                        ? 'bg-white text-[#002F6C] shadow-sm' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {t === 'Todos' ? '📂 Todo' : t === 'Implemento' ? '🏓 Herramientas' : '🏟️ Espacios'}
                  </button>
                ))}
              </div>
            </div>

            {/* List scroll */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
              <p className="text-[10px] font-bold text-[#A0AEC0] uppercase tracking-wider mb-1">Catálogo de Artículos Duoc</p>
              
              {filteredItems.length === 0 ? (
                <div className="bg-white p-6 rounded-xl border border-slate-150 text-center space-y-2">
                  <span className="text-2xl">🔍</span>
                  <p className="text-xs text-[#1A202C] font-semibold">No se encontraron artículos</p>
                  <p className="text-[10px] text-[#A0AEC0]">Pruebe a desactivar el filtro "Solo Disponibles" o cambie su patrón de búsqueda.</p>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="bg-white p-2.5 rounded-xl border border-slate-150 shadow-xs hover:border-[#002F6C] cursor-pointer transition-all flex items-center justify-between hover:shadow-sm"
                    id={`catalog-item-${item.id}`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-10 h-10 bg-[#F4F6F9] rounded-lg flex items-center justify-center text-xl shadow-inner shrink-0">
                        {getItemEmoji(item.image)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-[8px] font-bold px-1 rounded uppercase ${
                            item.type === 'Implemento' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-[9px] text-[#A0AEC0] shrink-0 truncate max-w-[80px]">
                            {item.category}
                          </span>
                        </div>
                        <h4 className="text-[11px] font-bold text-[#1A202C] truncate max-w-[160px]">{item.name}</h4>
                        <p className="text-[9px] text-[#A0AEC0] truncate max-w-[160px]">{item.location}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-mono leading-none">
                        <span className="text-[#A0AEC0]">Stock: </span>
                        <span className={`font-bold ${item.stock > 0 ? 'text-[#1A202C]' : 'text-red-500 bg-red-50 px-1 py-0.2 rounded'}`}>
                          {item.stock} / {item.totalStock}
                        </span>
                      </div>
                      
                      <span className="inline-block mt-1 text-[9px] text-[#002F6C] hover:underline font-bold">
                        Reservar ➡️
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* DETALLE Y RESERVA EXPRESS SCREEN */}
        {selectedScreen === 'Detalle' && selectedItem && currentStudent && (
          <div className="flex-1 flex flex-col p-4 space-y-4" id="screen-detail">
            {/* Header with back */}
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
              <button 
                onClick={() => setSelectedScreen('Home')} 
                className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-[#002F6C] font-semibold text-xs flex items-center"
                id="btn-back-to-catalog"
              >
                ◀ Volver
              </button>
              <span className="text-xs font-bold text-[#1A202C] truncate">Confirme su Solicitud</span>
            </div>

            {/* Item Card Large */}
            <div className="bg-[#F4F6F9] p-4 rounded-2xl border border-slate-200 text-center space-y-2">
              <span className="text-4xl block">{getItemEmoji(selectedItem.image)}</span>
              <h3 className="text-sm font-bold text-[#1A202C]">{selectedItem.name}</h3>
              
              <div className="inline-flex space-x-1.5 items-center bg-white border border-slate-200 px-3 py-1 rounded-full text-[10px] text-slate-600 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span>Disponible para retiro inmediato</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-left pt-2 text-[10px] border-t border-slate-200">
                <div>
                  <span className="text-[#A0AEC0] block">Categoría</span>
                  <span className="font-bold text-[#1A202C]">{selectedItem.category}</span>
                </div>
                <div>
                  <span className="text-[#A0AEC0] block">Stock Disponible</span>
                  <span className="font-mono font-bold text-slate-800">{selectedItem.stock} unidades</span>
                </div>
                <div>
                  <span className="text-[#A0AEC0] block">Llocación</span>
                  <span className="font-bold text-[#1A202C] truncate">{selectedItem.location}</span>
                </div>
                <div>
                  <span className="text-[#A0AEC0] block">Autoriza</span>
                  <span className="font-bold text-[#002F6C]">Sede Duoc UC</span>
                </div>
              </div>
            </div>

            {/* Validation warning list */}
            <div className="bg-amber-50 rounded-xl p-2.5 border border-amber-200 space-y-1">
              <p className="text-[10px] font-bold text-[#FFA000] flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                <span>DECLARACIÓN DE RESPONSABILIDAD (ISO 25000)</span>
              </p>
              <p className="text-[9px] text-[#1A202C] leading-snug">
                Al presionar "Solicitar" acepto devolver este material dentro del plazo permitido (máximo 4 horas). En caso de daños o pérdidas, se suspenderán mis privilegios de biblioteca y deportes.
              </p>
            </div>

            {/* Loan Button with double-click throttling */}
            <div className="pt-2">
              {showDoubleClickPreventionAlert && (
                <div className="mb-2 p-1 text-center bg-amber-100 text-amber-800 text-[9px] font-bold rounded animate-pulse">
                  ⚠️ Control Doble Clic: Acción bloqueada para prevenir folio duplicado.
                </div>
              )}

              <button
                id="btn-confirm-loan"
                disabled={isSubmitting}
                onClick={handleRequestExpress}
                className={`w-full py-2.5 px-4 rounded-xl text-white font-bold text-sm tracking-wide shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                  isSubmitting ? 'bg-slate-400 cursor-not-allowed opacity-75' : 'bg-[#002F6C] hover:bg-[#00204d]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin text-xs">🌀</span>
                    <span>Procesando... {simulatedLag ? '(Lag simulado)' : ''}</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Préstamo Express</span>
                  </>
                )}
              </button>
              
              <div className="mt-1.5 flex items-center justify-center space-x-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></span>
                <span className="text-[8px] text-slate-400 text-center block">Tolerancia a Lag de red móvil activado</span>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESFUL LOAN COMPROBANTE SCREEN */}
        {selectedScreen === 'Success' && lastLoan && (
          <div className="flex-1 flex flex-col p-4 justify-between" id="screen-success">
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <Check className="h-6 w-6 stroke-[3px]" />
                </div>
                <h3 className="text-sm font-bold text-green-700">¡Préstamo Generado!</h3>
                <p className="text-[10px] text-slate-500">Comprobante Único de Transacción Digital</p>
              </div>

              {/* Bill Details */}
              <div className="bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200 text-xs text-[#1A202C] space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-400 font-bold">FOLIO DIGITAL</span>
                  <span className="font-mono font-bold text-[#002F6C]" id="success-folio-txt">{lastLoan.folio}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Estudiante</span>
                    <span className="font-bold truncate block">{lastLoan.studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">RUT Alumno</span>
                    <span className="font-bold truncate block">{lastLoan.studentRut}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Artículo Solicitado</span>
                    <span className="font-bold truncate text-orange-850 block">{lastLoan.itemName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tipo / Categoría</span>
                    <span className="font-mono block truncate">{lastLoan.itemType}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-[#002F6C]" />
                  <span className="text-[10px]">
                    Retirar en: <strong className="text-[#002F6C]">Bodega de Deportes</strong>
                  </span>
                </div>

                <div className="text-[9px] text-slate-400 text-center italic pt-1.5">
                  Generado el {lastLoan.requestedAt.toLocaleTimeString()} - Expira en 4 horas.
                </div>
              </div>

              {/* QR Code Simulation */}
              <div className="flex flex-col items-center justify-center bg-white p-2 border rounded-xl max-w-[140px] mx-auto shadow-inner">
                <div className="grid grid-cols-8 gap-0.5 w-24 h-24 bg-slate-900 justify-center p-1.5 rounded">
                  {/* Simulate black/white matrix squares */}
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-full h-full rounded-[1px] ${
                        (i % 3 === 0 || i % 7 === 0 || i < 8 || i > 56 || i % 8 === 0) 
                          ? 'bg-white' 
                          : 'bg-black'
                      }`}
                    ></div>
                  ))}
                </div>
                <span className="text-[8px] font-mono font-bold text-slate-400 mt-1">VERIFICADOR DUOC</span>
              </div>
            </div>

            <button
              id="btn-success-close"
              onClick={() => setSelectedScreen('Home')}
              className="w-full bg-[#002F6C] hover:bg-[#002554] text-white py-2 px-4 rounded-xl font-bold text-xs shadow cursor-pointer text-center"
            >
              Volver al Catálogo
            </button>
          </div>
        )}

        {/* REJECTED OVERLAY / SCREEN (HU09 and HU06/CP-06) */}
        {selectedScreen === 'Rechazado' && (
          <div className="flex-1 bg-gradient-to-b from-red-700 to-red-900 text-white p-5 flex flex-col justify-between" id="screen-rejected">
            <div className="space-y-6 pt-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-[#FFA000] border-2 border-[#FFA000] shadow-lg animate-pulse" id="reject-warning-icon">
                  <AlertTriangle className="h-8 w-8 text-[#FFA000]" />
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider text-red-100">Operación Rechazada</h3>
                <span className="block w-12 h-1 bg-[#FFA000] mx-auto rounded"></span>
                <p className="text-[10px] text-red-200">VALIDACIÓN INSTITUCIONAL DE SEGURIDAD (ISO 25000)</p>
              </div>

              {/* Rejection Details Container */}
              <div className="bg-black/20 p-4 rounded-xl border border-white/10 space-y-3 shadow-inner">
                <div className="flex items-start space-x-2">
                  <XSquare className="h-4 w-4 text-[#FFA000] shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-white leading-relaxed" id="rejection-reason-body">
                    {rejectionMessage || "No cumple con las normativas vigentes para recibir nuevos préstamos."}
                  </p>
                </div>

                <div className="text-[9px] text-red-200 border-t border-white/5 pt-2 leading-relaxed">
                  <strong>Reglamento Deportivo Sede Duoc UC:</strong> No se autorizan préstamos de canchas o implementos si el estudiante registra morosidades deportivas, de biblioteca, o se encuentra bajo suspensión de matrícula.
                </div>
              </div>

              {/* Status information */}
              {currentStudent && (
                <div className="bg-white/10 p-2.5 rounded-lg text-[10px] flex justify-between items-center text-red-50">
                  <div>
                    <span className="block text-white/55 text-[8px] uppercase font-bold">Usted Registra:</span>
                    <strong className="text-sm">{currentStudent.name}</strong>
                  </div>
                  <span className="bg-red-500 font-bold px-2 py-0.5 rounded text-[10px]">
                    {currentStudent.status === 'Normal' ? 'Normal (Límite Superado)' : currentStudent.status}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                id="btn-close-rejection-screen"
                onClick={() => setSelectedScreen('Home')}
                className="w-full bg-[#FFA000] text-[#1A202C] hover:bg-[#ffb330] py-2.5 px-4 rounded-xl font-bold text-xs shadow-md transition-colors text-center cursor-pointer"
              >
                Cerrar e Ir al Catálogo
              </button>
              
              <button
                onClick={() => setSelectedScreen('Login')}
                className="w-full bg-white/10 hover:bg-white/20 text-white py-1.5 px-4 rounded-xl font-medium text-[10px] transition-colors text-center cursor-pointer"
              >
                🔒 Salir e Iniciar con otro Alumno
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Navigation Simulation Bottom Bar */}
      <div className="h-[40px] bg-slate-900 border-t border-slate-800 flex items-center justify-around text-slate-500 text-xs px-6">
        <button 
          onClick={() => {
            if (currentStudent) {
              setSelectedScreen('Home');
            } else {
              setSelectedScreen('Login');
            }
          }}
          className={`flex flex-col items-center cursor-pointer ${
            ['Home', 'Detalle', 'Success'].includes(selectedScreen) ? 'text-[#FFA000]' : 'text-slate-500'
          }`}
          title="Catálogo"
        >
          <Layers className="h-4 w-4" />
          <span className="text-[8px] font-bold">Catálogo</span>
        </button>
        
        {/* Simulate physical home button indicator */}
        <div className="w-24 h-1 bg-slate-700 rounded-full"></div>

        <button 
          onClick={() => {
            if (currentStudent) {
              setSelectedScreen('Success');
            }
          }}
          disabled={!lastLoan}
          className={`flex flex-col items-center ${
            selectedScreen === 'Success' ? 'text-[#FFA000]' : lastLoan ? 'text-slate-400 cursor-pointer' : 'opacity-40 cursor-not-allowed'
          }`}
          title="Mi Ticket"
        >
          <FileText className="h-4 w-4" />
          <span className="text-[8px] font-bold">Último Ticket</span>
        </button>
      </div>
    </div>
  );
}
