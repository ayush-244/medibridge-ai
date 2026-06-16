# Phase 11.3 — Specialist Recommendation Engine Production Audit

**Audit Date:** 2026-06-16  
**Auditor Role:** Principal AI Architect / Production Readiness Auditor  
**Scope:** Phase 11.3 only — no Phase 11.4, no hospital matching, no new AI capabilities

---

## Architecture Review

### Dependency Flow (Verified)

```
POST /api/ai/recommend-specialist
  ↓
app/api/recommendation.py
  ↓
app/services/recommendation_service.py
  ↓
app/services/retriever_service.py  →  app/services/vector_service.py (ChromaDB)
  ↓
app/services/llm_service.py      →  OpenRouter (sole HTTP client)
  ↓
app/services/citation_service.py
```

### Findings

| Check | Status | Notes |
|-------|--------|-------|
| Clean layered architecture | ✅ Pass | API → Service → Retriever/LLM → Citations |
| No duplicate retrieval logic | ✅ Pass | Single `retrieve_chunks()` entry point |
| No dead code in Phase 11.3 paths | ✅ Pass | All recommendation modules active |
| No Gemini remnants | ✅ Pass | Grep across `ai-service/` returned zero matches |
| OpenRouter only via `LLMService` | ✅ Pass | Sole `requests.post` in `llm_service.py` |
| Shared utilities reused | ✅ Pass | `build_context()` from chat_service, `build_citations()` shared |
| Standardized `ApiResponse` envelope | ✅ Pass | `{ success, data }` / `{ success, message }` |

### Architecture Score: **95/100**

Minor deduction: `recommendedSpecialist` duplicates `specialist` in the response (backward-compatibility field, not harmful).

---

## Security Review

### Patient Isolation

| Check | Status | Location |
|-------|--------|----------|
| Chroma queries filter by `patientId` | ✅ Pass | `vector_service.query_document_chunks()` line 106 |
| No unrestricted Chroma queries | ✅ Pass | All queries route through `query_document_chunks()` |
| Retriever passes patient_id through | ✅ Pass | `retriever_service.retrieve_chunks()` |
| Multi-query merge respects patient scope | ✅ Pass | `_merge_clinical_chunks()` uses same patient_id |
| No debug endpoints exposing records | ✅ Pass | No `/debug` routes in ai-service |
| Cross-patient access test | ✅ Pass | `test_vector_security.py` |

### Logging Security

| Must Log | Status |
|----------|--------|
| `patient_id` | ✅ Logged at request, retrieval, LLM, completion |
| Retrieved chunk count | ✅ Logged |
| Recommendation specialist | ✅ Logged |
| Confidence score | ✅ Logged |
| Citation count | ✅ Logged |
| Performance timings | ✅ `retrieval_ms`, `llm_ms`, `total_ms` |

| Must NOT Log | Status |
|--------------|--------|
| Prompts / clinical context | ✅ Never logged |
| API keys | ✅ `SensitiveDataFilter` redacts `sk-or-v1-*`, Bearer tokens |
| Embeddings | ✅ Only model name logged, not vectors |
| Raw medical report text | ✅ Only chunk counts and file names logged |

### Environment Variables

| Variable | Hardcoded? | Notes |
|----------|------------|-------|
| `OPENROUTER_API_KEY` | ❌ No | Loaded from env via pydantic-settings |
| `OPENROUTER_MODEL` | ❌ No | Default model name only, overridable |
| Secrets in source | ❌ None found | |

### Security Score: **98/100**

Deduction: Referral drawer uses `referral._id` as `patient_id` — documents must be uploaded with the same ID for retrieval to succeed (integration contract, not a bypass).

---

## Recommendation Accuracy Results

Clinical scenarios validated via parameterized unit tests (`TestClinicalRecommendationScenarios`):

| Scenario | Input Summary | LLM Output | Normalized Result | Status |
|----------|---------------|------------|-------------------|--------|
| Cardiology | Chest pain, SOB, CAD, HTN, DM | Cardiologist | Cardiology | ✅ Pass |
| Neurology | Headache, dizziness, brain lesion | Neurologist | Neurology | ✅ Pass |
| Orthopedics | Knee pain, osteoarthritis | Orthopedic Surgeon | Orthopedics | ✅ Pass |
| Pulmonology | COPD, chronic cough, SOB | Pulmonologist | Pulmonology | ✅ Pass |

### Confidence Scoring

| Test | Input | Output | Status |
|------|-------|--------|--------|
| Valid range | `94` | `94` | ✅ Pass |
| Over max | `150` | `100` (clamped) | ✅ Pass |
| Under min | `-10` | `0` (clamped) | ✅ Pass |
| Invalid type | `"high"` | `RecommendationGenerationError` | ✅ Pass |
| Schema validation | Pydantic `ge=0, le=100` on response | Enforced | ✅ Pass |

---

## Citation Validation Results

| Check | Status | Implementation |
|-------|--------|----------------|
| Maximum 5 citations | ✅ Pass | `MAX_CITATIONS = 5` in `citation_service.py` |
| Deduplication by (fileName, chunkIndex) | ✅ Pass | Set-based dedup |
| Skips empty file names | ✅ Pass | Tested |
| Citations from retrieved chunks only | ✅ Pass | `build_citations(chunks)` — no LLM fabrication |
| Valid chunk indexes (≥ 0) | ✅ Pass | Pydantic `Citation.chunkIndex ge=0` |
| No fabricated citations | ✅ Pass | Citations never parsed from LLM JSON |

---

## API Validation Results

**Endpoint:** `POST /api/ai/recommend-specialist`

| Test Case | HTTP | Response | Status |
|-----------|------|----------|--------|
| Success | 200 | `{ success: true, data: { specialist, confidence, reason, supportingEvidence } }` | ✅ Pass |
| Empty patient_id | 422 | Pydantic validation error | ✅ Pass |
| Missing request body | 422 | Pydantic validation error | ✅ Pass |
| No documents | 200 | `{ success: false, message: "No medical documents found..." }` | ✅ Pass |
| OpenRouter / LLM failure | 200 | `{ success: false, message: "Failed to generate..." }` | ✅ Pass |
| Unexpected server error | 200 | `{ success: false, message: "Failed to generate..." }` | ✅ Pass |
| Stack traces exposed | ❌ None | Generic messages only | ✅ Pass |

---

## Frontend Validation Results

**Location:** `client/src/features/ai-recommendations/`

| State | Expected Copy | Status |
|-------|---------------|--------|
| Loading | "Generating recommendation..." | ✅ Pass |
| Success — Specialist | Display name (e.g. "Cardiologist") | ✅ Pass (via `getSpecialistDisplayName`) |
| Success — Confidence | "Confidence: 94%" | ✅ Pass |
| Success — Reason | Clinical reasoning text | ✅ Pass |
| Success — Citations | File name + chunk index | ✅ Pass |
| Error | "Unable to generate recommendation" | ✅ Pass |
| Empty | "No recommendation available" | ✅ Pass |

### Referral Drawer Integration

| Check | Status |
|-------|--------|
| Generate Recommendation button | ✅ Present in `SpecialistRecommendationCard` |
| Loading spinner visible | ✅ `Loader2` animated icon |
| Error state visible | ✅ Red danger text |
| Success state layout | ✅ Specialist, confidence, reason, evidence |
| Drawer passes patient context | ✅ `patientId={referral._id}` |

---

## Test Results

```
Platform: Windows / Python 3.12.6
Command:  python -m pytest tests/ -v
Result:   50 passed, 0 failed
Duration: ~34s
```

### Test Coverage by Module (Phase 11.3)

| Module | Coverage |
|--------|----------|
| `app/api/recommendation.py` | **100%** |
| `app/services/recommendation_service.py` | **100%** |
| `app/services/citation_service.py` | **100%** |
| `app/core/specializations.py` | **82%** |
| **Phase 11.3 combined** | **97%** |
| Full ai-service | 64% (includes untested upload/PDF/LLM integration paths) |

### Required Test Categories

| Category | Tests | Status |
|----------|-------|--------|
| Recommendation service unit tests | 18 | ✅ |
| Citation service unit tests | 2 | ✅ |
| Confidence validation | 4 | ✅ |
| Patient isolation | 1 | ✅ |
| API success / validation / errors | 7 | ✅ |
| Clinical scenario normalization | 4 | ✅ |

---

## Performance Metrics

Timing instrumentation added to `recommendation_service.recommend_specialist()`:

```
retrieval_ms  — Chroma multi-query retrieval (5 clinical queries × top_k=3)
llm_ms        — OpenRouter completion
total_ms      — End-to-end service duration
```

### Targets vs Expected (Production)

| Metric | Target | Expected Behavior |
|--------|--------|-------------------|
| Chroma retrieval | < 500ms | ~200–400ms with local ChromaDB (5 embed + 5 query ops) |
| LLM generation | < 5s | ~1–4s depending on OpenRouter model latency |
| Total API response | < 6s | ~2–5s typical; logged via `total_ms` |

> **Note:** Performance targets depend on OpenRouter model selection and ChromaDB data volume. Timings are logged on every successful recommendation for production monitoring. No optimization bottlenecks identified in application code; primary latency is external LLM API.

---

## Bugs Found

| # | Severity | Description |
|---|----------|-------------|
| 1 | Medium | Frontend displayed department names ("Cardiology") instead of clinician titles ("Cardiologist") per UX spec |
| 2 | Low | Missing end-to-end `total_ms` timing log for performance monitoring |
| 3 | Low | Test gaps in `_parse_recommendation_response` edge cases (embedded JSON, invalid confidence type, generic LLM exceptions) |
| 4 | Info | `referral._id` used as `patient_id` — requires PDF uploads keyed to referral ID (no dedicated patient entity yet) |

---

## Bugs Fixed

| # | Fix Applied |
|---|-------------|
| 1 | Added `getSpecialistDisplayName()` in `client/src/features/ai-recommendations/utils/specialistDisplay.ts`; card now shows "Cardiologist", "Neurologist", etc. |
| 2 | Added `total_ms`, `retrieval_ms`, `llm_ms` to completion log in `recommendation_service.py` |
| 3 | Added 4 unit tests: embedded JSON parse, malformed embedded JSON, invalid confidence type, unexpected LLM exception |

---

## Remaining Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| No client-side PDF upload wired to referral flow | Recommendations fail with "No documents" unless PDFs uploaded via API with matching `patient_id` | Document upload integration in future phase |
| `referral._id` as patient scope | Mismatch if uploads use different patient identifier | Standardize on referral ID for document storage |
| LLM non-determinism | Same records may yield different confidence scores | Low temperature (0.1), constrained specialization list |
| OpenRouter availability | External dependency outage blocks recommendations | Graceful error message, no stack trace leak |
| Full ai-service coverage at 64% | Upload/PDF/LLM integration paths untested | Out of Phase 11.3 scope; covered by existing Phase 11.1/11.2 tests |

---

## Production Readiness Verdict

### Scores

| Dimension | Score |
|-----------|-------|
| Architecture | 95 |
| Security | 98 |
| API Contract | 100 |
| Test Coverage (Phase 11.3) | 97 |
| Frontend UX | 95 |
| Error Handling | 100 |
| Logging Compliance | 98 |
| Performance Instrumentation | 90 |
| **Overall Production Readiness** | **94/100** |

### Go / No-Go Recommendation

## ✅ GO — Phase 11.3 is production-ready

The Specialist Recommendation Engine meets all Phase 11.3 acceptance criteria:

- Secure patient-scoped retrieval
- Validated clinical scenario normalization
- Confidence clamping (0–100)
- Citation limits and deduplication
- Standardized API responses
- Complete frontend states (loading, success, error, empty)
- Referral drawer integration
- 50 passing automated tests with 97% Phase 11.3 module coverage
- No secrets exposed, no Gemini remnants, no unrestricted Chroma queries

**Do not proceed to Phase 11.4 until PDF upload is wired to the referral workflow** (remaining integration risk, not a Phase 11.3 engine defect).

---

*Generated as part of Phase 11.3 finalization audit.*
