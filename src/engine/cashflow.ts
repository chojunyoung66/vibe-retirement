import type {
  UserInput,
  MonthlyCashflowResult,
} from '../types';
import { estimateHealthInsurance } from './healthInsurance';

export function calculateMonthlyCashflows(input: UserInput): MonthlyCashflowResult[] {
  const {
    profile,
    income,
    expense,
    asset,
    liability,
    scenario,
    healthInsurance: hiAssumption,
  } = input;

  const results: MonthlyCashflowResult[] = [];
  const totalMonths = scenario.simulationYears * 12;

  let currentFinancialAsset =
    asset.cashAsset + asset.financialAsset + asset.pensionAccount + asset.otherAsset;

  const initialFinancialAsset = currentFinancialAsset;

  const startYear = scenario.simulationStartYear;
  const startMonth = scenario.simulationStartMonth;

  for (let i = 0; i < totalMonths; i++) {
    const year = startYear + Math.floor((startMonth - 1 + i) / 12);
    const month = ((startMonth - 1 + i) % 12) + 1;
    const yearsElapsed = i / 12;
    // 시뮬레이션은 은퇴 시점부터 시작 — 모든 수입·지출은 은퇴 후 값을 기준으로 입력
    const age = profile.retirementAge + yearsElapsed;

    const growthFactor = Math.pow(1 + scenario.livingExpenseGrowthRate, yearsElapsed);
    const medicalGrowthFactor = Math.pow(1 + scenario.medicalExpenseGrowthRate, yearsElapsed);

    const nationalPensionIncome =
      age >= income.nationalPensionStartAge ? income.nationalPension : 0;

    const monthlyIncome =
      nationalPensionIncome +
      income.retirementPension +
      income.privatePension +
      income.workIncome +
      income.rentalIncome +
      income.financialIncome +
      income.otherIncome;

    const hiEstimate = estimateHealthInsurance(
      income,
      asset,
      scenario,
      hiAssumption,
      year,
      month,
    );
    const hiPremium = hiEstimate.monthlyPremium;

    const repaymentActive = liability.repaymentEndYear > 0 && year <= liability.repaymentEndYear;
    const loanRepayment = repaymentActive ? liability.monthlyRepayment : 0;

    const monthlyExpense =
      expense.livingExpense * growthFactor +
      expense.housingExpense * growthFactor +
      expense.medicalExpense * medicalGrowthFactor +
      expense.insuranceExpense +
      expense.taxLikeExpense +
      hiPremium +
      loanRepayment +
      expense.otherFixedExpense * growthFactor;

    const monthlyNetCashflow = monthlyIncome - monthlyExpense;

    const monthlyReturnRate = Math.pow(1 + scenario.annualReturnRate, 1 / 12) - 1;
    const monthlyReturn = currentFinancialAsset * monthlyReturnRate;

    const beginningBalance = currentFinancialAsset;

    let assetDrawdown: number;
    if (scenario.useFourPercentWithdrawalRule && monthlyNetCashflow < 0) {
      const rate = scenario.annualWithdrawalLimitRate ?? 0.04;
      assetDrawdown = -Math.min(Math.abs(monthlyNetCashflow), initialFinancialAsset * rate / 12);
    } else {
      assetDrawdown = monthlyNetCashflow;
    }

    const endingBalance = Math.max(0, beginningBalance + assetDrawdown + monthlyReturn);
    currentFinancialAsset = endingBalance;

    results.push({
      year,
      month,
      age: Math.floor(age),
      monthlyIncome,
      monthlyExpense,
      monthlyNetCashflow,
      assetDrawdown,
      beginningAssetBalance: beginningBalance,
      endingAssetBalance: endingBalance,
      healthInsurancePremium: hiPremium,
    });
  }

  return results;
}
