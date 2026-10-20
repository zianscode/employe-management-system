import React from "react";

type Tone = "blue" | "green" | "orange" | "red" | "purple";

export interface ReportStatCard {
  label: string;
  value: string | number;
  hint?: string;
  tone: Tone;
}

const TONE_CLASSES: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
  purple: "bg-purple-50 text-purple-600",
};

export function ReportStatCards({ cards }: { cards: ReportStatCard[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${TONE_CLASSES[card.tone]}`}>{card.label}</span>
          <p className="text-2xl font-bold text-gray-900 mt-3">{card.value}</p>
          {card.hint && <p className="text-xs text-gray-500 mt-1">{card.hint}</p>}
        </div>
      ))}
    </div>
  );
}
