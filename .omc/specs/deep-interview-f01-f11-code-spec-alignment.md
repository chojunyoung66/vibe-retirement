# Deep Interview Spec: F-01/02/09/10/11 Code-Spec Full Alignment

## Metadata
- Interview ID: di-2026-0703-001
- Rounds: 5
- Final Ambiguity Score: 13.6%
- Type: brownfield
- Generated: 2026-07-03
- Threshold: 0.20
- Threshold Source: default
- Initial Context Summarized: no
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.92 | 35% | 0.32 |
| Constraint Clarity | 0.85 | 25% | 0.21 |
| Success Criteria | 0.90 | 25% | 0.23 |
| Context Clarity | 0.70 | 15% | 0.11 |
| **Total Clarity** | | | **0.87** |
| **Ambiguity** | | | **13.6%** |

## Topology
| Component | Status | Description | Coverage / Deferral Note |
|-----------|--------|-------------|--------------------------|
| Spec Coverage | active | Docs/F-*.md 스펙 대비 src/ 구현 현황 파악 | F-01, F-02, F-09, F-10, F-11 대상 |
| Implementation Quality | active | 구현된 코드가 스펙과 완전히 일치하는지 검토 및 수정 | 버그·불일치 직접 수정 |
| F-03~F-08, F-12~F-14 구현 | deferred | 미구현 기능 신규 개발 | 이번 점검 범위 외 (사용자 확인) |

## Goal
현재 구현된 **F-01, F-02, F-09, F-10, F-11** 5개 기능의 소스 코드를 각 개별 스펙 문서(F-xx_*.md)와 **완전히 정렬**한다. 데이터 필드, 계산 로직, UI 표현이 모두 스펙과 일치해야 하며, 충돌 시 개별 F-xx 스펙이 08_product_spec_v1.md(MVP 정의)보다 우선한다.

## Constraints
- **범위**: F-01, F-02, F-09, F-10, F-11 소스 파일만 (미구현 기능 신규 구현 제외)
- **정렬 수준**: 완전 정렬 — 데이터 필드, 계산 공식, UI 레이블/포맷 모두 포함
- **스펙 우선순위**: F-xx 개별 스펙 > 08_product_spec_v1.md(MVP)
- **검증**: `tsc --noEmit` 에러 없음이 완료 기준
- **비파괴**: 기능 동작을 해치는 수정은 금지; 스펙에 없는 기능 추가 금지

## Non-Goals
- F-03(ISA 가이드), F-04(ISA 세금), F-05(연금 분석), F-06(개인연금), F-07(ETF), F-08(투자 성향) 구현
- F-12(전문가 상담), F-13(세금 정보), F-14(체크리스트) 구현
- 테스트 코드 작성
- UI 리디자인 또는 스타일 변경
- 신규 기능 추가 (스펙에 없는 것)

## Acceptance Criteria
- [ ] `tsc --noEmit` 실행 시 에러 0개
- [ ] F-01 (입력 폼): `Docs/F-01_personal_retirement_goals.md` 정의 모든 입력 필드가 `src/types/index.ts`에 존재하고, 각 InputForm step 컴포넌트에서 수집됨
- [ ] F-02 (건강보험): `Docs/F-02_health_insurance_simulation.md` 정의 계산 로직이 `src/engine/healthInsurance.ts`에 반영됨
- [ ] F-09 (현금흐름): `Docs/F-09_retirement_cash_flow_simulation.md` 정의 월별 현금흐름 계산식이 `src/engine/cashflow.ts`에 정확히 구현됨
- [ ] F-10 (자산고갈): `Docs/F-10_asset_depletion_prediction.md` 정의 고갈 예측 로직이 `src/engine/depletion.ts`에 반영됨
- [ ] F-11 (대시보드): `Docs/F-11_retirement_plan_dashboard.md` 정의 표시 항목/포맷이 `src/components/Report/SummaryReport.tsx` 및 하위 컴포넌트에 반영됨
- [ ] 스펙과 코드 불일치 항목이 문서화되고 수정 완료됨

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| 미구현 기능도 점검 대상일 것 | F-03~F-14 구현 여부 확인 | 구현된 5개만 (사용자 확인) |
| 스펙 일치 = 명백한 버그만 | 완전 정렬 vs 버그만 구분 | 완전 정렬 (데이터·로직·UI 모두) |
| MVP 스펙이 최종 기준 | F-xx vs 08번 충돌 가능성 제기 | F-xx 개별 스펙 우선 |
| 브라우저 확인 필요 | 검증 방법 질문 | tsc 에러 없으면 완료 |

## Technical Context
### 구현된 파일 매핑
| Feature | Spec 문서 | 소스 파일 |
|---------|----------|----------|
| F-01 | Docs/F-01_personal_retirement_goals.md | src/types/index.ts, src/components/InputForm/InputForm.tsx, src/components/InputForm/steps/{BasicInfo,RetirementGoalStep,IncomeInput,ExpenseInput,AssetInput,ScenarioInput}.tsx |
| F-02 | Docs/F-02_health_insurance_simulation.md | src/engine/healthInsurance.ts |
| F-09 | Docs/F-09_retirement_cash_flow_simulation.md | src/engine/cashflow.ts |
| F-10 | Docs/F-10_asset_depletion_prediction.md | src/engine/depletion.ts |
| F-11 | Docs/F-11_retirement_plan_dashboard.md | src/components/Report/{SummaryReport,CashflowTable,CashflowChart,MetricCard,StatusBanner,ScenarioCard}.tsx |

### 공통 데이터 모델
- `src/types/index.ts` (163줄): 모든 타입 정의 중앙화
- `Docs/02_common_data_model.md`: 공통 데이터 모델 스펙

## Ontology (Key Entities)
| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Feature | core domain | id (F-01~F-14), specDoc, status (implemented/deferred) | has FeatureSpec, has SourceFiles |
| FeatureSpec | core domain | fields[], calcLogic[], uiRequirements[] | belongs to Feature |
| SourceFile | core domain | path, lines, featureId | implements Feature |
| Inconsistency | core domain | dimension (field/logic/ui), description, severity | found in SourceFile vs FeatureSpec |
| UserInput | core domain | profile, goal, income, expense, asset, liability, scenario | input to cashflow engine |

## Ontology Convergence
| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 4 | 4 | - | - | N/A |
| 2 | 3 | 1 | 0 | 2 | 67% |
| 3 | 5 | 2 | 1 | 2 | 60% |
| 4 | 4 | 0 | 1 | 3 | 75% |
| 5 | 5 | 1 | 0 | 4 | 80% |

## Interview Transcript
<details>
<summary>Full Q&A (5 rounds + Round 0)</summary>

### Round 0 (Topology)
**Q:** 2개 컴포넌트 (Spec Coverage, Implementation Quality) 맞나요?
**A:** 맞습니다 (두 항목 모두)

### Round 1
**Q:** 점검 결과를 어떤 형태로 받고 싶으세요?
**A:** 코드 직접 수정
**Ambiguity:** 54.5%

### Round 2
**Q:** 미구현 F-03~F-14도 포함되나요?
**A:** 구현된 5개만 (버그/불일치 수정)
**Ambiguity:** 37.5%

### Round 3
**Q:** 어느 수준의 불일치를 수정할까요?
**A:** 코드-스펙 완전 정렬
**Ambiguity:** 28.5%

### Round 4
**Q:** F-xx 스펙과 MVP 스펙 충돌 시 어느 것 우선?
**A:** F-xx 개별 스펙 우선
**Ambiguity:** 21.75%

### Round 5
**Q:** 완료 판단 기준은?
**A:** tsc 에러없으면 OK
**Ambiguity:** 13.6% ✓

</details>
