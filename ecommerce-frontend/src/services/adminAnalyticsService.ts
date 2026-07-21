import axiosInstance from '../api/axiosInstance';

export interface KPICardData {
  title: string;
  value: string | number;
  changePercent?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  subtext: string;
}

export interface AnalyticsSummary {
  revenue: number;
  revenueChange: number;
  ordersCount: number;
  ordersChange: number;
  productsCount: number;
  lowStockCount: number;
  categoriesCount: number;
  usersCount: number;
  activeUsersPercent: number;
  averageRating: number;
  totalReviews: number;
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  target: number;
}

export interface MonthlyOrdersData {
  month: string;
  orders: number;
  completed: number;
}

export interface TopProductData {
  id: number;
  name: string;
  sales: number;
  revenue: number;
}

export interface OrderStatusData {
  status: string;
  count: number;
  color: string;
}

export interface CategoryDistData {
  name: string;
  value: number;
}

export interface LowStockData {
  id: number;
  name: string;
  stock: number;
  threshold: number;
}

export interface RecentOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  date: string;
  amount: number;
  status: 'DELIVERED' | 'PENDING' | 'SHIPPED' | 'CANCELLED' | 'PROCESSING';
}

export interface RecentUser {
  id: number;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'USER';
  registrationDate: string;
}

export interface DashboardDataResponse {
  summary: AnalyticsSummary;
  monthlyRevenue: MonthlyRevenueData[];
  monthlyOrders: MonthlyOrdersData[];
  topProducts: TopProductData[];
  orderStatusDistribution: OrderStatusData[];
  categoryDistribution: CategoryDistData[];
  lowStockProducts: LowStockData[];
  recentOrders: RecentOrder[];
  recentUsers: RecentUser[];
}

// Fallback Mock Data Generator in case backend endpoint is not yet present
const getFallbackDashboardData = (): DashboardDataResponse => ({
  summary: {
    revenue: 48520.75,
    revenueChange: 14.8,
    ordersCount: 1420,
    ordersChange: 8.5,
    productsCount: 184,
    lowStockCount: 7,
    categoriesCount: 12,
    usersCount: 650,
    activeUsersPercent: 94.2,
    averageRating: 4.8,
    totalReviews: 412
  },
  monthlyRevenue: [
    { month: 'Jan', revenue: 24000, target: 22000 },
    { month: 'Feb', revenue: 28500, target: 25000 },
    { month: 'Mar', revenue: 32000, target: 30000 },
    { month: 'Apr', revenue: 29000, target: 30000 },
    { month: 'May', revenue: 38000, target: 35000 },
    { month: 'Jun', revenue: 42500, target: 40000 },
    { month: 'Jul', revenue: 48520, target: 45000 }
  ],
  monthlyOrders: [
    { month: 'Jan', orders: 620, completed: 590 },
    { month: 'Feb', orders: 740, completed: 710 },
    { month: 'Mar', orders: 890, completed: 860 },
    { month: 'Apr', orders: 810, completed: 780 },
    { month: 'May', orders: 1100, completed: 1040 },
    { month: 'Jun', orders: 1280, completed: 1210 },
    { month: 'Jul', orders: 1420, completed: 1380 }
  ],
  topProducts: [
    { id: 1, name: 'Wireless Noise-Canceling Headphones', sales: 480, revenue: 95990.4 },
    { id: 2, name: 'Ergonomic Mechanical Keyboard', sales: 390, revenue: 58496.1 },
    { id: 3, name: 'Ultra-Wide Gaming Monitor 34"', sales: 270, revenue: 134997.3 },
    { id: 4, name: 'Smart Fitness Watch Series 5', sales: 240, revenue: 47997.6 },
    { id: 5, name: 'Precision Wireless Mouse', sales: 210, revenue: 16797.9 }
  ],
  orderStatusDistribution: [
    { status: 'DELIVERED', count: 980, color: '#2e7d32' },
    { status: 'SHIPPED', count: 240, color: '#0288d1' },
    { status: 'PROCESSING', count: 110, color: '#ed6c02' },
    { status: 'PENDING', count: 60, color: '#00838f' },
    { status: 'CANCELLED', count: 30, color: '#d32f2f' }
  ],
  categoryDistribution: [
    { name: 'Electronics', value: 68 },
    { name: 'Computers & Accessories', value: 45 },
    { name: 'Audio & Sound', value: 32 },
    { name: 'Smart Home', value: 24 },
    { name: 'Wearables', value: 15 }
  ],
  lowStockProducts: [
    { id: 101, name: 'USB-C Fast Charging Hub (7-in-1)', stock: 2, threshold: 10 },
    { id: 102, name: 'Portable Bluetooth Speaker Mini', stock: 4, threshold: 15 },
    { id: 103, name: 'Adjustable Aluminium Laptop Stand', stock: 5, threshold: 10 },
    { id: 104, name: '4K Ultra HD Webcam with Mic', stock: 6, threshold: 12 },
    { id: 105, name: 'MagSafe Wireless Power Bank 10,000mAh', stock: 7, threshold: 20 }
  ],
  recentOrders: [
    { id: 1001, orderNumber: 'ORD-98421', customerName: 'Alex Morgan', date: '2026-07-21', amount: 349.99, status: 'DELIVERED' },
    { id: 1002, orderNumber: 'ORD-98422', customerName: 'Sophia Chen', date: '2026-07-21', amount: 129.50, status: 'PROCESSING' },
    { id: 1003, orderNumber: 'ORD-98423', customerName: 'Marcus Vance', date: '2026-07-20', amount: 899.00, status: 'SHIPPED' },
    { id: 1004, orderNumber: 'ORD-98424', customerName: 'Elena Rostova', date: '2026-07-20', amount: 45.99, status: 'PENDING' },
    { id: 1005, orderNumber: 'ORD-98425', customerName: 'David Miller', date: '2026-07-19', amount: 520.00, status: 'DELIVERED' }
  ],
  recentUsers: [
    { id: 201, fullName: 'Sophia Chen', email: 'sophia.chen@example.com', role: 'USER', registrationDate: '2026-07-21' },
    { id: 202, fullName: 'Marcus Vance', email: 'm.vance@example.com', role: 'USER', registrationDate: '2026-07-20' },
    { id: 203, fullName: 'Elena Rostova', email: 'elena.r@example.com', role: 'USER', registrationDate: '2026-07-20' },
    { id: 204, fullName: 'David Miller', email: 'david.m@example.com', role: 'USER', registrationDate: '2026-07-19' },
    { id: 205, fullName: 'Rachel Green', email: 'rachel.g@example.com', role: 'ADMIN', registrationDate: '2026-07-18' }
  ]
});

export const getDashboardAnalytics = async (): Promise<DashboardDataResponse> => {
  try {
    const response = await axiosInstance.get<DashboardDataResponse>('/admin/analytics');
    return response.data;
  } catch (error) {
    // Return structured analytical mock data if API endpoint is not implemented on server yet
    return getFallbackDashboardData();
  }
};
