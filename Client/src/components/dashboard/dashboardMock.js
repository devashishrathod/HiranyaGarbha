import { TIME_PERIODS } from "../../constants/appConstants";

export const MODULES = Object.freeze({
  USERS: "users",
  CONTENT: "content",
  ENQUIRIES: "enquiries",
  PRODUCTS: "products",
  WELLNESS: "wellness",
  EXPERTS: "experts",
  PRENATAL: "prenatal",
  TRIMESTER: "trimester",
  NUTRITION: "nutrition",
  MEAL_PLANS: "meal_plans",
  CATEGORY: "category",
});

const pct = (value, base) => {
  if (!Number.isFinite(value) || !Number.isFinite(base) || base === 0) return 0;
  return Math.round(((value - base) / base) * 100);
};

export const buildMockDashboard = ({ range }) => {
  const seed =
    range === TIME_PERIODS.TODAY
      ? 1
      : range === TIME_PERIODS.YESTERDAY
        ? 1
        : range === TIME_PERIODS.DAILY
          ? 1
          : range === TIME_PERIODS.WEEKLY
            ? 7
            : range === TIME_PERIODS.MONTHLY
              ? 30
              : 365;

  const metrics = {
    users: {
      current: 1248 + seed * 9,
      prev: 1248 + seed * 7,
      trendPct: 0,
      spark: Array.from({ length: 12 }, (_, i) => ({
        name: String(i + 1),
        value: 80 + i * 6 + seed,
      })),
    },
    registrations: {
      current: 86 + seed,
      prev: 74 + Math.floor(seed / 2),
      trendPct: 0,
    },
    appointments: {
      current: 142 + seed * 2,
      prev: 131 + seed,
      trendPct: 0,
      series: Array.from({ length: 12 }, (_, i) => ({
        name: String(i + 1),
        booked: 20 + i * 2 + seed,
        completed: 16 + i * 2,
        cancelled: 2 + (i % 3),
      })),
    },
    sessions: {
      current: 38 + Math.floor(seed / 3),
      prev: 34 + Math.floor(seed / 4),
      trendPct: 0,
      series: Array.from({ length: 12 }, (_, i) => ({
        name: String(i + 1),
        scheduled: 10 + (i % 5) + seed,
        live: 4 + (i % 2),
        completed: 6 + (i % 4),
      })),
    },
    enquiries: {
      current: 64 + seed,
      prev: 58 + Math.floor(seed / 2),
      trendPct: 0,
    },
    contentPublished: {
      current: 21 + Math.floor(seed / 7),
      prev: 18 + Math.floor(seed / 9),
      trendPct: 0,
    },
    products: {
      current: 58,
      prev: 56,
      trendPct: 0,
    },
  };

  const outlets = [
    {
      id: "o1",
      name: "Outlet Pune",
      city: "Pune",
      customers: 420,
      appointments: 46,
      sessions: 12,
      enquiries: 18,
      trendPct: 8,
    },
    {
      id: "o2",
      name: "Outlet Mumbai",
      city: "Mumbai",
      customers: 510,
      appointments: 61,
      sessions: 18,
      enquiries: 22,
      trendPct: 5,
    },
    {
      id: "o3",
      name: "Outlet Delhi",
      city: "Delhi",
      customers: 318,
      appointments: 39,
      sessions: 10,
      enquiries: 14,
      trendPct: -2,
    },
  ];

  Object.values(metrics).forEach((m) => {
    m.trendPct = pct(m.current, m.prev);
  });

  const activity = [
    {
      id: "a1",
      title: "New appointment booked",
      meta: "Nutrition consult • Pune",
      at: "2m ago",
      type: "appointments",
    },
    {
      id: "a2",
      title: "New user registered",
      meta: "Customer • Web",
      at: "18m ago",
      type: "users",
    },
    {
      id: "a3",
      title: "New enquiry received",
      meta: "Contact Us • Meal plan",
      at: "1h ago",
      type: "enquiries",
    },
    {
      id: "a4",
      title: "Tip published",
      meta: "Trimester 2 • Wellness",
      at: "3h ago",
      type: "content",
    },
  ];

  const queues = {
    enquiries: [
      {
        id: "e1",
        name: "Ritika",
        subject: "Appointment enquiry",
        status: "New",
        at: "Today",
      },
      {
        id: "e2",
        name: "Sneha",
        subject: "Product info",
        status: "Assigned",
        at: "Today",
      },
      {
        id: "e3",
        name: "Amit",
        subject: "Yoga session",
        status: "Pending",
        at: "Yesterday",
      },
    ],
    appointments: [
      {
        id: "p1",
        customer: "Anita Sharma",
        service: "Prenatal care",
        when: "10:30 AM",
        status: "Confirmed",
      },
      {
        id: "p2",
        customer: "Neha Verma",
        service: "Nutrition plan",
        when: "12:00 PM",
        status: "Pending",
      },
      {
        id: "p3",
        customer: "Pooja Patel",
        service: "Yoga session",
        when: "04:00 PM",
        status: "Confirmed",
      },
    ],
  };

  const modules = [
    {
      id: MODULES.USERS,
      title: "Customers CRM",
      description: "Registration, lifecycle, engagement & segmentation",
      stats: {
        primaryLabel: "Total users",
        primaryValue: metrics.users.current,
        secondaryLabel: "New",
        secondaryValue: metrics.registrations.current,
      },
      cta: "Open CRM",
      href: "/users",
      tone: "indigo",
    },
    {
      id: MODULES.CONTENT,
      title: "Pregnancy Content Hub",
      description: "Tips, meal plans, trimester plans, nutrition & care",
      stats: {
        primaryLabel: "Published",
        primaryValue: metrics.contentPublished.current,
        secondaryLabel: "Trend",
        secondaryValue: `${metrics.contentPublished.trendPct}%`,
      },
      cta: "Publish",
      href: "/tips",
      tone: "rose",
    },
    {
      id: MODULES.EXPERTS,
      title: "Experts",
      description: "Doctors, teachers & experts management",
      stats: {
        primaryLabel: "Active",
        primaryValue: 24,
        secondaryLabel: "New",
        secondaryValue: 3,
      },
      cta: "Manage",
      href: "/experts",
      tone: "violet",
    },
    {
      id: MODULES.PRENATAL,
      title: "Parental Care Services",
      description: "Prenatal care services catalog & updates",
      stats: {
        primaryLabel: "Services",
        primaryValue: 16,
        secondaryLabel: "Trend",
        secondaryValue: "+4%",
      },
      cta: "Open",
      href: "/prenatal-cares",
      tone: "emerald",
    },
    {
      id: MODULES.TRIMESTER,
      title: "Trimester Plans",
      description: "Trimester-wise plans & guidance",
      stats: {
        primaryLabel: "Plans",
        primaryValue: 12,
        secondaryLabel: "Updated",
        secondaryValue: 2,
      },
      cta: "Open",
      href: "/trimester",
      tone: "indigo",
    },
    {
      id: MODULES.NUTRITION,
      title: "Nutrition Plans",
      description: "Diet plans, nutrition guidance & schedules",
      stats: {
        primaryLabel: "Plans",
        primaryValue: 28,
        secondaryLabel: "Updated",
        secondaryValue: 5,
      },
      cta: "Open",
      href: "/nutritions",
      tone: "amber",
    },
    {
      id: MODULES.MEAL_PLANS,
      title: "Meal Plans",
      description: "Meal plans for each trimester & goals",
      stats: {
        primaryLabel: "Plans",
        primaryValue: 20,
        secondaryLabel: "Trend",
        secondaryValue: "+6%",
      },
      cta: "Open",
      href: "/meal-plans",
      tone: "rose",
    },
    {
      id: MODULES.CATEGORY,
      title: "Categories",
      description: "Product & gallery categories",
      stats: {
        primaryLabel: "Active",
        primaryValue: 14,
        secondaryLabel: "Updated",
        secondaryValue: 1,
      },
      cta: "Open",
      href: "/category",
      tone: "cyan",
    },
  ];

  return {
    range,
    metrics,
    charts: {
      appointments: metrics.appointments.series,
      sessions: metrics.sessions.series,
      usersSpark: metrics.users.spark,
    },
    activity,
    queues,
    outlets,
    modules,
  };
};
