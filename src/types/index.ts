export type UserProfile = {
  currentAge: number;
  retirementAge: number;
  hasSpouse: boolean;
  ownsHome: boolean;
};

export type RetirementGoal = {
  monthlyLivingExpense: number;
  simulationYears: number;
  lifestyleLevel: 'minimal' | 'standard' | 'comfortable';
};

export type Income = {
  nationalPension: number;
  nationalPensionStartAge: number;
  retirementPension: number;
  privatePension: number;
  workIncome: number;
  rentalIncome: number;
  financialIncome: number;
  otherIncome: number;
};

export type Expense = {
  livingExpense: number;
  housingExpense: number;
  medicalExpense: number;
  insuranceExpense: number;
  taxLikeExpense: number;
  otherFixedExpense: number;
};

export type Asset = {
  cashAsset: number;
  financialAsset: number;
  realEstate: number;
  pensionAccount: number;
  otherAsset: number;
};

export type Liability = {
  loanBalance: number;
  monthlyRepayment: number;
  repaymentEndYear: number;
};

export type ScenarioAssumption = {
  inflationRate: number;
  annualReturnRate: number;
  livingExpenseGrowthRate: number;
  medicalExpenseGrowthRate: number;
  simulationStartYear: number;
  simulationStartMonth: number;
  simulationYears: number;
  useFourPercentWithdrawalRule: boolean;
  annualWithdrawalLimitRate?: number;
  maintainHealthInsuranceDependentStatus: boolean;
  dependentStatusLossYear?: number;
  dependentStatusLossMonth?: number;
  usePensionAnnualCapMode: boolean;
  pensionAnnualCapAmount?: number;
};

export type HealthInsuranceAssumption = {
  pensionIncomeReflectionRate: number;
  propertyBasicDeduction: number;
  regionalPointValue: number;
  employeeHealthInsuranceRate: number;
  displayHealthInsuranceRate: number;
  longTermCareRateToHealthPremium: number;
  simplifiedPropertyPointConversionRate: number;
};

export type HealthInsuranceStatus = 'dependent' | 'regional' | 'employee' | 'unknown';

export type HealthInsuranceEstimate = {
  status: HealthInsuranceStatus;
  monthlyPremium: number;
  includesLongTermCarePremium: boolean;
  isUserProvidedPremium: boolean;
  isEstimate: boolean;
  dependentStatusMaintained?: boolean;
  regionalConversionRisk: 'low' | 'medium' | 'high' | 'unknown';
  appliedFromYear: number;
  appliedFromMonth: number;
  assumptions: string[];
  warnings: string[];
  disclaimer: string;
};

export type MonthlyCashflowResult = {
  year: number;
  month: number;
  age: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlyNetCashflow: number;
  beginningAssetBalance: number;
  endingAssetBalance: number;
  healthInsurancePremium: number;
};

export type AssetDepletionStatus = 'stable' | 'watch' | 'risk' | 'depleted' | 'unknown';

export type AssetDepletionResult = {
  status: AssetDepletionStatus;
  depletionAge?: number;
  depletionYear?: number;
  depletionMonth?: number;
  warningAge?: number;
  initialAsset: number;
};

export type ReportSummary = {
  monthlyNetCashflow: number;
  estimatedDepletionAge?: number;
  totalMonthlyFixedExpense: number;
  estimatedHealthInsurancePremium: number;
  adjustmentEffect?: number;
  depletionStatus: AssetDepletionStatus;
  warnings: string[];
};

export type ScenarioResult = {
  label: string;
  cashflows: MonthlyCashflowResult[];
  depletion: AssetDepletionResult;
};

export type UserInput = {
  profile: UserProfile;
  goal: RetirementGoal;
  income: Income;
  expense: Expense;
  asset: Asset;
  liability: Liability;
  scenario: ScenarioAssumption;
  healthInsurance: HealthInsuranceAssumption;
};

export const DEFAULT_HEALTH_INSURANCE_ASSUMPTION: HealthInsuranceAssumption = {
  pensionIncomeReflectionRate: 0.5,
  propertyBasicDeduction: 100_000_000,
  regionalPointValue: 211.5,
  employeeHealthInsuranceRate: 0.0719,
  displayHealthInsuranceRate: 0.072,
  longTermCareRateToHealthPremium: 0.131,
  simplifiedPropertyPointConversionRate: 0.000004847,
};

export const DEFAULT_SCENARIO: ScenarioAssumption = {
  inflationRate: 0.025,
  annualReturnRate: 0.04,
  livingExpenseGrowthRate: 0.025,
  medicalExpenseGrowthRate: 0.04,
  simulationStartYear: new Date().getFullYear(),
  simulationStartMonth: new Date().getMonth() + 1,
  simulationYears: 30,
  useFourPercentWithdrawalRule: false,
  maintainHealthInsuranceDependentStatus: true,
  usePensionAnnualCapMode: false,
};
