import type { MonthlyCashflowResult } from '../../types';

type Props = {
  cashflows: MonthlyCashflowResult[];
};

export default function CashflowChart({ cashflows }: Props) {
  const yearly = cashflows.filter(r => r.month === 1);
  if (yearly.length === 0) return null;

  const maxBalance = Math.max(...yearly.map(r => r.endingAssetBalance));

  return (
    <div className="chart-wrap">
      <h3 className="chart-title">자산 잔액 추이 (연도별)</h3>
      <div className="bar-chart">
        {yearly.map(r => {
          const pct = maxBalance > 0 ? (r.endingAssetBalance / maxBalance) * 100 : 0;
          const depleted = r.endingAssetBalance <= 0;
          return (
            <div key={`${r.year}`} className="bar-col">
              <div
                className={`bar-fill ${depleted ? 'depleted' : ''}`}
                style={{ height: `${Math.max(pct, 0)}%` }}
                title={`${r.age}세: ${(r.endingAssetBalance / 10000).toFixed(0)}만원`}
              />
              <span className="bar-label">{r.age}세</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
