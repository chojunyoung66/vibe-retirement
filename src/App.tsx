import { useState } from 'react';
import type { UserInput, ReportSummary, ScenarioResult } from './types';
import InputForm from './components/InputForm/InputForm';
import SummaryReport from './components/Report/SummaryReport';
import SaveLoadDialog from './components/SaveLoad/SaveLoadDialog';
import { runScenarios, analyzeDepletion } from './engine/depletion';
import { estimateHealthInsurance } from './engine/healthInsurance';
import { hasSavedData } from './storage/localStore';
import './App.css';

type Screen = 'home' | 'form' | 'report';
type DialogMode = 'save' | 'load' | null;

function buildSummary(input: UserInput, scenarios: ScenarioResult[]): ReportSummary {
  const base = scenarios[0];
  const firstMonth = base?.cashflows[0];

  const hiEstimate = estimateHealthInsurance(
    input.income,
    input.asset,
    input.scenario,
    input.healthInsurance,
    input.scenario.simulationStartYear,
    input.scenario.simulationStartMonth,
  );

  const totalExpense =
    input.expense.livingExpense +
    input.expense.housingExpense +
    input.expense.medicalExpense +
    input.expense.insuranceExpense +
    input.expense.taxLikeExpense +
    hiEstimate.monthlyPremium +
    input.liability.monthlyRepayment +
    input.expense.otherFixedExpense;

  const initialAsset =
    input.asset.cashAsset +
    input.asset.financialAsset +
    input.asset.pensionAccount +
    input.asset.otherAsset;

  const depletion = analyzeDepletion(base?.cashflows ?? [], initialAsset);

  const targetRetirementAsset =
    input.goal.monthlyLivingExpense * input.scenario.simulationYears * 12;
  const goalAchievementRate =
    targetRetirementAsset > 0
      ? Math.min(1.5, Math.max(0, initialAsset / targetRetirementAsset))
      : undefined;

  const warnings: string[] = [...hiEstimate.warnings];

  if (firstMonth && firstMonth.monthlyNetCashflow < 0) {
    warnings.push(
      `은퇴 첫 달부터 월 ${Math.abs(firstMonth.monthlyNetCashflow / 10000).toFixed(0)}만원 적자입니다.`,
    );
  }

  if (depletion.status === 'depleted') {
    warnings.push(`${depletion.depletionAge}세경 자산이 고갈될 것으로 예상됩니다.`);
  }

  if (input.scenario.useFourPercentWithdrawalRule) {
    const rate = input.scenario.annualWithdrawalLimitRate ?? 0.04;
    warnings.push(
      `4% 인출 규칙이 적용됩니다. 월 인출액이 초기 금융자산의 ${(rate * 100).toFixed(0)}%÷12로 제한됩니다.`,
    );
  }

  return {
    monthlyNetCashflow: firstMonth?.monthlyNetCashflow ?? 0,
    estimatedDepletionAge: depletion.depletionAge,
    totalMonthlyFixedExpense: totalExpense,
    estimatedHealthInsurancePremium: hiEstimate.monthlyPremium,
    depletionStatus: depletion.status,
    warnings,
    goalAchievementRate,
    targetRetirementAsset: targetRetirementAsset > 0 ? targetRetirementAsset : undefined,
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [scenarios, setScenarios] = useState<ScenarioResult[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [dialog, setDialog] = useState<DialogMode>(null);

  const handleFormSubmit = (input: UserInput) => {
    const sc = runScenarios(input);
    const sm = buildSummary(input, sc);
    setUserInput(input);
    setScenarios(sc);
    setSummary(sm);
    setScreen('report');
    window.scrollTo(0, 0);
  };

  const handleLoad = (data: UserInput) => {
    setUserInput(data);
    setScreen('form');
  };

  return (
    <div className="app">
      {screen === 'home' && (
        <div className="home-screen">
          <div className="home-content">
            <div className="home-badge">은퇴 현금흐름 시뮬레이터</div>
            <h1 className="home-title">
              은퇴 후 매달<br />얼마가 남을까요?
            </h1>
            <p className="home-desc">
              은퇴 후 월별 현금흐름, 건강보험료, 자산 고갈 시점을
              <br />한 번에 점검하는 참고용 리포트를 생성합니다.
            </p>
            <div className="home-features">
              {[
                '월 순현금흐름 계산',
                '건강보험료 추정',
                '자산 고갈 시점 예측',
                '4가지 시나리오 비교',
                'PDF 리포트 저장',
              ].map(f => (
                <div key={f} className="feature-chip">✓ {f}</div>
              ))}
            </div>
            <div className="home-actions">
              <button
                type="button"
                className="btn-primary btn-large"
                onClick={() => setScreen('form')}
              >
                무료로 시작하기
              </button>
              {hasSavedData() && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setDialog('load')}
                >
                  저장된 데이터 불러오기
                </button>
              )}
            </div>
            <p className="home-disclaimer">
              이 서비스는 참고용 시뮬레이션이며 전문 세무·보험 서비스가 아닙니다.
            </p>
          </div>
        </div>
      )}

      {screen === 'form' && (
        <InputForm
          onSubmit={handleFormSubmit}
          initialData={userInput ?? undefined}
        />
      )}

      {screen === 'report' && summary && userInput && (
        <SummaryReport
          summary={summary}
          scenarios={scenarios}
          input={userInput}
          onEdit={() => setScreen('form')}
          onSave={() => setDialog('save')}
          onPrint={() => window.print()}
        />
      )}

      {dialog && (
        <SaveLoadDialog
          mode={dialog}
          currentData={userInput ?? undefined}
          onLoad={handleLoad}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
