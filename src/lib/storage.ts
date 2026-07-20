import { Player, Coach, Program, Fee, AttendanceRecord, Holiday, NewsPost, Achievement, GalleryItem, Testimonial, ContactMessage, WebsiteContent, Notification } from '@/types';
import { generateId, getTodayString } from '@/lib/utils';

// ─── Generic helpers ──────────────────────────────────────────────
function get<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function set<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Auth ─────────────────────────────────────────────────────────
export const auth = {
  login: (username: string, password: string) => {
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('eca_admin_token', 'logged_in');
      return true;
    }
    return false;
  },
  logout: () => localStorage.removeItem('eca_admin_token'),
  isLoggedIn: () => !!localStorage.getItem('eca_admin_token'),
};

// ─── Players ──────────────────────────────────────────────────────
export const players = {
  getAll: () => get<Player[]>('eca_players', defaultPlayers),
  getById: (id: string) => players.getAll().find(p => p.id === id),
  add: (player: Omit<Player, 'id' | 'registrationNumber'>) => {
    const all = players.getAll();
    const num = String(all.length + 1).padStart(4, '0');
    const newPlayer: Player = { ...player, id: generateId(), registrationNumber: `ECA-${num}` };
    set('eca_players', [...all, newPlayer]);
    return newPlayer;
  },
  update: (id: string, data: Partial<Player>) => {
    const all = players.getAll().map(p => p.id === id ? { ...p, ...data } : p);
    set('eca_players', all);
  },
  delete: (id: string) => {
    set('eca_players', players.getAll().filter(p => p.id !== id));
  },
};

// ─── Coaches ──────────────────────────────────────────────────────
export const coaches = {
  getAll: () => get<Coach[]>('eca_coaches', defaultCoaches),
  getById: (id: string) => coaches.getAll().find(c => c.id === id),
  add: (coach: Omit<Coach, 'id'>) => {
    const newCoach: Coach = { ...coach, id: generateId() };
    set('eca_coaches', [...coaches.getAll(), newCoach]);
    return newCoach;
  },
  update: (id: string, data: Partial<Coach>) => {
    set('eca_coaches', coaches.getAll().map(c => c.id === id ? { ...c, ...data } : c));
  },
  delete: (id: string) => {
    set('eca_coaches', coaches.getAll().filter(c => c.id !== id));
  },
};

// ─── Programs ─────────────────────────────────────────────────────
export const programsStore = {
  getAll: () => get<Program[]>('eca_programs', defaultPrograms),
  getById: (id: string) => programsStore.getAll().find(p => p.id === id),
  add: (program: Omit<Program, 'id'>) => {
    const newProgram: Program = { ...program, id: generateId() };
    set('eca_programs', [...programsStore.getAll(), newProgram]);
    return newProgram;
  },
  update: (id: string, data: Partial<Program>) => {
    set('eca_programs', programsStore.getAll().map(p => p.id === id ? { ...p, ...data } : p));
  },
  delete: (id: string) => {
    set('eca_programs', programsStore.getAll().filter(p => p.id !== id));
  },
};

// ─── Fees ─────────────────────────────────────────────────────────
export const fees = {
  getAll: () => get<Fee[]>('eca_fees', defaultFees),
  getById: (id: string) => fees.getAll().find(f => f.id === id),
  getByPlayer: (playerId: string) => fees.getAll().filter(f => f.playerId === playerId),
  add: (fee: Omit<Fee, 'id'>) => {
    const newFee: Fee = { ...fee, id: generateId() };
    set('eca_fees', [...fees.getAll(), newFee]);
    return newFee;
  },
  update: (id: string, data: Partial<Fee>) => {
    set('eca_fees', fees.getAll().map(f => f.id === id ? { ...f, ...data } : f));
  },
  delete: (id: string) => {
    set('eca_fees', fees.getAll().filter(f => f.id !== id));
  },
};

// ─── Attendance ───────────────────────────────────────────────────
export const attendance = {
  getAll: () => get<AttendanceRecord[]>('eca_attendance', []),
  getByDate: (date: string) => attendance.getAll().filter(a => a.date === date),
  getByPlayer: (playerId: string) => attendance.getAll().filter(a => a.playerId === playerId),
  isMarkedForDate: (date: string) => attendance.getByDate(date).length > 0,
  markBulk: (records: Omit<AttendanceRecord, 'id'>[]) => {
    const all = attendance.getAll().filter(a => a.date !== records[0]?.date);
    const newRecords = records.map(r => ({ ...r, id: generateId() }));
    set('eca_attendance', [...all, ...newRecords]);
  },
  updateRecord: (id: string, data: Partial<AttendanceRecord>) => {
    set('eca_attendance', attendance.getAll().map(a => a.id === id ? { ...a, ...data } : a));
  },
};

// ─── Holidays ─────────────────────────────────────────────────────
export const holidays = {
  getAll: () => get<Holiday[]>('eca_holidays', defaultHolidays),
  getById: (id: string) => holidays.getAll().find(h => h.id === id),
  isHoliday: (date: string) => holidays.getAll().some(h => h.date === date),
  getHolidayForDate: (date: string) => holidays.getAll().find(h => h.date === date),
  add: (holiday: Omit<Holiday, 'id'>) => {
    const newHoliday: Holiday = { ...holiday, id: generateId() };
    set('eca_holidays', [...holidays.getAll(), newHoliday]);
    return newHoliday;
  },
  update: (id: string, data: Partial<Holiday>) => {
    set('eca_holidays', holidays.getAll().map(h => h.id === id ? { ...h, ...data } : h));
  },
  delete: (id: string) => {
    set('eca_holidays', holidays.getAll().filter(h => h.id !== id));
  },
};

// ─── News ─────────────────────────────────────────────────────────
export const newsStore = {
  getAll: () => get<NewsPost[]>('eca_news', defaultNews),
  getById: (id: string) => newsStore.getAll().find(n => n.id === id),
  add: (post: Omit<NewsPost, 'id'>) => {
    const newPost: NewsPost = { ...post, id: generateId() };
    set('eca_news', [...newsStore.getAll(), newPost]);
    return newPost;
  },
  update: (id: string, data: Partial<NewsPost>) => {
    set('eca_news', newsStore.getAll().map(n => n.id === id ? { ...n, ...data } : n));
  },
  delete: (id: string) => {
    set('eca_news', newsStore.getAll().filter(n => n.id !== id));
  },
};

// ─── Achievements ─────────────────────────────────────────────────
export const achievementsStore = {
  getAll: () => get<Achievement[]>('eca_achievements', defaultAchievements),
  add: (a: Omit<Achievement, 'id'>) => {
    const newA: Achievement = { ...a, id: generateId() };
    set('eca_achievements', [...achievementsStore.getAll(), newA]);
  },
  update: (id: string, data: Partial<Achievement>) => {
    set('eca_achievements', achievementsStore.getAll().map(a => a.id === id ? { ...a, ...data } : a));
  },
  delete: (id: string) => {
    set('eca_achievements', achievementsStore.getAll().filter(a => a.id !== id));
  },
};

// ─── Gallery ──────────────────────────────────────────────────────
export const galleryStore = {
  getAll: () => get<GalleryItem[]>('eca_gallery', defaultGallery),
  add: (item: Omit<GalleryItem, 'id'>) => {
    const newItem: GalleryItem = { ...item, id: generateId() };
    set('eca_gallery', [...galleryStore.getAll(), newItem]);
  },
  delete: (id: string) => {
    set('eca_gallery', galleryStore.getAll().filter(g => g.id !== id));
  },
  update: (id: string, data: Partial<GalleryItem>) => {
    set('eca_gallery', galleryStore.getAll().map(g => g.id === id ? { ...g, ...data } : g));
  },
};

// ─── Testimonials ─────────────────────────────────────────────────
export const testimonialsStore = {
  getAll: () => get<Testimonial[]>('eca_testimonials', defaultTestimonials),
  add: (t: Omit<Testimonial, 'id'>) => {
    const newT: Testimonial = { ...t, id: generateId() };
    set('eca_testimonials', [...testimonialsStore.getAll(), newT]);
  },
  update: (id: string, data: Partial<Testimonial>) => {
    set('eca_testimonials', testimonialsStore.getAll().map(t => t.id === id ? { ...t, ...data } : t));
  },
  delete: (id: string) => {
    set('eca_testimonials', testimonialsStore.getAll().filter(t => t.id !== id));
  },
};

// ─── Messages ─────────────────────────────────────────────────────
export const messagesStore = {
  getAll: () => get<ContactMessage[]>('eca_messages', defaultMessages),
  add: (msg: Omit<ContactMessage, 'id'>) => {
    const newMsg: ContactMessage = { ...msg, id: generateId() };
    set('eca_messages', [...messagesStore.getAll(), newMsg]);
  },
  update: (id: string, data: Partial<ContactMessage>) => {
    set('eca_messages', messagesStore.getAll().map(m => m.id === id ? { ...m, ...data } : m));
  },
  delete: (id: string) => {
    set('eca_messages', messagesStore.getAll().filter(m => m.id !== id));
  },
};

// ─── Website Content ──────────────────────────────────────────────
export const websiteContent = {
  get: () => get<WebsiteContent>('eca_website', defaultWebsiteContent),
  update: (section: keyof WebsiteContent, data: Partial<WebsiteContent[keyof WebsiteContent]>) => {
    const current = websiteContent.get();
    set('eca_website', { ...current, [section]: { ...current[section] as object, ...data } });
  },
  updateBanners: (banners: WebsiteContent['banners']) => {
    const current = websiteContent.get();
    set('eca_website', { ...current, banners });
  },
};

// ─── Notifications ────────────────────────────────────────────────
export const notificationsStore = {
  getAll: () => get<Notification[]>('eca_notifications', defaultNotifications),
  markRead: (id: string) => {
    set('eca_notifications', notificationsStore.getAll().map(n => n.id === id ? { ...n, isRead: true } : n));
  },
  markAllRead: () => {
    set('eca_notifications', notificationsStore.getAll().map(n => ({ ...n, isRead: true })));
  },
  add: (n: Omit<Notification, 'id'>) => {
    const newN: Notification = { ...n, id: generateId() };
    set('eca_notifications', [newN, ...notificationsStore.getAll()]);
  },
  delete: (id: string) => {
    set('eca_notifications', notificationsStore.getAll().filter(n => n.id !== id));
  },
};

// ─── DEFAULT DATA ─────────────────────────────────────────────────
const defaultPlayers: Player[] = [
  { id: 'p1', name: 'Arjun Sharma', email: 'arjun@email.com', phone: '9876543210', age: 16, dateOfBirth: '2008-03-15', address: '12 MG Road, Mumbai', guardianName: 'Rajesh Sharma', guardianPhone: '9876543211', program: 'Junior Elite', joinDate: '2024-01-10', status: 'active', position: 'Batsman', battingStyle: 'Right-hand', bowlingStyle: 'Right-arm medium', jerseyNumber: '7', registrationNumber: 'ECA-0001', emergencyContact: '9876543212' },
  { id: 'p2', name: 'Rohan Patel', email: 'rohan@email.com', phone: '9876543220', age: 14, dateOfBirth: '2010-07-22', address: '45 Park Avenue, Pune', guardianName: 'Suresh Patel', guardianPhone: '9876543221', program: 'Youth Development', joinDate: '2024-02-15', status: 'active', position: 'Bowler', battingStyle: 'Right-hand', bowlingStyle: 'Right-arm fast', jerseyNumber: '22', registrationNumber: 'ECA-0002', emergencyContact: '9876543222' },
  { id: 'p3', name: 'Priya Singh', email: 'priya@email.com', phone: '9876543230', age: 17, dateOfBirth: '2007-11-30', address: '78 Lake View, Bangalore', guardianName: 'Amit Singh', guardianPhone: '9876543231', program: 'Senior Academy', joinDate: '2023-06-01', status: 'active', position: 'All-rounder', battingStyle: 'Left-hand', bowlingStyle: 'Left-arm spin', jerseyNumber: '11', registrationNumber: 'ECA-0003', emergencyContact: '9876543232' },
  { id: 'p4', name: 'Karan Mehta', email: 'karan@email.com', phone: '9876543240', age: 13, dateOfBirth: '2011-05-18', address: '22 Rose Garden, Delhi', guardianName: 'Vijay Mehta', guardianPhone: '9876543241', program: 'Youth Development', joinDate: '2024-03-01', status: 'active', position: 'Wicket-keeper', battingStyle: 'Right-hand', bowlingStyle: 'None', jerseyNumber: '3', registrationNumber: 'ECA-0004', emergencyContact: '9876543242' },
  { id: 'p5', name: 'Sneha Verma', email: 'sneha@email.com', phone: '9876543250', age: 15, dateOfBirth: '2009-09-08', address: '56 Lotus Street, Chennai', guardianName: 'Ramesh Verma', guardianPhone: '9876543251', program: 'Junior Elite', joinDate: '2024-01-20', status: 'active', position: 'Batsman', battingStyle: 'Left-hand', bowlingStyle: 'Left-arm medium', jerseyNumber: '18', registrationNumber: 'ECA-0005', emergencyContact: '9876543252' },
  { id: 'p6', name: 'Vivek Kumar', email: 'vivek@email.com', phone: '9876543260', age: 18, dateOfBirth: '2006-12-25', address: '88 Green Valley, Hyderabad', guardianName: 'Ashok Kumar', guardianPhone: '9876543261', program: 'Senior Academy', joinDate: '2023-09-01', status: 'active', position: 'Bowler', battingStyle: 'Right-hand', bowlingStyle: 'Right-arm off-spin', jerseyNumber: '14', registrationNumber: 'ECA-0006', emergencyContact: '9876543262' },
  { id: 'p7', name: 'Ananya Das', email: 'ananya@email.com', phone: '9876543270', age: 12, dateOfBirth: '2012-04-14', address: '34 Blue Hills, Kolkata', guardianName: 'Dipak Das', guardianPhone: '9876543271', program: 'Foundation Course', joinDate: '2024-04-10', status: 'active', position: 'Batsman', battingStyle: 'Right-hand', bowlingStyle: 'Right-arm medium', jerseyNumber: '5', registrationNumber: 'ECA-0007', emergencyContact: '9876543272' },
  { id: 'p8', name: 'Nikhil Joshi', email: 'nikhil@email.com', phone: '9876543280', age: 16, dateOfBirth: '2008-08-20', address: '67 Silver Oak, Ahmedabad', guardianName: 'Prakash Joshi', guardianPhone: '9876543281', program: 'Junior Elite', joinDate: '2024-02-01', status: 'inactive', position: 'All-rounder', battingStyle: 'Right-hand', bowlingStyle: 'Right-arm medium', jerseyNumber: '9', registrationNumber: 'ECA-0008', emergencyContact: '9876543282' },
];

const defaultCoaches: Coach[] = [
  { id: 'c1', name: 'Mahendra Singh', email: 'mahendra@eca.com', phone: '9812345670', specialization: 'Batting', experience: 15, qualifications: 'NCA Level 3, BCCI Certified', status: 'active', bio: 'Former state-level cricketer with 15 years of coaching experience. Has trained 200+ players.', joinDate: '2020-01-15', salary: 65000 },
  { id: 'c2', name: 'Suresh Yadav', email: 'suresh@eca.com', phone: '9812345671', specialization: 'Bowling', experience: 12, qualifications: 'NCA Level 2, BCCI Certified', status: 'active', bio: 'Specialist fast bowling coach with expertise in swing and seam bowling techniques.', joinDate: '2021-03-01', salary: 58000 },
  { id: 'c3', name: 'Rekha Patel', email: 'rekha@eca.com', phone: '9812345672', specialization: 'Fielding & Fitness', experience: 8, qualifications: 'Sports Science Degree, NCA Level 1', status: 'active', bio: 'Dedicated fielding coach and fitness trainer focused on agility and endurance training.', joinDate: '2022-06-01', salary: 50000 },
];

const defaultPrograms: Program[] = [
  { id: 'pr1', name: 'Foundation Course', description: 'Basic cricket training for absolute beginners', duration: '3 months', fee: 8000, ageGroup: '8-12 years', schedule: 'Mon, Wed, Fri - 6:00 AM to 8:00 AM', maxPlayers: 20, currentPlayers: 12, coach: 'Mahendra Singh', status: 'active', level: 'beginner' },
  { id: 'pr2', name: 'Youth Development', description: 'Comprehensive skill development for young cricketers', duration: '6 months', fee: 15000, ageGroup: '12-16 years', schedule: 'Tue, Thu, Sat - 6:00 AM to 9:00 AM', maxPlayers: 25, currentPlayers: 18, coach: 'Suresh Yadav', status: 'active', level: 'intermediate' },
  { id: 'pr3', name: 'Junior Elite', description: 'Advanced training program for talented junior players', duration: '1 year', fee: 30000, ageGroup: '14-18 years', schedule: 'Mon to Sat - 5:30 AM to 9:00 AM', maxPlayers: 15, currentPlayers: 11, coach: 'Mahendra Singh', status: 'active', level: 'advanced' },
  { id: 'pr4', name: 'Senior Academy', description: 'Professional-level training for aspiring senior cricketers', duration: '1 year', fee: 45000, ageGroup: '16-25 years', schedule: 'Mon to Sat - 5:00 AM to 9:00 AM', maxPlayers: 15, currentPlayers: 9, coach: 'Suresh Yadav', status: 'active', level: 'advanced' },
];

const today = getTodayString();
const defaultHolidays: Holiday[] = [
  { id: 'h1', date: '2026-01-26', name: 'Republic Day', type: 'national', description: 'National holiday - Republic Day of India', isRecurring: true },
  { id: 'h2', date: '2026-08-15', name: 'Independence Day', type: 'national', description: 'National holiday - Independence Day of India', isRecurring: true },
  { id: 'h3', date: '2026-10-02', name: 'Gandhi Jayanti', type: 'national', description: 'National holiday - Mahatma Gandhi Birthday', isRecurring: true },
  { id: 'h4', date: '2026-11-01', name: 'Academy Foundation Day', type: 'academy', description: 'Elite Cricket Academy Foundation Day celebration', isRecurring: true },
  { id: 'h5', date: '2026-12-25', name: 'Christmas', type: 'national', description: 'Christmas Day - National Holiday', isRecurring: true },
];

const defaultFees: Fee[] = [
  { id: 'f1', playerId: 'p1', playerName: 'Arjun Sharma', amount: 30000, dueDate: '2026-07-05', paidDate: '2026-07-03', status: 'paid', month: 'July', year: 2026, program: 'Junior Elite', paymentMethod: 'UPI', transactionId: 'TXN12345' },
  { id: 'f2', playerId: 'p2', playerName: 'Rohan Patel', amount: 15000, dueDate: '2026-07-05', status: 'pending', month: 'July', year: 2026, program: 'Youth Development' },
  { id: 'f3', playerId: 'p3', playerName: 'Priya Singh', amount: 45000, dueDate: '2026-06-05', status: 'paid', paidDate: '2026-06-02', month: 'June', year: 2026, program: 'Senior Academy', paymentMethod: 'Bank Transfer', transactionId: 'TXN12346' },
  { id: 'f4', playerId: 'p4', playerName: 'Karan Mehta', amount: 15000, dueDate: '2026-06-05', status: 'overdue', month: 'June', year: 2026, program: 'Youth Development' },
  { id: 'f5', playerId: 'p5', playerName: 'Sneha Verma', amount: 30000, dueDate: '2026-07-05', status: 'pending', month: 'July', year: 2026, program: 'Junior Elite' },
];

const defaultNews: NewsPost[] = [
  { id: 'n1', title: 'Elite Cricket Academy Wins State Championship 2026', content: 'Our academy team has won the prestigious state championship for the third consecutive year. The players showed exceptional skill and determination throughout the tournament.', excerpt: 'Our academy team wins the state championship for the third consecutive year.', author: 'Admin', publishDate: '2026-07-15', status: 'published', category: 'Achievement', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=400&fit=crop', tags: ['championship', 'achievement', 'state'] },
  { id: 'n2', title: 'New Batting Simulator Technology Installed at Academy', content: 'We have installed state-of-the-art batting simulation technology to enhance player training experience. The simulator provides real-time feedback on batting technique.', excerpt: 'State-of-the-art batting simulator technology enhances player training experience.', author: 'Admin', publishDate: '2026-07-10', status: 'published', category: 'News', image: 'https://images.unsplash.com/photo-1574791017827-96e4a50d93f3?w=800&h=400&fit=crop', tags: ['technology', 'training', 'update'] },
  { id: 'n3', title: 'Annual Sports Day Celebration - Join Us!', content: 'Join us for our Annual Sports Day celebration on August 15th. Various exciting events and competitions will be held for players of all age groups.', excerpt: 'Annual Sports Day celebration on August 15th with exciting events for all age groups.', author: 'Admin', publishDate: '2026-07-05', status: 'published', category: 'Event', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&h=400&fit=crop', tags: ['sports day', 'event', 'celebration'] },
];

const defaultAchievements: Achievement[] = [
  { id: 'a1', title: 'State Under-19 Championship', description: 'Academy team won the state under-19 cricket championship', date: '2026-06-20', category: 'Team Achievement', playerName: 'Academy Team', level: 'state' },
  { id: 'a2', title: 'National Cricket Tournament - Runner Up', description: 'Academy players represented in national cricket tournament', date: '2026-05-15', category: 'Team Achievement', playerName: 'Academy Team', level: 'national' },
  { id: 'a3', title: 'Best Young Batsman Award', description: 'Arjun Sharma won the Best Young Batsman award at state level', date: '2026-04-10', category: 'Individual Achievement', playerName: 'Arjun Sharma', level: 'state' },
];

const defaultGallery: GalleryItem[] = [
  { id: 'g1', title: 'Training Session', imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&h=400&fit=crop', category: 'Training', date: '2026-07-01' },
  { id: 'g2', title: 'Match Day', imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&h=400&fit=crop', category: 'Match', date: '2026-06-15' },
  { id: 'g3', title: 'Award Ceremony', imageUrl: 'https://images.unsplash.com/photo-1574791017827-96e4a50d93f3?w=600&h=400&fit=crop', category: 'Event', date: '2026-05-20' },
  { id: 'g4', title: 'Academy Facilities', imageUrl: 'https://images.unsplash.com/photo-1606914700485-38f5d6c3d8ab?w=600&h=400&fit=crop', category: 'Facility', date: '2026-04-10' },
];

const defaultTestimonials: Testimonial[] = [
  { id: 't1', name: 'Rajesh Sharma', role: 'Parent of Arjun Sharma', content: 'Elite Cricket Academy has transformed my son into a confident cricketer. The coaching staff is exceptional and truly dedicated.', rating: 5, date: '2026-06-15', status: 'approved' },
  { id: 't2', name: 'Priya Singh', role: 'Senior Academy Player', content: 'Best cricket academy in the region! The training methodology is world-class and I have improved tremendously.', rating: 5, date: '2026-05-20', status: 'approved' },
  { id: 't3', name: 'Suresh Patel', role: 'Parent of Rohan Patel', content: 'Excellent facilities and highly professional coaches. My child loves coming here every day.', rating: 4, date: '2026-04-10', status: 'approved' },
];

const defaultMessages: ContactMessage[] = [
  { id: 'm1', name: 'Deepak Nair', email: 'deepak@email.com', phone: '9988776655', subject: 'Admission Inquiry', message: 'I would like to enroll my 12-year-old son in your foundation course. Please provide details about fees and schedule.', date: '2026-07-18', status: 'unread' },
  { id: 'm2', name: 'Anita Gupta', email: 'anita@email.com', subject: 'Scholarship Information', message: 'Could you please share information about available scholarships for talented but financially constrained players?', date: '2026-07-17', status: 'read' },
];

const defaultWebsiteContent: WebsiteContent = {
  home: {
    heroTitle: 'Train Like a Champion',
    heroSubtitle: 'Elite Cricket Academy — where future champions are forged through discipline, skill, and passion.',
    heroCTA: 'Enroll Now',
    statsSection: [
      { label: 'Players Trained', value: '500+' },
      { label: 'State Champions', value: '12' },
      { label: 'National Players', value: '35' },
      { label: 'Years of Excellence', value: '15+' },
    ],
    aboutTitle: 'Building Champions Since 2010',
    aboutContent: 'Elite Cricket Academy has been nurturing cricket talent for over 15 years. Our world-class facilities, professional coaching staff, and structured training programs have produced dozens of state and national level cricketers.',
    missionTitle: 'Our Mission',
    missionContent: 'To identify, develop, and nurture cricket talent through professional coaching, modern facilities, and a holistic development approach that builds not just cricketers, but champions in life.',
  },
  about: {
    title: 'About Elite Cricket Academy',
    content: 'Founded in 2010, Elite Cricket Academy has grown to become one of the premier cricket training institutes in the country.',
    vision: 'To be the leading cricket development institution producing world-class cricketers.',
    mission: 'To provide professional cricket training that transforms passionate players into champions.',
    values: ['Excellence', 'Discipline', 'Teamwork', 'Integrity', 'Innovation'],
    foundedYear: '2010',
    founderName: 'Mr. Vikram Rajput',
  },
  contact: {
    address: '123 Sports Complex, Cricket Ground Road, Mumbai - 400001, Maharashtra, India',
    phone: '+91 98765 43210',
    email: 'info@elitecricketacademy.com',
    mapEmbedUrl: '',
    workingHours: 'Monday - Saturday: 5:00 AM to 9:00 PM',
    socialLinks: {
      facebook: 'https://facebook.com/elitecricketacademy',
      instagram: 'https://instagram.com/elitecricketacademy',
      twitter: 'https://twitter.com/elitecricket',
      youtube: 'https://youtube.com/elitecricketacademy',
    },
  },
  banners: [
    { id: 'b1', title: 'Train Like a Champion', subtitle: 'Professional cricket coaching for all age groups', imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1400&h=600&fit=crop', ctaText: 'Join Now', ctaLink: '/register', isActive: true },
    { id: 'b2', title: 'State Championship Winners', subtitle: 'Celebrating 3 consecutive state championship victories', imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1400&h=600&fit=crop', ctaText: 'Our Achievements', ctaLink: '/achievements', isActive: true },
  ],
};

const defaultNotifications: Notification[] = [
  { id: 'notif1', title: 'Fee Overdue', message: 'Karan Mehta has an overdue fee of ₹15,000 for June 2026.', type: 'warning', date: getTodayString(), isRead: false },
  { id: 'notif2', title: 'New Registration', message: 'New enrollment inquiry received from Deepak Nair.', type: 'info', date: getTodayString(), isRead: false },
  { id: 'notif3', title: 'Attendance Pending', message: "Today's attendance has not been marked yet.", type: 'warning', date: getTodayString(), isRead: false },
];
