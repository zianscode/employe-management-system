import React from "react";
import { StatCard, StatGrid, StatTone } from "@/shared/components/StatCard";

export interface ReportStatCard {
  label: string;
  value: string | number;
  hint?: string;
  icon?: React.ElementType;
  tone?: StatTone;
}

export function ReportStatCards({ cards }: { cards: ReportStatCard[] }) {
  return (
    <StatGrid>
      {cards.map((card) => (
        <StatCard key={card.label} label={card.label} value={card.value} hint={card.hint} icon={card.icon} tone={card.tone} />
      ))}
    </StatGrid>
  );
}
