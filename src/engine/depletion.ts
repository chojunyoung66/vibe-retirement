import type {
  UserInput,
  MonthlyCashflowResult,
  AssetDepletionResult,
  ScenarioResult,
} from '../types';
import { calculateMonthlyCashflows } from './cashflow';

export function analyzeDepletion(
  cashflows: MonthlyCashflowResult[],
  initialAsset: number,
): AssetDepletionResult {
  const warningThreshold = initialAsset * 0.2;

  let depletionEntry: MonthlyCashflowResult | undefined;
  let warningEntry: MonthlyCashflowResult | undefined;

  for (const row of cashflows) {
    if (!warningEntry && row.endingAssetBalance <= warningThreshold && initialAsset > 0) {
      warningEntry = row;
    }
    if (!depletionEntry && row.endingAssetBalance <= 0) {
      depletionEntry = row;
      break;
    }
  }

  if (depletionEntry) {
    return {
      status: 'depleted',
      depletionAge: depletionEntry.age,
      depletionYear: depletionEntry.year,
      depletionMonth: depletionEntry.month,
      warningAge: warningEntry?.age,
      initialAsset,
    };
  }

  if (warningEntry) {
    return {
      status: 'risk',
      warningAge: warningEntry.age,
      initialAsset,
    };
  }

  const lastBalance = cashflows[cashflows.length - 1]?.endingAssetBalance ?? 0;
  if (lastBalance <= warningThreshold * 2) {
    return { status: 'watch', initialAsset };
  }

  return { status: 'stable', initialAsset };
}

export function runScenarios(input: UserInput): ScenarioResult[] {
  const initialAsset =
    input.asset.cashAsset +
    input.asset.financialAsset +
    input.asset.pensionAccount +
    input.asset.otherAsset;

  const baseFlows = calculateMonthlyCashflows(input);

  const scenarios: ScenarioResult[] = [
    {
      label: '기본 시나리오',
      cashflows: baseFlows,
      depletion: analyzeDepletion(baseFlows, initialAsset),
    },
  ];

  const highExpenseInput: UserInput = {
    ...input,
    expense: {
      ...input.expense,
      livingExpense: input.expense.livingExpense * 1.1,
    },
    scenario: { ...input.scenario },
  };
  const highExpenseFlows = calculateMonthlyCashflows(highExpenseInput);
  scenarios.push({
    label: '생활비 10% 증가',
    cashflows: highExpenseFlows,
    depletion: analyzeDepletion(highExpenseFlows, initialAsset),
  });

  const lowReturnInput: UserInput = {
    ...input,
    scenario: {
      ...input.scenario,
      annualReturnRate: Math.max(input.scenario.annualReturnRate - 0.02, 0),
    },
  };
  const lowReturnFlows = calculateMonthlyCashflows(lowReturnInput);
  scenarios.push({
    label: '수익률 2% 하락',
    cashflows: lowReturnFlows,
    depletion: analyzeDepletion(lowReturnFlows, initialAsset),
  });

  const highMedicalInput: UserInput = {
    ...input,
    expense: {
      ...input.expense,
      medicalExpense: input.expense.medicalExpense * 1.2,
    },
    scenario: { ...input.scenario },
  };
  const highMedicalFlows = calculateMonthlyCashflows(highMedicalInput);
  scenarios.push({
    label: '의료비 20% 증가',
    cashflows: highMedicalFlows,
    depletion: analyzeDepletion(highMedicalFlows, initialAsset),
  });

  return scenarios;
}
