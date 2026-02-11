interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function MetricCard({ title, value, subtitle, icon, children }: MetricCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="text-3xl font-light text-gray-900 tracking-tight">{value}</div>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      {children}
    </div>
  );
}
