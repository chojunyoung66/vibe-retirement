import type { ScenarioAssumption } from '../../../types';

type Props = {
  value: ScenarioAssumption;
  onChange: (v: ScenarioAssumption) => void;
  maintainDependent: boolean;
  onMaintainDependentChange: (v: boolean) => void;
};

export default function ScenarioInput({
  value,
  onChange,
  maintainDependent,
  onMaintainDependentChange,
}: Props) {
  const update = <K extends keyof ScenarioAssumption>(k: K, v: ScenarioAssumption[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="step-section">
      <h2 className="step-title">시나리오 가정</h2>
      <p className="step-desc">계산에 사용할 경제 가정과 건강보험 조건을 설정하세요.</p>

      <div className="field-group">
        <label className="field-label">물가 상승률</label>
        <div className="input-row">
          <input
            type="number"
            className="input-field"
            step={0.1}
            min={0}
            max={10}
            value={(value.inflationRate * 100).toFixed(1)}
            onChange={e => update('inflationRate', Number(e.target.value) / 100)}
          />
          <span className="unit">%</span>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">연간 투자 수익률</label>
        <div className="input-row">
          <input
            type="number"
            className="input-field"
            step={0.1}
            min={0}
            max={20}
            value={(value.annualReturnRate * 100).toFixed(1)}
            onChange={e => update('annualReturnRate', Number(e.target.value) / 100)}
          />
          <span className="unit">%</span>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">생활비 증가율</label>
        <div className="input-row">
          <input
            type="number"
            className="input-field"
            step={0.1}
            min={0}
            max={10}
            value={(value.livingExpenseGrowthRate * 100).toFixed(1)}
            onChange={e => update('livingExpenseGrowthRate', Number(e.target.value) / 100)}
          />
          <span className="unit">%</span>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">의료비 증가율</label>
        <div className="input-row">
          <input
            type="number"
            className="input-field"
            step={0.1}
            min={0}
            max={20}
            value={(value.medicalExpenseGrowthRate * 100).toFixed(1)}
            onChange={e => update('medicalExpenseGrowthRate', Number(e.target.value) / 100)}
          />
          <span className="unit">%</span>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">건강보험 피부양자 유지 여부</label>
        <div className="toggle-row">
          <button
            type="button"
            className={`toggle-btn ${maintainDependent ? 'active' : ''}`}
            onClick={() => {
              onMaintainDependentChange(true);
              update('maintainHealthInsuranceDependentStatus', true);
            }}
          >
            유지 예정
          </button>
          <button
            type="button"
            className={`toggle-btn ${!maintainDependent ? 'active' : ''}`}
            onClick={() => {
              onMaintainDependentChange(false);
              update('maintainHealthInsuranceDependentStatus', false);
            }}
          >
            지역가입자 전환
          </button>
        </div>
        <p className="field-hint">
          피부양자 유지 시에도 연금소득·금융소득 기준으로 리스크를 점검합니다.
        </p>
      </div>

      <div className="field-group">
        <label className="field-label">4% 인출 규칙 적용</label>
        <div className="toggle-row">
          <button
            type="button"
            className={`toggle-btn ${value.useFourPercentWithdrawalRule ? 'active' : ''}`}
            onClick={() => update('useFourPercentWithdrawalRule', true)}
          >
            적용
          </button>
          <button
            type="button"
            className={`toggle-btn ${!value.useFourPercentWithdrawalRule ? 'active' : ''}`}
            onClick={() => update('useFourPercentWithdrawalRule', false)}
          >
            미적용
          </button>
        </div>
        <p className="field-hint">연간 인출액이 금융자산의 4%를 초과 시 경고를 표시합니다.</p>
      </div>
    </div>
  );
}
