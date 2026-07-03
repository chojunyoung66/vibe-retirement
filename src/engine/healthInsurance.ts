import type {
  HealthInsuranceAssumption,
  HealthInsuranceEstimate,
  Income,
  Asset,
  ScenarioAssumption,
} from '../types';

export function estimateHealthInsurance(
  income: Income,
  asset: Asset,
  scenario: ScenarioAssumption,
  assumption: HealthInsuranceAssumption,
  year: number,
  month: number,
): HealthInsuranceEstimate {
  const base: Pick<HealthInsuranceEstimate, 'isUserProvidedPremium' | 'isEstimate' | 'appliedFromYear' | 'appliedFromMonth' | 'includesLongTermCarePremium'> = {
    isUserProvidedPremium: false,
    isEstimate: true,
    appliedFromYear: year,
    appliedFromMonth: month,
    includesLongTermCarePremium: true,
  };

  const disclaimer =
    '이 수치는 2026년 기준 간이 추정값입니다. 실제 보험료는 국민건강보험공단 기준에 따라 달라질 수 있습니다.';

  const totalPensionIncome =
    (income.nationalPension + income.retirementPension + income.privatePension) * 12;
  const financialIncome = income.financialIncome * 12;

  if (scenario.maintainHealthInsuranceDependentStatus) {
    const warnings: string[] = [];
    let risk: 'low' | 'medium' | 'high' = 'low';

    if (totalPensionIncome > 36_000_000) {
      warnings.push('연간 연금소득이 3,600만원을 초과해 피부양자 조건 상실 위험이 있습니다.');
      risk = 'high';
    } else if (totalPensionIncome > 20_000_000) {
      warnings.push('연간 연금소득이 2,000만원을 초과합니다. 피부양자 조건을 재확인하세요.');
      risk = 'medium';
    }

    if (financialIncome > 10_000_000) {
      warnings.push('금융소득이 연 1,000만원을 초과합니다. 피부양자 조건을 재확인하세요.');
      if (risk === 'low') risk = 'medium';
    }

    if (asset.realEstate > 900_000_000) {
      warnings.push('부동산 재산이 9억원을 초과합니다. 피부양자 조건 상실 위험이 있습니다.');
      risk = 'high';
    }

    return {
      ...base,
      status: 'dependent',
      monthlyPremium: 0,
      dependentStatusMaintained: true,
      regionalConversionRisk: risk,
      assumptions: ['피부양자 유지 조건 가정'],
      warnings,
      disclaimer,
    };
  }

  const monthlyPensionIncome =
    income.nationalPension + income.retirementPension + income.privatePension;
  const pensionIncomeBase = monthlyPensionIncome * assumption.pensionIncomeReflectionRate;
  const pensionPremium = pensionIncomeBase * assumption.employeeHealthInsuranceRate;

  const realEstateAfterDeduction = Math.max(
    asset.realEstate - assumption.propertyBasicDeduction,
    0,
  );
  const propertyPoints =
    realEstateAfterDeduction * assumption.simplifiedPropertyPointConversionRate;
  const propertyPremium = propertyPoints * assumption.regionalPointValue;

  const healthPremium = pensionPremium + propertyPremium;
  const totalPremium = healthPremium * (1 + assumption.longTermCareRateToHealthPremium);

  const lossDependentWarnings: string[] = [
    '지역가입자 전환 가정으로 건강보험료가 산정됩니다.',
    '연금소득의 50%를 소득월액으로 반영합니다.',
  ];

  if (asset.realEstate > 0) {
    lossDependentWarnings.push('부동산 재산은 1억원 기본공제 후 간이 점수 환산을 적용합니다.');
  }

  return {
    ...base,
    status: 'regional',
    monthlyPremium: Math.round(totalPremium),
    dependentStatusMaintained: false,
    regionalConversionRisk: 'unknown',
    assumptions: [
      `연금소득 반영률 ${assumption.pensionIncomeReflectionRate * 100}%`,
      `재산 기본공제 ${(assumption.propertyBasicDeduction / 10000).toFixed(0)}만원`,
      `지역 점수당 금액 ${assumption.regionalPointValue}원/점`,
      `장기요양보험료 ${assumption.longTermCareRateToHealthPremium * 100}%`,
    ],
    warnings: lossDependentWarnings,
    disclaimer,
  };
}
