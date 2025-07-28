'use client';

import React from 'react';

import Header from '@/components/ui/dashboard/Header';
import StatsCards from '@/components/ui/dashboard/StatsCards';
import ChartsSection from '@/components/ui/dashboard/ChartsSection';

export default function DashboardPage () {
  return (
    <div className="min-h-screen bg-white p-4 md:p-4 ml-5">
      <div className="max-w-9xl mx-auto space-y-5">
        {/* Header */}
        <Header />

        {/* Stats Cards */}
        <StatsCards/>

        {/* Charts Section */}
        <ChartsSection/>
      </div>
    </div>      
  );
};



