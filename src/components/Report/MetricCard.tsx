type Props = {
  label: string;
  value: string;
  hint: string;
  color?: string;
  fullWidth?: boolean;
};

export default function MetricCard({ label, value, hint, color, fullWidth }: Props) {
  return (
    <div className={`metric-card${fullWidth ? ' full-width' : ''}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={color ? { color } : undefined}>{value}</div>
      <div className="metric-hint">{hint}</div>
    </div>
  );
}
