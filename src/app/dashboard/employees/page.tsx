"use client";

import EmployeListCard from "@/components/ui/employee/EmployeListCard";
import Header from "@/components/ui/employee/Header";
import StatsCards from "@/components/ui/employee/StatsCard";

export default function EmployeesPage() {

  

  return (
    <div className="min-h-screen bg-white p-4 md:p-4 ml-5">
      <Header />

      {/* Main Content */}
      <div className="py-6">

        {/* Stats Cards */}
        <StatsCards />

        {/* Employee List Card */}
        <EmployeListCard/>

        
      </div>
    </div>
  );
}
