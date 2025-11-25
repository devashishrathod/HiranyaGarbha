import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  IndianRupee,
  TrendingUp,
  Activity,
  ShoppingCart,
  TestTube,
  Clipboard,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  UserCheck,
  Microscope,
  Stethoscope,
  Building,
  FlaskConical,
  Heart,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  ComposedChart,
} from "recharts";
import { useGetQuery } from "../api/apiCall";
import API_ENDPOINTS from "../api/apiEndpoint";

// Consistent blue-purple theme
const COLORS = {
  primary: "#3B82F6",
  secondary: "#8B5CF6",
  accent: "#6366F1",
  warning: "#F59E0B",
  danger: "#EF4444",
  success: "#10B981",
  teal: "#14B8A6",
  pink: "#EC4899",
};

// Modern 2025 Stat Card Component
const StatCard = ({
  icon: Icon,
  title,
  value,
  trend,
  trendType = "positive",
}) => (
  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 p-6 relative overflow-hidden transform hover:scale-105 group">
    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
    <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/5 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className="flex items-center text-white bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
            {trendType === "positive" ? (
              <ArrowUp className="w-4 h-4" />
            ) : (
              <ArrowDown className="w-4 h-4" />
            )}
            <span className="ml-1 text-sm font-medium">{trend}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-white/80 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white">{value}</h3>
      </div>
    </div>
  </div>
);

// Modern Radial Chart for Appointment Status
const AppointmentStatusChart = ({ statusCounts }) => {
  const totalAppointments = statusCounts.reduce(
    (sum, status) => sum + status.count,
    0
  );

  const radialData = statusCounts.map((status, index) => ({
    name: status._id,
    value: status.count,
    percentage: ((status.count / totalAppointments) * 100).toFixed(1),
    fill:
      status._id === "confirmed"
        ? "#10B981"
        : status._id === "pending"
        ? "#F59E0B"
        : "#EF4444",
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mr-3">
          <Activity className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Appointment Status
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="80%"
          data={radialData}
        >
          <RadialBar
            minAngle={15}
            label={{ position: "insideStart", fill: "#fff", fontSize: 12 }}
            background
            clockWise
            dataKey="value"
          />
          <Legend
            iconSize={12}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
            formatter={(value, name) => [
              `${value} (${
                radialData.find((d) => d.name === name)?.percentage
              }%)`,
              name,
            ]}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Modern Composed Chart for Sales Performance
const SalesChart = ({ selles }) => {
  const chartData = selles.map((sale) => ({
    name: sale.title,
    revenue: sale.totalRevenue,
    quantity: sale.totalQuantitySold,
    efficiency: Math.floor(Math.random() * 30) + 70, // Mock efficiency data
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mr-3">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Sales Performance
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            fill="url(#blueGradient)"
            name="Revenue"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="left"
            dataKey="quantity"
            fill="url(#purpleGradient)"
            name="Quantity"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="efficiency"
            stroke="#EC4899"
            strokeWidth={3}
            name="Efficiency %"
          />
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// Lab Performance Area Chart
const LabPerformanceChart = ({ today }) => {
  // Mock lab performance data
  const labData = [
    { name: "Blood Test", completed: 45, pending: 12, efficiency: 78 },
    { name: "Urine Test", completed: 32, pending: 8, efficiency: 80 },
    { name: "X-Ray", completed: 28, pending: 15, efficiency: 65 },
    { name: "MRI", completed: 12, pending: 5, efficiency: 70 },
    { name: "CT Scan", completed: 18, pending: 7, efficiency: 72 },
    { name: "ECG", completed: 55, pending: 10, efficiency: 85 },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mr-3">
          <Microscope className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Lab Performance
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={labData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="completed"
            stackId="1"
            stroke="#10B981"
            fill="url(#greenGradient)"
            name="Completed"
          />
          <Area
            type="monotone"
            dataKey="pending"
            stackId="1"
            stroke="#F59E0B"
            fill="url(#orangeGradient)"
            name="Pending"
          />
          <defs>
            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.2} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Today's Comprehensive Stats Component
const TodayStats = ({
  statusCounts,
  today,
  todaysAppointments,
  todaySells,
  todayRevenue,
  totalSells,
}) => {
  // Real API data with some calculated values
  const todayData = {
    doctors: 12, // You can add this to your API later
    activePatients: todaysAppointments?.length || 0,
    labTests: today?.totalTests || 0,
    revenue: today?.totalRevenue || 0,
    todayRevenue: todayRevenue || 0,
    todaySells: todaySells || 0,
    totalSells: totalSells || 0,
    emergencies: 3, // You can add this to your API later
    surgeries: 5, // You can add this to your API later
  };

  const todayAppointments = statusCounts.map((status) => ({
    status: status._id,
    count: status.count,
    icon:
      status._id === "confirmed"
        ? CheckCircle
        : status._id === "pending"
        ? Clock
        : XCircle,
    color:
      status._id === "confirmed"
        ? "text-green-500"
        : status._id === "pending"
        ? "text-yellow-500"
        : "text-red-500",
    bgColor:
      status._id === "confirmed"
        ? "bg-green-50"
        : status._id === "pending"
        ? "bg-yellow-50"
        : "bg-red-50",
  }));

  return (
    <div className="space-y-6">
      {/* Today's Appointments */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Today's Appointments
        </h3>

        <div className="space-y-3">
          {todayAppointments.map((appointment, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-4 ${appointment.bgColor} rounded-lg border border-opacity-20`}
            >
              <div className="flex items-center">
                <appointment.icon
                  className={`w-5 h-5 ${appointment.color} mr-3`}
                />
                <span className="font-medium text-gray-700 capitalize">
                  {appointment.status}
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {appointment.count}
              </span>
            </div>
          ))}
        </div>

        {/* Show today's appointments count */}
        <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-indigo-600 mr-3" />
              <span className="font-medium text-indigo-700">
                Today's Appointments
              </span>
            </div>
            <span className="text-2xl font-bold text-indigo-800">
              {todayData.activePatients}
            </span>
          </div>
        </div>
      </div>

      {/* Today's Lab & Medical Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Today's Lab & Medical
        </h3>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <TestTube className="w-6 h-6" />
              <div className="text-right">
                <p className="text-sm opacity-80">Lab Tests</p>
                <p className="text-2xl font-bold">{todayData.labTests}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <Stethoscope className="w-6 h-6" />
              <div className="text-right">
                <p className="text-sm opacity-80">Active Doctors</p>
                <p className="text-2xl font-bold">{todayData.doctors}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <UserCheck className="w-6 h-6" />
              <div className="text-right">
                <p className="text-sm opacity-80">Active Patients</p>
                <p className="text-2xl font-bold">{todayData.activePatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <IndianRupee className="w-6 h-6" />
              <div className="text-right">
                <p className="text-sm opacity-80">Today's Revenue</p>
                <p className="text-2xl font-bold">
                  ₹{todayData.todayRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <ShoppingCart className="w-6 h-6" />
              <div className="text-right">
                <p className="text-sm opacity-80">Today's Sales</p>
                <p className="text-2xl font-bold">{todayData.todaySells}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency & Surgery Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          Critical Operations
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
            <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 mb-1">Emergencies</p>
            <p className="text-2xl font-bold text-red-700">
              {todayData.emergencies}
            </p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
            <Building className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-blue-600 mb-1">Surgeries</p>
            <p className="text-2xl font-bold text-blue-700">
              {todayData.surgeries}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  // State for dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  // API Query
  const {
    data: apiData,
    isLoading,
    error,
  } = useGetQuery(`${API_ENDPOINTS.DASHBOARD.GET_DASHBOARD}`);
  // Update dashboard data when API response changes
  useEffect(() => {
    if (apiData && apiData.success) {
      setDashboardData(apiData);
    }
  }, [apiData]);
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-500 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-transparent border-r-purple-400 animate-ping mx-auto"></div>
          </div>
          <p className="text-xl bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent font-semibold">
            Loading Healthcare Dashboard...
          </p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-2xl text-red-600 mb-2">Error loading dashboard</p>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }
  // If no data is available
  if (!dashboardData) {
    return null;
  }
  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="container mx-auto">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            title="Total Appointments"
            value={dashboardData.statusCounts.reduce(
              (sum, status) => sum + status.count,
              0
            )}
            trend={10}
          />
          <StatCard
            icon={IndianRupee}
            title="Total Revenue"
            value={`₹${dashboardData.totalRevenue.toLocaleString()}`}
            trend={15}
          />
          <StatCard
            icon={ShoppingCart}
            title="Total Sales"
            value={dashboardData.totalSells}
            trend={8}
          />
          <StatCard
            icon={TestTube}
            title="Lab Tests"
            value={dashboardData.testCountsByStatus.reduce(
              (sum, status) => sum + status.count,
              0
            )}
            trend={12}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AppointmentStatusChart
                statusCounts={dashboardData.statusCounts}
              />
              <SalesChart selles={dashboardData.selles} />
            </div>

            {/* Lab Performance Chart */}
            <div className="w-full">
              <LabPerformanceChart today={dashboardData.today} />
            </div>
          </div>

          {/* Right Sidebar - Today's Comprehensive Stats */}
          <div className="lg:col-span-1">
            <TodayStats
              statusCounts={dashboardData.statusCounts}
              today={dashboardData.today}
              todaysAppointments={dashboardData.todaysAppointments}
              todaySells={dashboardData.todaySells}
              todayRevenue={dashboardData.todayRevenue}
              totalSells={dashboardData.totalSells}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
