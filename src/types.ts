export type StudentStatus = 'Normal' | 'Moroso' | 'Suspendido';

export interface Student {
  rut: string;
  name: string;
  career: string;
  status: StudentStatus;
  email: string;
  activeLoansCount: number;
  fineBalance?: number; // Economic penalty balance
}

export type ItemType = 'Implemento' | 'Cancha';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  category: string;
  image: string; // Lucide icon name or emoji or mock image URL
  stock: number;
  totalStock: number;
  location: string;
}

export interface Loan {
  id: string;
  folio: string;
  itemId: string;
  itemName: string;
  itemType: ItemType;
  studentRut: string;
  studentName: string;
  requestedAt: Date;
  status: 'Activo' | 'Devuelto' | 'Cancelado'; // "Cancelado" represents late release/failure to attend 
  returnedAt?: Date;
  delayDays?: number;
  fineCharged?: number;
  autoReleased?: boolean; // For HU11_04 automatic field release
}

export interface TestCase {
  id: string;
  title: string;
  hu: string;
  context: string;
  event: string;
  expectedResult: string;
  status: 'Pasó' | 'Falló' | 'Sin Ejecutar';
  isoCharacteristic: string; // ISO 25010 characteristic e.g. Functional Suitability, Reliability, Usability
}

export interface Bug {
  id: string;
  title: string;
  severity: 'Alta' | 'Media' | 'Baja';
  status: 'Corregido' | 'Abierto';
  description: string;
  solution: string;
}

export interface ChangeLog {
  version: string;
  code: string;
  description: string;
  details: string[];
}
