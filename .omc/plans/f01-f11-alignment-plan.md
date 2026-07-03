# F-01 / F-02 / F-09 / F-10 / F-11 Alignment Plan (RALPLAN-DR Short Mode)

**Status: CONSENSUS APPROVED — pending execution approval**
**Interview ID:** di-2026-0703-001
**Ambiguity:** 13.6% (PASSED)
**Root spec:** `.omc/specs/deep-interview-f01-f11-code-spec-alignment.md`
**Done gate:** `tsc --noEmit` → 0 errors
**Iteration:** 3 (revised after Critic REJECT — v2 had unspecified formulas, missing ADR, ambiguous boundary conditions)

---

## 1. Principles

1. **Spec priority.** F-xx specs beat MVP spec on any conflict.
2. **Non-destructive.** Preserve existing behavior; only add missing behavior gated behind existing flags.
3. **Invariant preservation.** `endingAssetBalance = beginningAssetBalance + assetDrawdown + monthlyReturn` always. `assetDrawdown` is the actual balance delta; `monthlyNetCashflow` always equals `income − expense`.
4. **Single-source derived metrics.** `goalAchievementRate` computed in `buildSummary` (`App.tsx`) only.
5. **Conditional UI = conditional data.** Optional inputs must feed typed `ScenarioAssumption` fields.

---

## 2. Decision Drivers (Top 3)

1. **DD1 — `tsc --noEmit` → 0 errors** is the sole automated gate.
2. **DD2 — 6 files max, no new files** to minimize regression surface.
3. **DD3 — Behavioral alignment, not just type-shape.** Every field in types must be read by engine logic.

---

## 3. Options

### Option A-revised (RECOMMENDED) — Minimal in-place patch

- **Pros:** 6 files, no new files, invariant preserved, formula fully specified.
- **Cons:** `cashflow.ts` loop grows ~20 LOC; `MonthlyCashflowResult` gains one optional field.

### Option B — Extract policy helpers (`withdrawalPolicy.ts`, `dependentStatusPolicy.ts`)

- **Pros:** Easier future unit tests.
- **Cons:** Adds new files against the no-new-files constraint; no test infrastructure (banned by Non-Goal). **Rejected.**

**Rationale for rejecting B:** The alignment task explicitly bans test code and new files. Option B's benefit (testability) requires infrastructure the spec forbids. Deferred to a future sprint (F-05 pension analysis work will benefit from helpers at that point).

---

## 4. Implementation Steps

### STEP 1 — `src/types/index.ts`: three type additions + one default seed

**(1a)** Add `assetDrawdown?: number` to `MonthlyCashflowResult` (lines 92–102):
```ts
assetDrawdown?: number;
// actual KRW drawn from asset pool this month.
// Equals monthlyNetCashflow unless 4% withdrawal cap is active (assetDrawdown > monthlyNetCashflow when capped).
```

**(1b)** Add to `ReportSummary` (lines 115–123):
```ts
goalAchievementRate?: number;    // 0..1.5; undefined when monthlyLivingExpense === 0
targetRetirementAsset?: number;  // monthlyLivingExpense × simulationYears × 12 (KRW)
```

**(1c)** Add to `DEFAULT_SCENARIO` (lines 152–163):
```ts
annualWithdrawalLimitRate: 0.04,
```
The type field at line 57 already exists; this is only a default-value seed.

**Spec anchor:** F-09 §2, F-11 §2, `types/index.ts:57, 92-102, 115-123, 152-163`

---

### STEP 2 — `src/engine/cashflow.ts`: 4% withdrawal cap with exact recurrence

**Location:** Monthly loop body.

**Exact change:**

```ts
// Before loop (line ~18):
const initialFinancialAsset = currentFinancialAsset;  // snapshot; cap anchors to starting pool

// Inside loop, after:  const monthlyNetCashflow = monthlyIncome - monthlyExpense;
let assetDrawdown: number;
if (scenario.useFourPercentWithdrawalRule && monthlyNetCashflow < 0) {
  const annualRate = scenario.annualWithdrawalLimitRate ?? 0.04;  // fallback for legacy data
  const monthlyWithdrawalCap = (initialFinancialAsset * annualRate) / 12;
  // Cap limits the KRW drawn from assets this month; the shortfall beyond cap is "unfunded"
  assetDrawdown = -Math.min(Math.abs(monthlyNetCashflow), monthlyWithdrawalCap);
} else {
  assetDrawdown = monthlyNetCashflow;  // positive (surplus) or negative (deficit), no cap
}

// Replace existing endingBalance computation:
const endingAssetBalance = Math.max(0, beginningAssetBalance + assetDrawdown + monthlyReturn);
//                                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//                                     Invariant: always uses assetDrawdown, never monthlyNetCashflow

// In MonthlyCashflowResult returned per month:
{
  monthlyNetCashflow,          // kept as-is: income − expense (true shortfall for table/chart)
  assetDrawdown,               // actual draw applied to balance
  endingAssetBalance,          // derived from assetDrawdown per the invariant above
  // ...all other fields unchanged
}
```

**Semantics:** `monthlyNetCashflow` stays `income − expense` for F-09 display. `endingAssetBalance` uses `assetDrawdown`. F-10 (`depletion.ts`) reads `endingAssetBalance` and remains correct.

**`annualWithdrawalLimitRate` undefined fallback:** `?? 0.04` in the cap computation above covers legacy-saved data that lacks the field.

**Spec anchor:** F-09 §2 "현금 흐름 분석"; `cashflow.ts:72-90`

---

### STEP 3 — `src/engine/healthInsurance.ts`: wire dependent-loss timing

**Location:** Before `if (scenario.maintainHealthInsuranceDependentStatus)` (~line 32). Parameters `year, month` already exist as function arguments (lines 15–16).

**Exact predicate:**
```ts
const lossActive =
  scenario.dependentStatusLossYear !== undefined &&
  (year > scenario.dependentStatusLossYear ||
   (year === scenario.dependentStatusLossYear &&
    month >= (scenario.dependentStatusLossMonth ?? 1)));
// Boundary: lossActive becomes true in the loss month itself (month >= lossM in lossY).
// When dependentStatusLossYear is undefined → lossActive = false (dependent status maintained indefinitely).

const effectiveDependent = scenario.maintainHealthInsuranceDependentStatus && !lossActive;
```

Replace `if (scenario.maintainHealthInsuranceDependentStatus)` with `if (effectiveDependent)`.

Add to warnings when `lossActive`:
```ts
if (lossActive) {
  warnings.unshift(
    `${scenario.dependentStatusLossYear}년 ${scenario.dependentStatusLossMonth ?? 1}월부터 ` +
    `피부양자 자격이 상실되어 지역가입자 보험료가 적용됩니다.`,
  );
}
```

**Note:** Fields `dependentStatusLossYear` and `dependentStatusLossMonth` already exist in the type at `types/index.ts:59–60`. This step only wires them into behavior.

**Spec anchor:** F-02 §2 "피부양자 자격 유지 조건 분석"; `healthInsurance.ts:15-16, 32`

---

### STEP 4 — `src/components/InputForm/steps/ScenarioInput.tsx`: conditional UI fields

**Visibility rules (explicit per field):**

| Field | Shows when | Reason |
|---|---|---|
| `dependentStatusLossYear` | `maintainHealthInsuranceDependentStatus === true` | Only relevant if user plans to maintain but expects loss later |
| `dependentStatusLossMonth` | Same as above (same condition block) | Paired with year |
| `usePensionAnnualCapMode` | Always visible | Pension cap is scenario-independent |
| `pensionAnnualCapAmount` | `usePensionAnnualCapMode === true` | Amount only needed when cap is on |
| `annualWithdrawalLimitRate` | `useFourPercentWithdrawalRule === true` | Rate only needed when rule is on |

**Implementation pattern** (reuse existing `update` helper from line 9; reuse only existing class names: `field-group`, `toggle-row`, `toggle-btn`, `unit`):

```tsx
{/* After the 피부양자 toggle group (~line 105): */}
{value.scenario.maintainHealthInsuranceDependentStatus && (
  <>
    <div className="field-group">
      <label>피부양자 자격 상실 예상 연도</label>
      <input
        type="number"
        min={value.scenario.simulationStartYear}
        value={value.scenario.dependentStatusLossYear ?? ''}
        onChange={e =>
          update('dependentStatusLossYear', e.target.value ? Number(e.target.value) : undefined)
        }
      />
    </div>
    <div className="field-group">
      <label>피부양자 자격 상실 예상 월</label>
      <input
        type="number" min={1} max={12}
        value={value.scenario.dependentStatusLossMonth ?? ''}
        onChange={e =>
          update('dependentStatusLossMonth', e.target.value ? Number(e.target.value) : undefined)
        }
      />
    </div>
  </>
)}

{/* After the 4% rule toggle group (~line 125): */}
{value.scenario.useFourPercentWithdrawalRule && (
  <div className="field-group">
    <label>연간 인출 한도율</label>
    <input
      type="number" step={0.1} min={0} max={20}
      value={((value.scenario.annualWithdrawalLimitRate ?? 0.04) * 100).toFixed(1)}
      onChange={e => update('annualWithdrawalLimitRate', Number(e.target.value) / 100)}
    />
    <span className="unit">%</span>
  </div>
)}

{/* Always visible — pension cap toggle + conditional amount: */}
<div className="field-group toggle-row">
  <span>연금 연간 한도 적용</span>
  <button
    type="button"
    className={`toggle-btn${value.scenario.usePensionAnnualCapMode ? ' active' : ''}`}
    onClick={() => update('usePensionAnnualCapMode', !value.scenario.usePensionAnnualCapMode)}
  >
    {value.scenario.usePensionAnnualCapMode ? '적용' : '미적용'}
  </button>
</div>
{value.scenario.usePensionAnnualCapMode && (
  <div className="field-group">
    <label>연금 연간 한도</label>
    <input
      type="number" min={0}
      value={
        value.scenario.pensionAnnualCapAmount !== undefined
          ? value.scenario.pensionAnnualCapAmount / 10000
          : ''
      }
      onChange={e => update('pensionAnnualCapAmount', Number(e.target.value) * 10000)}
    />
    <span className="unit">만원</span>
  </div>
)}
```

**Note:** `usePensionAnnualCapMode` and `pensionAnnualCapAmount` are wired to the form UI only. Engine wiring for these fields is **explicitly out of scope** for this alignment task (no corresponding cashflow.ts change needed per gap analysis). The fields appear in `ScenarioAssumption` type but F-09 engine use is a future sprint item.

**Spec anchor:** F-01 §2 scenario assumptions; gap GAP 4

---

### STEP 5 — `src/App.tsx`: compute `goalAchievementRate` and resolve 4% warning

**(5a) Goal achievement rate formula (complete):**

```ts
// In buildSummary, before the return statement:
const monthlyGoal = input.goal.monthlyLivingExpense;   // KRW/month from F-01 input
const simYears    = input.scenario.simulationYears;

// targetRetirementAsset: total KRW needed to fund goal expenses across simulation period.
// Formula: monthlyLivingExpense × simulationYears × 12 (constant-money, no inflation adjustment).
// This matches F-11 "설정한 은퇴 목표" — the user's stated monthly living expense is the goal.
const targetRetirementAsset = monthlyGoal * simYears * 12;

// goalAchievementRate: initialAsset / targetRetirementAsset, bounded 0..1.5.
// Numerator:   initialAsset  (the total retirement assets user has now, already computed above)
// Denominator: targetRetirementAsset  (total funding need across simulation)
// Interpretation: 1.0 = 100% funded; >1.0 = surplus; <1.0 = shortfall
const goalAchievementRate =
  targetRetirementAsset > 0
    ? Math.min(Math.max(initialAsset / targetRetirementAsset, 0), 1.5)
    : undefined;  // monthlyLivingExpense === 0 → no meaningful rate → hide the card
```

Add both to the returned `ReportSummary`:
```ts
goalAchievementRate,
targetRetirementAsset: targetRetirementAsset > 0 ? targetRetirementAsset : undefined,
```

**(5b) 4% withdrawal warning — resolution (exact lines):**

`App.tsx` has two distinct warning paths:
- **Lines 47–51**: General deficit warning ("`은퇴 첫 달부터 월 X만원 적자입니다`") — **do NOT modify**; fires for any deficit regardless of 4% rule.
- **Lines 57–69**: 4%-overrun warning (`if (annualWithdrawal > fourPctLimit)`) — **replace this block** with an unconditional informational note when the flag is on:

```ts
// Replace App.tsx:57-69 (the 4%-overrun conditional block) with:
if (input.scenario.useFourPercentWithdrawalRule) {
  warnings.push(
    `참고: 4% 인출 규칙이 활성화되어 월 인출액이 초기 자산의 ` +
    `연 ${((input.scenario.annualWithdrawalLimitRate ?? 0.04) * 100).toFixed(1)}%로 제한됩니다.`,
  );
}
// Do NOT touch App.tsx:47-51 (general deficit warning stays unchanged).
```

This preserves `warnings[]` as the only output channel (no new `ReportSummary` fields; AC10 safe).

**Spec anchor:** F-11 §2 "달성률 %"; F-09 §2 "4% 인출 규칙"

---

### STEP 6 — `src/components/Report/SummaryReport.tsx`: goal achievement MetricCard

**Placement:** First card in `metrics-grid` (before "월 순현금흐름").
**Condition:** Render only when `typeof summary.goalAchievementRate === 'number'` (not NaN, not undefined).
**Label:** `"은퇴 목표 달성률"`
**Value:** `` `${Math.round(summary.goalAchievementRate * 100)}%` ``
**Hint:** `` summary.targetRetirementAsset ? `목표 자산 ${fmt(summary.targetRetirementAsset)} 기준` : '목표 대비 준비도' ``
**Color:** `summary.goalAchievementRate >= 1 ? '#10B981' : summary.goalAchievementRate >= 0.7 ? '#F59E0B' : '#EF4444'`

```tsx
{typeof summary.goalAchievementRate === 'number' && (
  <MetricCard
    label="은퇴 목표 달성률"
    value={`${Math.round(summary.goalAchievementRate * 100)}%`}
    hint={summary.targetRetirementAsset ? `목표 자산 ${fmt(summary.targetRetirementAsset)} 기준` : '목표 대비 준비도'}
    color={
      summary.goalAchievementRate >= 1 ? '#10B981'
      : summary.goalAchievementRate >= 0.7 ? '#F59E0B'
      : '#EF4444'
    }
  />
)}
```

No changes to `MetricCard.tsx` — existing props cover this.

**Spec anchor:** F-11 §2 "은퇴 목표 달성률"

---

### STEP 7 — Verification

```bash
# AC1 — Primary gate
npx tsc --noEmit

# AC2 — 4% cap in cashflow engine
grep -n "useFourPercentWithdrawalRule\|assetDrawdown\|annualWithdrawalLimitRate" src/engine/cashflow.ts

# AC3 — Dependent loss timing wired
grep -n "dependentStatusLossYear\|lossActive\|effectiveDependent" src/engine/healthInsurance.ts

# AC4 — Types (assetDrawdown, goalAchievementRate, targetRetirementAsset, DEFAULT_SCENARIO default)
grep -n "assetDrawdown\|goalAchievementRate\|targetRetirementAsset\|annualWithdrawalLimitRate: 0.04" src/types/index.ts

# AC5 — buildSummary computation
grep -n "goalAchievementRate\|targetRetirementAsset" src/App.tsx

# AC6 — SummaryReport conditional MetricCard
grep -n "은퇴 목표 달성률\|goalAchievementRate" src/components/Report/SummaryReport.tsx

# AC7 — ScenarioInput conditional fields
grep -n "dependentStatusLossYear\|dependentStatusLossMonth\|usePensionAnnualCapMode\|pensionAnnualCapAmount\|annualWithdrawalLimitRate" \
  src/components/InputForm/steps/ScenarioInput.tsx

# AC8/9 — Scope: only 6 files, no new files
git diff --stat
git status --short

# AC10 — No new CSS class names
git diff -- '*.css' '*.module.css' | grep '^+\.' | wc -l  # expect: 0

# Smoke check — no runtime exceptions at startup
npx tsc --noEmit && echo "Types OK"
```

### Step sequencing
```
Step 1 (types) → unlocks → Steps 2, 3, 4, 5, 6 (all parallel) → Step 7 (verify)
```

---

## 5. Risks and Mitigations

| # | Risk | Mitigation |
|---|------|------------|
| R1 | 4% cap fires on surplus months | Guarded: `monthlyNetCashflow < 0` only. Positive months: `assetDrawdown = monthlyNetCashflow` (unchanged). |
| R2 | `dependentStatusLossYear = undefined` breaks `healthInsurance.ts` | `lossActive = false` when field is `undefined` (explicit guard: `!== undefined`). |
| R3 | `annualWithdrawalLimitRate = undefined` (legacy saved data) causes NaN cap | Guarded: `?? 0.04` fallback in Step 2 cap formula. |
| R4 | `monthlyLivingExpense = 0` → `targetRetirementAsset = 0` → rate undefined → card hidden | Handled: `targetRetirementAsset > 0` guard; returns `undefined`; Step 6 card hidden. |
| R5 | `SaveLoadDialog` persists `ScenarioAssumption`; new fields undefined in old saves | All new fields are `?:` optional; old saves load without error. `annualWithdrawalLimitRate` falls back to `?? 0.04` in engine. |
| R6 | `assetDrawdown` optional → consumers can't distinguish "no cap applied" from "not populated" | Semantics: `undefined` = not captured (e.g., pre-v2 scenarios); consumers use `endingAssetBalance` directly (unchanged). No consumer currently reads `assetDrawdown` except for display. |
| R7 | `pensionAnnualCapMode` UI exposed but not wired to engine | Explicitly out-of-scope; documented in Step 4 handoff note. Form toggle is safe to render (no engine side effects when unused). |
| R8 | Double-render of 4% note (once from App.tsx warnings, once potentially from SummaryReport) | Step 5b replaces the existing risk warning; there is no second source. |
| R9 | Under 4% cap, `endingAssetBalance` never drops below 0 (`Math.max(0,...)`) — `depletion.ts:22` may never fire for a severely under-funded scenario | Known semantic behavior: the cap intentionally limits drawdown, so asset balance can plateau above 0 while living expenses are unmet. This is surfaced via `monthlyNetCashflow < 0` in the cashflow table. Depletion detection still fires when balance reaches 0 without the cap. Add to ADR follow-ups. |

---

## 6. Acceptance Criteria

- [ ] **AC1** `tsc --noEmit` exits 0 with zero diagnostics
- [ ] **AC2 (F-09)** `cashflow.ts` declares `assetDrawdown`, uses `annualWithdrawalLimitRate ?? 0.04`, gates cap on `monthlyNetCashflow < 0`, computes `endingAssetBalance = max(0, begin + assetDrawdown + monthlyReturn)`, keeps `monthlyNetCashflow = income - expense` unchanged in result
- [ ] **AC3 (F-02)** `healthInsurance.ts` declares `lossActive` using `dependentStatusLossYear` boundary `(year > lossY) || (year === lossY && month >= lossM)`, and replaces the dependent branch guard with `effectiveDependent = maintainDependent && !lossActive`
- [ ] **AC4 (types)** `MonthlyCashflowResult` has `assetDrawdown?: number`; `ReportSummary` has `goalAchievementRate?: number` and `targetRetirementAsset?: number`; `DEFAULT_SCENARIO` has `annualWithdrawalLimitRate: 0.04`
- [ ] **AC5 (F-11 App)** `buildSummary` in `App.tsx` computes `targetRetirementAsset = monthlyLivingExpense × simulationYears × 12` and `goalAchievementRate = min(1.5, max(0, initialAsset / targetRetirementAsset))` when denominator > 0; both added to returned `ReportSummary`
- [ ] **AC6 (F-11 UI)** `SummaryReport.tsx` renders `MetricCard` with label `"은퇴 목표 달성률"` as first card in `metrics-grid`, conditional on `typeof summary.goalAchievementRate === 'number'`
- [ ] **AC7 (F-01 UI)** `ScenarioInput.tsx` renders `dependentStatusLossYear`/`dependentStatusLossMonth` when `maintainHealthInsuranceDependentStatus === true`; renders `annualWithdrawalLimitRate` when `useFourPercentWithdrawalRule === true`; renders `usePensionAnnualCapMode` toggle always; renders `pensionAnnualCapAmount` when `usePensionAnnualCapMode === true`
- [ ] **AC8** `git diff --stat` shows exactly 6 files: `types/index.ts`, `cashflow.ts`, `healthInsurance.ts`, `ScenarioInput.tsx`, `App.tsx`, `SummaryReport.tsx`
- [ ] **AC9** `git status --short` shows no untracked files under `src/`
- [ ] **AC10** `git diff -- '*.css' | grep '^+\.' | wc -l` → 0

---

## 7. ADR (Architecture Decision Record)

**Decision:** Option A-revised — Minimal in-place patch with explicit recurrences and full formula specification

**Drivers:**
- DD1: `tsc` zero errors as sole gate
- DD2: 6-file limit, no new files
- DD3: Behavioral alignment (fields must be read by engine, not just declared in types)

**Alternatives Considered:**
- **Option A (v1):** Broke `endingBalance = begin + net + return` invariant by silently forking balance math; used spec-misaligned goal formula (`monthlyGoal × months / initialAsset`). Rejected by Architect.
- **Option A (v2):** Used `Σ max(0, -monthlyNetCashflow)` as goal denominator — spec-misaligned (F-11 says "준비된 자산 기준", not "shortfall sum"); left formulas under-specified. Rejected by Critic.
- **Option B:** Extracts `withdrawalPolicy.ts` and `dependentStatusPolicy.ts` helpers. Rejected: adds new files against the no-new-files constraint; no test infrastructure available (Non-Goal). The helper extraction benefit (testability) only materializes when test infrastructure is added in a future sprint.

**Why Option A-revised is Chosen:**
- Same 6-file surface as Options A/v1/v2
- Preserves the `endingBalance` invariant by making `assetDrawdown` the single balance-delta source
- `goalAchievementRate = initialAsset / (monthlyLivingExpense × years × 12)` is the simplest formula that directly expresses F-11 §2 "현재 준비된 자산 대비 설정한 은퇴 목표" (assets vs. goal) without requiring inflation models or scenario-dependent cashflows
- All formulas and boundary conditions are now fully specified (zero executor ambiguity)

**Consequences:**
- `MonthlyCashflowResult` grows by one optional field (`assetDrawdown`). Existing consumers (CashflowTable, CashflowChart, depletion.ts) use `endingAssetBalance` unchanged.
- `cashflow.ts` monthly loop grows ~20 LOC.
- `pensionAnnualCapMode` UI renders but engine wiring is deferred — documented in handoff notes.

**Follow-ups:**
- F-05 pension analysis: when implemented, revisit extracting `withdrawalPolicy.ts` helper
- Consider wiring `usePensionAnnualCapMode` into `cashflow.ts` when F-05 is scoped
- Add unit tests for `cashflow.ts` and `healthInsurance.ts` in a future test sprint
- R9: Under 4% cap, depletion detection may never fire for severely under-funded scenarios — revisit if F-10 spec requires separate "underfunded expense" signal
- `goalAchievementRate` uses constant-money formula; consider inflation-adjusted variant in a future F-11 enhancement

---

## 8. Handoff Notes

- **Do NOT touch `depletion.ts`** — no F-10 gaps; file meets spec.
- **Do NOT wire `pensionAnnualCapMode` into `cashflow.ts`** — UI-only for now; explicitly out of scope.
- **Do NOT add comments referencing F-03~F-14** — Non-Goal.
- **`goalAchievementRate` formula is final**: `min(1.5, initialAsset / (monthlyLivingExpense × simYears × 12))`. Do not substitute.
- **`lossActive` predicate boundary is final**: `year > lossY || (year === lossY && month >= lossM)`.
- **`App.tsx:47-51` (general deficit warning) must NOT be modified** — only `App.tsx:57-69` (4%-overrun block) is replaced per Step 5b.
- **`App.tsx:18-25` calls `estimateHealthInsurance` at simulation start year/month** to compute `summary.estimatedHealthInsurancePremium`. With dependent-loss timing added (Step 3), the summary card will still show month-1 state (premium = 0 if still dependent at start). This is accepted "month-1 snapshot" semantics — the per-month cashflow loop will correctly show the transition. Do NOT change the `App.tsx:18-25` call site.
- **R9 follow-up**: Depletion under 4% cap — balances may plateau >0 while expenses unmet; surfaced in cashflow table. Expected behavior, not a bug.
- In scope ONLY: `src/types/index.ts`, `src/engine/cashflow.ts`, `src/engine/healthInsurance.ts`, `src/components/InputForm/steps/ScenarioInput.tsx`, `src/App.tsx`, `src/components/Report/SummaryReport.tsx`

---

*Changelog:*
- *v1: Initial Planner draft*
- *v2: Architect revision — preserved cashflow invariant via `assetDrawdown`; income-adjusted goal rate; resolved double-warning*
- *v3: Critic revision — fully specified formulas (numerator/denominator/zero-handling), exact recurrence equation, `lossActive` boundary predicate, per-field UI visibility rules, MetricCard placement/label/color/condition, 4% warning resolution, ADR block, expanded verification*
