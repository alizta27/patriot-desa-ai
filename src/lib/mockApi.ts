// Mock API data for admin dashboard
// This mimics Supabase data structures

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: 'aparatur' | 'pendamping' | 'bumdes' | 'umum' | 'admin' | null;
  subscription_status: 'free' | 'premium';
  usage_count: number;
  daily_usage_reset_at: string;
  created_at: string;
  phone_number?: string;
}

export interface MockDashboardStats {
  totalUsers: number;
  aparatur: number;
  pendamping: number;
  bumdes: number;
  umum: number;
  totalQuestions: number;
  premiumUsers: number;
  totalRevenue: number;
}

export interface MockActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'login' | 'query' | 'subscription' | 'profile_update' | 'admin_action';
}

export interface MockSettings {
  site_name: string;
  maintenance_mode: boolean;
  max_free_queries: number;
  subscription_price: number;
  email_notifications: boolean;
  auto_backup: boolean;
}

// Mock Users Data
const mockUsers: MockUser[] = [
  {
    id: '1',
    name: 'Budi Santoso',
    email: 'budi.santoso@desa.id',
    role: 'aparatur',
    subscription_status: 'premium',
    usage_count: 3,
    daily_usage_reset_at: new Date().toISOString(),
    created_at: '2024-01-15T08:00:00Z',
    phone_number: '081234567890'
  },
  {
    id: '2',
    name: 'Siti Aminah',
    email: 'siti.aminah@desa.id',
    role: 'pendamping',
    subscription_status: 'free',
    usage_count: 5,
    daily_usage_reset_at: new Date().toISOString(),
    created_at: '2024-01-20T10:30:00Z',
    phone_number: '082345678901'
  },
  {
    id: '3',
    name: 'Ahmad Wijaya',
    email: 'ahmad.wijaya@bumdes.id',
    role: 'bumdes',
    subscription_status: 'premium',
    usage_count: 1,
    daily_usage_reset_at: new Date().toISOString(),
    created_at: '2024-02-01T14:15:00Z',
    phone_number: '083456789012'
  },
  {
    id: '4',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@gmail.com',
    role: 'umum',
    subscription_status: 'free',
    usage_count: 4,
    daily_usage_reset_at: new Date().toISOString(),
    created_at: '2024-02-10T09:20:00Z',
  },
  {
    id: '5',
    name: 'Joko Susilo',
    email: 'joko.susilo@desa.id',
    role: 'aparatur',
    subscription_status: 'free',
    usage_count: 2,
    daily_usage_reset_at: new Date().toISOString(),
    created_at: '2024-02-15T11:45:00Z',
    phone_number: '085678901234'
  }
];

// Mock Activity Logs
const mockActivityLogs: MockActivityLog[] = [
  {
    id: '1',
    user_id: '1',
    user_name: 'Budi Santoso',
    action: 'Login ke sistem',
    details: 'Login berhasil dari IP 192.168.1.1',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    type: 'login'
  },
  {
    id: '2',
    user_id: '2',
    user_name: 'Siti Aminah',
    action: 'Mengajukan pertanyaan',
    details: 'Pertanyaan tentang pengelolaan dana desa',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    type: 'query'
  },
  {
    id: '3',
    user_id: '3',
    user_name: 'Ahmad Wijaya',
    action: 'Upgrade ke Premium',
    details: 'Berlangganan paket premium bulanan',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    type: 'subscription'
  },
  {
    id: '4',
    user_id: '1',
    user_name: 'Budi Santoso',
    action: 'Update profil',
    details: 'Memperbarui nomor telepon',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    type: 'profile_update'
  },
  {
    id: '5',
    user_id: '4',
    user_name: 'Dewi Lestari',
    action: 'Mengajukan pertanyaan',
    details: 'Pertanyaan tentang administrasi desa',
    timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    type: 'query'
  }
];

// Mock Settings
const mockSettings: MockSettings = {
  site_name: 'Patriot Desa',
  maintenance_mode: false,
  max_free_queries: 5,
  subscription_price: 99000,
  email_notifications: true,
  auto_backup: true
};

// Mock API Functions with delays to simulate network
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  // Dashboard Stats
  getDashboardStats: async (): Promise<MockDashboardStats> => {
    await delay(300);
    
    const aparatur = mockUsers.filter(u => u.role === 'aparatur').length;
    const pendamping = mockUsers.filter(u => u.role === 'pendamping').length;
    const bumdes = mockUsers.filter(u => u.role === 'bumdes').length;
    const umum = mockUsers.filter(u => u.role === 'umum').length;
    const premiumUsers = mockUsers.filter(u => u.subscription_status === 'premium').length;
    
    return {
      totalUsers: mockUsers.length,
      aparatur,
      pendamping,
      bumdes,
      umum,
      totalQuestions: 127, // Mock total questions
      premiumUsers,
      totalRevenue: premiumUsers * 99000,
    };
  },

  // Users
  getUsers: async (): Promise<MockUser[]> => {
    await delay(400);
    return [...mockUsers];
  },

  updateUser: async (userId: string, updates: Partial<MockUser>): Promise<MockUser> => {
    await delay(300);
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      return mockUsers[userIndex];
    }
    throw new Error('User not found');
  },

  resetUserQuota: async (userId: string): Promise<MockUser> => {
    await delay(200);
    return mockApi.updateUser(userId, { usage_count: 0 });
  },

  deleteUser: async (userId: string): Promise<void> => {
    await delay(300);
    const index = mockUsers.findIndex(u => u.id === userId);
    if (index !== -1) {
      mockUsers.splice(index, 1);
    }
  },

  // Activity Logs
  getActivityLogs: async (limit = 50): Promise<MockActivityLog[]> => {
    await delay(350);
    return mockActivityLogs.slice(0, limit);
  },

  // Settings
  getSettings: async (): Promise<MockSettings> => {
    await delay(250);
    return { ...mockSettings };
  },

  updateSettings: async (updates: Partial<MockSettings>): Promise<MockSettings> => {
    await delay(300);
    Object.assign(mockSettings, updates);
    return { ...mockSettings };
  },

  // Chart Data
  getUserGrowthData: async () => {
    await delay(300);
    return [
      { month: 'Jan', users: 12 },
      { month: 'Feb', users: 19 },
      { month: 'Mar', users: 25 },
      { month: 'Apr', users: 32 },
      { month: 'Mei', users: 45 },
      { month: 'Jun', users: 51 },
    ];
  },

  getQueryDistribution: async () => {
    await delay(300);
    return [
      { category: 'Administrasi', value: 45 },
      { category: 'Keuangan', value: 30 },
      { category: 'BUMDes', value: 15 },
      { category: 'Lainnya', value: 10 },
    ];
  }
};
