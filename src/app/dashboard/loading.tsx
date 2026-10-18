import React from "react";

export default function DashboardLoading() {
  return (
    <div className="py-4 pl-8 pr-6 space-y-8 animate-pulse">
      <div className="h-12 w-64 bg-gray-200 rounded-xl mb-8"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white h-32 rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between mb-4">
              <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
              <div className="w-8 h-4 bg-gray-100 rounded-lg"></div>
            </div>
            <div className="w-24 h-4 bg-gray-100 rounded-lg mb-2"></div>
            <div className="w-16 h-8 bg-gray-100 rounded-lg"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white h-96 rounded-2xl border border-gray-100 shadow-sm p-8">
           <div className="w-48 h-6 bg-gray-100 rounded-lg mb-4"></div>
           <div className="w-full h-64 bg-gray-50 rounded-xl mt-4"></div>
        </div>
        <div className="bg-white h-96 rounded-2xl border border-gray-100 shadow-sm p-8">
           <div className="w-48 h-6 bg-gray-100 rounded-lg mb-4"></div>
           <div className="w-full h-64 bg-gray-50 rounded-xl mt-4"></div>
        </div>
      </div>
    </div>
  );
}
