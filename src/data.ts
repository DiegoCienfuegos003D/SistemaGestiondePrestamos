import { Item, Student, TestCase, Bug, ChangeLog } from './types';

export const INITIAL_STUDENTS: Student[] = [
  {
    rut: "12.345.678-9",
    name: "Felipe Soto",
    career: "Técnico en Deportes",
    status: "Normal",
    email: "fe.soto@duocuc.cl",
    activeLoansCount: 0
  },
  {
    rut: "20.111.222-3",
    name: "María Paz Rojas",
    career: "Ingeniería en Informática",
    status: "Moroso",
    email: "ma.rojasr@duocuc.cl",
    activeLoansCount: 1
  },
  {
    rut: "18.444.555-K",
    name: "Sebastián Gómez",
    career: "Animación Digital",
    status: "Suspendido",
    email: "se.gomezg@duocuc.cl",
    activeLoansCount: 0
  },
  {
    rut: "15.999.888-7",
    name: "Constanza Silva",
    career: "Diseño Gráfico",
    status: "Normal",
    email: "co.silvax@duocuc.cl",
    activeLoansCount: 3 // Demostrará el límite de reservas activas por alumno
  }
];

export const INITIAL_ITEMS: Item[] = [
  {
    id: "item-1",
    name: "Balón de Fútbol N°5",
    type: "Implemento",
    category: "Fútbol",
    image: "Futbol",
    stock: 5,
    totalStock: 8,
    location: "Bodega de Deportes A"
  },
  {
    id: "item-2",
    name: "Balón de Básquetbol Spalding",
    type: "Implemento",
    category: "Básquetbol",
    image: "Basquetbol",
    stock: 2,
    totalStock: 4,
    location: "Bodega de Deportes A"
  },
  {
    id: "item-3",
    name: "Raqueta de Tenis Babolat",
    type: "Implemento",
    category: "Tenis",
    image: "Tenis",
    stock: 4,
    totalStock: 6,
    location: "Gabinete Deportes B"
  },
  {
    id: "item-4",
    name: "Set de Pádel (2 Palas + Pelotas)",
    type: "Implemento",
    category: "Pádel",
    image: "Padel",
    stock: 0, // Stock Cero para probar el filtro
    totalStock: 3,
    location: "Gabinete Deportes B"
  },
  {
    id: "item-5",
    name: "Balón de Vóleibol Molten",
    type: "Implemento",
    category: "Vóleibol",
    image: "Voleibol",
    stock: 0, // Stock Cero para corroborar BUG-01
    totalStock: 4,
    location: "Bodega de Deportes A"
  },
  {
    id: "item-6",
    name: "Set de Tenis de Mesa (Paletas)",
    type: "Implemento",
    category: "Tenis de Mesa",
    image: "Pingpong",
    stock: 6,
    totalStock: 10,
    location: "Gabinete Deportes C"
  },
  {
    id: "cancha-1",
    name: "Cancha de Fútbol 7 Pasto Sintético",
    type: "Cancha",
    category: "Cancha de Fútbol",
    image: "CanchaFútbol",
    stock: 1,
    totalStock: 1,
    location: "Sector Canchas Exterior"
  },
  {
    id: "cancha-2",
    name: "Cancha de Tenis N°1",
    type: "Cancha",
    category: "Cancha de Tenis",
    image: "CanchaTenis",
    stock: 1,
    totalStock: 1,
    location: "Sector Canchas Exterior"
  },
  {
    id: "cancha-3",
    name: "Gimnasio Multiuso Cancha Principal",
    type: "Cancha",
    category: "Multiuso",
    image: "Gym",
    stock: 1,
    totalStock: 1,
    location: "Edificio Deportivo Nivel 1"
  },
  {
    id: "cancha-4",
    name: "Cancha de Pádel Crystal N°1",
    type: "Cancha",
    category: "Cancha de Pádel",
    image: "CanchaPadel",
    stock: 0, // Reservado / No disponible para demostrar filtro canchas
    totalStock: 1,
    location: "Sector Canchas Exterior"
  }
];

export const INITIAL_TEST_CASES: TestCase[] = [
  {
    id: "CP-01",
    title: "Autenticación válida y carga rápida",
    hu: "HU01",
    context: "Estudiante ingresa RUT y contraseña válidos (Felipe Soto o María Paz)",
    event: "Presiona botón 'Ingresar'",
    expectedResult: "Carga datos de carrera en <2 segundos y avanza a Home_Estudiante.",
    status: "Sin Ejecutar",
    isoCharacteristic: "Adecuación Funcional / Comportamiento Temporal"
  },
  {
    id: "CP-02",
    title: "Control de campos obligatorios vacíos",
    hu: "HU01",
    context: "Campos RUT o de Contraseña se dejan vacíos",
    event: "Intenta presionar 'Ingresar'",
    expectedResult: "Bloquea el botón, detiene flujo y destaca el campo faltante en rojo.",
    status: "Sin Ejecutar",
    isoCharacteristic: "Tolerancia a Fallos / Protección contra Errores de Usuario"
  },
  {
    id: "CP-03",
    title: "Confirmación de solicitud de stock positivo",
    hu: "HU-03",
    context: "El artículo o cancha seleccionado tiene stock > 0",
    event: "Presiona 'Solicitar'",
    expectedResult: "Resta 1 unidad de stock y crea Código de Folio Único visible.",
    status: "Sin Ejecutar",
    isoCharacteristic: "Corrección Funcional"
  },
  {
    id: "CP-04",
    title: "Control de doble clic ante Lag móvil",
    hu: "HU-03",
    context: "Estudiante con latencia física en red",
    event: "Hace clic doble de forma extremadamente rápida en 'Solicitar'",
    expectedResult: "Se bloquea el botón al instante; procesa exclusivamente el primer clic evitando duplicados.",
    status: "Sin Ejecutar",
    isoCharacteristic: "Integridad del Estado / Tolerancia a Fallos"
  },
  {
    id: "CP-05",
    title: "Límite de solicitudes simultáneas activas",
    hu: "HU06",
    context: "Constanza Silva con 3 reservas cargadas intenta pedir otra",
    event: "Presiona 'Confirmar Reserva' o 'Solicitar'",
    expectedResult: "Bloquea y avisa: 'Máximo de 3 solicitudes simultáneas alcanzada'.",
    status: "Sin Ejecutar",
    isoCharacteristic: "Capacidad de Recursos"
  },
  {
    id: "CP-06",
    title: "Denegación a estudiantes Morosos o Suspendidos",
    hu: "HU09",
    context: "María (Moroso) o Sebastián (Suspendido)",
    event: "Intenta presionar 'Solicitar' o reservar cancha",
    expectedResult: "Despliega alerta roja 'Operación Rechazada' e impide emitir Folio.",
    status: "Sin Ejecutar",
    isoCharacteristic: "Seguridad de Acceso / Restricción de Reglas de Negocio"
  },
  {
    id: "CP-07",
    title: "Filtrado por ítems disponibles en tiempo real",
    hu: "HU02",
    context: "Búsqueda en catálogo interactivo",
    event: "Activa interruptor 'Solo Disponibles'",
    expectedResult: "Oculta artículos con stock 0 de forma dinámica (Se corrigió BUG-01).",
    status: "Sin Ejecutar",
    isoCharacteristic: "Exactitud Ocupacional"
  }
];

export const INITIAL_BUGS: Bug[] = [
  {
    id: "BUG-01",
    title: "Fallo de visibilidad en 'Solo disponibles'",
    severity: "Alta",
    status: "Corregido",
    description: "El filtro 'Solo disponibles' mostraba artículos cuyo stock era cero.",
    solution: "Se ajustó la condicional de visibilidad `item.stock > 0`. Ahora los elementos sin inventario son completamente omitidos en el renderizado."
  },
  {
    id: "BUG-02",
    title: "Falta de mitigación de doble click",
    severity: "Media",
    status: "Corregido",
    description: "Doble clic en el botón 'Solicitar' causaba duplicados y pantallas de folios redundantes en dispositivos lentos.",
    solution: "Se implementó un estado de guardado/carga temporal y propiedad disabled autoejecutable inmediato al primer toque, de modo que el botón se inhabilita para prevenir llamadas repetitivas."
  }
];

export const INITIAL_CHANGELOGS: ChangeLog[] = [
  {
    version: "v1.0",
    code: "CC-01",
    description: "Definición del modelo inicial",
    details: [
      "Creación de la base de datos de implementos de educación física y canchas sede Duoc.",
      "Vistas preliminares de login, catálogo y boleta."
    ]
  },
  {
    version: "v1.1",
    code: "CC-02",
    description: "Estructuración de inputs de autenticación",
    details: [
      "Permite bordes interactivos de color rojo ante RUT ausente.",
      "Validaciones frontales inmediatas de formato básico Ej: 12.345.678-9."
    ]
  },
  {
    version: "v1.2",
    code: "CC-03",
    description: "Incorporación de Alerta de Bloqueo por Morosidad/Suspensión",
    details: [
      "Pantalla Overlay Roja 'Operación Rechazada' de acuerdo a lineamientos ISO 25000.",
      "Imposibilidad absoluta de persistir el folio ante estados no regularizados."
    ]
  },
  {
    version: "v2.0 Final",
    code: "CC-04",
    description: "Consolidación de arreglos y lógica responsiva",
    details: [
      "Solución definitiva a BUG-01 (filtro de stock cero).",
      "Solución a BUG-02 (prevención de múltiples clicks mediante bloqueo transaccional de botón)."
    ]
  }
];
