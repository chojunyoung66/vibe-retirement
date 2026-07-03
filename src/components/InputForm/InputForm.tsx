import { useState } from 'react';
import type { UserInput } from '../../types';
import { DEFAULT_HEALTH_INSURANCE_ASSUMPTION, DEFAULT_SCENARIO } from '../../types';
import BasicInfo from './steps/BasicInfo';
import RetirementGoalStep from './steps/RetirementGoalStep';
import IncomeInput from './steps/IncomeInput';
import AssetInput from './steps/AssetInput';
import ExpenseInput from './steps/ExpenseInput';
import ScenarioInput from './steps/ScenarioInput';

const DEFAULT_INPUT: UserInput = {
  profile: {
    currentAge: 55,
    retirementAge: 60,
    hasSpouse: true,
    ownsHome: true,
  },
  goal: {
    monthlyLivingExpense: 3_000_000,
    simulationYears: 30,
    lifestyleLevel: 'standard',
  },
  income: {
    nationalPension: 900_000,
    nationalPensionStartAge: 63,
    retirementPension: 500_000,
    privatePension: 0,
    workIncome: 0,
    rentalIncome: 0,
    financialIncome: 0,
    otherIncome: 0,
  },
  expense: {
    livingExpense: 2_000_000,
    housingExpense: 300_000,
    medicalExpense: 200_000,
    insuranceExpense: 200_000,
    taxLikeExpense: 100_000,
    otherFixedExpense: 200_000,
  },
  asset: {
    cashAsset: 50_000_000,
    financialAsset: 100_000_000,
    realEstate: 500_000_000,
    pensionAccount: 50_000_000,
    otherAsset: 0,
  },
  liability: {
    loanBalance: 0,
    monthlyRepayment: 0,
    repaymentEndYear: 0,
  },
  scenario: DEFAULT_SCENARIO,
  healthInsurance: DEFAULT_HEALTH_INSURANCE_ASSUMPTION,
};

const STEP_LABELS = ['기본 정보', '은퇴 목표', '월 수입', '자산·부채', '월 지출', '시나리오'];

type Props = {
  onSubmit: (input: UserInput) => void;
  initialData?: UserInput;
};

export default function InputForm({ onSubmit, initialData }: Props) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<UserInput>(initialData ?? DEFAULT_INPUT);

  const prev = () => setStep(s => Math.max(0, s - 1));

  const next = () => {
    if (step < STEP_LABELS.length - 1) {
      setStep(s => s + 1);
      return;
    }
    if (data.profile.retirementAge <= data.profile.currentAge) {
      alert('은퇴 예정 나이는 현재 나이보다 커야 합니다.');
      setStep(0);
      return;
    }
    if (data.goal.simulationYears < 1) {
      alert('시뮬레이션 기간은 1년 이상이어야 합니다.');
      setStep(1);
      return;
    }
    onSubmit(data);
  };

  const progress = ((step + 1) / STEP_LABELS.length) * 100;

  return (
    <div className="form-container">
      <div className="progress-bar-wrap">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="step-indicator">
        {step + 1} / {STEP_LABELS.length} — {STEP_LABELS[step]}
      </div>

      {step === 0 && (
        <BasicInfo value={data.profile} onChange={v => setData(d => ({ ...d, profile: v }))} />
      )}
      {step === 1 && (
        <RetirementGoalStep value={data.goal} onChange={v => setData(d => ({ ...d, goal: v }))} />
      )}
      {step === 2 && (
        <IncomeInput value={data.income} onChange={v => setData(d => ({ ...d, income: v }))} />
      )}
      {step === 3 && (
        <AssetInput
          asset={data.asset}
          liability={data.liability}
          onAssetChange={v => setData(d => ({ ...d, asset: v }))}
          onLiabilityChange={v => setData(d => ({ ...d, liability: v }))}
        />
      )}
      {step === 4 && (
        <ExpenseInput
          value={data.expense}
          onChange={v => setData(d => ({ ...d, expense: v }))}
        />
      )}
      {step === 5 && (
        <ScenarioInput
          value={data.scenario}
          onChange={v => setData(d => ({ ...d, scenario: v }))}
        />
      )}

      <div className="nav-buttons">
        {step > 0 && (
          <button type="button" className="btn-secondary" onClick={prev}>
            이전
          </button>
        )}
        <button type="button" className="btn-primary" onClick={next}>
          {step === STEP_LABELS.length - 1 ? '리포트 생성' : '다음'}
        </button>
      </div>
    </div>
  );
}
