const PROBATION_MONTHS = 3;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function getProbationDaysLeft(joinDate: Date | string): number {
  const probationEnd = new Date(joinDate);
  probationEnd.setMonth(probationEnd.getMonth() + PROBATION_MONTHS);
  probationEnd.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return Math.ceil((probationEnd.getTime() - today.getTime()) / MS_PER_DAY);
}
