import React from "react";
import { StatCard, StatGrid } from "@/shared/components/ui/StatCard";

export interface ReportStatCard {
  label: string;
  value: string | number;
  hint?: string;
}

export function ReportStatCards({ cards }: { cards: ReportStatCard[] }) {
  return (
    <StatGrid>
      {cards.map((card) => (
        <StatCard key={card.label} label={card.label} value={card.value} hint={card.hint} />
      ))}
    </StatGrid>
  );
}
