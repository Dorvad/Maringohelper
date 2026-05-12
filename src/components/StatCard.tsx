type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
};

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="glass-card min-h-[116px] p-5">
      <p className="text-sm font-bold text-app-secondary">{label}</p>
      <p className="mt-4 text-4xl font-black tracking-[-0.05em] text-app-text">{value}</p>
      {hint ? <p className="mt-1 text-xs font-bold text-app-secondary">{hint}</p> : null}
    </div>
  );
}
