import { useState, useMemo } from "react";
import {
  Users,
  Calendar,
  IndianRupee,
  Package,
  HeartPulse,
  Image,
  PhoneCall,
  ClipboardList,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

/* ================= FILTER OPTIONS ================= */
const FILTERS = [
  "Today",
  "Yesterday",
  "Weekly",
  "Monthly",
  "Last 3 Months",
  "Quarterly",
  "Half Year",
  "Annual",
];

/* ================= MOCK DATA (API READY) ================= */
const appointmentChartData = {
  Weekly: [
    { name: "Mon", value: 12 },
    { name: "Tue", value: 18 },
    { name: "Wed", value: 10 },
    { name: "Thu", value: 22 },
    { name: "Fri", value: 17 },
    { name: "Sat", value: 25 },
  ],
  Monthly: [
    { name: "W1", value: 12000 },
    { name: "W2", value: 18500 },
    { name: "W3", value: 14200 },
    { name: "W4", value: 21000 },
  ],
};

export function AdminDashboard() {
  const [chartFilter, setChartFilter] = useState("Weekly");
  const [tableFilter, setTableFilter] = useState("Today");

  const chartData = useMemo(
    () => appointmentChartData[chartFilter] || [],
    [chartFilter]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff1f5] via-[#f5e9ff] to-white p-6">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-800">
          Hiranyagarbha Admin Dashboard
        </h1>
        <p className="text-sm text-gray-600">
          Complete Business Overview & Reports
        </p>
      </div>

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Kpi title="Today's Appointments" value="14" icon={<Calendar />} />
        <Kpi title="Today's Sales" value="₹8,450" icon={<IndianRupee />} />
        <Kpi title="Active Sessions" value="9" icon={<HeartPulse />} />
        <Kpi title="Total Products" value="58" icon={<Package />} />
        <Kpi title="Registered Users" value="1,248" icon={<Users />} />
        <Kpi title="Gallery Items" value="186" icon={<Image />} />
        <Kpi title="Contact Requests" value="24" icon={<PhoneCall />} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <Card
          title="Appointment Reports"
          filter={chartFilter}
          onChange={setChartFilter}
        >
          <ChartFix>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line dataKey="value" stroke="#7c3aed" strokeWidth={3} />
            </LineChart>
          </ChartFix>
        </Card>

        <Card
          title="Product Sales"
          filter={chartFilter}
          onChange={setChartFilter}
        >
          <ChartFix>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#ec4899" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartFix>
        </Card>
      </div>

      {/* TABLES ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <TableCard
          title="Today's Appointments"
          filter={tableFilter}
          onChange={setTableFilter}
        >
          <SimpleTable
            headers={["Client", "Service", "Time", "Status"]}
            rows={[
              ["Anita Sharma", "Prenatal Care", "10:30 AM", "Confirmed"],
              ["Neha Verma", "Nutrition Plan", "12:00 PM", "Pending"],
              ["Pooja Patel", "Yoga Session", "4:00 PM", "Confirmed"],
            ]}
          />
        </TableCard>

        <TableCard
          title="Today's Product Sales"
          filter={tableFilter}
          onChange={setTableFilter}
        >
          <SimpleTable
            headers={["Product", "Category", "Qty", "Amount"]}
            rows={[
              ["Diet Guide", "Nutrition", "2", "₹1,200"],
              ["Meditation Pack", "Wellness", "1", "₹499"],
              ["Prenatal Kit", "Parental", "1", "₹2,999"],
            ]}
          />
        </TableCard>
      </div>

      {/* TABLES ROW 2 (🔥 NEW) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TableCard
          title="Wellness / Mindfulness Sessions"
          filter={tableFilter}
          onChange={setTableFilter}
        >
          <SimpleTable
            headers={["Session", "Expert", "Date", "Status"]}
            rows={[
              ["Pregnancy Yoga", "Dr. Meera", "Today", "Live"],
              ["Breathing Workshop", "Aarav Jain", "Tomorrow", "Scheduled"],
              ["Meditation", "Anjali Desai", "Yesterday", "Completed"],
            ]}
          />
        </TableCard>

        <TableCard
          title="Contact Requests"
          filter={tableFilter}
          onChange={setTableFilter}
        >
          <SimpleTable
            headers={["Name", "Mobile", "Subject", "Status"]}
            rows={[
              ["Ritika", "98XXXX321", "Session Inquiry", "New"],
              ["Amit", "97XXXX654", "Product Info", "Replied"],
              ["Sneha", "99XXXX112", "Appointment", "Pending"],
            ]}
          />
        </TableCard>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Kpi({ title, value, icon }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-6 shadow-xl bg-gradient-to-br from-purple-600 via-pink-500 to-rose-400 text-white">
      <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-white/10 rounded-full" />
      <div className="flex justify-between items-center relative z-10">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
        <div className="bg-white/20 p-3 rounded-xl">{icon}</div>
      </div>
    </div>
  );
}
function Card({ title, filter, onChange, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition">
      <Header title={title} filter={filter} onChange={onChange} />
      {children}
    </div>
  );
}

function TableCard({ title, filter, onChange, children }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-purple-100">
      <Header title={title} filter={filter} onChange={onChange} showViewAll />
      {children}
    </div>
  );
}

function Header({ title, filter, onChange, showViewAll }) {
  return (
    <div className="flex justify-between items-center mb-5">
      <h2 className="font-semibold text-purple-800 text-lg">{title}</h2>
      <div className="flex gap-3">
        <select
          value={filter}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-purple-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          {FILTERS.map((f) => (
            <option key={f}>{f}</option>
          ))}
        </select>
        {showViewAll && (
          <button className="text-sm font-medium text-purple-600 hover:text-pink-500 transition">
            View All →
          </button>
        )}
      </div>
    </div>
  );
}

function ChartFix({ children }) {
  return (
    <div className="w-full min-h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function SimpleTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-separate border-spacing-y-2">
        <thead>
          <tr className="text-left text-purple-700">
            {headers.map((h) => (
              <th key={h} className="pb-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              className="bg-purple-50 hover:bg-purple-100 transition rounded-lg"
            >
              {r.map((c, j) => (
                <td key={j} className="py-3 px-2">
                  {renderCell(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderCell(value) {
  if (["Confirmed", "Live", "Completed"].includes(value)) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        {value}
      </span>
    );
  }

  if (["Pending", "Scheduled", "New"].includes(value)) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        {value}
      </span>
    );
  }
  return value;
}
