import { User, CreditCard, ShieldAlert, Award } from "lucide-react";

export interface OnboardingFormData {
  phone: string;
  gender: string;
  placeOfBirth: string;
  birthDate: string;
  address: string;
  identityNumber: string;
  npwpNumber: string;
  bankName: string;
  bankAccount: string;
  bankHolderName: string;
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
  eduLevel: string;
  eduMajor: string;
  eduUniv: string;
  eduStartYear: string;
  eduEndYear: string;
  bio: string;
}

export const STEPS = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Identity", icon: CreditCard },
  { id: 3, title: "Emergency", icon: ShieldAlert },
  { id: 4, title: "Pendidikan Terakhir", icon: Award },
];

export const COUNTRY_OPTIONS = [
  { code: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "+66", name: "Thailand", flag: "🇹🇭" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
];

export const CITIES = [
  "Jakarta",
  "Bogor",
  "Depok",
  "Tangerang",
  "Tangerang Selatan",
  "Bekasi",
  "Bandung",
  "Cimahi",
  "Tasikmalaya",
  "Cirebon",
  "Semarang",
  "Yogyakarta",
  "Surakarta (Solo)",
  "Magelang",
  "Pekalongan",
  "Tegal",
  "Surabaya",
  "Malang",
  "Sidoarjo",
  "Gresik",
  "Kediri",
  "Madiun",
  "Blitar",
  "Pasuruan",
  "Probolinggo",
  "Batu",
  "Banda Aceh",
  "Medan",
  "Binjai",
  "Pematangsiantar",
  "Sibolga",
  "Tanjungbalai",
  "Tebing Tinggi",
  "Padang",
  "Bukittinggi",
  "Pekanbaru",
  "Dumai",
  "Jambi",
  "Palembang",
  "Lubuklinggau",
  "Prabumulih",
  "Bengkulu",
  "Bandar Lampung",
  "Metro",
  "Pangkalpinang",
  "Tanjungpinang",
  "Batam",
  "Denpasar",
  "Mataram",
  "Kupang",
  "Pontianak",
  "Singkawang",
  "Banjarmasin",
  "Banjarbaru",
  "Palangkaraya",
  "Samarinda",
  "Balikpapan",
  "Bontang",
  "Tarakan",
  "Makassar",
  "Gowa",
  "Maros",
  "Parepare",
  "Palopo",
  "Manado",
  "Bitung",
  "Tomohon",
  "Palu",
  "Kendari",
  "Gorontalo",
  "Ambon",
  "Ternate",
  "Jayapura",
  "Sorong",
  "Manokwari"
].sort();

export const SUGGESTED_SKILLS = [
  "React.js", "Next.js", "TypeScript", "Node.js", "Python", 
  "UI/UX Design", "Project Management", "Data Analysis", 
  "Digital Marketing", "HR Management"
];
