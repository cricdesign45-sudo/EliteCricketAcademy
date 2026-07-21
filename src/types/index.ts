export interface Player {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  dateOfBirth: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  program: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  photo?: string;
  position: string;
  battingStyle: string;
  bowlingStyle: string;
  jerseyNumber: string;
  registrationNumber: string;
  emergencyContact: string;
  medicalNotes?: string;
}

export interface Coach {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  experience: number;
  qualifications: string;
  status: 'active' | 'inactive';
  photo?: string;
  bio: string;
  joinDate: string;
  salary: number;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  duration: string;
  fee: number;
  ageGroup: string;
  schedule: string;
  maxPlayers: number;
  currentPlayers: number;
  coach: string;
  status: 'active' | 'inactive';
  level: 'beginner' | 'intermediate' | 'advanced';
  photo?: string;
}

export interface Fee {
  id: string;
  playerId: string;
  playerName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  month: string;
  year: number;
  program: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
  discount?: number;
  lateFee?: number;
}

export interface AttendanceRecord {
  id: string;
  playerId: string;
  playerName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  markedBy: string;
  notes?: string;
  time?: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: 'national' | 'state' | 'academy' | 'sports';
  description?: string;
  isRecurring: boolean;
}

export interface NewsPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  publishDate: string;
  status: 'published' | 'draft';
  category: string;
  image?: string;
  tags: string[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  playerName?: string;
  image?: string;
  level: 'district' | 'state' | 'national' | 'international';
}

export interface GalleryItem {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  date: string;
  description?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  image?: string;
  date: string;
  status: 'approved' | 'pending';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  date: string;
  status: 'read' | 'unread' | 'replied';
}

export interface WebsiteContent {
  home: {
    heroTitle: string;
    heroSubtitle: string;
    heroCTA: string;
    statsSection: { label: string; value: string }[];
    aboutTitle: string;
    aboutContent: string;
    missionTitle: string;
    missionContent: string;
  };
  about: {
    title: string;
    content: string;
    vision: string;
    mission: string;
    values: string[];
    foundedYear: string;
    founderName: string;
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    mapEmbedUrl: string;
    workingHours: string;
    socialLinks: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      youtube?: string;
    };
  };
  banners: {
    id: string;
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
    isActive: boolean;
  }[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
  isRead: boolean;
}
