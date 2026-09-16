require("dotenv").config();

const mongoose = require("mongoose");
const moment = require("moment-timezone");

const { mongoDb } = require("../database/mongoDb");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Appointment = require("../models/Appointment");
const DoctorAvailability = require("../models/DoctorAvailability");

const { createDoctor } = require("../services/doctors/createDoctor");
const { createPatient } = require("../services/patients/createPatient");
const {
  completeProfile: completeDoctorProfile,
} = require("../services/doctors/completeProfile");
const {
  completeProfile: completePatientProfile,
} = require("../services/patients/completeProfile");
const {
  HOUR,
  DAY,
  unitRandom,
  spreadTimestamps,
  momentBetween,
  applyTimestamps,
} = require("./lib/seedTimestamps");

const TZ = "Asia/Kolkata";
const SEED_PASSWORD = "Test@1234";

/*
 * Onboarding history: the panel was filled in over the season rather than in
 * one sitting - doctors first, then patients joined through the weeks.
 */
const DOCTOR_WINDOW = { from: "2026-07-01", to: "2026-07-28" };
const PATIENT_WINDOW = { from: "2026-07-20", to: "2026-09-14" };
const EDITED_UNTIL = "2026-09-16T21:00:00";

/* ------------------------------------------------------------------ */
/* Doctors                                                             */
/* ------------------------------------------------------------------ */

const DOCTORS = [
  {
    fullName: "Dr. Anjali Deshmukh",
    gender: "Female",
    age: 44,
    bloodGroup: "O+",
    specialization: "Obstetrician & Gynecologist",
    qualifications: "MBBS, MD (Obstetrics & Gynaecology)",
    experience: "18 years",
    department: "Obstetrics",
    consultationFee: 900,
    expertise: ["High-Risk Pregnancy", "Normal Delivery", "Prenatal Counselling"],
    languages: ["Hindi", "English", "Marathi"],
    city: "Indore",
    rating: 4.8,
    reviewsCount: 214,
    patientsCount: 1860,
  },
  {
    fullName: "Dr. Rakesh Menon",
    gender: "Male",
    age: 49,
    bloodGroup: "B+",
    specialization: "Fetal Medicine Specialist",
    qualifications: "MBBS, MS, Fellowship in Fetal Medicine",
    experience: "22 years",
    department: "Fetal Medicine",
    consultationFee: 1200,
    expertise: ["Fetal Ultrasound", "Anomaly Scan", "Twin Pregnancy"],
    languages: ["English", "Malayalam", "Hindi"],
    city: "Indore",
    rating: 4.7,
    reviewsCount: 168,
    patientsCount: 1420,
  },
  {
    fullName: "Dr. Sneha Kulkarni",
    gender: "Female",
    age: 38,
    bloodGroup: "A+",
    specialization: "Gynecologist",
    qualifications: "MBBS, DGO",
    experience: "12 years",
    department: "Gynaecology",
    consultationFee: 700,
    expertise: ["PCOS Care", "Fertility Support", "Menstrual Health"],
    languages: ["Marathi", "Hindi", "English"],
    city: "Bhopal",
    rating: 4.6,
    reviewsCount: 132,
    patientsCount: 980,
  },
  {
    fullName: "Dr. Vikram Iyer",
    gender: "Male",
    age: 46,
    bloodGroup: "AB+",
    specialization: "Obstetrician",
    qualifications: "MBBS, MD (Obstetrics)",
    experience: "19 years",
    department: "Obstetrics",
    consultationFee: 850,
    expertise: ["Labour Management", "C-Section", "Postpartum Care"],
    languages: ["Tamil", "English", "Hindi"],
    city: "Indore",
    rating: 4.5,
    reviewsCount: 149,
    patientsCount: 1310,
  },
  {
    fullName: "Dr. Meera Nair",
    gender: "Female",
    age: 41,
    bloodGroup: "O-",
    specialization: "Maternal-Fetal Medicine",
    qualifications: "MBBS, MD, DM (Maternal-Fetal Medicine)",
    experience: "15 years",
    department: "Maternal Medicine",
    consultationFee: 1100,
    expertise: ["Gestational Diabetes", "Preeclampsia", "IVF Pregnancy"],
    languages: ["English", "Hindi", "Malayalam"],
    city: "Ujjain",
    rating: 4.9,
    reviewsCount: 196,
    patientsCount: 1540,
  },
  {
    fullName: "Dr. Arjun Bhatt",
    gender: "Male",
    age: 43,
    bloodGroup: "B-",
    specialization: "Neonatologist",
    qualifications: "MBBS, MD (Paediatrics), Fellowship in Neonatology",
    experience: "16 years",
    department: "Neonatology",
    consultationFee: 950,
    expertise: ["Newborn Care", "Preterm Baby Care", "Breastfeeding Support"],
    languages: ["Gujarati", "Hindi", "English"],
    city: "Indore",
    rating: 4.7,
    reviewsCount: 121,
    patientsCount: 870,
  },
  {
    fullName: "Dr. Kavita Joshi",
    gender: "Female",
    age: 47,
    bloodGroup: "A-",
    specialization: "Ayurvedic Prenatal Care",
    qualifications: "BAMS, MD (Prasuti Tantra)",
    experience: "20 years",
    department: "Ayurveda",
    consultationFee: 600,
    expertise: ["Garbha Sanskar", "Ayurvedic Diet", "Panchakarma in Pregnancy"],
    languages: ["Hindi", "Sanskrit", "English"],
    city: "Ujjain",
    rating: 4.8,
    reviewsCount: 178,
    patientsCount: 1120,
  },
  {
    fullName: "Dr. Sameer Khanna",
    gender: "Male",
    age: 39,
    bloodGroup: "O+",
    specialization: "Clinical Nutritionist",
    qualifications: "MBBS, MSc (Clinical Nutrition)",
    experience: "13 years",
    department: "Nutrition & Dietetics",
    consultationFee: 550,
    expertise: ["Pregnancy Diet Plans", "Anaemia Management", "Weight Care"],
    languages: ["Hindi", "English", "Punjabi"],
    city: "Bhopal",
    rating: 4.4,
    reviewsCount: 96,
    patientsCount: 740,
  },
  {
    fullName: "Dr. Pooja Reddy",
    gender: "Female",
    age: 36,
    bloodGroup: "B+",
    specialization: "Prenatal Physiotherapist",
    qualifications: "BPT, MPT (Obstetrics & Gynaecology)",
    experience: "11 years",
    department: "Physiotherapy",
    consultationFee: 500,
    expertise: ["Pelvic Floor Therapy", "Prenatal Yoga", "Back Pain Relief"],
    languages: ["Telugu", "English", "Hindi"],
    city: "Indore",
    rating: 4.6,
    reviewsCount: 88,
    patientsCount: 620,
  },
  {
    fullName: "Dr. Aditya Verma",
    gender: "Male",
    age: 42,
    bloodGroup: "AB-",
    specialization: "Perinatal Mental Health",
    qualifications: "MBBS, MD (Psychiatry)",
    experience: "14 years",
    department: "Mental Wellness",
    consultationFee: 800,
    expertise: [
      "Antenatal Anxiety",
      "Postpartum Depression",
      "Couple Counselling",
    ],
    languages: ["Hindi", "English"],
    city: "Bhopal",
    rating: 4.5,
    reviewsCount: 104,
    patientsCount: 690,
  },
];

/*
 * Two shift patterns. Every slot the appointments below use (10:00-12:30 and
 * 17:00-19:30) sits inside both, so isSlotAvailable passes for any doctor.
 */
const SHIFT_PATTERNS = [
  [
    { startTime: "10:00", endTime: "13:00", slotDuration: 30 },
    { startTime: "17:00", endTime: "20:00", slotDuration: 30 },
  ],
  [
    {
      startTime: "09:30",
      endTime: "13:30",
      slotDuration: 30,
      breakStart: "13:00",
      breakEnd: "13:30",
    },
    { startTime: "16:30", endTime: "20:00", slotDuration: 30 },
  ],
];

// Monday to Saturday; Sunday stays closed
const weeklyScheduleFor = (index) =>
  [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
    dayOfWeek,
    isAvailable: dayOfWeek !== 0,
    shifts: dayOfWeek === 0 ? [] : SHIFT_PATTERNS[index % 2],
  }));

/* ------------------------------------------------------------------ */
/* Patients                                                            */
/* ------------------------------------------------------------------ */

const PATIENTS = [
  ["Priyanka Sharma", "Rohit Sharma", "Software Engineer", 29, "O+", 8, "Indore"],
  ["Anita Patel", "Mahesh Patel", "Housewife", 31, "B+", 22, "Ahmedabad"],
  ["Sneha Verma", "Anuj Verma", "Teacher", 27, "A+", 34, "Bhopal"],
  ["Kavya Nair", "Vishal Nair", "Bank Officer", 30, "AB+", 16, "Indore"],
  ["Ritu Singh", "Devendra Singh", "Housewife", 26, "O-", 11, "Ujjain"],
  ["Megha Joshi", "Sagar Joshi", "Graphic Designer", 28, "B-", 30, "Indore"],
  ["Pooja Chauhan", "Nitin Chauhan", "HR Manager", 33, "A-", 19, "Bhopal"],
  ["Divya Rathore", "Karan Rathore", "Lawyer", 32, "O+", 7, "Jaipur"],
  ["Neha Agarwal", "Ashish Agarwal", "Chartered Accountant", 29, "B+", 25, "Indore"],
  ["Shreya Kulkarni", "Omkar Kulkarni", "Housewife", 24, "A+", 36, "Pune"],
  ["Aarti Yadav", "Sunil Yadav", "Nurse", 30, "AB-", 14, "Ujjain"],
  ["Nisha Bansal", "Gaurav Bansal", "Content Writer", 27, "O+", 9, "Indore"],
  ["Swati Deshpande", "Prasad Deshpande", "Architect", 34, "B+", 28, "Nagpur"],
  ["Rekha Thakur", "Manoj Thakur", "Housewife", 25, "A+", 20, "Bhopal"],
  ["Ishita Malhotra", "Varun Malhotra", "Marketing Lead", 31, "O-", 12, "Delhi"],
  ["Tanvi Shah", "Jay Shah", "Dentist", 28, "AB+", 32, "Indore"],
  ["Preeti Chouhan", "Ravi Chouhan", "School Principal", 35, "B-", 17, "Ujjain"],
  ["Komal Jain", "Ankit Jain", "Pharmacist", 26, "A+", 6, "Indore"],
  ["Sanjana Rao", "Kiran Rao", "Data Analyst", 29, "O+", 26, "Hyderabad"],
  ["Bhavna Mishra", "Alok Mishra", "Housewife", 32, "B+", 38, "Bhopal"],
  ["Ayesha Khan", "Imran Khan", "Interior Designer", 30, "AB+", 15, "Indore"],
  ["Jyoti Pawar", "Santosh Pawar", "Government Clerk", 33, "A-", 23, "Nashik"],
  ["Ruchi Gupta", "Deepak Gupta", "Entrepreneur", 27, "O+", 10, "Indore"],
  ["Manisha Solanki", "Harish Solanki", "Housewife", 28, "B+", 29, "Ujjain"],
  ["Farhana Sheikh", "Sohail Sheikh", "Lab Technician", 31, "A+", 21, "Bhopal"],
];

const MEDICAL_CONDITIONS = [
  ["Mild Anaemia"],
  ["Gestational Diabetes"],
  [],
  ["Hypothyroidism"],
  ["Low Blood Pressure"],
  [],
  ["PCOS History"],
  ["Mild Anaemia", "Vitamin D Deficiency"],
];

const MEDICATIONS = [
  [{ name: "Folic Acid", dosage: "5 mg", frequency: "Once a day" }],
  [
    { name: "Iron & Folic Acid", dosage: "100 mg", frequency: "Once a day" },
    { name: "Calcium", dosage: "500 mg", frequency: "Twice a day" },
  ],
  [{ name: "Calcium + Vitamin D3", dosage: "500 mg", frequency: "Once a day" }],
  [
    { name: "Thyroxine", dosage: "50 mcg", frequency: "Once a day, empty stomach" },
  ],
];

const LANGUAGES = ["Hindi", "English", "Marathi", "Gujarati"];

const EXPECTATIONS = [
  "Healthy pregnancy with a natural delivery and daily garbha sanskar guidance.",
  "Structured diet plans and regular doctor check-ins through all three trimesters.",
  "Stress-free pregnancy with yoga, meditation and emotional support.",
  "Complete guidance for a first pregnancy, from nutrition to newborn care.",
  "Ayurvedic care along with modern monitoring for mother and baby.",
];

const trimesterFromWeeks = (weeks) => {
  if (weeks <= 13) return "First Trimester";
  if (weeks <= 27) return "Second Trimester";
  return "Third Trimester";
};

const buildPatientPayload = (row, index, doctors) => {
  const [fullName, husbandOrParentName, profession, age, bloodGroup, weeks, city] =
    row;

  const today = moment.tz(TZ).startOf("day");
  const lmp = today.clone().subtract(weeks * 7, "days");
  const edd = lmp.clone().add(280, "days");

  const primary = doctors[index % doctors.length];
  const firstName = fullName.split(" ")[0];
  const slug = fullName.toLowerCase().replace(/[^a-z]/g, "");

  // Second and later pregnancies get a delivery history
  const gravida = (index % 3) + 1;
  const para = gravida - 1;
  const previousDeliveries =
    para > 0
      ? [
          {
            year: new Date().getFullYear() - (2 + (index % 4)),
            type: index % 2 === 0 ? "Normal Delivery" : "C-Section",
            babyWeight: `${(2.6 + (index % 8) * 0.1).toFixed(1)} kg`,
            complications: index % 5 === 0 ? "Mild jaundice in newborn" : "None",
          },
        ]
      : [];

  return {
    email: `${slug}@hiranyagarbha.test`,
    mobile: 9000000000 + 100000 + index * 1111,
    password: SEED_PASSWORD,
    profile: {
      fullName,
      husbandOrParentName,
      profession,
      dateOfBirth: today.clone().subtract(age, "years").format("YYYY-MM-DD"),
      age,
      bloodGroup,
      height: `${152 + (index % 14)} cm`,
      weight: `${52 + (index % 16)} kg`,
      email: `${slug}@hiranyagarbha.test`,
      phone: String(9000000000 + 100000 + index * 1111),
      whatsappNumber: String(9000000000 + 100000 + index * 1111),
      address: `${10 + index}, Shanti Nagar, ${city}`,

      lmp: lmp.format("YYYY-MM-DD"),
      edd: edd.format("YYYY-MM-DD"),
      currentTrimester: trimesterFromWeeks(weeks),
      gravida,
      para,
      abortions: index % 7 === 0 ? 1 : 0,
      previousDeliveries,

      medicalConditions: MEDICAL_CONDITIONS[index % MEDICAL_CONDITIONS.length],
      medications: MEDICATIONS[index % MEDICATIONS.length],

      primaryDoctor: primary._id,
      doctorDetails: {
        doctorName: primary.fullName,
        specialization: primary.specialization,
        hospital: "Hiranyagarbha Care Centre",
        phone: primary.phone,
        email: primary.email,
      },

      preferredLanguage: LANGUAGES[index % LANGUAGES.length],
      emergencyContact: {
        name: husbandOrParentName,
        relationship: "Husband",
        phone: String(9800000000 + index * 1357),
        address: `${10 + index}, Shanti Nagar, ${city}`,
      },

      heardAboutGarbhsanskar: index % 3 === 0 ? "No" : "Yes",
      expectationsFromHiranyagarbha: EXPECTATIONS[index % EXPECTATIONS.length],
    },
  };
};

/* ------------------------------------------------------------------ */
/* Appointments                                                        */
/* ------------------------------------------------------------------ */

const SYMPTOMS = [
  "Routine antenatal check-up",
  "Morning sickness and fatigue",
  "Mild abdominal cramps",
  "Lower back pain since a week",
  "Swelling in feet",
  "Follow-up for growth scan",
  "Reduced fetal movement since yesterday",
  "Heartburn and acidity",
  "Diet plan review",
  "Blood pressure monitoring",
];

/*
 * 20 appointments: statuses are matched to the date so the data stays
 * believable - nothing in the future is COMPLETED, nothing past is PENDING.
 */
const APPOINTMENT_PLAN = [
  // 5 PENDING - upcoming, awaiting confirmation
  { status: "PENDING", dayOffset: 2, time: "10:00", patient: 0, doctor: 0 },
  { status: "PENDING", dayOffset: 4, time: "11:30", patient: 1, doctor: 2 },
  { status: "PENDING", dayOffset: 7, time: "17:30", patient: 2, doctor: 4 },
  { status: "PENDING", dayOffset: 11, time: "12:00", patient: 3, doctor: 6 },
  { status: "PENDING", dayOffset: 16, time: "18:30", patient: 4, doctor: 8 },

  // 10 CONFIRMED - upcoming and already confirmed
  { status: "CONFIRMED", dayOffset: 1, time: "10:30", patient: 5, doctor: 1 },
  { status: "CONFIRMED", dayOffset: 3, time: "17:00", patient: 6, doctor: 3 },
  { status: "CONFIRMED", dayOffset: 5, time: "11:00", patient: 7, doctor: 5 },
  { status: "CONFIRMED", dayOffset: 6, time: "18:00", patient: 8, doctor: 7 },
  { status: "CONFIRMED", dayOffset: 8, time: "10:00", patient: 9, doctor: 9 },
  { status: "CONFIRMED", dayOffset: 10, time: "12:30", patient: 10, doctor: 0 },
  { status: "CONFIRMED", dayOffset: 13, time: "17:30", patient: 11, doctor: 2 },
  { status: "CONFIRMED", dayOffset: 15, time: "11:30", patient: 12, doctor: 4 },
  { status: "CONFIRMED", dayOffset: 19, time: "19:00", patient: 13, doctor: 6 },
  { status: "CONFIRMED", dayOffset: 23, time: "10:30", patient: 14, doctor: 8 },

  // 3 COMPLETED - past visits
  { status: "COMPLETED", dayOffset: -5, time: "11:00", patient: 15, doctor: 1 },
  { status: "COMPLETED", dayOffset: -12, time: "17:00", patient: 16, doctor: 3 },
  { status: "COMPLETED", dayOffset: -24, time: "10:00", patient: 0, doctor: 5 },

  // 1 CANCELLED + 1 NO_SHOW - past
  { status: "CANCELLED", dayOffset: -9, time: "18:00", patient: 17, doctor: 7 },
  { status: "NO_SHOW", dayOffset: -18, time: "12:00", patient: 18, doctor: 9 },
];

const COMPLETED_NOTES = [
  "Vitals normal. Advised iron supplements and a follow-up scan after 4 weeks.",
  "Growth scan reviewed, baby growth on track. Continue current medication.",
  "Discussed birth plan and breathing exercises. Next visit in 3 weeks.",
];

const APPOINTMENT_TYPES = ["CLINIC", "VIDEO", "CLINIC", "AUDIO", "CLINIC"];

const paymentFor = (status, index) => {
  if (status === "COMPLETED" || status === "NO_SHOW") return "PAID";
  if (status === "CANCELLED") return "REFUNDED";
  if (status === "CONFIRMED") return index % 3 === 0 ? "PENDING" : "PAID";
  return "PENDING";
};

const appointmentNumberFor = (start, index) =>
  `APT-${start.format("YYYYMMDD")}-${String(100000 + index * 7919).slice(0, 6)}`;

/*
 * Doctors are closed on Sunday, so a planned date landing there moves one day
 * further in the same direction (forward for upcoming, back for past).
 */
const resolveSlot = (dayOffset, time) => {
  const start = moment.tz(TZ).add(dayOffset, "days");
  while (start.day() === 0) start.add(dayOffset >= 0 ? 1 : -1, "days");

  const [hours, minutes] = time.split(":").map(Number);
  start.hour(hours).minute(minutes).second(0).millisecond(0);

  return start;
};

/* ------------------------------------------------------------------ */
/* Seed                                                                */
/* ------------------------------------------------------------------ */

const upsertDoctor = async (spec, index) => {
  const slug = spec.fullName
    .toLowerCase()
    .replace(/^dr\.?\s*/, "")
    .replace(/[^a-z]/g, "");
  const email = `${slug}@hiranyagarbha.test`;
  const mobile = 9700000000 + index * 1234;

  const profile = {
    fullName: spec.fullName,
    dateOfBirth: moment
      .tz(TZ)
      .subtract(spec.age, "years")
      .format("YYYY-MM-DD"),
    gender: spec.gender,
    bloodGroup: spec.bloodGroup,
    email,
    phone: String(mobile),
    address: `Hiranyagarbha Care Centre, ${spec.city}`,
    specialization: spec.specialization,
    qualifications: spec.qualifications,
    experience: spec.experience,
    licenseNumber: `MP-${20000 + index * 137}`,
    department: spec.department,
    consultationFee: spec.consultationFee,
    availableDays: "Monday - Saturday",
    availableTime: index % 2 === 0 ? "10:00 - 13:00, 17:00 - 20:00" : "09:30 - 13:00, 16:30 - 20:00",
    expertise: spec.expertise,
    languages: spec.languages,
  };

  const existingUser = await User.findOne({ email, isDeleted: false });

  let doctor;
  if (existingUser) {
    doctor = await completeDoctorProfile(existingUser._id, profile);
  } else {
    ({ doctor } = await createDoctor({
      ...profile,
      name: spec.fullName,
      mobile,
      password: SEED_PASSWORD,
    }));
  }

  // Stats and availability are not part of completeProfile, so set them here
  await Doctor.updateOne(
    { _id: doctor._id },
    {
      $set: {
        rating: spec.rating,
        reviewsCount: spec.reviewsCount,
        patientsCount: spec.patientsCount,
        status: "Active",
        isActive: true,
        isDeleted: false,
      },
    },
  );

  const availability = await DoctorAvailability.findOneAndUpdate(
    { doctorId: doctor._id },
    { $set: { timezone: TZ, weeklySchedule: weeklyScheduleFor(index) } },
    { new: true, upsert: true },
  );

  await Doctor.updateOne(
    { _id: doctor._id },
    { $set: { availabilityId: availability._id } },
  );

  return Doctor.findById(doctor._id).lean();
};

const upsertPatient = async (spec) => {
  const existingUser = await User.findOne({
    email: spec.email,
    isDeleted: false,
  });

  if (existingUser) {
    return completePatientProfile(existingUser._id, spec.profile);
  }

  const { patient } = await createPatient({
    ...spec.profile,
    name: spec.profile.fullName,
    mobile: spec.mobile,
    password: spec.password,
  });

  return patient;
};

/*
 * A profile and the login behind it share one history: the account is opened a
 * few minutes before the profile is filled in, and both are touched together
 * on the last edit.
 */
const backdateProfiles = async (Model, records, window, salt) => {
  const stamps = spreadTimestamps({
    count: records.length,
    from: window.from,
    to: window.to,
    until: EDITED_UNTIL,
    salt,
  });

  await applyTimestamps(
    Model,
    records.map((record) => record._id),
    stamps
  );

  await applyTimestamps(
    User,
    records.map((record) => record.userId),
    stamps.map((stamp, index) => ({
      createdAt: new Date(
        stamp.createdAt.getTime() -
          (5 + Math.floor(unitRandom(salt, index, "signup") * 55)) * 60 * 1000
      ),
      updatedAt: stamp.updatedAt,
    }))
  );

  return stamps;
};

/*
 * When the booking was made and when it was last touched. Nothing may be
 * created in the future, so a visit three weeks out was still booked by today.
 */
const appointmentStamps = (plan, start, end, index, now) => {
  const ceiling = Math.min(start.valueOf() - HOUR, now - HOUR);
  const floor = Math.max(ceiling - 45 * DAY, now - 55 * DAY);

  const createdAt = momentBetween(floor, ceiling, "appointment", index, "booked");

  const cap = now - 5 * 60 * 1000;
  const clamp = (date) =>
    new Date(
      Math.min(Math.max(date.getTime(), createdAt.getTime() + 60 * 1000), cap)
    );

  if (plan.status === "COMPLETED" || plan.status === "NO_SHOW") {
    // Closed off shortly after the visit ended
    return {
      createdAt,
      updatedAt: clamp(
        momentBetween(
          end.valueOf() + 30 * 60 * 1000,
          end.valueOf() + 5 * HOUR,
          "appointment",
          index,
          "closed"
        )
      ),
    };
  }

  if (plan.status === "CANCELLED") {
    return {
      createdAt,
      updatedAt: clamp(
        momentBetween(
          createdAt.getTime() + HOUR,
          start.valueOf() - HOUR,
          "appointment",
          index,
          "cancelled"
        )
      ),
    };
  }

  const gap = plan.status === "CONFIRMED" ? 4 * DAY : 8 * HOUR;

  return {
    createdAt,
    updatedAt: clamp(
      momentBetween(
        createdAt.getTime() + HOUR,
        createdAt.getTime() + gap,
        "appointment",
        index,
        "touched"
      )
    ),
  };
};

const seedAppointments = async (doctors, patients) => {
  const doctorIds = doctors.map((doctor) => doctor._id);
  const patientIds = patients.map((patient) => patient._id);

  // Re-running replaces only what this script created before
  const removed = await Appointment.deleteMany({
    doctorId: { $in: doctorIds },
    patientId: { $in: patientIds },
  });

  const now = Date.now();
  const stamps = [];

  const docs = APPOINTMENT_PLAN.map((plan, index) => {
    const doctor = doctors[plan.doctor];
    const patient = patients[plan.patient];
    const start = resolveSlot(plan.dayOffset, plan.time);
    const end = start.clone().add(30, "minutes");

    stamps.push(appointmentStamps(plan, start, end, index, now));

    return {
      appointmentNumber: appointmentNumberFor(start, index + 1),
      patientId: patient._id,
      doctorId: doctor._id,
      hospitalId: null,
      scheduledBy: index % 4 === 0 ? "ADMIN" : "PATIENT",
      createdBy: index % 4 === 0 ? null : patient.userId,
      createdByModel: index % 4 === 0 ? "admin" : "user",
      appointmentDate: start.clone().startOf("day").toDate(),
      startTime: start.toDate(),
      endTime: end.toDate(),
      duration: 30,
      timezone: TZ,
      appointmentType: APPOINTMENT_TYPES[index % APPOINTMENT_TYPES.length],
      status: plan.status,
      paymentStatus: paymentFor(plan.status, index),
      consultationFee: Number(doctor.consultationFee || 0),
      symptoms: SYMPTOMS[index % SYMPTOMS.length],
      notes:
        plan.status === "COMPLETED"
          ? COMPLETED_NOTES[index % COMPLETED_NOTES.length]
          : plan.status === "NO_SHOW"
            ? "Patient did not turn up for the scheduled visit."
            : null,
      cancelledBy: plan.status === "CANCELLED" ? "PATIENT" : null,
      cancellationReason:
        plan.status === "CANCELLED"
          ? "Patient was travelling, asked to rebook next week."
          : null,
    };
  });

  const inserted = await Appointment.insertMany(docs);

  await applyTimestamps(
    Appointment,
    inserted.map((record) => record._id),
    stamps
  );

  return { removed: removed.deletedCount, created: docs.length };
};

const seed = async () => {
  if (!process.env.MONGO_URL) {
    console.error("MONGO_URL missing in env");
    process.exit(1);
  }

  await mongoDb();

  const doctors = [];
  for (let i = 0; i < DOCTORS.length; i += 1) {
    doctors.push(await upsertDoctor(DOCTORS[i], i));
  }
  await backdateProfiles(Doctor, doctors, DOCTOR_WINDOW, "doctor");
  console.log(
    `Doctors ready: ${doctors.length} (joined ${DOCTOR_WINDOW.from} to ${DOCTOR_WINDOW.to})`,
  );

  const patients = [];
  for (let i = 0; i < PATIENTS.length; i += 1) {
    const spec = buildPatientPayload(PATIENTS[i], i, doctors);
    patients.push(await upsertPatient(spec));
  }
  await backdateProfiles(Patient, patients, PATIENT_WINDOW, "patient");
  console.log(
    `Patients ready: ${patients.length} (joined ${PATIENT_WINDOW.from} to ${PATIENT_WINDOW.to})`,
  );

  const { removed, created } = await seedAppointments(doctors, patients);
  console.log(
    `Appointments: created ${created}, replaced ${removed} from a previous run`,
  );

  const byStatus = await Appointment.aggregate([
    { $match: { doctorId: { $in: doctors.map((d) => d._id) } } },
    { $group: { _id: "$status", total: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  console.log(
    `Status split: ${byStatus.map((s) => `${s._id}=${s.total}`).join(", ")}`,
  );
  console.log(`Seeded logins use the password: ${SEED_PASSWORD}`);

  await mongoose.disconnect();
};

seed().catch(async (err) => {
  console.error("Seed failed:", err);
  try {
    await mongoose.disconnect();
  } catch (e) {
    // ignore
  }
  process.exit(1);
});
