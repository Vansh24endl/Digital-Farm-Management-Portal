import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import type {
  ScreenId,
  AlertItem,
  Visitor,
  ChecklistItem,
  Audit,
  DiseaseReport,
  InventoryItem,
  UserProfile,
  EmergencyContact,
  TrainingTopic,
  FarmUnit,
} from '../types';

interface AppContextType {
  // Navigation
  activeScreen: ScreenId;
  previousScreen: ScreenId | null;
  navigateTo: (screen: ScreenId) => void;
  goBack: () => void;

  // Sidebar state
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;

  // Profile Dropdown
  isProfileDropdownOpen: boolean;
  setIsProfileDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Auth & Session
  isAuthenticated: boolean;
  logout: () => void;
  login: () => void;

  // Modals & Drawers
  isPrototypeDrawerOpen: boolean;
  setIsPrototypeDrawerOpen: (open: boolean) => void;
  isAlertDrawerOpen: boolean;
  setIsAlertDrawerOpen: (open: boolean) => void;
  activeModal: string | null;
  openModal: (modalId: string, payload?: any) => void;
  closeModal: () => void;
  modalPayload: any;

  // Active Emergency Call
  activeCallContact: EmergencyContact | null;
  callDurationSeconds: number;
  startEmergencyCall: (contact: EmergencyContact) => void;
  endEmergencyCall: () => void;

  // Data Collections
  userProfile: UserProfile;
  updateUserProfile: (updated: Partial<UserProfile>) => void;
  updateAvatar: (newUrl: string) => void;
  
  farmUnits: FarmUnit[];
  alerts: AlertItem[];
  markAlertRead: (id: string) => void;

  visitors: Visitor[];
  toggleVisitorStatus: (id: string) => void;
  addVisitor: (visitor: Omit<Visitor, 'id'>) => void;

  checklist: ChecklistItem[];
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  cycleChecklistItemStatus: (id: string) => void;
  submitChecklist: () => Promise<void>;

  audits: Audit[];
  activeAuditInspection: Audit | null;
  openAuditInspector: (audit: Audit) => void;
  toggleAuditItemDone: (auditId: string, itemIndex: number) => void;
  completeAudit: (auditId: string) => void;
  addAudit: (audit: Omit<Audit, 'id' | 'progress' | 'status' | 'items'>) => void;

  diseaseReports: DiseaseReport[];
  addDiseaseReport: (report: Omit<DiseaseReport, 'id' | 'reportedDate'>) => void;

  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;

  trainingTopics: TrainingTopic[];
  activeTrainingTopic: TrainingTopic | null;
  openTrainingTopic: (topic: TrainingTopic) => void;

  // Toast Notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;

  // Selected Farm & Unit
  selectedFarmId: string;
  setSelectedFarmId: (id: string) => void;
  
  // Weather
  temperatureUnit: 'C' | 'F';
  toggleTemperatureUnit: () => void;
  selectedWeatherLocation: string;
  setSelectedWeatherLocation: (loc: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUserProfile: UserProfile = {
  name: 'Dr. Ananya Reyes',
  title: 'Senior Biosecurity Veterinarian & Surveillance Lead',
  bio: 'Lead Epidemiologist with 14+ years specializing in commercial swine & poultry disease surveillance, outbreak containment, and biosecurity audit protocols.',
  email: 'a.reyes@biosec.vet',
  phone: '+1 (555) 019-8372',
  location: 'Midwest Region, Hub A (HQ)',
  employeeId: 'VET-99201',
  avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400',
  certifications: [
    'Biosecurity Specialist (Level 4 Master)',
    'Avian Health Master (Board Certified)',
    'Pathology Diagnostics & Swine PCR (Advanced)',
  ],
  assignedFarms: [
    { name: 'Green Valley Pig Farm', status: 'optimal', sector: 'Sector 1' },
    { name: 'Sunrise Poultry House', status: 'warning', sector: 'Zone 2' },
    { name: 'Oak Ridge Site A', status: 'optimal', sector: 'Hub A' },
    { name: 'Pine Valley North', status: 'optimal', sector: 'Sector 3' },
    { name: 'Cedar Creek Farms', status: 'optimal', sector: 'Sector 4' },
    { name: 'Willow Brood Facility', status: 'optimal', sector: 'Hatchery C' },
  ],
  settings: {
    pushNotifications: true,
    syncFrequency: 'Real-time',
    biometricLock: true,
    soundAlerts: true,
  },
};

const initialFarms: FarmUnit[] = [
  {
    id: 'gv-pig',
    name: 'Green Valley Pig Farm',
    type: 'Swine Gestation & Farrowing',
    biosecurityScore: 82,
    status: 'Optimal',
    animalsCount: '1,400 pigs',
    manager: 'Carlos Miller',
  },
  {
    id: 'sr-poultry',
    name: 'Sunrise Poultry House',
    type: 'Broiler & Layer Facility',
    biosecurityScore: 61,
    status: 'Monitoring',
    animalsCount: '1,000 chickens',
    manager: 'Elena Vance',
  },
  {
    id: 'oak-ridge',
    name: 'Oak Ridge Site A',
    type: 'Breeder Nucleus',
    biosecurityScore: 94,
    status: 'Optimal',
    animalsCount: '850 pigs',
    manager: 'Marcus Thorne',
  },
];

const initialAlerts: AlertItem[] = [
  {
    id: 'alt-1',
    title: 'Temperature Spike in Farrowing House 3',
    location: 'Sector 4 · Farrowing House 3',
    timeAgo: '10m ago',
    severity: 'urgent',
    read: false,
  },
  {
    id: 'alt-2',
    title: 'Unauthorized Vehicle Near Perimeter Gate B',
    location: 'Zone 2 · Perimeter Access',
    timeAgo: '2h ago',
    severity: 'review',
    read: false,
  },
  {
    id: 'alt-3',
    title: 'Routine Sanitation Audit Pending',
    location: 'Sector 2 · Feed Mill',
    timeAgo: 'Yesterday',
    severity: 'low',
    read: false,
  },
  {
    id: 'alt-4',
    title: 'Newcastle Disease Vector Warning',
    location: 'Zone 2 · Poultry House B',
    timeAgo: '4h ago',
    severity: 'urgent',
    read: false,
  },
];

const initialVisitors: Visitor[] = [
  {
    id: 'v-1',
    name: 'Rahul Mehta',
    role: 'Feed Supplier Logistics Manager',
    company: 'AgriFeed Co.',
    status: 'IN',
    entryTime: '08:30 AM',
    phone: '+91 98765 11111',
    purpose: 'Bulk Grain Delivery - Sector 1',
    temperature: '36.6 °C',
  },
  {
    id: 'v-2',
    name: 'Dr. Ananya Singh',
    role: 'Associate Field Veterinarian',
    company: 'Regional Avian Vet Care',
    status: 'IN',
    entryTime: '09:15 AM',
    phone: '+91 98765 43210',
    purpose: 'Routine Swab Sampling & Inspection',
    temperature: '36.4 °C',
  },
  {
    id: 'v-3',
    name: 'Vikram Patel',
    role: 'HVAC Maintenance Technician',
    company: 'CoolClimate Tech',
    status: 'OUT',
    entryTime: 'Yesterday 02:00 PM',
    phone: '+91 98765 22222',
    purpose: 'Ventilation Fan Servicing',
    temperature: '36.8 °C',
  },
  {
    id: 'v-4',
    name: 'Suresh Yadav',
    role: 'Biosecure Waste Transport',
    company: 'CleanBio Environmental',
    status: 'OUT',
    entryTime: 'Yesterday 10:45 AM',
    phone: '+91 98765 33333',
    purpose: 'Manure & Waste Disposal',
    temperature: '36.5 °C',
  },
];

const initialChecklist: ChecklistItem[] = [
  {
    id: 'chk-1',
    title: 'Shower & Change Station Sterilization',
    description: 'Verify 70% ethanol sprayers and clean jumpsuit storage.',
    category: 'Personnel Hygiene',
    status: 'passed',
  },
  {
    id: 'chk-2',
    title: 'Footbath Virucidal Concentration Check',
    description: 'Ensure pH solution level and 200ppm virucide refill in place.',
    category: 'Entry Sanitation',
    status: 'passed',
  },
  {
    id: 'chk-3',
    title: 'Protective Clothing & Respirator Inspection',
    description: 'Check seal integrity on N95 masks and Tyvek suits.',
    category: 'PPE Security',
    status: 'passed',
  },
  {
    id: 'chk-4',
    title: 'Vehicle Disinfection Gate UV Pressure Spray',
    description: 'Test automatic wheel wash nozzle pressure (3.5 bar min).',
    category: 'Perimeter Barrier',
    status: 'warning',
  },
  {
    id: 'chk-5',
    title: 'Visitor Log Thermal Scan Verification',
    description: 'All entrant temperatures logged and below 37.5°C threshold.',
    category: 'Access Control',
    status: 'passed',
  },
  {
    id: 'chk-6',
    title: 'Quarantine Holding Bay Negative Pressure',
    description: 'Inspect air pressure differential gauge (-15 Pa required).',
    category: 'Biosecurity Zone',
    status: 'critical',
  },
];

const initialAudits: Audit[] = [
  {
    id: 'aud-1',
    title: 'Sanitation & Disinfection Audit',
    sector: 'Sector 2 · Feed Mill & Loading Dock',
    dueDate: 'In 2 days',
    severity: 'urgent',
    progress: 40,
    status: 'pending',
    auditor: 'Dr. Ananya Reyes',
    items: [
      { text: 'Inspect footbath chemical concentration at Bay 2', done: true },
      { text: 'Verify tire spray log for feed delivery trucks', done: true },
      { text: 'Swab surface test at entry shower change room', done: false },
      { text: 'Check air filter pressure gauge in Sector 2', done: false },
      { text: 'Review disinfectant batch expiry logs', done: false },
    ],
  },
  {
    id: 'aud-2',
    title: 'Visitor Access & PPE Compliance Log',
    sector: 'Zone 2 · Poultry House Entrance',
    dueDate: 'Tomorrow',
    severity: 'attention',
    progress: 20,
    status: 'pending',
    auditor: 'Elena Vance',
    items: [
      { text: 'Audit entry log signatures for the past 7 days', done: true },
      { text: 'Check Tyvek jumpsuit stock & disposal bin hygiene', done: false },
      { text: 'Verify visitor shower duration records', done: false },
      { text: 'Inspect boot change line demarcation strip', done: false },
    ],
  },
  {
    id: 'aud-3',
    title: 'Ventilation & Environmental Control Protocol',
    sector: 'Sector 4 · Farrowing House 3',
    dueDate: 'In 5 days',
    severity: 'routine',
    progress: 65,
    status: 'in_progress',
    auditor: 'Marcus Thorne',
    items: [
      { text: 'Calibrate ammonia NH3 sensors across 12 pens', done: true },
      { text: 'Test backup emergency fan generator switchover', done: true },
      { text: 'Inspect cooling pad water circulation lines', done: true },
      { text: 'Review thermal camera heatmap history', done: false },
    ],
  },
];

const initialDiseaseReports: DiseaseReport[] = [
  {
    id: 'dis-1',
    diseaseName: 'Newcastle Disease Vector Alert',
    riskLevel: 'High',
    location: 'Sunrise Poultry House · Zone 2',
    reportedDate: 'Today 09:30 AM',
    speciesAffected: 'Broiler Flock B (1,000 Birds)',
    status: 'Active',
    details: 'Serology test indicated elevated antibodies for virulent Newcastle disease strain. Perimeter quarantine ring enforced.',
    coordinates: { x: 62, y: 38 },
  },
  {
    id: 'dis-2',
    diseaseName: 'African Swine Fever (ASF) Watch',
    riskLevel: 'Medium',
    location: 'Green Valley Pig Farm · Sector 4',
    reportedDate: '2 Days Ago',
    speciesAffected: 'Gestation Pen 14',
    status: 'Investigating',
    details: 'Routine PCR screening flagged positive viral DNA fragments in wild boar perimeter fence swab. Biosecurity buffer expanded.',
    coordinates: { x: 35, y: 55 },
  },
  {
    id: 'dis-3',
    diseaseName: 'Porcine Respiratory Syndrome (PRRS)',
    riskLevel: 'Low',
    location: 'Oak Ridge Site A · Sector 1',
    reportedDate: '4 Days Ago',
    speciesAffected: 'Weaner Barn 2',
    status: 'Resolved',
    details: 'Isolated coughing symptoms recorded. Diagnostic swab negative for PRRSv Type 2. Secondary bacterial treatment administered.',
    coordinates: { x: 22, y: 70 },
  },
];

const initialInventory: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Virkon S Broad Spectrum Disinfectant (5L)',
    category: 'Disinfectants',
    quantity: 2,
    unit: 'Barrels',
    minThreshold: 10,
    location: 'Central Chemical Depot',
    lastRestocked: '2026-09-15',
  },
  {
    id: 'inv-2',
    name: 'N95 Respirator Masks (Heavy Duty)',
    category: 'PPE',
    quantity: 15,
    unit: 'Boxes',
    minThreshold: 50,
    location: 'Antechamber Bay A',
    lastRestocked: '2026-09-20',
  },
  {
    id: 'inv-3',
    name: 'Nitrile Protective Gloves (Size XL)',
    category: 'PPE',
    quantity: 4,
    unit: 'Boxes',
    minThreshold: 20,
    location: 'Shower Locker Room',
    lastRestocked: '2026-09-10',
  },
  {
    id: 'inv-4',
    name: 'Sterile Swab Diagnostic PCR Kits',
    category: 'Medical Supplies',
    quantity: 120,
    unit: 'Kits',
    minThreshold: 30,
    location: 'Veterinary Diagnostic Lab',
    lastRestocked: '2026-09-28',
  },
  {
    id: 'inv-5',
    name: 'Avian Influenza Inactivated Vaccine (1000 doses)',
    category: 'Vaccines',
    quantity: 12,
    unit: 'Vials',
    minThreshold: 5,
    location: 'Cold Storage Unit 1 (-20°C)',
    lastRestocked: '2026-10-01',
  },
  {
    id: 'inv-6',
    name: 'Automated Boot Bath Disinfectant Powder',
    category: 'Disinfectants',
    quantity: 18,
    unit: 'Bags',
    minThreshold: 10,
    location: 'Gate B Sanitation Shed',
    lastRestocked: '2026-09-25',
  },
];

const initialTrainingTopics: TrainingTopic[] = [
  {
    id: 'trn-1',
    title: 'Biosecurity Protocols: Master Guidelines',
    category: 'Biosecurity',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=600',
    summary: 'Comprehensive SOP on Danish entry shower systems, clean vs dirty line separation, and perimeter vehicle decontamination.',
    content: [
      '1. Zone Separation: Always strictly enforce the Red/Yellow/Green biosecurity zoning before stepping across the bench line.',
      '2. Shower Requirements: Mandatory 3-minute full soap shower before entering rearing and breeding facilities.',
      '3. Clothes Transfer: Outer garments and street shoes must remain in Dirty Zone lockers. Clean farm overalls and boots must be donned on the Clean side.',
      '4. Vehicle Sanitation: Drivers must remain inside the cab while automatic 360-degree virucidal sprays disinfect wheels and chassis.',
    ],
    checklistRules: [
      'Zero street shoes past line demarcation',
      'Minimum 5-minute footbath contact time for tires',
      'All incoming packages MUST undergo 15 min UV-C chamber exposure',
    ],
  },
  {
    id: 'trn-2',
    title: 'How to Correctly Use & Refill Vehicle Footbaths',
    category: 'Hygiene',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=600',
    summary: 'Step-by-step guide to maintaining virucidal active concentration (200 ppm min) and organic matter removal.',
    content: [
      '1. Scrape boots of manure and mud BEFORE stepping into the chemical bath (organic soil inactivates disinfectants).',
      '2. Submerge boot treads completely for at least 30 seconds.',
      '3. Refresh bath fluid every 48 hours or immediately if murky or diluted by rain.',
    ],
    checklistRules: [
      'Test chemical strip daily',
      'Scrape mud prior to immersion',
      'Cover footbath tubs during rainstorms',
    ],
  },
  {
    id: 'trn-3',
    title: 'Proper Hand Hygiene & Glove Protocol',
    category: 'Hygiene',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1584634731339-252c581abfc5?auto=format&fit=crop&q=80&w=600',
    summary: 'Clinical 6-step hand scrubbing SOP for field veterinarians, technicians, and visitors.',
    content: [
      '1. Apply antimicrobial soap to wet hands.',
      '2. Scrub palms, backs of hands, between fingers, and fingernails for 30 seconds.',
      '3. Dry with single-use paper towel. Turn off faucet using paper towel.',
      '4. Apply 70% Isopropyl alcohol hand sanitizer prior to donning sterile nitrile gloves.',
    ],
    checklistRules: [
      'No jewelry or watches in clean zone',
      'Sanitize between handling separate animal pens',
      'Change gloves immediately if punctured',
    ],
  },
  {
    id: 'trn-4',
    title: 'Avian & Swine Viral Disease Early Prevention',
    category: 'Animal Health',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=600',
    summary: 'Recognizing early symptoms of Newcastle, Avian Flu, and PRRSv to trigger rapid quarantine.',
    content: [
      '1. Avian Symptoms: Respiratory distress, greenish diarrhea, facial edema, and sudden drop in egg production.',
      '2. Swine Symptoms: High fever (>40.5°C), skin cyanosis/reddening on ears, lethargy, and loss of appetite.',
      '3. Action Protocol: Immediately isolate the affected pen, flag the sector in AgroShield app, and notify Lead Vet Dr. Reyes.',
    ],
    checklistRules: [
      'Isolate symptomatic animals within 15 minutes',
      'Collect diagnostic nasal/cloacal swabs immediately',
      'Lock down barn ventilation to negative pressure mode',
    ],
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
  const [history, setHistory] = useState<ScreenId[]>([]);
  
  // Sidebar state (false = expanded, true = collapsed on desktop)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const [isPrototypeDrawerOpen, setIsPrototypeDrawerOpen] = useState(false);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalPayload, setModalPayload] = useState<any>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [farmUnits] = useState<FarmUnit[]>(initialFarms);
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);
  const [visitors, setVisitors] = useState<Visitor[]>(initialVisitors);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [selectedZone, setSelectedZone] = useState('Zone A Rearing Facility');
  const [audits, setAudits] = useState<Audit[]>(initialAudits);
  const [activeAuditInspection, setActiveAuditInspection] = useState<Audit | null>(null);
  
  const [diseaseReports, setDiseaseReports] = useState<DiseaseReport[]>(initialDiseaseReports);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [trainingTopics] = useState<TrainingTopic[]>(initialTrainingTopics);
  const [activeTrainingTopic, setActiveTrainingTopic] = useState<TrainingTopic | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState('');
  const [farmIdLoadError, setFarmIdLoadError] = useState<string | null>(null);

  // Resolve the default selected farm using the real MongoDB _id.
  useEffect(() => {
    let cancelled = false;
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    fetch(`${apiBase}/farms`)
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.message || 'Could not load farms');
        return body;
      })
      .then((body) => {
        const farms = Array.isArray(body) ? body : body.data;
        if (!Array.isArray(farms)) throw new Error('Unexpected farms API response');
        if (!cancelled) {
          const validFarm = farms.find((farm: any) => /^[a-f\d]{24}$/i.test(String(farm._id || '')));
          if (validFarm) {
            setSelectedFarmId((current) => current || validFarm._id);
            setFarmIdLoadError(null);
          } else {
            setFarmIdLoadError('No farms found in MongoDB. Create a farm first.');
          }
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFarmIdLoadError(error instanceof Error ? error.message : 'Could not load farm IDs');
        }
      });

    return () => { cancelled = true; };
  }, []);
  
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [selectedWeatherLocation, setSelectedWeatherLocation] = useState('Green Valley - Sector 1');

  // Emergency Call State
  const [activeCallContact, setActiveCallContact] = useState<EmergencyContact | null>(null);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);

  // Navigation handlers
  const navigateTo = (screen: ScreenId) => {
    if (screen !== activeScreen) {
      setHistory((prev) => [...prev, activeScreen]);
      setActiveScreen(screen);
      setIsProfileDropdownOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    if (history.length > 0) {
      const prevScreen = history[history.length - 1];
      setHistory((prev) => prev.slice(0, prev.length - 1));
      setActiveScreen(prevScreen);
    } else {
      setActiveScreen('dashboard');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsProfileDropdownOpen(false);
    showToast('Signed out of AgroShield Surveillance session.');
  };

  const login = () => {
    setIsAuthenticated(true);
    showToast('Welcome back, Dr. Ananya Reyes! Bio-vigilance active.');
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Modal Handlers
  const openModal = (modalId: string, payload?: any) => {
    setActiveModal(modalId);
    setIsProfileDropdownOpen(false);
    if (payload !== undefined) {
      setModalPayload(payload);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalPayload(null);
  };

  // Profile Update & Avatar Update
  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
    showToast('Profile updated successfully!');
  };

  const updateAvatar = (newUrl: string) => {
    setUserProfile((prev) => ({ ...prev, avatar: newUrl }));
    showToast('Profile picture (DP) updated!');
    closeModal();
  };

  // Alert Actions
  const markAlertRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  // Visitor Actions
  const toggleVisitorStatus = (id: string) => {
    setVisitors((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const newStatus = v.status === 'IN' ? 'OUT' : 'IN';
          showToast(`Visitor ${v.name} marked as ${newStatus}`);
          return { ...v, status: newStatus };
        }
        return v;
      })
    );
  };

  const addVisitor = (newV: Omit<Visitor, 'id'>) => {
    const vObj: Visitor = {
      ...newV,
      id: `v-${Date.now()}`,
    };
    setVisitors((prev) => [vObj, ...prev]);
    showToast(`Visitor ${newV.name} added to Log!`);
    closeModal();
  };

  // Checklist Actions
  const cycleChecklistItemStatus = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          let nextState: 'passed' | 'warning' | 'critical' = 'passed';
          if (item.status === 'passed') nextState = 'warning';
          else if (item.status === 'warning') nextState = 'critical';
          else nextState = 'passed';

          return { ...item, status: nextState };
        }
        return item;
      })
    );
  };

  const submitChecklist = async () => {
    if (!selectedFarmId || !/^[a-f\d]{24}$/i.test(selectedFarmId)) {
      const message = farmIdLoadError || 'A valid database farm has not been selected.';
      showToast(message);
      throw new Error(message);
    }

    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const payload = {
      farmId: selectedFarmId,
      zone: selectedZone,
      submittedAt: new Date().toISOString(),
      items: checklist.map((item) => ({
        itemId: item.id,
        title: item.title,
        category: item.category,
        description: item.description,
        status: item.status,
      })),
    };

    const response = await fetch(`${apiBase}/checklists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = body.message || `Checklist API failed (${response.status})`;
      showToast(message);
      throw new Error(message);
    }

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
    showToast('Checklist saved to MongoDB successfully!');
  };

  // Audit Actions
  const openAuditInspector = (audit: Audit) => {
    setActiveAuditInspection(audit);
    openModal('audit-inspector', audit);
  };

  const toggleAuditItemDone = (auditId: string, itemIndex: number) => {
    setAudits((prev) =>
      prev.map((aud) => {
        if (aud.id === auditId) {
          const updatedItems = aud.items.map((it, idx) =>
            idx === itemIndex ? { ...it, done: !it.done } : it
          );
          const doneCount = updatedItems.filter((i) => i.done).length;
          const newProgress = Math.round((doneCount / updatedItems.length) * 100);
          const newStatus = newProgress === 100 ? 'completed' : 'in_progress';

          const updatedAudit = {
            ...aud,
            items: updatedItems,
            progress: newProgress,
            status: newStatus as any,
          };
          if (activeAuditInspection?.id === auditId) {
            setActiveAuditInspection(updatedAudit);
          }
          return updatedAudit;
        }
        return aud;
      })
    );
  };

  const completeAudit = (auditId: string) => {
    setAudits((prev) =>
      prev.map((aud) => {
        if (aud.id === auditId) {
          const allDoneItems = aud.items.map((it) => ({ ...it, done: true }));
          return {
            ...aud,
            items: allDoneItems,
            progress: 100,
            status: 'completed',
          };
        }
        return aud;
      })
    );
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
    showToast('Audit marked as 100% Completed!');
    closeModal();
  };

  const addAudit = (newAud: Omit<Audit, 'id' | 'progress' | 'status' | 'items'>) => {
    const audObj: Audit = {
      ...newAud,
      id: `aud-${Date.now()}`,
      progress: 0,
      status: 'pending',
      items: [
        { text: 'Verify entrance footbath pH & concentration', done: false },
        { text: 'Audit employee shower logs for past 48 hours', done: false },
        { text: 'Check air filtration pressure differentials', done: false },
      ],
    };
    setAudits((prev) => [audObj, ...prev]);
    showToast(`Audit "${newAud.title}" scheduled successfully!`);
    closeModal();
  };

  // Disease Actions
  const addDiseaseReport = (rep: Omit<DiseaseReport, 'id' | 'reportedDate'>) => {
    const reportObj: DiseaseReport = {
      ...rep,
      id: `dis-${Date.now()}`,
      reportedDate: 'Just Now',
    };
    setDiseaseReports((prev) => [reportObj, ...prev]);
    showToast(`New case "${rep.diseaseName}" reported to Epidemiological HQ!`);
    closeModal();
  };

  // Inventory Actions
  const addInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const invObj: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
    };
    setInventory((prev) => [invObj, ...prev]);
    showToast(`Item "${item.name}" added to Inventory!`);
    closeModal();
  };

  // Training Topic
  const openTrainingTopic = (topic: TrainingTopic) => {
    setActiveTrainingTopic(topic);
    openModal('sop-reader', topic);
  };

  // Emergency Call Actions
  const startEmergencyCall = (contact: EmergencyContact) => {
    setActiveCallContact(contact);
    setCallDurationSeconds(0);
    openModal('emergency-call', contact);
  };

  const endEmergencyCall = () => {
    setActiveCallContact(null);
    closeModal();
    showToast('Emergency call ended.');
  };

  // Weather toggle
  const toggleTemperatureUnit = () => {
    setTemperatureUnit((prev) => (prev === 'C' ? 'F' : 'C'));
  };

  return (
    <AppContext.Provider
      value={{
        activeScreen,
        previousScreen: history.length > 0 ? history[history.length - 1] : null,
        navigateTo,
        goBack,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        isProfileDropdownOpen,
        setIsProfileDropdownOpen,
        isAuthenticated,
        logout,
        login,
        isPrototypeDrawerOpen,
        setIsPrototypeDrawerOpen,
        isAlertDrawerOpen,
        setIsAlertDrawerOpen,
        activeModal,
        openModal,
        closeModal,
        modalPayload,
        activeCallContact,
        callDurationSeconds,
        startEmergencyCall,
        endEmergencyCall,
        userProfile,
        updateUserProfile,
        updateAvatar,
        farmUnits,
        alerts,
        markAlertRead,
        visitors,
        toggleVisitorStatus,
        addVisitor,
        checklist,
        selectedZone,
        setSelectedZone,
        cycleChecklistItemStatus,
        submitChecklist,
        audits,
        activeAuditInspection,
        openAuditInspector,
        toggleAuditItemDone,
        completeAudit,
        addAudit,
        diseaseReports,
        addDiseaseReport,
        inventory,
        addInventoryItem,
        trainingTopics,
        activeTrainingTopic,
        openTrainingTopic,
        toastMessage,
        showToast,
        selectedFarmId,
        setSelectedFarmId,
        temperatureUnit,
        toggleTemperatureUnit,
        selectedWeatherLocation,
        setSelectedWeatherLocation,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};