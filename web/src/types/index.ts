export type ScreenId =
  | 'dashboard'
  | 'profile'
  | 'surveillance'
  | 'health'
  | 'audits'
  | 'visitors'
  | 'checklist'
  | 'weather'
  | 'emergency'
  | 'training'
  | 'farm-map'
  | 'inventory'
  | 'reports';

export type Language = 'en' | 'hi' | 'mr';
export type Theme = 'light' | 'dark';

export interface AlertItem {
  id: string;
  title: string;
  location: string;
  timeAgo: string;
  severity: 'urgent' | 'review' | 'low';
  read: boolean;
  message?: string;
  source?: string;
  rawSeverity?: string;
  createdAt?: string;
}


export interface Visitor {
  id: string;
  name: string;
  role: string;
  company: string;
  status: 'IN' | 'OUT';
  entryTime: string;
  phone: string;
  purpose: string;
  temperature: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'passed' | 'warning' | 'critical';
}

export interface Audit {
  id: string;
  title: string;
  sector: string;
  dueDate: string;
  severity: 'urgent' | 'attention' | 'routine';
  progress: number;
  status: 'pending' | 'in_progress' | 'completed';
  auditor: string;
  items: { text: string; done: boolean }[];
}

export interface DiseaseReport {
  id: string;
  diseaseName: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  location: string;
  reportedDate: string;
  speciesAffected: string;
  status: 'Active' | 'Investigating' | 'Resolved';
  details: string;
  coordinates: { x: number; y: number };
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Disinfectants' | 'PPE' | 'Vaccines' | 'Medical Supplies' | 'Feed Additives';
  quantity: number;
  unit: string;
  minThreshold: number;
  location: string;
  lastRestocked: string;
}

export interface UserProfile {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  employeeId: string;
  avatar: string;
  certifications: string[];
  assignedFarms: { name: string; status: 'optimal' | 'warning' | 'critical'; sector: string }[];
  settings: {
    pushNotifications: boolean;
    syncFrequency: 'Real-time' | 'Every 15 mins' | 'Hourly' | 'Manual';
    biometricLock: boolean;
    soundAlerts: boolean;
  };
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  category: 'Veterinary Services' | 'Authorities' | 'Suppliers' | 'Internal Staff';
  available: string;
}

export interface TrainingTopic {
  id: string;
  title: string;
  category: 'Biosecurity' | 'Animal Health' | 'Hygiene' | 'Emergency';
  readTime: string;
  image: string;
  summary: string;
  content: string[];
  checklistRules: string[];
}

export interface FarmUnit {
  id: string;
  name: string;
  type: string;
  biosecurityScore: number;
  status: 'Optimal' | 'Monitoring' | 'Critical';
  animalsCount: string;
  manager: string;
}
