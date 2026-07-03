import type { UserProfile } from '../../../types';

type Props = {
  value: UserProfile;
  onChange: (v: UserProfile) => void;
};

export default function BasicInfo({ value, onChange }: Props) {
  const update = <K extends keyof UserProfile>(k: K, v: UserProfile[K]) =>
    onChange({ ...value, [k]: v });

  return (
    <div className="step-section">
      <h2 className="step-title">기본 정보</h2>
      <p className="step-desc">현재 나이와 은퇴 계획을 입력하세요.</p>

      <div className="field-group">
        <label className="field-label">현재 나이</label>
        <div className="input-row">
          <input
            type="number"
            className="input-field"
            min={20}
            max={80}
            value={value.currentAge || ''}
            onChange={e => update('currentAge', Number(e.target.value))}
          />
          <span className="unit">세</span>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">은퇴 예정 나이</label>
        <div className="input-row">
          <input
            type="number"
            className="input-field"
            min={40}
            max={80}
            value={value.retirementAge || ''}
            onChange={e => update('retirementAge', Number(e.target.value))}
          />
          <span className="unit">세</span>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">배우자 여부</label>
        <div className="toggle-row">
          <button
            type="button"
            className={`toggle-btn ${value.hasSpouse ? 'active' : ''}`}
            onClick={() => update('hasSpouse', true)}
          >
            있음
          </button>
          <button
            type="button"
            className={`toggle-btn ${!value.hasSpouse ? 'active' : ''}`}
            onClick={() => update('hasSpouse', false)}
          >
            없음
          </button>
        </div>
      </div>

      <div className="field-group">
        <label className="field-label">주택 보유 여부</label>
        <div className="toggle-row">
          <button
            type="button"
            className={`toggle-btn ${value.ownsHome ? 'active' : ''}`}
            onClick={() => update('ownsHome', true)}
          >
            있음
          </button>
          <button
            type="button"
            className={`toggle-btn ${!value.ownsHome ? 'active' : ''}`}
            onClick={() => update('ownsHome', false)}
          >
            없음
          </button>
        </div>
      </div>
    </div>
  );
}
