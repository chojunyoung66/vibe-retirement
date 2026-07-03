# 은퇴현금 설계센터 MVP 제품 스펙 v1

작성일: 2026-07-03  
상태: v1 초안  
대상: Founder, PM, Research, UX, Engineer, Marketing

## 1. Summary

은퇴현금 설계센터의 첫 MVP는 40~60대 은퇴 예정자가 은퇴 후 월별 현금흐름, 건강보험료, 세금성 지출, 자산 고갈 가능성을 한 번에 이해하도록 돕는 은퇴 현금흐름 리포트 생성 서비스다.

첫 MVP는 정확한 세무·보험 계산 서비스가 아니라, 입력값과 가정에 기반해 은퇴 현금흐름 리스크를 빠르게 점검하는 참고용 시뮬레이션 리포트로 정의한다.

모바일에서는 요약 판단을 먼저 보여주고, 상세 내용은 PDF로 저장해 본인 검토, 가족 공유, 상담 전 준비자료로 활용할 수 있게 한다.

## 2. MVP Scope

### 포함 기능

- F-01 은퇴 목표 및 현재 재정 상태 입력
- F-02 건강보험료 예상 시뮬레이션
- F-09 은퇴 후 월별 현금흐름 시뮬레이션
- F-10 은퇴 자산 고갈 시점 예측
- F-11 은퇴 계획 진행 상황 대시보드
- 모바일 요약 리포트
- PDF 상세 리포트
- 로컬 저장/불러오기

### 제외 범위

- 금융기관 연동
- 정확 세액 계산
- 실시간 건강보험공단 산식 연동
- ETF 추천
- 전문가 자동 매칭
- 서버 계정 저장

## 3. 리포트 필수 지표 5개

| 지표 | 설명 |
|---|---|
| 월 순현금흐름 | 월 수입에서 월 지출을 뺀 값 |
| 예상 자산 고갈 나이 | 자산 잔액이 0 이하가 되는 예상 나이 |
| 은퇴 후 월 고정지출 합계 | 생활비, 주거비, 의료비, 보험료, 세금성 지출, 예상 건강보험료 등 |
| 예상 건강보험료 | 피부양자 유지 여부와 지역가입자 전환 리스크를 반영한 참고용 추정값 |
| 조정 후 개선 효과 | 생활비 절감, 은퇴 시점 연기, 연금 인출액 조정 등의 효과 |

## 4. Users And Jobs

주요 사용자는 40~60대 은퇴 예정자, 은퇴 후 월 수입과 지출을 알고 싶은 사람, 건강보험료와 세금성 지출을 함께 점검하고 싶은 사람이다.

사용자가 해결하려는 핵심 Job은 다음과 같다.

1. 은퇴 후 매달 얼마가 남거나 부족한지 알고 싶다.
2. 현재 자산이 몇 세까지 버틸 수 있는지 알고 싶다.
3. 건강보험료와 세금성 지출을 놓치지 않았는지 확인하고 싶다.
4. 연금 인출액과 생활비를 조정하면 결과가 어떻게 달라지는지 보고 싶다.
5. 상담 전 내 상황을 요약 리포트와 상세 PDF로 정리하고 싶다.

## 5. F-01 입력 구조

F-01은 처음부터 모든 상세값을 요구하지 않는다. MVP에서는 요약 입력 중심으로 받고, 상세 입력은 접히는 확장 섹션으로 둔다.

| 입력 그룹 | 핵심 입력 | 주요 사용처 |
|---|---|---|
| 기본 정보 | 나이/출생연도, 은퇴 예정 시점, 배우자 여부, 주택 보유 여부 | F-10, F-11, 건강보험 리스크 |
| 은퇴 목표 | 월 생활비, 시뮬레이션 기간, 목표 생활 수준 | F-09, F-10, 조정 시나리오 |
| 월 수입 | 국민연금, 퇴직연금, 연금저축, IRP, 임대소득, 근로소득, 금융소득, 기타소득 | F-02, F-09 |
| 자산과 부채 | 현금성 자산, 금융자산, 부동산, 연금계좌, 대출 잔액/상환액 | F-02, F-09, F-10 |
| 지출 | 생활비, 주거비, 의료비, 보험료, 세금성 지출, 기타 고정지출 | F-09, F-11 |
| 건강보험/시나리오 | 피부양자 유지 여부, 4% 룰, 3대연금 상한모드, 물가/수익률/의료비 증가율 | F-02, F-09, F-10, F-11 |

### 최소 필수 입력

- 현재 나이 또는 출생연도
- 은퇴 예정 시점
- 은퇴 후 월 생활비
- 국민연금 월 예상액 또는 모름 선택
- 총 금융자산
- 월 고정지출
- 피부양자 조건 유지 여부

## 6. 공통 데이터 모델 방향

공통 모델은 입력값, 계산 가정, 계산 결과, 리포트 요약을 분리한다. F-01 입력 항목의 세부 저장 위치는 이후 확장 가능한 구조로 확정한다.

- `UserProfile`: 나이, 출생연도, 은퇴 예정 시점, 배우자 여부, 주택 보유 여부
- `RetirementGoal`: 목표 생활비, 시뮬레이션 기간, 목표 생활 수준
- `Income`: 국민연금, 퇴직연금, 개인연금, 임대소득, 근로소득, 금융소득, 기타소득
- `Expense`: 생활비, 주거비, 의료비, 보험료, 세금성 지출, 기타 고정지출
- `Asset`: 현금성 자산, 금융자산, 부동산, 퇴직연금/IRP/연금저축 자산, 기타 자산
- `Liability`: 대출 잔액, 월 상환액, 상환 종료 시점
- `ScenarioAssumption`: 시뮬레이션 가정
- `MonthlyCashflowResult`: 월별 계산 결과
- `ReportSummary`: 리포트 핵심 지표 5개와 주요 경고

### ScenarioAssumption 추가 항목

```ts
export type ScenarioAssumption = {
  inflationRate: number;
  annualReturnRate: number;
  livingExpenseGrowthRate: number;
  medicalExpenseGrowthRate: number;
  simulationStartYear: number;
  simulationStartMonth: number;
  simulationYears: number;

  useFourPercentWithdrawalRule: boolean;
  annualWithdrawalLimitRate?: number; // default: 0.04

  maintainHealthInsuranceDependentStatus: boolean;
  dependentStatusLossYear?: number;
  dependentStatusLossMonth?: number;

  usePensionAnnualCapMode: boolean;
  pensionAnnualCapAmount?: number;
};
```

## 7. F-02 건강보험료 예상 시뮬레이션

F-02는 정확 보험료 계산이 아니라 건강보험료 리스크를 드러내는 참고용 추정이다.

피부양자 조건 유지 여부가 `Y`인 경우에도 건강보험료를 단순히 0원으로 두지 않는다. 연금소득, 금융소득, 부동산 재산 등을 감안해 피부양자 유지 가능성과 지역가입자 전환 시 예상 보험료를 참고용으로 함께 보여준다.

### 2026 기준 기본 가정값

| 항목 | 값 | 단위 | 비고 |
|---|---:|---|---|
| 연금소득 반영률 | 50.0% | 비율 | 지역가입자 소득월액 산정의 근로·연금소득 50% 반영 기준 |
| 재산 기본공제 | 100,000,000 | 원 | 2024.2부터 지역가입자 재산 기본공제 1억원 적용 |
| 지역 점수당 금액 | 211.5 | 원/점 | 2026 NHIS 기준 |
| 건강보험료율 | 7.2% | 비율 | 화면 표시용 참고값. 내부 계산 기준은 7.19% 권장 |
| 장기요양보험료율 | 13.1% | 비율 | 건강보험료에 추가 가산 |
| 재산 점수환산계수 | 0.000004847 | 점/원 | 공개 예시 기반 간이계수 |

### 판단 규칙

- 피부양자 유지 `Y`:
  - 리포트에는 피부양자 유지 가정으로 표시한다.
  - 동시에 연금·금융소득·부동산 재산 기준으로 유지 리스크를 점검한다.
  - 리스크가 있으면 피부양자 조건 재확인 필요와 연금 인출 금액 조절 필요 경고를 표시한다.
- 피부양자 유지 `N` 또는 상실 예상:
  - 지역가입자 전환 가능성을 반영한다.
  - 연금소득은 기본 50% 반영한다.
  - 재산은 1억원 기본공제 후 간이 점수환산계수를 적용한다.
  - 지역 점수당 금액 211.5원/점을 적용한다.
  - 장기요양보험료 약 13.1%를 추가한다.

### HealthInsuranceAssumption

```ts
export type HealthInsuranceAssumption = {
  pensionIncomeReflectionRate: number; // default: 0.5
  propertyBasicDeduction: number; // default: 100_000_000
  regionalPointValue: number; // default: 211.5
  employeeHealthInsuranceRate: number; // internal: 0.0719
  displayHealthInsuranceRate: number; // display: 0.072
  longTermCareRateToHealthPremium: number; // default: 0.131
  simplifiedPropertyPointConversionRate: number; // default: 0.000004847
};
```

### HealthInsuranceEstimate

```ts
export type HealthInsuranceStatus =
  | "dependent"
  | "regional"
  | "employee"
  | "unknown";

export type HealthInsuranceEstimate = {
  status: HealthInsuranceStatus;

  monthlyPremium: number;
  includesLongTermCarePremium: boolean;

  isUserProvidedPremium: boolean;
  isEstimate: boolean;

  dependentStatusMaintained?: boolean;
  dependentStatusLossYear?: number;
  dependentStatusLossMonth?: number;

  regionalConversionRisk: "low" | "medium" | "high" | "unknown";

  appliedFromYear: number;
  appliedFromMonth: number;

  assumptions: string[];
  warnings: string[];
  disclaimer: string;
};
```

## 8. F-09 월별 현금흐름 계산 규칙

기본 계산 단위는 월, 내부 금액 단위는 원, 화면 표시 단위는 만원이다.

```ts
monthlyIncome =
  nationalPensionIncome
  + retirementPensionIncome
  + privatePensionIncome
  + workIncome
  + rentalIncome
  + otherIncome;

monthlyExpense =
  livingExpense
  + housingExpense
  + medicalExpense
  + insuranceExpense
  + taxLikeExpense
  + estimatedHealthInsurancePremium
  + loanRepayment
  + otherExpense;

monthlyNetCashflow = monthlyIncome - monthlyExpense;

endingAssetBalance =
  beginningAssetBalance
  + monthlyNetCashflow
  + monthlyInvestmentReturn;
```

### 주요 규칙

- 국민연금은 수령 시작 월 이전에는 0으로 계산한다.
- 퇴직연금, 연금저축, IRP는 사용자가 입력한 월 지급액 또는 인출 규칙을 따른다.
- 3대연금 상한모드가 `Y`이면 퇴직연금, 연금저축, IRP의 연간 지급액이 목표 상한을 넘지 않도록 조정한다.
- 순현금흐름이 음수이면 부족분만큼 금융자산에서 인출한 것으로 계산한다.
- 4% 인출 룰 적용 시 연간 인출액이 인출 가능 자산의 4%를 초과하면 경고를 표시한다.

## 9. F-10 자산 고갈 시점 예측 규칙

F-10은 F-09 월별 현금흐름 결과를 바탕으로 사용자의 은퇴 자산이 언제 위험해지는지 예측한다.

| 항목 | 정의 |
|---|---|
| 자산 고갈 시점 | 월별 `endingAssetBalance`가 처음으로 0 이하가 되는 월 |
| 위험 진입 시점 | 자산 잔액이 초기 은퇴자산의 20% 이하로 내려가는 월 |
| 고갈 없음 | 시뮬레이션 종료 시점까지 자산 잔액이 0보다 큰 상태 |

### 상태 분류

```ts
type AssetDepletionStatus =
  | "stable"
  | "watch"
  | "risk"
  | "depleted"
  | "unknown";
```

### MVP 시나리오

1. 기본 시나리오
2. 생활비 증가 시나리오
3. 수익률 하락 시나리오
4. 의료비 증가 시나리오

## 10. F-11 모바일 요약 및 PDF 상세 리포트

### 모바일 요약

모바일 화면에서는 전체 상세 리포트를 길게 보여주지 않는다. 핵심 판단만 요약해서 보여준다.

- 상단 요약 판단
- 핵심 지표 5개
- 주요 경고
- 추천 조정안 1~3개
- PDF 저장 버튼

### PDF 상세 리포트

PDF는 상세 검토와 상담자료 용도로 사용한다.

- 표지
- 1페이지 요약
- 입력 가정
- 월별 현금흐름
- 자산 고갈 예측
- 건강보험료 추정
- 연금 인출 전략
- 조정 시나리오
- 다음 행동 체크리스트
- 고지문

## 11. 저장/불러오기 UX 및 데이터 보안 정책

MVP 저장 기능은 서버 계정 저장이 아니라 브라우저 `localStorage` 기반 저장이다.

### 저장 방식

- 저장 위치: 브라우저 `localStorage`
- 저장/불러오기 시 이메일과 비밀번호 입력 필요
- 같은 기기와 같은 브라우저에서만 복원 가능
- 브라우저 데이터 삭제 또는 비밀번호 분실 시 복구 불가
- 저장 데이터 삭제 기능 제공
- PDF 저장 전 민감정보 포함 안내 제공

### UX 문구

저장 전:

> 입력 내용은 이 기기의 브라우저에 저장됩니다. 서버 계정 저장이 아니므로 다른 기기에서는 불러올 수 없습니다.

비밀번호 입력 전:

> 비밀번호는 이 브라우저에 저장된 리포트를 다시 열기 위한 용도입니다. 비밀번호를 잊으면 저장된 내용을 복구할 수 없습니다.

PDF 저장 시:

> PDF 파일에는 입력한 재무 정보와 건강보험료 추정 내용이 포함됩니다. 공유 전 내용을 확인해 주세요.

## 12. 릴리즈 우선순위

| 우선순위 | 항목 |
|---|---|
| Must | F-01, F-02, F-09, F-10, F-11 모바일 요약, PDF 상세 리포트, 로컬 저장/불러오기 |
| Should | 입력 완료도, 리포트 신뢰도, PDF 미리보기, 건강보험 가정값 수정, 조정 시나리오 비교 |
| Later | 금융기관 연동, 정확 세액 계산, 실시간 건보료 산식 연동, ETF 추천, 전문가 자동 매칭, 서버 계정 저장 |

### 권장 출시 순서

1. F-01 입력 구조
2. F-09 현금흐름 계산
3. F-10 자산 고갈 예측
4. F-02 건강보험료 추정
5. F-11 모바일 요약 리포트
6. PDF 상세 리포트
7. 로컬 저장/불러오기
8. 고지문·QA·모바일 검수

## 13. 역할별 검토 및 반영

| 역할 | 주요 의견 | 반영 내용 |
|---|---|---|
| PM | MVP는 은퇴 현금흐름 판단에 집중해야 한다 | F-01, F-02, F-09, F-10, F-11 중심으로 범위 확정 |
| Research | 사용자는 자산이 언제 부족해지는지 먼저 알고 싶다 | F-10 자산 고갈 나이와 위험 진입 시점 추가 |
| UX | 모바일에서 긴 리포트는 읽기 어렵다 | 모바일은 요약, 상세는 PDF로 분리 |
| Engineer | 입력값과 계산값을 공통 모델로 분리해야 한다 | 공통 모델과 계산 결과 모델 정리 |
| Marketing | 세금·건보료 결과가 확정값처럼 보이면 위험하다 | 참고용 추정 및 고지문 강화 |

## 14. Open Questions

1. 건강보험료 간이 추정식이 사용자에게 과도한 정확성으로 보이지 않는가?
2. PDF 리포트가 상담자료로 충분한가, 아니면 너무 길어지는가?
3. F-01 최소 필수 입력값만으로도 리포트가 신뢰할 만한가?
4. 이메일/비밀번호 기반 로컬 저장이 사용자에게 혼란스럽지 않은가?
5. 3대연금 상한모드가 세금 최적화처럼 오해되지 않는가?

## 15. References

- NHIS Contribution Rate: https://www.nhis.or.kr/english/wbheaa02500m01.do
- Vibe Retirement repository: https://github.com/chojunyoung66/vibe-retirement
