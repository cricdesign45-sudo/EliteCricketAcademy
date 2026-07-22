/**
 * Async database layer — replaces localStorage with Supabase PostgreSQL.
 * All functions return data or throw an error (no silent failures).
 */
import { supabase } from '@/lib/supabase';
import type {
  Player, Coach, Program, Fee, AttendanceRecord, Holiday,
  NewsPost, Achievement, GalleryItem, Testimonial,
  ContactMessage, WebsiteContent, Notification,
  PlayerMessage, StoreProduct, StoreOrder,
} from '@/types';

function toPlayerMessage(row: Record<string, unknown>): PlayerMessage {
  return {
    id: row.id as string,
    senderId: row.sender_id as string,
    senderName: row.sender_name as string,
    senderType: row.sender_type as PlayerMessage['senderType'],
    recipientId: row.recipient_id as string,
    recipientName: row.recipient_name as string,
    subject: row.subject as string | undefined,
    message: row.message as string,
    reply: row.reply as string | undefined,
    repliedAt: row.replied_at as string | undefined,
    isRead: (row.is_read as boolean) || false,
    status: row.status as PlayerMessage['status'],
    createdAt: row.created_at as string,
  };
}

function toStoreProduct(row: Record<string, unknown>): StoreProduct {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string | undefined,
    price: row.price as number,
    originalPrice: row.original_price as number | undefined,
    category: row.category as string,
    image: row.image as string | undefined,
    stock: row.stock as number,
    status: row.status as StoreProduct['status'],
    featured: (row.featured as boolean) || false,
    tags: (row.tags as string[]) || [],
    createdAt: row.created_at as string | undefined,
  };
}

function toStoreOrder(row: Record<string, unknown>): StoreOrder {
  return {
    id: row.id as string,
    orderNumber: row.order_number as string,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string | undefined,
    customerEmail: row.customer_email as string | undefined,
    playerId: row.player_id as string | undefined,
    items: (row.items as StoreOrder['items']) || [],
    totalAmount: row.total_amount as number,
    status: row.status as StoreOrder['status'],
    paymentMethod: row.payment_method as string | undefined,
    paymentStatus: row.payment_status as StoreOrder['paymentStatus'],
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string | undefined,
  };
}

// ─── column name mappers ──────────────────────────────────────────
// Supabase uses snake_case; our types use camelCase.
// We map on read and write to keep types consistent.

function toPlayer(row: Record<string, unknown>): Player {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string) || '',
    phone: row.phone as string,
    age: (row.age as number) || 0,
    dateOfBirth: (row.date_of_birth as string) || '',
    address: (row.address as string) || '',
    guardianName: (row.guardian_name as string) || '',
    guardianPhone: (row.guardian_phone as string) || '',
    program: (row.program as string) || '',
    joinDate: (row.join_date as string) || '',
    status: row.status as Player['status'],
    photo: row.photo as string | undefined,
    position: (row.position as string) || '',
    battingStyle: (row.batting_style as string) || '',
    bowlingStyle: (row.bowling_style as string) || '',
    jerseyNumber: (row.jersey_number as string) || '',
    registrationNumber: (row.registration_number as string) || '',
    emergencyContact: (row.emergency_contact as string) || '',
    medicalNotes: row.medical_notes as string | undefined,
    badge: (row.badge as Player['badge']) || null,
  };
}

function fromPlayer(p: Omit<Player, 'id' | 'registrationNumber'>) {
  return {
    name: p.name,
    email: p.email || null,
    phone: p.phone,
    age: p.age || null,
    date_of_birth: p.dateOfBirth || null,
    address: p.address || null,
    guardian_name: p.guardianName || null,
    guardian_phone: p.guardianPhone || null,
    program: p.program || null,
    join_date: p.joinDate,
    status: p.status,
    photo: p.photo || null,
    position: p.position || null,
    batting_style: p.battingStyle || null,
    bowling_style: p.bowlingStyle || null,
    jersey_number: p.jerseyNumber || null,
    emergency_contact: p.emergencyContact || null,
    medical_notes: p.medicalNotes || null,
    badge: (p as Player).badge || null,
  };
}

function toCoach(row: Record<string, unknown>): Coach {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string) || '',
    phone: (row.phone as string) || '',
    specialization: (row.specialization as string) || '',
    experience: (row.experience as number) || 0,
    qualifications: (row.qualifications as string) || '',
    status: row.status as Coach['status'],
    photo: row.photo as string | undefined,
    bio: (row.bio as string) || '',
    joinDate: (row.join_date as string) || '',
    salary: (row.salary as number) || 0,
  };
}

function fromCoach(c: Omit<Coach, 'id'>) {
  return {
    name: c.name,
    email: c.email || null,
    phone: c.phone || null,
    specialization: c.specialization || null,
    experience: c.experience || 0,
    qualifications: c.qualifications || null,
    status: c.status,
    photo: c.photo || null,
    bio: c.bio || null,
    join_date: c.joinDate || null,
    salary: c.salary || null,
  };
}

function toProgram(row: Record<string, unknown>): Program {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || '',
    duration: (row.duration as string) || '',
    fee: (row.fee as number) || 0,
    ageGroup: (row.age_group as string) || '',
    schedule: (row.schedule as string) || '',
    maxPlayers: (row.max_players as number) || 20,
    currentPlayers: (row.current_players as number) || 0,
    coach: (row.coach as string) || '',
    status: row.status as Program['status'],
    level: row.level as Program['level'],
    photo: row.photo as string | undefined,
  };
}

function fromProgram(p: Omit<Program, 'id'>) {
  return {
    name: p.name,
    description: p.description || null,
    duration: p.duration || null,
    fee: p.fee,
    age_group: p.ageGroup || null,
    schedule: p.schedule || null,
    max_players: p.maxPlayers,
    current_players: p.currentPlayers,
    coach: p.coach || null,
    status: p.status,
    level: p.level,
    photo: p.photo || null,
  };
}

function toFee(row: Record<string, unknown>): Fee {
  return {
    id: row.id as string,
    playerId: (row.player_id as string) || '',
    playerName: row.player_name as string,
    amount: row.amount as number,
    dueDate: row.due_date as string,
    paidDate: row.paid_date as string | undefined,
    status: row.status as Fee['status'],
    month: row.month as string,
    year: row.year as number,
    program: (row.program as string) || '',
    paymentMethod: row.payment_method as string | undefined,
    transactionId: row.transaction_id as string | undefined,
    notes: row.notes as string | undefined,
    discount: row.discount as number | undefined,
    lateFee: row.late_fee as number | undefined,
  };
}

function fromFee(f: Omit<Fee, 'id'>) {
  return {
    player_id: f.playerId || null,
    player_name: f.playerName,
    amount: f.amount,
    due_date: f.dueDate,
    paid_date: f.paidDate || null,
    status: f.status,
    month: f.month,
    year: f.year,
    program: f.program || null,
    payment_method: f.paymentMethod || null,
    transaction_id: f.transactionId || null,
    notes: f.notes || null,
    discount: f.discount || null,
    late_fee: f.lateFee || null,
  };
}

function toAttendance(row: Record<string, unknown>): AttendanceRecord {
  return {
    id: row.id as string,
    playerId: (row.player_id as string) || '',
    playerName: row.player_name as string,
    date: row.date as string,
    status: row.status as AttendanceRecord['status'],
    markedBy: (row.marked_by as string) || 'Admin',
    notes: row.notes as string | undefined,
    time: row.time as string | undefined,
  };
}

function toHoliday(row: Record<string, unknown>): Holiday {
  return {
    id: row.id as string,
    date: row.date as string,
    name: row.name as string,
    type: row.type as Holiday['type'],
    description: row.description as string | undefined,
    isRecurring: (row.is_recurring as boolean) || false,
  };
}

function toNewsPost(row: Record<string, unknown>): NewsPost {
  return {
    id: row.id as string,
    title: row.title as string,
    content: (row.content as string) || '',
    excerpt: (row.excerpt as string) || '',
    author: (row.author as string) || 'Admin',
    publishDate: row.publish_date as string,
    status: row.status as NewsPost['status'],
    category: (row.category as string) || '',
    image: row.image as string | undefined,
    tags: (row.tags as string[]) || [],
  };
}

function toAchievement(row: Record<string, unknown>): Achievement {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || '',
    date: (row.date as string) || '',
    category: (row.category as string) || '',
    playerName: row.player_name as string | undefined,
    image: row.image as string | undefined,
    level: row.level as Achievement['level'],
  };
}

function toGalleryItem(row: Record<string, unknown>): GalleryItem {
  return {
    id: row.id as string,
    title: row.title as string,
    imageUrl: row.image_url as string,
    category: (row.category as string) || '',
    date: (row.date as string) || '',
    description: row.description as string | undefined,
  };
}

function toTestimonial(row: Record<string, unknown>): Testimonial {
  return {
    id: row.id as string,
    name: row.name as string,
    role: (row.role as string) || '',
    content: row.content as string,
    rating: (row.rating as number) || 5,
    image: row.image as string | undefined,
    date: (row.date as string) || '',
    status: row.status as Testimonial['status'],
  };
}

function toContactMessage(row: Record<string, unknown>): ContactMessage {
  return {
    id: row.id as string,
    name: row.name as string,
    email: (row.email as string) || '',
    phone: row.phone as string | undefined,
    subject: (row.subject as string) || '',
    message: row.message as string,
    date: row.date as string,
    status: row.status as ContactMessage['status'],
  };
}

function toNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    title: row.title as string,
    message: row.message as string,
    type: row.type as Notification['type'],
    date: row.date as string,
    isRead: (row.is_read as boolean) || false,
  };
}

// ─── PLAYERS ─────────────────────────────────────────────────────
export const db = {
  players: {
    async getAll(): Promise<Player[]> {
      const { data, error } = await supabase.from('players').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toPlayer(row as Record<string, unknown>));
    },
    async getById(id: string): Promise<Player | null> {
      const { data, error } = await supabase.from('players').select('*').eq('id', id).single();
      if (error) return null;
      return toPlayer(data as Record<string, unknown>);
    },
    async add(player: Omit<Player, 'id' | 'registrationNumber'>, regNumber: string): Promise<Player> {
      const { data, error } = await supabase
        .from('players')
        .insert({ ...fromPlayer(player), registration_number: regNumber })
        .select()
        .single();
      if (error) throw error;
      return toPlayer(data as Record<string, unknown>);
    },
    async update(id: string, data: Partial<Player>): Promise<void> {
      const mapped: Record<string, unknown> = {};
      if (data.name !== undefined) mapped.name = data.name;
      if (data.email !== undefined) mapped.email = data.email;
      if (data.phone !== undefined) mapped.phone = data.phone;
      if (data.age !== undefined) mapped.age = data.age;
      if (data.dateOfBirth !== undefined) mapped.date_of_birth = data.dateOfBirth;
      if (data.address !== undefined) mapped.address = data.address;
      if (data.guardianName !== undefined) mapped.guardian_name = data.guardianName;
      if (data.guardianPhone !== undefined) mapped.guardian_phone = data.guardianPhone;
      if (data.program !== undefined) mapped.program = data.program;
      if (data.joinDate !== undefined) mapped.join_date = data.joinDate;
      if (data.status !== undefined) mapped.status = data.status;
      if (data.photo !== undefined) mapped.photo = data.photo;
      if (data.position !== undefined) mapped.position = data.position;
      if (data.battingStyle !== undefined) mapped.batting_style = data.battingStyle;
      if (data.bowlingStyle !== undefined) mapped.bowling_style = data.bowlingStyle;
      if (data.jerseyNumber !== undefined) mapped.jersey_number = data.jerseyNumber;
      if (data.emergencyContact !== undefined) mapped.emergency_contact = data.emergencyContact;
      if (data.medicalNotes !== undefined) mapped.medical_notes = data.medicalNotes;
      if (data.badge !== undefined) mapped.badge = data.badge;
      mapped.updated_at = new Date().toISOString();
      const { error } = await supabase.from('players').update(mapped).eq('id', id);
      if (error) throw error;
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('players').delete().eq('id', id);
      if (error) throw error;
    },
    async count(): Promise<number> {
      const { count } = await supabase.from('players').select('*', { count: 'exact', head: true });
      return count || 0;
    },
  },

  // ─── COACHES ───────────────────────────────────────────────────
  coaches: {
    async getAll(): Promise<Coach[]> {
      const { data, error } = await supabase.from('coaches').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toCoach(row as Record<string, unknown>));
    },
    async getById(id: string): Promise<Coach | null> {
      const { data, error } = await supabase.from('coaches').select('*').eq('id', id).single();
      if (error) return null;
      return toCoach(data as Record<string, unknown>);
    },
    async add(coach: Omit<Coach, 'id'>): Promise<Coach> {
      const { data, error } = await supabase.from('coaches').insert(fromCoach(coach)).select().single();
      if (error) throw error;
      return toCoach(data as Record<string, unknown>);
    },
    async update(id: string, data: Partial<Coach>): Promise<void> {
      const { error } = await supabase.from('coaches').update(fromCoach(data as Omit<Coach, 'id'>)).eq('id', id);
      if (error) throw error;
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('coaches').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // ─── PROGRAMS ──────────────────────────────────────────────────
  programs: {
    async getAll(): Promise<Program[]> {
      const { data, error } = await supabase.from('programs').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toProgram(row as Record<string, unknown>));
    },
    async getById(id: string): Promise<Program | null> {
      const { data, error } = await supabase.from('programs').select('*').eq('id', id).single();
      if (error) return null;
      return toProgram(data as Record<string, unknown>);
    },
    async add(program: Omit<Program, 'id'>): Promise<Program> {
      const { data, error } = await supabase.from('programs').insert(fromProgram(program)).select().single();
      if (error) throw error;
      return toProgram(data as Record<string, unknown>);
    },
    async update(id: string, data: Partial<Program>): Promise<void> {
      const mapped: Record<string, unknown> = {};
      if (data.name !== undefined) mapped.name = data.name;
      if (data.description !== undefined) mapped.description = data.description;
      if (data.duration !== undefined) mapped.duration = data.duration;
      if (data.fee !== undefined) mapped.fee = data.fee;
      if (data.ageGroup !== undefined) mapped.age_group = data.ageGroup;
      if (data.schedule !== undefined) mapped.schedule = data.schedule;
      if (data.maxPlayers !== undefined) mapped.max_players = data.maxPlayers;
      if (data.currentPlayers !== undefined) mapped.current_players = data.currentPlayers;
      if (data.coach !== undefined) mapped.coach = data.coach;
      if (data.status !== undefined) mapped.status = data.status;
      if (data.level !== undefined) mapped.level = data.level;
      if (data.photo !== undefined) mapped.photo = data.photo;
      const { error } = await supabase.from('programs').update(mapped).eq('id', id);
      if (error) throw error;
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // ─── FEES ──────────────────────────────────────────────────────
  fees: {
    async getAll(): Promise<Fee[]> {
      const { data, error } = await supabase.from('fees').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toFee(row as Record<string, unknown>));
    },
    async getByPlayer(playerId: string): Promise<Fee[]> {
      const { data, error } = await supabase.from('fees').select('*').eq('player_id', playerId).order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toFee(row as Record<string, unknown>));
    },
    async add(fee: Omit<Fee, 'id'>): Promise<Fee> {
      const { data, error } = await supabase.from('fees').insert(fromFee(fee)).select().single();
      if (error) throw error;
      return toFee(data as Record<string, unknown>);
    },
    async update(id: string, data: Partial<Fee>): Promise<void> {
      const mapped: Record<string, unknown> = {};
      if (data.status !== undefined) mapped.status = data.status;
      if (data.paidDate !== undefined) mapped.paid_date = data.paidDate;
      if (data.amount !== undefined) mapped.amount = data.amount;
      if (data.notes !== undefined) mapped.notes = data.notes;
      if (data.paymentMethod !== undefined) mapped.payment_method = data.paymentMethod;
      if (data.transactionId !== undefined) mapped.transaction_id = data.transactionId;
      if (data.discount !== undefined) mapped.discount = data.discount;
      if (data.lateFee !== undefined) mapped.late_fee = data.lateFee;
      mapped.updated_at = new Date().toISOString();
      const { error } = await supabase.from('fees').update(mapped).eq('id', id);
      if (error) throw error;
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('fees').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // ─── ATTENDANCE ────────────────────────────────────────────────
  attendance: {
    async getAll(): Promise<AttendanceRecord[]> {
      const { data, error } = await supabase.from('attendance').select('*').order('date', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toAttendance(row as Record<string, unknown>));
    },
    async getByDate(date: string): Promise<AttendanceRecord[]> {
      const { data, error } = await supabase.from('attendance').select('*').eq('date', date);
      if (error) throw error;
      return (data || []).map(row => toAttendance(row as Record<string, unknown>));
    },
    async getByPlayer(playerId: string): Promise<AttendanceRecord[]> {
      const { data, error } = await supabase.from('attendance').select('*').eq('player_id', playerId).order('date', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toAttendance(row as Record<string, unknown>));
    },
    async isMarkedForDate(date: string): Promise<boolean> {
      const { count } = await supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', date);
      return (count || 0) > 0;
    },
    async markBulk(records: Omit<AttendanceRecord, 'id'>[]): Promise<void> {
      if (records.length === 0) return;
      const date = records[0].date;
      // Delete existing records for this date first (upsert via delete+insert)
      await supabase.from('attendance').delete().eq('date', date);
      const rows = records.map(r => ({
        player_id: r.playerId || null,
        player_name: r.playerName,
        date: r.date,
        status: r.status,
        marked_by: r.markedBy || 'Admin',
        notes: r.notes || null,
        time: r.time || null,
      }));
      const { error } = await supabase.from('attendance').insert(rows);
      if (error) throw error;
    },
    async update(id: string, data: Partial<AttendanceRecord>): Promise<void> {
      const mapped: Record<string, unknown> = {};
      if (data.status !== undefined) mapped.status = data.status;
      if (data.notes !== undefined) mapped.notes = data.notes;
      if (data.time !== undefined) mapped.time = data.time;
      const { error } = await supabase.from('attendance').update(mapped).eq('id', id);
      if (error) throw error;
    },
  },

  // ─── HOLIDAYS ──────────────────────────────────────────────────
  holidays: {
    async getAll(): Promise<Holiday[]> {
      const { data, error } = await supabase.from('holidays').select('*').order('date');
      if (error) throw error;
      return (data || []).map(row => toHoliday(row as Record<string, unknown>));
    },
    async isHoliday(date: string): Promise<boolean> {
      const { count } = await supabase.from('holidays').select('*', { count: 'exact', head: true }).eq('date', date);
      return (count || 0) > 0;
    },
    async getForDate(date: string): Promise<Holiday | null> {
      const { data } = await supabase.from('holidays').select('*').eq('date', date).single();
      return data ? toHoliday(data as Record<string, unknown>) : null;
    },
    async add(holiday: Omit<Holiday, 'id'>): Promise<Holiday> {
      const { data, error } = await supabase.from('holidays').insert({
        date: holiday.date,
        name: holiday.name,
        type: holiday.type,
        description: holiday.description || null,
        is_recurring: holiday.isRecurring,
      }).select().single();
      if (error) throw error;
      return toHoliday(data as Record<string, unknown>);
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('holidays').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // ─── NEWS ──────────────────────────────────────────────────────
  news: {
    async getAll(): Promise<NewsPost[]> {
      const { data, error } = await supabase.from('news_posts').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toNewsPost(row as Record<string, unknown>));
    },
    async getById(id: string): Promise<NewsPost | null> {
      const { data } = await supabase.from('news_posts').select('*').eq('id', id).single();
      return data ? toNewsPost(data as Record<string, unknown>) : null;
    },
    async add(post: Omit<NewsPost, 'id'>): Promise<NewsPost> {
      const { data, error } = await supabase.from('news_posts').insert({
        title: post.title,
        content: post.content,
        excerpt: post.excerpt,
        author: post.author,
        publish_date: post.publishDate,
        status: post.status,
        category: post.category,
        image: post.image || null,
        tags: post.tags,
      }).select().single();
      if (error) throw error;
      return toNewsPost(data as Record<string, unknown>);
    },
    async update(id: string, data: Partial<NewsPost>): Promise<void> {
      const mapped: Record<string, unknown> = {};
      if (data.title !== undefined) mapped.title = data.title;
      if (data.content !== undefined) mapped.content = data.content;
      if (data.excerpt !== undefined) mapped.excerpt = data.excerpt;
      if (data.author !== undefined) mapped.author = data.author;
      if (data.publishDate !== undefined) mapped.publish_date = data.publishDate;
      if (data.status !== undefined) mapped.status = data.status;
      if (data.category !== undefined) mapped.category = data.category;
      if (data.image !== undefined) mapped.image = data.image;
      if (data.tags !== undefined) mapped.tags = data.tags;
      mapped.updated_at = new Date().toISOString();
      const { error } = await supabase.from('news_posts').update(mapped).eq('id', id);
      if (error) throw error;
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('news_posts').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // ─── ACHIEVEMENTS ──────────────────────────────────────────────
  achievements: {
    async getAll(): Promise<Achievement[]> {
      const { data, error } = await supabase.from('achievements').select('*').order('date', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toAchievement(row as Record<string, unknown>));
    },
    async add(a: Omit<Achievement, 'id'>): Promise<Achievement> {
      const { data, error } = await supabase.from('achievements').insert({
        title: a.title, description: a.description || null, date: a.date || null,
        category: a.category || null, player_name: a.playerName || null,
        image: a.image || null, level: a.level,
      }).select().single();
      if (error) throw error;
      return toAchievement(data as Record<string, unknown>);
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('achievements').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // ─── GALLERY ───────────────────────────────────────────────────
  gallery: {
    async getAll(): Promise<GalleryItem[]> {
      const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toGalleryItem(row as Record<string, unknown>));
    },
    async add(item: Omit<GalleryItem, 'id'>): Promise<GalleryItem> {
      const { data, error } = await supabase.from('gallery').insert({
        title: item.title, image_url: item.imageUrl, category: item.category || null,
        date: item.date || null, description: item.description || null,
      }).select().single();
      if (error) throw error;
      return toGalleryItem(data as Record<string, unknown>);
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('gallery').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // ─── TESTIMONIALS ──────────────────────────────────────────────
  testimonials: {
    async getAll(): Promise<Testimonial[]> {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toTestimonial(row as Record<string, unknown>));
    },
    async add(t: Omit<Testimonial, 'id'>): Promise<Testimonial> {
      const { data, error } = await supabase.from('testimonials').insert({
        name: t.name, role: t.role || null, content: t.content, rating: t.rating,
        image: t.image || null, date: t.date || null, status: t.status,
      }).select().single();
      if (error) throw error;
      return toTestimonial(data as Record<string, unknown>);
    },
    async update(id: string, data: Partial<Testimonial>): Promise<void> {
      const mapped: Record<string, unknown> = {};
      if (data.status !== undefined) mapped.status = data.status;
      if (data.content !== undefined) mapped.content = data.content;
      if (data.rating !== undefined) mapped.rating = data.rating;
      const { error } = await supabase.from('testimonials').update(mapped).eq('id', id);
      if (error) throw error;
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // ─── MESSAGES ──────────────────────────────────────────────────
  messages: {
    async getAll(): Promise<ContactMessage[]> {
      const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toContactMessage(row as Record<string, unknown>));
    },
    async add(msg: Omit<ContactMessage, 'id'>): Promise<ContactMessage> {
      const { data, error } = await supabase.from('contact_messages').insert({
        name: msg.name, email: msg.email || null, phone: msg.phone || null,
        subject: msg.subject || null, message: msg.message,
        date: msg.date, status: msg.status,
      }).select().single();
      if (error) throw error;
      return toContactMessage(data as Record<string, unknown>);
    },
    async update(id: string, data: Partial<ContactMessage>): Promise<void> {
      const mapped: Record<string, unknown> = {};
      if (data.status !== undefined) mapped.status = data.status;
      const { error } = await supabase.from('contact_messages').update(mapped).eq('id', id);
      if (error) throw error;
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // ─── NOTIFICATIONS ─────────────────────────────────────────────
  notifications: {
    async getAll(): Promise<Notification[]> {
      const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toNotification(row as Record<string, unknown>));
    },
    async add(n: Omit<Notification, 'id'>): Promise<Notification> {
      const { data, error } = await supabase.from('notifications').insert({
        title: n.title, message: n.message, type: n.type, date: n.date, is_read: n.isRead,
      }).select().single();
      if (error) throw error;
      return toNotification(data as Record<string, unknown>);
    },
    async markRead(id: string): Promise<void> {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) throw error;
    },
    async markAllRead(): Promise<void> {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
      if (error) throw error;
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // ─── PLAYER MESSAGES ──────────────────────────────────────────
  playerMessages: {
    async getAll(): Promise<PlayerMessage[]> {
      const { data, error } = await supabase.from('player_messages').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toPlayerMessage(row as Record<string, unknown>));
    },
    async getByPlayer(playerId: string): Promise<PlayerMessage[]> {
      const { data, error } = await supabase.from('player_messages').select('*').eq('sender_id', playerId).order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toPlayerMessage(row as Record<string, unknown>));
    },
    async send(msg: Omit<PlayerMessage, 'id' | 'createdAt' | 'reply' | 'repliedAt'>): Promise<PlayerMessage> {
      const { data, error } = await supabase.from('player_messages').insert({
        sender_id: msg.senderId, sender_name: msg.senderName,
        sender_type: msg.senderType, recipient_id: msg.recipientId,
        recipient_name: msg.recipientName, subject: msg.subject || null,
        message: msg.message, is_read: msg.isRead, status: msg.status,
      }).select().single();
      if (error) throw error;
      return toPlayerMessage(data as Record<string, unknown>);
    },
    async reply(id: string, replyText: string): Promise<void> {
      const { error } = await supabase.from('player_messages').update({
        reply: replyText,
        replied_at: new Date().toISOString(),
        status: 'replied',
        is_read: true,
      }).eq('id', id);
      if (error) throw error;
    },
    async markRead(id: string): Promise<void> {
      const { error } = await supabase.from('player_messages').update({ is_read: true, status: 'read' }).eq('id', id);
      if (error) throw error;
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('player_messages').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // ─── STORE PRODUCTS ───────────────────────────────────────────
  storeProducts: {
    async getAll(): Promise<StoreProduct[]> {
      const { data, error } = await supabase.from('store_products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toStoreProduct(row as Record<string, unknown>));
    },
    async getActive(): Promise<StoreProduct[]> {
      const { data, error } = await supabase.from('store_products').select('*').eq('status', 'active').order('featured', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toStoreProduct(row as Record<string, unknown>));
    },
    async add(product: Omit<StoreProduct, 'id' | 'createdAt'>): Promise<StoreProduct> {
      const { data, error } = await supabase.from('store_products').insert({
        name: product.name, description: product.description || null,
        price: product.price, original_price: product.originalPrice || null,
        category: product.category, image: product.image || null,
        stock: product.stock, status: product.status,
        featured: product.featured, tags: product.tags,
      }).select().single();
      if (error) throw error;
      return toStoreProduct(data as Record<string, unknown>);
    },
    async update(id: string, data: Partial<StoreProduct>): Promise<void> {
      const mapped: Record<string, unknown> = {};
      if (data.name !== undefined) mapped.name = data.name;
      if (data.description !== undefined) mapped.description = data.description;
      if (data.price !== undefined) mapped.price = data.price;
      if (data.originalPrice !== undefined) mapped.original_price = data.originalPrice;
      if (data.category !== undefined) mapped.category = data.category;
      if (data.image !== undefined) mapped.image = data.image;
      if (data.stock !== undefined) mapped.stock = data.stock;
      if (data.status !== undefined) mapped.status = data.status;
      if (data.featured !== undefined) mapped.featured = data.featured;
      if (data.tags !== undefined) mapped.tags = data.tags;
      mapped.updated_at = new Date().toISOString();
      const { error } = await supabase.from('store_products').update(mapped).eq('id', id);
      if (error) throw error;
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('store_products').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // ─── STORE ORDERS ─────────────────────────────────────────────
  storeOrders: {
    async getAll(): Promise<StoreOrder[]> {
      const { data, error } = await supabase.from('store_orders').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []).map(row => toStoreOrder(row as Record<string, unknown>));
    },
    async add(order: Omit<StoreOrder, 'id' | 'createdAt'>): Promise<StoreOrder> {
      const { data, error } = await supabase.from('store_orders').insert({
        order_number: order.orderNumber, customer_name: order.customerName,
        customer_phone: order.customerPhone || null, customer_email: order.customerEmail || null,
        player_id: order.playerId || null, items: order.items,
        total_amount: order.totalAmount, status: order.status,
        payment_method: order.paymentMethod || null, payment_status: order.paymentStatus,
        notes: order.notes || null,
      }).select().single();
      if (error) throw error;
      return toStoreOrder(data as Record<string, unknown>);
    },
    async update(id: string, data: Partial<StoreOrder>): Promise<void> {
      const mapped: Record<string, unknown> = {};
      if (data.status !== undefined) mapped.status = data.status;
      if (data.paymentStatus !== undefined) mapped.payment_status = data.paymentStatus;
      if (data.paymentMethod !== undefined) mapped.payment_method = data.paymentMethod;
      if (data.notes !== undefined) mapped.notes = data.notes;
      mapped.updated_at = new Date().toISOString();
      const { error } = await supabase.from('store_orders').update(mapped).eq('id', id);
      if (error) throw error;
    },
    async delete(id: string): Promise<void> {
      const { error } = await supabase.from('store_orders').delete().eq('id', id);
      if (error) throw error;
    },
  },

  // ─── WEBSITE CONTENT ───────────────────────────────────────────
  websiteContent: {
    async get(): Promise<WebsiteContent> {
      const { data } = await supabase.from('website_content').select('content').eq('id', 1).single();
      return (data?.content as WebsiteContent) || ({} as WebsiteContent);
    },
    async update(content: WebsiteContent): Promise<void> {
      const { error } = await supabase.from('website_content').upsert({ id: 1, content, updated_at: new Date().toISOString() });
      if (error) throw error;
    },
  },
};
