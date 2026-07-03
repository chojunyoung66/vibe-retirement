import type { ReportSummary, ScenarioResult, UserInput } from '../../types';
import { fmt, fmtMo } from '../../utils/format';
import CashflowChart from './CashflowChart';
import CashflowTable from './CashflowTable';
import MetricCard from './MetricCard';
import ScenarioCard from './ScenarioCard';
import StatusBanner from './StatusBanner';

type Props = {
  summary: ReportSummary;
  scenarios: ScenarioResult[];
  input: UserInput;
  onEdit: () => void;
  onSave: () => void;
  onPrint: () => void;
};

export default function SummaryReport({ summary, scenarios, input, onEdit, onSave, onPrint }: Props) {
  const baseScenario = scenarios[0];
  const netColor = summary.monthlyNetCashflow >= 0 ? '#10B981' : '#EF4444';
  const totalAsset = input.asset.cashAsset + input.asset.financialAsset + input.asset.pensionAccount + input.asset.otherAsset;

  return (
    <div className="report-container">
      <div className="report-header">
        <h1 className="report-title">은퇴 현금흐름 리포트</h1>
        <p className="report-subtitle">
          은퇴 {input.profile.retirementAge}세 기준 · {input.scenario.simulationYears}년 시뮬레이션 ·{' '}
          {new Date().toLocaleDateString('ko-KR')} 생성
        </p>
      </div>

      <StatusBanner status={summary.depletionStatus} estimatedDepletionAge={summary.estimatedDepletionAge} />

      <div className="metrics-grid">
        {typeof summary.goalAchievementRate === 'number' && (
          <MetricCard
            label="은퇴 목표 달성률"
            value={`${Math.round(summary.goalAchievementRate * 100)}%`}
            hint={summary.targetRetirementAsset ? `목표 자산 ${fmt(summary.targetRetirementAsset)} 기준` : '목표 대비 준비도'}
            color={summary.goalAchievementRate >= 1 ? '#10B981' : summary.goalAchievementRate >= 0.7 ? '#F59E0B' : '#EF4444'}
          />
        )}
        <MetricCard label="월 순현금흐름" value={`${summary.monthlyNetCashflow >= 0 ? '+' : ''}${fmtMo(summary.monthlyNetCashflow)}`} hint="수입 - 지출" color={netColor} />
        <MetricCard label="예상 자산 고갈 나이" value={summary.estimatedDepletionAge ? `${summary.estimatedDepletionAge}세` : '고갈 없음'} hint={`${input.scenario.simulationYears}년 시뮬레이션 기준`} color={summary.estimatedDepletionAge ? '#EF4444' : '#10B981'} />
        <MetricCard label="월 고정지출 합계" value={fmtMo(summary.totalMonthlyFixedExpense)} hint="건강보험료 포함" />
        <MetricCard label="예상 건강보험료" value={fmtMo(summary.estimatedHealthInsurancePremium)} hint="참고용 추정값" />
        <MetricCard label="초기 은퇴자산" value={fmt(totalAsset)} hint="현금성·금융·연금계좌 합계" fullWidth />
      </div>

      {summary.warnings.length > 0 && (
        <div className="warnings-box">
          <h3 className="warnings-title">주요 경고</h3>
          {summary.warnings.map((w, i) => (
            <div key={i} className="warning-item"><span className="warning-icon">⚠</span> {w}</div>
          ))}
        </div>
      )}

      <div className="scenarios-section">
        <h3 className="section-title">시나리오 비교</h3>
        <div className="scenarios-grid">
          {scenarios.map(s => <ScenarioCard key={s.label} scenario={s} />)}
        </div>
      </div>

      {baseScenario && <CashflowChart cashflows={baseScenario.cashflows} />}

      {baseScenario && <CashflowTable cashflows={baseScenario.cashflows} />}

      <div className="disclaimer-box">
        <p>
          이 리포트는 입력값과 가정에 기반한 참고용 시뮬레이션입니다. 건강보험료 및 세금 수치는 실제와 다를 수 있습니다.
          중요한 재무 결정 전 전문가와 상담하세요.
        </p>
      </div>

      <div className="action-buttons">
        <button type="button" className="btn-secondary" onClick={onEdit}>입력 수정</button>
        <button type="button" className="btn-secondary" onClick={onSave}>저장</button>
        <button type="button" className="btn-primary" onClick={onPrint}>PDF 저장</button>
      </div>
    </div>
  );
}
