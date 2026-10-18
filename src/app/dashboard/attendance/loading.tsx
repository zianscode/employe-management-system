import React from "react";

export default function AttendanceLoading() {
  return (
    <div className="py-4 pl-8 pr-6 space-y-6 animate-pulse">
      <div className="bg-gray-100 h-24 rounded-2xl w-full"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white h-32 rounded-2xl border border-gray-100 p-6 shadow-sm"></div>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="h-12 flex-1 bg-gray-100 rounded-xl"></div>
        <div className="h-12 w-48 bg-gray-100 rounded-xl"></div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 h-96 shadow-sm"></div>
    </div>
  );
}
