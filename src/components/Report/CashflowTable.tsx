import type { MonthlyCashflowResult } from '../../types';

type Props = {
  cashflows: MonthlyCashflowResult[];
};

const cell = (n: number) => (n / 10000).toFixed(0);

export default function CashflowTable({ cashflows }: Props) {
  return (
    <div className="cashflow-table-wrap">
      <h3 className="section-title">월별 현금흐름 (처음 24개월)</h3>
      <div className="table-scroll">
        <table className="cashflow-table">
          <thead>
            <tr>
              <th>나이</th>
              <th>월 수입</th>
              <th>월 지출</th>
              <th>순현금흐름</th>
              <th>자산 잔액</th>
            </tr>
          </thead>
          <tbody>
            {cashflows.slice(0, 24).map((r, i) => (
              <tr key={i} className={r.monthlyNetCashflow < 0 ? 'row-negative' : ''}>
                <td>{r.age}세 {r.month}월</td>
                <td>{cell(r.monthlyIncome)}</td>
                <td>{cell(r.monthlyExpense)}</td>
                <td style={{ color: r.monthlyNetCashflow >= 0 ? '#10B981' : '#EF4444' }}>
                  {r.monthlyNetCashflow >= 0 ? '+' : ''}{cell(r.monthlyNetCashflow)}
                </td>
                <td>{cell(r.endingAssetBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-unit">단위: 만원</p>
    </div>
  );
}
