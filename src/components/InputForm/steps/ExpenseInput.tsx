import type { Expense } from '../../../types';

type Props = {
  value: Expense;
  onChange: (v: Expense) => void;
};

const fields: { key: keyof Expense; label: string; hint?: string }[] = [
  { key: 'livingExpense', label: '생활비', hint: '식비, 교통, 의류 등' },
  { key: 'housingExpense', label: '주거비', hint: '관리비, 임차료 등' },
  { key: 'medicalExpense', label: '의료비', hint: '병원, 약값 등' },
  { key: 'insuranceExpense', label: '보험료', hint: '민간 보험료 합계' },
  { key: 'taxLikeExpense', label: '세금성 지출', hint: '재산세, 종부세 등' },
  { key: 'otherFixedExpense', label: '기타 고정지출' },
];

export default function ExpenseInput({ value, onChange }: Props) {
  const update = (k: keyof Expense, v: number) => onChange({ ...value, [k]: v });

  const total = Object.values(value).reduce((s, v) => s + v, 0);

  return (
    <div className="step-section">
      <h2 className="step-title">월 지출</h2>
      <p className="step-desc">
        은퇴 후 예상 월 지출을 입력하세요. 건강보험료는 자동 추정됩니다. (단위: 만원/월)
      </p>

      {fields.map(f => (
        <div className="field-group" key={f.key}>
          <label className="field-label">{f.label}</label>
          <div className="input-row">
            <input
              type="number"
              className="input-field"
              min={0}
              placeholder="0"
              value={value[f.key] ? value[f.key] / 10000 : ''}
              onChange={e => update(f.key, Number(e.target.value) * 10000)}
            />
            <span className="unit">만원</span>
          </div>
          {f.hint && <p className="field-hint">{f.hint}</p>}
        </div>
      ))}

      <div className="total-row">
        <span>월 고정지출 합계</span>
        <span className="total-value">{(total / 10000).toFixed(0)}만원</span>
      </div>
    </div>
  );
}
