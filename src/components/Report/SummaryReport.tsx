import type { ReportSummary, ScenarioResult, UserInput } from '../../types';
import CashflowChart from './CashflowChart';

type Props = {
  summary: ReportSummary;
  scenarios: ScenarioResult[];
  input: UserInput;
  onEdit: () => void;
  onSave: () => void;
  onPrint: () => void;
};

const fmt = (n: number) => `${(n / 10000).toFixed(0)}만원`;
const fmtMo = (n: number) => `${(n / 10000).toFixed(0)}만원/월`;

const statusColor: Record<string, string> = {
  stable: '#10B981',
  watch: '#F59E0B',
  risk: '#F59E0B',
  depleted: '#EF4444',
  unknown: '#6B7280',
};

const statusLabel: Record<string, string> = {
  stable: '안전',
  watch: '주의',
  risk: '위험',
  depleted: '고갈',
  unknown: '미확인',
};

export default function SummaryReport({ summary, scenarios, input, onEdit, onSave, onPrint }: Props) {
  const baseScenario = scenarios[0];
  const netColor = summary.monthlyNetCashflow >= 0 ? '#10B981' : '#EF4444';

  return (
    <div className="report-container">
      <div className="report-header">
        <h1 className="report-title">은퇴 현금흐름 리포트</h1>
        <p className="report-subtitle">
          {input.profile.currentAge}세 기준 · {input.scenario.simulationYears}년 시뮬레이션 ·{' '}
          {new Date().toLocaleDateString('ko-KR')} 생성
        </p>
      </div>

      <div className="status-banner" style={{ backgroundColor: statusColor[summary.depletionStatus] + '20', borderColor: statusColor[summary.depletionStatus] }}>
        <span className="status-icon" style={{ color: statusColor[summary.depletionStatus] }}>
          {summary.depletionStatus === 'stable' ? '✓' : summary.depletionStatus === 'depleted' ? '!' : '△'}
        </span>
        <div>
          <div className="status-label" style={{ color: statusColor[summary.depletionStatus] }}>
            {statusLabel[summary.depletionStatus]}
          </div>
          <div className="status-desc">
            {summary.depletionStatus === 'stable' && '시뮬레이션 기간 내 자산이 유지됩니다.'}
            {summary.depletionStatus === 'watch' && '자산 잔액을 주의 깊게 모니터링하세요.'}
            {summary.depletionStatus === 'risk' && '자산 고갈 위험이 있습니다. 지출 조정이 필요합니다.'}
            {summary.depletionStatus === 'depleted' && `${summary.estimatedDepletionAge}세경 자산이 고갈될 수 있습니다.`}
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">월 순현금흐름</div>
          <div className="metric-value" style={{ color: netColor }}>
            {summary.monthlyNetCashflow >= 0 ? '+' : ''}{fmtMo(summary.monthlyNetCashflow)}
          </div>
          <div className="metric-hint">수입 - 지출</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">예상 자산 고갈 나이</div>
          <div className="metric-value" style={{ color: summary.estimatedDepletionAge ? '#EF4444' : '#10B981' }}>
            {summary.estimatedDepletionAge ? `${summary.estimatedDepletionAge}세` : '고갈 없음'}
          </div>
          <div className="metric-hint">{input.scenario.simulationYears}년 시뮬레이션 기준</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">월 고정지출 합계</div>
          <div className="metric-value">{fmtMo(summary.totalMonthlyFixedExpense)}</div>
          <div className="metric-hint">건강보험료 포함</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">예상 건강보험료</div>
          <div className="metric-value">{fmtMo(summary.estimatedHealthInsurancePremium)}</div>
          <div className="metric-hint">참고용 추정값</div>
        </div>

        <div className="metric-card full-width">
          <div className="metric-label">초기 은퇴자산</div>
          <div className="metric-value">
            {fmt(input.asset.cashAsset + input.asset.financialAsset + input.asset.pensionAccount + input.asset.otherAsset)}
          </div>
          <div className="metric-hint">현금성·금융·연금계좌 합계</div>
        </div>
      </div>

      {summary.warnings.length > 0 && (
        <div className="warnings-box">
          <h3 className="warnings-title">주요 경고</h3>
          {summary.warnings.map((w, i) => (
            <div key={i} className="warning-item">
              <span className="warning-icon">⚠</span> {w}
            </div>
          ))}
        </div>
      )}

      <div className="scenarios-section">
        <h3 className="section-title">시나리오 비교</h3>
        <div className="scenarios-grid">
          {scenarios.map(s => (
            <div key={s.label} className="scenario-card" style={{ borderColor: statusColor[s.depletion.status] }}>
              <div className="scenario-label">{s.label}</div>
              <div className="scenario-status" style={{ color: statusColor[s.depletion.status] }}>
                {statusLabel[s.depletion.status]}
              </div>
              <div className="scenario-detail">
                {s.depletion.depletionAge
                  ? `${s.depletion.depletionAge}세 고갈`
                  : '고갈 없음'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {baseScenario && <CashflowChart cashflows={baseScenario.cashflows} />}

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
              {(baseScenario?.cashflows ?? []).slice(0, 24).map((r, i) => (
                <tr key={i} className={r.monthlyNetCashflow < 0 ? 'row-negative' : ''}>
                  <td>{r.age}세 {r.month}월</td>
                  <td>{(r.monthlyIncome / 10000).toFixed(0)}</td>
                  <td>{(r.monthlyExpense / 10000).toFixed(0)}</td>
                  <td style={{ color: r.monthlyNetCashflow >= 0 ? '#10B981' : '#EF4444' }}>
                    {r.monthlyNetCashflow >= 0 ? '+' : ''}{(r.monthlyNetCashflow / 10000).toFixed(0)}
                  </td>
                  <td>{(r.endingAssetBalance / 10000).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-unit">단위: 만원</p>
      </div>

      <div className="disclaimer-box">
        <p>
          이 리포트는 입력값과 가정에 기반한 참고용 시뮬레이션입니다. 건강보험료 및 세금 수치는 실제와 다를 수 있습니다.
          중요한 재무 결정 전 전문가와 상담하세요.
        </p>
      </div>

      <div className="action-buttons">
        <button type="button" className="btn-secondary" onClick={onEdit}>
          입력 수정
        </button>
        <button type="button" className="btn-secondary" onClick={onSave}>
          저장
        </button>
        <button type="button" className="btn-primary" onClick={onPrint}>
          PDF 저장
        </button>
      </div>
    </div>
  );
}
