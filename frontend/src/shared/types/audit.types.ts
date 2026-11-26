export interface AuditLogRow {
  id: string;
  at: string;
  actorName: string;
  actionLabel: string;
  area: string;
  targetName: string | null;
  detail: string | null;
}
