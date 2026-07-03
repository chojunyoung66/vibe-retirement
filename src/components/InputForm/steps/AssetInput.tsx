import type { Asset, Liability } from '../../../types';

type Props = {
  asset: Asset;
  liability: Liability;
  onAssetChange: (v: Asset) => void;
  onLiabilityChange: (v: Liability) => void;
};

export default function AssetInput({ asset, liability, onAssetChange, onLiabilityChange }: Props) {
  const updateAsset = <K extends keyof Asset>(k: K, v: number) =>
    onAssetChange({ ...asset, [k]: v });
  const updateLiability = <K extends keyof Liability>(k: K, v: number) =>
    onLiabilityChange({ ...liability, [k]: v });

  const assetFields: { key: keyof Asset; label: string; hint?: string }[] = [
    { key: 'cashAsset', label: '현금성 자산', hint: '예금, 적금, CMA 등' },
    { key: 'financialAsset', label: '금융자산', hint: '주식, 펀드, ETF 등' },
    { key: 'realEstate', label: '부동산 (시가)', hint: '주택 포함 부동산 총액' },
    { key: 'pensionAccount', label: '연금계좌', hint: 'IRP + 연금저축 잔액' },
    { key: 'otherAsset', label: '기타 자산' },
  ];

  return (
    <div className="step-section">
      <h2 className="step-title">자산과 부채</h2>
      <p className="step-desc">현재 보유 자산과 부채를 입력하세요. (단위: 만원)</p>

      <div className="subsection">
        <h3 className="subsection-title">자산</h3>
        {assetFields.map(f => (
          <div className="field-group" key={f.key}>
            <label className="field-label">{f.label}</label>
            <div className="input-row">
              <input
                type="number"
                className="input-field"
                min={0}
                placeholder="0"
                value={asset[f.key] ? asset[f.key] / 10000 : ''}
                onChange={e => updateAsset(f.key, Number(e.target.value) * 10000)}
              />
              <span className="unit">만원</span>
            </div>
            {f.hint && <p className="field-hint">{f.hint}</p>}
          </div>
        ))}
      </div>

      <div className="subsection">
        <h3 className="subsection-title">부채</h3>
        <div className="field-group">
          <label className="field-label">대출 잔액</label>
          <div className="input-row">
            <input
              type="number"
              className="input-field"
              min={0}
              placeholder="0"
              value={liability.loanBalance ? liability.loanBalance / 10000 : ''}
              onChange={e => updateLiability('loanBalance', Number(e.target.value) * 10000)}
            />
            <span className="unit">만원</span>
          </div>
        </div>
        <div className="field-group">
          <label className="field-label">월 상환액</label>
          <div className="input-row">
            <input
              type="number"
              className="input-field"
              min={0}
              placeholder="0"
              value={liability.monthlyRepayment ? liability.monthlyRepayment / 10000 : ''}
              onChange={e =>
                updateLiability('monthlyRepayment', Number(e.target.value) * 10000)
              }
            />
            <span className="unit">만원/월</span>
          </div>
        </div>
        <div className="field-group">
          <label className="field-label">상환 종료 연도</label>
          <div className="input-row">
            <input
              type="number"
              className="input-field"
              min={2024}
              max={2080}
              placeholder="2030"
              value={liability.repaymentEndYear || ''}
              onChange={e => updateLiability('repaymentEndYear', Number(e.target.value))}
            />
            <span className="unit">년</span>
          </div>
        </div>
      </div>
    </div>
  );
}
