import React from "react";

export default function EmployeesLoading() {
  return (
    <div className="py-4 pl-8 pr-6 space-y-6 animate-pulse">
      <div className="bg-gray-100 h-24 rounded-2xl w-full"></div>

      <div className="flex justify-between items-center gap-4">
        <div className="h-12 w-64 bg-gray-100 rounded-xl"></div>
        <div className="flex gap-2">
          <div className="h-12 w-32 bg-gray-100 rounded-xl"></div>
          <div className="h-12 w-32 bg-gray-100 rounded-xl"></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 h-16 bg-gray-50/50"></div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-gray-100 rounded"></div>
                  <div className="h-3 w-24 bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
              <div className="h-8 w-8 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
