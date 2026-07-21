import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid2';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Button,
  Chip,
  Skeleton,
  Alert,
  IconButton,
  Tooltip as MuiTooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Divider,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ClassIcon from '@mui/icons-material/Class';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

import { useAuth } from '../context/AuthContext';
import {
  getDashboardAnalytics,
  type DashboardDataResponse,
} from '../services/adminAnalyticsService';

const AnalyticsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [data, setData] = useState<DashboardDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDashboardAnalytics();
      setData(result);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Access denied. Administrator privileges are required.');
      } else {
        setError('Failed to fetch analytics metrics. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'ADMIN') {
        setError('Access denied. Administrator privileges are required.');
        setLoading(false);
      } else {
        fetchAnalytics();
      }
    }
  }, [user, authLoading]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) navigate('/admin/analytics');
    if (newValue === 1) navigate('/admin');
    if (newValue === 2) navigate('/admin/categories');
    if (newValue === 3) navigate('/admin/users');
  };

  const getStatusChipColor = (status: string): 'success' | 'info' | 'warning' | 'error' | 'default' => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'SHIPPED':
        return 'info';
      case 'PROCESSING':
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (authLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2, mb: 3 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Container>
    );
  }

  if (error && (!user || user.role !== 'ADMIN')) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Return to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header & Tabs */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Executive Analytics Dashboard
          </Typography>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchAnalytics}
            disabled={loading}
            size="small"
          >
            Refresh Data
          </Button>
        </Box>

        <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={0} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
            <Tab label="Analytics & KPI" />
            <Tab label="Products Catalog" />
            <Tab label="Categories" />
            <Tab label="User Registry" />
          </Tabs>
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={fetchAnalytics}>Retry</Button>}>
          {error}
        </Alert>
      )}

      {/* Quick Actions Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
          Quick Action Shortcuts
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={<AddBoxIcon />}
              onClick={() => navigate('/admin')}
              sx={{ py: 1, borderRadius: 2 }}
            >
              Add Product
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              startIcon={<ClassIcon />}
              onClick={() => navigate('/admin/categories')}
              sx={{ py: 1, borderRadius: 2 }}
            >
              Add Category
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              color="info"
              startIcon={<ReceiptLongIcon />}
              onClick={() => navigate('/orders')}
              sx={{ py: 1, borderRadius: 2 }}
            >
              View Orders
            </Button>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              color="success"
              startIcon={<ManageAccountsIcon />}
              onClick={() => navigate('/admin/users')}
              sx={{ py: 1, borderRadius: 2 }}
            >
              Manage Users
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* 1. Revenue */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Total Revenue
                </Typography>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: 36, height: 36 }}>
                  <AttachMoneyIcon fontSize="small" />
                </Avatar>
              </Box>
              {loading ? (
                <Skeleton variant="text" width="80%" height={36} />
              ) : (
                <>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ${data?.summary.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                      +{data?.summary.revenueChange}% vs last month
                    </Typography>
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 2. Total Orders */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Total Orders
                </Typography>
                <Avatar sx={{ bgcolor: 'info.light', color: 'info.main', width: 36, height: 36 }}>
                  <ShoppingBagIcon fontSize="small" />
                </Avatar>
              </Box>
              {loading ? (
                <Skeleton variant="text" width="80%" height={36} />
              ) : (
                <>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {data?.summary.ordersCount.toLocaleString()}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                      +{data?.summary.ordersChange}% growth
                    </Typography>
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 3. Products */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Active Products
                </Typography>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 36, height: 36 }}>
                  <Inventory2Icon fontSize="small" />
                </Avatar>
              </Box>
              {loading ? (
                <Skeleton variant="text" width="80%" height={36} />
              ) : (
                <>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {data?.summary.productsCount}
                  </Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                    <WarningAmberIcon fontSize="small" color="warning" />
                    <Typography variant="caption" color="warning.main" sx={{ fontWeight: 600 }}>
                      {data?.summary.lowStockCount} items low stock
                    </Typography>
                  </Stack>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 4. Categories */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Categories
                </Typography>
                <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.main', width: 36, height: 36 }}>
                  <CategoryIcon fontSize="small" />
                </Avatar>
              </Box>
              {loading ? (
                <Skeleton variant="text" width="80%" height={36} />
              ) : (
                <>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {data?.summary.categoriesCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Active catalog groups
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 5. Total Users */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Registered Users
                </Typography>
                <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.main', width: 36, height: 36 }}>
                  <PeopleIcon fontSize="small" />
                </Avatar>
              </Box>
              {loading ? (
                <Skeleton variant="text" width="80%" height={36} />
              ) : (
                <>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {data?.summary.usersCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {data?.summary.activeUsersPercent}% active accounts
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 6. Average Rating */}
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
          <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  Average Rating
                </Typography>
                <Avatar sx={{ bgcolor: '#fff8e1', color: '#ffb300', width: 36, height: 36 }}>
                  <StarIcon fontSize="small" />
                </Avatar>
              </Box>
              {loading ? (
                <Skeleton variant="text" width="80%" height={36} />
              ) : (
                <>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {data?.summary.averageRating} / 5.0
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Based on {data?.summary.totalReviews} reviews
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recharts Analytics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Chart 1: Monthly Revenue Trend */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 420 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Monthly Revenue Performance ($)
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
            ) : (
              <ResponsiveContainer width="100%" height={330}>
                <AreaChart data={data?.monthlyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1976d2" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#1976d2" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(val: number) => [`$${val.toLocaleString()}`, 'Revenue']} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#1976d2" fillOpacity={1} fill="url(#colorRevenue)" name="Actual Revenue" />
                  <Area type="monotone" dataKey="target" stroke="#ed6c02" fill="none" strokeDasharray="5 5" name="Target Projection" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Chart 2: Order Status Distribution */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 420 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Order Status Distribution
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
            ) : (
              <ResponsiveContainer width="100%" height={330}>
                <PieChart>
                  <Pie
                    data={data?.orderStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {data?.orderStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`${val} orders`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Chart 3: Monthly Orders Volume */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Monthly Orders & Fulfillment Volume
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            ) : (
              <ResponsiveContainer width="100%" height={310}>
                <BarChart data={data?.monthlyOrders} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#0288d1" radius={[4, 4, 0, 0]} name="Total Placed" />
                  <Bar dataKey="completed" fill="#2e7d32" radius={[4, 4, 0, 0]} name="Fulfilled" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Chart 4: Category Distribution */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Catalog Product Share by Category
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            ) : (
              <ResponsiveContainer width="100%" height={310}>
                <PieChart>
                  <Pie
                    data={data?.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {data?.categoryDistribution.map((_, index) => {
                      const colors = ['#1976d2', '#9c27b0', '#ed6c02', '#00838f', '#2e7d32'];
                      return <Cell key={`cat-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Pie>
                  <Tooltip formatter={(val: number) => [`${val} products`, 'Catalog Share']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Chart 5: Top Selling Products */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Top Selling Products (Units Sold)
            </Typography>
            {loading ? (
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            ) : (
              <ResponsiveContainer width="100%" height={310}>
                <BarChart layout="vertical" data={data?.topProducts} margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(val: number) => [`${val} units`, 'Sales Volume']} />
                  <Bar dataKey="sales" fill="#7b1fa2" radius={[0, 4, 4, 0]} name="Units Sold" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        {/* Chart 6: Low Stock Products */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: 400 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                Low Stock Alert Monitor
              </Typography>
              <Chip label="Action Required" color="error" size="small" />
            </Box>
            {loading ? (
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            ) : (
              <ResponsiveContainer width="100%" height={310}>
                <BarChart data={data?.lowStockProducts} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="stock" fill="#d32f2f" radius={[4, 4, 0, 0]} name="Remaining Stock" />
                  <Bar dataKey="threshold" fill="#e0e0e0" radius={[4, 4, 0, 0]} name="Reorder Threshold" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activity Sections */}
      <Grid container spacing={3}>
        {/* Recent Orders Table */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Recent Customer Orders
              </Typography>
              <Button size="small" color="primary" onClick={() => navigate('/orders')}>
                View All Orders
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Skeleton width={80} /></TableCell>
                        <TableCell><Skeleton width={120} /></TableCell>
                        <TableCell><Skeleton width={60} /></TableCell>
                        <TableCell><Skeleton width={70} /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    data?.recentOrders.map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>${order.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status}
                            color={getStatusChipColor(order.status)}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recent Registered Users */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Newly Registered Users
              </Typography>
              <Button size="small" color="primary" onClick={() => navigate('/admin/users')}>
                Manage Registry
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Joined</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Skeleton width={100} /></TableCell>
                        <TableCell><Skeleton width={140} /></TableCell>
                        <TableCell><Skeleton width={50} /></TableCell>
                        <TableCell><Skeleton width={70} /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    data?.recentUsers.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.main' }}>
                              {u.fullName.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {u.fullName}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={u.role}
                            color={u.role === 'ADMIN' ? 'secondary' : 'default'}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                          />
                        </TableCell>
                        <TableCell>{u.registrationDate}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AnalyticsDashboard;
