import type { ScenarioAssumption } from '../../../types';

type Props = {
  value: ScenarioAssumption;
  onChange: (v: ScenarioAssumption) => void;
};

export default function ScenarioInput({ value, onChange }: Props) {
  const update = <K extends keyof ScenarioAssumption>(k: K, v: ScenarioAssumption[K]) =>
    onChange({ ...value, [k]: v });

  const maintainDependent = value.maintainHealthInsuranceDependentStatus;

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
            onClick={() => update('maintainHealthInsuranceDependentStatus', true)}
          >
            유지 예정
          </button>
          <button
            type="button"
            className={`toggle-btn ${!maintainDependent ? 'active' : ''}`}
            onClick={() => update('maintainHealthInsuranceDependentStatus', false)}
          >
            지역가입자 전환
          </button>
        </div>
        <p className="field-hint">
          피부양자 유지 시에도 연금소득·금융소득 기준으로 리스크를 점검합니다.
        </p>
      </div>

      {maintainDependent && (
        <>
          <div className="field-group">
            <label className="field-label">피부양자 자격 상실 예정 연도</label>
            <div className="input-row">
              <input
                type="number"
                className="input-field"
                min={2024}
                max={2100}
                value={value.dependentStatusLossYear ?? ''}
                onChange={e =>
                  update(
                    'dependentStatusLossYear',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
              />
              <span className="unit">년</span>
            </div>
            <p className="field-hint">해당 시점 이후 지역가입자로 전환됩니다. 미입력 시 전환 없음.</p>
          </div>

          <div className="field-group">
            <label className="field-label">피부양자 자격 상실 예정 월</label>
            <div className="input-row">
              <input
                type="number"
                className="input-field"
                min={1}
                max={12}
                value={value.dependentStatusLossMonth ?? ''}
                onChange={e =>
                  update(
                    'dependentStatusLossMonth',
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
              />
              <span className="unit">월</span>
            </div>
          </div>
        </>
      )}

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
        <p className="field-hint">적자 시 월 인출액을 초기 금융자산의 연 인출률÷12로 제한합니다.</p>
      </div>

      {value.useFourPercentWithdrawalRule && (
        <div className="field-group">
          <label className="field-label">연간 인출 한도율</label>
          <div className="input-row">
            <input
              type="number"
              className="input-field"
              step={0.1}
              min={0.1}
              max={20}
              value={((value.annualWithdrawalLimitRate ?? 0.04) * 100).toFixed(1)}
              onChange={e =>
                update('annualWithdrawalLimitRate', Number(e.target.value) / 100)
              }
            />
            <span className="unit">%</span>
          </div>
          <p className="field-hint">기본값 4%. 초기 금융자산 기준 연간 최대 인출 비율입니다.</p>
        </div>
      )}

      <div className="field-group">
        <label className="field-label">연금 연간 한도 적용</label>
        <div className="toggle-row">
          <button
            type="button"
            className={`toggle-btn ${value.usePensionAnnualCapMode ? 'active' : ''}`}
            onClick={() => update('usePensionAnnualCapMode', true)}
          >
            적용
          </button>
          <button
            type="button"
            className={`toggle-btn ${!value.usePensionAnnualCapMode ? 'active' : ''}`}
            onClick={() => update('usePensionAnnualCapMode', false)}
          >
            미적용
          </button>
        </div>
        <p className="field-hint">연금 수령액에 연간 상한액을 설정합니다.</p>
      </div>

      {value.usePensionAnnualCapMode && (
        <div className="field-group">
          <label className="field-label">연금 연간 한도 금액</label>
          <div className="input-row">
            <input
              type="number"
              className="input-field"
              min={0}
              step={10}
              value={
                value.pensionAnnualCapAmount != null
                  ? (value.pensionAnnualCapAmount / 10000).toFixed(0)
                  : ''
              }
              onChange={e =>
                update(
                  'pensionAnnualCapAmount',
                  e.target.value === '' ? undefined : Number(e.target.value) * 10000,
                )
              }
            />
            <span className="unit">만원/년</span>
          </div>
        </div>
      )}
    </div>
  );
}
