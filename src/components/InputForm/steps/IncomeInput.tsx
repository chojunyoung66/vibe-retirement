import type { Income } from '../../../types';

type Props = {
  value: Income;
  onChange: (v: Income) => void;
};

type FieldDef = {
  key: keyof Income;
  label: string;
  hint?: string;
  isAge?: boolean;
};

const fields: FieldDef[] = [
  { key: 'nationalPension', label: '국민연금 예상액', hint: '모르면 0 입력' },
  { key: 'nationalPensionStartAge', label: '국민연금 수령 시작 나이', isAge: true },
  { key: 'retirementPension', label: '퇴직연금 (월 인출액)' },
  { key: 'privatePension', label: '개인연금 (월 인출액)' },
  { key: 'workIncome', label: '근로·사업소득' },
  { key: 'rentalIncome', label: '임대소득' },
  { key: 'financialIncome', label: '금융소득 (배당·이자)' },
  { key: 'otherIncome', label: '기타소득' },
];

export default function IncomeInput({ value, onChange }: Props) {
  const update = (k: keyof Income, v: number) => onChange({ ...value, [k]: v });

  return (
    <div className="step-section">
      <h2 className="step-title">은퇴 후 월 수입</h2>
      <p className="step-desc">은퇴 후 예상되는 월 수입원을 입력하세요. (단위: 만원/월)</p>

      {fields.map(f => (
        <div className="field-group" key={f.key}>
          <label className="field-label">{f.label}</label>
          <div className="input-row">
            <input
              type="number"
              className="input-field"
              min={0}
              placeholder={f.isAge ? '63' : '0'}
              value={
                f.isAge
                  ? value[f.key] || ''
                  : value[f.key]
                  ? (value[f.key] as number) / 10000
                  : ''
              }
              onChange={e =>
                update(f.key, f.isAge ? Number(e.target.value) : Number(e.target.value) * 10000)
              }
            />
            <span className="unit">{f.isAge ? '세' : '만원'}</span>
          </div>
          {f.hint && <p className="field-hint">{f.hint}</p>}
        </div>
      ))}
    </div>
  );
}
