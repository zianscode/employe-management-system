export const POSITION_DEPARTMENT_MAPPING: Record<string, string> = {
  "Software Engineer": "Teknologi Informasi",
  "Frontend Developer": "Teknologi Informasi",
  "Backend Developer": "Teknologi Informasi",
  "Fullstack Developer": "Teknologi Informasi",
  "Mobile Developer": "Teknologi Informasi",
  "UI/UX Designer": "Teknologi Informasi",
  "DevOps Engineer": "Teknologi Informasi",
  "QA Engineer": "Teknologi Informasi",
  "IT Support": "Teknologi Informasi",
  "System Administrator": "Teknologi Informasi",
  "Data Analyst": "Teknologi Informasi",
  "Product Manager": "Teknologi Informasi",
  "Lead Developer": "Teknologi Informasi",

  "HR Recruiter": "Sumber Daya Manusia",
  "HR Staff": "Sumber Daya Manusia",
  "HR Generalist": "Sumber Daya Manusia",
  "HR Manager": "Sumber Daya Manusia",
  "Training Specialist": "Sumber Daya Manusia",

  "Accountant": "Keuangan & Akuntansi",
  "Finance Staff": "Keuangan & Akuntansi",
  "Tax Officer": "Keuangan & Akuntansi",
  "Auditor": "Keuangan & Akuntansi",

  "Digital Marketer": "Pemasaran & Penjualan",
  "Sales Executive": "Pemasaran & Penjualan",
  "Content Creator": "Pemasaran & Penjualan",
  "Social Media Specialist": "Pemasaran & Penjualan",
  "SEO Specialist": "Pemasaran & Penjualan",

  "Customer Service": "Operasional & Layanan",
  "Office Administrator": "Operasional & Layanan",
  "Purchasing Staff": "Operasional & Layanan",
  "Operational Supervisor": "Operasional & Layanan",

  "Chief Executive Officer": "Direksi",
  "Chief Technology Officer": "Direksi",
  "Chief Financial Officer": "Direksi",
};

export function getDepartmentForPosition(posName: string): string {
  const normalized = posName.toLowerCase();
  
  const standardDept = POSITION_DEPARTMENT_MAPPING[posName];
  if (standardDept) return standardDept;
  
  if (/developer|engineer|designer|coder|programmer|tech|it|sys|admin|data|qa|test/i.test(normalized)) {
    return "Teknologi Informasi";
  }
  if (/hr|recru|people|talent/i.test(normalized)) {
    return "Sumber Daya Manusia";
  }
  if (/finance|account|tax|audit|pay/i.test(normalized)) {
    return "Keuangan & Akuntansi";
  }
  if (/market|sale|seo|social|media|content/i.test(normalized)) {
    return "Pemasaran & Penjualan";
  }
  if (/customer|support|purchas|procure|operat/i.test(normalized)) {
    return "Operasional & Layanan";
  }
  if (/chief|director|ceo|cto|cfo/i.test(normalized)) {
    return "Direksi";
  }
  
  return "Umum";
}
