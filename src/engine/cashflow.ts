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

  let startYear = scenario.simulationStartYear;
  let startMonth = scenario.simulationStartMonth;

  for (let i = 0; i < totalMonths; i++) {
    const year = startYear + Math.floor((startMonth - 1 + i) / 12);
    const month = ((startMonth - 1 + i) % 12) + 1;
    const yearsElapsed = i / 12;
    const age = profile.currentAge + yearsElapsed;

    const growthFactor = Math.pow(1 + scenario.livingExpenseGrowthRate, yearsElapsed);
    const medicalGrowthFactor = Math.pow(1 + scenario.medicalExpenseGrowthRate, yearsElapsed);

    const nationalPensionActive = age >= profile.retirementAge + (income.nationalPensionStartAge - profile.retirementAge);
    const nationalPensionIncome = nationalPensionActive ? income.nationalPension : 0;

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
    const endingBalance = beginningBalance + monthlyNetCashflow + monthlyReturn;

    currentFinancialAsset = Math.max(endingBalance, 0);

    results.push({
      year,
      month,
      age: Math.floor(age),
      monthlyIncome,
      monthlyExpense,
      monthlyNetCashflow,
      beginningAssetBalance: beginningBalance,
      endingAssetBalance: endingBalance,
      healthInsurancePremium: hiPremium,
    });
  }

  return results;
}
