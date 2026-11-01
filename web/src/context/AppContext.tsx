import React, { createContext, useContext, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { api, type User } from '../services/api';
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
  Language,
  Theme,
} from '../types';
import { getTranslation } from '../utils/translations';

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
  isAuthChecking: boolean;
  currentUser: User | null;
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    farmId?: string;
    phone?: string;
  }) => Promise<boolean>;
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
  updateUserProfile: (updated: Partial<UserProfile>) => Promise<void> | void;
  updateAvatar: (newUrl: string) => void;
  
  farmUnits: FarmUnit[];
  alerts: AlertItem[];
  unreadAlertCount: number;
  markAlertRead: (id: string) => Promise<void> | void;
  markAllAlertsRead: () => Promise<void> | void;
  refreshAlerts: () => Promise<void> | void;

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
  addAudit: (audit: any) => Promise<void> | void;

  diseaseReports: DiseaseReport[];
  addDiseaseReport: (report: any) => Promise<void> | void;

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

  // Theme & Localization
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUserProfile: UserProfile = {
  name: '',
  title: 'Farm Drishti User',
  bio: '',
  email: '',
  phone: '',
  location: '',
  employeeId: '',
  avatar: '',
  certifications: [],
  assignedFarms: [],
  settings: {
    pushNotifications: true,
    syncFrequency: 'Real-time',
    biometricLock: false,
    soundAlerts: true,
  },
};

const initialFarms: FarmUnit[] = [];
const initialAlerts: AlertItem[] = [];
const initialVisitors: Visitor[] = [];
const initialChecklist: ChecklistItem[] = [];
const initialAudits: Audit[] = [];
const initialDiseaseReports: DiseaseReport[] = [];
const initialInventory: InventoryItem[] = [];

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Boolean(localStorage.getItem('farmdrishti_token'));
  });
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(() => {
    return typeof window !== 'undefined' && Boolean(localStorage.getItem('farmdrishti_token'));
  });
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isPrototypeDrawerOpen, setIsPrototypeDrawerOpen] = useState(false);
  const [isAlertDrawerOpen, setIsAlertDrawerOpen] = useState(false);
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalPayload, setModalPayload] = useState<any>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [farmUnits, setFarmUnits] = useState<FarmUnit[]>(initialFarms);
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('farmdrishti_token') : null;
    if (!token) return;

    api.getFarms()
      .then((body: any) => {
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
  }, [isAuthenticated]);
  
  const [temperatureUnit, setTemperatureUnit] = useState<'C' | 'F'>('C');
  const [selectedWeatherLocation, setSelectedWeatherLocation] = useState('Indore, Madhya Pradesh');

  // Theme state
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('farmdrishti_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('farmdrishti_theme', newTheme);
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // Language state
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('farmdrishti_language');
      if (saved === 'en' || saved === 'hi' || saved === 'mr') return saved;
    }
    return 'en';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('farmdrishti_language', newLang);
    }
  };

  const t = (path: string) => getTranslation(language, path);

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

  // Restore session from token on mount
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('farmdrishti_token') : null;
    if (token) {
      api.getCurrentUser()
        .then((res) => {
          if (res.success && res.user) {
            const photo = res.user.profilePhoto || localStorage.getItem('farmdrishti_avatar') || '';
            if (photo) localStorage.setItem('farmdrishti_avatar', photo);
            setCurrentUser({ ...res.user, profilePhoto: photo });
            setIsAuthenticated(true);
            setUserProfile((prev) => ({
              ...prev,
              name: res.user.name,
              email: res.user.email,
              role: res.user.role,
              phone: res.user.phone || prev.phone,
              avatar: photo,
              title: res.user.role === 'admin' ? 'System Administrator' :
                     res.user.role === 'veterinarian' ? 'Lead Biosecurity Veterinarian' :
                     res.user.role === 'inspector' ? 'Certified Field Inspector' :
                     'Farm Operations Manager',
            }));
          } else {
            localStorage.removeItem('farmdrishti_token');
            setCurrentUser(null);
            setIsAuthenticated(false);
          }
        })
        .catch(() => {
          localStorage.removeItem('farmdrishti_token');
          setCurrentUser(null);
          setIsAuthenticated(false);
        })
        .finally(() => {
          setIsAuthChecking(false);
        });
    } else {
      setIsAuthChecking(false);
    }

    const handleSessionExpired = () => {
      localStorage.removeItem('farmdrishti_token');
      setCurrentUser(null);
      setIsAuthenticated(false);
      showToast('Your session has expired. Please log in again.');
    };
    window.addEventListener('farmdrishti-session-expired', handleSessionExpired);

    // Load Live Data Collections from MongoDB
    const loadAllCollections = () => {
      api.getDiseaseReports()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          const mapped: DiseaseReport[] = list.map((r: any) => ({
            id: String(r._id || r.id),
            diseaseName: r.diseaseName || 'Unspecified Vector',
            riskLevel: r.severity === 'high' ? 'High' : r.severity === 'medium' ? 'Medium' : 'Low',
            location: r.location || (r.farmId && typeof r.farmId === 'object' ? `${r.farmId.name || 'Farm'}` : 'Sector 1'),
            reportedDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Just Now',
            speciesAffected: r.speciesAffected || (r.animalType === 'pig' ? 'Swine Herd' : 'Poultry Flock'),
            status: r.status === 'investigating' ? 'Investigating' : r.status === 'resolved' ? 'Resolved' : 'Active',
            details: r.description || r.symptoms || '',
            coordinates: r.coordinates || { x: Math.floor(Math.random() * 60) + 20, y: Math.floor(Math.random() * 60) + 20 },
          }));
          setDiseaseReports(mapped);
        })
        .catch(() => setDiseaseReports([]));

      api.getAudits()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
          const mapped: Audit[] = list.map((a: any) => ({
            id: String(a._id || a.id),
            title: a.title || 'Biosecurity Inspection',
            sector: a.sector || (a.farmId && typeof a.farmId === 'object' ? `${a.farmId.name || 'Sector 2'}` : 'Sector 2'),
            dueDate: a.dueDate || 'In 3 days',
            severity: a.riskLevel === 'high' ? 'urgent' : a.riskLevel === 'low' ? 'routine' : 'attention',
            progress: typeof a.progress === 'number' ? a.progress : a.status === 'completed' ? 100 : 0,
            status: a.status === 'in-progress' ? 'in_progress' : a.status === 'completed' ? 'completed' : 'pending',
            auditor: a.auditor || 'Dr. Ananya Reyes',
            items: Array.isArray(a.items) && a.items.length > 0 ? a.items : [],
          }));
          setAudits(mapped);
        })
        .catch(() => setAudits([]));

      api.getAlerts({ limit: 50 })
        .then((res: any) => {
          if (res?.success && Array.isArray(res?.data)) {
            const formatTimeAgo = (dateStr?: string) => {
              if (!dateStr) return 'Just now';
              const date = new Date(dateStr);
              if (isNaN(date.getTime())) return 'Just now';
              const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
              if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
              if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
              if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
              return `${Math.floor(diffSec / 86400)}d ago`;
            };

            const mapped: AlertItem[] = res.data.map((a: any) => ({
              id: String(a._id || a.id),
              title: a.title,
              location: a.metadata?.location || (a.farmId?.name || (typeof a.farmId === 'object' && a.farmId?.name) || 'Main Production Hub'),
              timeAgo: formatTimeAgo(a.createdAt),
              severity: a.severity === 'critical' || a.severity === 'high' ? 'urgent' : a.severity === 'medium' ? 'review' : 'low',
              read: Boolean(a.isRead),
              message: a.message,
              source: a.source,
              rawSeverity: a.severity,
              createdAt: a.createdAt,
            }));
            setAlerts(mapped);
          } else {
            setAlerts([]);
          }
        })
        .catch(() => setAlerts([]));

      api.getVisitors()
        .then((res: any) => {
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          setVisitors(list.map((v: any) => ({
            id: String(v._id || v.id),
            name: v.name,
            role: v.role || 'Visitor',
            company: v.company || '—',
            status: v.status || 'IN',
            entryTime: v.checkIn ? new Date(v.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
            phone: v.phone || '—',
            purpose: v.purpose || '—',
            temperature: v.temperature || '36.5°C',
          })));
        })
        .catch(() => setVisitors([]));

      api.getInventory()
        .then((res: any) => {
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          setInventory(list.map((i: any) => ({
            id: String(i._id || i.id),
            name: i.itemName,
            category: i.category,
            quantity: i.quantity,
            unit: i.unit,
            minThreshold: i.minimumStock,
            location: (i.farmId && typeof i.farmId === 'object' ? i.farmId.name : null) || 'Main Site',
            lastRestocked: i.updatedAt ? new Date(i.updatedAt).toISOString().split('T')[0] : '—',
          })));
        })
        .catch(() => setInventory([]));

      api.getFarms()
        .then((res: any) => {
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          setFarmUnits(list.map((f: any) => ({
            id: String(f._id || f.id),
            name: f.name,
            type: f.farmType || 'Livestock',
            biosecurityScore: f.complianceScore ?? 100,
            status: (f.complianceScore ?? 100) >= 80 ? 'Optimal' : (f.complianceScore ?? 100) >= 60 ? 'Monitoring' : 'Critical',
            animalsCount: f.animalCount ? `${f.animalCount}` : '0',
            manager: (f.ownerId && typeof f.ownerId === 'object' ? f.ownerId.name : null) || 'Farm Manager',
          })));
        })
        .catch(() => setFarmUnits([]));
    };

    loadAllCollections();

    const onDataUpdated = () => {
      loadAllCollections();
    };

    window.addEventListener('disease-reports-updated', onDataUpdated);
    window.addEventListener('audits-updated', onDataUpdated);
    window.addEventListener('inventory-updated', onDataUpdated);
    window.addEventListener('checklist-submitted', onDataUpdated);
    window.addEventListener('alerts-updated', onDataUpdated);

    return () => {
      window.removeEventListener('disease-reports-updated', onDataUpdated);
      window.removeEventListener('audits-updated', onDataUpdated);
      window.removeEventListener('inventory-updated', onDataUpdated);
      window.removeEventListener('checklist-submitted', onDataUpdated);
      window.removeEventListener('alerts-updated', onDataUpdated);
      window.removeEventListener('farmdrishti-session-expired', handleSessionExpired);
    };
  }, []);

  const getRoleDefaultScreen = (role?: string): ScreenId => {
    switch (role) {
      case 'admin':
        return 'reports';
      case 'veterinarian':
        return 'vet-profile';
      case 'inspector':
        return 'audits';
      case 'farm_manager':
      default:
        return 'dashboard';
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('farmdrishti_token');
      localStorage.removeItem('farmdrishti_avatar');
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsProfileDropdownOpen(false);
    setUserProfile(initialUserProfile);
    setFarmUnits([]);
    setAlerts([]);
    setVisitors([]);
    setChecklist([]);
    setAudits([]);
    setDiseaseReports([]);
    setInventory([]);
    setActiveScreen('dashboard');
    showToast('Signed out of FarmDrishti session.');
  };

  const login = () => {
    openModal('auth', { mode: 'login' });
  };

  const loginUser = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.login({ email, password });
      if (res.success && res.token) {
        localStorage.setItem('farmdrishti_token', res.token);
        const photo = res.user.profilePhoto || localStorage.getItem('farmdrishti_avatar') || '';
        if (photo) localStorage.setItem('farmdrishti_avatar', photo);
        setCurrentUser({ ...res.user, profilePhoto: photo });
        setIsAuthenticated(true);
        setUserProfile((prev) => ({
          ...prev,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          phone: res.user.phone || prev.phone,
          avatar: photo,
          title: res.user.role === 'admin' ? 'System Administrator' :
                 res.user.role === 'veterinarian' ? 'Lead Biosecurity Veterinarian' :
                 res.user.role === 'inspector' ? 'Certified Field Inspector' :
                 'Farm Operations Manager',
        }));
        setActiveScreen(getRoleDefaultScreen(res.user.role));
        showToast(`Welcome back, ${res.user.name}!`);
        closeModal();
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Login failed');
      throw err;
    }
  };

  const registerUser = async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
    farmId?: string;
    phone?: string;
  }): Promise<boolean> => {
    try {
      const res = await api.register(data);
      if (res.success && res.token) {
        localStorage.setItem('farmdrishti_token', res.token);
        const photo = res.user.profilePhoto || '';
        if (photo) localStorage.setItem('farmdrishti_avatar', photo);
        setCurrentUser({ ...res.user, profilePhoto: photo });
        setIsAuthenticated(true);
        setUserProfile((prev) => ({
          ...prev,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role,
          phone: res.user.phone || prev.phone,
          avatar: photo,
          title: res.user.role === 'admin' ? 'System Administrator' :
                 res.user.role === 'veterinarian' ? 'Lead Biosecurity Veterinarian' :
                 res.user.role === 'inspector' ? 'Certified Field Inspector' :
                 'Farm Operations Manager',
        }));
        setActiveScreen(getRoleDefaultScreen(res.user.role));
        showToast(`Account created! Welcome, ${res.user.name}!`);
        closeModal();
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Registration failed');
      throw err;
    }
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
  const updateUserProfile = async (updated: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updated }));
    const token = typeof window !== 'undefined' ? localStorage.getItem('farmdrishti_token') : null;
    if (token) {
      try {
        const payload: { name?: string; phone?: string } = {};
        if (updated.name) payload.name = updated.name;
        if (updated.phone) payload.phone = updated.phone;
        if (Object.keys(payload).length > 0) {
          const res = await api.updateProfile(payload);
          if (res.success && res.user) {
            setCurrentUser(res.user);
          }
        }
      } catch (err: any) {
        console.warn('Backend profile sync skipped/failed:', err?.message);
      }
    }
    showToast('Profile updated successfully!');
  };

  const updateAvatar = async (newUrl: string) => {
    setUserProfile((prev) => ({ ...prev, avatar: newUrl }));
    setCurrentUser((prev) => prev ? { ...prev, profilePhoto: newUrl } : null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('farmdrishti_avatar', newUrl);
      if (localStorage.getItem('farmdrishti_token')) {
        try {
          await api.uploadProfilePhoto(newUrl);
        } catch (err: any) {
          console.warn('Backend avatar upload endpoint failed, trying profile update:', err?.message);
          try {
            await api.updateUserProfile({ profilePhoto: newUrl });
          } catch (innerErr: any) {
            console.warn('Backend avatar sync failed:', innerErr?.message);
          }
        }
      }
    }
    showToast('Profile picture (DP) updated!');
    closeModal();
  };

  // Alert Actions
  const markAlertRead = async (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
    try {
      await api.markAlertRead(id);
      window.dispatchEvent(new CustomEvent('alerts-updated'));
    } catch (err: any) {
      console.warn('Backend markAlertRead warning:', err?.message);
    }
  };

  const markAllAlertsRead = async () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    try {
      await api.markAllAlertsRead();
      showToast('All alerts marked as read.');
      window.dispatchEvent(new CustomEvent('alerts-updated'));
    } catch (err: any) {
      console.warn('Backend markAllAlertsRead warning:', err?.message);
    }
  };

  const refreshAlerts = async () => {
    try {
      const res = await api.getAlerts({ limit: 50 });
      if (res?.success && Array.isArray(res?.data)) {
        const formatTimeAgo = (dateStr?: string) => {
          if (!dateStr) return 'Just now';
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) return 'Just now';
          const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
          if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
          if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
          if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
          return `${Math.floor(diffSec / 86400)}d ago`;
        };

        const mapped: AlertItem[] = res.data.map((a: any) => ({
          id: String(a._id || a.id),
          title: a.title,
          location: a.metadata?.location || (a.farmId?.name || (typeof a.farmId === 'object' && a.farmId?.name) || 'Main Production Hub'),
          timeAgo: formatTimeAgo(a.createdAt),
          severity: a.severity === 'critical' || a.severity === 'high' ? 'urgent' : a.severity === 'medium' ? 'review' : 'low',
          read: Boolean(a.isRead),
          message: a.message,
          source: a.source,
          rawSeverity: a.severity,
          createdAt: a.createdAt,
        }));
        setAlerts(mapped);
      }
    } catch (err: any) {
      console.warn('Backend refreshAlerts warning:', err?.message);
    }
  };

  const unreadAlertCount = alerts.filter((a) => !a.read).length;

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

    const token = typeof window !== 'undefined' ? localStorage.getItem('farmdrishti_token') : null;
    const response = await fetch(`${apiBase}/checklists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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

          // Persist to MongoDB if it's a valid ObjectId
          if (/^[a-f\d]{24}$/i.test(auditId)) {
            api.updateAudit(auditId, {
              items: updatedItems,
              progress: newProgress,
              status: newProgress === 100 ? 'completed' : 'in-progress',
            }).then(() => {
              window.dispatchEvent(new CustomEvent('audits-updated'));
            }).catch((err) => console.warn('Could not persist audit progress to MongoDB:', err));
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
          const updatedAudit = {
            ...aud,
            items: allDoneItems,
            progress: 100,
            status: 'completed' as any,
          };

          // Persist to MongoDB if it's a valid ObjectId
          if (/^[a-f\d]{24}$/i.test(auditId)) {
            api.updateAudit(auditId, {
              items: allDoneItems,
              progress: 100,
              status: 'completed',
            }).then(() => {
              window.dispatchEvent(new CustomEvent('audits-updated'));
            }).catch((err) => console.warn('Could not complete audit in MongoDB:', err));
          }

          return updatedAudit;
        }
        return aud;
      })
    );
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });
    showToast('Audit marked as 100% Completed in MongoDB!');
    closeModal();
  };

  const addAudit = async (newAud: any) => {
    const defaultItems = [
      { text: 'Verify entrance footbath pH & concentration', done: false },
      { text: 'Audit employee shower logs for past 48 hours', done: false },
      { text: 'Check air filtration pressure differentials', done: false },
    ];

    try {
      const payload = {
        farmId: newAud.farmId || selectedFarmId || undefined,
        title: newAud.title,
        findings: newAud.findings || '',
        riskLevel: newAud.severity === 'urgent' ? 'high' : newAud.severity === 'routine' ? 'low' : 'medium',
        sector: newAud.sector || 'Sector 2 · Feed Mill',
        dueDate: newAud.dueDate || 'In 3 days',
        auditor: newAud.auditor || 'Dr. Ananya Reyes',
        progress: 0,
        items: defaultItems,
      };

      const res = await api.createAudit(payload);
      const newId = res.data?._id || `aud-${Date.now()}`;
      const audObj: Audit = {
        title: newAud.title,
        sector: newAud.sector || 'Sector 2',
        dueDate: newAud.dueDate || 'In 3 days',
        severity: newAud.severity || 'attention',
        auditor: newAud.auditor || 'Dr. Ananya Reyes',
        id: String(newId),
        progress: 0,
        status: 'pending',
        items: defaultItems,
      };
      setAudits((prev) => [audObj, ...prev]);
      window.dispatchEvent(new CustomEvent('audits-updated'));
      showToast(`Audit "${newAud.title}" saved to MongoDB!`);
      closeModal();
    } catch (err: any) {
      console.warn('Backend audit creation failed, saving locally:', err);
      const audObj: Audit = {
        title: newAud.title,
        sector: newAud.sector || 'Sector 2',
        dueDate: newAud.dueDate || 'In 3 days',
        severity: newAud.severity || 'attention',
        auditor: newAud.auditor || 'Dr. Ananya Reyes',
        id: `aud-${Date.now()}`,
        progress: 0,
        status: 'pending',
        items: defaultItems,
      };
      setAudits((prev) => [audObj, ...prev]);
      window.dispatchEvent(new CustomEvent('audits-updated'));
      showToast(`Audit "${newAud.title}" scheduled!`);
      closeModal();
    }
  };

  // Disease Actions
  const addDiseaseReport = async (rep: any) => {
    try {
      const payload = {
        farmId: rep.farmId || selectedFarmId || undefined,
        diseaseName: rep.diseaseName,
        animalType: rep.animalType || (rep.speciesAffected?.toLowerCase().includes('pig') ? 'pig' : 'poultry'),
        symptoms: rep.details || rep.diseaseName,
        description: rep.details || '',
        severity: (rep.riskLevel || 'medium').toLowerCase(),
        location: rep.location || '',
        speciesAffected: rep.speciesAffected || '',
        coordinates: rep.coordinates || { x: Math.floor(Math.random() * 60) + 20, y: Math.floor(Math.random() * 60) + 20 },
      };

      const res = await api.createDiseaseReport(payload);
      const newId = res.data?._id || `dis-${Date.now()}`;
      const reportObj: DiseaseReport = {
        ...rep,
        id: String(newId),
        reportedDate: 'Just Now',
      };
      setDiseaseReports((prev) => [reportObj, ...prev]);
      window.dispatchEvent(new CustomEvent('disease-reports-updated'));
      showToast(`New case "${rep.diseaseName}" saved to MongoDB!`);
      closeModal();
    } catch (err: any) {
      console.warn('Backend disease report failed, saving locally:', err);
      const reportObj: DiseaseReport = {
        ...rep,
        id: `dis-${Date.now()}`,
        reportedDate: 'Just Now',
      };
      setDiseaseReports((prev) => [reportObj, ...prev]);
      window.dispatchEvent(new CustomEvent('disease-reports-updated'));
      showToast(`New case "${rep.diseaseName}" reported!`);
      closeModal();
    }
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
        isAuthChecking,
        currentUser,
        loginUser,
        registerUser,
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
        unreadAlertCount,
        markAlertRead,
        markAllAlertsRead,
        refreshAlerts,
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
        theme,
        toggleTheme,
        setTheme,
        language,
        setLanguage,
        t,
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