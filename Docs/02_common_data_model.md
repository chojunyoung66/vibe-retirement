# 은퇴현금 서비스 공통 데이터 모델

## 1. 목적

F-01~F-14 기능은 서로 독립된 화면처럼 보이지만 실제로는 같은 사용자 재정 데이터를 공유합니다. 계산 오류와 중복 구현을 줄이기 위해 공통 데이터 모델을 먼저 정의합니다.

## 2. 금액/기간 기준

### 금액 단위

- 내부 저장 단위: 원
- 화면 표시 단위: 만원
- 입력창에서는 사용자가 이해하기 쉬운 만원 단위를 기본으로 사용
- 계산 함수에서는 원 단위로 변환 후 처리

### 기간 단위

- 현금흐름 계산 기본 단위: 월
- 세금/보험료/수익률 가정은 연 기준 입력 가능
- 연 기준 값은 월 기준으로 변환하여 계산

예시:

- 연 수익률 3% → 월 수익률 약 0.2466%
- 연 지출 120만원 → 월 지출 10만원

## 3. UserProfile

사용자의 기본 정보입니다.

```ts
export type UserProfile = {
  birthYear: number;
  retirementYear: number;
  retirementMonth: number;
  spouseBirthYear?: number;
  hasHouse?: boolean;
  region?: string;
};
```

## 4. RetirementGoal

은퇴 목표와 희망 생활 수준입니다.

```ts
export type RetirementGoal = {
  targetMonthlyLivingExpense: number;
  targetRetirementAge?: number;
  simulationYears: number;
  specialExpenses?: SpecialExpense[];
};
```

## 5. SpecialExpense

여행, 자녀 지원, 주택 수리 등 일회성 지출입니다.

```ts
export type SpecialExpense = {
  id: string;
  name: string;
  year: number;
  month?: number;
  amount: number;
};
```

## 6. Income

은퇴 후 수입 항목입니다.

```ts
export type Income = {
  id: string;
  type: 'national_pension' | 'retirement_pension' | 'personal_pension' | 'financial_income' | 'rental_income' | 'work_income' | 'other';
  name: string;
  monthlyAmount: number;
  startYear: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
  taxable?: boolean;
};
```

## 7. Expense

은퇴 후 지출 항목입니다.

```ts
export type Expense = {
  id: string;
  type: 'living' | 'housing' | 'medical' | 'health_insurance' | 'tax' | 'insurance' | 'transportation' | 'family_event' | 'other';
  name: string;
  monthlyAmount: number;
  startYear?: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
  inflationApplied?: boolean;
};
```

## 8. Asset

현재 보유 자산입니다.

```ts
export type Asset = {
  id: string;
  type: 'cash' | 'deposit' | 'stock' | 'fund' | 'etf' | 'real_estate' | 'retirement_pension' | 'personal_pension' | 'irp' | 'isa' | 'other';
  name: string;
  amount: number;
  expectedAnnualReturn?: number;
  liquidity?: 'high' | 'medium' | 'low';
};
```

## 9. Liability

부채 정보입니다.

```ts
export type Liability = {
  id: string;
  type: 'mortgage' | 'credit' | 'card' | 'other';
  name: string;
  balance: number;
  monthlyPayment?: number;
  interestRate?: number;
  endYear?: number;
  endMonth?: number;
};
```

## 10. Pension

연금성 자산 및 수령 계획입니다.

```ts
export type Pension = {
  id: string;
  type: 'national' | 'db' | 'dc' | 'irp' | 'personal_pension' | 'annuity_insurance';
  name: string;
  currentBalance?: number;
  expectedMonthlyBenefit?: number;
  startYear: number;
  startMonth?: number;
  endYear?: number;
  endMonth?: number;
};
```

## 11. ScenarioAssumption

시뮬레이션 가정값입니다.

```ts
export type ScenarioAssumption = {
  inflationRate: number;
  annualReturnRate: number;
  livingExpenseGrowthRate: number;
  medicalExpenseGrowthRate: number;
  simulationStartYear: number;
  simulationStartMonth: number;
  simulationYears: number;
};
```

## 12. MonthlyCashflowResult

월별 현금흐름 결과입니다.

```ts
export type MonthlyCashflowResult = {
  year: number;
  month: number;
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  beginningAssetBalance: number;
  endingAssetBalance: number;
  shortageAmount?: number;
};
```

## 13. DepletionResult

자산 고갈 예측 결과입니다.

```ts
export type DepletionResult = {
  isDepleted: boolean;
  depletionYear?: number;
  depletionMonth?: number;
  depletionAge?: number;
  finalAssetBalance: number;
};
```

## 14. 기능별 입력/출력 의존성

| 기능 | 주요 입력 | 주요 출력 |
|---|---|---|
| F-01 | UserProfile, RetirementGoal, Income, Expense, Asset, Liability | 사용자 재정 데이터 |
| F-02 | UserProfile, Income, Asset | 건강보험료 추정치 |
| F-03 | UserProfile, RetirementGoal | ISA 가이드 |
| F-04 | Income, Asset, ScenarioAssumption | ISA 절세 효과 |
| F-05 | Pension, Asset | 퇴직연금 분석 |
| F-06 | Pension, Asset | 개인연금 분석 |
| F-07 | Asset, 투자 성향 결과 | 포트폴리오 제안 |
| F-08 | 설문 답변 | 투자 성향 결과 |
| F-09 | Income, Expense, Asset, ScenarioAssumption | 월별 현금흐름 |
| F-10 | MonthlyCashflowResult | 자산 고갈 시점 |
| F-11 | F-01~F-10 결과 | 대시보드 요약 |
| F-12 | UserProfile, 상담 목적 | 상담 신청 정보 |
| F-13 | 콘텐츠 데이터 | 최신 정보 카드 |
| F-14 | 목표/일정/체크리스트 | 진행률/알림 |

## 15. 공통 고지문 데이터

```ts
export type Disclaimer = {
  category: 'tax' | 'health_insurance' | 'investment' | 'general';
  message: string;
  referenceDate: string;
  source?: string;
};
```

## 16. 구현 원칙

1. 계산 함수는 화면 컴포넌트와 분리한다.
2. 입력값은 반드시 숫자 검증을 거친다.
3. 음수 입력은 원칙적으로 차단하되, 순현금흐름 결과는 음수가 가능하다.
4. 모든 계산 결과에는 기준일과 가정값을 함께 표시한다.
5. 금융/세무/건강보험료 관련 결과에는 고지문을 표시한다.
