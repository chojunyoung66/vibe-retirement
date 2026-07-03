import type { RetirementGoal } from '../../../types';

type Props = {
  value: RetirementGoal;
  onChange: (v: RetirementGoal) => void;
};

export default function RetirementGoalStep({ value, onChange }: Props) {
  const update = <K extends keyof RetirementGoal>(k: K, v: RetirementGoal[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="step-section">
      <h2 className="step-title">은퇴 목표</h2>
      <p className="step-desc">은퇴 후 원하는 생활 수준을 설정하세요.</p>

      <div className="field-group">
        <label className="field-label">은퇴 후 월 생활비 목표</label>
        <div className="input-row">
          <input
            type="number"
            className="input-field"
            min={0}
            placeholder="300"
            value={value.monthlyLivingExpense ? value.monthlyLivingExpense / 10000 : ''}
            onChange={e => update('monthlyLivingExpense', Number(e.target.value) * 10000)}
          />
          <span className="unit">만원/월</span>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">시뮬레이션 기간</label>
        <div className="input-row">
          <input
            type="number"
            className="input-field"
            min={5}
            max={50}
            value={value.simulationYears || ''}
            onChange={e => update('simulationYears', Number(e.target.value))}
          />
          <span className="unit">년</span>
        </div>
        <p className="field-hint">현재 나이 기준으로 몇 세까지 시뮬레이션할지 기간을 입력하세요.</p>
      </div>

      <div className="field-group">
        <label className="field-label">목표 생활 수준</label>
        <div className="lifestyle-grid">
          {([
            { key: 'minimal', label: '절약형', desc: '꼭 필요한 지출만' },
            { key: 'standard', label: '표준형', desc: '현재 수준 유지' },
            { key: 'comfortable', label: '여유형', desc: '여행·취미 포함' },
          ] as const).map(opt => (
            <button
              key={opt.key}
              type="button"
              className={`lifestyle-btn ${value.lifestyleLevel === opt.key ? 'active' : ''}`}
              onClick={() => update('lifestyleLevel', opt.key)}
            >
              <span className="lifestyle-label">{opt.label}</span>
              <span className="lifestyle-desc">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
