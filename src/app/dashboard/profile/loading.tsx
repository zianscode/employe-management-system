import React from "react";

export default function ProfileLoading() {
  return (
    <div className="py-4 pl-8 pr-6 space-y-6 animate-pulse">
      <div className="h-40 w-full bg-gray-100 rounded-2xl"></div>

      <div className="h-12 w-full bg-white border border-gray-100 rounded-2xl"></div>

      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
        <div className="h-6 w-48 bg-gray-100 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
              <div className="h-12 w-full bg-gray-50 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
